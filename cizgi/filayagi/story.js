// Çernobil'in Fil Ayağı — PMDARWIN (~34 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [70, "timer"], [149, "reactor"], [216, "core"], [281, "flow"], [382, "solid"], [500, "name"],
  [558, "dose"], [679, "cart"], [802, "today"], [891, "still"], [932, "end"]];
const END = 1026;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const YEL = "#f2c23a", RED = "#e8402c", PALE = "#cfe0c0";
const RX = 100, KX = 200; // reaktör dışı, kesit (koridor x=0)
const MZ = -10; // kütlenin koridordaki yeri
let R = {};
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function canvasTex(TH, w, h, draw) { const c = document.createElement("canvas"); c.width = w; c.height = h; draw(c.getContext("2d"), w, h); const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; t.anisotropy = 8; return t; }
function trefoil(g, cx, cy, r, col) {
  g.save(); g.fillStyle = col; g.beginPath(); g.arc(cx, cy, r * 0.15, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 3; i++) { const a = -Math.PI / 2 + i * (Math.PI * 2 / 3) + Math.PI / 3, a0 = a - Math.PI / 6, a1 = a + Math.PI / 6; g.beginPath(); g.arc(cx, cy, r, a0, a1); g.arc(cx, cy, r * 0.24, a1, a0, true); g.closePath(); g.fill(); }
  g.restore();
}

function makeFoot(E, m) {
  const g = E.group(null, [0, -50, 0]);
  E.cyl(0.62, 0.72, 0.5, m.a, [0, 0, 0], { parent: g, seg: 18 });
  E.cyl(0.5, 0.62, 0.5, m.a, [0, 0.5, 0], { parent: g, seg: 18 });
  E.cyl(0.4, 0.5, 0.35, m.b, [0, 1.0, 0], { parent: g, seg: 18 });
  E.sphere(0.4, m.a, [0, 1.35, 0], { parent: g, seg: 16, scale: [1, 0.45, 1] });
  const bl = [[0.3, 0.25, 0.2], [1.4, 0.35, 0.22], [2.5, 0.2, 0.18], [3.6, 0.3, 0.2], [4.7, 0.28, 0.21], [5.6, 0.22, 0.17],
    [0.8, 0.75, 0.17], [2.0, 0.8, 0.16], [3.1, 0.7, 0.18], [4.2, 0.78, 0.15], [5.2, 0.72, 0.16], [0.2, 1.15, 0.13], [1.9, 1.2, 0.12], [3.9, 1.18, 0.13]];
  bl.forEach(([a, y, r], i) => { const rad = y < 0.5 ? 0.62 : y < 1.0 ? 0.52 : 0.42; E.sphere(r, i % 3 === 0 ? m.c : m.b, [Math.sin(a) * rad, y, Math.cos(a) * rad], { parent: g, seg: 10, scale: [1, 0.8, 1] }); });
  for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45; E.sphere(0.17, m.a, [Math.sin(a) * 0.72, 0.06, Math.cos(a) * 0.72], { parent: g, seg: 10, scale: [1.1, 0.55, 1.1] }); }
  return g;
}
function makeLeg(E) {
  const g = E.group(null, [0, -50, 0]), skin = E.mat("#5e5c64"), dk = E.mat("#4a4850");
  E.cyl(0.28, 0.36, 1.35, skin, [0, 0, 0], { parent: g, seg: 16 });
  for (let i = 0; i < 4; i++) E.cyl(0.32 - i * 0.012, 0.32 - i * 0.012, 0.03, dk, [0, 0.35 + i * 0.12, 0], { parent: g, center: true, seg: 16 });
  for (let i = 0; i < 3; i++) { const a = -0.55 + i * 0.55; E.sphere(0.1, E.mat("#ece2cc"), [Math.sin(a) * 0.34, 0.07, Math.cos(a) * 0.34], { parent: g, seg: 10, scale: [1, 0.7, 0.6] }); }
  return g;
}
function makeMeter(E, TH) {
  const g = E.group(null, [0, -50, 0]);
  E.box(0.56, 0.4, 0.16, E.mat("#e8b828"), [0, 0, 0], { parent: g });
  E.box(0.2, 0.05, 0.05, E.mat("#2a2a2a"), [0, 0.4, 0], { parent: g });
  const dial = canvasTex(TH, 512, 360, (c, w, h) => {
    c.fillStyle = "#f4f0e2"; c.fillRect(0, 0, w, h); const cx = w / 2, cy = h * 0.86, r = 220;
    [["#5aa84a", Math.PI, Math.PI * 1.4], [YEL, Math.PI * 1.4, Math.PI * 1.7], [RED, Math.PI * 1.7, Math.PI * 2]].forEach(([col, a0, a1]) => { c.strokeStyle = col; c.lineWidth = 46; c.beginPath(); c.arc(cx, cy, r - 30, a0, a1); c.stroke(); });
    c.strokeStyle = "#1d1622"; c.lineWidth = 6; for (let i = 0; i <= 10; i++) { const a = Math.PI + i * Math.PI / 10; c.beginPath(); c.moveTo(cx + Math.cos(a) * (r - 60), cy + Math.sin(a) * (r - 60)); c.lineTo(cx + Math.cos(a) * (r - 84), cy + Math.sin(a) * (r - 84)); c.stroke(); }
    trefoil(c, cx, cy - 70, 46, "#1d1622");
  });
  E.label(dial, 0.46, 0.32, [0, 0.21, 0.082], { parent: g });
  const nd = E.group(g, [0, 0.07, 0.09]); g.userData.needle = nd;
  E.box(0.012, 0.2, 0.01, E.mat("#1d1622"), [0, 0, 0], { parent: nd });
  E.sphere(0.02, E.mat("#1d1622"), [0, 0, 0.005], { parent: nd, seg: 8 });
  return g;
}
const needle = (m, k) => { m.userData.needle.rotation.z = Math.PI / 2 - k * Math.PI; }; // k: 0 sol (yeşil) → 1 sağ (kırmızı)

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- beton koridor (x=0, -z yönünde) ----
  const conc = E.mat("#ffffff", { map: T.plaster("#8c9088") }), concD = E.mat("#ffffff", { map: T.stone("#6e726c") });
  E.ground(T.stone("#5e625c"), 60, 0.4, [0, 0.01, -8]);
  for (const s of [-1, 1]) E.box(0.3, 3.2, 26, conc, [s * 1.7, 0, -8]);
  E.box(3.8, 0.3, 26, concD, [0, 3.2, -8]);
  E.box(3.6, 3.2, 0.3, concD, [0, 0, MZ - 2.6]);
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) E.cyl(0.07 + k * 0.03, 0.07 + k * 0.03, 26, E.mat(k ? "#5a6a5a" : "#7a6a4a"), [s * 1.42, 2.5 + k * 0.28, -8], { center: true, seg: 10, rot: [Math.PI / 2, 0, 0] });
  R.lamps = [];
  for (let i = 0; i < 4; i++) { E.box(0.5, 0.06, 0.18, E.mat("#cfe8c0", { emissive: "#9ec08a", glow: 0.9 }), [0, 3.0, -1 - i * 3.2], { center: true }); }
  for (let i = 0; i < 4; i++) { E.box(0.05, 0.5, 0.42, E.mat(i % 2 ? "#1d1622" : YEL), [-1.53, 0.25, -6.6 - i * 0.42], { center: true }); E.box(0.05, 0.5, 0.42, E.mat(i % 2 ? YEL : "#1d1622"), [1.53, 0.25, -6.6 - i * 0.42], { center: true }); }
  const warnTex = canvasTex(TH, 512, 512, (c, w, h) => { c.fillStyle = YEL; c.fillRect(0, 0, w, h); c.strokeStyle = "#1d1622"; c.lineWidth = 24; c.strokeRect(12, 12, w - 24, h - 24); trefoil(c, w / 2, h / 2, 190, "#1d1622"); });
  R.warnTex = warnTex;
  E.label(warnTex, 0.55, 0.55, [-1.54, 1.9, -5.2], { rot: [0, Math.PI / 2, 0] });
  E.label(T.sign("TEHLİKE", { bg: YEL, fg: "#1d1622", size: 150, border: "#1d1622" }), 0.9, 0.34, [1.54, 1.95, -4.4], { rot: [0, -Math.PI / 2, 0] });
  R.footM = { a: E.mat("#4a3426"), b: E.mat("#3b2a1f"), c: E.mat("#5e4431") };
  R.footCold = Object.fromEntries(Object.entries(R.footM).map(([k, m]) => [k, m.color.clone()]));
  R.foot = makeFoot(E, R.footM);
  R.leg = makeLeg(E);
  R.meter = makeMeter(E, TH);
  R.crate = E.box(0.7, 0.85, 0.6, E.mat("#ffffff", { map: T.metal("#6a6e72") }), [0, -50, 0]);
  // tekerlekli araba + kamera + sopa
  R.cart = E.group(null, [0, -50, 0]);
  E.box(0.5, 0.06, 0.7, E.mat("#6a6e72"), [0, 0.1, 0], { parent: R.cart });
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) E.cyl(0.08, 0.08, 0.05, E.mat("#1d1622"), [sx * 0.27, 0.08, sz * 0.26], { parent: R.cart, center: true, seg: 12, rot: [0, 0, Math.PI / 2] });
  E.box(0.28, 0.2, 0.2, E.mat("#2a2a30"), [0, 0.16, 0.05], { parent: R.cart });
  E.cyl(0.07, 0.07, 0.14, E.mat("#1d1622"), [0, 0.26, 0.2], { parent: R.cart, center: true, seg: 12, rot: [Math.PI / 2, 0, 0] });
  E.sphere(0.045, E.mat("#9ab8e0", { emissive: "#6a88c0", glow: 0.6 }), [0, 0.26, 0.27], { parent: R.cart, seg: 10 });
  E.cyl(0.02, 0.02, 4.2, E.mat("#b8a070"), [0, 0.45, 2.3], { parent: R.cart, center: true, seg: 6, rot: [Math.PI / 2 - 0.12, 0, 0] });
  // kapı (son sahne)
  R.door = E.group(null, [0, -50, 0]);
  E.box(3.4, 3.1, 0.18, E.mat("#ffffff", { map: T.metal("#5a5e58") }), [0, 0, 0], { parent: R.door });
  E.label(warnTex, 0.7, 0.7, [0, 2.25, 0.1], { parent: R.door });
  E.label(T.sign("GİRİLMEZ", { bg: "#1d1622", fg: YEL, size: 150, border: YEL }), 1.1, 0.4, [0, 1.6, 0.1], { parent: R.door });
  // ışıklar
  R.spot = new TH.SpotLight(0xfff0d0, 0, 22, 0.42, 0.55, 1.2); E.scene.add(R.spot); E.scene.add(R.spot.target);
  R.glow = new TH.PointLight(0x9ed080, 0, 5, 2); E.scene.add(R.glow);
  R.hot = new TH.PointLight(0xff8030, 0, 6, 2); E.scene.add(R.hot);

  // ---- reaktör binası dışarıdan (x=RX) ----
  E.ground(T.dirt("#6e6c5a"), 200, 0.25, [RX, 0.01, 0]);
  const gray = E.mat("#ffffff", { map: T.plaster("#a8aaa2") }), gray2 = E.mat("#ffffff", { map: T.plaster("#8e918a") });
  E.box(13, 7, 8, gray, [RX - 3, 0, -26]);
  E.box(6, 11, 7, gray2, [RX + 5, 0, -25]);
  E.box(5, 5, 6, gray, [RX + 11, 0, -27]);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) E.box(1.2, 0.5, 0.1, E.mat("#3a4048"), [RX - 8.5 + i * 2.2, 2 + j * 2.4, -21.95]);
  for (let i = 0; i < 8; i++) E.cyl(0.78 - i * 0.03, 0.8 - i * 0.03, 2.4, E.mat(i % 2 ? "#c8483a" : "#ece8de"), [RX + 4.5, 11 + i * 2.4, -26], { seg: 14 });
  S.fence(RX - 9, RX + 9, -13, { col: "#7a7e78" });
  for (let i = 0; i < 6; i++) S.tree(RX - 14 + i * 5.6 + (i % 2) * 1.3, -16 - (i % 3), { type: "pine", col: "#4a6a4a", s: 1.1 });
  // ---- kesit (x=KX), z=-2 düzleminde ----
  E.box(6, 7, 0.2, E.mat("#23282a"), [KX, -1, -2.4]);
  const sl = E.mat("#ffffff", { map: T.stone("#8a8c84") });
  E.box(3.2, 0.5, 0.8, sl, [KX, -0.5, -2]);                       // zemin
  E.box(1.15, 0.9, 0.8, sl, [KX - 0.62, 1.5, -2]); E.box(1.6, 0.9, 0.8, sl, [KX + 0.88, 1.5, -2]); // ara döşeme (boşluk x≈KX+0.0..0.08)
  E.box(1.2, 0.2, 0.8, sl, [KX - 0.55, 2.4, -2]); E.box(0.9, 0.2, 0.8, sl, [KX + 0.6, 2.4, -2]);   // reaktör tabanı (boşluk)
  for (const s of [-1, 1]) E.box(0.2, 1.6, 0.8, sl, [KX + s * 0.95, 2.6, -2]);
  E.box(2.1, 0.2, 0.8, sl, [KX, 4.2, -2]);
  E.box(3.2, 1.5, 0.1, E.mat("#3a3f3c"), [KX, 0, -2.3]);                // koridor arka duvarı
  R.core = E.group(null, [KX, 2.6, -1.9]);
  R.coreM = E.mat("#ffa040", { emissive: "#ff7020", glow: 1.4 });
  E.cyl(0.45, 0.45, 0.7, R.coreM, [0, 0, 0], { parent: R.core, seg: 20 });
  for (let i = 0; i < 5; i++) E.cyl(0.03, 0.03, 0.72, E.mat("#5a5a5a"), [-0.3 + i * 0.15, 0, 0.3], { parent: R.core, seg: 6 });
  R.drops = []; const lava = E.mat("#ff8a2a", { emissive: "#ff6010", glow: 1.3 });
  for (let i = 0; i < 14; i++) R.drops.push(E.sphere(0.1 + (i % 3) * 0.02, lava, [0, -50, 0], { seg: 10 }));
  R.pile = E.group(null, [0, -50, 0]);
  R.pileM = E.mat("#ff8a2b", { emissive: "#ff6010", glow: 1.2 });
  E.cyl(0.32, 0.4, 0.3, R.pileM, [0, 0, 0], { parent: R.pile, seg: 16 }); E.sphere(0.32, R.pileM, [0, 0.3, 0], { parent: R.pile, seg: 14, scale: [1, 0.6, 1] });
  E.label(T.sign("REAKTÖR", { bg: "#1d1622", fg: YEL, size: 150, border: null }), 0.9, 0.3, [KX, 4.0, -1.55]);
  E.label(T.sign("KORİDOR", { bg: "#1d1622", fg: PALE, size: 150, border: null }), 0.8, 0.26, [KX + 0.45, 0.95, -1.55]);
  R.kspot = new TH.PointLight(0xffffff, 0, 8, 1.5); R.kspot.position.set(KX, 2.2, 1.5); E.scene.add(R.kspot);
  // ---- karakter (kask, kurban yok) ----
  E.actor("tech", { shirt: "#d8d4c4", pants: "#4a5048", jacket: "#5a6a5a", hat: "hardhat", hatCol: YEL, hair: "short", hairCol: "#3a2a20", skin: "#f0c9a4", seed: 301, glasses: true });
}

const card = (title, sub, acc = YEL) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(18,22,20,.9)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = acc; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#dfe8d8"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = YEL, size = 150, subCol = "#fff") => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#111512"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = subCol; g.fillText(sub, w / 2, y); }
  g.restore();
};
// fener halkası: kenarları karart
const torch = (amt = 0.6) => (g, w, h) => { const gr = g.createRadialGradient(w / 2, h * 0.5, w * 0.25, w / 2, h * 0.5, h * 0.62); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${amt})`); g.save(); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore(); };
// saat: dolan dilim
const clock = (a, p, col) => (g, w) => {
  if (a <= 0) return; const k = w / 1080, cx = w / 2, cy = 640 * k, r = 130 * k; g.save(); g.globalAlpha = Math.min(1, a);
  g.fillStyle = "rgba(15,18,16,.85)"; g.beginPath(); g.arc(cx, cy, r + 14 * k, 0, Math.PI * 2); g.fill();
  g.fillStyle = col; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.closePath(); g.fill();
  g.strokeStyle = "#fff"; g.lineWidth = 10 * k; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.stroke();
  g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(p * Math.PI * 2) * r * 0.85, cy - Math.cos(p * Math.PI * 2) * r * 0.85); g.stroke(); g.restore();
};

function reset(E) {
  for (const o of [R.foot, R.leg, R.meter, R.crate, R.cart, R.door, R.pile]) hide(o);
  R.drops.forEach(hide);
  R.spot.intensity = 0; R.glow.intensity = 0; R.hot.intensity = 0; R.kspot.intensity = 0;
  for (const k in R.footM) { R.footM[k].color.copy(R.footCold[k]); R.footM[k].emissive.setRGB(0, 0, 0); }
  R.core.scale.set(1, 1, 1);
}
function heat(h, TH) { // h: 1 sıcak → 0 soğuk
  const hotC = new TH.Color("#ff8a2a");
  for (const k in R.footM) { R.footM[k].color.copy(R.footCold[k]).lerp(hotC, h); R.footM[k].emissive.setRGB(1.0 * h, 0.38 * h, 0.06 * h); }
}

export function frame(f, E) {
  const X = E.X, TH = E.THREE, sh = shotAt(f), A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const DARK = { ...X.LIGHTS.interior, sunI: 0.22, hemiI: 0.45, amb: 0.12, sky: "#5a6a5a", top: "#101614", bot: "#1a221e", fog: "#0e1210", fogNear: 7, fogFar: 26, card: "#b8c0b0", sat: 0.9, vig: 0.55, warm: -0.02, con: 1.1 };
  let cam, light = DARK, dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, MZ], tint = "rgba(60,90,60,0.08)", dark = 0.55;
  reset(E);
  const footOn = (x = 0, s = 1) => { put(R.foot, x, 0, MZ, 0, s); R.glow.position.set(x + 0.4, 1.6, MZ + 1.4); R.glow.intensity = 1.2; };
  const torchAt = (c, tgt, I = 40) => { R.spot.position.set(c.pos[0] + 0.25, c.pos[1] - 0.1, c.pos[2]); R.spot.target.position.set(...tgt); R.spot.intensity = I; };

  switch (sh.name) {
    case "hook": case "timer": case "still": case "name": {
      footOn();
      if (sh.name === "hook") cam = E.camAt(f, [{ f: 0, pos: [0.1, 1.55, -1.0], look: [0, 0.9, MZ], fov: 46 }, { f: 69, pos: [0.05, 1.5, -4.0], look: [0, 0.85, MZ], fov: 46 }]);
      else if (sh.name === "timer") cam = E.camAt(f, [{ f: 70, pos: [-0.6, 1.5, MZ + 5.8], look: [0, 0.9, MZ], fov: 46 }, { f: 148, pos: [-0.5, 1.45, MZ + 5.2], look: [0, 0.9, MZ], fov: 46 }]);
      else if (sh.name === "name") cam = E.camAt(f, [{ f: 500, pos: [0.5, 1.3, MZ + 4.6], look: [0, 0.75, MZ], fov: 46 }, { f: 557, pos: [0.45, 1.25, MZ + 4.1], look: [0, 0.8, MZ], fov: 46 }]);
      else cam = E.camAt(f, [{ f: 891, pos: [0, 1.6, -2.0], look: [0, 0.9, MZ], fov: 46 }, { f: 931, pos: [0, 1.55, -3.2], look: [0, 0.9, MZ], fov: 46 }]);
      torchAt(cam, [0, 0.8, MZ], sh.name === "name" ? 30 : 40);
      if (sh.name === "hook") ov.push(big("ÇERNOBİL", X.span(f, 0, 6), f > WF(E, 1) - 3 ? "reaktörün altında" : "1986 sonrası", YEL, 170));
      if (sh.name === "timer") {
        const p = X.span(f, WF(E, 7) - 3, 146), deadly = f > WF(E, 9) - 3;
        ov.push(big("5 DAKİKA", X.span(f, WF(E, 6) - 3, WF(E, 6) + 5), deadly ? "ölümcül" : "", deadly ? RED : YEL, 150, RED));
        ov.push(clock(X.span(f, WF(E, 6) - 3, WF(E, 6) + 5), p, deadly ? RED : YEL));
      }
      if (sh.name === "name") { ov.push(big("FİL AYAĞI", X.span(f, WF(E, 41) - 3, WF(E, 41) + 5), "korium · 1986", YEL, 160)); ov.push(card("Korium", "yakıt + beton + kum → katı kütle")); }
      break;
    }
    case "reactor": {
      light = { ...X.LIGHTS.day, sunI: 1.0, hemiI: 0.8, top: "#6a767a", bot: "#b8bdb2", fog: "#a8ada4", sat: 0.82, vig: 0.4 }; tint = "rgba(50,70,50,0.12)"; dark = 0;
      const boom = WF(E, 15) - 2;
      if (f >= boom) { for (let i = 0; i < 3; i++) { const t = ((f - boom) / 60 + i * 0.33) % 1; FX.push({ kind: "puff", t, pos: [RX + 1 + (i - 1) * 2.2, 9 + t * 6, -22], size: 5 + t * 3 }); } flash = Math.max(0, 0.35 * (1 - (f - boom) / 10)); }
      cam = E.camAt(f, [{ f: 149, pos: [RX - 1, 2.0, 16], look: [RX + 1, 9, -24], fov: 58 }, { f: 215, pos: [RX - 0.6, 2.0, 12], look: [RX + 1, 9, -24], fov: 58 }]);
      if (f >= boom) { const s = E.shake(f, boom, 0.12, 10); cam.pos[0] += s[0]; cam.pos[1] += s[1]; }
      focusPt = [RX, 0, -24];
      ov.push(big("1986", X.span(f, WF(E, 10) - 3, WF(E, 10) + 5), f > boom ? "Nisan · patlama" : "", "#ffffff", 170));
      break;
    }
    case "core": case "flow": {
      light = { ...X.LIGHTS.interior, sunI: 0.5, hemiI: 0.7, amb: 0.22, top: "#151a18", bot: "#202824", fog: "#151a18", fogNear: 30, fogFar: 90, vig: 0.5 }; tint = null; dark = 0;
      R.kspot.intensity = 6;
      const melt = sh.name === "core" ? X.smooth(X.span(f, WF(E, 19) - 3, WF(E, 19) + 20)) : 1;
      const pulse = 1.2 + 0.3 * Math.sin(f / 4);
      R.coreM.emissiveIntensity = pulse * (sh.name === "core" ? 1 : 0.8);
      R.core.scale.set(1 + 0.35 * melt, 1 - 0.6 * melt, 1 + 0.1 * melt);
      R.hot.position.set(KX, 2.8, -1.2); R.hot.intensity = 3 + Math.sin(f / 4);
      if (sh.name === "core") FX.push({ kind: "lines", pos: [KX, 3.55, -1.6], size: 0.5 });
      if (sh.name === "flow") {
        const f0 = WF(E, 21) - 3, dur = 26; // yol: çekirdek altı → boşluklar → koridor zemini
        const path = [[KX + 0.05, 2.55], [KX + 0.05, 2.25], [KX + 0.04, 1.6], [KX + 0.04, 1.05], [KX - 0.2, 0.25], [KX - 0.6, 0.12]];
        const at = (s) => { const n = path.length - 1, u = Math.min(n - 1e-4, s * n), i = Math.floor(u), r = u - i; return [X.lerp(path[i][0], path[i + 1][0], r), X.lerp(path[i][1], path[i + 1][1], r)]; };
        R.drops.forEach((d, i) => { const s = (f - f0 - i * 4) / dur; if (s < 0 || s > 1 || f > 372) return; const [x, y] = at(s); d.position.set(x, y, -1.7); d.visible = true; });
        const grow = X.smooth(X.span(f, f0 + 20, 375));
        if (grow > 0) { put(R.pile, KX - 0.6, 0, -1.9, 0, 0.2 + 0.35 * grow); R.pile.scale.y = 0.15 + 0.6 * grow; }
        R.pileM.emissiveIntensity = 1.1;
      }
      cam = E.camAt(f, [{ f: sh.f0, pos: [KX, 2.0, 3.1], look: [KX, 2.0, -2], fov: 52 }, { f: sh.f1 - 1, pos: [KX, 1.95, 2.8], look: [KX, 1.95, -2], fov: 52 }], { creep: 0.04 });
      focusPt = [KX, 0, -2];
      if (sh.name === "core") ov.push(big("ÇEKİRDEK", X.span(f, WF(E, 18) - 3, WF(E, 18) + 5), f > WF(E, 19) - 3 ? "eridi" : "", "#ffa040", 150));
      else {
        ov.push(big("YAKIT", X.span(f, WF(E, 20) - 3, WF(E, 20) + 4), f > WF(E, 23) - 3 ? "+ beton + kum" : f > WF(E, 21) - 3 ? "+ beton" : "", "#ffa040", 160));
        if (f > WF(E, 26) - 3) ov.push(card("Aşağı aktı", "alttaki koridorlara"));
      }
      break;
    }
    case "solid": {
      footOn(-0.35, 0.85);
      const h = 1 - X.smooth(X.span(f, WF(E, 29) - 3, WF(E, 29) + 40));
      heat(h, TH); R.hot.position.set(-0.35, 1.2, MZ + 1.2); R.hot.intensity = 5 * h;
      const legIn = X.back(X.span(f, WF(E, 31) - 3, WF(E, 31) + 8));
      if (legIn > 0.01) put(R.leg, 0.55, 0, MZ - 0.2, 0, legIn);
      cam = E.camAt(f, [{ f: 382, pos: [0.05, 1.4, MZ + 4.6], look: [0.05, 0.8, MZ], fov: 46 }, { f: 499, pos: [0.05, 1.35, MZ + 4.0], look: [0.05, 0.8, MZ], fov: 46 }]);
      torchAt(cam, [0.05, 0.8, MZ], 40);
      if (f < WF(E, 31) - 3) ov.push(big("KATILAŞTI", X.span(f, WF(E, 29) - 3, WF(E, 29) + 5), "", PALE, 140));
      else ov.push(big("≈", X.span(f, WF(E, 32) - 3, WF(E, 32) + 5), "kütle  ·  fil ayağı", "#ffffff", 200));
      break;
    }
    case "dose": case "today": {
      footOn();
      put(R.crate, 0.15, 0.425, -3.2, 0.1); put(R.meter, 0.15, 0.85, -3.15, -0.08, 1);
      const today = sh.name === "today";
      const k = today ? X.lerp(0.93, 0.6, X.smooth(X.span(f, WF(E, 64) - 3, WF(E, 65) + 12))) : X.lerp(0.3, 0.93, X.smooth(X.span(f, 558, WF(E, 46))));
      needle(R.meter, k + 0.01 * Math.sin(f / 2));
      cam = E.camAt(f, [{ f: sh.f0, pos: [0.35, 1.45, -0.9], look: [0.12, 0.95, -3.4], fov: 44 }, { f: sh.f1 - 1, pos: [0.3, 1.4, -1.2], look: [0.12, 1.0, -3.4], fov: 44 }], { creep: 0.04 });
      torchAt(cam, [0.15, 1.0, -3.2], 22);
      focusPt = [0.15, 0, -3.2];
      if (!today) {
        ov.push(big("300 saniye", X.span(f, WF(E, 46) - 3, WF(E, 46) + 5), f > WF(E, 50) - 3 ? "= ölümcül doz" : "ilk ölçümler · 1986", RED, 140, f > WF(E, 50) - 3 ? "#ffb0a0" : "#fff"));
      } else {
        const still = f > WF(E, 66) - 3;
        ov.push(big("BUGÜN", X.span(f, 802, 808), still ? "ama hâlâ tehlikeli" : f > WF(E, 64) - 3 ? "çok azaldı" : "", "#ffffff", 150, still ? YEL : PALE));
      }
      dark = 0.45;
      break;
    }
    case "cart": {
      footOn();
      const p = X.smooth(X.span(f, 690, 790)), cz = X.lerp(-2.6, MZ + 1.6, p);
      put(R.cart, 0.0, 0, cz, 0, 1.0);
      const push = Math.sin(f / 5) * 0.03;
      R.cart.position.z += push;
      A.push({ id: "tech", pos: [-0.3, 0, cz + 4.0 + push], st: st(301, { face: "determined", arms: "reach", look: 0.2 }) });
      cam = E.camAt(f, [{ f: 679, pos: [1.2, 1.5, 4.4], look: [-0.2, 1.0, -1.0], fov: 46 }, { f: 735, pos: [1.2, 1.45, 3.6], look: [-0.2, 0.8, -2.6], fov: 46 }, { f: 801, pos: [1.1, 1.0, MZ + 4.4], look: [-0.1, 0.6, MZ], fov: 46 }]);
      torchAt(cam, [0, 0.6, cz - 1], 40);
      if (f >= 778 && f < 790) flash = 0.5 * (1 - (f - 778) / 12);
      ov.push(big("FOTOĞRAF", X.span(f, WF(E, 53) - 3, WF(E, 53) + 5), f > WF(E, 58) - 3 ? "tekerlekli araba + sopa" : "nasıl çekildi?", "#ffffff", 140));
      break;
    }
    case "end": {
      footOn();
      const p = X.smooth(X.span(f, 936, 966));
      put(R.door, X.lerp(3.4, 0, p), 0, -3.0, 0, 1);
      cam = E.camAt(f, [{ f: 932, pos: [0.0, 1.6, 2.8], look: [0, 1.4, -6], fov: 50 }, { f: 1025, pos: [0.0, 1.6, 2.2], look: [0, 1.4, -6], fov: 50 }]);
      torchAt(cam, [0, 1.0, -4], 30);
      if (p > 0.98 && f < 975) { const s = E.shake(f, 966, 0.05, 8); cam.pos[0] += s[0]; cam.pos[1] += s[1]; }
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 934, 942), f >= WF(E, 75) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov, dk = dark;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } if (dk) torch(dk)(g, w, h); list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
