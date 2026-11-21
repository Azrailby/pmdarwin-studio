// Uzayda Ağlarsan Ne Olur? — PMDARWIN (~31 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [71, "wobble"], [140, "earth"], [221, "float"], [315, "astro"], [420, "squeeze"], [459, "nodrip"],
  [483, "grow"], [575, "burn"], [633, "towel"], [725, "compare"], [830, "end"]];
const END = 929;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const CYAN = "#5fd8ff", BLUE = "#3f7ad8", WHITE = "#ffffff";
const PX = 100; // dünyadaki park (istasyon x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function earthTex(E) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#2f7fd8"; g.fillRect(0, 0, 1024, 512);
  for (let i = 0; i < 22; i++) { g.fillStyle = i % 3 ? "#4caf50" : "#c9a86a"; g.beginPath(); g.ellipse(rnd(i) * 1024, 120 + rnd(i + 5) * 280, 25 + rnd(i + 9) * 60, 15 + rnd(i + 2) * 40, rnd(i + 3) * 3, 0, 7); g.fill(); }
  g.fillStyle = "rgba(255,255,255,.85)";
  for (let i = 0; i < 40; i++) { g.beginPath(); g.ellipse(rnd(i + 50) * 1024, rnd(i + 60) * 512, 30 + rnd(i + 70) * 80, 8 + rnd(i + 80) * 14, rnd(i + 90) * 0.6, 0, 7); g.fill(); }
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 1024, 30); g.fillRect(0, 482, 1024, 30);
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- istasyon modülü (x=0) ----
  const wall = E.mat("#ffffff", { map: T.metal("#dfe3ea") }), pan = E.mat("#eef1f5");
  E.box(9, 0.1, 4, wall, [0, -0.1, -0.2]);
  E.box(9, 0.1, 4, wall, [0, 2.9, -0.2]);
  // arka duvar, ortada pencere boşluğu (x: -0.7..0.7, y: 1.0..2.1)
  E.box(3.8, 3.0, 0.15, wall, [-2.6, -0.1, -2.1]); E.box(3.8, 3.0, 0.15, wall, [2.6, -0.1, -2.1]);
  E.box(1.4, 1.1, 0.15, wall, [0, -0.1, -2.1]); E.box(1.4, 0.9, 0.15, wall, [0, 2.0, -2.1]);
  for (const [x, y, w, h] of [[0, 1.0, 1.6, 0.1], [0, 2.0, 1.6, 0.1], [-0.75, 1.0, 0.1, 1.1], [0.75, 1.0, 0.1, 1.1]]) E.box(w, h, 0.25, E.mat("#9aa3b2"), [x, y, -2.0]);
  for (const s of [-1, 1]) E.box(0.15, 3.0, 4, wall, [s * 4.5, -0.1, -0.2]);
  // paneller, tutamaklar, kablolar
  for (let i = 0; i < 6; i++) { const x = -3.8 + i * 1.5; if (Math.abs(x) < 1.0) continue; E.box(1.2, 0.8, 0.06, E.mat(["#cfd6e0", "#e8eaf0", "#bfc8d4"][i % 3]), [x, 1.4, -2.0]); E.box(0.3, 0.2, 0.04, E.mat(["#e04848", "#3fbf6a", "#f2c23a"][i % 3], { emissive: ["#e04848", "#3fbf6a", "#f2c23a"][i % 3], glow: 0.6 }), [x - 0.3, 1.9, -1.96]); }
  for (let i = 0; i < 5; i++) { const h = E.cyl(0.025, 0.025, 0.6, E.mat("#f2c23a"), [-3.6 + i * 1.8, 0.75, -1.95], { center: true, seg: 6 }); h.rotation.z = Math.PI / 2; }
  for (let i = 0; i < 4; i++) E.box(0.5, 0.35, 0.3, E.mat(["#3f7ad8", "#e8a33c", "#5a8a5a", "#8a5a8a"][i]), [-3.5 + i * 2.3 + (i > 1 ? 0.4 : 0), 2.4, -1.85]);
  E.box(9, 0.05, 0.1, E.mat("#ffffff", { emissive: "#dff0ff", glow: 1.2 }), [0, 2.82, -1.6]);
  E.box(0.6, 0.04, 0.4, E.mat("#2b2f3a"), [2.2, 1.0, -1.7]); E.box(0.6, 0.4, 0.03, E.mat("#2b2f3a"), [2.2, 1.04, -1.88]);
  E.box(0.54, 0.34, 0.01, E.mat("#7cc4ff", { emissive: "#3f7ad8", glow: 0.6 }), [2.2, 1.07, -1.86]);
  for (let i = 0; i < 3; i++) { const c = E.cyl(0.03, 0.03, 2.4, E.mat(["#e04848", "#3f7ad8", "#2b2f3a"][i]), [-1.6 + i * 0.08, 0.3, -1.92], { seg: 6 }); c.rotation.z = 0.05 * i; }
  // dünya
  R.earth = E.sphere(40, E.flat("#ffffff", { map: earthTex(E), fog: false }), [0, -30, -75], { seg: 64 });
  R.earth.userData.noink = true; R.earth.castShadow = false;
  for (let i = 0; i < 60; i++) { const s = E.sphere(0.12, E.flat("#ffffff", { fog: false }), [-30 + rnd(i) * 60, 8 + rnd(i + 3) * 40, -90 - rnd(i + 5) * 10], { seg: 6 }); s.userData.noink = true; s.castShadow = false; }
  // süzülen eşyalar
  R.floaters = [];
  const fl = (o) => { R.floaters.push(o); return o; };
  { const g = E.group(null, [0, -50, 0]); E.cyl(0.02, 0.02, 0.28, E.mat("#3f7ad8"), [0, -0.14, 0], { parent: g, seg: 6 }); fl(g); }
  { const g = E.group(null, [0, -50, 0]); E.box(0.36, 0.06, 0.26, E.mat("#e04848"), [0, 0, 0], { parent: g, center: true }); E.box(0.34, 0.05, 0.24, E.mat("#fbf8ef"), [0.01, 0, 0], { parent: g, center: true }); fl(g); }
  { const g = E.group(null, [0, -50, 0]); E.sphere(0.1, E.mat("#d8342c"), [0, 0, 0], { parent: g, seg: 14 }); E.cyl(0.008, 0.01, 0.05, E.mat("#5a3a22"), [0, 0.1, 0], { parent: g, seg: 5 }); fl(g); }
  { const g = E.group(null, [0, -50, 0]); E.cyl(0.012, 0.012, 0.2, E.mat("#c9d0d8"), [0, -0.1, 0], { parent: g, seg: 5 }); E.sphere(0.035, E.mat("#c9d0d8"), [0, 0.1, 0], { parent: g, seg: 8 }).scale.set(1, 1.4, 0.4); fl(g); }
  { const g = E.group(null, [0, -50, 0]); E.sphere(0.06, E.mat(CYAN, { transparent: true, opacity: 0.75, emissive: "#3fa8d8", glow: 0.3 }), [0, 0, 0], { parent: g, seg: 14 }); fl(g); }
  // su topu, şişe, havlu
  R.ball = E.sphere(1, E.mat("#bff2ff", { transparent: true, opacity: 0.68, emissive: "#5fc8ef", glow: 0.35 }), [0, -50, 0], { seg: 24 });
  R.ballHi = E.sphere(1, E.flat("#ffffff"), [0, -50, 0], { seg: 10 }); R.ballHi.userData.noink = true;
  R.bottle = E.group(null, [0, -50, 0]);
  E.cyl(0.05, 0.05, 0.22, E.mat("#9fe0ff", { transparent: true, opacity: 0.8 }), [0, 0, 0], { parent: R.bottle, seg: 12 });
  E.cyl(0.025, 0.035, 0.06, E.mat("#3f7ad8"), [0, 0.22, 0], { parent: R.bottle, seg: 10 });
  R.drops = [];
  for (let i = 0; i < 10; i++) { const d = E.sphere(0.018, E.mat(CYAN, { emissive: "#3fa8d8", glow: 0.5 }), [0, -50, 0], { seg: 8 }); d.castShadow = false; R.drops.push(d); }
  R.towel = E.box(0.34, 0.24, 0.05, E.mat("#ff8fb1"), [0, -50, 0], { center: true });
  // ---- park (x=PX) ----
  E.ground(T.grass("#7fb35a"), 160, 0.25, [PX, 0.005, 0]);
  S.tree(PX - 2.2, -3.5); S.tree(PX + 2.8, -5); S.bench(PX + 1.2, -1.6);
  S.hills({ z: -60, col: "#8fbf5f" }); S.clouds({ n: 4, y: 30, z: -90 });
  // ---- karakterler ----
  const astro = { shirt: "#eef2f6", pants: "#eef2f6", shoes: "#3a3f4a", belt: BLUE, hair: "short", hairCol: "#5a3a22", skin: "#f0c9a4", seed: 141, buttons: "#3f7ad8" };
  E.actor("astro", astro);
  E.actor("kid", { shirt: "#ffb347", pants: "#3b3f52", hair: "short", hairCol: "#3a2a20", skin: "#f6dcc0", seed: 142 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(10,18,40,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = CYAN; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#cfeeff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = CYAN, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#0a1020"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};
// karşılaştırma paneli
const versus = (a1, a2) => (g, w) => {
  const k = w / 1080, y = 200 * k, h = 330 * k;
  [[60, "DÜNYA", "gözyaşı akar", "#3fbf6a", a1], [560, "UZAY", "top olur · yakar", "#e0554a", a2]].forEach(([x, t1, t2, c, a]) => {
    g.save(); g.globalAlpha = a; g.fillStyle = "rgba(10,18,40,.85)"; g.beginPath(); g.roundRect(x * k, y, 460 * k, h, 28 * k); g.fill();
    g.lineWidth = 6 * k; g.strokeStyle = c; g.stroke();
    g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.font = `900 ${80 * k}px CizgiFont, Nunito, sans-serif`; g.fillText(t1, (x + 230) * k, y + 90 * k);
    g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = c; g.fillText(t2, (x + 230) * k, y + 190 * k); g.restore();
  });
};

function reset() { R.floaters.forEach(hide); R.drops.forEach(hide); for (const o of [R.ball, R.ballHi, R.bottle, R.towel]) hide(o); }
// astronotun sağ gözü (izleyiciye göre sağ) — bob/tilt kapalıyken
const eyeR = (p, s = 1) => [p[0] + 0.117 * s, p[1] + 1.417 * s, p[2] + 0.05];
function ball(p, r) { if (r <= 0.002) return; put(R.ball, p[0], p[1] + r * 0.3, p[2] + r * 0.6, 0, r); R.ball.scale.set(r * 1.05, r * 0.95, r); put(R.ballHi, p[0] - r * 0.35, p[1] + r * 0.65, p[2] + r * 1.5, 0, r * 0.22); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const SPACE = { ...X.LIGHTS.day, sun: "#ffffff", sunI: 1.2, el: 55, sky: "#e8f0ff", ground: "#8a96aa", hemiI: 1.05, amb: 0.3, top: "#03050d", bot: "#0b1430", fog: "#0b1430", fogNear: 300, fogFar: 900, card: "#ffffff", sat: 1.08, con: 1.06, vig: 0.38, warm: -0.02 };
  let cam, light = SPACE, dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 1, 0], tint = "rgba(60,120,220,0.05)";
  reset();
  const fy = 0.35 + 0.05 * Math.sin(f / 20); // süzülme yüksekliği
  const astro = (o = {}, pos = [0, fy, 0]) => { A.push({ id: "astro", pos, blob: false, roll: o.roll ?? 0.05 * Math.sin(f / 25), st: { blink: o.noBlink ? 0 : E.blink(f, 141), bob: 0, tilt: 0, headTilt: 0, face: "neutral", arms: "hang", ...o.st } }); return pos; };

  switch (sh.name) {
    case "hook": case "wobble": {
      const p = astro({ roll: 0, st: { face: "sad", arms: sh.name === "hook" ? "shrug" : "reach", look: 0 } });
      const r = 0.075 + (sh.name === "wobble" ? 0.012 * Math.sin(f / 3) : 0);
      const e = eyeR(p); ball(e, r);
      if (sh.name === "wobble") R.ball.scale.set(r * (1.05 + 0.08 * Math.sin(f / 2.5)), r * (0.95 - 0.08 * Math.sin(f / 2.5)), r);
      cam = E.camAt(f, [{ f: 0, pos: [0.15, fy + 1.4, 1.35], look: [0.05, fy + 1.42, 0], fov: 42 }, { f: 139, pos: [0.12, fy + 1.42, 1.05], look: [0.08, fy + 1.42, 0], fov: 42 }], { creep: 0.03 });
      dof = { focus: [0.1, fy + 1.4, 0], amount: 3 };
      if (sh.name === "hook") ov.push(big("UZAYDA", 1, f > WF(E, 3) - 3 ? "gözyaşı akmaz" : "ağlarsan…", CYAN, 160));
      else ov.push(big("SU TOPU", X.span(f, WF(E, 6) - 3, WF(E, 6) + 5), "gözde kalır", WHITE, 150));
      break;
    }
    case "earth": {
      light = "day"; tint = null;
      A.push({ id: "kid", pos: [PX, 0, 0], st: { blink: 0, bob: 0, tilt: 0, headTilt: 0, face: "sad", arms: "hang", look: 0 } });
      const e = [PX + 0.117, 1.417, 0.06], e2 = [PX - 0.117, 1.417, 0.06];
      R.drops.forEach((d, i) => { const per = 22, k = ((f - 140 + i * (per / 5)) % per) / per, src = i % 2 ? e : e2; put(d, src[0] + (i % 2 ? 0.02 : -0.02), src[1] - 0.05 - 1.2 * k * k, src[2] + 0.02, 0, 1.3); });
      FX.push({ kind: "lines", pos: [PX + 0.55, 0.9, 0.1], size: 0.5, rot: -Math.PI / 2 });
      cam = E.camAt(f, [{ f: 140, pos: [PX + 0.2, 1.3, 2.4], look: [PX + 0.05, 1.35, 0], fov: 44 }, { f: 220, pos: [PX + 0.2, 1.3, 2.1], look: [PX + 0.05, 1.35, 0], fov: 44 }]);
      ov.push(big("DÜNYADA ↓", X.span(f, WF(E, 10) - 3, WF(E, 10) + 5), f > WF(E, 12) - 3 ? "yerçekimi aşağı çeker" : "", "#3fbf6a", 140));
      break;
    }
    case "float": {
      const p = astro({ roll: 0.5 * Math.sin(f / 40) + 0.3, st: { face: "happy", arms: "up", look: 0.4 } }, [-0.5, 0.5 + 0.1 * Math.sin(f / 18), -0.3]);
      R.floaters.forEach((o, i) => { put(o, 0.4 + (i % 3) * 0.45 - 0.2, 1.0 + i * 0.32 + 0.1 * Math.sin(f / 15 + i), -0.2 + (i % 2) * 0.4); o.rotation.set(f * 0.02 * (i + 1), f * 0.015 * (i + 2), f * 0.01 * (3 - i)); });
      cam = E.camAt(f, [{ f: 221, pos: [0.3, 1.6, 4.2], look: [0.1, 1.55, -0.5], fov: 50 }, { f: 314, pos: [0.2, 1.55, 3.6], look: [0.1, 1.55, -0.5], fov: 50 }]);
      ov.push(big("AĞIRLIKSIZ", X.span(f, WF(E, 18) - 3, WF(E, 18) + 5), "yerçekimi hissedilmez", WHITE, 130));
      break;
    }
    case "astro": {
      astro({ st: { face: "grin", arms: "wave", phase: f / 30, look: 0 } }, [0, fy, 0]);
      cam = E.camAt(f, [{ f: 315, pos: [0.2, 1.4, 3.6], look: [0.05, 1.6, 0], fov: 46 }, { f: 419, pos: [0.15, 1.4, 3.1], look: [0.05, 1.6, 0], fov: 46 }]);
      ov.push(card("Chris Hadfield", "Kanadalı astronot · 2013"));
      ov.push(big("YÖRÜNGEDE", X.span(f, WF(E, 25) - 3, WF(E, 25) + 5), "deney yaptı", CYAN, 130));
      break;
    }
    case "squeeze": case "nodrip": case "grow": {
      const p = astro({ roll: 0, noBlink: true, st: { face: sh.name === "grow" ? "nervous" : "neutral", arms: sh.name === "squeeze" ? "holdR" : "hang", look: 0.2 } });
      const e = eyeR(p);
      if (sh.name === "squeeze") {
        const k = X.smooth(X.span(f, 420, 436));
        put(R.bottle, X.lerp(e[0] + 0.5, e[0] + 0.2, k), X.lerp(e[1] - 0.45, e[1] + 0.02, k), e[2] + 0.08); R.bottle.rotation.set(0, 0, 1.0 + 0.4 * k);
        if (f >= WF(E, 29) - 4) R.drops.slice(0, 4).forEach((d, i) => { const q = ((f - 430 + i * 3) % 12) / 12; put(d, X.lerp(e[0] + 0.15, e[0], q), e[1] + 0.03, e[2] + 0.06, 0, 1); });
      }
      const r0 = sh.name === "squeeze" ? 0.04 * X.span(f, WF(E, 29) - 4, 459) : sh.name === "nodrip" ? 0.04 + 0.01 * X.span(f, 459, 483) : X.lerp(0.05, 0.12, X.smooth(X.span(f, 483, WF(E, 37))));
      ball(e, r0);
      const close = sh.name === "grow";
      cam = E.camAt(f, [{ f: sh.f0, pos: [0.3, fy + 1.4, close ? 1.25 : 1.6], look: [0.1, fy + 1.42, 0], fov: 42 }, { f: sh.f1 - 1, pos: [0.25, fy + 1.42, close ? 1.0 : 1.4], look: [0.1, fy + 1.42, 0], fov: 42 }], { creep: 0.03 });
      dof = { focus: [0.1, fy + 1.4, 0], amount: 3 };
      if (sh.name === "squeeze") ov.push(big("su sıktı", X.span(f, WF(E, 28) - 3, WF(E, 28) + 5), "", CYAN, 130));
      if (sh.name === "nodrip") ov.push(big("AKMADI!", X.span(f, WF(E, 31) - 3, WF(E, 31) + 3), "", WHITE, 170));
      if (sh.name === "grow") ov.push(big("BALONCUK", X.span(f, WF(E, 36) - 3, WF(E, 36) + 5), "büyüdükçe büyüdü", CYAN, 140));
      break;
    }
    case "burn": {
      const p = astro({ roll: 0, st: { face: "angry", arms: "facepalm", look: 0, sweat: true } });
      ball(eyeR(p), 0.12 + 0.01 * Math.sin(f / 3));
      FX.push({ kind: "anger", pos: [-0.45, fy + 2.0, 0.2], size: 0.35 + 0.04 * Math.sin(f / 3) });
      cam = E.camAt(f, [{ f: 575, pos: [0.25, fy + 1.45, 2.0], look: [0.05, fy + 1.5, 0], fov: 44 }, { f: 632, pos: [0.2, fy + 1.45, 1.75], look: [0.05, fy + 1.5, 0], fov: 44 }]);
      ov.push(big("YAKIYOR!", X.span(f, WF(E, 42) - 3, WF(E, 42) + 4), "", "#ff7a5a", 170));
      break;
    }
    case "towel": {
      const p = astro({ roll: 0, st: { face: f > 700 ? "happy" : "nervous", arms: "holdR", look: 0 } });
      const e = eyeR(p), k = X.smooth(X.span(f, WF(E, 46) - 6, WF(E, 47) + 4));
      put(R.towel, X.lerp(e[0] + 0.5, e[0] + 0.02, k) + 0.04 * Math.sin(f) * (k > 0.9 && f < 700 ? 1 : 0), X.lerp(e[1] - 0.45, e[1], k), e[2] + 0.12); R.towel.rotation.set(0, 0, 0.3 * (1 - k));
      if (f > 700) R.towel.position.x += (f - 700) * 0.02;
      ball(e, 0.12 * (1 - X.span(f, WF(E, 47), WF(E, 47) + 10)));
      cam = E.camAt(f, [{ f: 633, pos: [0.3, fy + 1.4, 2.1], look: [0.1, fy + 1.45, 0], fov: 44 }, { f: 724, pos: [0.25, fy + 1.4, 1.8], look: [0.1, fy + 1.45, 0], fov: 44 }]);
      ov.push(big("HAVLU", X.span(f, WF(E, 46) - 3, WF(E, 46) + 5), "silmek şart", "#ff8fb1", 150));
      break;
    }
    case "compare": {
      const p = astro({ st: { face: "nervous", arms: "shrug", look: 0 } }, [0, fy - 0.15, 0]);
      ball(eyeR(p), 0.1);
      cam = E.camAt(f, [{ f: 725, pos: [0.2, 0.9, 3.9], look: [0.05, 1.75, 0], fov: 46 }, { f: 829, pos: [0.2, 0.9, 3.6], look: [0.05, 1.75, 0], fov: 46 }]);
      ov.push(versus(X.span(f, 728, 736), X.span(f, WF(E, 50) - 3, WF(E, 50) + 5)));
      const z = WF(E, 54) - 2, a = WF(E, 57) - 2;
      if (f >= z) FX.push({ kind: "burst", pos: [-0.42, 0.7, 0.4], size: 0.4 * X.back(X.span(f, z, z + 6)), opt: { col: "#fff3a8", text: "ZOR", size: 120 } });
      if (f >= a) FX.push({ kind: "burst", pos: [0.45, 0.55, 0.4], size: 0.4 * X.back(X.span(f, a, a + 6)), opt: { col: "#ffb0a0", text: "ACI", size: 120 } });
      break;
    }
    case "end": {
      astro({ roll: 0.08 * Math.sin(f / 22), st: { face: "happy", arms: "wave", phase: f / 30, look: -0.3 } }, [0.6, fy + 0.1, -1.0]);
      cam = E.camAt(f, [{ f: 830, pos: [0.6, 1.5, 3.2], look: [0.1, 1.6, -2], fov: 50 }, { f: 928, pos: [0.5, 1.5, 2.8], look: [0.05, 1.6, -2], fov: 50 }]);
      R.earth.rotation.y = f * 0.0006;
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 832, 840), f >= WF(E, 62) - 2 ? "Her gün." : "", WHITE, 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
