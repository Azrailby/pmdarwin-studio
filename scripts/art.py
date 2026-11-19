"""Illustrated, story-telling animation layer for PMDARWIN videos (v4, Kurzgesagt-like flat style).

A scene may carry an "art" object. Every layer is an SVG fragment drawn in the 1080x1920 canvas
(for 16:9 long videos the canvas is 1920x1080), rasterised once and then animated per frame.

"art": {
  "sky": ["#0b1d2a", "#02060a"],          # vertical gradient top -> bottom (optional)
  "defs": "<radialGradient id='g'>...</radialGradient>",   # shared <defs> (optional)
  "layers": [
    {"svg": "<g>...</g>",                  # one SVG fragment, or
     "frames": ["<g>..A..</g>", "<g>..B..</g>"], "fps": 6,  # flip-book frames (walk cycles, blinking)
     "anim": "walk",                       # none|float|sway|walk|grow|pulse|spin|drift|rain|reveal|fadein|shake
     "from": [0, 0], "to": [600, 0],       # walk/drift: translation in px over the move time
     "pivot": [540, 1200],                 # sway/grow/pulse/spin: centre of rotation/scale
     "amp": 6, "speed": 1.0,               # amplitude (deg for sway, px for float/shake, ratio for pulse)
     "start": 0.0, "dur": 1.0,             # when the move starts / how long it takes (fraction of scene, 0..1)
     "axis": "y",                          # grow: "y" (stalk growing up), "x" or "xy"
     "parallax": 0.0}                      # extra slow drift with the camera (0..1)
  ]
}
"""
import io, math, re, os
import numpy as np
from PIL import Image, ImageDraw
import cairosvg

_cache = {}


def _svg(fragment, W, H, defs=""):
    key = (fragment, W, H, defs)
    if key not in _cache:
        doc = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">'
               f'<defs>{defs}</defs>{fragment}</svg>')
        png = cairosvg.svg2png(bytestring=doc.encode("utf-8"), output_width=W, output_height=H)
        im = Image.open(io.BytesIO(png)).convert("RGBA")
        bb = im.getbbox() or (0, 0, 1, 1)
        _cache[key] = (im.crop(bb), bb[:2])
    return _cache[key]


def _ease(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def sky(colors, W, H):
    a = np.array([int(colors[0].lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
    b = np.array([int(colors[-1].lstrip('#')[i:i + 2], 16) for i in (0, 2, 4)], np.float32)
    y = np.linspace(0, 1, H, dtype=np.float32)[:, None, None]
    return Image.fromarray(np.broadcast_to(a * (1 - y) + b * y, (H, W, 3)).astype(np.uint8))


def _place(canvas, spr, x, y, alpha=1.0):
    if alpha < 1:
        a = spr.getchannel("A").point(lambda v: int(v * alpha)); spr = spr.copy(); spr.putalpha(a)
    canvas.paste(spr, (int(round(x)), int(round(y))), spr)


def _transform(spr, off, pivot, ang=0.0, sx=1.0, sy=1.0):
    """Rotate/scale the cropped sprite about a canvas-space pivot; returns (image, new_offset)."""
    if abs(ang) < 1e-3 and abs(sx - 1) < 1e-3 and abs(sy - 1) < 1e-3:
        return spr, off
    w, h = spr.size; px, py = pivot[0] - off[0], pivot[1] - off[1]
    sx = max(sx, 1e-3); sy = max(sy, 1e-3)
    nw, nh = max(1, int(w * sx)), max(1, int(h * sy))
    im = spr.resize((nw, nh), Image.BILINEAR)
    px2, py2 = px * sx, py * sy
    if abs(ang) >= 1e-3:
        # pad so the pivot is the centre, then rotate around centre
        R = int(math.hypot(max(px2, nw - px2), max(py2, nh - py2))) + 2
        pad = Image.new("RGBA", (2 * R, 2 * R), (0, 0, 0, 0))
        pad.paste(im, (int(R - px2), int(R - py2)))
        im = pad.rotate(-ang, resample=Image.BILINEAR)
        return im, (pivot[0] - R, pivot[1] - R)
    return im, (pivot[0] - px2, pivot[1] - py2)


class Art:
    def __init__(self, spec, W, H, accent=(255, 80, 40)):
        self.W, self.H, self.spec = W, H, spec
        self.bg = sky(spec.get("sky", ["#0b1622", "#030608"]), W, H).convert("RGBA")
        defs = spec.get("defs", "")
        self.layers = []
        for L in spec.get("layers", []):
            frames = L.get("frames") or [L.get("svg", "")]
            self.layers.append((L, [_svg(f, W, H, defs) for f in frames]))
        rng = np.random.default_rng(5)
        self.rain = rng.uniform(0, 1, (40, 3))

    def frame(self, st, dur, zoom=1.0):
        """st: seconds into the scene, dur: scene length. Returns RGB image."""
        W, H = self.W, self.H
        canvas = self.bg.copy()
        u = st / max(dur, 1e-3)
        for L, frames in self.layers:
            fps = L.get("fps", 6)
            spr, off = frames[int(st * fps) % len(frames)] if len(frames) > 1 else frames[0]
            an = L.get("anim", "none"); amp = L.get("amp"); sp = L.get("speed", 1.0)
            s0, d0 = L.get("start", 0.0), L.get("dur", 1.0)
            k = _ease((u - s0) / max(d0, 1e-3))
            pivot = L.get("pivot", [off[0] + spr.size[0] / 2, off[1] + spr.size[1] / 2])
            x, y = off; alpha = 1.0
            if u < s0 and an in ("grow", "fadein", "reveal", "walk", "drift"):
                if an != "walk" and an != "drift": continue
            if an == "float":
                y += (amp or 14) * math.sin(st * 1.6 * sp); x += (amp or 14) * 0.4 * math.sin(st * 0.9 * sp + 1)
                _place(canvas, spr, x, y); continue
            if an == "sway":
                im, o = _transform(spr, off, pivot, ang=(amp or 4) * math.sin(st * 1.8 * sp))
                _place(canvas, im, *o); continue
            if an in ("walk", "drift"):
                fx, fy = L.get("from", [0, 0]); tx, ty = L.get("to", [0, 0])
                kk = min(1, max(0, (u - s0) / max(d0, 1e-3))) if an == "walk" else k
                x += fx + (tx - fx) * kk; y += fy + (ty - fy) * kk
                if an == "walk": y += -abs(math.sin(st * 9 * sp)) * (amp or 6)
                _place(canvas, spr, x, y); continue
            if an == "grow":
                ax = L.get("axis", "y")
                sx = k if ax in ("x", "xy") else 1.0; sy = k if ax in ("y", "xy") else 1.0
                if k <= 0.01: continue
                im, o = _transform(spr, off, pivot, sx=sx, sy=sy)
                _place(canvas, im, *o); continue
            if an == "pulse":
                s = 1 + (amp or 0.06) * math.sin(st * 3.2 * sp)
                im, o = _transform(spr, off, pivot, sx=s, sy=s)
                _place(canvas, im, *o); continue
            if an == "spin":
                im, o = _transform(spr, off, pivot, ang=st * 40 * sp)
                _place(canvas, im, *o); continue
            if an == "rain":
                # copies of the sprite falling from the sprite position, staggered
                for i, (rx, ry, rz) in enumerate(self.rain[: L.get("count", 18)]):
                    yy = ((ry + st * 0.12 * sp * (0.6 + rz)) % 1.0) * (L.get("fall", 900))
                    xx = (rx - 0.5) * L.get("spread", 500) + 10 * math.sin(st * 2 + i)
                    _place(canvas, spr, x + xx, y + yy, alpha=0.4 + 0.6 * rz)
                continue
            if an == "fadein":
                _place(canvas, spr, x, y, alpha=k); continue
            if an == "reveal":
                if k <= 0.01: continue
                w = max(1, int(spr.size[0] * k)); _place(canvas, spr.crop((0, 0, w, spr.size[1])), x, y); continue
            if an == "shake":
                a = amp or 5; x += a * math.sin(st * 37); y += a * math.cos(st * 29)
                _place(canvas, spr, x, y); continue
            _place(canvas, spr, x, y)
        im = canvas.convert("RGB")
        if zoom != 1.0:
            zw, zh = W / zoom, H / zoom; ox, oy = (W - zw) / 2, (H - zh) / 2
            im = im.transform((W, H), Image.EXTENT, (ox, oy, ox + zw, oy + zh), Image.BILINEAR)
        return im


class ManimClip:
    """A Manim scene used as one illustration in a long video: {"manim": "<python code>", "scene": "ClassName"}.
    The code must `from manim import *` and define the Scene class. Rendered once at the canvas size,
    padded (last frame held) to the span it must fill, then read frame by frame."""

    def __init__(self, spec, W, H, span, fps=24, workdir="/tmp/pmd_manim"):
        import subprocess, hashlib, tempfile, glob
        self.W, self.H, self.fps = W, H, fps
        os.makedirs(workdir, exist_ok=True)
        key = hashlib.md5((spec["manim"] + f"{W}{H}{span:.2f}").encode()).hexdigest()[:10]
        src = os.path.join(workdir, f"m_{key}.py"); open(src, "w").write(spec["manim"])
        media = os.path.join(workdir, f"media_{key}")
        subprocess.run(["manim", "-qm", "--fps", str(fps), "-r", f"{W},{H}", "--disable_caching", "--media_dir", media,
                        "-o", f"m_{key}.mp4", src, spec.get("scene", "")], check=True, capture_output=True)
        raw = glob.glob(os.path.join(media, "videos", "**", f"m_{key}.mp4"), recursive=True)[0]
        self.p = subprocess.Popen(["ffmpeg", "-loglevel", "error", "-i", raw, "-vf",
                                   f"fps={fps},scale={W}:{H},tpad=stop_mode=clone:stop_duration={span + 1:.2f}",
                                   "-t", f"{span + 0.5:.2f}", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        self.idx = -1; self.last = Image.new("RGB", (W, H))

    def frame(self, st, dur, zoom=1.0):
        want = int(st * self.fps)
        while self.idx < want:
            buf = self.p.stdout.read(self.W * self.H * 3)
            if len(buf) < self.W * self.H * 3: break
            self.last = Image.frombytes("RGB", (self.W, self.H), buf); self.idx += 1
        return self.last
