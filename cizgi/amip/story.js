// Beyin Yiyen Amip — PMDARWIN (Barış anlatıcı sesi)
export const meta = { fps: 30 };

// Çekimler cümle cümle: sınırlar words.json'daki cümle sonlarından (. ? !) hesaplanır.
const NAMES = ["hook", "swim", "towel", "micro", "climb", "stat", "rare", "drink", "stomach", "end"];
let SHOTS = null, END = 1100, SW = []; // SW: her cümlenin ilk kelime indeksi
function buildShots(E) {
  const fps = E.fps, w = E.words; SHOTS = [[0, NAMES[0]]]; SW = [0];
  for (let i = 0; i < w.length - 1 && SHOTS.length < NAMES.length; i++)
    if (/[.?!…]["']?$/.test(w[i].w)) { SHOTS.push([Math.round(w[i + 1].s * fps) - 3, NAMES[SHOTS.length]]); SW.push(i + 1); }
  while (SHOTS.length < NAMES.length) SHOTS.push([SHOTS[SHOTS.length - 1][0] + 90, NAMES[SHOTS.length]]);
  END = w.length ? Math.ceil((w[w.length - 1].e + 0.7) * fps) : 1100;
}
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], i, f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => (E.words.length ? Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps) : 0);

const TEAL = "#3fe0c5";
const MX = 100, HX = 200, CX = 300, KX = 400, SX = 500, NX = 600; // mikroskop, kafa kesiti, koridor, mutfak, mide, burun
let R = {};

function makeAmoeba(E, s = 1, col = "#7ff0d8") {
  const g = E.group(null, [0, -50, 0]);
  const body = E.mat(col, { emissive: "#1fae96", glow: 0.35, transparent: true, opacity: 0.82 });
  const b = E.sphere(0.5 * s, body, [0, 0, 0], { parent: g, seg: 22 }); b.scale.set(1.25, 0.9, 0.55);
  g.userData.pods = [];
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; const p = E.sphere(0.24 * s, body, [Math.cos(a) * 0.5 * s, Math.sin(a) * 0.38 * s, 0], { parent: g, seg: 14 }); p.scale.set(1.3, 1, 0.6); p.userData.a = a; g.userData.pods.push(p); }
  E.sphere(0.16 * s, E.mat("#2d6f7a", { emissive: "#0d3a44", glow: 0.4 }), [0.05 * s, 0.04 * s, 0.14 * s], { parent: g, seg: 14 });
  E.sphere(0.07 * s, E.mat("#123c44"), [0.07 * s, 0.06 * s, 0.24 * s], { parent: g, seg: 10 });
  for (const [x, y] of [[-0.28, 0.12], [0.3, -0.14], [-0.12, -0.2]]) E.sphere(0.05 * s, E.mat("#d8fff6", { emissive: "#9ff5e3", glow: 0.6 }), [x * s, y * s, 0.2 * s], { parent: g, seg: 8 });
  g.userData.s = s;
  return g;
}
function wob(g, f, k = 1) {
  const s = g.userData.s;
  g.userData.pods.forEach((p, i) => { const r = (0.5 + 0.12 * Math.sin(f / 9 * k + i * 1.7)) * s; p.position.set(Math.cos(p.userData.a + 0.05 * Math.sin(f / 20)) * r, Math.sin(p.userData.a) * r * 0.76, 0); });
  g.rotation.z = 0.12 * Math.sin(f / 25 * k);
}
function makeNose(E, x, y, z, s = 1) {
  const g = E.group(null, [x, y, z]); const sk = E.mat("#f0c39e"), dk = E.mat("#7a3e3a");
  const face = E.sphere(2.6 * s, E.mat("#f6d2b2"), [0, 0.4 * s, -3.0 * s], { parent: g, seg: 32 }); face.scale.set(1, 1.1, 0.6);
  const bridge = E.cyl(0.32 * s, 0.5 * s, 1.5 * s, sk, [0, 0.4 * s, -1.0 * s], { parent: g, seg: 18 }); bridge.rotation.x = 0.45;
  const tip = E.sphere(0.6 * s, sk, [0, 0, -0.55 * s], { parent: g, seg: 24 }); tip.scale.set(1, 0.85, 1);
  for (const sx of [-1, 1]) { const w = E.sphere(0.36 * s, sk, [sx * 0.55 * s, -0.18 * s, -0.75 * s], { parent: g, seg: 16 }); w.scale.set(0.9, 0.75, 0.9);
    const n = E.sphere(0.16 * s, dk, [sx * 0.3 * s, -0.36 * s, -0.42 * s], { parent: g, seg: 14 }); n.scale.set(1.3, 0.6, 1); }
  // gözler (sevimli, büyük burun)
  for (const sx of [-1, 1]) { E.sphere(0.32 * s, E.mat("#ffffff"), [sx * 1.0 * s, 1.3 * s, -1.65 * s], { parent: g, seg: 16 }); E.sphere(0.16 * s, E.mat("#1d1622"), [sx * 0.98 * s, 1.28 * s, -1.36 * s], { parent: g, seg: 12 }); }
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.grass("#6fae4e"), 500, 0.25);
  // ---- göl (x=0) ----
  E.plane(40, 5, E.mat("#ffffff", { map: (() => { const t = T.sand("#ecd39a").clone(); t.needsUpdate = true; t.repeat.set(10, 1.5); return t; })() }), [0, 0.01, 1.5], { rot: [-Math.PI / 2, 0, 0], noShadow: true });
  const wt = T.water("#2fb3b0").clone(); wt.needsUpdate = true; wt.repeat.set(12, 8); R.waterTex = wt;
  E.plane(90, 60, E.mat("#ffffff", { map: wt }), [0, 0.03, -31], { rot: [-Math.PI / 2, 0, 0], noShadow: true });
  for (let i = 0; i < 9; i++) S.tree(-28 + i * 7, -40 - (i % 3) * 4, { s: 1.6, col: "#4f9a46" });
  S.hills({ z: -90, col: "#6fa45a" }); S.clouds();
  S.tree(-3.5, 2.6, { s: 1.1 }); S.bush(3.6, 2.8, 1.0);
  R.towel = E.box(1.4, 0.03, 0.7, E.mat("#ff6f61", { map: T.sign("", { bg: "#ff6f61", border: null }) }), [1.3, 0.02, 1.6]);
  R.umb = E.group(null, [2.3, 0, 1.2]); E.cyl(0.04, 0.04, 2.2, E.mat("#f4efe4"), [0, 0, 0], { parent: R.umb, seg: 8 }); E.cone(1.1, 0.5, E.mat("#ffcf4a"), [0, 2.0, 0], { parent: R.umb, seg: 10 });
  // ---- mikroskop görüntüsü (x=MX) ----
  E.box(14, 10, 0.2, E.mat("#0d2a3a"), [MX, -1, -3]);
  const lens = E.cyl(2.0, 2.0, 0.05, E.mat("#a8efe6", { emissive: "#3aa9a0", glow: 0.5 }), [MX, 2, -2.85], { seg: 48 }); lens.rotation.x = Math.PI / 2;
  E.cyl(2.2, 2.2, 0.06, E.mat("#2b3f55"), [MX, 2, -2.9], { seg: 48 }).rotation.x = Math.PI / 2;
  R.micro = []; for (let i = 0; i < 5; i++) R.micro.push(makeAmoeba(E, i === 0 ? 1.3 : 0.55));
  // ---- kafa kesiti (x=HX) ----
  const hd = E.sphere(1.0, E.mat("#f2c9a8"), [HX, 2.1, -1], { seg: 32 }); hd.scale.set(1, 1.05, 0.3);
  const nose = E.cone(0.28, 0.55, E.mat("#e9b893"), [HX + 1.08, 1.58, -0.98], { seg: 16 }); nose.rotation.z = -Math.PI / 2 - 0.35;
  E.cyl(0.32, 0.38, 0.8, E.mat("#f2c9a8"), [HX - 0.05, 0.75, -1], { seg: 16 }).scale.z = 0.4;
  const cav = E.sphere(0.24, E.mat("#d98b82"), [HX + 0.72, 1.72, -0.77], { seg: 16 }); cav.scale.set(1.5, 0.6, 0.15);
  R.brain = E.sphere(0.62, E.mat("#f6a9c4"), [HX - 0.08, 2.42, -0.67], { seg: 28 }); R.brain.scale.set(1.18, 0.78, 0.32);
  for (let i = 0; i < 6; i++) { const c = E.cyl(0.02, 0.02, 0.5, E.mat("#e07aa0"), [HX - 0.6 + i * 0.22, 2.42, -0.47], { seg: 6, center: true }); c.rotation.z = 0.5 + i * 0.4; c.scale.y = 0.7; }
  R.path = [[HX + 0.95, 1.7], [HX + 0.62, 1.86], [HX + 0.4, 2.0], [HX + 0.25, 2.15], [HX + 0.12, 2.3]];
  for (let i = 0; i < R.path.length - 1; i++) {
    const [a, b] = [R.path[i], R.path[i + 1]], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
    const c = E.cyl(0.025, 0.025, L, E.mat("#ffe27a", { emissive: "#ffc93a", glow: 0.9 }), [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, -0.62], { seg: 6, center: true }); c.rotation.z = Math.atan2(dy, dx) - Math.PI / 2;
  }
  R.dots = []; for (let i = 0; i < 6; i++) R.dots.push(E.sphere(0.05, E.mat(TEAL, { emissive: "#18d7b8", glow: 1.6 }), [0, -50, 0], { seg: 10 }));
  R.spots = []; for (let i = 0; i < 5; i++) R.spots.push(E.sphere(0.09, E.mat("#7a3e6e"), [HX - 0.45 + i * 0.2, 2.35 + 0.12 * Math.sin(i * 2.1), -0.44], { seg: 12 }));
  // ---- hastane koridoru (x=CX) ----
  S.room({ x: CX, z: -4, w: 4.4, d: 18, h: 3.2, wall: T.plaster("#cfe6df"), floor: T.tiles("#e8eef0", "#b9cbd0", 6), window: false, door: true });
  for (let i = 0; i < 4; i++) { S.door(CX - 2.18, -2 - i * 3.5, { rotY: Math.PI / 2, col: "#7fa7b8" }); E.box(1.4, 0.06, 0.4, E.mat("#fff7d6", { emissive: "#fff0b0", glow: 1.2 }), [CX, 3.15, -1 - i * 3.5]); }
  const bed = E.group(null, [CX + 1.2, 0, -3.5], -0.3); E.box(0.9, 0.12, 2.0, E.mat("#f4f6f8"), [0, 0.7, 0], { parent: bed }); E.box(0.9, 0.5, 0.06, E.mat("#9fb4bf"), [0, 0.7, -0.98], { parent: bed });
  for (const [a, b] of [[-0.4, -0.9], [0.4, -0.9], [-0.4, 0.9], [0.4, 0.9]]) E.cyl(0.03, 0.03, 0.7, E.mat("#9fb4bf"), [a, 0, b], { parent: bed, seg: 6 });
  // ---- mutfak (x=KX) ----
  S.room({ x: KX, w: 7, d: 6, h: 3.2, wall: T.wallpaper("#f6e3b8", "#efd59e", "stripe"), floor: T.planks("#b9824f"), window: true, door: false });
  S.counter(KX + 1.6, -2.4, { w: 3 }); S.shelf(KX - 2.4, -2.7, {});
  E.cyl(0.1, 0.1, 0.4, E.mat("#cfe9ff", { transparent: true, opacity: 0.6 }), [KX + 1.0, 1.18, -2.4], { seg: 12 });
  // ---- mide şeması (x=SX) ----
  E.box(12, 10, 0.2, E.mat("#2a4a6a"), [SX, -1, -2.5]);
  const torso = E.sphere(1.0, E.mat("#5aa0d8"), [SX, 1.6, -1.2], { seg: 28 }); torso.scale.set(0.85, 1.25, 0.3);
  E.sphere(0.5, E.mat("#f2c9a8"), [SX, 3.35, -1.2], { seg: 24 }).scale.z = 0.5;
  E.cyl(0.07, 0.07, 1.3, E.mat("#f0b0a8"), [SX - 0.05, 2.2, -0.86], { seg: 8, center: true });
  R.stomach = E.sphere(0.42, E.mat("#f48fa0"), [SX - 0.12, 1.35, -0.86], { seg: 24 }); R.stomach.scale.set(1.2, 0.85, 0.3);
  R.drop = E.sphere(0.09, E.mat("#7fd3ff", { emissive: "#3fa9ff", glow: 0.6 }), [0, -50, 0], { seg: 12 });
  R.sAm = []; for (let i = 0; i < 3; i++) R.sAm.push(makeAmoeba(E, 0.22));
  // ---- dev burun (x=NX) ----
  R.nose = makeNose(E, NX, 1.6, -0.4, 1);
  R.clip = E.group(null, [NX, 50, -0.4]);
  const cm = E.mat("#2f7fe0");
  for (const sx of [-1, 1]) { const pd = E.sphere(0.17, cm, [sx * 0.9, -0.2, -0.65], { parent: R.clip, seg: 14 }); pd.scale.set(0.6, 1, 1.2); }
  const arch = new E.THREE.Mesh(new E.THREE.TorusGeometry(0.92, 0.05, 8, 28, Math.PI), cm); arch.position.set(0, -0.2, 0.12); E.add(arch, R.clip);
  R.hookAm = makeAmoeba(E, 1.0); R.endAm = makeAmoeba(E, 0.35);
  // ---- karakterler ----
  const me = { skin: "#f2cfae", hair: "short", hairCol: "#3a2a20", seed: 4 };
  E.actor("swim", { ...me, shirt: "#ff6f61", pants: "#f2cfae", shoes: "#f2cfae", glasses: true });
  E.actor("me", { ...me, shirt: "#3f8fd0", pants: "#3b3f52" });
  E.actor("doc", { skin: "#e9c3a0", jacket: "#f4f6f8", shirt: "#8fb5c9", pants: "#4a5560", hair: "bun", hairCol: "#2a1d16", glasses: true, seed: 11 });
  const cols = ["#ff6f61", "#ffcf4a", "#5ad08a", "#7b5ac9", "#3f8fd0", "#ff9ec0", "#f4efe4", "#c2843a", "#3fbfbf"];
  for (let i = 0; i < 9; i++) E.actor("p" + i, { shirt: cols[i], pants: cols[i], hair: ["short", "long", "bun", "part", "spiky"][i % 5], hairCol: ["#2a1d16", "#7a4a2a", "#c9a24a"][i % 3], glasses: i % 3 === 0, seed: 30 + i * 5, skin: ["#fbf5ea", "#e9c3a0", "#f6dcc0", "#c98f66"][i % 4] });
}

// ---------- 2D katman ----------
const fit = (g, txt, size, k, maxW) => { let s = size; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; while (g.measureText(txt).width > maxW && s > 40) { s -= 6; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; } return s; };
const big = (txt, a = 1, sub = "", col = TEAL, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  fit(g, txt, size, k, w * 0.9); g.lineJoin = "round"; g.lineWidth = 16 * k; g.strokeStyle = "#0b1a20"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 455 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 455 * k); }
  g.restore();
};
const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k; g.save();
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; const tw = g.measureText(title).width; g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; const sw = g.measureText(sub).width;
  const pw = Math.max(420 * k, Math.max(tw, sw) + 70 * k);
  g.fillStyle = "rgba(8,24,28,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill(); g.fillStyle = TEAL; g.fillRect(x, y, 10 * k, 112 * k);
  g.textBaseline = "middle"; g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#c9fff3"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const line = (txt, y, col, size, a = 1) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  fit(g, txt, size, k, w * 0.9); g.lineJoin = "round"; g.lineWidth = 18 * k; g.strokeStyle = "#0b1a20"; g.strokeText(txt, w / 2, y * k); g.fillStyle = col; g.fillText(txt, w / 2, y * k); g.restore();
};
const tint = (col, a) => (g, w, h) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, w, h); g.restore(); };
const lensRing = (a) => (g, w, h) => { // büyüteç çerçevesi: kenarları karart, ortada yuvarlak pencere
  g.save(); g.globalAlpha = a; g.fillStyle = "#06141c"; g.beginPath(); g.rect(0, 0, w, h); g.arc(w / 2, h * 0.47, w * 0.46, 0, Math.PI * 2, true); g.fill("evenodd");
  g.lineWidth = 22 * w / 1080; g.strokeStyle = "#2b3f55"; g.beginPath(); g.arc(w / 2, h * 0.47, w * 0.46, 0, Math.PI * 2); g.stroke(); g.restore();
};
const all = (...fs) => (g, w, h, s) => fs.forEach((fn) => fn && fn(g, w, h, s));

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
function reset() {
  [...R.micro, ...R.sAm, R.hookAm, R.endAm].forEach((a) => { a.visible = false; a.position.y = -50; a.scale.setScalar(1); });
  R.dots.forEach((d) => (d.position.y = -50)); R.spots.forEach((s) => s.scale.setScalar(0.001));
  R.drop.position.y = -50; R.clip.position.y = 50; R.stomach.material.color.set("#f48fa0");
}

export function frame(f, E) {
  if (!SHOTS) buildShots(E);
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const sw = (k) => WF(E, SW[sh.i] + k); // bu cümlenin k. kelimesi
  let cam, light = "day", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = null;
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  reset();
  R.waterTex.offset.set(f * 0.0015, f * 0.001);

  switch (sh.name) {
    case "hook": {
      const p = X.back(X.span(f, 0, 14));
      put(R.hookAm, NX + 0.05, 1.22 + 0.05 * Math.sin(f / 12), 0.9, 0, 0.35 + 0.33 * p); wob(R.hookAm, f, 1.4);
      cam = E.camAt(f, [{ f: 0, pos: [NX, 1.2, 5.6], look: [NX, 1.75, 0], fov: 46 }, { f: sh.f1, pos: [NX, 1.25, 4.9], look: [NX, 1.75, 0], fov: 44 }]);
      dof = { focus: [NX, 1.3, 0.9], amount: 3 };
      overlay = all(tint("#0a3a40", 0.12), line("BEYİN YİYEN", 300, TEAL, 140), line("AMİP", 450, "#ffffff", 170, X.span(f, 4, 10)));
      if (f < 10) flash = 0.4 * (1 - f / 10);
      break;
    }
    case "swim": {
      const mid = sw(4); // "burnuna"
      if (f < mid - 4) { // dalış
        const d = X.span(f, sh.f0 + 4, sh.f0 + 44);
        const x = X.lerp(0.75, 0.9, d), y = d < 1 ? X.lerp(0.0, -1.05, X.easeIn(d)) + 0.7 * Math.sin(d * Math.PI) : -1.05 + 0.05 * Math.sin(f / 8);
        A.push({ id: "swim", pos: [x, y, d > 0.6 ? -1.5 : X.lerp(0.4, -1.5, d / 0.6)], roll: d < 1 ? -0.9 * Math.sin(d * Math.PI) : 0, st: st(2, { face: d >= 1 ? "happy" : "wow", arms: d < 1 && d > 0 ? "up" : "hang", legs: d >= 1 ? "walk" : "stand", phase: f / 30 }) });
        if (f > sh.f0 + 38 && f < sh.f0 + 56) FX.push({ kind: "puff", pos: [1.35, 0.25, -2.0], size: 0.8, t: X.span(f, sh.f0 + 38, sh.f0 + 56) });
        cam = E.camAt(f, [{ f: sh.f0, pos: [0.4, 1.6, 5.2], look: [0.5, 1.0, -0.6], fov: 46 }, { f: mid, pos: [0.7, 1.4, 4.4], look: [0.8, 0.7, -1.0], fov: 44 }]);
        focusPt = [0.6, 0, -1]; dof = { focus: [0.8, 0.6, -1.3], amount: 4 };
      } else { // yakın: burna su kaçar
        A.push({ id: "swim", pos: [0.9, -1.05, -1.5], st: st(2, { face: "neutral", arms: "hang", look: 0 }) });
        const dp = X.span(f, mid, mid + 26);
        for (let i = 0; i < 3; i++) { const q = X.clamp(dp * 1.4 - i * 0.2); if (q > 0 && q < 1) FX.push({ kind: "sweat", pos: [0.9 + 0.3 * (1 - q), 0.5 + 0.3 * (1 - q) + 0.05 * i, -1.3], size: 0.1 * (1 - q * 0.5) }); }
        cam = E.camAt(f, [{ f: mid, pos: [0.95, 0.75, 0.3], look: [0.9, 0.55, -1.5], fov: 38 }, { f: sh.f1, pos: [0.95, 0.72, 0.1], look: [0.9, 0.55, -1.5], fov: 36 }]);
        dof = { focus: [0.9, 0.55, -1.5], amount: 6 }; focusPt = [0.9, 0, -1.5];
      }
      break;
    }
    case "towel": {
      A.push({ id: "swim", pos: [0.4, 0, 1.4], st: st(3, { face: "happy", arms: "hip", legs: "stand" }) });
      FX.push({ kind: "sparkle", pos: [0.9, 2.2, 1.5], size: 0.5, t: t / 25 });
      cam = E.camAt(f, [{ f: sh.f0, pos: [0.9, 1.5, 5.6], look: [0.7, 1.2, 1.4], fov: 42 }, { f: sh.f1, pos: [0.8, 1.45, 5.0], look: [0.6, 1.2, 1.4], fov: 40 }]);
      dof = { focus: [0.5, 1.2, 1.4], amount: 5 }; focusPt = [0.5, 0, 1.4];
      break;
    }
    case "micro": {
      const z = X.smooth(X.span(f, sh.f0, sh.f0 + 25));
      R.micro.forEach((a, i) => { const ang = i * 1.3 + f / 70; put(a, MX + (i ? 1.1 * Math.cos(ang) : 0.05 * Math.sin(f / 30)), 2 + (i ? 1.0 * Math.sin(ang) : 0), -2.6 + (i ? 0 : 0.2), 0, 1); wob(a, f + i * 20); });
      cam = E.camAt(f, [{ f: sh.f0, pos: [MX, 2, 6.5], look: [MX, 2, -2.8], fov: 46 }, { f: sh.f0 + 25, pos: [MX, 2, 3.4], look: [MX, 2, -2.8], fov: 44 }, { f: sh.f1, pos: [MX + 0.1, 2.05, 2.9], look: [MX, 2, -2.8], fov: 44 }]);
      FX.push({ kind: "sparkle", pos: [MX + 0.8, 3.0, -2.2], size: 0.7, t: t / 20 });
      overlay = all(lensRing(0.4 + 0.6 * z), f > sh.f0 + 20 ? card("Naegleria fowleri", "ılık tatlı suda yaşayan tek hücreli") : null);
      break;
    }
    case "climb": {
      const half = sw(4); // "ve"
      for (let i = 0; i < R.dots.length; i++) {
        const q = X.clamp(((f - sh.f0) / 50) - i * 0.18); if (q <= 0) continue;
        const seg = Math.min(R.path.length - 2, Math.floor(q * (R.path.length - 1))), u = q * (R.path.length - 1) - seg;
        const [a, b] = [R.path[seg], R.path[Math.min(seg + 1, R.path.length - 1)]];
        R.dots[i].position.set(X.lerp(a[0], b[0], u), X.lerp(a[1], b[1], u), -0.58);
        if (q >= 1) R.dots[i].position.set(HX + 0.12 - i * 0.12, 2.3 + 0.05 * Math.sin(f / 6 + i), -0.42);
      }
      R.spots.forEach((s, i) => s.scale.set(1.4 * X.easeOut(X.span(f, half + i * 6, half + 20 + i * 6)), 0.9 * X.easeOut(X.span(f, half + i * 6, half + 20 + i * 6)), 0.4));
      cam = E.camAt(f, [{ f: sh.f0, pos: [HX + 0.5, 1.9, 3.0], look: [HX + 0.5, 1.9, -0.8], fov: 40 }, { f: half, pos: [HX + 0.3, 2.1, 3.4], look: [HX + 0.3, 2.1, -0.8], fov: 42 }, { f: sh.f1, pos: [HX + 0.1, 2.2, 3.6], look: [HX + 0.05, 2.2, -0.8], fov: 44 }]);
      overlay = all(tint("#3a2060", 0.1), card("Koku siniri", "burundan beyne açılan yol"));
      break;
    }
    case "stat": {
      A.push({ id: "doc", pos: [CX - 0.6, 0, -6.5], st: st(5, { face: "sad", arms: "hold", prop: { kind: "paper" } }) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [CX, 1.6, 3.5], look: [CX, 1.3, -6], fov: 46 }, { f: sh.f1, pos: [CX, 1.55, 2.4], look: [CX, 1.3, -6], fov: 44 }]);
      focusPt = [CX, 0, -4]; light = "interior";
      const n = Math.round(97 * X.easeOut(X.span(f, sh.f0 + 4, sw(5))));
      overlay = all(tint("#1a3040", 0.15), big("%" + n, 1, f > sw(6) ? "kurtulamıyor" : "", "#ff4a4a", 260));
      break;
    }
    case "rare": {
      for (let i = 0; i < 9; i++) { const x = -3.2 + (i % 3) * 3.2 + (Math.floor(i / 3) % 2) * 1.4, z = -2.5 - Math.floor(i / 3) * 3.5;
        A.push({ id: "p" + i, pos: [x, -1.15 + 0.05 * Math.sin(f / 9 + i), z], st: st(40 + i, { face: i % 2 ? "laugh" : "happy", arms: i % 3 === 0 ? "wave" : "up", phase: f / 30 + i }) }); }
      cam = E.camAt(f, [{ f: sh.f0, pos: [0, 2.8, 5.5], look: [0, 0.6, -5], fov: 48 }, { f: sh.f1, pos: [0, 2.5, 4.6], look: [0, 0.6, -5], fov: 46 }]);
      focusPt = [0, 0, -4];
      overlay = big("ÇOK NADİR", X.span(f, sw(2) - 2, sw(2) + 6), "ABD'de 60 yılda 154 vaka", "#ffd24a", 150);
      break;
    }
    case "drink": {
      light = "interior";
      const sip = f > sh.f0 + 20 && f < sh.f0 + 45;
      A.push({ id: "me", pos: [KX + 0.2, 0, -0.8], st: st(6, { face: sip ? "neutral" : "think", arms: sip ? [[10, 4], [24, 150]] : "holdR", prop: { kind: "cup", col: "#cfe9ff", dy: sip ? -30 : 0 } }) });
      FX.push({ kind: "question", pos: [KX + 0.75, 2.45, -0.7], size: 0.5 * X.back(X.span(f, sh.f0 + 30, sh.f0 + 40)) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [KX + 0.4, 1.7, 3.4], look: [KX + 0.35, 1.45, -0.8], fov: 44 }, { f: sh.f1, pos: [KX + 0.45, 1.65, 2.9], look: [KX + 0.4, 1.45, -0.8], fov: 42 }]);
      dof = { focus: [KX + 0.3, 1.4, -0.8], amount: 5 }; focusPt = [KX, 0, -0.8];
      break;
    }
    case "stomach": {
      const d = X.span(f, sh.f0 - 2, sh.f0 + 12);
      R.drop.position.set(SX - 0.05, X.lerp(2.9, 1.4, X.easeIn(d)), -0.78); if (d >= 1) R.drop.position.y = -50;
      R.sAm.forEach((a, i) => { const fade = 1 - X.smooth(X.span(f, sh.f0 + 12 + i * 3, sh.f0 + 26 + i * 3)); put(a, SX - 0.3 + i * 0.18, 1.35 + 0.06 * Math.sin(f / 7 + i), -0.72, 0, Math.max(0.001, fade)); wob(a, f); });
      if (f > sh.f0 + 18) FX.push({ kind: "check", pos: [SX + 0.6, 2.2, -0.6], size: 0.5 * X.back(X.span(f, sh.f0 + 18, sh.f0 + 26)) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [SX + 0.1, 2.2, 4.8], look: [SX + 0.05, 2.15, -1], fov: 44 }, { f: sh.f1, pos: [SX + 0.1, 2.1, 4.3], look: [SX + 0.05, 2.05, -1], fov: 44 }]);
      overlay = card("Mide asidi", "yutulan amip zarar veremez");
      break;
    }
    case "end": {
      const c = X.easeOut(X.span(f, sh.f0 + 12, sh.f0 + 26));
      R.clip.position.set(NX, X.lerp(4.5, 1.6, c), -0.4);
      const bx = X.span(f, sh.f0, sh.f0 + 40);
      const away = X.easeOut(X.span(f, sh.f0 + 26, sh.f0 + 44));
      put(R.endAm, NX + 0.2 - 0.1 * bx + 1.1 * away, 1.3 + 0.2 * Math.abs(Math.sin(bx * 5)) - 0.4 * away, 1.7 - 0.9 * Math.sin(bx * Math.PI) + 0.6 * away, 0, 1 - 0.5 * away); wob(R.endAm, f, 2);
      if (f > sh.f0 + 26 && f < sh.f0 + 40) FX.push({ kind: "burst", pos: [NX, 1.6, 0.9], size: 0.8 * X.back(X.span(f, sh.f0 + 26, sh.f0 + 34)), opt: { text: "KLİK", size: 70 } });
      cam = E.camAt(f, [{ f: sh.f0, pos: [NX, 1.55, 3.2], look: [NX, 1.65, 0], fov: 44 }, { f: sh.f1, pos: [NX, 1.6, 4.2], look: [NX, 1.7, 0], fov: 46 }]);
      shake(sh.f0 + 26, 0.04, 8);
      overlay = all(line("TEK KAPISI:", 300, "#ffffff", 120, X.span(f, sh.f0 + 4, sh.f0 + 10)), line("BURUN", 450, TEAL, 170, X.span(f, sh.f0 + 12, sh.f0 + 18)));
      break;
    }
  }
  return { cam, light, dof, actors: A, fx: FX, flash, overlay, focusPt };
}
