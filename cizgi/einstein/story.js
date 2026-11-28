// Einstein'ın Beyni Çalındı — PMDARWIN (Barış anlatıcı sesi)
export const meta = { fps: 30 };

// Çekimler cümle cümle: sınırlar words.json'daki cümle sonlarından (. ? !) hesaplanır.
const NAMES = ["hook", "year", "wish", "harvey", "fired", "slice", "box", "back", "secret", "scale"];
let SHOTS = null, END = 1100, SW = [];
function buildShots(E) {
  const fps = E.fps, w = E.words; SHOTS = [[0, NAMES[0]]]; SW = [0];
  for (let i = 0; i < w.length - 1 && SHOTS.length < NAMES.length; i++)
    if (/[.?!…]["']?$/.test(w[i].w)) { SHOTS.push([Math.round(w[i + 1].s * fps) - 3, NAMES[SHOTS.length]]); SW.push(i + 1); }
  while (SHOTS.length < NAMES.length) SHOTS.push([SHOTS[SHOTS.length - 1][0] + 90, NAMES[SHOTS.length]]);
  END = w.length ? Math.ceil((w[w.length - 1].e + 0.7) * fps) : 1100;
}
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], i, f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => (E.words.length ? Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps) : 0);

const GOLD = "#f2c46a", PINK = "#f3a7b8";
const HX = 100, SX = 200, AX = 300, LX = 500, BX = 700, JX = 600, TX = 800; // hastane, çalışma odası, otopsi odası, lab, bodrum, kavanoz (kanca), terazi
let R = {};

function makeJar(E, s = 1, glow = 0.25) {
  const g = E.group(null, [0, -50, 0]);
  E.cyl(0.26 * s, 0.26 * s, 0.6 * s, E.mat("#d8f2ff", { transparent: true, opacity: 0.35, emissive: "#9fd8ff", glow }), [0, 0, 0], { parent: g, seg: 24 }).userData.noink = true;
  E.cyl(0.27 * s, 0.27 * s, 0.1 * s, E.mat("#8a8f98"), [0, 0.6 * s, 0], { parent: g, seg: 24 });
  const liq = E.cyl(0.24 * s, 0.24 * s, 0.46 * s, E.mat("#f6e7b0", { transparent: true, opacity: 0.35, emissive: "#d8c070", glow: glow * 1.5 }), [0, 0.02 * s, 0], { parent: g, seg: 20 }); liq.userData.noink = true;
  const pm = E.mat(PINK, { emissive: "#c0607a", glow: glow * 1.2 });
  for (let i = 0; i < 7; i++) { const a = i * 2.3, r = 0.1 * s * (i % 3 ? 1 : 0.3); const p = E.box(0.09 * s, 0.07 * s, 0.08 * s, pm, [Math.cos(a) * r, (0.08 + 0.055 * i) * s, Math.sin(a) * r], { parent: g, center: true }); p.rotation.set(i, i * 0.7, 0); }
  E.label(E.T.sign("E.", { bg: "#f4ecd6", size: 220 }), 0.24 * s, 0.13 * s, [0, 0.3 * s, 0.262 * s], { parent: g });
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.grass("#7a9a5a"), 500, 0.25);
  // ---- hastane dış cephe (x=HX) ----
  S.street({ x: HX, len: 40, z: 2 });
  S.building(HX, -4, { w: 12, d: 6, floors: 4, wall: "#e8dcc4", roof: "#6a5a5a", flatRoof: true, door: true, cols: 5, brick: true });
  E.label(T.sign("PRINCETON HOSPITAL", { bg: "#f4ecd6", size: 120 }), 4.4, 0.6, [HX, 3.6, -0.95]);
  S.tree(HX - 7.5, -1, { s: 1.2 }); S.tree(HX + 7.5, -1, { s: 1.2 }); S.lamp(HX - 3.5, 0.5); S.lamp(HX + 3.5, 0.5);
  R.cal = E.group(null, [HX + 1.0, 1.0, 1.2]);
  E.box(0.9, 1.1, 0.05, E.mat("#b8262e"), [0, 0, 0], { parent: R.cal, center: true });
  E.label(T.sign("NİSAN", { bg: "#b8262e", fg: "#ffffff", size: 130, border: null }), 0.86, 0.26, [0, 0.38, 0.03], { parent: R.cal });
  E.label(T.sign("18", { bg: "#fbf8ef", size: 300, w: 512, h: 384, border: null, sub: "1955", subSize: 90 }), 0.86, 0.72, [0, -0.13, 0.03], { parent: R.cal });
  R.boxCarry = E.box(0.55, 0.38, 0.4, E.mat("#c79a5b", { map: T.planks("#c79a5b", 3) }), [0, -50, 0], { center: true });
  R.ret = []; for (let i = 0; i < 2; i++) R.ret.push(makeJar(E, 0.5, 0.15));
  // ---- çalışma odası (x=SX) ----
  S.room({ x: SX, w: 7, d: 6, h: 3.4, wall: T.wallpaper("#d8c8a0", "#cbb88c", "stripe"), floor: T.planks("#7a5232"), window: true, door: false });
  S.shelf(SX - 2.3, -2.7, { seed: 7 }); S.desk(SX + 1.6, -1.8, {});
  const board = E.box(2.0, 1.2, 0.06, E.mat("#2f4a3a"), [SX - 0.2, 1.5, -2.95]);
  E.label(T.sign("E = mc²", { bg: "#2f4a3a", fg: "#f4f4f4", size: 170, border: null }), 1.8, 0.66, [SX - 0.2, 2.1, -2.9]);
  R.note = E.label(T.sign("YAKILMAK\nİSTİYORUM", { bg: "#fbf8ef", size: 140, w: 768, h: 512 }), 0.75, 0.5, [SX + 0.85, 1.65, -0.4]);
  // ---- otopsi odası (x=AX) ----
  S.room({ x: AX, w: 7, d: 6, h: 3.2, wall: T.tiles("#cfe3d6", "#b9d3c4", 10), floor: T.tiles("#dfe8e2", "#a9bdb2", 6), window: false, door: true });
  E.box(2.0, 0.9, 0.9, E.mat("#b9c4cc", { map: T.metal("#b9c4cc") }), [AX + 0.9, 0, -1.2]);
  E.box(1.4, 0.06, 0.5, E.mat("#f8fbff", { emissive: "#e0f0ff", glow: 1.2 }), [AX, 3.15, -1]);
  R.aJar = makeJar(E, 0.7, 0.2);
  // ---- laboratuvar (x=LX) ----
  E.box(10, 6, 0.2, E.mat("#d0d6cc"), [LX, 0, -2.5]); E.box(10, 0.05, 8, E.mat("#ffffff", { map: T.tiles("#ece6d6", "#d6cdb6", 8) }), [LX, 0, 0]);
  S.table(LX, -0.6, { w: 2.4, d: 1.1, col: "#7a5a3a" });
  R.cubes = []; for (let i = 0; i < 48; i++) R.cubes.push(E.box(0.09, 0.07, 0.09, E.mat(PINK), [LX - 0.85 + (i % 12) * 0.12, 0.95, -0.95 + Math.floor(i / 12) * 0.13], { center: true }));
  R.lJars = []; for (let i = 0; i < 2; i++) R.lJars.push(makeJar(E, 0.75, 0.1));
  R.scope = E.group(null, [LX + 0.75, 0.9, -0.5]);
  E.box(0.3, 0.06, 0.25, E.mat("#2b2f3a"), [0, 0, 0], { parent: R.scope }); E.cyl(0.03, 0.03, 0.45, E.mat("#2b2f3a"), [-0.1, 0, 0], { parent: R.scope, seg: 8 });
  const tube = E.cyl(0.05, 0.04, 0.32, E.mat("#e8eef2"), [0, 0.32, 0], { parent: R.scope, seg: 12 }); tube.rotation.z = 0.35;
  // ---- bodrum (x=BX) ----
  S.room({ x: BX, w: 6, d: 5, h: 2.8, wall: T.brick("#8a6a52"), floor: T.stone("#6a5e52"), window: false, door: false });
  S.hangLamp(BX, 2.8, -0.6, { col: "#3a3a3a", i: 9 });
  for (let i = 0; i < 3; i++) S.crate(BX - 2.2 + i * 0.3, -2.0 + i * 0.4, 0.8, i * 0.3);
  S.barrel(BX + 2.1, -1.8, 1);
  R.cider = E.group(null, [BX, 0, -0.6]);
  E.box(1.1, 0.7, 0.8, E.mat("#c79a5b"), [0, 0, 0], { parent: R.cider });
  for (const sx of [-1, 1]) { const fl = E.box(0.5, 0.04, 0.8, E.mat("#b98a4b"), [sx * 0.78, 0.68, 0], { parent: R.cider, center: true }); fl.rotation.z = sx * -0.5; }
  E.label(T.sign("ELMA ŞIRASI", { bg: "#c79a5b", fg: "#5a2a1a", size: 130, border: "#5a2a1a" }), 0.95, 0.32, [0, 0.38, 0.405], { parent: R.cider });
  E.sphere(0.06, E.mat("#d23a3a"), [0.36, 0.6, 0.41], { parent: R.cider, seg: 10 });
  R.bJars = []; for (let i = 0; i < 3; i++) { const j = makeJar(E, 0.55, 0.15); R.bJars.push(j); }
  // ---- kanca: karanlık oda + parlayan kavanoz (x=JX) ----
  E.box(8, 6, 0.2, E.mat("#1a1420"), [JX, 0, -2.0]); E.box(8, 0.05, 6, E.mat("#2a2028"), [JX, 0.0, 0]);
  E.box(1.6, 0.9, 0.9, E.mat("#3a2a22", { map: T.wood("#3a2a22") }), [JX, 0, -0.3]);
  R.hJar = makeJar(E, 1.6, 0.9);
  // ---- terazi (x=TX) ----
  E.box(10, 6, 0.2, E.mat("#e6dcc4"), [TX, 0, -2.0]); E.box(10, 0.05, 6, E.mat("#ffffff", { map: T.planks("#a0784a") }), [TX, 0, 0]);
  E.box(0.9, 0.12, 0.5, E.mat("#8a6a3a"), [TX, 0, -0.4]);
  E.cyl(0.05, 0.07, 1.6, E.mat("#c9a24a"), [TX, 0.1, -0.4], { seg: 10 });
  R.beam = E.group(null, [TX, 1.75, -0.4]);
  E.box(2.4, 0.07, 0.07, E.mat("#c9a24a"), [0, 0, 0], { parent: R.beam, center: true });
  E.sphere(0.08, E.mat("#e8c45a"), [0, 1.75, -0.4], {}).position.set(TX, 1.75, -0.32);
  R.pans = [];
  for (const sx of [-1, 1]) { const p = E.group(null, [TX + sx * 1.15, 1.2, -0.4]);
    E.cyl(0.008, 0.008, 0.55, E.mat("#8a6a3a"), [0, 0.0, 0], { parent: p, seg: 4 });
    E.cyl(0.38, 0.28, 0.06, E.mat("#c9a24a"), [0, -0.03, 0], { parent: p, seg: 20 }); R.pans.push(p); }
  R.sJar = makeJar(E, 0.6, 0.3); R.pans[0].add(R.sJar); R.sJar.position.set(0, 0.03, 0);
  const avg = E.sphere(0.27, E.mat("#e7b3c0"), [0, 0.22, 0], { parent: R.pans[1], seg: 20 }); avg.scale.set(1.25, 0.8, 1);
  E.label(T.sign("Einstein", { bg: "#2b2f3a", fg: "#ffffff", size: 140, sub: "1.230 g", subSize: 120 }), 0.85, 0.42, [0, -0.35, 0.3], { parent: R.pans[0] });
  E.label(T.sign("Ortalama", { bg: "#fbf8ef", size: 140, sub: "~1.400 g", subSize: 120 }), 0.85, 0.42, [0, -0.35, 0.3], { parent: R.pans[1] });
  // ---- karakterler (temsilî) ----
  E.actor("ein", { skin: "#f6dcc0", hair: "long", hairCol: "#ececec", moustache: "#a9a9a9", shirt: "#cbbfa8", jacket: "#6b5a4a", pants: "#4a4a52", seed: 21 });
  E.actor("dr", { skin: "#f6dcc0", jacket: "#f4f6f8", shirt: "#a8c0d0", tie: "#2b4a7a", pants: "#3a3a44", hair: "part", hairCol: "#4a3a2a", glasses: true, seed: 5 });
  E.actor("drOld", { skin: "#f2d4b8", jacket: "#7a6a5a", shirt: "#d8d0c0", pants: "#4a4a52", hair: "part", hairCol: "#e0e0e0", glasses: true, seed: 5 });
  E.actor("s1", { skin: "#e9c3a0", jacket: "#f4f6f8", shirt: "#7c8fa3", pants: "#3a3a44", hair: "bun", hairCol: "#2a1d16", glasses: true, seed: 14 });
  E.actor("s2", { skin: "#c98f66", jacket: "#f4f6f8", shirt: "#3f8a6a", pants: "#3a3a44", hair: "short", hairCol: "#1a1a1a", seed: 19 });
}

// ---------- 2D katman ----------
const fit = (g, txt, size, k, maxW) => { let s = size; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; while (g.measureText(txt).width > maxW && s > 40) { s -= 6; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; } return s; };
const line = (txt, y, col, size, a = 1, rot = 0) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.translate(w / 2, y * k); g.rotate(rot);
  fit(g, txt, size, k, w * 0.88); g.lineJoin = "round"; g.lineWidth = 18 * k; g.strokeStyle = "#1a120a"; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore();
};
const stamp = (txt, a, s) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.translate(w / 2, 360 * k); g.rotate(-0.18); g.scale(s, s);
  g.font = `900 ${130 * k}px CizgiFont, Nunito, sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; const tw = g.measureText(txt).width;
  g.lineWidth = 12 * k; g.strokeStyle = "#d0262e"; g.strokeRect(-tw / 2 - 30 * k, -85 * k, tw + 60 * k, 170 * k); g.fillStyle = "#d0262e"; g.fillText(txt, 0, 6 * k); g.restore();
};
const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k; g.save();
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; const tw = g.measureText(title).width; g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; const sw = g.measureText(sub).width;
  const pw = Math.max(420 * k, Math.max(tw, sw) + 70 * k);
  g.fillStyle = "rgba(26,18,10,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill(); g.fillStyle = GOLD; g.fillRect(x, y, 10 * k, 112 * k);
  g.textBaseline = "middle"; g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#f4e2bf"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const sepia = (a = 0.1) => (g, w, h) => { g.save(); g.globalAlpha = a; g.fillStyle = "#8a6430"; g.fillRect(0, 0, w, h); g.restore(); };
const all = (...fs) => (g, w, h, s) => fs.forEach((fn) => fn && fn(g, w, h, s));

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
function reset() {
  [R.aJar, R.hJar, R.boxCarry, ...R.ret, ...R.lJars, ...R.bJars].forEach((o) => { o.position.y = -50; o.rotation.set(0, 0, 0); });
  R.cubes.forEach((c) => (c.visible = true));
  R.cal.visible = false;
}

export function frame(f, E) {
  if (!SHOTS) buildShots(E);
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const sw = (k) => WF(E, SW[sh.i] + k);
  let cam, light = "day", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = null;
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  reset();

  switch (sh.name) {
    case "hook": {
      light = "dramatic";
      put(R.hJar, JX, 0.9, -0.3, 0.3 * Math.sin(f / 40), 1);
      R.hJar.position.y = 0.9 + 0.02 * Math.sin(f / 10);
      cam = E.camAt(f, [{ f: 0, pos: [JX + 0.2, 1.75, 2.6], look: [JX, 1.45, -0.3], fov: 42 }, { f: sh.f1, pos: [JX + 0.1, 1.65, 2.0], look: [JX, 1.45, -0.3], fov: 40 }]);
      dof = { focus: [JX, 1.4, -0.3], amount: 6 };
      FX.push({ kind: "sparkle", pos: [JX + 0.5, 2.3, 0], size: 0.5, t: t / 20 });
      overlay = all(line("EINSTEIN'IN BEYNİ", 300, "#ffffff", 100), line("ÇALINDI", 440, "#ff5a4f", 190, X.span(f, sw(3) - 4, sw(3) + 4)));
      flash = 0.35 * Math.max(0, 1 - Math.abs(f - sw(3)) / 5);
      break;
    }
    case "year": {
      cam = E.camAt(f, [{ f: sh.f0, pos: [HX + 0.4, 1.6, 6.4], look: [HX + 0.3, 2.3, -2], fov: 48 }, { f: sh.f1, pos: [HX + 0.4, 1.6, 5.8], look: [HX + 0.3, 2.2, -2], fov: 48 }]);
      R.cal.visible = true; R.cal.rotation.z = 0.04 * Math.sin(f / 12);
      focusPt = [HX, 0, 0];
      overlay = all(sepia(0.12), line("1955", 300, GOLD, 170, X.span(f, sh.f0 + 4, sh.f0 + 10)));
      break;
    }
    case "wish": {
      light = "interior";
      A.push({ id: "ein", pos: [SX + 0.1, 0, -0.8], st: st(2, { face: "happy", arms: "present", look: 0.5 }) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [SX + 0.3, 1.7, 3.5], look: [SX + 0.3, 1.45, -0.6], fov: 46 }, { f: sh.f1, pos: [SX + 0.35, 1.65, 3.0], look: [SX + 0.35, 1.45, -0.6], fov: 44 }]);
      focusPt = [SX, 0, -0.6];
      overlay = all(sepia(0.1), card("Einstein", "temsilî çizim"));
      break;
    }
    case "harvey": {
      light = "interior";
      const into = X.smooth(X.span(f, sw(6), sw(8)));
      const look = Math.sin(f / 9) > 0 ? 0.7 : -0.7;
      A.push({ id: "dr", pos: [AX - 0.3, 0, -0.9], st: st(5, { face: "sly", arms: "holdR", look: f > sw(8) ? look : 0.4, prop: { kind: "bag", col: "#6b4428", text: "" } }) });
      if (into < 1) put(R.aJar, X.lerp(AX + 0.6, AX + 0.05, into), X.lerp(0.9, 1.05, into) + 0.25 * Math.sin(into * Math.PI), -1.0, 0, 1 - 0.5 * into);
      cam = E.camAt(f, [{ f: sh.f0, pos: [AX + 0.3, 1.7, 3.6], look: [AX + 0.2, 1.35, -0.9], fov: 46 }, { f: sh.f1, pos: [AX + 0.2, 1.65, 3.0], look: [AX + 0.1, 1.35, -0.9], fov: 44 }]);
      focusPt = [AX, 0, -0.9];
      if (f > sw(8)) FX.push({ kind: "sweat", pos: [AX - 0.75, 2.05, -0.8], size: 0.2 });
      overlay = all(sepia(0.08), card("Dr. Thomas Harvey", "otopsiyi yapan patolog"));
      break;
    }
    case "fired": {
      const p = X.span(f, sh.f0, sh.f1);
      A.push({ id: "dr", pos: [HX - 0.4 + 0.6 * p, 0, -0.2 + 1.2 * p], st: st(5, { face: f < sw(2) ? "sad" : "determined", arms: "hold", legs: "walk", phase: f / 22 }) });
      put(R.boxCarry, HX - 0.4 + 0.6 * p, 0.82, -0.2 + 1.2 * p + 0.2, 0, 1);
      cam = E.camAt(f, [{ f: sh.f0, pos: [HX + 0.8, 1.6, 5.4], look: [HX, 1.6, -1], fov: 46 }, { f: sh.f1, pos: [HX + 0.7, 1.6, 5.0], look: [HX + 0.1, 1.5, 0], fov: 46 }]);
      focusPt = [HX, 0, 0];
      const s0 = sh.f0 + 8;
      overlay = all(sepia(0.12), stamp("KOVULDU", X.span(f, s0, s0 + 3), 1 + 0.6 * (1 - X.easeOut(X.span(f, s0, s0 + 5)))));
      if (f >= s0 + 3) shake(s0 + 3, 0.05, 8);
      break;
    }
    case "slice": {
      light = "interior";
      const n = Math.round(240 * X.easeOut(X.span(f, sh.f0 + 4, sw(4))));
      R.cubes.forEach((c, i) => (c.visible = i < Math.ceil(48 * n / 240)));
      R.lJars.forEach((j, i) => put(j, LX - 0.5 + i * 1.0, 0.95, -0.25, 0, X.back(X.span(f, sw(5) + i * 5, sw(5) + 10 + i * 5))));
      R.lJars.forEach((j) => { if (j.scale.x < 0.01) j.position.y = -50; });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX, 2.4, 2.4], look: [LX, 0.95, -0.6], fov: 42 }, { f: sh.f1, pos: [LX, 2.2, 2.0], look: [LX, 0.95, -0.6], fov: 42 }]);
      dof = { focus: [LX, 0.95, -0.6], amount: 4 };
      overlay = all(sepia(0.08), line(String(n), 330, PINK, 220), line("parça", 470, "#ffffff", 80));
      break;
    }
    case "box": {
      light = "dramatic";
      R.bJars.forEach((j, i) => put(j, BX - 0.3 + i * 0.3, 0.5, -0.6 + (i % 2) * 0.12, i, 1));
      const y = Math.round(X.lerp(1955, 1997, X.span(f, sh.f0 + 6, sh.f1 - 4)));
      cam = E.camAt(f, [{ f: sh.f0, pos: [BX + 0.5, 1.7, 2.8], look: [BX, 0.7, -0.6], fov: 44 }, { f: sh.f1, pos: [BX + 0.3, 1.6, 2.2], look: [BX, 0.65, -0.6], fov: 42 }]);
      dof = { focus: [BX, 0.6, -0.4], amount: 5 }; focusPt = [BX, 0, -0.6];
      overlay = all(sepia(0.14), line(String(y), 330, GOLD, 200));
      break;
    }
    case "back": {
      const give = X.smooth(X.span(f, sh.f0 + 10, sh.f0 + 40));
      A.push({ id: "drOld", pos: [HX - 0.7, 0, 0.4], st: st(5, { face: "sad", arms: "reach" }) });
      A.push({ id: "s1", pos: [HX + 0.8, 0, 0.3], st: st(14, { face: "wow", arms: "reach" }) });
      R.ret.forEach((j, i) => put(j, X.lerp(HX - 0.15, HX + 0.25, give) + i * 0.2 - 0.1, 1.25, 0.65, 0, 1));
      cam = E.camAt(f, [{ f: sh.f0, pos: [HX + 0.05, 1.7, 5.6], look: [HX + 0.05, 1.4, 0.3], fov: 46 }, { f: sh.f1, pos: [HX + 0.05, 1.65, 5.1], look: [HX + 0.05, 1.4, 0.3], fov: 46 }]);
      focusPt = [HX, 0, 0.3];
      overlay = all(sepia(0.1), line("1998", 300, GOLD, 180, X.span(f, sh.f0 + 4, sh.f0 + 10)), line("43 yıl sonra", 430, "#ffffff", 70, X.span(f, sh.f0 + 10, sh.f0 + 16)));
      break;
    }
    case "secret": {
      light = "interior";
      R.cubes.forEach((c, i) => (c.visible = i < 12));
      A.push({ id: "s1", pos: [LX + 0.3, 0, -1.4], st: st(14, { face: "think", arms: "chin" }) });
      A.push({ id: "s2", pos: [LX - 0.8, 0, -1.5], st: st(19, { face: "think", arms: "think", look: 0.6 }) });
      FX.push({ kind: "question", pos: [LX - 0.6, 2.75, -1.3], size: 0.45 * X.back(X.span(f, sh.f0 + 6, sh.f0 + 14)) });
      FX.push({ kind: "question", pos: [LX + 0.55, 2.75, -1.2], size: 0.5 * X.back(X.span(f, sh.f0 + 14, sh.f0 + 22)) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX, 1.8, 3.4], look: [LX - 0.1, 1.5, -1.2], fov: 46 }, { f: sh.f1, pos: [LX, 1.75, 2.9], look: [LX - 0.1, 1.5, -1.2], fov: 44 }]);
      focusPt = [LX, 0, -1];
      overlay = sepia(0.08);
      break;
    }
    case "scale": {
      light = "interior";
      const tip = X.spring(X.span(f, sh.f0 + 6, sh.f0 + 36)) * 0.22; // Einstein tarafı (sol) yukarı
      R.beam.rotation.z = -tip;
      R.pans[0].position.set(TX - 1.15 * Math.cos(tip), 1.75 - 0.55 + 1.15 * Math.sin(tip), -0.4);
      R.pans[1].position.set(TX + 1.15 * Math.cos(tip), 1.75 - 0.55 - 1.15 * Math.sin(tip), -0.4);
      const back = f > sw(5);
      cam = back ? E.camAt(f, [{ f: sw(5), pos: [TX - 0.9, 1.75, 2.2], look: [TX - 1.1, 1.5, -0.4], fov: 40 }, { f: sh.f1, pos: [TX - 1.0, 1.7, 1.9], look: [TX - 1.1, 1.5, -0.4], fov: 38 }])
        : E.camAt(f, [{ f: sh.f0, pos: [TX, 1.6, 7.0], look: [TX, 1.35, -0.4], fov: 46 }, { f: sw(5), pos: [TX, 1.6, 6.5], look: [TX, 1.35, -0.4], fov: 46 }]);
      focusPt = [TX, 0, -0.4];
      overlay = all(sepia(0.06), back ? line("DAHA HAFİF", 330, GOLD, 150, X.span(f, sw(5), sw(5) + 6)) : line("1.230 g < 1.400 g", 330, "#ffffff", 110, X.span(f, sh.f0 + 10, sh.f0 + 16)));
      break;
    }
  }
  return { cam, light, dof, actors: A, fx: FX, flash, overlay, focusPt };
}
