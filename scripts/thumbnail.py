"""PMDARWIN küçük resim (thumbnail) üreticisi — 1280x720 JPG, ücretsiz, çizim sistemiyle.

    python3 scripts/thumbnail.py <video.json|episode.json> <cikti.jpg>

JSON içinde "thumb" nesnesi:
  "thumb": {
    "text": "BEYNİ ÇALINAN KARINCA",     # en çok 3 kelime; başlığı TEKRAR ETMESİN
    "red": "ÇALINAN",                    # vurgu rengiyle yazılacak kelime(ler) (isteğe bağlı)
    "number": "#1",                      # sol üst köşe rozeti (isteğe bağlı, uzun videolarda bölüm no)
    "side": "left",                      # yazının yeri: left | right
    "art": { ...art.py biçimi, tuval 1280x720... }   # çizim yazının KARŞI tarafında, büyük ve net
  }
Kurallar (küçük ekranda okunsun): tek ana nesne, büyük; yüksek kontrast; yazı ekranın ~%45'i;
koyu arka plan + tek parlak vurgu rengi. Kontrol: 320x180'e küçültülmüş hâli de okunur olmalı (otomatik üretilir: <cikti>_kucuk.jpg).
"""
import json, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np
import art as ARTM
import render as R

TW, TH = 1280, 720


def build(spec_path, out):
    S = json.load(open(spec_path))
    T = S["thumb"]
    acc = tuple(int(c) for c in R.hexrgb(S.get("accent", "#ff4d2e")))
    a = dict(T.get("art", {})); a["defs"] = S.get("defs", "") + a.get("defs", "")
    im = ARTM.Art(a, TW, TH, acc).frame(T.get("t", 1.5), 3.0) if a.get("layers") else Image.new("RGB", (TW, TH), (8, 10, 14))
    # vignette + side darkening behind text
    side = T.get("side", "left")
    x = np.linspace(0, 1, TW)[None, :, None]
    shade = (1 - x) if side == "left" else x
    arr = np.asarray(im, np.float32)
    yy, xx = np.mgrid[0:TH, 0:TW]
    vign = 1 - 0.55 * np.clip(((xx - TW / 2) / (TW * .7)) ** 2 + ((yy - TH / 2) / (TH * .7)) ** 2, 0, 1)
    arr = arr * vign[..., None] * (1 - 0.65 * np.clip(shade * 1.6 - 0.3, 0, 1))
    im = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    d = ImageDraw.Draw(im)
    words = R.up(T["text"]).split()
    red = set(R.up(T.get("red", "")).split())
    # fit font: up to 3 lines, block width ~52% of frame
    maxw = int(TW * 0.52)
    for size in range(170, 60, -6):
        f = ImageFont.truetype(R.FB, size)
        lines, cur = [], []
        for w in words:
            t = " ".join(cur + [w])
            if d.textlength(t, font=f) <= maxw or not cur: cur.append(w)
            else: lines.append(cur); cur = [w]
        lines.append(cur)
        if len(lines) <= 3 and all(d.textlength(" ".join(l), font=f) <= maxw for l in lines): break
    lh = int(size * 1.02); y0 = TH / 2 - lh * (len(lines) - 1) / 2
    x0 = 60 if side == "left" else TW - 60
    anchor = "lm" if side == "left" else "rm"
    for j, l in enumerate(lines):
        y = y0 + j * lh
        if side == "left":
            cx = x0
            for w in l:
                col = acc if w in red else (255, 255, 255)
                d.text((cx, y), w, font=f, fill=col, anchor="lm", stroke_width=max(6, size // 14), stroke_fill=(0, 0, 0))
                cx += d.textlength(w + " ", font=f)
        else:
            cx = x0
            for w in reversed(l):
                col = acc if w in red else (255, 255, 255)
                d.text((cx, y), w, font=f, fill=col, anchor="rm", stroke_width=max(6, size // 14), stroke_fill=(0, 0, 0))
                cx -= d.textlength(w + " ", font=f)
    if T.get("number"):
        fb = ImageFont.truetype(R.FB, 54); n = T["number"]; nw = d.textlength(n, font=fb)
        bx = 40 if side == "left" else TW - 40 - nw - 40
        d.rounded_rectangle((bx, 36, bx + nw + 40, 112), 14, fill=acc)
        d.text((bx + 20 + nw / 2, 74), n, font=fb, fill=(255, 255, 255), anchor="mm")
    im = im.convert("RGB")
    im.save(out, quality=92)
    im.resize((320, 180), Image.LANCZOS).save(out.replace(".jpg", "_kucuk.jpg"), quality=90)
    return out


if __name__ == "__main__":
    print(build(sys.argv[1], sys.argv[2]))
