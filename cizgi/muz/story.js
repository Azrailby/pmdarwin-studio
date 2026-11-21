// Muz Gerçekten Radyoaktif mi? — PMDARWIN (~34 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [50, "normal"], [94, "xray"], [250, "lab"], [382, "bite"], [407, "plane"], [515, "pile"],
  [598, "mountain"], [704, "body"], [810, "relax"], [854, "look"], [934, "end"]];
const END = 1032;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const YEL = "#ffd93a", RAD = "#7dff5a", PURP = "#9a6aff";
const LX = 100, PX = 200, XX = 300, MX = 400; // lab, uçak, röntgen, muz dağı (mutfak x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

// muz: XY düzleminde kıvrık tüp, ~1 m uzunluk (ölçekle küçültülür)
function bananaGeo(E, seg = 20, rad = 0.1) {
  const TH = E.THREE, c = new TH.QuadraticBezierCurve3(new TH.Vector3(-0.5, 0.14, 0), new TH.Vector3(0, -0.16, 0), new TH.Vector3(0.5, 0.14, 0));
  return { geo: new TH.TubeGeometry(c, seg, rad, 8, false), c };
}
function makeBanana(E, o = {}) {
  const TH = E.THREE, g = E.group(null, [0, -50, 0]);
  const { geo, c } = bananaGeo(E, o.seg || 20, o.rad || 0.1);
  const m = o.mat || E.mat(YEL, o.glow ? { emissive: "#6aff3a", glow: 0 } : {});
  const body = E.add(new TH.Mesh(geo, m), g); g.userData.body = body; g.userData.mat = m;
  const a = c.getPoint(0), b = c.getPoint(1);
  E.sphere((o.rad || 0.1) * 0.98, m, [b.x, b.y, 0], { parent: g, seg: 10 });
  E.sphere((o.rad || 0.1) * 0.98, m, [a.x, a.y, 0], { parent: g, seg: 10 });
  E.sphere(0.035, E.mat("#4a3a22"), [b.x + 0.06, b.y + 0.03, 0], { parent: g, seg: 6 });
  const st = E.cyl(0.04, 0.05, 0.14, E.mat("#7a8a3a"), [a.x - 0.05, a.y + 0.06, 0], { parent: g, center: true, seg: 6 }); st.rotation.z = 0.9;
  return g;
}
function makeCute(E) {
  const g = makeBanana(E, { rad: 0.13 });
  const face = E.group(g, [0.03, -0.02, 0.11]); g.userData.face = face;
  for (const s of [-1, 1]) { E.sphere(0.045, E.mat("#ffffff"), [s * 0.07, 0.03, 0.02], { parent: face, seg: 10 }); E.sphere(0.024, E.mat("#120c18"), [s * 0.07, 0.03, 0.06], { parent: face, seg: 8 }); }
  const sm = new E.THREE.Mesh(new E.THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI), E.mat("#5b1d2a")); sm.rotation.z = Math.PI; sm.position.set(0, -0.04, 0.04); E.add(sm, face);
  g.userData.arms = [];
  for (const s of [-1, 1]) { const ar = E.group(g, [s * 0.15, -0.08, 0.05]); const c = E.cyl(0.018, 0.018, 0.22, E.mat("#5a3a22"), [0, 0, 0], { parent: ar, seg: 6 }); E.sphere(0.035, E.mat("#ffffff"), [0, 0.24, 0], { parent: ar, seg: 8 }); g.userData.arms.push(ar); }
  return g;
}
function makePeeled(E) {
  const g = E.group(null, [0, -50, 0]);
  E.cyl(0.085, 0.095, 0.6, E.mat("#fff4c8"), [0, 0, 0], { parent: g, seg: 12 });
  E.sphere(0.085, E.mat("#fff4c8"), [0, 0.6, 0], { parent: g, seg: 12 });
  E.cyl(0.1, 0.1, 0.32, E.mat(YEL), [0, -0.3, 0], { parent: g, seg: 12 });
  for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI * 2, fl = E.group(g, [Math.cos(a) * 0.08, 0.02, Math.sin(a) * 0.08]); fl.rotation.set(Math.sin(a) * 2.4, 0, -Math.cos(a) * 2.4); E.box(0.1, 0.32, 0.02, E.mat(YEL), [0, 0, 0], { parent: fl }); }
  return g;
}
function makeGeiger(E) {
  const g = E.group(null, [0, -50, 0]);
  E.box(0.32, 0.2, 0.16, E.mat("#f2c23a"), [0, 0, 0], { parent: g });
  E.box(0.18, 0.11, 0.01, E.mat("#f4efe4"), [-0.03, 0.05, 0.085], { parent: g });
  const nd = E.box(0.008, 0.08, 0.005, E.mat("#e04848"), [-0.03, 0.06, 0.092], { parent: g }); nd.geometry.translate(0, 0.035, 0); g.userData.needle = nd;
  E.box(0.06, 0.06, 0.12, E.mat("#2b2f3a"), [0.11, 0.2, 0], { parent: g });
  const w = E.cyl(0.025, 0.025, 0.4, E.mat("#9aa3b2"), [0.0, 0.1, 0.0], { parent: g, center: true, seg: 8 }); w.rotation.z = Math.PI / 2; w.position.set(-0.36, 0.12, 0);
  return g;
}
function makeScale(E, parent, pos) {
  const g = E.group(parent, pos), brass = E.mat("#e3b54a", { emissive: "#6a4a10", glow: 0.2 });
  E.cyl(0.22, 0.28, 0.06, brass, [0, 0, 0], { parent: g, seg: 20 });
  E.cyl(0.03, 0.04, 0.8, brass, [0, 0.06, 0], { parent: g, seg: 10 });
  const beam = E.group(g, [0, 0.88, 0]); g.userData.beam = beam;
  E.box(1.1, 0.05, 0.05, brass, [0, 0, 0], { parent: beam, center: true });
  g.userData.pans = [];
  for (const sx of [-1, 1]) { const hang = E.group(beam, [sx * 0.52, 0, 0]); for (const dz of [-0.09, 0.09]) E.cyl(0.005, 0.005, 0.32, E.mat("#8a7a5a"), [0, -0.32, dz], { parent: hang, seg: 4 }); E.cyl(0.16, 0.12, 0.04, brass, [0, -0.36, 0], { parent: hang, seg: 20 }); g.userData.pans.push(hang); }
  return g;
}
function makePlaneToy(E) {
  const g = E.group(null, [0, 0, 0]), w = E.mat("#f4f6f8"), b = E.mat("#3f7ad8");
  const f = E.cyl(0.05, 0.04, 0.4, w, [0, 0, 0], { parent: g, center: true, seg: 10 }); f.rotation.z = Math.PI / 2;
  E.box(0.12, 0.012, 0.42, b, [0.02, 0, 0], { parent: g, center: true });
  E.box(0.06, 0.1, 0.012, b, [-0.17, 0.05, 0], { parent: g, center: true });
  return g;
}
function bbTex(E) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d");
  g.fillStyle = "#2f4a3a"; g.fillRect(0, 0, 1024, 512);
  g.strokeStyle = "#fff6c8"; g.lineWidth = 14; g.lineCap = "round";
  g.beginPath(); g.moveTo(90, 190); g.quadraticCurveTo(250, 400, 420, 190); g.stroke();
  g.beginPath(); g.moveTo(110, 250); g.quadraticCurveTo(250, 340, 400, 250); g.stroke();
  g.fillStyle = "#fff6c8"; g.font = "900 96px CizgiFont, Nunito, sans-serif"; g.textAlign = "left"; g.textBaseline = "middle";
  g.fillText("= 1 MUZ", 470, 210); g.font = "800 70px CizgiFont, Nunito, sans-serif"; g.fillStyle = "#8dffc9"; g.fillText("≈ 0,1 µSv", 490, 330);
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- mutfak (x=0) ----
  S.room({ w: 10, d: 8, wall: T.tiles("#fff8e0", "#ffe9a8", 10), floor: T.tiles("#f4efe6", "#d9c9a8", 6), window: true, door: false });
  S.counter(1.6, -3.5, { w: 4.2, col: "#4a8a7a", top: "#f4efe6" });
  S.shelf(-3.2, -3.6, { seed: 5 });
  R.table = S.table(0, -1.0, { w: 2.0, d: 1.0, cloth: "#ffd93a" });
  // ---- laboratuvar (x=LX) ----
  S.room({ x: LX, w: 10, d: 8, wall: T.tiles("#eef6f2", "#dfeee6", 10), floor: T.tiles("#e8eef0", "#cfd8dc", 6), window: false, door: true });
  E.box(3.6, 1.9, 0.1, E.mat("#ffffff", { map: bbTex(E) }), [LX + 0.3, 1.0, -3.9]);
  E.box(3.8, 0.1, 0.18, E.mat("#8a5a36"), [LX + 0.3, 0.95, -3.85]);
  S.table(LX + 2.2, -2.6, { w: 1.6, d: 0.8, col: "#9aa3b2" });
  for (let i = 0; i < 3; i++) E.cyl(0.07, 0.09, 0.3, E.mat(["#7cc4ff", "#7dff5a", "#ff7eb6"][i], { transparent: true, opacity: 0.8 }), [LX + 1.8 + i * 0.3, 0.95, -2.6], { seg: 12 });
  E.actor("sci", { jacket: "#f4f1ea", shirt: "#7c8fa3", pants: "#3a3a44", tie: "#2b8a6a", hair: "bun", hairCol: "#5a3a22", glasses: true, skin: "#c98f66", seed: 9 });
  // ---- uçak kabini (x=PX) ----
  E.box(6, 0.1, 6, E.mat("#ffffff", { map: T.carpet("#3f5f8a", "#2f4a6a") }), [PX, -0.1, 0]);
  E.box(6, 3.2, 0.2, E.mat("#eef0f4"), [PX, 0, -1.4]);
  const winTex = E.T.sign("", { bg: "#8ec5f0", border: null });
  for (const x of [-1.2, 0.2, 1.6]) {
    E.box(0.7, 0.95, 0.06, E.mat("#d8dce4"), [PX + x, 1.15, -1.28]);
    E.plane(0.5, 0.72, E.flat("#ffffff", { map: winTex }), [PX + x, 1.62, -1.24], { noink: true });
    E.cloud(PX + x - 0.05, 1.7, -1.22, 0.022, 3);
  }
  E.box(6, 0.5, 0.6, E.mat("#e8eaf0"), [PX, 2.7, -1.1]);
  for (const x of [-0.9, 0.0, 0.9]) { E.box(0.75, 0.5, 0.7, E.mat("#2f5f9a"), [PX + x, 0, 0.0]); E.box(0.75, 1.3, 0.18, E.mat("#2f5f9a"), [PX + x, 0.3, -0.35]); E.box(0.72, 0.22, 0.2, E.mat("#f4f6f8"), [PX + x, 1.55, -0.35]); }
  R.tray = E.box(0.7, 0.04, 0.4, E.mat("#9aa3b2"), [PX + 0.9, 0.92, 0.9]);
  R.scale = makeScale(E, null, [PX + 0.75, 0.96, 0.8]); R.scale.scale.setScalar(0.62); R.tray.position.set(PX + 0.75, 0.92, 0.8);
  { const bn = makeBanana(E); R.scale.userData.pans[0].add(bn); bn.position.set(0, -0.28, 0); bn.scale.setScalar(0.22); bn.visible = true;
    const pt = makePlaneToy(E); R.scale.userData.pans[1].add(pt); pt.position.set(0, -0.26, 0); pt.scale.setScalar(0.6); }
  // ---- röntgen boşluğu (x=XX) ----
  E.box(14, 0.1, 10, E.mat("#13213a"), [XX, -0.1, 0]);
  E.box(14, 8, 0.2, E.mat("#ffffff", { map: T.tiles("#1a2d4f", "#182946", 12) }), [XX, -0.1, -3]);
  R.xban = makeBanana(E, { rad: 0.1, mat: E.mat("#ffe680", { transparent: true, opacity: 0.32, side: TH.DoubleSide }) });
  R.xban.userData.body.castShadow = false;
  R.K = [];
  for (let i = 0; i < 9; i++) {
    const kg = E.group(null, [0, -50, 0]);
    const m = E.mat(i === 4 ? "#b48cff" : PURP, i === 4 ? { emissive: "#5aff3a", glow: 0 } : {});
    E.sphere(0.075, m, [0, 0, 0], { parent: kg, seg: 12 });
    const lb = E.label(T.sign("K", { bg: "#ffffff", fg: "#4a2a8a", size: 300, w: 256, h: 256, border: null }), 0.06, 0.06, [0, 0, 0.08], { parent: kg, lit: false });
    kg.userData.m = m; R.K.push(kg);
  }
  // ---- muz dağı (x=MX) ----
  E.ground(T.grass("#8fbf5f"), 120, 0.25, [MX, 0.005, 0]);
  S.hills({ z: -60, col: "#8fbf5f" }); S.clouds({ n: 4, y: 30, z: -90 });
  const pm = E.mat(YEL), { geo } = bananaGeo(E, 8, 0.1);
  for (let i = 0; i < 260; i++) {
    const h = Math.pow(rnd(i + 3), 0.8) * 4.2, r = (4.2 - h) * 0.75 * Math.sqrt(rnd(i + 9)), a = rnd(i + 21) * Math.PI * 2;
    const m = new TH.Mesh(geo, pm); m.position.set(MX + Math.cos(a) * r, h + 0.1, -2.5 + Math.sin(a) * r); m.rotation.set(rnd(i) * 3, rnd(i + 1) * 3, rnd(i + 2) * 3); m.scale.setScalar(0.5); E.add(m);
  }
  // ---- nesneler ----
  R.ban = makeBanana(E, { glow: true });
  R.ban2 = makeBanana(E);
  R.cute = makeCute(E);
  R.peeled = makePeeled(E);
  R.geiger = makeGeiger(E);
  R.pile = E.group(null, [0, -50, 0]);
  for (let i = 0; i < 26; i++) { const b = new TH.Mesh(geo, pm); const r = rnd(i + 40) * 0.6, a = rnd(i + 41) * 6.28; b.position.set(Math.cos(a) * r, 0.05 + (0.6 - r) * 0.5 * rnd(i + 42), Math.sin(a) * r * 0.5); b.rotation.set(0, rnd(i + 43) * 3, rnd(i + 44) * 0.6); b.scale.setScalar(0.3); E.add(b, R.pile); }
  // ---- karakter ----
  E.actor("me", { shirt: "#3fbf6a", pants: "#3b3f52", hair: "short", hairCol: "#3a2a20", skin: "#f0c9a4", seed: 61 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(36,30,6,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = YEL; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff2b8"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = YEL, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#1d1608"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  for (const o of [R.ban, R.ban2, R.cute, R.peeled, R.geiger, R.pile, R.xban]) hide(o);
  R.K.forEach(hide); R.ban.userData.mat.emissiveIntensity = 0; R.K[4].userData.m.emissiveIntensity = 0;
}
// sağ elde tutulan muz (holdR pozu), karakter x,z'de, kameraya dönük
const handR = (x, z) => [x + 0.43, 0.98, z + 0.06];

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "interior", dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, 0], tint = null;
  reset();
  const holdBan = (x, z, yaw = 0.3, glow = 0) => { const p = handR(x, z); put(R.ban, p[0] + 0.02, p[1] + 0.12, p[2], yaw, 0.38); R.ban.rotation.z = 0.5; R.ban.userData.mat.emissiveIntensity = glow; };

  switch (sh.name) {
    case "hook": case "normal": {
      const shrug = sh.name === "normal";
      A.push({ id: "me", pos: [-0.05, 0, 0.2], st: st(61, { face: shrug ? (f > WF(E, 6) - 3 ? "grin" : "smug") : f > WF(E, 2) - 3 ? "shock" : "happy", arms: shrug ? "shrug" : "holdR", look: shrug ? 0 : 0.6 }) });
      if (!shrug) holdBan(-0.05, 0.2, 0.2, 0.25 + 0.2 * Math.sin(f / 3)); else { put(R.ban, 0.32, 1.25, 0.28, 0.2, 0.38); R.ban.rotation.z = 0.4; R.ban.userData.mat.emissiveIntensity = 0.15; }
      put(R.geiger, 0.8, 0.82, 0.5, -0.4);
      const tick = (f % 7) < 2;
      R.geiger.userData.needle.rotation.z = -0.6 + 0.5 * Math.abs(Math.sin(f / 2.3));
      if (!shrug && tick) FX.push({ kind: "burst", pos: [0.95, 1.35, 0.55], size: 0.22, opt: { col: "#fff3a8", text: "tık", size: 130 } });
      if (shrug && f > WF(E, 6) - 3) FX.push({ kind: "check", pos: [0.6, 2.25, 0.3], size: 0.35 * X.back(X.span(f, WF(E, 6) - 3, WF(E, 6) + 5)) });
      cam = E.camAt(f, [{ f: 0, pos: [0.15, 1.3, 3.3], look: [0.1, 1.45, 0], fov: 46 }, { f: 49, pos: [0.2, 1.3, 2.9], look: [0.15, 1.45, 0], fov: 46 }, { f: 93, pos: [0.15, 1.3, 3.4], look: [0.05, 1.5, 0], fov: 46 }]);
      if (!shrug) ov.push(big(f < WF(E, 2) - 3 ? "MUZ" : "RADYOAKTİF", 1, "", f < WF(E, 2) - 3 ? YEL : RAD, f < WF(E, 2) - 3 ? 180 : 130));
      else ov.push(big("NORMAL", X.span(f, WF(E, 6) - 3, WF(E, 6) + 5), "tamamen", "#ffffff", 160));
      break;
    }
    case "xray": {
      light = "day"; tint = "rgba(30,60,140,0.12)";
      const XS = 1.6; put(R.xban, XX, 1.45, 0, 0, XS);
      R.K.forEach((k, i) => { const tt = (i + 0.5) / 9, yy = 0.14 * ((1 - tt) * (1 - tt) + tt * tt) - 0.32 * (1 - tt) * tt; put(k, XX + XS * (tt - 0.5) * 0.98 + 0.015 * Math.sin(f / 9 + i), 1.45 + XS * yy + 0.02 * Math.sin(f / 7 + i * 2), 0.0, 0, 1.15); });
      const gk = X.span(f, WF(E, 16) - 4, WF(E, 16) + 8);
      R.K[4].userData.m.emissiveIntensity = gk * (0.9 + 0.5 * Math.sin(f / 2));
      if (gk > 0) FX.push({ kind: "sparkle", t: f / 30, pos: [R.K[4].position.x, R.K[4].position.y + 0.15, 0.2], size: 0.45 * gk });
      cam = E.camAt(f, [{ f: 94, pos: [XX, 1.2, 3.7], look: [XX, 1.6, 0], fov: 46 }, { f: 152, pos: [XX, 1.2, 3.3], look: [XX, 1.6, 0], fov: 46 }, { f: 249, pos: [XX, 1.25, 2.0], look: [XX, 1.45, 0], fov: 46 }]);
      if (f < 152) ov.push(big("POTASYUM", X.span(f, WF(E, 9) - 3, WF(E, 9) + 5), "bol bol K", PURP, 140));
      else { ov.push(card("Potasyum-40", "doğal radyoaktif · çok az")); ov.push(big("%0,012", X.span(f, WF(E, 12) - 3, WF(E, 12) + 5), "radyoaktif", RAD, 140)); }
      break;
    }
    case "lab": {
      const pt = f > 300;
      A.push({ id: "sci", pos: [LX - 0.95, 0, -2.4], st: st(9, { face: pt ? "happy" : "think", arms: pt ? "point" : "chin", look: 0.7 }) });
      cam = E.camAt(f, [{ f: 250, pos: [LX + 0.3, 1.55, 3.2], look: [LX + 0.25, 1.75, -3], fov: 46 }, { f: 381, pos: [LX + 0.3, 1.55, 2.6], look: [LX + 0.25, 1.75, -3], fov: 46 }]);
      focusPt = [LX, 0, -2];
      if (f >= WF(E, 27) - 3) ov.push(big("Muz Eşdeğer Dozu", X.span(f, WF(E, 27) - 3, WF(E, 27) + 5), "bilimde gerçek bir birim", YEL, 100));
      else ov.push(big("ölçü birimi", X.span(f, WF(E, 24) - 3, WF(E, 24) + 5), "", "#ffffff", 110));
      break;
    }
    case "bite": {
      const b = WF(E, 32) - 2, bit = f >= b;
      A.push({ id: "me", pos: [0, 0, 0], st: st(61, { face: bit ? "laugh" : "wow", arms: "holdR", look: 0.3, bob: 0, tilt: 0, headTilt: 0 }) });
      const k = X.smooth(X.span(f, 382, b));
      const p = handR(0, 0);
      put(R.ban, X.lerp(p[0], 0.24, k), X.lerp(p[1] + 0.12, 1.28, k), p[2] + 0.04, 0, 0.38); R.ban.rotation.z = X.lerp(0.5, 1.2, k);
      if (bit) { R.ban.scale.x = 0.3; FX.push({ kind: "puff", t: X.span(f, b, b + 12), pos: [0.15, 1.3, 0.1], size: 0.25 }); }
      cam = E.camAt(f, [{ f: 382, pos: [0.15, 1.45, 2.2], look: [0.05, 1.5, 0], fov: 42 }, { f: 406, pos: [0.15, 1.45, 2.0], look: [0.05, 1.5, 0], fov: 42 }]);
      ov.push(big("HAM!", X.span(f, b, b + 4), "", YEL, 170));
      break;
    }
    case "plane": {
      light = "day"; tint = null;
      A.push({ id: "me", pos: [PX + 0.0, 0.02, 0.0], st: st(61, { face: f > 470 ? "think" : "happy", arms: "hang", legs: "sit", look: 0.6 }), blob: false });
      const tilt = 0.12 * Math.sin(f / 12) * (1 - X.span(f, WF(E, 36), WF(E, 37) + 10));
      R.scale.userData.beam.rotation.z = tilt; R.scale.userData.pans.forEach((pn) => (pn.rotation.z = -tilt));
      cam = E.camAt(f, [{ f: 407, pos: [PX + 0.45, 1.5, 3.6], look: [PX + 0.35, 1.3, 0], fov: 48 }, { f: 514, pos: [PX + 0.45, 1.45, 3.2], look: [PX + 0.4, 1.3, 0], fov: 48 }]);
      focusPt = [PX, 0, 0];
      ov.push(big("1 muz = 1-2 dk uçuş", X.span(f, WF(E, 36) - 3, WF(E, 36) + 5), "aynı radyasyon", YEL, 95));
      break;
    }
    case "pile": {
      put(R.pile, 0, 0.95, -1.0, 0, 1);
      A.push({ id: "me", pos: [-0.95, 0, 0.1], st: st(61, { face: "think", arms: "chin", look: 0.7 }) });
      FX.push({ kind: "question", pos: [-0.5, 2.4, 0.2], size: 0.4 + 0.03 * Math.sin(f / 5) });
      cam = E.camAt(f, [{ f: 515, pos: [-0.3, 1.5, 3.4], look: [-0.35, 1.3, -0.4], fov: 48 }, { f: 597, pos: [-0.3, 1.45, 3.0], look: [-0.35, 1.3, -0.4], fov: 48 }]);
      ov.push(big("kaç muz?", X.span(f, WF(E, 45) - 3, WF(E, 45) + 5), "tehlikeli olması için", "#ffffff", 140));
      break;
    }
    case "mountain": {
      light = "day"; tint = null;
      A.push({ id: "me", pos: [MX + 0.6, 0, 1.6], st: st(61, { face: "shock", arms: "up", look: -0.5 }) });
      cam = E.camAt(f, [{ f: 598, pos: [MX + 1.6, 1.2, 8.5], look: [MX + 0.2, 2.6, -1.5], fov: 55 }, { f: 703, pos: [MX + 1.4, 1.3, 7.5], look: [MX + 0.2, 2.6, -1.5], fov: 55 }]);
      focusPt = [MX, 0, 0];
      const n = Math.round(35000000 * X.easeOut(X.span(f, WF(E, 49) - 3, WF(E, 51) + 8)));
      ov.push(big(n.toLocaleString("tr-TR"), 1, f > WF(E, 52) - 3 ? "muz · aynı anda" : "muz", YEL, 120));
      break;
    }
    case "body": {
      light = "day"; tint = "rgba(30,60,140,0.12)";
      A.push({ id: "me", pos: [XX, 0, 0], st: st(61, { face: f > WF(E, 62) ? "smug" : "happy", arms: "hip", look: 0 }), tint: "#cfe0ff" });
      R.K.forEach((k, i) => { const p = ((f - 704) / 60 + i / 9) % 1; const x = XX - 1.3 + 2.6 * p, y = 1.2 + 0.25 * Math.sin(p * Math.PI * 2 + i); put(k, x, y, 0.25, 0, 1.0); });
      cam = E.camAt(f, [{ f: 704, pos: [XX, 1.35, 3.9], look: [XX, 1.5, 0], fov: 46 }, { f: 809, pos: [XX, 1.35, 3.5], look: [XX, 1.5, 0], fov: 46 }]);
      ov.push(big("giren = çıkan", X.span(f, WF(E, 62) - 3, WF(E, 62) + 5), "vücut dengeyi korur", PURP, 120));
      FX.push({ kind: "lines", pos: [XX - 1.0, 1.25, 0.3], size: 0.5 });
      break;
    }
    case "relax": {
      A.push({ id: "me", pos: [0, 0, 0.2], st: st(61, { face: "happy", arms: "holdR", look: 0.4 }) });
      const p = handR(0, 0.2); put(R.peeled, p[0] + 0.02, p[1] - 0.02, p[2] + 0.02, 0, 0.75);
      cam = E.camAt(f, [{ f: 810, pos: [0.25, 1.4, 3.2], look: [0.15, 1.45, 0], fov: 46 }, { f: 853, pos: [0.25, 1.4, 2.9], look: [0.15, 1.45, 0], fov: 46 }]);
      ov.push(big("korkma!", X.span(f, WF(E, 66) - 3, WF(E, 66) + 5), "", "#ffffff", 150));
      break;
    }
    case "look": {
      A.push({ id: "me", pos: [0, 0, 0.2], st: st(61, { face: "sly", arms: "holdR", look: 0.9, sweat: f > 880, bob: 0, headTilt: 4 }) });
      holdBan(0, 0.2, 0.3, 0.12 + 0.12 * Math.sin(f / 4));
      cam = E.camAt(f, [{ f: 854, pos: [0.3, 1.45, 2.6], look: [0.2, 1.4, 0], fov: 44 }, { f: 933, pos: [0.3, 1.4, 1.8], look: [0.25, 1.35, 0], fov: 44 }], { creep: 0.05 });
      ov.push(big("hımm…", X.span(f, WF(E, 71) - 3, WF(E, 71) + 5), "biraz farklı", YEL, 140));
      break;
    }
    case "end": {
      put(R.cute, 0, 0.9 + 0.04 * Math.abs(Math.sin(f / 6)), 0.2, 0, 1.15); R.cute.rotation.z = Math.PI / 2 + 0.08 * Math.sin(f / 9);
      R.cute.userData.face.rotation.z = -Math.PI / 2; R.cute.userData.face.position.set(0.02, -0.02, 0.13);
      R.cute.userData.arms[0].rotation.z = 1.0 + 0.5 * Math.sin(f / 3); R.cute.userData.arms[1].rotation.z = -0.4;
      FX.push({ kind: "sparkle", t: f / 30, pos: [0.1, 1.75, 0.4], size: 0.6 });
      cam = E.camAt(f, [{ f: 934, pos: [0.0, 0.95, 2.9], look: [0, 1.1, 0], fov: 46 }, { f: 1031, pos: [0.0, 0.95, 2.6], look: [0, 1.1, 0], fov: 46 }]);
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 936, 944), f >= WF(E, 76) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
