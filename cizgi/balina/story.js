// Dinamitle Patlatılan Balina — PMDARWIN (~35 sn) · komik ton, kan yok (gri bloklar)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [24, "smell"], [143, "year"], [181, "oregon"], [247, "beach"], [349, "meeting"], [401, "tnt"],
  [444, "plan"], [565, "boom"], [600, "rain"], [714, "car"], [810, "gulls"], [860, "left"], [957, "end"]];
const END = 1051;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const RED = "#e0393e", SAND = "#e2cc96", GRAY = "#8a95a3", YEL = "#ffd23f";
const CX = 100; // otopark (kumsal x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makeWhale(E) {
  const g = E.group(null, [0, 0, -4]), M = E.mat("#7d8a9a"), B = E.mat("#c9d2dc");
  E.sphere(1.6, M, [0, 1.25, 0], { parent: g, seg: 24 }).scale.set(2.6, 0.85, 1.0);
  E.sphere(1.3, B, [0.3, 0.75, 0.35], { parent: g, seg: 20 }).scale.set(2.8, 0.55, 0.8);
  E.sphere(1.25, M, [-3.2, 1.2, 0], { parent: g, seg: 20 }).scale.set(1.2, 0.9, 0.95);
  E.cyl(0.9, 0.35, 2.4, M, [3.9, 1.0, 0], { parent: g, center: true, seg: 16 }).rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) { const fl = E.sphere(0.9, M, [5.4, 1.0, s * 0.8], { parent: g, seg: 12 }); fl.scale.set(0.6, 0.12, 1.1); fl.rotation.y = s * 0.5; }
  const fin = E.sphere(0.8, M, [-1.6, 0.5, 1.2], { parent: g, seg: 12 }); fin.scale.set(1.2, 0.15, 0.6); fin.rotation.set(0.5, 0.3, -0.3);
  E.box(2.2, 0.06, 0.04, E.mat("#3a3f4a"), [-3.6, 0.95, 0.98], { parent: g, center: true }).rotation.z = 0.1;
  const eye = E.box(0.22, 0.05, 0.04, E.mat("#1d1622"), [-2.9, 1.45, 1.12], { parent: g, center: true }); eye.rotation.z = 0.15;
  for (let i = 0; i < 5; i++) E.box(1.6, 0.04, 0.03, E.mat("#6a7584"), [0.0 + i * 0.1, 0.55 + i * 0.12, 1.2 - i * 0.06], { parent: g, center: true });
  return g;
}
function makeGull(E) {
  const g = E.group(null, [0, -50, 0]), W = E.mat("#ffffff"), G = E.mat("#b8c2cc");
  E.sphere(0.22, W, [0, 0.55, 0], { parent: g, seg: 14 }).scale.set(1.5, 0.9, 0.9);
  E.sphere(0.15, W, [0.3, 0.72, 0], { parent: g, seg: 12 });
  E.cone(0.05, 0.16, E.mat(YEL), [0.46, 0.66, 0], { parent: g, seg: 6 }).rotation.z = -Math.PI / 2;
  for (const s of [-1, 1]) { E.sphere(0.035, E.mat("#ffffff"), [0.37, 0.77, s * 0.08], { parent: g, seg: 6 }); E.sphere(0.02, E.mat("#120c18"), [0.395, 0.775, s * 0.1], { parent: g, seg: 6 }); }
  g.userData.wings = [];
  for (const s of [-1, 1]) { const w = E.group(g, [0, 0.62, s * 0.15]); const b = E.box(0.4, 0.04, 0.55, G, [0, 0, s * 0.27], { parent: w, center: true }); g.userData.wings.push(w); }
  E.cone(0.12, 0.25, G, [-0.42, 0.55, 0], { parent: g, seg: 4 }).rotation.z = Math.PI / 2;
  g.userData.legs = [E.cyl(0.015, 0.015, 0.35, E.mat(YEL), [0, 0.0, 0.07], { parent: g, seg: 5 }), E.cyl(0.015, 0.015, 0.35, E.mat(YEL), [0, 0.0, -0.07], { parent: g, seg: 5 })];
  return g;
}
function flap(gl, f, sp = 1, fly = true) { gl.userData.wings.forEach((w, i) => { if (fly) w.rotation.set((i ? 1 : -1) * 0.7 * Math.sin(f * 0.6 * sp), 0, 0); else w.rotation.set(0, i ? -1.35 : 1.35, 0); }); gl.userData.legs.forEach((l) => (l.visible = !fly)); }
function makeUmb(E, col) { const g = E.group(null, [0, -50, 0]); E.cone(0.7, 0.35, E.mat(col), [0, 0, 0], { parent: g, seg: 10 }); E.cyl(0.02, 0.02, 1.0, E.mat("#2b2f3a"), [0, -1.0, 0], { parent: g, seg: 6 }); return g; }
function stinkTex(E) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = 256; c.height = 512; const g = c.getContext("2d");
  for (const [w, col] of [[18, "#1d1622"], [10, "#8adf5a"]]) { g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; for (let k = 0; k < 3; k++) { g.beginPath(); for (let y = 480; y > 40; y -= 8) { const x = 60 + k * 70 + 18 * Math.sin(y / 30 + k); y === 480 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); } }
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}
function planTex(E, step) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = 512; c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#fbfbf6"; g.fillRect(0, 0, 512, 512); g.strokeStyle = "#2b2f3a"; g.lineWidth = 12; g.strokeRect(6, 6, 500, 500);
  g.fillStyle = "#7d8a9a"; g.strokeStyle = "#1d1622"; g.lineWidth = 8;
  if (step === 0) { g.beginPath(); g.ellipse(256, 280, 190, 80, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(440, 280); g.lineTo(500, 220); g.lineTo(500, 340); g.closePath(); g.fill(); g.stroke(); }
  if (step === 1) for (let i = 0; i < 9; i++) { g.save(); g.translate(90 + (i % 3) * 165, 150 + Math.floor(i / 3) * 120); g.rotate(i); g.fillRect(-35, -25, 70, 50); g.strokeRect(-35, -25, 70, 50); g.restore(); }
  if (step === 2) for (let i = 0; i < 3; i++) { const x = 110 + i * 150, y = 260; g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(x, y, 55, 32, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 50, y - 10); g.lineTo(x - 110, y - 70); g.lineTo(x - 10, y - 25); g.stroke(); g.fillStyle = YEL; g.beginPath(); g.moveTo(x + 50, y - 8); g.lineTo(x + 85, y); g.lineTo(x + 50, y + 8); g.fill(); }
  g.fillStyle = "#1d1622"; g.font = "900 64px CizgiFont, Nunito, sans-serif"; g.textAlign = "center"; g.fillText(["1 BALİNA", "2 PARÇALAR", "3 MARTILAR"][step], 256, 470);
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- kumsal (x=0) ----
  E.ground(T.sand(SAND), 300, 0.25, [0, 0, 20]);
  const wt = T.water("#5f8aa8").clone(); wt.needsUpdate = true; wt.repeat.set(30, 10);
  E.plane(400, 140, E.mat("#ffffff", { map: wt }), [0, 0.03, -82], { rot: [-Math.PI / 2, 0, 0] }).castShadow = false;
  E.box(400, 0.05, 1.5, E.mat("#f4f6f8"), [0, 0.0, -12.2]);
  for (let i = 0; i < 12; i++) { const d = E.sphere(4 + rnd(i) * 3, E.mat("#d8c088"), [-40 + i * 7, -2.5, 18 + rnd(i + 2) * 4], { seg: 12 }); d.scale.y = 0.5; d.castShadow = false; }
  for (let i = 0; i < 14; i++) E.cone(0.25, 0.9, E.mat("#8a9a5a"), [-30 + i * 4.3 + rnd(i) * 2, 0.6, 15 + rnd(i + 3) * 3], { seg: 5 });
  S.clouds({ n: 7, y: 26, z: -100 });
  R.whale = makeWhale(E);
  R.chunk = E.group(null, [0, -50, 0]);
  E.box(2.4, 1.6, 1.8, E.mat(GRAY), [0, 0, 0], { parent: R.chunk }); E.box(1.2, 0.8, 1.2, E.mat("#7d8a9a"), [0.9, 1.4, 0.2], { parent: R.chunk });
  S.signpost(4.6, -1.6, "DİNAMİT", { bg: RED, fg: "#ffffff", border: "#1d1622", w: 1.6, h: 1.4 });
  R.crates = [];
  for (let i = 0; i < 8; i++) { const c = E.group(null, [0, -50, 0]); E.box(0.6, 0.45, 0.45, E.mat(RED), [0, 0, 0], { parent: c }); E.label(T.sign("DİNAMİT", { bg: RED, fg: "#ffffff", size: 120, border: null }), 0.5, 0.18, [0, 0.24, 0.23], { parent: c, lit: false }); R.crates.push(c); }
  R.stink = [];
  const sm = E.flat("#ffffff", { map: stinkTex(E), transparent: true }); sm.alphaTest = 0.4;
  for (let i = 0; i < 6; i++) { const p = E.plane(0.9, 1.8, sm, [0, -50, 0], { noink: true }); p.userData.bill = true; p.castShadow = false; R.stink.push(p); }
  R.gulls = [];
  for (let i = 0; i < 7; i++) R.gulls.push(makeGull(E));
  R.bits = [];
  for (let i = 0; i < 46; i++) { const b = E.box(0.25 + rnd(i) * 0.35, 0.2 + rnd(i + 1) * 0.3, 0.25 + rnd(i + 2) * 0.3, E.mat(i % 3 ? GRAY : "#6f7b8a"), [0, -50, 0], { center: true }); R.bits.push(b); }
  R.umbs = [makeUmb(E, "#e04848"), makeUmb(E, "#3f7ad8"), makeUmb(E, YEL), makeUmb(E, "#3fbf6a")];
  // plan tahtası
  R.board = E.group(null, [0, -50, 0]);
  E.box(3.6, 1.4, 0.08, E.mat("#f4f1ea"), [0, 1.0, 0], { parent: R.board });
  for (const s of [-1, 1]) E.box(0.08, 1.0, 0.08, E.mat("#6b4428"), [s * 1.6, 0, 0], { parent: R.board });
  R.plan = [0, 1, 2].map((k) => E.label(planTex(E, k), 1.05, 1.05, [-1.17 + k * 1.17, 1.7, 0.06], { parent: R.board, lit: false }));
  // ---- otopark (x=CX) ----
  E.box(30, 0.05, 30, E.mat("#ffffff", { map: T.cobble("#9a9a9a") }), [CX, 0, 0]);
  for (let i = 0; i < 6; i++) E.box(0.1, 0.02, 2.4, E.mat("#ffffff"), [CX - 3 + i * 1.2 * 2, 0.04, -0.5]);
  R.car = S.car(CX, -0.5, { col: "#3f7ad8", rot: 0.2 });
  R.carTop = R.car.children[1]; R.carGlass = R.car.children[2];
  S.tree(CX - 4, -5); S.tree(CX + 5, -6);
  S.signpost(CX + 2.6, -2.2, "400 m", { bg: "#ffffff", fg: "#1d1622", w: 1.2, h: 1.6 });
  R.bigBit = E.box(1.2, 0.9, 1.0, E.mat(GRAY), [0, -50, 0], { center: true });
  // ---- karakterler ----
  const cols = ["#e8a33c", "#3f7ad8", "#3fbf6a", "#b48cff"];
  for (let i = 0; i < 4; i++) E.actor("p" + i, { shirt: cols[i], pants: ["#3b3f52", "#5a4a32", "#2f4a6a", "#4a3a2a"][i], hair: ["short", "long", "spiky", "bun"][i], hairCol: ["#5a3a22", "#c9a24a", "#3a2a20", "#8a5a30"][i], skin: ["#f6dcc0", "#e9c3a0", "#c98f66", "#f0c9a4"][i], seed: 170 + i, hat: i === 2 ? "cap" : null, hatCol: "#e04848", glasses: i === 3 });
  for (let i = 0; i < 3; i++) E.actor("of" + i, { jacket: ["#5a6a4a", "#3a4a5a", "#6a4a3a"][i], shirt: "#f4efe4", tie: "#b8262e", pants: "#3a3a44", hat: "hardhat", hatCol: ["#ffd23f", "#ffffff", "#ff8a2a"][i], moustache: i === 0 ? "#3a2a20" : null, hair: "short", hairCol: "#3a2a20", skin: ["#f0c9a4", "#e9c3a0", "#f6dcc0"][i], seed: 180 + i, build: i === 1 ? "stout" : "adult" });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(24,28,36,.9)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = RED; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#dde4ec"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = YEL, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#141820"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  for (const o of [R.chunk, R.board, R.bigBit]) hide(o);
  [R.crates, R.stink, R.gulls, R.bits, R.umbs].forEach((L) => L.forEach(hide));
  R.whale.visible = true; R.carTop.scale.y = 1; R.carTop.position.y = 1.3 + 0.35; R.carGlass.scale.y = 1; R.carGlass.position.y = 1.38 + 0.25;
}
function stinks(f, n = 6) { R.stink.slice(0, n).forEach((p, i) => { const k = ((f / 50 + i / n) % 1); put(p, -3.5 + i * 1.4, 2.4 + k * 2.2, -3.6, 0, 0.6 + k * 0.6); p.material.opacity = 1; }); }
function gullsCircle(f, cx = 0, cz = -4, h = 6) { R.gulls.forEach((gl, i) => { const a = f * 0.025 + (i / 7) * Math.PI * 2, r = 4 + (i % 3); put(gl, cx + Math.cos(a) * r, h + (i % 3) * 0.8 + 0.3 * Math.sin(f / 9 + i), cz + Math.sin(a) * r * 0.6, -a - Math.PI / 2, 1.3); flap(gl, f + i * 3); }); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const OVER = { ...X.LIGHTS.day, sunI: 1.0, el: 60, sky: "#d8e0e8", ground: "#a89878", hemiI: 1.0, amb: 0.28, top: "#8a98aa", bot: "#d4dbe2", fog: "#c4ccd4", fogNear: 40, fogFar: 170, sat: 0.95, con: 1.04, vig: 0.32, warm: -0.02 };
  let cam, light = OVER, dof = { focus: 4, amount: 0 }, flash = 0, flashCol = "#fff6d8", focusPt = [0, 0, -3], tint = null, shk = [0, 0, 0];
  reset();
  const crowd = (o = {}) => { for (let i = 0; i < 4; i++) A.push({ id: "p" + i, pos: [-2.4 + i * 1.5, 0, 4.2 + (i % 2) * 0.5], st: st(170 + i, { face: o.face || "nervous", arms: o.arms || "whisper", look: 0.4 * Math.sin(i), sweat: o.sweat ?? true, legs: o.legs, phase: f / 12 + i * 0.3 }) }); };
  const crates = (k) => R.crates.forEach((c, i) => { if (k * 8 > i) put(c, -3.0 + (i % 4) * 1.3, Math.floor(i / 4) * 0.45, -2.6 + Math.floor(i / 4) * -0.15, 0.1 * Math.sin(i)); });

  switch (sh.name) {
    case "hook": case "smell": {
      stinks(f);
      if (sh.name === "smell") crowd({ face: "angry" });
      cam = sh.name === "hook" ? E.camAt(f, [{ f: 0, pos: [3, 2.6, 9], look: [0, 1.6, -4], fov: 55 }, { f: 23, pos: [3, 2.6, 8.5], look: [0, 1.6, -4], fov: 55 }])
        : E.camAt(f, [{ f: 24, pos: [0.5, 2.0, 10.5], look: [0, 1.8, -2], fov: 55 }, { f: 142, pos: [0.3, 2.0, 9.5], look: [0, 1.8, -2], fov: 55 }]);
      if (sh.name === "hook") ov.push(big("BALİNA", 1, "+ dinamit", YEL, 190));
      else ov.push(big("BUM?", X.span(f, WF(E, 8) - 3, WF(E, 8) + 5), "kokudan kurtulmak için", RED, 170));
      break;
    }
    case "year": case "oregon": {
      gullsCircle(f);
      cam = E.camAt(f, [{ f: 143, pos: [-8, 3.0, 9], look: [0, 2.0, -6], fov: 55 }, { f: 246, pos: [-6, 2.8, 8], look: [0, 2.0, -6], fov: 55 }]);
      ov.push(big("1970", X.span(f, WF(E, 11) - 3, WF(E, 11) + 5), "12 Kasım", YEL, 180));
      if (sh.name === "oregon") ov.push(card("Oregon, ABD", "Florence kumsalı"));
      break;
    }
    case "beach": {
      gullsCircle(f); stinks(f);
      cam = E.camAt(f, [{ f: 247, pos: [6, 1.4, 6], look: [-1, 1.6, -4], fov: 52 }, { f: 348, pos: [5, 1.4, 5], look: [-1, 1.6, -4], fov: 52 }]);
      ov.push(big("DEV BALİNA", X.span(f, WF(E, 19) - 3, WF(E, 19) + 5), f > WF(E, 25) - 3 ? "korkunç kokuyordu" : "", "#ffffff", 140));
      break;
    }
    case "meeting": case "tnt": {
      const idea = f >= WF(E, 29) - 3;
      for (let i = 0; i < 3; i++) if (sh.name === "meeting" || i === 1) A.push({ id: "of" + i, pos: sh.name === "tnt" ? [1.3, 0, 2.6] : [-0.9 + i * 0.9, 0, 3.6 - (i === 1 ? 0.3 : 0)], st: st(180 + i, { face: sh.name === "tnt" ? "grin" : idea && i === 1 ? "wow" : "think", arms: sh.name === "tnt" ? (i === 1 ? "present" : "hip") : idea && i === 1 ? "point" : "chin", look: (1 - i) * 0.5 }) });
      if (idea && sh.name === "meeting") FX.push({ kind: "idea", pos: [0.0, 2.75, 3.5], size: 0.5 * X.back(X.span(f, WF(E, 29) - 3, WF(E, 29) + 5)) });
      if (sh.name === "tnt") crates(X.span(f, 401, 432));
      cam = sh.name === "meeting" ? E.camAt(f, [{ f: 349, pos: [0, 1.4, 9.2], look: [0, 1.6, 3.4], fov: 48 }, { f: 400, pos: [0, 1.4, 8.8], look: [0, 1.6, 3.4], fov: 48 }])
        : E.camAt(f, [{ f: 401, pos: [-0.4, 2.0, 7.4], look: [-0.6, 1.0, -2.5], fov: 52 }, { f: 443, pos: [-0.4, 1.9, 6.8], look: [-0.6, 1.0, -2.5], fov: 52 }]);
      if (sh.name === "meeting") ov.push(big("FİKİR!", X.span(f, WF(E, 29) - 3, WF(E, 29) + 5), "", YEL, 170));
      else ov.push(big("½ TON", X.span(f, WF(E, 31) - 3, WF(E, 31) + 5), "dinamit", RED, 190));
      break;
    }
    case "plan": {
      put(R.board, 0, 0, 3.2);
      const steps = [WF(E, 34) - 3, WF(E, 36) - 3, WF(E, 40) - 3];
      R.plan.forEach((p, k) => (p.visible = f >= steps[k]));
      A.push({ id: "of1", pos: [-1.35, 0, 4.4], st: st(181, { face: "smug", arms: "point", look: 0.7 }) });
      if (f > 520) { R.gulls.slice(0, 3).forEach((gl, i) => { put(gl, 1.4 + i * 0.6, 0, 4.4, -Math.PI / 2 + 0.3, 1.2); flap(gl, f + i * 5, 1, false); }); }
      cam = E.camAt(f, [{ f: 444, pos: [-0.1, 1.6, 11.0], look: [-0.1, 1.75, 3.2], fov: 50 }, { f: 564, pos: [0.0, 1.6, 10.4], look: [0.0, 1.75, 3.2], fov: 50 }]);
      ov.push(big("PLAN", X.span(f, WF(E, 34) - 3, WF(E, 34) + 5), "kusursuz(!)", "#ffffff", 160));
      break;
    }
    case "boom": {
      crates(1);
      const s = WF(E, 43) - 3, kk = X.span(f, s, s + 8);
      if (f >= s) {
        R.whale.visible = false; R.crates.forEach(hide);
        R.bits.forEach((b, i) => { const tt = (f - s) / 30, vx = (rnd(i) - 0.5) * 8, vy = 8 + rnd(i + 3) * 10, vz = (rnd(i + 5) - 0.3) * 6; put(b, vx * tt, 1 + vy * tt - 4.9 * tt * tt, -4 + vz * tt); b.rotation.set(f * 0.2 + i, f * 0.15, i); });
        FX.push({ kind: "burst", pos: [0, 3.5, -2], size: 5 * X.back(kk), opt: { col: "#ffe07a", text: "BUM!", size: 130 } });
        FX.push({ kind: "puff", t: X.span(f, s, s + 30), pos: [0, 2.5, -3.5], size: 7 });
        flash = Math.max(0, 0.85 - (f - s) * 0.12); shk = E.shake(f, s, 0.35, 20);
      }
      cam = E.camAt(f, [{ f: 565, pos: [0, 3.0, 14], look: [0, 3.5, -4], fov: 58 }, { f: 599, pos: [0, 3.0, 14.5], look: [0, 4.5, -4], fov: 58 }]);
      if (f >= s) ov.push(big("BUM!", 1, "", RED, 220));
      break;
    }
    case "rain": {
      R.whale.visible = false;
      crowd({ face: f > 640 ? "shock" : "scared", arms: "up", sweat: true });
      R.umbs.forEach((u, i) => { const k = X.back(X.span(f, 612 + i * 6, 620 + i * 6)); if (k <= 0) return; put(u, -2.4 + i * 1.5 + 0.0, 2.5, 4.3 + (i % 2) * 0.5, 0, k); });
      R.bits.forEach((b, i) => { const p = ((f - 600) / 45 + rnd(i)) % 1; put(b, -4 + rnd(i + 7) * 8, 12 - p * 12, 3.0 + rnd(i + 9) * 3); b.rotation.set(f * 0.1 + i, i, f * 0.08); });
      cam = E.camAt(f, [{ f: 600, pos: [0.3, 1.8, 11.5], look: [0, 2.0, 4], fov: 52 }, { f: 713, pos: [0.3, 1.8, 10.5], look: [0, 2.0, 4], fov: 52 }]);
      ov.push(big("YAĞMUR!", X.span(f, WF(E, 47) - 3, WF(E, 47) + 5), "gökyüzünden balina", "#ffffff", 150));
      break;
    }
    case "car": {
      const hit = WF(E, 57) - 2;
      const y = f < hit ? X.lerp(14, 1.85, X.easeIn(X.span(f, hit - 26, hit))) : 1.55;
      put(R.bigBit, CX - 0.2, y, -0.5); R.bigBit.rotation.set(f * 0.1, 0.4, f * 0.06 * (f < hit ? 1 : 0));
      if (f >= hit) { R.carTop.scale.y = 0.35; R.carTop.position.y = 1.3 + 0.12; R.carGlass.scale.y = 0.2; R.carGlass.position.y = 1.38 + 0.05; shk = E.shake(f, hit, 0.15, 10); FX.push({ kind: "dust", t: X.span(f, hit, hit + 20), pos: [CX, 1.0, 0.6], size: 2.5 }); }
      if (f >= hit && f < hit + 10) FX.push({ kind: "burst", pos: [CX + 0.8, 2.8, 0.4], size: 1.5 * X.back(X.span(f, hit, hit + 5)), opt: { col: "#fff3a8", text: "ÇAT!", size: 120 } });
      cam = E.camAt(f, [{ f: 714, pos: [CX + 2.5, 2.2, 7.5], look: [CX, 1.8, -0.5], fov: 50 }, { f: 809, pos: [CX + 2.2, 2.0, 6.8], look: [CX, 1.6, -0.5], fov: 50 }]);
      focusPt = [CX, 0, 0];
      ov.push(big("400 m", X.span(f, WF(E, 51) - 3, WF(E, 51) + 5), "öteki araba bile", YEL, 180));
      break;
    }
    case "gulls": {
      R.whale.visible = false;
      put(R.chunk, -0.5, 0, -4, 0.3, 1.4);
      R.gulls.forEach((gl, i) => { const k = (f - 810) / 50; put(gl, -2 + i * 0.7 + k * (i % 2 ? 6 : -6), 1.5 + k * 6 + (i % 3), -3 + k * -8, (i % 2 ? 0 : Math.PI), 1.3); flap(gl, f, 2.2); });
      FX.push({ kind: "sweat", pos: [1.4, 3.6, -2], size: 0.5 });
      cam = E.camAt(f, [{ f: 810, pos: [0.5, 2.2, 6.5], look: [0, 3.0, -4], fov: 55 }, { f: 859, pos: [0.5, 2.2, 6.0], look: [0, 3.5, -4], fov: 55 }]);
      ov.push(big("MARTILAR KAÇTI", X.span(f, WF(E, 59) - 3, WF(E, 59) + 5), "", "#ffffff", 120));
      break;
    }
    case "left": {
      R.whale.visible = false; stinks(f, 4);
      put(R.chunk, -0.5, 0, -4, 0.3, 1.4);
      A.push({ id: "of0", pos: [1.9, 0, -1.6], st: st(180, { face: "nervous", arms: "chin", look: -0.6, sweat: true }) });
      FX.push({ kind: "question", pos: [2.35, 2.7, -1.4], size: 0.45 + 0.04 * Math.sin(f / 5) });
      cam = E.camAt(f, [{ f: 860, pos: [1.4, 1.7, 5.5], look: [0.6, 1.4, -2.5], fov: 50 }, { f: 956, pos: [1.3, 1.65, 4.8], look: [0.6, 1.4, -2.5], fov: 50 }]);
      ov.push(big("HÂLÂ ORADA", X.span(f, WF(E, 63) - 3, WF(E, 63) + 5), "koca bir parça", "#ffffff", 140));
      break;
    }
    case "end": {
      R.whale.visible = false; put(R.chunk, -1.5, 0, -6, 0.3, 1.4);
      const gl = R.gulls[0]; put(gl, 0, 0.0, 1.0, -Math.PI / 2 + 0.25, 1.8); flap(gl, f, 1, false); gl.userData.legs[1].visible = false;
      gl.rotation.z = 0.03 * Math.sin(f / 12);
      cam = E.camAt(f, [{ f: 957, pos: [0.8, 1.0, 5.4], look: [0, 1.25, 0], fov: 46 }, { f: 1050, pos: [0.7, 1.0, 5.0], look: [0, 1.25, 0], fov: 46 }]);
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 959, 967), f >= WF(E, 72) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  cam.pos = cam.pos.map((v, i) => v + shk[i]);
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, flashCol, overlay: fin, focusPt };
}
