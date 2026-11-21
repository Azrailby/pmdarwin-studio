// Akvaryum Camını Kıran Karides — PMDARWIN (~34 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [34, "crack"], [109, "name"], [160, "hand"], [209, "cock"], [294, "launch"], [363, "slow"],
  [404, "bubbles"], [504, "prey"], [642, "hot"], [736, "keeper"], [831, "bored"], [869, "escape"], [924, "end"]];
const END = 1024;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const TEAL = "#3fe0d0", NEON = "#ff8a2a", PINK = "#ff5fa8";
const MX = 100, GZ = 0.78; // akvaryum içi (makro set), ön cam z
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------- mantis karidesi ----------------
function makeShrimp(E) {
  const g = E.group(null, [0, -50, 0]), M = (c, o) => E.mat(c, o);
  const body = E.group(g, [0, 0, 0]); g.userData.body = body;
  for (let i = 0; i < 6; i++) {
    const r = 0.17 - i * 0.013, s = E.sphere(r, M(i === 0 ? "#45d482" : i % 2 ? "#2fae66" : "#38c274"), [0, 0.34 - i * 0.025 + (i === 0 ? 0.04 : 0), -i * 0.19], { parent: body, seg: 16 });
    s.scale.set(1.2, 0.85, 0.85);
    if (i > 0) E.sphere(0.035, M("#ffd23f"), [0, 0.34 - i * 0.025 + r * 0.8, -i * 0.19], { parent: body, seg: 8 });
  }
  for (const [a, c] of [[-0.6, "#2f6fff"], [0, NEON], [0.6, "#2f6fff"]]) { const t = E.sphere(0.16, M(c), [Math.sin(a) * 0.12, 0.22, -1.18 - Math.cos(a) * 0.08], { parent: body, seg: 12 }); t.scale.set(0.8, 0.22, 1.5); t.rotation.y = a; }
  // gözler
  g.userData.eyes = [];
  for (const s of [-1, 1]) {
    const eg = E.group(body, [s * 0.075, 0.47, 0.1]);
    const st = E.cyl(0.022, 0.03, 0.2, M("#2fae66"), [0, 0, 0], { parent: eg, seg: 8 }); st.rotation.z = -s * 0.25;
    const head = E.group(eg, [s * 0.05, 0.22, 0]);
    E.sphere(0.085, M("#56dcef", { emissive: "#1a7a8a", glow: 0.3 }), [0, 0, 0], { parent: head, seg: 16 }).scale.set(0.9, 1.25, 0.9);
    E.cyl(0.081, 0.081, 0.035, M("#1d4a8a"), [0, 0, 0], { parent: head, center: true, seg: 16 });
    E.sphere(0.035, M("#120c18"), [0, 0.02, 0.068], { parent: head, seg: 10 });
    g.userData.eyes.push(head);
  }
  // antenler
  for (const s of [-1, 1]) {
    const a = E.cyl(0.008, 0.012, 0.55, M(NEON), [s * 0.06, 0.42, 0.2], { parent: body, seg: 5 }); a.rotation.set(0.7, 0, -s * 0.5);
    const sc = E.sphere(0.07, M("#ff7a3a"), [s * 0.17, 0.42, 0.22], { parent: body, seg: 10 }); sc.scale.set(0.6, 0.18, 1.3); sc.rotation.y = s * 0.5;
  }
  // vuruş kolları (omuz -> dirsek -> topuz)
  const arm = [];
  for (const s of [-1, 1]) {
    const sh = E.group(body, [s * 0.13, 0.36, 0.2]);
    E.cyl(0.042, 0.05, 0.3, M("#ff5a3a"), [0, -0.3, 0], { parent: sh, seg: 10 });
    const el = E.group(sh, [0, -0.3, 0]);
    E.sphere(0.05, M("#ff5a3a"), [0, 0, 0], { parent: el, seg: 10 });
    const club = E.sphere(0.085, M("#ff9a3a"), [0, -0.12, 0], { parent: el, seg: 14 }); club.scale.set(1, 1.6, 1);
    E.sphere(0.03, M("#2f6fff"), [0, -0.1, 0.075], { parent: el, seg: 8 });
    arm.push({ sh, el });
  }
  g.userData.arm = arm;
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const l = E.cyl(0.018, 0.018, 0.28, M("#ff7a3a"), [s * 0.12, 0.08, -0.25 - i * 0.18], { parent: body, seg: 5 }); l.rotation.z = s * 0.35; }
  return g;
}
// kol pozu: 0 = dinlen, -1 = geri çekili, 1 = vuruş
function pose(g, k, side = null) {
  const P = { rest: [-1.9, 2.6], cock: [-3.0, 2.8], hit: [-1.55, 0.0] };
  const a = k >= 0 ? [lerp(P.rest[0], P.hit[0], k), lerp(P.rest[1], P.hit[1], k)] : [lerp(P.rest[0], P.cock[0], -k), lerp(P.rest[1], P.cock[1], -k)];
  g.userData.arm.forEach((m, i) => { if (side !== null && i !== side) return; m.sh.rotation.x = a[0]; m.el.rotation.x = a[1]; });
}
function tipPos(g) { const el = g.userData.arm[1].el; g.updateMatrixWorld(true); const v = el.localToWorld(new el.position.constructor(0, -0.2, 0)); return [v.x, v.y, v.z]; }
function eyes(g, f, spin = 0, look = 0) { g.userData.eyes.forEach((e, i) => { e.rotation.set(0.15 * Math.sin(f / 11 + i), look + spin * Math.sin(f / 6 + i * 2), 0); }); }

function crackTex(E) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  const lines = [];
  for (let i = 0; i < 11; i++) { let a = (i / 11) * Math.PI * 2 + rnd(i) * 0.4, x = 256, y = 256; const pts = [[x, y]]; for (let k = 0; k < 6; k++) { a += (rnd(i * 9 + k) - 0.5) * 0.7; const L = 25 + rnd(i * 3 + k) * 25; x += Math.cos(a) * L; y += Math.sin(a) * L; pts.push([x, y]); } lines.push(pts); }
  for (const r of [60, 120]) { const pts = []; for (let i = 0; i <= 24; i++) { const a = (i / 24) * Math.PI * 2; const rr = r + (rnd(i + r) - 0.5) * 18; pts.push([256 + Math.cos(a) * rr, 256 + Math.sin(a) * rr]); } lines.push(pts); }
  for (const [w, col] of [[9, "#0d2a33"], [4, "#ffffff"]]) { g.strokeStyle = col; g.lineWidth = w; g.lineJoin = "round"; g.lineCap = "round"; for (const p of lines) { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); } }
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}
function makeSnail(E) {
  const g = E.group(null, [0, -50, 0]), M = (c) => E.mat(c);
  const foot = E.sphere(0.22, M("#e8d29a"), [-0.05, 0.1, 0], { parent: g, seg: 14 }); foot.scale.set(1.9, 0.45, 0.8);
  const shell = E.group(g, [0.08, 0.32, 0]); g.userData.shell = shell;
  E.sphere(0.3, M("#c9783a"), [0, 0, 0], { parent: shell, seg: 18 }).scale.set(1, 1, 0.8);
  E.sphere(0.18, M("#e8a050"), [0.04, 0.03, 0.2], { parent: shell, seg: 14 }).scale.set(1, 1, 0.5);
  E.sphere(0.08, M("#8a4a22"), [0.05, 0.04, 0.28], { parent: shell, seg: 10 });
  for (const s of [-1, 1]) {
    const t = E.cyl(0.018, 0.022, 0.22, M("#e8d29a"), [-0.4, 0.15, s * 0.06], { parent: g, seg: 6 }); t.rotation.z = 0.5;
    E.sphere(0.035, M("#e8d29a"), [-0.46, 0.35, s * 0.06], { parent: g, seg: 8 });
    E.sphere(0.018, M("#120c18"), [-0.48, 0.36, s * 0.06 + 0.025], { parent: g, seg: 6 });
  }
  return g;
}
function makeHand(E) {
  const g = E.group(null, [0, -50, 0]), sk = E.mat("#f2b088");
  const palm = E.sphere(0.5, sk, [0, 0.14, 0], { parent: g, seg: 18 }); palm.scale.set(1.0, 0.28, 0.95);
  for (let i = 0; i < 4; i++) { const z = -0.33 + i * 0.22, L = [0.55, 0.65, 0.62, 0.5][i]; const fg = E.cyl(0.065, 0.075, L, sk, [0.45 + L / 2, 0.16, z], { parent: g, center: true, seg: 12 }); fg.rotation.z = Math.PI / 2 - 0.08; E.sphere(0.065, sk, [0.45 + L, 0.2, z], { parent: g, seg: 10 }); }
  const th = E.cyl(0.095, 0.1, 0.5, sk, [0.12, 0.18, 0.6], { parent: g, center: true, seg: 12 }); th.rotation.set(Math.PI / 2, 0.7, 0);
  const wr = E.cyl(0.3, 0.32, 1.4, E.mat("#3f6fb5"), [-0.95, 0.18, 0], { parent: g, center: true, seg: 16 }); wr.rotation.z = Math.PI / 2;
  return g;
}
function makeTank(E, parent, w, h, d, th, glassCol) {
  const g = E.group(parent, [0, 0, 0]), m = E.mat(glassCol, { transparent: true, opacity: 0.55 });
  E.box(w, th, d, m, [0, 0, 0], { parent: g });
  for (const s of [-1, 1]) { E.box(w, h, th, m, [0, th, s * (d / 2 - th / 2)], { parent: g }); E.box(th, h, d - 2 * th, m, [s * (w / 2 - th / 2), th, 0], { parent: g }); }
  const wat = E.box(w - 2 * th, h * 0.8, d - 2 * th, E.mat("#4fd0e0", { transparent: true, opacity: 0.35 }), [0, th, 0], { parent: g }); wat.castShadow = false;
  E.box(w - 2 * th, 0.06, d - 2 * th, E.mat("#e9cf94"), [0, th, 0], { parent: g });
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- makro akvaryum (x=MX) ----
  E.box(12, 0.1, 10, E.mat("#ffffff", { map: T.sand("#e9cf94") }), [MX, -0.1, -2]);
  E.plane(14, 7, E.flat("#ffffff", { map: E.T.sign("", { bg: "#1f7f8f", border: null }), fog: false }), [MX, 3.0, -5.5], { noink: true });
  for (let i = 0; i < 14; i++) {
    const x = MX - 4 + rnd(i) * 8, z = -1.4 - rnd(i + 20) * 3.6, c = ["#ff6fa0", "#ffb04a", "#b48cff", "#ff7a5a"][i % 4];
    const cg = E.group(null, [x, 0, z]);
    for (let k = 0; k < 4; k++) { const b = E.cyl(0.05, 0.08, 0.5 + rnd(i * 4 + k) * 0.6, E.mat(c), [0, 0, 0], { parent: cg, seg: 7 }); b.rotation.set((rnd(k + i) - 0.5) * 0.9, 0, (rnd(k * 3 + i) - 0.5) * 0.9); E.sphere(0.1, E.mat(c), [Math.sin(b.rotation.z) * -0.6, 0.7 + rnd(k) * 0.3, Math.sin(b.rotation.x) * 0.6], { parent: cg, seg: 8 }); }
  }
  for (let i = 0; i < 18; i++) { const x = MX - 5 + rnd(i + 40) * 10, z = -1.2 - rnd(i + 50) * 4; const h = 0.8 + rnd(i + 60) * 1.4; const s = E.cyl(0.04, 0.06, h, E.mat(i % 2 ? "#3fae5a" : "#2f8f4a"), [x, 0, z], { seg: 6 }); s.rotation.z = (rnd(i + 70) - 0.5) * 0.4; }
  for (let i = 0; i < 8; i++) { const r = E.sphere(0.25 + rnd(i + 80) * 0.3, E.mat("#8a8f99"), [MX - 3.5 + rnd(i + 81) * 7, 0.05, -0.8 - rnd(i + 82) * 2.5], { seg: 10 }); r.scale.y = 0.55; }
  // ön cam + çerçeve
  const glass = E.plane(8, 4, E.flat("#bff6ff", { transparent: true, opacity: 0.08 }), [MX, 2, GZ], { noink: true }); glass.castShadow = false;
  for (const s of [-1, 1]) E.box(0.25, 4.5, 0.3, E.mat("#20262e"), [MX + s * 2.4, -0.1, GZ]);
  R.crack = E.plane(1, 1, E.flat("#ffffff", { map: crackTex(E), transparent: true }), [MX, 0.5, GZ + 0.01], { noink: true });
  R.crack.material.alphaTest = 0.4; R.crack.castShadow = false;
  R.crack2 = R.crack.clone(); E.scene.add(R.crack2);
  R.bub = [];
  for (let i = 0; i < 30; i++) { const b = E.sphere(0.03 + rnd(i + 90) * 0.03, E.mat("#e9fbff", { emissive: "#bff6ff", glow: 0.4 }), [0, -50, 0], { seg: 10 }); b.castShadow = false; R.bub.push(b); }
  R.cav = [];
  for (let i = 0; i < 9; i++) { const b = E.sphere(0.05, E.mat("#ffffff", { emissive: "#d8f8ff", glow: 0.6 }), [0, -50, 0], { seg: 12 }); b.castShadow = false; R.cav.push(b); }
  R.hotB = E.sphere(0.12, E.mat("#ffd27a", { emissive: "#ff7a1a", glow: 1.6 }), [0, -50, 0], { seg: 18 });
  R.shrimp = makeShrimp(E);
  R.mini = makeShrimp(E);
  R.snail = makeSnail(E);
  R.hand = makeHand(E);
  // ---- oturma odası (x=0) ----
  S.room({ w: 10, d: 8, wall: T.wallpaper("#d9f2ee", "#c6e8e2"), floor: T.planks("#b98a5a"), z: 0 });
  S.shelf(3.2, -3.6);
  S.rug(0, 0.3, 4, 3, "#2f8f8a");
  const stand = E.group(null, [-1.9, 0, -3.2]);
  E.box(1.8, 0.9, 0.6, E.mat("#4a3a2a"), [0, 0, 0], { parent: stand });
  makeTank(E, stand, 1.6, 0.9, 0.55, 0.03, "#cfefff").position.y = 0.9;
  R.carry = E.group(null, [0, -50, 0]);
  makeTank(E, R.carry, 0.75, 0.42, 0.42, 0.08, "#9fe6ff");
  R.carryShrimp = makeShrimp(E); R.carry.add(R.carryShrimp); R.carryShrimp.position.set(0, 0.12, 0); R.carryShrimp.scale.setScalar(0.22); R.carryShrimp.rotation.y = 0.5; R.carryShrimp.visible = true;
  E.actor("aq", { shirt: "#2f9f9a", pants: "#3b3f52", apron: "#f4efe4", hair: "short", hairCol: "#3a2a20", beard: "#3a2a20", skin: "#e9c3a0", seed: 21 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(6,30,36,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = TEAL; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#bff6ef"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = TEAL, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#0a1418"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  for (const o of [R.shrimp, R.mini, R.snail, R.hand, R.hotB, R.carry, R.crack, R.crack2]) hide(o);
  R.bub.forEach(hide); R.cav.forEach(hide);
  R.shrimp.userData.body.rotation.set(0, 0, 0); R.shrimp.userData.body.position.set(0, 0, 0);
  pose(R.shrimp, 0); pose(R.mini, 0);
}
// ortam baloncukları (yükselen)
function ambient(f, x0, z0) {
  R.bub.forEach((b, i) => { const y = ((f * (0.012 + rnd(i) * 0.01) + rnd(i + 5) * 4) % 4); put(b, x0 + (rnd(i + 9) - 0.5) * 3 + 0.05 * Math.sin(f / 10 + i), y, z0 - rnd(i + 3) * 2.5); });
}
function crackAt(o, x, y, s, rot = 0) { if (s <= 0.01) return; o.visible = true; o.position.set(x, y, GZ + 0.01 + rot * 0.001); o.rotation.set(0, 0, rot); o.scale.setScalar(s); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const UNDER = { ...X.LIGHTS.day, sun: "#e8fbff", sunI: 1.3, el: 70, sky: "#bff6ff", ground: "#2f6f6a", hemiI: 1.0, amb: 0.25, top: "#0b4a5a", bot: "#2fb0b8", fog: "#2a8f9a", fogNear: 6, fogFar: 26, card: "#e8fbff", sat: 1.15, con: 1.06, vig: 0.4, warm: -0.02 };
  let cam, light = UNDER, dof = { focus: 4, amount: 0 }, flash = 0, flashCol = "#ffffff", focusPt = [MX, 0, 0], tint = "rgba(20,160,170,0.10)", shk = [0, 0, 0];
  reset();
  const S = R.shrimp, U = S.userData;
  const punchK = (s, d = 4, hold = 6) => f < s - 10 ? 0 : f < s ? -X.smooth((f - s + 10) / 10) : f < s + d ? X.easeOut((f - s) / d) : f < s + d + hold ? 1 : 1 - X.smooth((f - s - d - hold) / 10);
  const shake = (s, amp = 0.06) => { const k = E.shake(f, s, amp, 10); shk = shk.map((v, i) => v + k[i]); };
  const inTank = sh.name !== "keeper";
  if (inTank) ambient(f, MX, -0.5);

  switch (sh.name) {
    case "hook": case "crack": {
      const p1 = 20, p2 = WF(E, 5) - 1;
      put(S, MX + 0.05, 0, 0.0, -0.25);
      pose(S, f < 46 ? punchK(p1) : punchK(p2));
      eyes(S, f, 0.1, 0.25);
      if (f >= p1 + 3) { crackAt(R.crack, MX - 0.08, 0.45, f >= p2 + 3 ? 1.15 : 0.55); shake(p1 + 3, 0.04); }
      if (f >= p2 + 3) { crackAt(R.crack2, MX + 0.25, 0.65, 0.7, 1.1); shake(p2 + 3, 0.08); }
      if (sh.name === "hook") cam = E.camAt(f, [{ f: 0, pos: [MX + 0.7, 0.75, 2.4], look: [MX + 0.05, 0.62, 0], fov: 46 }, { f: 33, pos: [MX + 0.6, 0.72, 2.2], look: [MX + 0.05, 0.62, 0], fov: 46 }]);
      else cam = E.camAt(f, [{ f: 34, pos: [MX + 0.55, 0.75, 2.35], look: [MX + 0.05, 0.6, GZ], fov: 46 }, { f: 108, pos: [MX + 0.5, 0.75, 2.05], look: [MX + 0.05, 0.6, GZ], fov: 46 }]);
      if (f >= p2 + 2 && f < p2 + 30) FX.push({ kind: "burst", pos: [MX + 0.05, 0.85, GZ + 0.15], size: 0.45 * X.back(X.span(f, p2 + 2, p2 + 7)), opt: { col: "#fff3a8", text: "TAK!", size: 120 } });
      flash = f >= p2 + 3 && f < p2 + 8 ? 0.35 * (1 - (f - p2 - 3) / 5) : 0;
      if (sh.name === "hook") ov.push(big("KÜÇÜK", 1, "ama tehlikeli", TEAL, 140));
      else ov.push(big("cam kırıcı", X.span(f, WF(E, 6) - 2, WF(E, 6) + 6), "", NEON, 130));
      break;
    }
    case "name": {
      put(S, MX, 0, 0, -0.45);
      eyes(S, f, 0.9, 0);
      U.body.rotation.y = 0.12 * Math.sin(f / 14);
      cam = E.camAt(f, [{ f: 109, pos: [MX + 0.6, 0.75, 2.1], look: [MX, 0.62, 0], fov: 44 }, { f: 159, pos: [MX + 0.5, 0.75, 1.85], look: [MX, 0.64, 0], fov: 44 }]);
      dof = { focus: [MX, 0.5, 0], amount: 5 };
      ov.push(card("Mantis karidesi", "Stomatopoda · deniz canlısı"));
      break;
    }
    case "hand": {
      put(R.hand, MX - 0.35, 0, -0.2, 0.25);
      put(S, MX + 0.05, 0.2, -0.05, -0.55, 0.62);
      eyes(S, f, 0.3, 0.3);
      cam = E.camAt(f, [{ f: 160, pos: [MX + 0.4, 1.9, 2.9], look: [MX + 0.05, 0.25, -0.1], fov: 46 }, { f: 208, pos: [MX + 0.35, 1.8, 2.6], look: [MX + 0.05, 0.25, -0.1], fov: 46 }]);
      ov.push(big("≈ 10 cm", X.span(f, WF(E, 12) - 3, WF(E, 12) + 5), "bir avuç kadar", TEAL, 150));
      break;
    }
    case "cock": {
      put(S, MX - 0.2, 0, 0, 1.2);
      const k = X.smooth(X.span(f, WF(E, 16) - 4, WF(E, 16) + 14));
      pose(S, -k); eyes(S, f, 0.05, 0.5);
      if (k > 0.9) { U.body.position.x = 0.008 * Math.sin(f * 2.3); }
      cam = E.camAt(f, [{ f: 209, pos: [MX + 0.1, 0.8, 2.4], look: [MX + 0.05, 0.55, 0], fov: 46 }, { f: 293, pos: [MX + 0.1, 0.75, 2.1], look: [MX + 0.05, 0.55, 0], fov: 46 }]);
      ov.push(big("MERMİ", X.span(f, WF(E, 18) - 3, WF(E, 18) + 5), "gibi fırlatma", NEON, 150));
      break;
    }
    case "launch": {
      const s = 300;
      put(S, MX - 0.2, 0, 0, 1.2);
      pose(S, f < s ? -1 : X.easeOut(X.span(f, s, s + 3))); eyes(S, f, 0, 0.5);
      if (f >= s) { FX.push({ kind: "lines", pos: [MX + 0.1, 0.5, 0.3], size: 0.8 }); shake(s, 0.06); }
      flash = f >= s && f < s + 4 ? 0.3 : 0;
      cam = E.camAt(f, [{ f: 294, pos: [MX + 0.2, 0.8, 2.3], look: [MX + 0.15, 0.55, 0], fov: 46 }, { f: 362, pos: [MX + 0.2, 0.78, 2.1], look: [MX + 0.15, 0.55, 0], fov: 46 }]);
      const n = Math.round(23 * X.easeOut(X.span(f, WF(E, 22) - 4, WF(E, 24) + 4)));
      ov.push(big(`${n} m/s`, X.span(f, WF(E, 22) - 4, WF(E, 22) + 2), "≈ 80 km/sa", NEON, 170));
      break;
    }
    case "slow": {
      put(S, MX - 0.2, 0, 0, 1.2);
      pose(S, X.lerp(0.55, 1, X.smooth(X.span(f, 363, 403)))); eyes(S, f, 0, 0.5);
      cam = E.camAt(f, [{ f: 363, pos: [MX + 0.2, 0.75, 2.1], look: [MX + 0.3, 0.45, 0.2], fov: 44 }, { f: 403, pos: [MX + 0.6, 0.5, 1.45], look: [MX + 0.45, 0.4, 0.28], fov: 40 }], { creep: 0.02 });
      dof = { focus: [MX + 0.45, 0.38, 0.28], amount: 6 };
      ov.push(big("ağır çekim", 0.85, "", "#ffffff", 100));
      break;
    }
    case "bubbles": {
      put(S, MX - 0.2, 0, 0, 1.2); pose(S, 1); eyes(S, f, 0, 0.5);
      const tip = tipPos(S);
      R.cav.forEach((b, i) => {
        const born = 408 + i * 7, life = 40, a = f - born; if (a < 0 || a > life) return;
        const pop = WF(E, 37) - 2, popped = f >= pop + (i % 3) * 2;
        if (popped) return;
        const r = 0.4 + 0.9 * X.easeOut(a / 14);
        put(b, tip[0] + 0.05 + (rnd(i) - 0.3) * 0.18, tip[1] + (rnd(i + 2) - 0.5) * 0.16, tip[2] + (rnd(i + 4) - 0.5) * 0.12, 0, r);
      });
      const pop = WF(E, 37) - 2;
      if (f >= pop && f < pop + 14) FX.push({ kind: "sparkle", t: f / 30, pos: [tip[0] + 0.08, tip[1] + 0.02, tip[2] + 0.12], size: 0.45 });
      if (f >= pop && f < pop + 6) flash = 0.25;
      cam = E.camAt(f, [{ f: 404, pos: [tip[0] + 0.3, tip[1] + 0.15, tip[2] + 1.15], look: [tip[0] + 0.05, tip[1] + 0.05, tip[2]], fov: 42 }, { f: 503, pos: [tip[0] + 0.25, tip[1] + 0.15, tip[2] + 1.0], look: [tip[0] + 0.05, tip[1] + 0.05, tip[2]], fov: 42 }], { creep: 0.03 });
      dof = { focus: tip, amount: 6 };
      ov.push(big("baloncuk!", X.span(f, WF(E, 34) - 3, WF(E, 34) + 5), "oluşur… ve patlar", "#ffffff", 120));
      break;
    }
    case "prey": {
      const p1 = WF(E, 44) - 3, p2 = WF(E, 46) - 2;
      put(S, MX - 0.35, 0, 0, Math.PI / 2 - 0.2, 0.85);
      put(R.snail, MX + 0.6, 0, 0.12, Math.PI, 0.8);
      pose(S, f < p1 - 10 ? 0 : punchK(p1, 3, 40)); eyes(S, f, 0, 0);
      R.snail.userData.shell.rotation.z = f >= p1 ? 0.25 * Math.sin((f - p1) * 1.4) * Math.exp(-(f - p1) / 10) : 0;
      if (f >= p2) R.snail.userData.shell.rotation.z += 0.3 * Math.sin((f - p2) * 1.7) * Math.exp(-(f - p2) / 8);
      const bx = MX + 0.28;
      if (f >= p1 + 2 && f < p2) { const r = X.easeOut(X.span(f, p1 + 2, p1 + 12)); put(R.cav[0], bx, 0.32, 0.1, 0, 0.5 + 1.2 * r); }
      if (f >= p2 && f < p2 + 14) FX.push({ kind: "burst", pos: [bx, 0.34, 0.3], size: 0.6 * X.back(X.span(f, p2, p2 + 5)), opt: { col: "#ffffff" } });
      if (f >= p1 && f < p1 + 4) { shake(p1, 0.05); }
      if (f >= p2 && f < p2 + 6) { flash = 0.5 * (1 - (f - p2) / 6); shake(p2, 0.08); }
      cam = E.camAt(f, [{ f: 504, pos: [MX - 0.05, 1.1, 3.9], look: [MX - 0.02, 0.55, 0], fov: 46 }, { f: 641, pos: [MX, 1.0, 3.5], look: [MX, 0.55, 0], fov: 46 }]);
      if (f < p1) ov.push(big("2 darbe", X.span(f, WF(E, 40) - 3, WF(E, 40) + 5), "tek vuruşta", NEON, 140));
      else if (f < p2) ov.push(big("1", 1, "yumruk", NEON, 220 + 40 * (1 - X.back(X.span(f, p1, p1 + 6)))));
      else ov.push(big("2", 1, "baloncuk", "#ffffff", 220 + 40 * (1 - X.back(X.span(f, p2, p2 + 6)))));
      break;
    }
    case "hot": {
      const k = X.smooth(X.span(f, 646, 690));
      put(R.hotB, MX, 0.5, 0, 0, 1 + 0.25 * Math.sin(f / 3) * k);
      R.bub.slice(0, 10).forEach((b, i) => put(b, MX + Math.cos(i + f / 25) * 0.45, 0.5 + Math.sin(i * 2.1 + f / 20) * 0.35, Math.sin(i) * 0.2 - 0.2, 0, 0.8));
      cam = E.camAt(f, [{ f: 642, pos: [MX, 0.55, 1.3], look: [MX, 0.5, 0], fov: 44 }, { f: 735, pos: [MX, 0.55, 1.0], look: [MX, 0.5, 0], fov: 44 }], { creep: 0.03 });
      tint = `rgba(255,120,30,${0.06 + 0.16 * k * (0.7 + 0.3 * Math.sin(f / 2.5))})`;
      flash = f >= WF(E, 53) - 2 && f < WF(E, 53) + 4 ? 0.35 : 0; flashCol = "#ffd27a";
      ov.push(big("binlerce °C", X.span(f, WF(E, 53) - 3, WF(E, 53) + 5), "bir an için", NEON, 140));
      break;
    }
    case "keeper": {
      light = "interior"; tint = null;
      A.push({ id: "aq", pos: [-0.25, 0, 0.2], st: st(21, { face: f > 790 ? "determined" : "happy", arms: "hold", look: 0.4 }) });
      put(R.carry, -0.25, 0.5, 0.55, 0.15);
      eyes(R.carryShrimp, f, 0.3, 0);
      cam = E.camAt(f, [{ f: 736, pos: [0.4, 1.3, 4.6], look: [-0.1, 1.45, 0], fov: 46 }, { f: 830, pos: [0.3, 1.2, 3.6], look: [-0.15, 1.35, 0.3], fov: 46 }]);
      focusPt = [0, 0, 0];
      ov.push(big("KALIN CAM", X.span(f, WF(E, 58) - 3, WF(E, 58) + 5), "akvaryumcunun kuralı", TEAL, 140));
      break;
    }
    case "bored": {
      put(S, MX, 0, 0.0, -0.2); eyes(S, f, 0.05, 0.7 * Math.sin(f / 9));
      U.body.rotation.z = 0.08 * Math.sin(f / 8);
      FX.push({ kind: "anger", pos: [MX + 0.3, 1.0, 0.3], size: 0.3 + 0.04 * Math.sin(f / 3) });
      cam = E.camAt(f, [{ f: 831, pos: [MX + 0.3, 0.75, 2.1], look: [MX, 0.62, 0], fov: 44 }, { f: 868, pos: [MX + 0.25, 0.75, 1.9], look: [MX, 0.62, 0], fov: 44 }]);
      ov.push(big("sıkıldı…", X.span(f, WF(E, 64) - 3, WF(E, 64) + 5), "", "#ffffff", 120));
      break;
    }
    case "escape": {
      const hits = [872, 886, 898];
      put(S, MX + 0.05, 0, 0.0, -0.2); eyes(S, f, 0, 0);
      let k = 0; hits.forEach((h, i) => { const p = punchK(h, 3, 3); if (f >= h - 10 && f < h + 16) k = p; if (f >= h + 3) { shake(h + 3, 0.04 + i * 0.03); } });
      pose(S, k);
      const n = hits.filter((h) => f >= h + 3).length;
      crackAt(R.crack, MX - 0.05, 0.5, [0.4, 0.7, 1.0, 1.4][n]);
      if (n >= 2) crackAt(R.crack2, MX + 0.4, 0.95, n >= 3 ? 1.0 : 0.6, 1.2);
      if (f >= 898 + 3 && f < 898 + 24) FX.push({ kind: "burst", pos: [MX + 0.02, 0.5, GZ + 0.2], size: 0.42 * X.back(X.span(f, 901, 907)), opt: { col: "#fff3a8", text: "ÇATIR!", size: 80 } });
      if (f >= 901 && f < 906) flash = 0.3;
      cam = E.camAt(f, [{ f: 869, pos: [MX + 0.4, 0.78, 2.5], look: [MX, 0.62, 0.3], fov: 46 }, { f: 923, pos: [MX + 0.3, 0.75, 2.2], look: [MX, 0.62, 0.3], fov: 46 }]);
      ov.push(big("KAÇIŞ!", X.span(f, WF(E, 66) - 3, WF(E, 66) + 5), "evini kırar", NEON, 150));
      break;
    }
    case "end": {
      put(S, MX, 0, 0.0, -0.3); eyes(S, f, 0.4, 0);
      pose(S, -0.6 - 0.2 * Math.sin(f / 6));
      U.body.position.y = 0.03 * Math.abs(Math.sin(f / 8));
      crackAt(R.crack, MX - 0.45, 0.35, 1.3);
      FX.push({ kind: "sparkle", t: f / 30, pos: [MX, 1.15, 0.3], size: 0.5 });
      cam = E.camAt(f, [{ f: 924, pos: [MX + 0.3, 0.8, 2.4], look: [MX, 0.66, 0], fov: 46 }, { f: 1023, pos: [MX + 0.25, 0.8, 2.15], look: [MX, 0.66, 0], fov: 46 }]);
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 926, 934), f >= WF(E, 71) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  cam.pos = cam.pos.map((v, i) => v + shk[i]);
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, flashCol, overlay: fin, focusPt };
}
