// İnsanlar Mumya Yiyerek İlaç Yaptı — PMDARWIN (~35 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [86, "error"], [148, "merchant"], [226, "bitumen"], [268, "heal"], [386, "confused"], [440, "mixup"],
  [511, "shelves"], [631, "users"], [746, "fake"], [844, "chain"], [887, "rob"], [954, "end"]];
const END = 1053;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const GOLD = "#e8b84a", RED = "#d8342c", CREAM = "#f4e6c8";
const TX = 100, MX = 200, WX = 300, PX = 400; // çevirmen, pazar, atölye, piramit (eczane x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makeMummy(E) {
  const g = E.group(null, [0, -50, 0]), W = E.mat("#efe6cf"), Bd = E.mat("#cbbd98");
  for (const s of [-1, 1]) E.cyl(0.11, 0.12, 0.72, W, [s * 0.13, 0, 0], { parent: g, seg: 10 });
  E.cyl(0.27, 0.24, 0.72, W, [0, 0.68, 0], { parent: g, seg: 14 });
  const head = E.group(g, [0, 1.62, 0]); g.userData.head = head;
  E.sphere(0.27, W, [0, 0, 0], { parent: head, seg: 16 });
  E.box(0.4, 0.09, 0.1, E.mat("#2a2018"), [0, 0.03, 0.22], { parent: head, center: true });
  for (const s of [-1, 1]) { E.sphere(0.04, E.mat("#ffffff"), [s * 0.08, 0.03, 0.27], { parent: head, seg: 8 }); E.sphere(0.022, E.mat("#120c18"), [s * 0.08, 0.03, 0.305], { parent: head, seg: 6 }); }
  for (let i = 0; i < 4; i++) { const r = E.cyl(0.275, 0.275, 0.025, Bd, [0, -0.18 + i * 0.12, 0], { parent: head, center: true, seg: 16 }); r.rotation.z = (i % 2 ? 0.2 : -0.2); }
  for (let i = 0; i < 7; i++) { const r = E.cyl(0.272 - i * 0.004, 0.272 - i * 0.004, 0.025, Bd, [0, 0.74 + i * 0.1, 0], { parent: g, center: true, seg: 16 }); r.rotation.z = (i % 2 ? 0.12 : -0.12); }
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const r = E.cyl(0.125, 0.125, 0.02, Bd, [s * 0.13, 0.1 + i * 0.13, 0], { parent: g, center: true, seg: 10 }); r.rotation.z = s * 0.2; }
  g.userData.arms = [];
  for (const s of [-1, 1]) { const a = E.group(g, [s * 0.32, 1.32, 0]); E.cyl(0.08, 0.08, 0.6, W, [0, -0.6, 0], { parent: a, seg: 8 }); for (let i = 0; i < 3; i++) E.cyl(0.085, 0.085, 0.02, Bd, [0, -0.15 - i * 0.16, 0], { parent: a, center: true, seg: 8 }); g.userData.arms.push(a); }
  const tail = E.box(0.05, 0.4, 0.02, Bd, [0.28, 0.85, 0.2], { parent: g, center: true }); tail.rotation.z = 0.3;
  return g;
}
function mArms(m, a, b) { m.userData.arms[0].rotation.set(a[0], 0, a[1]); m.userData.arms[1].rotation.set(b[0], 0, b[1]); }
function makeJar(E, txt = "MUMIA", col = "#8a5a36") {
  const g = E.group(null, [0, 0, 0]);
  E.cyl(0.16, 0.16, 0.36, E.mat(col), [0, 0, 0], { parent: g, seg: 14 });
  E.cyl(0.17, 0.17, 0.06, E.mat("#5a3a22"), [0, 0.36, 0], { parent: g, seg: 14 });
  E.label(E.T.sign(txt, { bg: "#f4e6c8", fg: "#5a2a14", size: 110, w: 512, h: 256, border: "#5a2a14" }), 0.26, 0.13, [0, 0.18, 0.165], { parent: g });
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- eczane (x=0) ----
  S.room({ w: 10, d: 8, wall: T.planks("#6b4428", 8), floor: T.stone("#a89878"), window: true, door: true });
  for (const x of [-2.6, 0, 2.6]) {
    E.box(2.4, 2.6, 0.4, E.mat("#ffffff", { map: T.wood("#5a3a22") }), [x, 0, -3.75]);
    for (let r = 0; r < 3; r++) { E.box(2.3, 0.05, 0.42, E.mat("#4a2f1a"), [x, 0.85 + r * 0.6, -3.55]); for (let j = 0; j < 5; j++) { const lbl = (j + r + (x > 0 ? 1 : 0)) % 2 === 0 ? "MUMIA" : ["ŞİFA", "MERHEM", "BİTÜM"][(j + r) % 3]; const jr = makeJar(E, lbl, ["#8a5a36", "#3f6a5a", "#6a4a7a"][(j + r) % 3]); jr.position.set(x - 0.9 + j * 0.45, 0.9 + r * 0.6, -3.45); jr.scale.setScalar(0.8); } }
  }
  S.counter(0, -1.4, { w: 3.6, col: "#6b4428", top: "#c9a878" });
  R.bigJar = makeJar(E, "MUMIA", "#7a4a2a"); R.bigJar.position.set(-0.9, 1.18, -1.3); R.bigJar.scale.setScalar(1.3);
  R.mortar = E.group(null, [0.7, 1.18, -1.3]);
  E.cyl(0.2, 0.13, 0.2, E.mat("#9a9488"), [0, 0, 0], { parent: R.mortar, seg: 16 });
  E.cyl(0.16, 0.16, 0.02, E.mat("#5a3a22"), [0, 0.19, 0], { parent: R.mortar, seg: 16 });
  R.pestle = E.group(R.mortar, [0, 0.15, 0]);
  const ps = E.cyl(0.035, 0.05, 0.4, E.mat("#b8b0a0"), [0, 0, 0], { parent: R.pestle, seg: 8 }); ps.rotation.z = 0.3;
  R.spoon = E.group(null, [0, -50, 0]); E.cyl(0.012, 0.012, 0.3, E.mat("#c9c2b0"), [0, 0, 0], { parent: R.spoon, seg: 5 }).rotation.z = Math.PI / 2; E.sphere(0.045, E.mat("#c9c2b0"), [0.17, 0, 0], { parent: R.spoon, seg: 8 }).scale.y = 0.4; E.sphere(0.03, E.mat("#3a2418"), [0.17, 0.012, 0], { parent: R.spoon, seg: 8 });
  // ---- çevirmen masası (x=TX) ----
  S.room({ x: TX, w: 10, d: 8, wall: T.stone("#c8b898"), floor: T.planks("#7a5a3a"), window: true, door: false });
  S.shelf(TX - 2.4, -3.6, { seed: 8 }); S.shelf(TX + 2.4, -3.6, { seed: 3 });
  S.desk(TX, -1.3, { col: "#5a3a22" });
  for (let i = 0; i < 5; i++) E.box(0.5, 0.1, 0.36, E.mat(["#8a2a2a", "#2a4a6a", "#4a6a2a", "#6a4a2a", "#5a2a5a"][i]), [TX - 0.75, 0.95 + i * 0.1, -1.3], { rot: [0, i * 0.2, 0] });
  const book = E.group(null, [TX + 0.1, 0.96, -1.15]); R.book = book;
  for (const s of [-1, 1]) { const p = E.box(0.36, 0.03, 0.46, E.mat("#f4ecd6"), [s * 0.19, 0, 0], { parent: book }); p.rotation.z = -s * 0.1; }
  E.label(T.sign("mumiya\n= bitüm?", { bg: "#f4ecd6", fg: "#3a2418", size: 88, w: 512, h: 512, border: null }), 0.3, 0.3, [TX - 0.09, 1.0, -1.15], { rot: [-Math.PI / 2 + 0.1, 0, 0] });
  E.cyl(0.04, 0.04, 0.22, E.mat("#f4efe4"), [TX + 0.7, 0.95, -1.4], { seg: 8 }); E.sphere(0.035, E.mat("#ffd27a", { emissive: "#ffb040", glow: 1.5 }), [TX + 0.7, 1.2, -1.4], { seg: 8 });
  // ---- pazar (x=MX) ----
  E.ground(T.sand("#e2c890"), 120, 0.25, [MX, 0.01, 0]);
  S.building(MX - 4, -6, { w: 5, d: 5, floors: 2, wall: "#e8d2a8", flatRoof: true, shutter: null, win: "#5a3a22", chimney: false });
  S.building(MX + 4.5, -6.5, { w: 5, d: 5, floors: 2, wall: "#d8b888", flatRoof: true, shutter: null, win: "#5a3a22", chimney: false });
  S.table(MX, -1.2, { w: 2.4, d: 1.0, cloth: "#a8343e" });
  const aw = E.box(3.2, 0.08, 2.0, E.mat("#e8a33c"), [MX, 2.6, -1.4]); aw.rotation.x = 0.2;
  for (const s of [-1, 1]) E.cyl(0.05, 0.05, 2.6, E.mat("#6b4428"), [MX + s * 1.5, 0, -0.5], { seg: 6 });
  R.pot = E.group(null, [MX + 0.3, 0.95, -1.1]);
  E.cyl(0.26, 0.2, 0.32, E.mat("#8a5a3a"), [0, 0, 0], { parent: R.pot, seg: 16 });
  E.cyl(0.24, 0.24, 0.02, E.mat("#0e0a0e", { emissive: "#2a2230", glow: 0.3 }), [0, 0.31, 0], { parent: R.pot, seg: 16 });
  E.sphere(0.05, E.mat("#ffffff"), [-0.08, 0.33, 0.06], { parent: R.pot, seg: 8 }).scale.y = 0.2;
  for (let i = 0; i < 3; i++) E.sphere(0.12, E.mat(["#e8a33c", "#c84a3a", "#6a8a3a"][i]), [MX - 0.8 + i * 0.25, 1.05, -1.3], { seg: 10 });
  // ---- atölye (x=WX) ----
  S.room({ x: WX, w: 10, d: 8, wall: T.plaster("#d8c8a8"), floor: T.planks("#8a6a46"), window: true, door: true });
  S.table(WX + 1.6, -2.0, { w: 1.6, d: 0.9 });
  for (let i = 0; i < 4; i++) E.cyl(0.1, 0.1, 0.3, E.mat("#efe6cf"), [WX + 1.1 + i * 0.3, 0.95, -2.0], { seg: 10 }).rotation.z = Math.PI / 2;
  E.label(T.sign("SAHTE", { bg: "#ffffff", fg: RED, size: 170, border: RED }), 1.3, 0.48, [WX + 0.3, 2.5, -3.95]);
  // ---- piramit (x=PX) ----
  E.ground(T.sand("#c8a870"), 300, 0.25, [PX, 0.01, 0]);
  E.cone(20, 18, E.mat("#d8b87a", { map: T.stone("#d8b87a") }), [PX + 6, 0, -32], { seg: 4 }).rotation.y = Math.PI / 4;
  E.cone(12, 11, E.mat("#c8a86a"), [PX - 14, 0, -44], { seg: 4 }).rotation.y = Math.PI / 4;
  E.box(2.0, 2.4, 0.6, E.mat("#3a2a1a"), [PX + 2.4, 0, -14.6]);
  R.moon = E.sphere(2.4, E.flat("#f4f0dc", { fog: false }), [PX - 14, 24, -80], { seg: 16 }); R.moon.userData.noink = true;
  for (let i = 0; i < 50; i++) { const s = E.sphere(0.12, E.flat("#ffffff", { fog: false }), [PX - 50 + rnd(i) * 100, 14 + rnd(i + 3) * 30, -90], { seg: 5 }); s.userData.noink = true; }
  R.lanterns = [];
  for (let i = 0; i < 3; i++) { const l = E.box(0.14, 0.2, 0.14, E.mat("#ffd27a", { emissive: "#ffb040", glow: 1.8 }), [0, -50, 0], { center: true }); R.lanterns.push(l); }
  R.lamp = new TH.PointLight(0xffb060, 0, 6, 2); E.scene.add(R.lamp);
  // ---- mumyalar ----
  R.mummy = makeMummy(E); R.mummy2 = makeMummy(E);
  // ---- karakterler ----
  E.actor("apo", { jacket: "#5a2a3a", shirt: "#e8dcc4", pants: "#3a2a20", apron: "#e8dcc4", hat: "beret", hatCol: "#3a2a20", beard: "#8a8a8a", hair: "short", hairCol: "#8a8a8a", skin: "#f0c9a4", seed: 191 });
  E.actor("trans", { shirt: "#5a4a7a", dress: "#5a4a7a", hair: "short", hairCol: "#3a2a20", glasses: true, skin: "#f6dcc0", seed: 192, belt: "#e8b84a" });
  E.actor("merch", { shirt: "#e8dcc4", dress: "#3f6a8a", hat: "turban", hatCol: "#f4efe4", hatBand: "#3f6a8a", beard: "#2a1a14", skin: "#c98f66", seed: 193 });
  E.actor("c1", { shirt: "#c84a3a", pants: "#3b3f52", hair: "spiky", hairCol: "#7a4a2a", skin: "#f6dcc0", seed: 194 });
  E.actor("c2", { shirt: "#3f8a4a", dress: "#3f8a4a", hair: "long", hairCol: "#c9a24a", skin: "#e9c3a0", seed: 195 });
  E.actor("c3", { shirt: "#e8a33c", pants: "#4a3a2a", hat: "fez", hair: "short", skin: "#c98f66", seed: 196, moustache: "#2a1a14" });
  E.actor("rob", { shirt: "#2a2a30", pants: "#2a2a30", hat: "beret", hatCol: "#1d1622", skin: "#c98f66", seed: 197 });
  E.actor("rob2", { shirt: "#2a2a30", pants: "#2a2a30", hair: "spiky", hairCol: "#1d1622", skin: "#c98f66", seed: 198 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(40,24,12,.9)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = GOLD; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#f4e0c0"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = GOLD, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#241408"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};
// kırmızı damga
const stamp = (txt, a, rot = -0.2) => (g, w) => {
  if (a <= 0) return; const k = w / 1080, s = 1 + 0.6 * (1 - Math.min(1, a)); g.save(); g.translate(w / 2, 560 * k); g.rotate(rot); g.scale(s, s); g.globalAlpha = Math.min(1, a);
  g.strokeStyle = RED; g.lineWidth = 16 * k; g.strokeRect(-260 * k, -90 * k, 520 * k, 180 * k);
  g.fillStyle = RED; g.font = `900 ${140 * k}px CizgiFont, Nunito, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 0, 8 * k); g.restore();
};
const arrowMis = (a) => (g, w) => {
  if (a <= 0) return; const k = w / 1080; g.save(); g.globalAlpha = a; g.strokeStyle = RED; g.fillStyle = RED; g.lineWidth = 18 * k; g.lineCap = "round";
  const x0 = 800 * k, x1 = 440 * k, y = 640 * k; g.beginPath(); g.moveTo(x0, y); g.quadraticCurveTo((x0 + x1) / 2, y - 160 * k, x1 + 30 * k, y - 20 * k); g.stroke();
  g.beginPath(); g.moveTo(x1, y - 10 * k); g.lineTo(x1 + 70 * k, y - 60 * k); g.lineTo(x1 + 70 * k, y + 20 * k); g.fill(); g.restore();
};

function reset() { for (const o of [R.mummy, R.mummy2, R.spoon]) hide(o); R.lanterns.forEach(hide); R.lamp.intensity = 0; R.pestle.rotation.set(0, 0, 0); mArms(R.mummy, [0, 0], [0, 0]); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "interior", dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, -1], tint = "rgba(160,110,40,0.08)";
  reset();
  const grind = () => { R.pestle.rotation.y = f * 0.25; if (f % 20 < 10) FX.push({ kind: "puff", t: (f % 20) / 20, pos: [0.7, 1.5, -1.15], size: 0.35 }); };

  switch (sh.name) {
    case "hook": {
      A.push({ id: "apo", pos: [-0.4, 0, -0.75], st: st(191, { face: "smug", arms: "holdR", look: 0.7 }) });
      A.push({ id: "c1", pos: [0.6, 0, 0.3], st: st(194, { face: f > WF(E, 5) - 3 ? "wow" : "nervous", arms: "hang", look: -0.6 }) });
      const k = X.smooth(X.span(f, 30, 60));
      put(R.spoon, X.lerp(-0.05, 0.3, k), X.lerp(1.05, 1.3, k), X.lerp(-0.6, 0.2, k), 0.5); grind();
      cam = E.camAt(f, [{ f: 0, pos: [-0.3, 1.6, 4.2], look: [0.1, 1.35, -1.2], fov: 50 }, { f: 85, pos: [-0.2, 1.55, 3.6], look: [0.1, 1.35, -1.2], fov: 50 }]);
      ov.push(big("MUMYA", 1, f > WF(E, 2) - 3 ? "ilaç diye yediler" : "eczanede", GOLD, 190));
      break;
    }
    case "error": case "confused": {
      const conf = sh.name === "confused";
      A.push({ id: "trans", pos: [TX + 0.05, 0, -2.0], st: st(192, { face: conf ? "think" : "neutral", arms: conf ? "shrug" : "hold", look: 0.2 }) });
      if (conf) [[-0.5, 2.55], [0.55, 2.75]].forEach(([dx, y], i) => FX.push({ kind: "question", pos: [TX + dx, y + 0.05 * Math.sin(f / 6 + i), -1.9], size: 0.3 }));
      cam = E.camAt(f, [{ f: sh.f0, pos: [TX + 0.2, 1.7, 2.4], look: [TX, 1.4, -1.5], fov: 48 }, { f: sh.f1 - 1, pos: [TX + 0.15, 1.65, 2.0], look: [TX, 1.4, -1.5], fov: 48 }]);
      if (!conf) { ov.push(big("ÇEVİRİ", X.span(f, WF(E, 9) - 3, WF(E, 9) + 5), "", CREAM, 160)); ov.push(stamp("HATA", X.span(f, WF(E, 10) - 3, WF(E, 10) + 4) * 1.0)); }
      else ov.push(big("karıştırdılar", X.span(f, WF(E, 31) - 3, WF(E, 31) + 5), "", "#ffffff", 120));
      break;
    }
    case "merchant": case "bitumen": case "heal": {
      light = "day"; tint = "rgba(255,170,60,0.06)";
      A.push({ id: "merch", pos: [MX - 0.4, 0, -2.0], st: st(193, { face: "happy", arms: sh.name === "heal" ? "reach" : "present", look: 0.5 }) });
      if (sh.name === "heal") { const ok = f > WF(E, 27) - 3; A.push({ id: "c2", pos: [MX + 0.9, 0, -0.2], st: st(195, { face: ok ? "grin" : "sad", arms: ok ? "cheer" : "hold", look: -0.5 }) }); if (ok) FX.push({ kind: "sparkle", t: f / 30, pos: [MX + 0.9, 2.3, -0.1], size: 0.5 }); }
      const close = sh.name === "bitumen";
      cam = close ? E.camAt(f, [{ f: 226, pos: [MX + 0.8, 1.65, 0.9], look: [MX + 0.4, 1.1, -1.1], fov: 44 }, { f: 267, pos: [MX + 0.75, 1.55, 0.65], look: [MX + 0.4, 1.1, -1.1], fov: 44 }])
        : E.camAt(f, [{ f: sh.f0, pos: [MX + 0.3, 1.55, 4.0], look: [MX + 0.15, 1.45, -1.0], fov: 50 }, { f: sh.f1 - 1, pos: [MX + 0.3, 1.5, 3.4], look: [MX + 0.15, 1.45, -1.0], fov: 50 }]);
      focusPt = [MX, 0, -1];
      if (sh.name === "merchant") { ov.push(big("mumiya", X.span(f, WF(E, 13) - 3, WF(E, 13) + 5), f > WF(E, 16) - 3 ? "= doğal zift" : "Arapça / Farsça", CREAM, 160)); }
      if (close) { ov.push(card("Bitüm", "doğal zift · kara, yapışkan")); ov.push(big("BİTÜM", X.span(f, WF(E, 19) - 3, WF(E, 19) + 5), "", "#ffffff", 170)); }
      if (sh.name === "heal") ov.push(big("ŞİFA", X.span(f, WF(E, 27) - 3, WF(E, 27) + 5), "yaralara · ağrılara", GOLD, 160));
      break;
    }
    case "mixup": {
      light = "day"; tint = "rgba(255,170,60,0.06)";
      put(R.mummy, MX - 0.5, 0, -0.6, 0.3, 0.95); mArms(R.mummy, [-1.3 + 0.1 * Math.sin(f / 6), 0], [-1.3 - 0.1 * Math.sin(f / 6), 0]);
      cam = E.camAt(f, [{ f: 440, pos: [MX - 0.05, 1.5, 3.9], look: [MX - 0.05, 1.2, -0.8], fov: 50 }, { f: 510, pos: [MX - 0.05, 1.5, 3.5], look: [MX - 0.05, 1.2, -0.8], fov: 50 }]);
      focusPt = [MX, 0, -1];
      ov.push(arrowMis(X.span(f, WF(E, 35) - 3, WF(E, 35) + 6)));
      if (f > WF(E, 37) - 3) FX.push({ kind: "cross", pos: [MX - 0.05, 1.55, -0.4], size: 0.4 * X.back(X.span(f, WF(E, 37) - 3, WF(E, 37) + 4)) });
      ov.push(big("zift ≠ mumya", X.span(f, 442, 450), "ama karıştı!", "#ffffff", 120));
      break;
    }
    case "shelves": {
      A.push({ id: "apo", pos: [0.15, 0, -2.0], st: st(191, { face: "grin", arms: "hold", look: 0.3 }) });
      grind();
      cam = E.camAt(f, [{ f: 511, pos: [-1.6, 1.8, 2.4], look: [-1.0, 1.7, -3.5], fov: 50 }, { f: 630, pos: [0.6, 1.6, 2.0], look: [0.4, 1.3, -1.6], fov: 48 }]);
      ov.push(big("MUMYA TOZU", X.span(f, WF(E, 41) - 3, WF(E, 41) + 5), "satışta!", GOLD, 140));
      break;
    }
    case "users": {
      const drank = f > WF(E, 48) + 6, rub = f > WF(E, 49) - 3;
      A.push({ id: "c1", pos: [-0.6, 0, 0.2], st: st(194, { face: drank ? "grin" : "angry", arms: drank ? "holdR" : "facepalm", look: 0.3, prop: drank ? { kind: "cup", col: "#8a5a36" } : null }) });
      if (!drank) FX.push({ kind: "anger", pos: [-0.25, 2.35, 0.3], size: 0.3 });
      A.push({ id: "c3", pos: [0.75, 0, 0.0], st: st(196, { face: rub ? "happy" : "nervous", arms: rub ? "chin" : "hang", look: -0.3, blush: true }) });
      cam = E.camAt(f, [{ f: 631, pos: [0.1, 1.5, 4.4], look: [0.05, 1.55, -0.2], fov: 48 }, { f: 745, pos: [0.1, 1.5, 3.9], look: [0.05, 1.55, -0.2], fov: 48 }]);
      ov.push(big(rub ? "morluk?" : "baş ağrısı?", X.span(f, WF(E, 47) - 3, WF(E, 47) + 5), "mumya!", GOLD, 130));
      break;
    }
    case "fake": {
      const work = f > WF(E, 59) - 4;
      if (!work) {
        ["c1", "c2", "c3"].forEach((id, i) => A.push({ id, pos: [0.5 + i * 0.5, 0, 0.6 - i * 0.8], st: st(194 + i, { face: "nervous", arms: "hang", look: 0.4 }) }));
        A.push({ id: "apo", pos: [0.0, 0, -2.0], st: st(191, { face: "shock", arms: "up" }) });
        cam = E.camAt(f, [{ f: 746, pos: [-1.6, 1.6, 4.0], look: [0.2, 1.4, -1.0], fov: 50 }, { f: WF(E, 59) - 4, pos: [-1.4, 1.6, 3.6], look: [0.2, 1.4, -1.0], fov: 50 }]);
        ov.push(big("TALEP ↑", X.span(f, WF(E, 54) - 3, WF(E, 54) + 5), "kuyruk uzadı", GOLD, 150));
      } else {
        put(R.mummy, WX + 0.2, 0, -1.2, Math.sin(f / 10) * 0.6, 0.95);
        A.push({ id: "rob", pos: [WX - 0.75, 0, -1.0], st: st(197, { face: "sly", arms: f % 20 < 10 ? "reach" : "hold", look: 0.6 }) });
        cam = E.camAt(f, [{ f: WF(E, 59) - 4, pos: [WX + 0.0, 1.55, 3.4], look: [WX + 0.0, 1.5, -1.5], fov: 50 }, { f: 843, pos: [WX + 0.0, 1.5, 3.0], look: [WX + 0.0, 1.5, -1.5], fov: 50 }]);
        ov.push(big("SAHTE MUMYA", X.span(f, WF(E, 59) - 3, WF(E, 59) + 5), "üretildi!", RED, 130));
      }
      break;
    }
    case "chain": {
      A.push({ id: "trans", pos: [TX + 0.05, 0, -2.0], st: st(192, { face: "nervous", arms: "facepalm" }) });
      cam = E.camAt(f, [{ f: 844, pos: [TX + 0.1, 1.8, 1.7], look: [TX, 1.25, -1.4], fov: 46 }, { f: 886, pos: [TX + 0.1, 1.75, 1.4], look: [TX, 1.25, -1.4], fov: 46 }]);
      ov.push(big("1 yanlış çeviri", X.span(f, WF(E, 65) - 3, WF(E, 65) + 5), "→ büyük sonuç", "#ffffff", 120));
      break;
    }
    case "rob": {
      light = { ...X.LIGHTS.night, sunI: 0.8, hemiI: 0.85, amb: 0.22, top: "#0a1230", bot: "#2a3a6a" }; tint = "rgba(20,30,80,0.12)";
      const walk = (f - 887) / 70;
      [["rob", -0.6], ["rob2", 0.6]].forEach(([id, dx], i) => { const x = PX + dx + walk * 0.8, z = -6 - walk * 6; A.push({ id, pos: [x, 0, z], st: st(197 + i, { face: "sly", arms: "holdR", legs: "walk", phase: f / 20 + i * 0.4 }), tint: "#3a3a58" }); put(R.lanterns[i], x + 0.43, 1.0, z + 0.08); });
      R.lamp.position.set(PX + walk * 0.8, 1.4, -6 - walk * 6 + 0.5); R.lamp.intensity = 6;
      cam = E.camAt(f, [{ f: 887, pos: [PX + 0.4, 1.4, 1.5], look: [PX + 1.0, 3.5, -20], fov: 52 }, { f: 953, pos: [PX + 0.4, 1.4, 0.5], look: [PX + 1.0, 3.5, -20], fov: 52 }]);
      focusPt = [PX, 0, -8];
      ov.push(big("MEZAR SOYGUNU", X.span(f, WF(E, 68) - 3, WF(E, 68) + 5), "", GOLD, 120));
      break;
    }
    case "end": {
      light = "day"; tint = "rgba(255,170,60,0.06)";
      put(R.mummy, MX, 0, 0.0, 0, 1.0);
      const sh2 = 0.5 + 0.2 * Math.sin(f / 8);
      mArms(R.mummy, [0, 1.2 + 0.2 * Math.sin(f / 8)], [0, -1.2 - 0.2 * Math.sin(f / 8)]);
      R.mummy.userData.head.rotation.z = 0.15 * Math.sin(f / 10);
      FX.push({ kind: "question", pos: [MX + 0.5, 2.25, 0.2], size: 0.3 });
      cam = E.camAt(f, [{ f: 954, pos: [MX + 0.1, 1.3, 4.0], look: [MX, 1.25, 0], fov: 46 }, { f: 1052, pos: [MX + 0.1, 1.3, 3.6], look: [MX, 1.25, 0], fov: 46 }]);
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 956, 964), f >= WF(E, 74) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
