// Yedi Kez Yıldırım Çarpan Adam — PMDARWIN (~33 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [72, "survive"], [134, "name"], [157, "park"], [231, "toe"], [363, "brows"], [412, "shoulder"],
  [447, "hair"], [517, "lake"], [586, "strike7"], [631, "record"], [765, "crowd"], [895, "end"]];
const END = 995;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const YEL = "#ffe24a", BLUE = "#8fb4ff", GOLD = "#f2c23a";
const LX = 100; // göl kıyısı
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

// ---------------- şimşek ----------------
function makeBolt(E, seed) {
  const TH = E.THREE, g = E.group(null, [0, -50, 0]);
  const m = E.mat("#fff7b0", { emissive: YEL, glow: 1.8 });
  const up = new TH.Vector3(0, 1, 0);
  const seg = (a, b, r) => {
    const A = new TH.Vector3(...a), B = new TH.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const c = E.cyl(r, r, len, m, [0, 0, 0], { parent: g, center: true, seg: 6 });
    c.position.copy(A.clone().add(B).multiplyScalar(0.5)); c.quaternion.setFromUnitVectors(up, d.normalize()); c.castShadow = false;
  };
  let p = [0, 0, 0], k = 0;
  while (p[1] < 18) {
    const n = [p[0] + (rnd(seed * 31 + k) - 0.5) * 1.1, p[1] + 0.8 + rnd(seed * 17 + k) * 1.0, p[2] + (rnd(seed * 13 + k) - 0.5) * 0.3];
    seg(p, n, 0.07);
    if (k % 3 === 1) { let q = n; for (let j = 0; j < 3; j++) { const s = rnd(seed + k * 7 + j) < 0.5 ? -1 : 1; const qn = [q[0] + s * (0.4 + rnd(k + j) * 0.5), q[1] - 0.5 - rnd(k * 3 + j) * 0.5, q[2]]; seg(q, qn, 0.035); q = qn; } }
    p = n; k++;
  }
  return g;
}
// darbe: kare s'de iner, birkaç kare titrer
function strike(f, s, bolt, pos) {
  const d = f - s;
  if (d >= 0 && d < 9 && d !== 4) { put(bolt, pos[0], pos[1], pos[2]); bolt.rotation.y = d * 0.15; }
  return d >= -1 && d < 10 ? Math.max(0, (d < 0 ? 0.25 : d === 0 ? 0.6 : 0.42 - d * 0.05)) : 0;
}

function makeBucket(E) {
  const g = E.group(null, [0, -50, 0]);
  const m = E.mat("#aab4c2", { map: E.T.metal("#aab4c2") });
  E.cyl(0.3, 0.4, 0.62, m, [0, -0.31, 0], { parent: g, seg: 20 });
  E.cyl(0.42, 0.42, 0.05, E.mat("#7d8796"), [0, -0.33, 0], { parent: g, seg: 20 });
  return g;
}
function makeTrophy(E, parent, pos) {
  const g = E.group(parent, pos), m = E.mat(GOLD, { emissive: "#8a6010", glow: 0.35 });
  E.box(0.34, 0.12, 0.34, E.mat("#3a2a22"), [0, 0, 0], { parent: g });
  E.cyl(0.05, 0.07, 0.22, m, [0, 0.12, 0], { parent: g, seg: 12 });
  E.cyl(0.2, 0.08, 0.3, m, [0, 0.32, 0], { parent: g, seg: 20 });
  for (const s of [-1, 1]) { const h = E.cyl(0.03, 0.03, 0.18, m, [s * 0.22, 0.5, 0], { parent: g, center: true, seg: 8 }); h.rotation.z = Math.PI / 2; }
  return g;
}
function makeUmbrella(E, col) {
  const g = E.group(null, [0, -50, 0]);
  E.cone(0.75, 0.38, E.mat(col), [0, 0, 0], { parent: g, seg: 10 });
  E.cyl(0.02, 0.02, 1.2, E.mat("#2b2f3a"), [0, -1.1, 0], { parent: g, seg: 6 });
  return g;
}
function darkCloud(E, x, y, z, s, seed) {
  const TH = E.THREE;
  const m = new TH.Mesh(new TH.PlaneGeometry(16 * s, 8 * s), E.flat("#ffffff", { map: E.T.cloud(seed + 40, "#6a7390", "#3c4360"), transparent: true, fog: false }));
  m.material.alphaTest = 0.5; m.userData.noink = true; m.userData.bill = true; m.position.set(x, y, z); E.scene.add(m); return m;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  E.ground(T.grass("#6fa04e"), 420, 0.25, [0, 0, 0]);
  // ---- park (x=0) ----
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1, x = side * (2.6 + rnd(i) * 9), z = -3 - rnd(i + 30) * 16;
    S.tree(x, z, { type: "pine", s: 1.1 + rnd(i + 60) * 0.7, col: "#3f7a46" });
  }
  for (let i = 0; i < 8; i++) S.tree(-12 + i * 3.4, -22 - rnd(i + 90) * 4, { type: "pine", s: 1.6, col: "#356b40" });
  S.hills({ z: -70, col: "#5f8f5a", n: 7 });
  // korucu kulübesi
  const cab = E.group(null, [-2.4, 0, -4.2], 0.25);
  const logs = E.mat("#ffffff", { map: T.planks("#8a5a36", 8) });
  E.box(3.2, 2.3, 2.6, logs, [0, 0, 0], { parent: cab });
  const roofM = E.mat("#ffffff", { map: T.roof("#5a4a3a") });
  for (const s of [-1, 1]) { const r = E.box(3.6, 0.12, 1.75, roofM, [0, 2.75, s * 0.72], { parent: cab, center: true }); r.rotation.x = s * 0.6; }
  E.box(0.9, 1.7, 0.06, E.mat("#5a3a22"), [-0.6, 0, 1.31], { parent: cab });
  E.box(0.8, 0.6, 0.06, E.mat("#ffe7a8", { emissive: "#ffd27a", glow: 0.6 }), [0.75, 1.1, 1.31], { parent: cab });
  E.label(T.sign("KORUCU", { bg: "#3f5a2e", fg: "#f4e3b0", size: 170 }), 1.1, 0.34, [0, 2.0, 1.35], { parent: cab });
  E.cyl(0.18, 0.18, 1.2, E.mat("#a8604a", { map: T.brick("#a8604a") }), [0.9, 2.6, -0.4], { parent: cab, seg: 10 });
  S.signpost(1.7, -1.6, "MİLLİ PARK", { bg: "#6b4a2a", fg: "#f4e3b0", border: "#3a2414", w: 1.5, h: 1.6 });
  S.fence(-6, -3.6, -1.2, { col: "#8a6a46" });
  // rekor köşesi
  R.rec = E.group(null, [0, 0, 0]);
  const easel = E.group(R.rec, [0.55, 0, -0.35]);
  for (const s of [-1, 1]) { const l = E.box(0.06, 1.5, 0.06, E.mat("#6b4428"), [s * 0.32, 0, 0], { parent: easel }); l.rotation.z = s * 0.08; }
  E.box(0.92, 1.12, 0.06, E.mat(GOLD, { emissive: "#7a5410", glow: 0.25 }), [0, 0.95, 0.04], { parent: easel });
  E.label(T.sign("DÜNYA\nREKORU", { bg: "#fbf3dc", fg: "#7a4a10", border: "#c9a24a", w: 768, h: 900, size: 170, sub: "7 yıldırım · 1 insan", subSize: 66 }), 0.8, 0.96, [0, 1.51, 0.08], { parent: easel });
  E.cyl(0.32, 0.36, 0.55, E.mat("#ffffff", { map: T.wood("#8a5a36") }), [-0.25, 0, 0.45], { parent: easel, seg: 14 });
  makeTrophy(E, easel, [-0.25, 0.55, 0.45]);
  R.rec.visible = false;
  // ---- göl (x=LX) ----
  E.box(60, 0.06, 40, E.mat("#ffffff", { map: (() => { const t = T.water("#3f6f9a").clone(); t.needsUpdate = true; t.repeat.set(8, 6); return t; })() }), [LX + 10, 0, -22]);
  E.box(30, 0.06, 20, E.mat("#ffffff", { map: (() => { const t = T.water("#3f6f9a").clone(); t.needsUpdate = true; t.repeat.set(4, 3); return t; })() }), [LX + 16.1, 0, 4]);
  E.box(3, 0.08, 6, E.mat("#ffffff", { map: T.sand("#c9b48a") }), [LX - 0.2, 0, 0]);
  for (let i = 0; i < 6; i++) E.sphere(0.25 + rnd(i + 5) * 0.2, E.mat("#8a8f99"), [LX + 0.9 + rnd(i) * 0.4, 0.05, -1 + i * 0.6], { seg: 8 }).scale.y = 0.5;
  for (let i = 0; i < 10; i++) S.tree(LX - 3 - rnd(i + 3) * 8, -4 - rnd(i + 8) * 14, { type: "pine", s: 1.3 + rnd(i + 40) * 0.6, col: "#3f7a46" });
  for (let i = 0; i < 8; i++) S.tree(LX + 2 + i * 4, -38 - rnd(i + 70) * 6, { type: "pine", s: 1.8, col: "#356b40" });
  E.cyl(0.15, 0.15, 0.5, E.mat("#6b4428"), [LX - 0.6, 0, 0.6], { seg: 10 });
  R.rod = E.group(null, [0, -50, 0]);
  { const a = [0, 0, 0], b = [1.25, 1.35, -0.25]; const len = Math.hypot(...b); const c = E.cyl(0.012, 0.022, len, E.mat("#6b4428"), [0, 0, 0], { parent: R.rod, center: true, seg: 6 }); c.position.set(b[0] / 2, b[1] / 2, b[2] / 2); c.quaternion.setFromUnitVectors(new TH.Vector3(0, 1, 0), new TH.Vector3(...b).normalize());
    const ln = E.cyl(0.004, 0.004, 1.55, E.mat("#f4f1ea"), [1.25, 0.6, -0.25], { parent: R.rod, center: true, seg: 4 }); ln.castShadow = false;
    E.sphere(0.06, E.mat("#e04848"), [1.25, -0.17, -0.25], { parent: R.rod, seg: 10 }); }
  // kara bulutlar
  R.clouds = [];
  for (let i = 0; i < 6; i++) R.clouds.push(darkCloud(E, -14 + i * 5.6, 9 + rnd(i) * 3, -14 - rnd(i + 4) * 6, 0.9 + rnd(i + 9) * 0.5, i));
  for (let i = 0; i < 4; i++) R.clouds.push(darkCloud(E, LX - 6 + i * 4.5, 6 + rnd(i + 3) * 2, -8 - rnd(i + 2) * 4, 0.7, i + 10));
  // ---- karakterler ----
  const rg = { shirt: "#6b8a46", pants: "#5a4a32", shoes: "#3a2a1e", hat: "fedora", hatCol: "#a07a46", hatBand: "#4a3a22", hair: "short", hairCol: "#5a4030", skin: "#f0c9a4", seed: 3, belt: "#4a3a22", buttons: "#e8c45a" };
  E.actor("rg", rg);
  E.actor("rgS", { ...rg, hat: null, hair: "spiky" });
  E.actor("p1", { shirt: "#d86a4a", pants: "#3b3f52", hair: "long", hairCol: "#2a1a14", skin: "#e9c3a0", seed: 11, dress: "#d86a4a" });
  E.actor("p2", { shirt: "#4a7ad8", pants: "#2b2f3a", hair: "short", hairCol: "#8a5a30", skin: "#f6dcc0", seed: 12, glasses: true });
  E.actor("p3", { shirt: "#e8b43a", pants: "#5a4a6a", hair: "bun", hairCol: "#3a2a20", skin: "#c98f66", seed: 13 }, { h: 1.7 });
  R.umb = [makeUmbrella(E, "#e04848"), makeUmbrella(E, "#3f7ad8"), makeUmbrella(E, "#f2c23a")];
  R.bolts = [makeBolt(E, 1), makeBolt(E, 2), makeBolt(E, 3)];
  R.bucket = makeBucket(E);
  R.soot = [E.sphere(0.06, E.mat("#1d1622"), [0, -50, 0], { seg: 10 }), E.sphere(0.06, E.mat("#1d1622"), [0, -50, 0], { seg: 10 })];
  R.soot.forEach((s) => (s.userData.base = [1.9, 0.6, 0.4]));
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(14,22,44,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = YEL; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#cfe0ff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = YEL, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#141024"; g.lineJoin = "round"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, 330 * k + size * 0.5 * k + 40 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 330 * k + size * 0.5 * k + 40 * k); }
  g.restore();
};
const boltIcon = (g, x, y, s, col) => { g.beginPath(); const P = [[0.15, -1], [-0.55, 0.12], [-0.02, 0.12], [-0.2, 1], [0.55, -0.2], [0.02, -0.2], [0.3, -1]]; P.forEach(([a, b], i) => (i ? g.lineTo(x + a * s, y + b * s) : g.moveTo(x + a * s, y + b * s))); g.closePath(); g.fillStyle = col; g.fill(); g.lineWidth = s * 0.12; g.strokeStyle = "#141024"; g.stroke(); };
// sol üstte sayaç rozeti
const counter = (n, pop) => (g, w) => {
  if (!n) return; const k = w / 1080, x = 60 * k, y = 120 * k, sc = 1 + 0.25 * pop;
  g.save(); g.translate(x + 120 * k, y + 60 * k); g.scale(sc, sc); g.translate(-(x + 120 * k), -(y + 60 * k));
  g.fillStyle = "rgba(14,22,44,.85)"; g.beginPath(); g.roundRect(x, y, 240 * k, 120 * k, 26 * k); g.fill();
  g.lineWidth = 5 * k; g.strokeStyle = YEL; g.stroke();
  boltIcon(g, x + 62 * k, y + 60 * k, 42 * k, YEL);
  g.font = `900 ${80 * k}px CizgiFont, Nunito, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 10 * k; g.strokeStyle = "#141024";
  g.strokeText(`× ${n}`, x + 160 * k, y + 64 * k); g.fillStyle = "#fff"; g.fillText(`× ${n}`, x + 160 * k, y + 64 * k); g.restore();
};
const rain = (f, a = 1) => (g, w, h) => {
  const k = w / 1080; g.save(); g.globalAlpha = 0.45 * a; g.strokeStyle = "#cfe0ff"; g.lineWidth = 4 * k; g.beginPath();
  for (let i = 0; i < 90; i++) { const x = ((rnd(i) * w + f * 9 * k) % (w + 200 * k)) - 100 * k, y = ((rnd(i + 99) * h + f * 46 * k * (0.8 + rnd(i + 3) * 0.4)) % h); g.moveTo(x, y); g.lineTo(x - 16 * k, y + 60 * k); }
  g.stroke(); g.restore();
};

function reset() {
  R.bolts.forEach(hide); R.umb.forEach(hide); hide(R.bucket); hide(R.rod); R.soot.forEach(hide);
  R.rec.visible = false;
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const STORM = { ...X.LIGHTS.day, sun: "#c8d4ff", sunI: 1.0, el: 60, sky: "#a8b8dc", ground: "#4a5a4a", hemiI: 0.95, amb: 0.22, top: "#26304f", bot: "#71809f", fog: "#5c6a8c", fogNear: 25, fogFar: 120, card: "#e6ecff", sat: 1.02, con: 1.1, vig: 0.42, warm: -0.03 };
  let cam, light = STORM, dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, 0], tint = "rgba(30,50,120,0.10)", count = 0, pop = 0, shk = [0, 0, 0];
  reset();
  R.clouds.forEach((c) => (c.visible = true));
  const hit = (s, bolt, pos, amp = 0.12) => { const fl = strike(f, s, bolt, pos); flash = Math.max(flash, fl); const k = E.shake(f, s, amp, 12); shk = shk.map((v, i) => v + k[i]); return f >= s; };

  switch (sh.name) {
    case "hook": {
      const s = WF(E, 5) - 2, hitd = hit(s, R.bolts[0], [0, 2.05, 0.05], 0.18);
      A.push({ id: hitd ? "rgS" : "rg", pos: [0, 0, 0], st: st(3, { face: hitd ? "shock" : f > s - 14 ? "scared" : "neutral", arms: hitd ? "up" : "hang", look: hitd ? 0 : -0.3 }) });
      if (hitd) FX.push({ kind: "puff", t: X.clamp((f - s) / 20), pos: [0.1, 1.9, 0.2], size: 1.0 });
      cam = E.camAt(f, [{ f: 0, pos: [0.5, 0.9, 4.8], look: [0, 2.1, 0], fov: 50 }, { f: 71, pos: [0.3, 1.0, 4.0], look: [0, 1.95, 0], fov: 50 }]);
      focusPt = [0, 0, 0];
      const a = 1, p = X.back(X.span(f, s, s + 8));
      ov.push(big("7", a, "kez yıldırım", YEL, 260 + 40 * (f >= s ? 1 - p : 0)));
      break;
    }
    case "survive": {
      A.push({ id: "rgS", pos: [0, 0, 0], st: st(3, { face: f < 92 ? "shock" : "grin", arms: f < 92 ? "up" : "cheer", look: 0 }) });
      FX.push({ kind: "puff", t: 0.35 + 0.25 * Math.sin(f / 9), pos: [-0.45, 0.5, 0.25], size: 0.9 });
      FX.push({ kind: "puff", t: 0.45 + 0.25 * Math.sin(f / 7 + 1), pos: [0.5, 0.7, 0.2], size: 0.8 });
      FX.push({ kind: "stars", t: f / 30, pos: [0, 2.05, 0.2], size: 0.8 });
      cam = E.camAt(f, [{ f: 72, pos: [0.1, 1.2, 4.0], look: [0, 1.5, 0], fov: 46 }, { f: 133, pos: [0.0, 1.2, 3.7], look: [0, 1.52, 0], fov: 46 }]);
      ov.push(big("hayatta!", X.span(f, WF(E, 9) - 2, WF(E, 9) + 6), "7 seferde de", "#ffffff", 130));
      count = 7;
      break;
    }
    case "name": {
      light = "day"; tint = null;
      R.clouds.forEach((c) => (c.visible = false));
      A.push({ id: "rg", pos: [0, 0, 0], st: st(3, { face: "happy", arms: "hip", look: 0 }) });
      cam = E.camAt(f, [{ f: 134, pos: [0.15, 1.5, 2.3], look: [0, 1.45, 0], fov: 42 }, { f: 156, pos: [0.15, 1.5, 2.0], look: [0, 1.45, 0], fov: 42 }]);
      dof = { focus: [0, 1.4, 0], amount: 5 };
      ov.push(card("Roy Sullivan", "park korucusu · ABD"));
      break;
    }
    case "park": {
      light = "day"; tint = null;
      R.clouds.forEach((c) => (c.visible = false));
      const x = X.lerp(-0.9, 0.2, X.smooth(X.span(f, 157, 225)));
      A.push({ id: "rg", pos: [x, 0, 0.3], st: st(3, { face: "happy", arms: f > 200 ? "wave" : "hang", legs: f < 222 ? "walk" : "stand", phase: f / 22, look: 0.3 }) });
      cam = E.camAt(f, [{ f: 157, pos: [0.2, 2.2, 8.0], look: [-0.4, 1.4, -1.8], fov: 50 }, { f: 230, pos: [0.1, 1.9, 7.0], look: [-0.3, 1.4, -1.8], fov: 50 }]);
      focusPt = [0, 0, -1];
      ov.push(big("MİLLİ PARK", X.span(f, WF(E, 15) - 2, WF(E, 15) + 6), "korucu", "#bfe6a0", 120));
      break;
    }
    case "toe": {
      const s = WF(E, 19) - 2, hitd = hit(s, R.bolts[1], [0.14, 0.05, 0.12]);
      A.push({ id: "rg", pos: [0, 0, 0], st: st(3, { face: hitd ? (f > WF(E, 27) ? "nervous" : "shock") : "neutral", arms: hitd ? "shrug" : "hang", look: 0.4 }) });
      if (hitd) {
        FX.push({ kind: "puff", t: (f - s) % 30 / 30, pos: [0.2, 0.2 + ((f - s) % 30) / 60, 0.25], size: 0.45 });
        if (f > WF(E, 27) - 2) FX.push({ kind: "exclaim", pos: [0.55, 2.2, 0.1], size: 0.45 * X.back(X.span(f, WF(E, 27) - 2, WF(E, 27) + 6)) });
      }
      cam = E.camAt(f, [{ f: 231, pos: [0.5, 1.0, 4.2], look: [0.05, 1.45, 0], fov: 46 }, { f: 362, pos: [0.4, 0.9, 3.7], look: [0.1, 1.4, 0], fov: 46 }]);
      ov.push(big("1942", X.span(f, WF(E, 20) - 2, WF(E, 20) + 6), "ayak başparmağı", YEL, 150));
      count = hitd ? 1 : 0; pop = 1 - X.span(f, s, s + 8);
      break;
    }
    case "brows": {
      const s = 365, hitd = hit(s, R.bolts[0], [0, 1.95, 0.08]);
      A.push({ id: "rg", pos: [0, 0, 0], st: st(3, { face: hitd ? "shock" : "neutral", arms: "hang", look: 0, headTilt: 0, tilt: 0 }) });
      if (f >= WF(E, 30) - 3) {
        const k = X.back(X.span(f, WF(E, 30) - 3, WF(E, 30) + 3));
        R.soot.forEach((o, i) => { put(o, (i ? 1 : -1) * 0.118, 1.515, 0.12); o.scale.set(1.9 * k + 0.001, 0.55 * k + 0.001, 0.4); });
        FX.push({ kind: "puff", t: ((f - 375) % 24) / 24, pos: [0.05, 1.78 + ((f - 375) % 24) / 80, 0.2], size: 0.35 });
      }
      cam = E.camAt(f, [{ f: 363, pos: [0.05, 1.45, 2.3], look: [0, 1.66, 0], fov: 40 }, { f: 411, pos: [0.05, 1.45, 2.05], look: [0, 1.68, 0], fov: 40 }], { creep: 0.04 });
      ov.push(big("1969", X.span(f, 366, 372), "kaşlar", YEL, 130));
      count = hitd ? 2 : 1; pop = 1 - X.span(f, s, s + 8);
      break;
    }
    case "shoulder": {
      const s = 414, hitd = hit(s, R.bolts[2], [0.3, 1.2, 0.1]);
      A.push({ id: "rg", pos: [0, 0, 0], st: st(3, { face: hitd ? "scared" : "nervous", arms: hitd ? "facepalm" : "hang", look: 0.6 }) });
      if (hitd) FX.push({ kind: "puff", t: ((f - s) % 22) / 22, pos: [0.5, 1.1 + ((f - s) % 22) / 60, 0.2], size: 0.4 });
      cam = E.camAt(f, [{ f: 412, pos: [0.5, 1.3, 3.4], look: [0.1, 1.55, 0], fov: 44 }, { f: 446, pos: [0.45, 1.3, 3.1], look: [0.1, 1.58, 0], fov: 44 }]);
      ov.push(big("1970", X.span(f, 415, 421), "omuz", YEL, 130));
      count = hitd ? 3 : 2; pop = 1 - X.span(f, s, s + 8);
      break;
    }
    case "hair": {
      const s1 = 449, s2 = WF(E, 36) - 2, bk = WF(E, 38) - 3;
      hit(s1, R.bolts[0], [0, 2.0, 0.06]); hit(s2, R.bolts[1], [0, 2.0, 0.06]);
      const fire = f >= s1 && f < bk + 4;
      A.push({ id: "rgS", pos: [0, 0, 0], st: st(3, { face: f >= bk + 4 ? "smug" : "scared", arms: f >= bk ? "up" : "shrug", look: 0, sweat: fire }) });
      if (fire) FX.push({ kind: "burst", pos: [0, 2.02, 0.12], size: 0.62 + 0.06 * Math.sin(f * 1.3), opt: { col: f % 4 < 2 ? "#ff8a2a" : "#ffb02e" } });
      if (f >= bk) { const y = X.lerp(3.4, 1.98, X.easeIn(X.span(f, bk, bk + 5))); put(R.bucket, 0, y, 0.12); }
      if (f >= bk + 5) FX.push({ kind: "sweat", pos: [0.42, 1.55 - ((f - bk) % 14) / 40, 0.2], size: 0.22 });
      cam = E.camAt(f, [{ f: 447, pos: [0.1, 1.35, 3.6], look: [0, 1.75, 0], fov: 44 }, { f: 516, pos: [0.1, 1.35, 3.3], look: [0, 1.75, 0], fov: 44 }]);
      ov.push(big(f < s2 ? "1972" : "1973", X.span(f, 450, 456), "saçlar · 2 kez", YEL, 130));
      count = f >= s2 ? 5 : f >= s1 ? 4 : 3; pop = Math.max(1 - X.span(f, s1, s1 + 8), 1 - X.span(f, s2, s2 + 8));
      break;
    }
    case "lake": case "strike7": {
      const s = WF(E, 48) - 2, hitd = sh.name === "strike7" && hit(s, R.bolts[0], [LX, 2.02, 0.06], 0.25);
      put(R.rod, LX + 0.55, 1.0, 0.02);
      R.rod.rotation.z = 0.04 * Math.sin(f / 15);
      const look = sh.name === "strike7" && !hitd;
      A.push({ id: hitd ? "rgS" : "rg", pos: [LX, 0, 0], st: st(3, { face: hitd ? "shock" : look ? "nervous" : "happy", arms: hitd ? "up" : "present", look: look ? -0.5 : 0.6, sweat: look }) });
      if (look) FX.push({ kind: "question", pos: [LX - 0.5, 2.35, 0.1], size: 0.4 });
      if (hitd) FX.push({ kind: "puff", t: X.clamp((f - s) / 18), pos: [LX + 0.1, 1.9, 0.2], size: 1.1 });
      if (sh.name === "lake") cam = E.camAt(f, [{ f: 517, pos: [LX + 1.2, 2.0, 6.0], look: [LX + 0.8, 1.6, -1], fov: 48 }, { f: 585, pos: [LX + 0.9, 1.7, 4.8], look: [LX + 0.6, 1.5, -1], fov: 48 }]);
      else cam = E.camAt(f, [{ f: 586, pos: [LX + 0.3, 1.0, 4.6], look: [LX + 0.2, 2.0, 0], fov: 50 }, { f: 630, pos: [LX + 0.3, 1.1, 4.2], look: [LX + 0.2, 1.9, 0], fov: 50 }]);
      focusPt = [LX, 0, 0];
      R.clouds.slice(6).forEach((c, i) => { c.position.x = LX - 6 + i * 4.5 + (sh.name === "lake" ? (f - 517) * 0.02 : 1.4); });
      if (sh.name === "lake") ov.push(big("1977", X.span(f, WF(E, 41) - 2, WF(E, 41) + 6), "balık tutarken", YEL, 150));
      else if (hitd) ov.push(big("7!", 1, "", YEL, 230 + 60 * (1 - X.back(X.span(f, s, s + 8)))));
      count = hitd ? 7 : 6; pop = hitd ? 1 - X.span(f, s, s + 10) : 0;
      break;
    }
    case "record": {
      light = "day"; tint = null;
      R.clouds.forEach((c) => (c.visible = false));
      R.rec.visible = true;
      A.push({ id: "rgS", pos: [-0.45, 0, 0.1], st: st(3, { face: f > 690 ? "grin" : "happy", arms: f > 650 ? "present" : "hip", look: 0.5 }) });
      if (f > 690) FX.push({ kind: "sparkle", t: f / 30, pos: [0.55, 1.75, 0.2], size: 1.0 });
      cam = E.camAt(f, [{ f: 631, pos: [0.25, 1.3, 4.5], look: [0.05, 1.5, 0], fov: 46 }, { f: 764, pos: [0.2, 1.3, 4.1], look: [0.05, 1.5, 0], fov: 46 }]);
      focusPt = [0, 0, 0];
      ov.push(big("DÜNYA REKORU", X.span(f, WF(E, 49) - 2, WF(E, 49) + 6), "en çok yıldırım çarpan insan", GOLD, 115));
      count = 7;
      break;
    }
    case "crowd": {
      const k = X.smooth(X.span(f, WF(E, 64) - 6, 880));
      const ppl = [["p1", -1, 0.0, 1.2], ["p2", 1, 0.25, 1.0], ["p3", 1, -0.6, 1.1]];
      A.push({ id: "rgS", pos: [0, 0, 0], st: st(3, { face: k > 0.5 ? "sad" : "neutral", arms: k > 0.6 ? "shrug" : "hang", look: 0 }) });
      ppl.forEach(([id, side, dz, sp], i) => {
        const x = side * (0.85 + i * 0.15 + k * 1.7 * sp), z = -0.4 + dz;
        A.push({ id, pos: [x, 0, z], st: st(11 + i, { face: "scared", arms: "holdR", legs: k > 0.02 && k < 0.98 ? "run" : "stand", phase: f / 14 + i * 0.3, look: -side, sweat: true }), flip: side > 0 });
        put(R.umb[i], x + (side > 0 ? -0.15 : 0.15) * (id === "p3" ? 0.8 : 1), id === "p3" ? 1.85 : 2.35, z + 0.05);
      });
      cam = E.camAt(f, [{ f: 765, pos: [0.0, 1.8, 6.4], look: [0, 1.3, -0.3], fov: 52 }, { f: 894, pos: [0.0, 1.7, 5.4], look: [0, 1.3, -0.3], fov: 52 }]);
      focusPt = [0, 0, 0];
      if (f > 840) FX.push({ kind: "question", pos: [0.45, 2.3, 0.1], size: 0.35 });
      ov.push(rain(f));
      ov.push(big("uzak dur!", X.span(f, WF(E, 66) - 2, WF(E, 66) + 6), "", "#ffffff", 120));
      count = 7;
      break;
    }
    case "end": {
      hit(898, R.bolts[1], [2.3, 0, -5.5], 0.06); hit(944, R.bolts[2], [-2.6, 0, -6.5], 0.06);
      A.push({ id: "rgS", pos: [0, 0, 0], st: st(3, { face: "grin", arms: "wave", phase: f / 30, look: 0 }) });
      cam = E.camAt(f, [{ f: 895, pos: [0.0, 1.45, 4.3], look: [0, 1.5, -1], fov: 48 }, { f: 994, pos: [0.0, 1.4, 3.9], look: [0, 1.5, -1], fov: 48 }]);
      focusPt = [0, 0, 0];
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 897, 905), f >= WF(E, 71) - 2 ? "Her gün." : "", "#ffffff", 100));
      count = 7;
      break;
    }
  }
  cam.pos = cam.pos.map((v, i) => v + shk[i]);
  const tn = tint, cnt = count, pp = pop, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); counter(cnt, pp)(g, w, h); };
  return { cam, light, dof, actors: A, fx: FX, flash, flashCol: "#fffbe0", overlay: fin, focusPt };
}
