"""PMDARWIN haftalık uzun video (16:9) üreticisi.
Kullanım: python3 scripts/render_long.py bolum.json cikti.mp4
Her bölüm ayrı üretilip birleştirilir (hız için: SEGMENT=i ile bölümleri paralel üret, sonra CONCAT_ONLY=1 ile birleştir); YouTube bölüm zaman damgaları <cikti>.chapters.txt dosyasına yazılır."""
import json, sys, os, subprocess, math, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import render as R  # dikey şablondaki ses, müzik ve motifler

W, H, FPS = 1920, 1080, 24
SR = R.SR

def fonts():
    return dict(num=ImageFont.truetype(R.FB, 260), title=ImageFont.truetype(R.FB, 92), cap=ImageFont.truetype(R.FB, 80),
                lab=ImageFont.truetype(R.FX, 34), brand=ImageFont.truetype(R.FM, 30))

def render_segment(seg, out, idx, total_chapters, show_title):
    F = fonts()
    acc = R.hexrgb(seg.get("accent", "#ff3b3b")); tint = R.hexrgb(seg.get("tint", "#0a0f1c"))
    # ses: cümle cümle, aralarında kısa duraklama
    pieces, caps, t = [], [], 0.0
    lead = 0.3; pieces.append(np.zeros(int(lead * SR), np.float32)); t = lead
    for s in seg["say"]:
        a = R.tts().generate(s, sid=0, speed=seg.get("speed", 1.08)); v = np.array(a.samples, np.float32); d = len(v) / SR
        cs = R.chunks(re.sub(r"\s+", " ", s).strip(), 4); tot = sum(len(c) for c in cs); ct = t
        for c in cs:
            cd = d * len(c) / tot; caps.append((ct, ct + cd, c)); ct += cd
        pieces += [v, np.zeros(int(0.32 * SR), np.float32)]; t += d + 0.32
    total = t + 0.6
    voice = np.concatenate(pieces + [np.zeros(int(0.6 * SR), np.float32)])
    dr = R.drone(len(voice) / SR + 0.01, seg.get("drone", 48.0))[:len(voice)]
    mix = voice + np.pad(dr, (0, len(voice) - len(dr))) * 0.8
    mix /= max(1, np.abs(mix).max() / 0.95)
    wav = out.replace(".mp4", ".wav"); sf.write(wav, mix, SR)

    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vign = (1 - 0.7 * np.clip(((xx - W / 2) / (W * .7)) ** 2 + ((yy - H / 2) / (H * .75)) ** 2, 0, 1))[..., None]
    sh, sw = H // 8, W // 8; syy, sxx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    grain = np.random.default_rng(3).normal(0, 5, (H // 2, W // 2, 1)).astype(np.float32)
    grain = np.repeat(np.repeat(grain, 2, 0), 2, 1)
    mk = seg.get("motif"); mst = R.make_motif(mk) if mk else None
    label = R.up(seg.get("label", ""))
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-i", wav, "-c:v", "libx264", "-preset", "veryfast", "-crf", "21", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                          "-ar", "44100", "-shortest", out], stdin=subprocess.PIPE)
    title_dur = 3.0 if show_title else 0
    for f in range(int(total * FPS)):
        tt = f / FPS
        cx = sw * (0.5 + 0.3 * math.sin(tt * 0.3)); cy = sh * (0.45 + 0.15 * math.cos(tt * 0.23))
        blob = np.exp(-(((sxx - cx) / (sw * .35)) ** 2 + ((syy - cy) / (sh * .45)) ** 2))
        small = tint[None, None, :] * 0.85 + acc[None, None, :] * (blob[..., None] * 0.5)
        img = np.asarray(Image.fromarray(np.clip(small, 0, 255).astype(np.uint8)).resize((W, H), Image.BILINEAR), np.float32)
        im = Image.fromarray(np.clip(img * vign + grain, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
        if mk and tt >= title_dur:
            layer = Image.new("RGBA", (R.W, R.H), (0, 0, 0, 0)); R.draw_motif(ImageDraw.Draw(layer), mk, mst, tt, acc)
            crop = layer.crop((0, 1030, R.W, 1730)).resize((900, 583))
            alpha = crop.getchannel("A").point(lambda v: int(v * 0.55)); crop.putalpha(alpha)
            im.paste(crop, ((W - 900) // 2, 250), crop)
        d.text((60, 52), "PMDARWIN  •  KARANLIK BİLİM DOSYASI", font=F["brand"], fill=(200, 200, 200))
        if label and tt >= title_dur:
            lw = d.textlength(label, font=F["lab"])
            d.rectangle((W - 60 - lw - 36, 40, W - 60, 96), fill=tuple(int(c) for c in acc))
            d.text((W - 60 - lw - 18, 68), label, font=F["lab"], fill=(255, 255, 255), anchor="lm")
        if tt < title_dur:
            k = min(1, tt / 0.35)
            if seg.get("number"):
                d.text((W / 2, 380 - (1 - k) * 40), seg["number"], font=F["num"], fill=tuple(int(c) for c in acc), anchor="mm")
            for j, ln in enumerate(R.wrap(d, R.up(seg["title"]), F["title"], W - 300)):
                d.text((W / 2, 600 + j * 106), ln, font=F["title"], fill=(255, 255, 255), anchor="mm", stroke_width=6, stroke_fill=(0, 0, 0))
        else:
            cap = next((c for c in caps if c[0] <= tt < c[1]), caps[-1] if tt >= caps[-1][0] else None)
            if cap:
                lines = R.wrap(d, R.up(cap[2]), F["cap"], W - 360)
                y0 = 860 - 46 * (len(lines) - 1)
                for j, ln in enumerate(lines):
                    d.text((W / 2, y0 + j * 92), ln, font=F["cap"], fill=(255, 255, 255), anchor="mm", stroke_width=8, stroke_fill=(0, 0, 0))
        d.rectangle((0, H - 6, W * (idx + tt / total) / total_chapters, H), fill=tuple(int(c) for c in acc))
        p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait(); os.remove(wav)
    return total

def build(spec_path, out):
    S = json.load(open(spec_path))
    segs = S["segments"]; work = out.replace(".mp4", "_parca"); os.makedirs(work, exist_ok=True)
    only = os.environ.get("SEGMENT")
    durs = {}
    for i, seg in enumerate(segs):
        if only is not None and str(i) != only: continue
        if os.environ.get("CONCAT_ONLY") and os.path.exists(f"{work}/{i:02d}.mp4"): continue
        durs[i] = render_segment(seg, f"{work}/{i:02d}.mp4", i, len(segs), seg.get("kind") != "intro")
    if only is not None:
        print(durs); return
    lst = f"{work}/liste.txt"
    open(lst, "w").write("".join(f"file '{os.path.abspath(work)}/{i:02d}.mp4'\n" for i in range(len(segs))))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", "-movflags", "+faststart", out], check=True)
    # bölüm zaman damgaları
    t = 0.0; lines = []
    for i, seg in enumerate(segs):
        d = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"{work}/{i:02d}.mp4"]).decode())
        lines.append(f"{int(t // 60)}:{int(t % 60):02d} {seg.get('chapter_name', seg['title'])}"); t += d
    open(out.replace(".mp4", ".chapters.txt"), "w").write("\n".join(lines) + "\n")
    print("\n".join(lines)); print("toplam", round(t, 1))

if __name__ == "__main__":
    build(sys.argv[1], sys.argv[2])
