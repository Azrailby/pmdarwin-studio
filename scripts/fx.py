"""Full-screen procedural animated backgrounds for PMDARWIN videos (v3).

Each scene gets its own moving background ("bg" key in the scene JSON):
  smoke    - slow swirling smoke / fog in the accent colour
  spores   - glowing particles drifting upward with depth (parasites, dust, cells)
  hyphae   - branching veins growing across the whole screen (fungi, nerves, roots)
  warp     - stars rushing past the camera (space, speed, time)
  caustics - underwater light ripples (ocean, deep sea)
  rings    - pulsing shock rings from the centre (heartbeat, brain, sound, explosions)
  vortex   - spiralling accretion disc around a black centre (black holes, whirlpools)
  cells    - drifting membrane-like blobs (biology, blood, bacteria)
Everything is computed at low resolution and upscaled, so rendering stays fast.
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

KINDS = ["smoke", "spores", "hyphae", "warp", "caustics", "rings", "vortex", "cells"]
MOTIF_TO_BG = {"network": "hyphae", "pulse": "rings", "vortex": "vortex", "tentacles": "caustics", "stars": "warp"}


class FX:
    def __init__(self, W, H, accent, tint, seed=11, scale=4):
        self.W, self.H, self.s = W, H, scale
        self.w, self.h = W // scale, H // scale
        self.acc = np.asarray(accent, np.float32)
        self.tint = np.asarray(tint, np.float32)
        self.rng = np.random.default_rng(seed)
        yy, xx = np.mgrid[0:self.h, 0:self.w].astype(np.float32)
        self.x = xx / self.w; self.y = yy / self.h
        self.cx = (xx - self.w / 2) / self.w; self.cy = (yy - self.h / 2) / self.w
        self.r = np.sqrt(self.cx ** 2 + self.cy ** 2) + 1e-4; self.th = np.arctan2(self.cy, self.cx)
        n = 900
        self.p = dict(x=self.rng.uniform(0, 1, n), y=self.rng.uniform(0, 1, n), z=self.rng.uniform(0.15, 1, n),
                      ph=self.rng.uniform(0, 6.28, n))
        self.stars = dict(x=self.rng.uniform(-1, 1, 700), y=self.rng.uniform(-1, 1, 700), z=self.rng.uniform(0.02, 1, 700))
        self.blobs = [(self.rng.uniform(0, 1), self.rng.uniform(0, 1), self.rng.uniform(.05, .13), self.rng.uniform(0, 6.28))
                      for _ in range(14)]
        self._hyph = {}

    # ---------- helpers
    def _flow(self, t, k=1.0):
        x, y = self.x * 3 * k, self.y * 5 * k
        qx = np.sin(x + 0.31 * t) + np.sin(1.7 * y - 0.23 * t + 1.3)
        qy = np.sin(1.3 * x - 0.27 * t + 2.1) + np.sin(y + 0.19 * t)
        v = np.sin(x + 1.6 * qx + 0.11 * t) * np.sin(y + 1.6 * qy - 0.07 * t)
        v += 0.5 * np.sin(2.3 * x - 1.2 * qy + 0.2 * t) * np.sin(2.1 * y + 1.1 * qx)
        return (v + 1.5) / 3.0

    def _colorize(self, v, glow=None):
        v = np.clip(v, 0, 1)[..., None]
        img = self.tint * (0.55 + 0.9 * v) + self.acc * (v ** 2.2) * 0.85
        if glow is not None:
            img = img + glow[..., None] * (self.acc * 0.9 + 60)
        return img

    def _points(self, img, xs, ys, rad, bright):
        """Additive soft dots on the small canvas."""
        h, w = self.h, self.w
        layer = np.zeros((h, w), np.float32)
        xi = (xs * w).astype(int); yi = (ys * h).astype(int)
        ok = (xi >= 0) & (xi < w) & (yi >= 0) & (yi < h)
        np.add.at(layer, (yi[ok], xi[ok]), bright[ok])
        im = Image.fromarray(np.clip(layer * 255, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(rad))
        g = np.asarray(im, np.float32) / 255 * 3.0
        sharp = np.minimum(layer, 1.0)
        return img + (g[..., None] + sharp[..., None]) * (self.acc * 0.6 + 120)

    # ---------- backgrounds (return small float image h x w x 3)
    def smoke(self, t, tt):
        return self._colorize(self._flow(t) ** 1.6)

    def spores(self, t, tt):
        img = self._colorize(self._flow(t * 0.6, 0.7) ** 2.2 * 0.7)
        P = self.p
        ys = (P["y"] - t * 0.035 * (0.4 + P["z"])) % 1.0
        xs = (P["x"] + 0.02 * np.sin(t * 0.8 + P["ph"])) % 1.0
        b = P["z"] ** 2 * (0.6 + 0.4 * np.sin(t * 2 + P["ph"]))
        return self._points(img, xs, ys, 2.5, b * 4.0)

    def warp(self, t, tt):
        img = self._colorize(np.exp(-self.r * 6) * 0.5)
        S = self.stars
        z = (S["z"] - t * 0.22) % 1.0 + 0.03
        xs = 0.5 + S["x"] / z * 0.22; ys = 0.5 + S["y"] / z * 0.22 * self.w / self.h
        b = np.clip(1 - z, 0, 1) ** 1.5
        img = self._points(img, xs, ys, 1.4, b)
        # streaks: second sample slightly earlier in time
        z2 = (S["z"] - (t - 0.08) * 0.22) % 1.0 + 0.03
        return self._points(img, 0.5 + S["x"] / z2 * 0.22, 0.5 + S["y"] / z2 * 0.22 * self.w / self.h, 1.0, b * 0.5)

    def caustics(self, t, tt):
        x, y = self.x * 9, self.y * 14
        c = 0
        for i, (a, b) in enumerate([(1, .7), (-.8, 1.1), (.6, -1.3)]):
            c = c + np.sin(a * x + b * y + t * (0.9 + .3 * i) + 2 * np.sin(0.5 * x - 0.4 * y + t * 0.3))
        c = (np.abs(c) / 3) ** 0.35
        c = 1 - c
        depth = 1 - self.y * 0.8
        v = self._flow(t * 0.4, 0.5) * 0.35 * depth
        img = self._colorize(v)
        return img + (c ** 3 * depth)[..., None] * (self.acc * 0.35 + 90)

    def rings(self, t, tt):
        img = self._colorize(self._flow(t * 0.5, 0.8) ** 2 * 0.5)
        beat = t % 1.6
        g = 0
        for k in range(3):
            rad = (beat + k * 0.53) % 1.6 * 0.42
            g = g + np.exp(-((self.r - rad) / 0.012) ** 2) * max(0, 1 - rad / 0.7)
        core = np.exp(-(self.r / (0.06 + 0.02 * math.exp(-beat * 6))) ** 2)
        return self._colorize(np.zeros_like(self.r) + 0.1, glow=g * 0.9 + core * 0.8) * 0.5 + img * 0.5

    def vortex(self, t, tt):
        sw = self.th + 3.2 / (self.r * 18 + 1) - t * 0.9
        arms = (np.sin(sw * 3 + self.r * 22) * 0.5 + 0.5) ** 3
        disc = np.exp(-((self.r - 0.24) / 0.13) ** 2)
        v = arms * disc * 1.2 + self._flow(t) * 0.25
        img = self._colorize(v, glow=np.exp(-((self.r - 0.105) / 0.006) ** 2) * 1.5)
        img[self.r < 0.1] = 0
        return img

    def cells(self, t, tt):
        v = np.zeros_like(self.x)
        for (bx, by, br, ph) in self.blobs:
            px = (bx + 0.05 * math.sin(t * 0.3 + ph)) % 1; py = (by - t * 0.012 + 0.04 * math.cos(t * 0.25 + ph)) % 1
            dx = (self.x - px); dy = (self.y - py) * self.h / self.w
            d = np.sqrt(dx * dx + dy * dy) / (br * (1 + 0.06 * math.sin(t * 1.5 + ph)))
            v = v + np.exp(-((d - 1) / 0.08) ** 2) * 0.9 + np.exp(-(d / 0.35) ** 2) * 0.25
        return self._colorize(self._flow(t * 0.5) * 0.3 + np.clip(v, 0, 1.2) * 0.7)

    def hyphae(self, t, tt):
        """Branches grow over the whole scene duration; drawn at full res on an overlay."""
        return self._colorize(self._flow(t * 0.5, 0.8) ** 2 * 0.55)

    def hyphae_overlay(self, d, tt, key):
        if key not in self._hyph:
            rng = np.random.default_rng(abs(hash(key)) % 2 ** 32); segs = []
            def grow(x, y, ang, ln, t0, depth):
                if depth > 8 or ln < 14: return
                x2, y2 = x + ln * math.cos(ang), y + ln * math.sin(ang)
                segs.append((x, y, x2, y2, t0, depth))
                for da in (-0.55, 0.5):
                    if rng.random() < 0.8: grow(x2, y2, ang + da + rng.normal(0, .2), ln * 0.8, t0 + 0.28, depth + 1)
            for j in range(5):
                left = j % 2 == 0
                x0, y0 = (-10 if left else self.W + 10), rng.uniform(self.H * .15, self.H * .85)
                grow(x0, y0, (0 if left else math.pi) + rng.normal(0, .35), 170, rng.uniform(0, 0.5), 0)
            self._hyph[key] = segs
        a = tuple(int(c) for c in self.acc); dim = tuple(int(c * .45) for c in self.acc)
        for x, y, x2, y2, t0, dep in self._hyph[key]:
            k = tt * 2.0 - t0
            if k <= 0: continue
            k = min(1, k)
            d.line((x, y, x + (x2 - x) * k, y + (y2 - y) * k), fill=dim if dep > 2 else a, width=max(2, 8 - dep))

    # ---------- frame
    def frame(self, kind, t, tt, zoom=1.0, shake=(0, 0)):
        """t = global time, tt = time inside scene. Returns full-res uint8 RGB Image."""
        small = getattr(self, kind if kind in KINDS else "smoke")(t, tt)
        small = np.clip(small, 0, 255).astype(np.uint8)
        im = Image.fromarray(small)
        if zoom != 1.0 or shake != (0, 0):
            zw, zh = self.w / zoom, self.h / zoom
            ox = (self.w - zw) / 2 + shake[0] / self.s; oy = (self.h - zh) / 2 + shake[1] / self.s
            im = im.transform((self.w, self.h), Image.EXTENT, (ox, oy, ox + zw, oy + zh), Image.BILINEAR)
        return im.resize((self.W, self.H), Image.BICUBIC)
