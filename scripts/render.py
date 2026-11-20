"""PMDARWIN Shorts renderer (v2): dark cinematic style, hook on frame 0, dfki Turkish voice, no emoji.
Usage: python3 scripts/render.py video.json out.mp4"""
import json, sys, os, subprocess, math, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import sherpa_onnx, soundfile as sf
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fx as FXM
import art as ARTM

W, H, FPS = 1080, 1920, 30
FB = os.path.join(ROOT, "assets/fonts/Montserrat_900Black.ttf")
FX = os.path.join(ROOT, "assets/fonts/Montserrat_800ExtraBold.ttf")
FM = os.path.join(ROOT, "assets/fonts/Montserrat_600SemiBold.ttf")
SR = 22050
VNAME = "dfki"
VOICE = os.path.join(ROOT, f".cache/vits-piper-tr_TR-{VNAME}-medium")

_tts = None
def tts():
    global _tts
    if _tts is None:
        cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
            vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{VOICE}/tr_TR-{VNAME}-medium.onnx", tokens=f"{VOICE}/tokens.txt",
                                                       data_dir=f"{VOICE}/espeak-ng-data"), num_threads=4))
        _tts = sherpa_onnx.OfflineTts(cfg)
    return _tts

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], np.float32)
def up(s): return s.replace('i', 'İ').replace('ı', 'I').upper()

def wrap(d, text, font, maxw):
    out, cur = [], ""
    for w in text.split():
        t = (cur + " " + w).strip()
        if d.textlength(t, font=font) <= maxw: cur = t
        else:
            if cur: out.append(cur)
            cur = w
    if cur: out.append(cur)
    return out

def chunks(s, n=3):
    w = s.split(); out = [" ".join(w[i:i+n]) for i in range(0, len(w), n)]
    if len(out) > 1 and len(out[-1].split()) == 1: last = out.pop(); out[-1] += " " + last
    return out

def drone(dur, base):
    t = np.arange(int(dur * SR)) / SR
    x = np.zeros_like(t)
    for f, a in [(base, .5), (base * 1.5, .22), (base * 2.01, .15), (base / 2, .45)]:
        x += a * np.sin(2 * np.pi * f * t + 3 * np.sin(2 * np.pi * 0.07 * t))
    x *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t) ** 2
    pulse = np.exp(-((t % 1.6) / 0.08)) * np.sin(2 * np.pi * 55 * t)   # low heartbeat thump
    x = x / np.abs(x).max() * 0.07 + pulse * 0.06
    fade = np.minimum(1, t / 0.3) * np.minimum(1, (dur - t) / 0.8)
    return (x * fade).astype(np.float32)


def whoosh(dur=0.35, seed=1):
    n = int(dur * SR); rng = np.random.default_rng(seed)
    x = rng.normal(0, 1, n).astype(np.float32)
    t = np.arange(n) / SR; env = np.sin(np.pi * t / dur) ** 2
    # crude band sweep: mix of smoothed noise with rising cutoff
    k = np.cumsum(x); hp = x - np.convolve(x, np.ones(24) / 24, "same")
    lp = np.convolve(x, np.ones(6) / 6, "same")
    sweep = (1 - t / dur) * lp + (t / dur) * hp
    return (sweep * env * 0.09).astype(np.float32)

def impact(dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    f = 70 * np.exp(-t * 3) + 38
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6) * 0.35
    x += np.random.default_rng(2).normal(0, 1, n) * np.exp(-t * 40) * 0.08
    return x.astype(np.float32)

def make_motif(kind, seed=3):
    rng = np.random.default_rng(seed)
    st = {}
    if kind == "network":
        segs = []
        def grow(x, y, ang, ln, t0, depth):
            if depth > 7 or ln < 18: return
            x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
            segs.append((x, y, x2, y2, t0, depth)); t1 = t0 + 0.35
            for da in (-0.5, 0.45):
                if rng.random() < 0.85: grow(x2, y2, ang + da + rng.normal(0, .15), ln * 0.78, t1, depth + 1)
        for a in np.linspace(0, 2 * math.pi, 7, endpoint=False): grow(540, 1380, a, 110, 0.0, 0)
        st["segs"] = segs
    if kind == "stars":
        st["s"] = rng.uniform(-1, 1, (260, 2)) * [W, H]; st["z"] = rng.uniform(0.05, 1, 260)
    return st

def draw_motif(d, kind, st, tt, acc):
    a = tuple(int(c) for c in acc); dim = tuple(int(c * .55) for c in acc)
    if kind == "network":
        for x, y, x2, y2, t0, dep in st["segs"]:
            k = (tt * 1.2 - t0)
            if k <= 0: continue
            k = min(1, k); d.line((x, y, x + (x2 - x) * k, y + (y2 - y) * k), fill=dim if dep > 2 else a, width=max(2, 7 - dep))
        d.ellipse((520, 1360, 560, 1400), fill=a)
    elif kind == "pulse":
        pts = []
        for x in range(0, W + 1, 6):
            ph = (x / W) * 6 - tt * 1.5
            y = 1400 + 18 * math.sin(ph * 5) + (140 * math.exp(-((ph % 2.5) - 1.2) ** 2 / 0.004) if (ph % 2.5) > 1 else 0) * math.sin(ph * 40)
            pts.append((x, y))
        d.line(pts, fill=a, width=4)
    elif kind == "vortex":
        cx, cy = 540, 1400
        for r in range(150, 330, 14):
            n = 90
            for i in range(n):
                th = 2 * math.pi * i / n + tt * (2.4 * 150 / r)
                x = cx + r * math.cos(th); y = cy + r * 0.32 * math.sin(th)
                col = a if (i + r // 14) % 3 == 0 else dim
                d.ellipse((x - 3, y - 3, x + 3, y + 3), fill=col)
        d.ellipse((cx - 125, cy - 125, cx + 125, cy + 125), fill=(0, 0, 0))
        d.ellipse((cx - 131, cy - 131, cx + 131, cy + 131), outline=a, width=4)
    elif kind == "tentacles":
        cx = 540; cy = 1250 + 35 * math.sin(tt * 1.3); squash = 1 + 0.08 * math.sin(tt * 2.6)
        d.chord((cx - 160 * squash, cy - 130 / squash, cx + 160 * squash, cy + 130 / squash), 180, 360, outline=a, width=5)
        for i in range(9):
            x0 = cx - 140 + i * 35; pts = []
            for j in range(40):
                y = cy + j * 9; pts.append((x0 + 18 * math.sin(tt * 2.2 + j * 0.25 + i), y))
            d.line(pts, fill=dim, width=3)
    elif kind == "stars":
        for (sx, sy), z in zip(st["s"], st["z"]):
            zz = (z - tt * 0.18) % 1 + 0.02
            x = W / 2 + sx / zz * 0.25; y = 1300 + sy / zz * 0.12
            if 0 <= x < W and 900 <= y < H - 280:
                r = max(1, 4 * (1 - zz)); d.ellipse((x - r, y - r, x + r, y + r), fill=(230, 230, 240))
        d.arc((340, 1120, 740, 1520), 200, 340, fill=a, width=6)

def build(path, out):
    S = json.load(open(path))
    acc = hexrgb(S.get("accent", "#ff3b3b")); tint = hexrgb(S.get("tint", "#0a1a24"))
    # --- audio: voice starts at 0
    segs, t, audio = [], 0.0, []
    for i, sc in enumerate(S["scenes"]):
        a = tts().generate(sc["say"], sid=0, speed=sc.get("speed", 1.08))
        v = np.array(a.samples, np.float32); d = len(v) / SR
        cs = chunks(re.sub(r"\s+", " ", sc["say"]).strip()); tot = sum(len(c) for c in cs); ct = t; caps = []
        for c in cs:
            cd = d * len(c) / tot; caps.append((ct, ct + cd, c)); ct += cd
        gap = S.get("gap", 0.18)
        segs.append(dict(start=t, end=t + d + gap, i=i, caps=caps, kicker=sc.get("kicker", ""), bg=sc.get("bg"), art=sc.get("art")))
        audio += [v, np.zeros(int(gap * SR), np.float32)]; t += d + gap
    total = t + 0.5
    voice = np.concatenate(audio + [np.zeros(int(0.5 * SR), np.float32)])
    dr = drone(len(voice) / SR + 0.01, S.get("drone", 55.0))[:len(voice)]
    mix = voice + np.pad(dr, (0, len(voice) - len(dr)))
    # v5: whoosh on every cut, low impact where the scene asks for it
    for sg in segs[1:]:
        k = int(sg["start"] * SR)
        for snd in [whoosh()] + ([impact()] if S["scenes"][sg["i"]].get("sfx") == "hit" else []):
            j = max(0, k - (int(0.12 * SR) if snd is not None and len(snd) == int(0.35 * SR) else 0))
            e = min(len(mix), j + len(snd)); mix[j:e] += snd[:e - j]
    mix /= max(1, np.abs(mix).max() / 0.95)
    tmp = out.replace(".mp4", "_mix.wav"); sf.write(tmp, mix, SR)

    # --- visuals: dark base, moving light, grain, vignette
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    vign = 1 - 0.75 * np.clip(((xx - W / 2) / (W * .75)) ** 2 + ((yy - H / 2) / (H * .62)) ** 2, 0, 1)
    vign = vign[..., None]
    sm_h, sm_w = H // 8, W // 8
    syy, sxx = np.mgrid[0:sm_h, 0:sm_w].astype(np.float32)
    rng = np.random.default_rng(7)
    grains = [rng.normal(0, 5, (H // 2, W // 2, 1)).astype(np.float32) for _ in range(1)]
    fHook = ImageFont.truetype(FB, 96); fCap = ImageFont.truetype(FB, 88); fK = ImageFont.truetype(FX, 40); fBr = ImageFont.truetype(FM, 30)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                          "-i", tmp, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                          "-shortest", "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    hook_lines = None
    mk = S.get('motif'); mst = make_motif(mk) if mk else None
    fx = FXM.FX(W, H, acc, tint)
    band = Image.new("L", (W, H), 0); ImageDraw.Draw(band).rectangle((0, int(H * .40), W, int(H * .60)), fill=95)
    band = band.filter(ImageFilter.GaussianBlur(60))
    def mkband(y0, y1, a):
        b = Image.new("L", (W, H), 0); ImageDraw.Draw(b).rectangle((0, int(H * y0), W, int(H * y1)), fill=a); return b.filter(ImageFilter.GaussianBlur(60))
    band_art = mkband(.60, .82, 150); band_hook = mkband(.12, .38, 140); black = Image.new("RGB", (W, H), (0, 0, 0))
    default_bg = S.get("bg") or FXM.MOTIF_TO_BG.get(mk, "smoke")
    for f in range(int(total * FPS)):
        tt = f / FPS
        sc = next((s for s in segs if s["start"] <= tt < s["end"]), segs[-1])
        st = tt - sc["start"]; kind = sc["bg"] or default_bg
        zoom = 1.0 + 0.10 * min(1, st / max(1, sc["end"] - sc["start"]))
        hit = math.exp(-st / 0.12) if sc["i"] > 0 else 0
        shake = (6 * hit * math.sin(tt * 90), 4 * hit * math.cos(tt * 70))
        if sc["art"] is not None:
            if "_art" not in sc:
                a = dict(sc["art"]); a["defs"] = S.get("defs", "") + a.get("defs", "")
                sc["_art"] = ARTM.Art(a, W, H, acc)
            u = min(1, st / max(0.5, sc["end"] - sc["start"])); u = u * u * (3 - 2 * u)
            cam = S["scenes"][sc["i"]].get("cam")
            # gentle, varied camera: still / slow push / slow pull / sideways drift (no zoom)
            z = {"in": 1.0 + 0.035 * u, "out": 1.045 - 0.035 * u, "pan": 1.04}.get(cam, 1.0)
            bgim = sc["_art"].frame(st, sc["end"] - sc["start"], z)
            if cam == "pan":
                dx = 22 - 44 * u
                bgim = bgim.transform((W, H), Image.AFFINE, (1, 0, dx, 0, 1, 0), Image.BILINEAR)
            if shake != (0, 0): bgim = bgim.transform((W, H), Image.AFFINE, (1, 0, -shake[0], 0, 1, -shake[1]), Image.BILINEAR)
        else:
            bgim = fx.frame(kind, tt, st, zoom, shake)
        g = grains[0]; g = np.repeat(np.repeat(g, 2, 0), 2, 1)
        img = np.asarray(bgim, np.float32) * 1.35 * (0.45 + 0.55 * vign) + g + 255 * 0.28 * hit
        im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)); d = ImageDraw.Draw(im)
        if kind == "hyphae" and sc["art"] is None: fx.hyphae_overlay(d, st, f"{sc['i']}")
        # readability band behind captions
        if sc["i"] > 0:
            im = Image.composite(black, im, band_art if sc["art"] is not None else band); d = ImageDraw.Draw(im)
        elif sc["art"] is not None:
            im = Image.composite(black, im, band_hook); d = ImageDraw.Draw(im)
        if sc["i"] == 0:
            # hook: full sentence, big, from frame 0
            if hook_lines is None: hook_lines = wrap(d, up(S["hook"]), fHook, W - 140)
            lh = 108; y0 = (H * 0.24 if sc["art"] is not None else H * 0.40) - lh * (len(hook_lines) - 1) / 2
            for j, ln in enumerate(hook_lines):
                col = tuple(int(c) for c in acc) if any(w in ln for w in up(S.get("hook_red", "")).split()) and S.get("hook_red") else (255, 255, 255)
                d.text((W / 2, y0 + j * lh), ln, font=fHook, fill=col, anchor="mm", stroke_width=6, stroke_fill=(0, 0, 0))
        else:
            cap = next((c for c in sc["caps"] if c[0] <= tt < c[1]), sc["caps"][-1])
            ck = min(1, (tt - cap[0]) / 0.1); size = int(88 * (0.9 + 0.1 * ck))
            fc = fCap if size == 88 else ImageFont.truetype(FB, size)
            lines = wrap(d, up(cap[2]), fc, W - 150); lh = size * 1.15; y0 = (H * 0.71 if sc["art"] is not None else H * 0.5) - lh * (len(lines) - 1) / 2
            for j, ln in enumerate(lines):
                d.text((W / 2, y0 + j * lh), ln, font=fc, fill=(255, 255, 255), anchor="mm", stroke_width=8, stroke_fill=(0, 0, 0))
            if sc["kicker"]:
                k = up(sc["kicker"]); kw = d.textlength(k, font=fK)
                ky = 1150 if sc["art"] is not None else 500
                d.rectangle(((W - kw) / 2 - 22, ky - 30, (W + kw) / 2 + 22, ky + 30), fill=tuple(int(c) for c in acc))
                d.text((W / 2, ky), k, font=fK, fill=(255, 255, 255), anchor="mm")
        d.text((W / 2, H - 250), "PMDARWIN", font=fBr, fill=(200, 200, 200), anchor="mm")
        d.rectangle((0, H - 6, W * tt / total, H), fill=tuple(int(c) for c in acc))
        p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait(); os.remove(tmp)
    return total

if __name__ == "__main__":
    print(build(sys.argv[1], sys.argv[2]))
