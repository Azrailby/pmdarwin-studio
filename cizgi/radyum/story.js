// Karanlıkta Parlayan Kızlar — PMDARWIN (~35 sn) · saygılı ton, hastalık detayı yok
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [101, "boss"], [193, "era"], [265, "dials"], [404, "brush"], [501, "glow"], [605, "jaw"],
  [668, "empty"], [771, "court"], [870, "modern"], [958, "end"]];
const END = 1057;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const GLOW = "#9dff7a", SEP = "#e8d2a8", RED = "#e0554a";
const CX = 200, MX = 300; // mahkeme, modern fabrika (atölye x=0, dış cephe x=-100)
const OX = -100;
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function dialTex(E, big = false) {
  const TH = E.THREE, n = big ? 512 : 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"), m = n / 2;
  g.fillStyle = "#20281f"; g.beginPath(); g.arc(m, m, m * 0.94, 0, 7); g.fill(); g.lineWidth = n * 0.04; g.strokeStyle = "#b89a5a"; g.stroke();
  g.fillStyle = GLOW; g.shadowColor = "#7dff5a"; g.shadowBlur = n * 0.05; g.textAlign = "center"; g.textBaseline = "middle"; g.font = `900 ${n * 0.12}px CizgiFont, Nunito, sans-serif`;
  for (let i = 1; i <= 12; i++) { const a = (i / 12) * Math.PI * 2 - Math.PI / 2; g.fillText(String(i), m + Math.cos(a) * m * 0.7, m + Math.sin(a) * m * 0.7); }
  g.beginPath(); g.arc(m, m, n * 0.03, 0, 7); g.fill();
  const t = new TH.CanvasTexture(c); t.colorSpace = TH.SRGBColorSpace; return t;
}
function makeBrush(E) {
  const g = E.group(null, [0, -50, 0]);
  const h = E.cyl(0.012, 0.016, 0.22, E.mat("#8a5a36"), [0, 0, 0], { parent: g, seg: 6 }); h.castShadow = false;
  E.cone(0.022, 0.06, E.mat("#d8f8c8", { emissive: GLOW, glow: 1.4 }), [0, 0.22, 0], { parent: g, seg: 8 }).rotation.x = 0;
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- atölye (x=0) ----
  S.room({ w: 10, d: 8, wall: T.brick("#8a5a45"), floor: T.planks("#7a5a3a"), window: false, door: true, z: 0 });
  S.hangLamp(-1.2, 3.4, -1.2, { col: "#3a4a3a", i: 2 }); S.hangLamp(1.4, 3.4, -1.2, { col: "#3a4a3a", i: 2 });
  S.shelf(3.3, -3.6, { seed: 3 });
  R.bench = E.group(null, [0, 0, -0.35]);
  E.box(4.2, 0.1, 1.0, E.mat("#ffffff", { map: T.wood("#8a6a46") }), [0, 0.9, 0], { parent: R.bench });
  for (const [a, b] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) E.box(0.1, 0.9, 0.1, E.mat("#5a3a22"), [a * 2.0, 0, b * 0.42], { parent: R.bench });
  E.box(4.2, 0.6, 0.06, E.mat("#6b4a2e"), [0, 0.3, 0.45], { parent: R.bench });
  const dt = dialTex(E);
  const dm = E.flat("#ffffff", { map: dt, transparent: true }); dm.alphaTest = 0.5;
  R.dials = [];
  for (let i = 0; i < 18; i++) { const d = E.plane(0.17, 0.17, dm, [-1.9 + (i % 9) * 0.47, 1.012, -0.35 + (i < 9 ? 0.25 : -0.1)], { rot: [-Math.PI / 2, 0, 0], noink: true }); d.castShadow = false; R.dials.push(d); }
  for (const x of [-1.95, 1.95]) { const jar = E.cyl(0.07, 0.07, 0.12, E.mat("#cfe8c0", { emissive: "#5aff3a", glow: 0.9 }), [x, 1.0, -0.6], { seg: 12 }); jar.castShadow = false; }
  for (const x of [-1.3, 0, 1.3]) S.chair(x, -1.45, { col: "#6b4a2e" });
  R.glowL = new TH.PointLight(0x7dff6a, 2, 4, 2); R.glowL.position.set(0, 1.4, 0.2); E.scene.add(R.glowL);
  R.brushes = [makeBrush(E), makeBrush(E), makeBrush(E)];
  R.teeth = E.box(0.13, 0.03, 0.01, E.flat(GLOW), [0, -50, 0], { center: true, noShadow: true }); R.teeth.userData.noink = true;
  R.nails = [];
  for (let i = 0; i < 10; i++) { const n = E.sphere(0.016, E.flat(GLOW), [0, -50, 0], { seg: 8 }); n.castShadow = false; n.userData.noink = true; R.nails.push(n); }
  // ---- fabrika dış cephe (x=OX) ----
  E.ground(T.cobble("#a89a82"), 60, 0.3, [OX, 0.005, 0]);
  S.building(OX, -6, { w: 12, d: 7, floors: 3, wall: "#9a5a44", brick: true, flatRoof: true, shutter: null, win: "#d8c88a", cols: 5 });
  E.label(T.sign("SAAT FABRİKASI", { bg: "#2a2a2a", fg: "#f4e3b0", size: 140 }), 4.2, 0.8, [OX, 6.6, -2.4]);
  E.cyl(0.5, 0.6, 9, E.mat("#8a4a3a", { map: T.brick("#8a4a3a") }), [OX + 4.6, 0, -8], { seg: 14 });
  S.car(OX + 2.2, 0.6, { col: "#2a2a2a", rot: 0.3 });
  S.lamp(OX - 3.2, 0.4);
  // ---- mahkeme (x=CX) ----
  S.room({ w: 12, d: 9, x: CX, wall: T.wallpaper("#c9b48a", "#b8a078"), floor: T.planks("#6b4428"), window: true, door: false });
  E.box(3.4, 0.4, 1.6, E.mat("#5a3a22"), [CX, 0, -3.3]);
  E.box(3.2, 1.35, 0.7, E.mat("#ffffff", { map: T.wood("#7a4a2a") }), [CX, 0.4, -2.6]);
  E.box(3.4, 0.08, 0.85, E.mat("#5a3a22"), [CX, 1.75, -2.6]);
  E.label(T.sign("MAHKEME", { bg: "#5a3a22", fg: "#f2c23a", size: 150 }), 1.5, 0.4, [CX, 1.15, -2.24]);
  R.gavel = E.group(null, [CX + 0.55, 1.85, -2.45]);
  const gh = E.group(R.gavel, [0, 0, 0]); R.gavelHead = gh;
  E.cyl(0.02, 0.02, 0.4, E.mat("#5a3a22"), [0.2, 0.0, 0], { parent: gh, center: true, seg: 6 }).rotation.z = Math.PI / 2;
  E.cyl(0.07, 0.07, 0.22, E.mat("#7a4a2a"), [0.4, 0, 0], { parent: gh, center: true, seg: 12 }).rotation.x = Math.PI / 2;
  E.cyl(0.1, 0.12, 0.05, E.mat("#5a3a22"), [0.4, -0.07, 0.0], { parent: R.gavel, seg: 12 });
  for (let i = 0; i < 4; i++) S.bench(CX - 3 + (i % 2) * 6, 1.2 + Math.floor(i / 2) * 1.6, 0);
  // ---- modern fabrika (x=MX) ----
  S.room({ w: 12, d: 9, x: MX, wall: T.tiles("#eef2f4", "#dfe6ea", 10), floor: T.tiles("#cfd6dc", "#bfc8cf", 6), window: true, door: true });
  E.label(T.sign("İŞ GÜVENLİĞİ", { bg: "#ffd23f", fg: "#1d1622", size: 150, sub: "eldiven · gözlük · maske", subSize: 60 }), 2.4, 0.9, [MX + 0.6, 2.4, -4.42]);
  for (let i = 0; i < 10; i++) E.box(0.24, 0.12, 0.02, E.mat(i % 2 ? "#ffd23f" : "#1d1622"), [MX - 0.6 + i * 0.24 + 0.12, 1.75, -4.43], { center: true });
  S.table(MX, -1.0, { w: 2.6, d: 0.9, col: "#9aa3b2" });
  E.box(0.8, 0.5, 0.5, E.mat("#cfe9ff", { transparent: true, opacity: 0.6 }), [MX + 0.4, 0.95, -1.0]);
  for (const s of [-1, 1]) { const gl = E.sphere(0.08, E.mat("#3f8fd0"), [MX - 0.6 + s * 0.12, 0.98, -0.85], { seg: 10 }); gl.scale.set(1, 0.35, 1.5); }
  // ---- son: büyük kadran ----
  R.bigDial = E.group(null, [0, -50, 0]);
  const bm = E.flat("#ffffff", { map: dialTex(E, true), transparent: true }); bm.alphaTest = 0.5;
  E.plane(1.2, 1.2, bm, [0, 0, 0], { parent: R.bigDial, noink: true });
  R.hh = E.box(0.03, 0.3, 0.01, E.flat(GLOW), [0, 0, 0.02], { parent: R.bigDial, center: true }); R.hh.geometry.translate(0, 0.13, 0);
  R.mh = E.box(0.02, 0.45, 0.01, E.flat(GLOW), [0, 0, 0.03], { parent: R.bigDial, center: true }); R.mh.geometry.translate(0, 0.2, 0);
  // ---- karakterler ----
  E.actor("w1", { dress: "#8a6a8a", shirt: "#8a6a8a", apron: "#e8e0cc", hair: "short", hairCol: "#3a2a20", skin: "#f6dcc0", seed: 31 });
  E.actor("w2", { dress: "#5a7a8a", shirt: "#5a7a8a", apron: "#e8e0cc", hair: "bun", hairCol: "#7a4a2a", skin: "#f0d0b0", seed: 32 });
  E.actor("w3", { dress: "#a8744a", shirt: "#a8744a", apron: "#e8e0cc", hair: "long", hairCol: "#2a1a14", skin: "#e9c3a0", seed: 33 });
  E.actor("boss", { jacket: "#3a3a44", shirt: "#e8e0cc", tie: "#7a2a2a", pants: "#3a3a44", hat: "bowler", hatCol: "#2a2a30", moustache: "#3a2a20", build: "stout", skin: "#f0c9a4", seed: 34 });
  E.actor("judge", { jacket: "#1d1a22", shirt: "#1d1a22", pants: "#1d1a22", hair: "short", hairCol: "#d8d8d8", glasses: true, skin: "#e9c3a0", seed: 35 });
  E.actor("wk1", { shirt: "#ff8a2a", pants: "#2f4a6a", hat: "hardhat", hatCol: "#ffd23f", glasses: true, skin: "#c98f66", seed: 36, belt: "#d8e0e8" });
  E.actor("wk2", { shirt: "#ff8a2a", pants: "#2f4a6a", hat: "hardhat", hatCol: "#ffffff", glasses: true, hair: "long", hairCol: "#3a2a20", skin: "#f6dcc0", seed: 37, belt: "#d8e0e8" });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(30,24,16,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = GLOW; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#e8dcc0"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = GLOW, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#16120c"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  R.brushes.forEach(hide); hide(R.teeth); R.nails.forEach(hide); hide(R.bigDial);
  R.gavelHead.rotation.z = 0; R.glowL.intensity = 0;
}
// fırça: kadrandan dudağa (k: 0 kadran, 1 dudak)
function brushAt(b, x, k, zA = -0.9, f = 0) {
  const p0 = [x + 0.18, 1.0, -0.2], p1 = [x + 0.02, 1.44, zA + 0.1];
  const y = p0[1] + (p1[1] - p0[1]) * k + 0.05 * Math.sin(Math.PI * k);
  put(b, p0[0] + (p1[0] - p0[0]) * k, y, p0[2] + (p1[2] - p0[2]) * k);
  b.rotation.set(-0.3 - 0.9 * k, 0, 0.5 - 0.6 * k + (k < 0.05 ? 0.15 * Math.sin(f / 3) : 0));
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const DARK = { ...X.LIGHTS.interior, sunI: 0.25, hemiI: 0.4, amb: 0.1, sky: "#6a7a6a", top: "#151a18", bot: "#202824", fog: "#141816", card: "#9aa39a", sat: 0.9, vig: 0.6, warm: 0.0 };
  const SEPIA = { ...X.LIGHTS.interior, sat: 0.72, warm: 0.08, con: 1.04, vig: 0.42 };
  let cam, light = SEPIA, dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, 0], tint = "rgba(130,95,40,0.12)";
  reset();
  const W = [["w1", -0.95, 31], ["w2", 0, 32], ["w3", 0.95, 33]];
  const atBench = (o = {}) => W.forEach(([id, x, sd]) => A.push({ id, pos: [x, 0.22, -0.95], blob: false, st: st(sd, { face: o.face || "happy", arms: "hold", look: 0, ...(o[id] || {}) }), tint: o.tint }));

  switch (sh.name) {
    case "hook": {
      light = DARK; tint = "rgba(10,30,15,0.18)"; R.glowL.intensity = 2.2;
      const k = X.smooth(X.span(f, WF(E, 3) - 4, WF(E, 4) + 2)) * (1 - X.smooth(X.span(f, WF(E, 5) + 6, WF(E, 5) + 18)));
      atBench({ face: "neutral", tint: "#a9b2a9", w2: { face: k > 0.6 ? "smug" : "neutral" } });
      R.brushes.forEach((b, i) => brushAt(b, W[i][1], i === 1 ? k : 0.05 * Math.abs(Math.sin(f / 12 + i)), -0.95, f + i * 9));
      cam = E.camAt(f, [{ f: 0, pos: [0.0, 1.3, 3.9], look: [0, 1.4, -0.8], fov: 50 }, { f: 100, pos: [0.05, 1.3, 2.2], look: [0, 1.42, -0.9], fov: 48 }]);
      dof = { focus: [0, 1.2, -0.9], amount: 3 };
      ov.push(big("PARLAYAN BOYA", X.span(f, WF(E, 2) - 3, WF(E, 2) + 5), f > WF(E, 4) - 3 ? "dudakla sivriltildi" : "", GLOW, 120));
      break;
    }
    case "boss": {
      R.glowL.intensity = 1.5;
      atBench({ face: f > WF(E, 9) + 4 ? "happy" : "neutral" });
      A.push({ id: "boss", pos: [1.25, 0, 0.65], st: st(34, { face: f > WF(E, 9) - 3 ? "grin" : "smug", arms: f > WF(E, 9) - 3 ? "point" : "hip", look: -0.6 }) });
      cam = E.camAt(f, [{ f: 101, pos: [0.55, 1.35, 4.8], look: [0.5, 1.5, -0.3], fov: 50 }, { f: 192, pos: [0.65, 1.35, 4.3], look: [0.55, 1.5, -0.2], fov: 50 }]);
      ov.push(big("“GÜVENLİ!”", X.span(f, WF(E, 9) - 3, WF(E, 9) + 5), "dedi patronlar", "#ffffff", 140));
      break;
    }
    case "era": {
      light = ["golden", "golden", 0]; tint = "rgba(140,100,40,0.16)";
      cam = E.camAt(f, [{ f: 193, pos: [OX + 0.5, 1.8, 10.0], look: [OX, 4.0, -4], fov: 52 }, { f: 264, pos: [OX + 0.3, 1.7, 8.6], look: [OX, 4.0, -4], fov: 52 }]);
      focusPt = [OX, 0, -2];
      if (f < WF(E, 17) - 2) ov.push(big("1920'ler", X.span(f, WF(E, 12) - 3, WF(E, 12) + 5), "", SEP, 160));
      else ov.push(card("Amerika", "saat fabrikaları · 1920'ler"), big("1920'ler", 1, "", SEP, 160));
      break;
    }
    case "dials": {
      R.glowL.intensity = 1.2 + 1.5 * X.span(f, WF(E, 22) - 3, WF(E, 22) + 10);
      if (f > WF(E, 22) - 3) { light = ["interior", DARK, X.span(f, WF(E, 22) - 3, WF(E, 22) + 10)]; light = { ...X.LIGHTS.interior }; }
      const dark = X.span(f, WF(E, 22) - 3, WF(E, 22) + 10);
      light = dark > 0 ? DARK : SEPIA; tint = dark > 0 ? "rgba(10,30,15,0.18)" : tint;
      atBench({ face: "neutral", tint: dark > 0 ? "#a9b2a9" : undefined });
      R.brushes.forEach((b, i) => brushAt(b, W[i][1], 0.03 * Math.abs(Math.sin(f / 9 + i)), -0.95, f + i * 5));
      cam = E.camAt(f, [{ f: 265, pos: [-1.3, 1.75, 0.9], look: [-0.3, 0.95, -0.35], fov: 46 }, { f: 403, pos: [0.6, 1.75, 0.9], look: [-0.2, 0.95, -0.35], fov: 46 }]);
      dof = { focus: [-0.6, 1.0, -0.35], amount: 4 };
      ov.push(card("Radyum boyası", "karanlıkta parlayan rakamlar"));
      ov.push(big("KARANLIKTA PARLAR", X.span(f, WF(E, 22) - 3, WF(E, 22) + 5), "", GLOW, 100));
      break;
    }
    case "brush": {
      light = DARK; tint = "rgba(10,30,15,0.16)"; R.glowL.intensity = 3.5;
      const cyc = ((f - 404) % 44) / 44, k = cyc < 0.5 ? X.smooth(cyc * 2) : X.smooth((1 - cyc) * 2);
      A.push({ id: "w2", pos: [0, 0.22, -0.95], blob: false, st: st(32, { face: "neutral", arms: "hold", look: 0, bob: 0, headTilt: 0 }), tint: "#b0b8b0" });
      brushAt(R.brushes[1], 0, k, -0.95, f);
      if (k > 0.85) FX.push({ kind: "sparkle", t: f / 30, pos: [0.15, 1.58, -0.7], size: 0.35 });
      if (k < 0.15) FX.push({ kind: "sparkle", t: f / 30, pos: [0.2, 1.05, -0.15], size: 0.3 });
      cam = E.camAt(f, [{ f: 404, pos: [0.4, 1.3, 1.5], look: [0.05, 1.3, -0.7], fov: 44 }, { f: 500, pos: [0.35, 1.3, 1.25], look: [0.05, 1.3, -0.7], fov: 44 }], { creep: 0.04 });
      ov.push(big("fırça → dudak → kadran", X.span(f, 408, 416), f > WF(E, 31) - 3 ? "tekrar tekrar" : "", GLOW, 80));
      break;
    }
    case "glow": {
      light = DARK; tint = "rgba(5,20,10,0.28)"; R.glowL.intensity = 2.5;
      const lit = f >= WF(E, 36) - 3, nails = f >= WF(E, 38) - 3;
      A.push({ id: "w3", pos: [0, 0, -0.2], st: { face: lit ? "grin" : "happy", arms: nails ? "up" : "hip", blink: E.blink(f, 33), bob: 0, tilt: 0, headTilt: 0 }, tint: "#6f786f" });
      if (lit) { put(R.teeth, 0, 1.252, -0.17); R.teeth.scale.set(1, 1, 1); }
      if (nails) R.nails.forEach((n, i) => { const s = i < 5 ? -1 : 1, j = i % 5; put(n, s * (0.44 + (j - 2) * 0.022), 1.47 + 0.035 + Math.abs(j - 2) * -0.008, -0.16); });
      if (lit) FX.push({ kind: "sparkle", t: f / 30, pos: [0.35, 1.7, -0.1], size: 0.4 });
      cam = E.camAt(f, [{ f: 501, pos: [0.1, 1.45, 2.4], look: [0, 1.4, -0.2], fov: 44 }, { f: 604, pos: [0.05, 1.45, 2.1], look: [0, 1.42, -0.2], fov: 44 }]);
      ov.push(big(nails ? "tırnaklar da" : "gülümseme parlıyor", X.span(f, WF(E, 36) - 3, WF(E, 36) + 5), "eğlence sandılar", GLOW, 100));
      break;
    }
    case "jaw": {
      light = SEPIA; tint = "rgba(60,50,40,0.18)";
      A.push({ id: "w1", pos: [0, 0, 0], st: st(31, { face: "sad", arms: "chin", look: 0.3 }) });
      cam = E.camAt(f, [{ f: 605, pos: [0.3, 1.4, 2.7], look: [0, 1.55, -0.4], fov: 44 }, { f: 667, pos: [0.25, 1.4, 2.4], look: [0, 1.55, -0.4], fov: 44 }]);
      dof = { focus: [0, 1.4, 0], amount: 4 };
      ov.push(big("ağrı başladı", X.span(f, WF(E, 42) - 3, WF(E, 42) + 5), "", "#ffffff", 110));
      break;
    }
    case "empty": {
      light = { ...SEPIA, sat: 0.35, sunI: 0.6, hemiI: 0.7, vig: 0.55 }; tint = "rgba(20,22,30,0.32)"; R.glowL.intensity = 0.4;
      R.brushes.forEach((b, i) => { put(b, W[i][1] + 0.2, 1.02, -0.3); b.rotation.set(Math.PI / 2, 0, 0.4 + i * 0.3); });
      cam = E.camAt(f, [{ f: 668, pos: [0.0, 1.45, 4.2], look: [0, 1.25, -0.8], fov: 48 }, { f: 770, pos: [0.0, 1.4, 3.4], look: [0, 1.2, -0.8], fov: 48 }]);
      const n = Math.round(30 * X.easeOut(X.span(f, WF(E, 51) - 4, WF(E, 51) + 10)));
      if (f < WF(E, 51) - 3) ov.push(big("1927", X.span(f, WF(E, 45) - 3, WF(E, 45) + 5), "", "#ffffff", 160));
      else ov.push(big(`${n}+`, 1, "kadın hayatını kaybetti", "#ffffff", 170));
      break;
    }
    case "court": {
      light = "interior"; tint = "rgba(130,95,40,0.08)";
      const g1 = WF(E, 58) - 3, win = f >= g1;
      A.push({ id: "judge", pos: [CX, 0.8, -3.15], st: st(35, { face: win ? "determined" : "neutral", arms: "hang", look: 0.2 }), blob: false });
      W.forEach(([id, x, sd], i) => A.push({ id, pos: [CX - 1.15 + i * 0.85, 0, 0.3 + (i % 2) * 0.2], st: st(sd, { face: win ? "grin" : f > 840 ? "happy" : "determined", arms: win ? (i === 1 ? "cheer" : "up") : "hang", look: 0.2 }) }));
      const sw = X.span(f, g1 - 8, g1); R.gavelHead.rotation.z = f < g1 ? 0.9 * X.smooth(sw / 0.6) * (sw < 0.6 ? 1 : 0) + (sw >= 0.6 ? 0.9 * (1 - X.easeIn((sw - 0.6) / 0.4)) : 0) : 0;
      if (f >= g1 && f < g1 + 12) FX.push({ kind: "burst", pos: [CX + 0.95, 1.9, -2.3], size: 0.5 * X.back(X.span(f, g1, g1 + 5)), opt: { col: "#fff3a8", text: "TAK!", size: 100 } });
      cam = E.camAt(f, [{ f: 771, pos: [CX + 1.4, 2.5, 5.0], look: [CX - 0.1, 1.45, -1.6], fov: 50 }, { f: 869, pos: [CX + 1.2, 2.4, 4.4], look: [CX - 0.1, 1.45, -1.5], fov: 50 }]);
      focusPt = [CX, 0, -1];
      if (f < 839) ov.push(big("MAHKEME", X.span(f, WF(E, 55) - 3, WF(E, 55) + 5), "", SEP, 130));
      else ov.push(big("KAZANDILAR", 1, "Radyum Kızları", GLOW, 140));
      if (win && f >= 839) FX.push({ kind: "sparkle", t: f / 30, pos: [CX, 2.6, 0.1], size: 0.9 });
      break;
    }
    case "modern": {
      light = "interior"; tint = null;
      A.push({ id: "wk1", pos: [MX - 0.75, 0, -0.35], st: st(36, { face: "happy", arms: "hold", look: 0.4 }) });
      A.push({ id: "wk2", pos: [MX + 0.75, 0, -0.35], st: st(37, { face: "grin", arms: f > 920 ? "present" : "hold", look: -0.4 }) });
      cam = E.camAt(f, [{ f: 870, pos: [MX + 0.1, 1.55, 4.2], look: [MX + 0.1, 1.55, -1.5], fov: 50 }, { f: 957, pos: [MX + 0.1, 1.5, 3.6], look: [MX + 0.1, 1.55, -1.5], fov: 50 }]);
      focusPt = [MX, 0, -1];
      ov.push(big("İŞ GÜVENLİĞİ", X.span(f, WF(E, 62) - 3, WF(E, 62) + 5), "kuralların temeli", "#ffd23f", 130));
      break;
    }
    case "end": {
      light = DARK; tint = "rgba(5,20,10,0.2)";
      put(R.bigDial, 0, 1.1, 1.0);
      R.mh.rotation.z = -f * 0.02; R.hh.rotation.z = -f * 0.002 - 1.2;
      cam = E.camAt(f, [{ f: 958, pos: [0, 1.25, 2.9], look: [0, 1.25, 1.0], fov: 44 }, { f: 1056, pos: [0, 1.25, 2.6], look: [0, 1.25, 1.0], fov: 44 }], { creep: 0.04 });
      dof = { focus: [0, 1.1, 1.0], amount: 3 };
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 960, 968), f >= WF(E, 70) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
