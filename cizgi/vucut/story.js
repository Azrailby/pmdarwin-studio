// Vücudunun Ne Kadarı Sen? — PMDARWIN (~33 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [97, "cells"], [200, "gut"], [304, "door"], [394, "old"], [476, "new"], [594, "weight"],
  [728, "wc"], [813, "morning"], [931, "end"]];
const END = 1010;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const GREEN = "#3ddc97", PINK = "#ff7eb6";
const BUGCOLS = ["#3ddc97", "#ff7eb6", "#ffd23f", "#7cc4ff", "#b48cff", "#ff9a4d"];
const GX = 100, BX = 200, KX = 300, WX = 400; // bağırsak, tahta, mutfak, banyo (oda x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };

// ---------------- bakteri karakteri ----------------
function makeBug(E, i, s = 1) {
  const g = E.group(null, [0, -50, 0]);
  const col = BUGCOLS[i % BUGCOLS.length], cap = i % 3 === 0;
  const m = E.mat(col, { emissive: col, glow: 0.18 });
  if (cap) { const b = E.sphere(0.16, m, [0, 0, 0], { parent: g, seg: 14 }); b.scale.set(1.9, 1, 1); }
  else E.sphere(0.17, m, [0, 0, 0], { parent: g, seg: 14 });
  const ex = cap ? 0.1 : 0.06;
  for (const x of [-ex, ex]) {
    E.sphere(0.055, E.mat("#ffffff"), [x, 0.05, 0.13], { parent: g, seg: 10 });
    E.sphere(0.028, E.mat("#151018"), [x, 0.05, 0.18], { parent: g, seg: 8 });
  }
  if (i % 2) { for (const a of [-0.6, 0, 0.6]) { const c = E.cyl(0.008, 0.008, 0.12, E.mat("#2a2030"), [Math.sin(a) * 0.12, 0.14, 0], { parent: g, seg: 4 }); c.rotation.z = a; } }
  g.scale.setScalar(s); g.userData.s = s;
  return g;
}
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makeScale(E, parent, pos) {
  const g = E.group(parent, pos);
  const brass = E.mat("#e3b54a", { emissive: "#6a4a10", glow: 0.2 });
  E.cyl(0.32, 0.4, 0.08, brass, [0, 0, 0], { parent: g, seg: 20 });
  E.cyl(0.04, 0.05, 1.1, brass, [0, 0.08, 0], { parent: g, seg: 10 });
  const beam = E.group(g, [0, 1.2, 0]); g.userData.beam = beam;
  E.box(1.5, 0.06, 0.06, brass, [0, 0, 0], { parent: beam, center: true });
  E.sphere(0.06, brass, [0, 0, 0], { parent: beam, seg: 10 });
  g.userData.pans = [];
  for (const sx of [-1, 1]) {
    const hang = E.group(beam, [sx * 0.72, 0, 0]);
    for (const dz of [-0.12, 0.12]) E.cyl(0.006, 0.006, 0.45, E.mat("#8a7a5a"), [0, -0.45, dz], { parent: hang, seg: 4 });
    E.cyl(0.22, 0.16, 0.05, brass, [0, -0.5, 0], { parent: hang, seg: 20 });
    const pile = E.group(hang, [0, -0.44, 0]);
    for (let k = 0; k < 7; k++) E.sphere(0.06, E.mat(sx < 0 ? "#e04848" : BUGCOLS[k % 6], { emissive: sx < 0 ? "#801010" : BUGCOLS[k % 6], glow: 0.15 }), [(rnd(k + sx * 9) - 0.5) * 0.24, (k > 4 ? 0.07 : 0), (rnd(k + 20 + sx) - 0.5) * 0.2], { parent: pile, seg: 8 });
    g.userData.pans.push(hang);
  }
  return g;
}
function tiltScale(g, a) { g.userData.beam.rotation.z = a; g.userData.pans.forEach((p) => (p.rotation.z = -a)); }

// ---------------- sahneler ----------------
export function build(E) {
  const { T } = E; const TH = E.THREE;
  // ---- oda (x=0) ----
  E.box(14, 0.1, 10, E.mat("#ffffff", { map: T.planks("#c89a68") }), [0, -0.1, 0]);
  E.box(14, 4.5, 0.2, E.mat("#ffffff", { map: T.wallpaper("#dff3e8", "#cdeadb") }), [0, 0, -2.2]);
  E.box(0.2, 4.5, 10, E.mat("#ffffff", { map: T.wallpaper("#dff3e8", "#cdeadb") }), [-3.6, 0, 0]);
  // ayna
  E.box(1.35, 2.75, 0.12, E.mat("#c8a46a"), [1.05, 0.15, -2.05]);
  E.box(1.15, 2.55, 0.04, E.mat("#e8f6ff", { emissive: "#bfe6ff", glow: 0.35 }), [1.05, 0.25, -1.98]);
  R.mirrorZ = -1.94;
  R.dots = [];
  for (let i = 0; i < 46; i++) { const d = E.sphere(0.035 + rnd(i + 7) * 0.025, E.mat(BUGCOLS[i % 6], { emissive: BUGCOLS[i % 6], glow: 0.35 }), [0, -50, 0], { seg: 8 }); d.userData.u = [rnd(i), rnd(i + 50)]; R.dots.push(d); }
  // kapı
  R.door = E.group(null, [-2.0, 0, -2.08]);
  E.box(1.2, 2.5, 0.03, E.mat("#1a1420"), [-2.0, 0, -2.09]);
  const leaf = E.group(R.door, [-0.6, 0, 0]); R.doorLeaf = leaf;
  E.box(1.2, 2.5, 0.08, E.mat("#ffffff", { map: T.wood("#8a5a36") }), [0.6, 0, 0.04], { parent: leaf });
  E.sphere(0.05, E.mat("#e3b54a"), [1.05, 1.15, 0.12], { parent: leaf, seg: 10 });
  // yatak
  R.bed = E.group(null, [-1.9, 0, -0.9]);
  E.box(1.6, 0.4, 2.4, E.mat("#8a5a36"), [0, 0, 0], { parent: R.bed });
  E.box(1.5, 0.22, 2.3, E.mat("#f4f1ea"), [0, 0.4, 0], { parent: R.bed });
  E.box(1.52, 0.12, 1.4, E.mat("#3ddc97"), [0, 0.6, 0.45], { parent: R.bed });
  E.box(1.0, 0.18, 0.45, E.mat("#ffffff"), [0, 0.62, -0.85], { parent: R.bed });
  E.box(1.6, 1.1, 0.12, E.mat("#8a5a36"), [0, 0, -1.2], { parent: R.bed });
  R.bed.visible = false;
  // pencere (sabah)
  R.win = E.box(1.4, 1.2, 0.06, E.mat("#ffe7a8", { emissive: "#ffd27a", glow: 1.2 }), [-0.2, 1.6, -2.08]);
  // hücreler (yörünge)
  R.cells = [];
  for (let i = 0; i < 14; i++) { const c = E.sphere(0.09, E.mat("#e04848", { emissive: "#902020", glow: 0.25 }), [0, -50, 0], { seg: 12 }); c.scale.set(1, 0.45, 1); R.cells.push(c); }
  // ---- bağırsak tüneli (x=GX) ----
  const tube = E.mat("#f59ab8", { side: TH.DoubleSide, emissive: "#c85a80", glow: 0.45 });
  const openCyl = (r, h, m, x) => { const o = new TH.Mesh(new TH.CylinderGeometry(r, r, h, 40, 1, true), m); o.position.set(x, 2.3, 0); o.rotation.z = Math.PI / 2; return E.add(o); };
  openCyl(2.3, 30, tube, GX + 4);
  const ringM = E.mat("#e8789e", { side: TH.DoubleSide, emissive: "#b04a70", glow: 0.4 });
  for (let k = 0; k < 14; k++) { const r = openCyl(2.12, 0.3, ringM, GX - 8 + k * 2); r.castShadow = false; }
  for (let i = 0; i < 90; i++) {
    const a = rnd(i + 600) * Math.PI * 2, x = GX - 8 + rnd(i + 620) * 22;
    const v = E.cone(0.12, 0.55, E.mat("#ffb3cb", { emissive: "#d86a90", glow: 0.35 }), [0, 0, 0], { seg: 8 });
    v.position.set(x, 2.3 + Math.cos(a) * 2.05, Math.sin(a) * 2.05); v.rotation.set(a + Math.PI, 0, 0);
  }
  R.gutBugs = [];
  for (let i = 0; i < 110; i++) {
    const b = makeBug(E, i, 0.8 + rnd(i + 700) * 0.7);
    const a = rnd(i + 710) * Math.PI * 2, r = 0.3 + rnd(i + 720) * 1.35;
    b.userData.home = [GX - 6 + rnd(i + 730) * 20, 2.3 + Math.cos(a) * r, Math.sin(a) * r];
    R.gutBugs.push(b);
  }
  // ---- kara tahta (x=BX) ----
  E.box(14, 0.1, 10, E.mat("#ffffff", { map: T.planks("#b98a5a") }), [BX, -0.1, 0]);
  E.box(14, 4.5, 0.2, E.mat("#e9e0c8"), [BX, 0, -2.2]);
  E.box(3.4, 1.8, 0.1, E.mat("#2f4a3a"), [BX, 1.1, -2.05]);
  E.box(3.6, 0.1, 0.18, E.mat("#8a5a36"), [BX, 1.05, -2.0]);
  R.t10 = E.label(T.sign("10 : 1", { bg: "#2f4a3a", fg: "#ffffff", size: 180 }), 1.4, 0.6, [BX - 0.8, 2.05, -1.98]);
  R.t11 = E.label(T.sign("1 : 1", { bg: "#2f4a3a", fg: "#8dffc9", size: 180 }), 1.2, 0.6, [BX + 0.95, 2.05, -1.98]);
  R.scaleB = makeScale(E, null, [BX + 1.1, 0, -0.4]);
  E.actor("sci", { jacket: "#f4f1ea", shirt: "#7c8fa3", pants: "#3a3a44", tie: "#2b8a6a", hair: "bun", hairCol: "#5a3a22", glasses: true, skin: "#e9c3a0", seed: 9 });
  // ---- mutfak (x=KX) ----
  E.box(14, 0.1, 10, E.mat("#ffffff", { map: T.tiles("#f4efe6", "#e3d7c4", 6) }), [KX, -0.1, 0]);
  E.box(14, 4.5, 0.2, E.mat("#ffffff", { map: T.tiles("#ffffff", "#d9f2e6", 10) }), [KX, 0, -2.2]);
  E.box(4, 0.95, 1.2, E.mat("#ffffff", { map: T.marble("#eeeae2") }), [KX, 0, -1.2]);
  const sc = E.group(null, [KX - 0.3, 0.95, -1.0]);
  E.box(0.55, 0.12, 0.45, E.mat("#f4f6f8"), [0, 0, 0], { parent: sc });
  E.box(0.3, 0.07, 0.02, E.mat("#1a2a22"), [0, 0.03, 0.235], { parent: sc });
  E.label(T.sign("200 g", { bg: "#1a2a22", fg: "#8dffc9", size: 120 }), 0.28, 0.06, [KX - 0.3, 0.99, -0.76], { lit: false });
  E.cyl(0.24, 0.22, 0.03, E.mat("#c9d0d8"), [0, 0.12, 0], { parent: sc, seg: 24 });
  R.heap = E.group(sc, [0, 0.16, 0]);
  for (let i = 0; i < 26; i++) { const r = Math.sqrt(rnd(i + 800)) * 0.15, a = rnd(i + 810) * 6.28, h = 0.12 * (1 - r / 0.16); E.sphere(0.035, E.mat(BUGCOLS[i % 6], { emissive: BUGCOLS[i % 6], glow: 0.2 }), [Math.cos(a) * r, h * rnd(i + 820), Math.sin(a) * r], { parent: R.heap, seg: 8 }); }
  const apple = E.group(null, [KX + 0.35, 0.95, -0.95]);
  E.sphere(0.17, E.mat("#d8342c"), [0, 0.16, 0], { parent: apple, seg: 20 }).scale.set(1.05, 0.95, 1.05);
  E.cyl(0.012, 0.015, 0.09, E.mat("#5a3a22"), [0, 0.29, 0], { parent: apple, seg: 6 });
  const lf = E.sphere(0.05, E.mat("#4caf50"), [0.05, 0.34, 0], { parent: apple, seg: 8 }); lf.scale.set(1.6, 0.3, 0.8);
  // ---- banyo (x=WX) ----
  E.box(14, 0.1, 10, E.mat("#ffffff", { map: T.tiles("#ffffff", "#cfe7f2", 8) }), [WX, -0.1, 0]);
  E.box(14, 4.5, 0.2, E.mat("#ffffff", { map: T.tiles("#eef8fb", "#d6eef6", 10) }), [WX, 0, -2.2]);
  E.box(1.3, 2.6, 0.12, E.mat("#ffffff", { map: T.wood("#a8d8ea") }), [WX - 0.6, 0, -2.06]);
  E.sphere(0.05, E.mat("#c9d0d8"), [WX - 0.1, 1.2, -1.98], { seg: 10 });
  E.label(T.sign("WC", { bg: "#ffffff", fg: "#2b6fa8", size: 170 }), 0.5, 0.3, [WX - 0.6, 2.1, -1.99]);
  R.scaleW = makeScale(E, null, [WX + 0.7, 0.9, -0.3]);
  E.box(1.2, 0.9, 0.7, E.mat("#f4f1ea"), [WX + 0.7, 0, -0.3]);
  // ---- karakterler ----
  const me = { shirt: "#3ddc97", pants: "#3b3f52", hair: "short", hairCol: "#3a2a20", seed: 7, skin: "#f6dcc0" };
  E.actor("me", me); E.actor("meR", me);
  E.actor("mePj", { ...me, shirt: "#ff9ec4", pants: "#ff9ec4" });
  R.bugs = [];
  for (let i = 0; i < 16; i++) R.bugs.push(makeBug(E, i, 1.0 + 0.3 * rnd(i + 900)));
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(12,28,22,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = GREEN; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#bff5dc"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = GREEN, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#1a0f18"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

function reset() {
  R.dots.forEach(hide); R.cells.forEach(hide); R.bugs.forEach(hide); R.gutBugs.forEach(hide);
  R.bed.visible = false; R.doorLeaf.rotation.y = 0;
  R.t11.scale.set(1, 1, 1); R.t10.visible = true; R.t11.visible = true; R.t11.position.x = BX + 0.95; tiltScale(R.scaleB, 0); tiltScale(R.scaleW, 0);
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "interior", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0], tint = null;
  reset();

  switch (sh.name) {
    case "hook": {
      const shock = f > WF(E, 4) - 6;
      A.push({ id: "me", pos: [-0.35, 0, 0.1], st: st(1, { face: shock ? "shock" : "neutral", arms: shock ? "up" : "hang", look: 0.8 }) });
      A.push({ id: "meR", pos: [1.05, 0.12, -1.9], yaw: 0, scale: 0.93, blob: false, flip: true, tint: "#dff0ff", st: st(1, { face: shock ? "shock" : "neutral", arms: shock ? "up" : "hang", look: -0.8 }) });
      // yansımanın yarısı renkli bakteri noktaları
      const cover = X.smooth(X.span(f, 18, 60));
      R.dots.forEach((d, i) => { const [u, v] = d.userData.u; if (u < cover) { d.visible = true; d.position.set(1.05 + 0.03 + v * 0.36, 0.45 + u * 1.65, -1.86); } });
      cam = E.camAt(f, [{ f: 0, pos: [0.3, 1.5, 4.3], look: [0.35, 1.2, -1.0], fov: 46 }, { f: 96, pos: [0.4, 1.45, 3.7], look: [0.45, 1.2, -1.0], fov: 46 }]);
      focusPt = [0.4, 0, -1];
      break;
    }
    case "cells": {
      A.push({ id: "me", pos: [0, 0, 0], st: st(1, { face: "wow", arms: "shrug", look: 0 }) });
      R.cells.forEach((c, i) => { const a = i / R.cells.length * Math.PI * 2 + f * 0.03, r = 0.85; c.visible = true; c.position.set(Math.cos(a) * r, 1.25 + 0.35 * Math.sin(a * 2 + f * 0.05), Math.sin(a) * r * 0.6 + 0.2); c.rotation.set(a, a * 0.5, 0); });
      cam = E.camAt(f, [{ f: 97, pos: [0.2, 1.45, 3.9], look: [0, 1.25, 0], fov: 46 }, { f: 199, pos: [0.1, 1.4, 3.4], look: [0, 1.25, 0], fov: 46 }]);
      dof = { focus: [0, 1.2, 0.2], amount: 4 };
      const n = Math.round(30 * X.easeOut(X.span(f, WF(E, 9) - 4, WF(E, 10) + 6)));
      overlay = big(`${n} trilyon`, X.span(f, 100, 108), "kendi hücren", "#ff8a8a", 140);
      break;
    }
    case "gut": {
      light = "day";
      R.gutBugs.forEach((b, i) => { const [x, y, z] = b.userData.home; put(b, x + 0.05 * Math.sin(f / 20 + i), y + 0.06 * Math.sin(f / 13 + i * 1.7), z, -Math.PI / 2 + 0.4 * Math.sin(i), b.userData.s); });
      const cx = GX - 4.5 + 0.012 * t;
      cam = E.camAt(f, [{ f: 200, pos: [cx, 2.3, 0.2], look: [cx + 5, 2.1, 0], fov: 52 }, { f: 303, pos: [cx + 0.6, 2.25, 0.1], look: [cx + 5.6, 2.15, 0.2], fov: 52 }]);
      dof = { focus: 3, amount: 3 }; focusPt = [GX, 2, 0];
      tint = "rgba(255,120,170,0.10)";
      const n = Math.round(38 * X.easeOut(X.span(f, WF(E, 16) - 4, WF(E, 18) + 6)));
      overlay = big(`${n} trilyon`, X.span(f, 206, 214), "bakteri", PINK, 140);
      break;
    }
    case "door": {
      const open = X.smooth(X.span(f, 306, 330));
      R.doorLeaf.rotation.y = -1.45 * open;
      A.push({ id: "me", pos: [-0.15, 0, -0.9], st: st(1, { face: f < 340 ? "happy" : "shock", arms: f < 340 ? "present" : "up", look: -0.7 }) });
      R.bugs.forEach((b, i) => {
        const k = X.clamp((f - 322 - i * 3) / 40);
        if (k <= 0) return;
        const tx = -1.9 + (i % 5) * 0.45 + 0.6, tz = -0.6 + Math.floor(i / 5) * 0.45;
        const x = X.lerp(-1.95, tx, k), z = X.lerp(-2.4, tz, k), y = 0.2 + 0.12 * Math.abs(Math.sin(f / 4 + i));
        put(b, x, y, z, 0.3, b.userData.s * 0.85);
      });
      cam = E.camAt(f, [{ f: 304, pos: [-0.2, 1.55, 3.9], look: [-1.1, 1.0, -1.2], fov: 48 }, { f: 393, pos: [-0.3, 1.5, 3.5], look: [-1.1, 0.95, -1.0], fov: 48 }]);
      focusPt = [-1, 0, -1];
      overlay = big("38 > 30", X.span(f, WF(E, 23), WF(E, 23) + 8), "misafir > ev sahibi", GREEN, 150);
      break;
    }
    case "old": {
      tiltScale(R.scaleB, 0.32 + 0.02 * Math.sin(f / 8));
      R.t11.visible = false;
      A.push({ id: "sci", pos: [BX - 1.35, 0, -1.0], st: st(9, { face: "think", arms: "chin", look: 0.6 }) });
      cam = E.camAt(f, [{ f: 394, pos: [BX - 0.6, 1.75, 2.6], look: [BX - 0.7, 1.7, -2], fov: 44 }, { f: 475, pos: [BX - 0.6, 1.8, 2.3], look: [BX - 0.75, 1.8, -2], fov: 42 }]);
      focusPt = [BX, 0, -1];
      const fx = WF(E, 33);
      if (f > fx) FX.push({ kind: "cross", pos: [BX - 0.2, 1.6, -1.85], size: 0.5 * X.back(X.span(f, fx, fx + 8)) });
      overlay = big("eski iddia", X.span(f, 398, 406), "bakteri 10 kat fazla", "#ffd23f", 110);
      break;
    }
    case "new": {
      const w = X.smooth(X.span(f, WF(E, 43) - 6, WF(E, 45)));
      R.t10.visible = false; R.t11.position.x = BX + 0.4; R.t11.scale.setScalar(Math.max(0.001, X.back(w)));
      tiltScale(R.scaleB, X.lerp(0.32, 0.05, X.smooth(X.span(f, WF(E, 41), WF(E, 45) + 6))));
      A.push({ id: "sci", pos: [BX - 0.35, 0, -1.3], st: st(9, { face: f > WF(E, 45) ? "happy" : "determined", arms: w > 0 && w < 1 ? "point" : "present", look: 0.5 }) });
      cam = E.camAt(f, [{ f: 476, pos: [BX + 0.5, 1.7, 3.6], look: [BX + 0.55, 1.45, -1.5], fov: 46 }, { f: 593, pos: [BX + 0.6, 1.65, 3.2], look: [BX + 0.6, 1.45, -1.2], fov: 46 }]);
      focusPt = [BX, 0, -1];
      if (f > WF(E, 45)) FX.push({ kind: "check", pos: [BX + 1.3, 2.45, -1.85], size: 0.5 * X.back(X.span(f, WF(E, 45), WF(E, 45) + 8)) });
      overlay = card("Sender ve ark., 2016", "PLOS Biology · yeni hesap");
      break;
    }
    case "weight": {
      cam = E.camAt(f, [{ f: 594, pos: [KX + 0.05, 1.75, 1.5], look: [KX + 0.02, 1.0, -1.0], fov: 42 }, { f: 727, pos: [KX + 0.05, 1.65, 1.25], look: [KX + 0.02, 1.0, -1.0], fov: 42 }]);
      dof = { focus: [KX, 1.05, -1.0], amount: 5 }; focusPt = [KX, 1, -1];
      overlay = big("≈ 200 g", X.span(f, WF(E, 54) - 4, WF(E, 54) + 4), "bir elma kadar", GREEN, 160);
      break;
    }
    case "wc": {
      light = "day";
      tiltScale(R.scaleW, 0.22 * Math.sin(f / 7) * (0.6 + 0.4 * X.span(f, 760, 790)));
      cam = E.camAt(f, [{ f: 728, pos: [WX + 0.3, 1.6, 3.3], look: [WX + 0.0, 1.35, -1.2], fov: 46 }, { f: 812, pos: [WX + 0.35, 1.55, 2.9], look: [WX + 0.05, 1.35, -1.1], fov: 46 }]);
      focusPt = [WX, 0, -1];
      overlay = big("denge değişir", X.span(f, WF(E, 63) - 4, WF(E, 63) + 4), "", PINK, 110);
      break;
    }
    case "morning": {
      light = ["interior", "golden", 0.5];
      R.bed.visible = true;
      const yawn = f < 860;
      A.push({ id: "mePj", pos: [-0.5, 0, 0.1], st: st(1, { face: yawn ? "sleep" : "think", arms: yawn ? "up" : "hip", look: 0.2, ...(yawn ? { bob: -10 * Math.sin(t / 12) } : {}) }) });
      cam = E.camAt(f, [{ f: 813, pos: [0.1, 1.55, 3.6], look: [-0.8, 1.25, -0.5], fov: 46 }, { f: 930, pos: [0.05, 1.5, 3.2], look: [-0.75, 1.25, -0.4], fov: 46 }]);
      focusPt = [-0.8, 0, -0.5];
      const p = Math.round(50 + 2 * Math.sin((f - 820) / 9));
      overlay = big(`%${p} sen`, X.span(f, 818, 826), "her gün biraz farklı", GREEN, 150);
      break;
    }
    case "end": {
      A.push({ id: "me", pos: [0, 0, 0], st: st(1, { face: "grin", arms: "wave", phase: f / 30, look: 0 }) });
      R.bugs.slice(0, 8).forEach((b, i) => {
        const side = i % 2 ? 1 : -1, row = Math.floor(i / 2);
        put(b, side * (0.55 + row * 0.25), 0.25 + 0.15 * Math.abs(Math.sin(f / 5 + i)) + (row % 2) * 0.35, 0.3 - row * 0.25, side * -0.3, b.userData.s * 1.2);
      });
      cam = E.camAt(f, [{ f: 931, pos: [0, 1.4, 3.8], look: [0, 1.15, 0], fov: 46 }, { f: 1009, pos: [0, 1.35, 3.5], look: [0, 1.15, 0], fov: 46 }]);
      focusPt = [0, 0, 0];
      overlay = big("Tuhaf ama gerçek.", X.span(f, 934, 942), "", "#ffffff", 100);
      break;
    }
  }
  const ov = overlay, tn = tint;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } if (ov) ov(g, w, h); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
