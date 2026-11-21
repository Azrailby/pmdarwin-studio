// Beyni Cama Dönüşen Adam — PMDARWIN (~30 sn) · saygılı, ceset/yanık detayı yok
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [64, "year"], [107, "erupt"], [165, "room"], [333, "hot"], [405, "cool"], [451, "cycle"],
  [502, "brain"], [587, "lab"], [710, "years"], [758, "gaze"], [815, "end"]];
const END = 914;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const LAVA = "#ff7a2a", ASH = "#b8b0a8", ICE = "#7cc4ff", GOLD = "#f2c23a";
const TX = 100, RX = 200, LBX = 300; // Roma kenti, oda, laboratuvar (müze x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function neuronTex(E, bg = null) {
  const TH = E.THREE, c = document.createElement("canvas"); c.width = c.height = 512; const g = c.getContext("2d");
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, 512, 512); }
  let k = 0;
  const br = (x, y, a, L, d) => { if (d > 5 || L < 8) return; const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; g.lineWidth = Math.max(1.5, 7 - d * 1.2); g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke(); const n = 2 + (rnd(k++) > 0.6 ? 1 : 0); for (let i = 0; i < n; i++) br(x2, y2, a + (rnd(k++) - 0.5) * 1.6, L * (0.6 + rnd(k++) * 0.2), d + 1); };
  g.strokeStyle = "#ffd9a0"; g.shadowColor = "#ffb060"; g.shadowBlur = 10; g.lineCap = "round";
  for (const [x, y] of [[180, 230], [330, 290], [260, 170]]) { g.fillStyle = "#ffe0b0"; g.beginPath(); g.arc(x, y, 10, 0, 7); g.fill(); for (let i = 0; i < 5; i++) br(x, y, (i / 5) * Math.PI * 2 + rnd(x + i), 55, 0); }
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}
function makeShard(E) {
  const TH = E.THREE, g = E.group(null, [0, -50, 0]);
  const geo = new TH.IcosahedronGeometry(0.34, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) { const v = new TH.Vector3().fromBufferAttribute(p, i), k = 0.8 + 0.35 * rnd(Math.round(v.x * 50 + v.y * 70 + v.z * 90)); p.setXYZ(i, v.x * k * 1.25, v.y * k * 0.85, v.z * k * 0.6); }
  geo.computeVertexNormals();
  const m = new TH.MeshPhongMaterial({ color: 0x141118, specular: 0xc8c0ff, shininess: 120, flatShading: true, emissive: 0x120e1a });
  E.add(new TH.Mesh(geo, m), g);
  const dec = E.plane(0.62, 0.42, E.flat("#ffffff", { map: neuronTex(E), transparent: true, opacity: 0.85 }), [0, 0.0, 0.215], { parent: g, noink: true }); dec.material.alphaTest = 0.05; dec.castShadow = false; g.userData.dec = dec;
  const glint = E.plane(0.08, 0.3, E.flat("#ffffff", { transparent: true, opacity: 0.7 }), [0, 0, 0.23], { parent: g, noink: true }); glint.rotation.z = 0.6; glint.castShadow = false; g.userData.glint = glint;
  return g;
}
function makeBrain(E) {
  const g = E.group(null, [0, -50, 0]), m = E.mat("#f2a0b0").clone(); g.userData.m = m;
  for (const s of [-1, 1]) { const h = E.sphere(0.3, m, [s * 0.16, 0, 0], { parent: g, seg: 18 }); h.scale.set(0.95, 0.85, 1.25); }
  for (let i = 0; i < 26; i++) { const a = rnd(i) * Math.PI * 2, b = rnd(i + 7) * Math.PI * 0.7; const s = rnd(i + 3) < 0.5 ? -1 : 1; E.sphere(0.09, m, [s * 0.16 + Math.cos(a) * Math.sin(b) * 0.26, Math.cos(b) * 0.24, Math.sin(a) * Math.sin(b) * 0.34], { parent: g, seg: 8 }); }
  E.cyl(0.07, 0.05, 0.25, m, [0, -0.38, -0.12], { parent: g, seg: 10 });
  return g;
}
function makeThermo(E) {
  const g = E.group(null, [0, -50, 0]);
  E.box(0.5, 2.2, 0.08, E.mat("#f4efe4"), [0, -0.1, -0.06], { parent: g });
  E.cyl(0.08, 0.08, 1.7, E.mat("#e8f6ff", { transparent: true, opacity: 0.6 }), [0, 0.2, 0], { parent: g, seg: 14 });
  E.sphere(0.17, E.mat("#e0393e", { emissive: "#a01010", glow: 0.4 }), [0, 0.12, 0], { parent: g, seg: 16 });
  const col = E.cyl(0.05, 0.05, 1.0, E.mat("#e0393e", { emissive: "#a01010", glow: 0.4 }), [0, 0.2, 0], { parent: g, seg: 10 }); col.geometry.translate(0, 0, 0); g.userData.col = col;
  for (let i = 0; i < 8; i++) E.box(0.12, 0.02, 0.02, E.mat("#2a2a2a"), [0.14, 0.35 + i * 0.19, 0.0], { parent: g });
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- müze (x=0) ----
  E.box(12, 0.1, 10, E.mat("#2a2630"), [0, -0.1, 0]);
  E.box(12, 6, 0.2, E.mat("#ffffff", { map: T.plaster("#3a3440") }), [0, -0.1, -3]);
  E.cyl(0.45, 0.5, 1.0, E.mat("#e8e2d8", { map: T.marble("#e8e2d8") }), [0, 0, 0], { seg: 24 });
  E.cyl(0.55, 0.55, 0.08, E.mat("#d8d0c4"), [0, 1.0, 0], { seg: 24 });
  E.label(T.sign("HERCULANEUM · MS 79", { bg: "#1d1a22", fg: GOLD, size: 110, border: GOLD }), 0.9, 0.22, [0, 0.55, 0.51], { lit: false });
  R.spot = new TH.SpotLight(0xfff0d8, 30, 12, 0.5, 0.6, 1.5); R.spot.position.set(0.5, 4.5, 2.5); R.spot.target.position.set(0, 1.2, 0); E.scene.add(R.spot, R.spot.target);
  R.shard = makeShard(E);
  // ---- Roma kenti (x=TX) ----
  E.ground(T.stone("#cdbfa5"), 200, 0.3, [TX, 0.005, 0]);
  const col = (x, z, h = 4.2) => { E.box(0.9, 0.3, 0.9, E.mat("#efe6d4"), [x, 0, z]); E.cyl(0.32, 0.36, h, E.mat("#f4ecdc"), [x, 0.3, z], { seg: 16 }); E.box(0.95, 0.3, 0.95, E.mat("#efe6d4"), [x, 0.3 + h, z]); };
  for (let i = 0; i < 6; i++) col(TX - 3.2 + i * 1.28, -4.5);
  E.box(7.4, 0.5, 2.0, E.mat("#e8dcc4"), [TX, 4.8, -4.5]);
  { const sh = new TH.Shape(); sh.moveTo(-3.8, 0); sh.lineTo(3.8, 0); sh.lineTo(0, 1.4); sh.lineTo(-3.8, 0); const geo = new TH.ExtrudeGeometry(sh, { depth: 2.0, bevelEnabled: false }); const m = new TH.Mesh(geo, E.mat("#e8dcc4")); m.position.set(TX, 5.3, -5.5); E.add(m); }
  E.box(8, 0.6, 3.2, E.mat("#d8ccb4"), [TX, -0.3, -4.5]);
  S.building(TX - 7.5, -3.5, { w: 5, d: 5, floors: 2, wall: "#e8c8a0", roof: "#c4553f", shutter: "#7a4a2a", win: "#3a2a20", chimney: false });
  S.building(TX + 10, -3.5, { w: 5, d: 5, floors: 2, wall: "#e8b890", roof: "#b8543a", shutter: "#5a6a3a", win: "#3a2a20", chimney: false });
  for (let i = 0; i < 3; i++) S.tree(TX + (i - 1) * 6, -9, { type: "cypress", s: 1.2 });
  // Vezüv
  E.cone(34, 24, E.mat("#6a5a50"), [TX + 6, -2, -95], { seg: 14 }).castShadow = false;
  E.cone(10, 3, E.mat("#4a3a34"), [TX + 6, 18.5, -95], { seg: 14 }).castShadow = false;
  R.plume = [];
  for (let i = 0; i < 24; i++) { const s = E.sphere(1, E.mat(i % 3 ? "#8a7a70" : "#c86a3a", { emissive: i % 3 ? "#000000" : "#ff5a1a", glow: 0.5 }), [0, -50, 0], { seg: 12 }); s.castShadow = false; R.plume.push(s); }
  // ---- oda (x=RX) ----
  S.room({ x: RX, w: 8, d: 7, wall: T.wallpaper("#a8432e", "#963a28"), floor: T.tiles("#d8c8a8", "#b8a888", 12), window: true, door: false });
  E.box(8, 0.35, 0.05, E.mat("#2a2020"), [RX, 0.0, -3.47]);
  R.bed = E.group(null, [RX - 0.3, 0, -1.6]);
  E.box(2.4, 0.45, 1.1, E.mat("#ffffff", { map: T.wood("#7a4a2a") }), [0, 0, 0], { parent: R.bed });
  E.box(2.3, 0.15, 1.0, E.mat("#e8dcc4"), [0, 0.45, 0], { parent: R.bed });
  E.box(0.5, 0.14, 0.7, E.mat("#f4efe4"), [0.85, 0.6, 0], { parent: R.bed });
  E.box(0.12, 0.9, 1.1, E.mat("#7a4a2a"), [1.2, 0, 0], { parent: R.bed });
  E.cyl(0.18, 0.22, 0.7, E.mat("#c86a3a"), [RX + 1.9, 0, -2.8], { seg: 14 });
  R.ash = [];
  for (let i = 0; i < 26; i++) { const s = E.sphere(1, E.mat(i % 4 ? "#a8a098" : "#d8845a", { transparent: true, opacity: 0.9 }), [0, -50, 0], { seg: 12 }); s.castShadow = false; R.ash.push(s); }
  R.thermo = makeThermo(E);
  // ---- beyin & laboratuvar ----
  R.brain = makeBrain(E);
  S.room({ x: LBX, w: 10, d: 8, wall: T.tiles("#eef3f6", "#dfe7ec", 10), floor: T.tiles("#d8dee4", "#c4ccd4", 6), window: false, door: true });
  S.desk(LBX + 0.4, -2.2);
  const mic = E.group(null, [LBX - 0.1, 0.95, -2.1]);
  E.box(0.35, 0.06, 0.3, E.mat("#2b2f3a"), [0, 0, 0], { parent: mic });
  const arm = E.box(0.07, 0.5, 0.07, E.mat("#2b2f3a"), [0, 0.06, -0.1], { parent: mic });
  const tube = E.cyl(0.05, 0.06, 0.35, E.mat("#e8eaf0"), [0, 0.42, 0.0], { parent: mic, center: true, seg: 12 }); tube.rotation.x = 0.4;
  E.box(0.2, 0.03, 0.18, E.mat("#9aa3b2"), [0, 0.2, 0.02], { parent: mic });
  E.box(1.1, 0.75, 0.08, E.mat("#2b2f3a"), [LBX + 0.9, 1.0, -2.5]);
  E.label(neuronTex(E, "#0a1020"), 1.0, 0.65, [LBX + 0.9, 1.4, -2.45], { lit: false });
  E.actor("sci", { jacket: "#f4f1ea", shirt: "#5a7a9a", pants: "#3a3a44", hair: "long", hairCol: "#3a2a20", glasses: true, skin: "#e9c3a0", seed: 151 });
  E.actor("youth", { shirt: "#d8c49a", dress: "#d8c49a", belt: "#8a5a36", hair: "short", hairCol: "#2a1a14", skin: "#e9c3a0", seed: 152 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(28,22,24,.9)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = LAVA; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffd8c0"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = LAVA, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#140e10"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};
// ısınma ↔ soğuma döngüsü
const cycle = (f, a) => (g, w) => {
  const k = w / 1080, cx = w / 2, cy = 360 * k, r = 170 * k; g.save(); g.globalAlpha = a; g.lineWidth = 26 * k; g.lineCap = "round";
  const rot = f * 0.05;
  g.strokeStyle = LAVA; g.beginPath(); g.arc(cx, cy, r, rot, rot + Math.PI * 0.85); g.stroke();
  g.strokeStyle = ICE; g.beginPath(); g.arc(cx, cy, r, rot + Math.PI, rot + Math.PI * 1.85); g.stroke();
  for (const [a2, c] of [[rot + Math.PI * 0.85, LAVA], [rot + Math.PI * 1.85, ICE]]) { const x = cx + r * Math.cos(a2), y = cy + r * Math.sin(a2), d = a2 + Math.PI / 2; g.fillStyle = c; g.beginPath(); g.moveTo(x + Math.cos(d) * 40 * k, y + Math.sin(d) * 40 * k); g.lineTo(x + Math.cos(d + 2.4) * 34 * k, y + Math.sin(d + 2.4) * 34 * k); g.lineTo(x + Math.cos(d - 2.4) * 34 * k, y + Math.sin(d - 2.4) * 34 * k); g.fill(); }
  g.font = `900 ${64 * k}px CizgiFont, Nunito, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineWidth = 10 * k; g.strokeStyle = "#140e10";
  g.strokeText("ISINMA", cx, cy - 40 * k); g.fillStyle = LAVA; g.fillText("ISINMA", cx, cy - 40 * k);
  g.strokeText("SOĞUMA", cx, cy + 40 * k); g.fillStyle = ICE; g.fillText("SOĞUMA", cx, cy + 40 * k);
  g.restore();
};

function reset() { for (const o of [R.shard, R.brain, R.thermo]) hide(o); R.plume.forEach(hide); R.ash.forEach(hide); R.spot.intensity = 0; }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const MUSE = { ...X.LIGHTS.interior, sunI: 0.35, hemiI: 0.45, amb: 0.12, top: "#141018", bot: "#201a24", fog: "#141018", card: "#d8d0d8", sat: 1.0, vig: 0.55 };
  let cam, light = MUSE, dof = { focus: 4, amount: 0 }, flash = 0, flashCol = "#ffffff", focusPt = [0, 1, 0], tint = null, shk = [0, 0, 0], fade = 1;
  reset();
  const shard = (y = 1.38, spin = 0.25) => { put(R.shard, 0, y + 0.03 * Math.sin(f / 20), 0, spin * Math.sin(f / 40)); R.spot.intensity = 30; const gl = R.shard.userData.glint; gl.position.x = -0.35 + ((f % 90) / 90) * 0.7; R.shard.userData.dec.material.opacity = 0.65 + 0.25 * Math.sin(f / 8); };

  switch (sh.name) {
    case "hook": {
      shard();
      FX.push({ kind: "sparkle", t: f / 30, pos: [0.3, 1.65, 0.3], size: 0.35 });
      cam = E.camAt(f, [{ f: 0, pos: [0.15, 1.4, 1.6], look: [0, 1.45, 0], fov: 42 }, { f: 63, pos: [0.1, 1.4, 1.25], look: [0, 1.42, 0], fov: 42 }], { creep: 0.03 });
      dof = { focus: [0, 1.4, 0], amount: 4 };
      ov.push(big("BEYİN → CAM", 1, f > WF(E, 3) - 3 ? "gerçek bir arkeolojik bulgu" : "", "#ffffff", 120));
      break;
    }
    case "year": case "erupt": {
      light = "golden"; tint = "rgba(255,140,60,0.08)";
      const ex = WF(E, 10) - 3, k = X.span(f, ex - 20, 165);
      if (sh.name === "erupt") {
        R.plume.forEach((p, i) => { const h = i / R.plume.length, kk = X.clamp(k * 1.4 - h * 0.4); if (kk <= 0) return; put(p, TX + 6 + (rnd(i) - 0.5) * 8 * h, 22 + h * 38 * kk, -95 + (rnd(i + 3) - 0.5) * 6, 0, (3 + h * 9) * kk); });
        const s2 = E.shake(f, ex, 0.12, 20); shk = s2;
        if (f >= ex && f < ex + 6) { flash = 0.4 * (1 - (f - ex) / 6); flashCol = "#ffb070"; }
      }
      cam = sh.name === "year" ? E.camAt(f, [{ f: 64, pos: [TX + 0.5, 1.6, 7.5], look: [TX, 3.2, -4.5], fov: 50 }, { f: 106, pos: [TX + 0.3, 1.6, 6.5], look: [TX, 3.4, -4.5], fov: 50 }])
        : E.camAt(f, [{ f: 107, pos: [TX + 5.0, 1.4, 10.0], look: [TX + 6, 16, -95], fov: 50 }, { f: 164, pos: [TX + 5.0, 1.4, 9.0], look: [TX + 6, 18, -95], fov: 50 }]);
      focusPt = [TX, 0, -4];
      if (sh.name === "year") ov.push(big("MS 79", X.span(f, WF(E, 6) - 3, WF(E, 6) + 5), "Roma İmparatorluğu", GOLD, 180));
      else ov.push(big("VEZÜV", X.span(f, WF(E, 8) - 3, WF(E, 8) + 5), f >= ex ? "patladı!" : "", LAVA, 170));
      break;
    }
    case "room": {
      light = "interior"; tint = null;
      const k = X.smooth(X.span(f, WF(E, 18) - 6, WF(E, 23) + 4));
      A.push({ id: "youth", pos: [RX - 1.25, 0.8, -1.15], roll: Math.PI / 2, blob: false, st: { face: "sleep", arms: "hang", blink: 0, bob: 0, tilt: 0, headTilt: 0 }, yaw: 0 });
      R.ash.forEach((a, i) => { const kk = X.clamp(k * 1.6 - (i / R.ash.length) * 0.6); if (kk <= 0) return; put(a, RX + 1.8 - kk * (1 + rnd(i) * 4.5), 1.2 + rnd(i + 2) * 1.6 + kk * 0.2, -3.0 + rnd(i + 5) * 2.4 * kk, 0, 0.3 + kk * (0.4 + rnd(i + 7) * 0.6)); });
      if (k > 0) tint = `rgba(150,130,120,${0.55 * k})`;
      if (f >= WF(E, 23)) { flash = X.span(f, WF(E, 23), 330); flashCol = "#fff6ea"; }
      cam = E.camAt(f, [{ f: 165, pos: [RX + 0.2, 1.6, 3.4], look: [RX - 0.3, 0.95, -1.6], fov: 48 }, { f: 332, pos: [RX + 0.2, 1.55, 2.6], look: [RX - 0.3, 0.95, -1.6], fov: 48 }], { creep: 0.05 });
      focusPt = [RX, 0, -1.5];
      ov.push(card("Herculaneum", "Napoli Körfezi · MS 79"));
      if (f > WF(E, 20) - 3) ov.push(big("KÜL BULUTU", X.span(f, WF(E, 20) - 3, WF(E, 20) + 5), "", ASH, 130));
      break;
    }
    case "hot": case "cool": {
      const hot = sh.name === "hot";
      light = "interior";
      put(R.thermo, RX, 0.4, 0.8);
      const lvl = hot ? X.easeOut(X.span(f, 336, WF(E, 29))) : 1 - X.easeIn(X.span(f, WF(E, 31) - 4, 450));
      R.thermo.userData.col.scale.y = 0.05 + 1.65 * lvl; R.thermo.userData.col.position.y = 0.2 + 0.5 * (0.05 + 1.65 * lvl) - 0.5 * 0.05;
      tint = hot ? `rgba(255,110,30,${0.12 + 0.25 * lvl})` : `rgba(60,140,255,${0.32 * X.span(f, 405, 430)})`;
      const n = Math.round(510 * lvl);
      cam = E.camAt(f, [{ f: sh.f0, pos: [RX + 0.15, 1.35, 3.3], look: [RX, 1.35, 0.8], fov: 46 }, { f: sh.f1 - 1, pos: [RX + 0.15, 1.35, 3.0], look: [RX, 1.35, 0.8], fov: 46 }]);
      if (hot) ov.push(big(`${n}°C`, 1, f > WF(E, 29) - 3 ? "ve üstü" : "", LAVA, 180));
      else ov.push(big("HIZLA SOĞUDU", X.span(f, WF(E, 31) - 3, WF(E, 31) + 5), "", ICE, 120));
      break;
    }
    case "cycle": {
      light = MUSE;
      put(R.brain, 0, 1.45, 0, f * 0.01, 1);
      R.brain.userData.m.color.set("#f2a0b0"); R.spot.intensity = 30;
      cam = E.camAt(f, [{ f: 451, pos: [0, 1.5, 2.6], look: [0, 1.4, 0], fov: 44 }, { f: 501, pos: [0, 1.5, 2.4], look: [0, 1.4, 0], fov: 44 }]);
      tint = `rgba(${f % 30 < 15 ? "255,110,30" : "60,140,255"},0.10)`;
      ov.push(cycle(f, X.span(f, 453, 460)));
      break;
    }
    case "brain": {
      light = MUSE; R.spot.intensity = 30;
      const k = X.smooth(X.span(f, WF(E, 40) - 8, WF(E, 41) + 6));
      put(R.brain, 0, 1.45, 0, f * 0.01, 1);
      R.brain.userData.m.color.set("#f2a0b0").lerp(new E.THREE.Color("#1a1620"), k);
      R.brain.userData.m.emissive.set("#000000").lerp(new E.THREE.Color("#2a2040"), k);
      if (k > 0.7) FX.push({ kind: "sparkle", t: f / 30, pos: [0.15, 1.75, 0.35], size: 0.55 });
      cam = E.camAt(f, [{ f: 502, pos: [0.1, 1.5, 2.3], look: [0, 1.38, 0], fov: 44 }, { f: 586, pos: [0.1, 1.5, 1.9], look: [0, 1.38, 0], fov: 44 }]);
      dof = { focus: [0, 1.45, 0], amount: 3 };
      ov.push(big(k < 0.5 ? "BEYİN" : "SİYAH CAM", 1, k < 0.5 ? "doku" : "parlak", k < 0.5 ? "#ff9ab0" : "#ffffff", 150));
      break;
    }
    case "lab": {
      light = "interior";
      A.push({ id: "sci", pos: [LBX - 0.3, 0, -1.2], st: st(151, { face: f > WF(E, 51) ? "wow" : "think", arms: f > WF(E, 51) ? "point" : "chin", look: 0.7 }) });
      if (f > WF(E, 49) - 3) FX.push({ kind: "sparkle", t: f / 30, pos: [LBX + 0.9, 1.75, -2.3], size: 0.6 });
      cam = E.camAt(f, [{ f: 587, pos: [LBX + 0.2, 1.55, 2.2], look: [LBX + 0.2, 1.4, -2.0], fov: 48 }, { f: 709, pos: [LBX + 0.35, 1.5, 1.2], look: [LBX + 0.5, 1.4, -2.2], fov: 46 }]);
      focusPt = [LBX, 0, -2];
      ov.push(big("NÖRON İZLERİ", X.span(f, WF(E, 49) - 3, WF(E, 49) + 5), "2000 yıl sonra bile", "#ffd9a0", 120));
      break;
    }
    case "years": case "gaze": {
      shard(1.38, sh.name === "gaze" ? 0.1 : 0.25);
      const close = sh.name === "gaze";
      cam = E.camAt(f, [{ f: sh.f0, pos: [0.2, 1.45, close ? 1.3 : 2.4], look: [0, 1.4, 0], fov: 44 }, { f: sh.f1 - 1, pos: [0.08, 1.42, close ? 0.95 : 2.0], look: [0, 1.4, 0], fov: 44 }], { creep: 0.03 });
      dof = { focus: [0, 1.4, 0], amount: 4 };
      if (!close) ov.push(big("2000 YIL", X.span(f, WF(E, 54) - 3, WF(E, 54) + 5), "önceki bir beyin", GOLD, 170));
      else { FX.push({ kind: "sparkle", t: f / 30, pos: [0.12, 1.5, 0.3], size: 0.3 }); ov.push(big("bize bakıyor", X.span(f, WF(E, 61) - 3, WF(E, 61) + 5), "", "#ffffff", 120)); }
      break;
    }
    case "end": {
      light = { ...X.LIGHTS.golden, top: "#c8502a", bot: "#ffb070", sunI: 0.9 }; tint = "rgba(255,110,40,0.10)";
      R.plume.slice(0, 6).forEach((p, i) => put(p, TX + 6 + Math.sin(i + f / 30) * 1.5, 23 + i * 3.5, -95, 0, 2 + i * 0.8));
      cam = E.camAt(f, [{ f: 815, pos: [TX + 5.0, 1.3, 10.0], look: [TX + 6, 14, -95], fov: 50 }, { f: 913, pos: [TX + 5.0, 1.3, 9.2], look: [TX + 6, 14, -95], fov: 50 }], { creep: 0.06 });
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 817, 825), f >= WF(E, 66) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  cam.pos = cam.pos.map((v, i) => v + shk[i]);
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, flashCol, overlay: fin, focusPt, fade };
}
