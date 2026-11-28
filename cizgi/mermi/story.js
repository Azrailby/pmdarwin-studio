// Suya Atlarsan Kurşundan Kurtulur musun? — PMDARWIN (Barış anlatıcı sesi)
export const meta = { fps: 30 };

// Çekimler cümle cümle: sınırlar words.json'daki cümle sonlarından (. ? !) hesaplanır.
const NAMES = ["hook", "film", "lab", "shatter", "concrete", "meter", "slow", "danger", "end"];
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

const ORANGE = "#ffa53a", AQUA = "#5fd0ff";
const FX0 = 100, LX = 200, UX = 300; // sinema, test laboratuvarı, su altı
const SURF = 3.0; // tank su yüzeyi (y), derinlik d -> y = SURF - d
let R = {};

function makeBullet(E, s = 1, col = "#c98a3a") {
  const g = E.group(null, [0, -50, 0]);
  E.cyl(0.05 * s, 0.05 * s, 0.16 * s, E.mat(col), [0, 0.0, 0], { parent: g, seg: 14 });
  const n = E.cone(0.05 * s, 0.1 * s, E.mat(col === "#c98a3a" ? "#b87333" : col), [0, -0.1 * s, 0], { parent: g, seg: 14 }); n.rotation.x = Math.PI; n.position.y = -0.05 * s;
  E.cyl(0.054 * s, 0.054 * s, 0.03 * s, E.mat("#e8c45a"), [0, 0.15 * s, 0], { parent: g, seg: 14 });
  return g;
}
function makeFish(E) {
  const g = E.group(null, [0, -50, 0]);
  const b = E.sphere(0.16, E.mat("#ff8a3d"), [0, 0, 0], { parent: g, seg: 14 }); b.scale.set(1.7, 1, 0.6);
  const t = E.cone(0.12, 0.18, E.mat("#ff6a2d"), [-0.33, -0.09, 0], { parent: g, seg: 4 }); t.rotation.z = Math.PI / 2;
  E.sphere(0.035, E.mat("#ffffff"), [0.17, 0.04, 0.08], { parent: g, seg: 8 }); E.sphere(0.018, E.mat("#111111"), [0.19, 0.04, 0.1], { parent: g, seg: 6 });
  return g;
}
function rulerTex(E) {
  const c = document.createElement("canvas"); c.width = 160; c.height = 1024; const g = c.getContext("2d");
  g.fillStyle = "#ffe066"; g.fillRect(0, 0, 160, 1024); g.fillStyle = "#1d1622";
  for (let i = 0; i <= 30; i++) { const y = 12 + i * (1000 / 30), w = i % 10 === 0 ? 90 : i % 5 === 0 ? 60 : 34; g.fillRect(0, y - 3, w, 6); }
  g.font = "900 46px CizgiFont, Nunito, sans-serif"; g.textBaseline = "middle";
  for (let m = 0; m <= 3; m++) g.fillText(m + (m ? " m" : ""), 70, Math.min(990, 12 + m * 333 + (m ? -26 : 30)));
  const t = new E.THREE.CanvasTexture(c); t.colorSpace = E.THREE.SRGBColorSpace; return t;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.grass("#5f8e46"), 500, 0.25);
  // ---- göl + iskele (x=0) ----
  const wt = T.water("#2f8fc0").clone(); wt.needsUpdate = true; wt.repeat.set(12, 8); R.waterTex = wt;
  E.plane(90, 60, E.mat("#ffffff", { map: wt }), [0, 0.03, -28], { rot: [-Math.PI / 2, 0, 0], noShadow: true });
  const pier = E.mat("#9a6a3a", { map: T.planks("#9a6a3a", 6) });
  E.box(1.6, 0.12, 7, pier, [-1.2, 0.7, -1.5]);
  for (const z of [1.5, -0.5, -2.5, -4.6]) for (const x of [-1.9, -0.5]) E.cyl(0.08, 0.08, 0.8, E.mat("#6b4428"), [x, 0, z], { seg: 8 });
  for (let i = 0; i < 9; i++) S.tree(-26 + i * 6.5, -38 - (i % 3) * 4, { s: 1.6, type: i % 2 ? "pine" : "round", col: "#3f7a3f" });
  S.hills({ z: -90, col: "#5f8f4f" }); S.clouds();
  R.streaks = []; for (let i = 0; i < 7; i++) { const c = E.cyl(0.018, 0.018, 1.4, E.mat("#fff3c4", { emissive: "#ffd27a", glow: 1.6 }), [0, -50, 0], { seg: 6, center: true }); c.rotation.z = Math.PI / 2; R.streaks.push(c); }
  R.spouts = []; for (let i = 0; i < 4; i++) R.spouts.push(E.cone(0.12, 0.7, E.mat("#e8f8ff", { emissive: "#bfe9ff", glow: 0.4 }), [0, -50, 0], { seg: 8 }));
  // ---- sinema (x=FX0) ----
  E.box(10, 6, 0.2, E.mat("#4a2a3e"), [FX0, 0, -3.2]);
  E.box(10, 0.05, 10, E.mat("#3a2230"), [FX0, 0.01, 0]);
  E.box(2.5, 1.55, 0.06, E.mat("#111111"), [FX0, 1.25, -3.05]);
  R.screen = E.plane(2.3, 1.35, E.flat("#ffb870"), [FX0, 2.02, -3.0]);
  const sky = E.plane(2.3, 0.5, E.flat("#2f8fc0"), [FX0, 1.6, -2.99]); sky.userData.noink = true;
  E.box(0.9, 0.06, 0.2, pier, [FX0 - 0.75, 1.75, -2.95]);
  E.label(T.sign("FİLM", { bg: "#c0262e", fg: "#ffffff", size: 140 }), 0.9, 0.34, [FX0, 3.0, -3.0]);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 5; i++) { const x = FX0 - 1.6 + i * 0.8, z = 0.4 + r * 1.1; E.box(0.7, 0.45, 0.6, E.mat("#a8262e"), [x, 0, z]); E.box(0.7, 0.6, 0.12, E.mat("#8a1f26"), [x, 0.45, z + 0.3]); }
  R.pop = E.group(null, [FX0 + 0.45, 1.05, 1.5]);
  E.cyl(0.2, 0.15, 0.4, E.mat("#ffffff", { map: T.sign("", { bg: "#d8262e", border: null }) }), [0, 0, 0], { parent: R.pop, seg: 12 });
  for (let i = 0; i < 9; i++) E.sphere(0.07, E.mat("#fff3c4"), [0.12 * Math.cos(i * 2.1), 0.42 + 0.04 * (i % 3), 0.12 * Math.sin(i * 2.1)], { parent: R.pop, seg: 8 });
  R.mini = []; for (let i = 0; i < 4; i++) { const c = E.cyl(0.008, 0.008, 0.5, E.mat("#fff3c4", { emissive: "#ffd27a", glow: 1.5 }), [0, -50, 0], { seg: 5, center: true }); c.rotation.z = Math.PI / 2; R.mini.push(c); }
  // ---- test laboratuvarı (x=LX) ----
  E.box(12, 7, 0.2, E.mat("#d9e3ea"), [LX, 0, -2.2]); E.box(12, 0.05, 8, E.mat("#ffffff", { map: T.tiles("#e8eef0", "#c7d3d9", 8) }), [LX, 0.0, 0]);
  const wm = E.mat(AQUA, { transparent: true, opacity: 0.42, emissive: "#2a8fc0", glow: 0.35 });
  R.water = E.box(1.6, SURF, 0.8, wm, [LX, 0, 0]); R.water.userData.noink = true; R.water.castShadow = false;
  const fr = E.mat("#3a4655");
  for (const x of [-0.82, 0.82]) for (const z of [-0.42, 0.42]) E.box(0.06, SURF + 0.3, 0.06, fr, [LX + x, 0, z]);
  for (const y of [0, SURF + 0.27]) for (const z of [-0.42, 0.42]) E.box(1.7, 0.06, 0.06, fr, [LX, y, z]);
  E.box(1.7, 0.08, 0.9, fr, [LX, -0.02, 0]);
  R.surf = E.plane(1.6, 0.8, E.mat("#ffffff", { map: (() => { const t = T.water("#5fc8f0").clone(); t.needsUpdate = true; t.repeat.set(0.6, 0.3); return t; })(), transparent: true, opacity: 0.8 }), [LX, SURF, 0], { rot: [-Math.PI / 2, 0, 0], noShadow: true });
  R.concrete = E.box(1.6, 0.12, 0.8, E.mat("#ffffff", { map: T.stone("#a7a8aa") }), [LX, SURF - 0.1, 0]); R.concrete.visible = false;
  E.label(rulerTex(E), 0.3, SURF + 0.02, [LX + 1.02, SURF / 2, 0.43]);
  // test cihazı (kutu, namlu yok)
  E.box(2.4, 0.08, 0.08, fr, [LX, 4.3, 0]); E.box(0.06, 4.3, 0.06, fr, [LX - 1.2, 0, 0]);
  R.dev = E.box(0.55, 0.45, 0.45, E.mat("#e8eef2"), [LX, 3.6, 0]);
  E.label(T.sign("TEST", { bg: "#2f7fe0", fg: "#ffffff", size: 120 }), 0.42, 0.16, [LX, 3.82, 0.235]);
  R.lamp = E.sphere(0.04, E.mat("#ff4a4a", { emissive: "#ff2a2a", glow: 1.5 }), [LX + 0.18, 3.95, 0.23], { seg: 8 });
  R.bandG = E.plane(1.6, 1.0, E.mat("#3fdc6a", { transparent: true, opacity: 0.5, emissive: "#2fbf5a", glow: 0.6 }), [LX, SURF - 0.5, 0.44], { noink: true, noShadow: true });
  R.bandR = E.plane(1.6, 2.5, E.mat("#ff4a4a", { transparent: true, opacity: 0.42, emissive: "#d02a2a", glow: 0.6 }), [LX, SURF - 1.25, 0.44], { noink: true, noShadow: true });
  R.lblFast = E.label(T.sign("HIZLI", { bg: "#c0262e", fg: "#ffffff", size: 110 }), 0.6, 0.22, [LX - 0.45, SURF - 0.25, 0.46]);
  R.lblSlow = E.label(T.sign("YAVAŞ", { bg: "#2f7fe0", fg: "#ffffff", size: 110 }), 0.6, 0.22, [LX + 0.45, SURF - 0.25, 0.46]);
  R.fast = makeBullet(E, 1); R.slow = makeBullet(E, 1.5, "#9aa3b2"); R.fast2 = makeBullet(E, 1);
  R.trail = E.cyl(0.012, 0.012, 1, E.mat("#ffffff", { emissive: "#bfe9ff", glow: 0.8, transparent: true, opacity: 0.8 }), [0, -50, 0], { seg: 6, center: true });
  R.frags = []; for (let i = 0; i < 12; i++) R.frags.push(E.box(0.03, 0.025, 0.03, E.mat(i % 2 ? "#b87333" : "#e8c45a"), [0, -50, 0], { center: true }));
  R.fish = makeFish(E);
  R.bubbles = []; for (let i = 0; i < 14; i++) R.bubbles.push(E.sphere(0.03 + (i % 3) * 0.015, E.mat("#e8f8ff", { emissive: "#bfe9ff", glow: 0.5 }), [0, -50, 0], { seg: 8 }));
  // ---- su altı (x=UX) ----
  E.box(12, 9, 0.3, E.mat("#1f6fa0"), [UX, -1, -3]);
  E.ground && E.box(12, 0.05, 8, E.mat("#ffffff", { map: T.sand("#d8c08a") }), [UX, 0.0, 0]);
  for (let i = 0; i < 6; i++) { const w = E.cyl(0.04, 0.06, 1.2 + (i % 3) * 0.5, E.mat("#3f9a5a"), [UX - 2 + i * 0.8, 0, -2.2], { seg: 6 }); w.rotation.z = 0.15 * Math.sin(i); }
  R.uwater = E.box(12, 0.05, 8, E.mat("#bfe9ff", { transparent: true, opacity: 0.4 }), [UX, 4.2, 0]);
  // ---- karakterler ----
  E.actor("hero", { skin: "#e9c3a0", shirt: "#2b2f3a", pants: "#3f5a7a", hair: "spiky", hairCol: "#2a1d16", seed: 8 });
  E.actor("sci", { skin: "#f6dcc0", jacket: "#f4f6f8", shirt: "#7c8fa3", pants: "#3a3a44", hair: "part", hairCol: "#7a4a2a", glasses: true, seed: 12 });
}

// ---------- 2D katman ----------
const fit = (g, txt, size, k, maxW) => { let s = size; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; while (g.measureText(txt).width > maxW && s > 40) { s -= 6; g.font = `900 ${s * k}px CizgiFont, Nunito, sans-serif`; } return s; };
const line = (txt, y, col, size, a = 1) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  fit(g, txt, size, k, w * 0.9); g.lineJoin = "round"; g.lineWidth = 18 * k; g.strokeStyle = "#1a0f0a"; g.strokeText(txt, w / 2, y * k); g.fillStyle = col; g.fillText(txt, w / 2, y * k); g.restore();
};
const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k; g.save();
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; const tw = g.measureText(title).width; g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; const sw = g.measureText(sub).width;
  const pw = Math.max(420 * k, Math.max(tw, sw) + 70 * k);
  g.fillStyle = "rgba(24,14,8,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill(); g.fillStyle = ORANGE; g.fillRect(x, y, 10 * k, 112 * k);
  g.textBaseline = "middle"; g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffe2bf"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const tint = (col, a) => (g, w, h) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.fillRect(0, 0, w, h); g.restore(); };
const all = (...fs) => (g, w, h, s) => fs.forEach((fn) => fn && fn(g, w, h, s));

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
function reset() {
  [...R.streaks, ...R.spouts, ...R.mini, ...R.frags, ...R.bubbles].forEach((o) => (o.position.y = -50));
  [R.fast, R.slow, R.fast2, R.fish, R.trail].forEach((o) => { o.position.y = -50; o.rotation.set(0, 0, 0); });
  R.bandG.visible = R.bandR.visible = R.lblFast.visible = R.lblSlow.visible = false;
  R.concrete.visible = false; R.surf.visible = true; R.lamp.material.emissiveIntensity = 1.5;
}
// parçalanma: f0 anında (x, y) noktasında; parçalar yayılır ve yavaşça çöker
function shatter(f, f0, x, y, z = 0) {
  const t = Math.max(0, (f - f0) / 30);
  R.frags.forEach((p, i) => { if (f < f0) return; const a = i * 2.39, sp = 0.22 + 0.06 * (i % 4), r = sp * (1 - Math.exp(-t * 3));
    p.position.set(x + Math.cos(a) * r, y - 0.08 - 0.35 * (1 - Math.exp(-t * 2)) - 0.04 * (i % 3), z + Math.sin(a) * r * 0.8); p.rotation.set(t * 3 + i, t * 2, i); });
}

export function frame(f, E) {
  if (!SHOTS) buildShots(E);
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const sw = (k) => WF(E, SW[sh.i] + k);
  let cam, light = "day", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = null;
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  reset();
  R.waterTex.offset.set(f * 0.0015, f * 0.001);
  const sci = (o = {}) => A.push({ id: "sci", pos: [LX - 1.45, 0, 0.3], st: st(3, { face: "think", arms: "hold", prop: { kind: "paper" }, ...o }) });

  switch (sh.name) {
    case "hook": {
      light = "golden";
      const d = X.span(f, 0, sh.f1);
      A.push({ id: "hero", pos: [-0.15 + 0.4 * d, 1.25 - 0.25 * d, -4.9], roll: -0.55 - 0.25 * d, st: st(1, { face: "determined", arms: "up", legs: "run", phase: 0.25 }) });
      R.streaks.forEach((s, i) => { const sp = 0.09 + 0.02 * (i % 3), x = -3 + ((f * sp + i * 0.9) % 6); s.position.set(x, 0.6 + (i % 4) * 0.55, -6.5 - (i % 3) * 0.8); });
      R.spouts.forEach((s, i) => { const ph = ((f + i * 11) % 34) / 34; s.position.set(-1.6 + i * 1.1, 0, -7 - (i % 2)); s.scale.set(1, Math.sin(ph * Math.PI) + 0.01, 1); });
      cam = E.camAt(f, [{ f: 0, pos: [0.3, 1.3, 1.6], look: [0.0, 1.9, -5], fov: 46 }, { f: sh.f1, pos: [0.25, 1.3, 1.0], look: [0.05, 1.85, -5], fov: 46 }]);
      focusPt = [0, 0, -5]; dof = { focus: [0, 1.8, -4.9], amount: 4 };
      FX.push({ kind: "lines", pos: [0.6, 2.6, -4.6], size: 0.9, t: t / 10 });
      overlay = all(line("KURTULUR MUSUN", 300, "#ffffff", 110), line("?", 470, ORANGE, 240, X.span(f, 6, 14)));
      break;
    }
    case "film": {
      light = "interior";
      const d = X.span(f, sh.f0, sh.f1);
      A.push({ id: "hero", pos: [FX0 - 0.1 + 0.5 * d, 1.85 - 0.2 * d, -2.95], scale: 0.42, roll: -0.6, blob: false, yaw: 0, st: st(1, { face: "determined", arms: "up", legs: "run", phase: 0.25 }) });
      R.mini.forEach((s, i) => s.position.set(FX0 - 1 + ((f * 0.05 + i * 0.6) % 2), 2.2 + (i % 2) * 0.35, -2.97));
      cam = E.camAt(f, [{ f: sh.f0, pos: [FX0 + 0.2, 1.75, 2.6], look: [FX0, 1.85, -3], fov: 44 }, { f: sh.f1, pos: [FX0 + 0.15, 1.75, 2.2], look: [FX0, 1.9, -3], fov: 44 }]);
      focusPt = [FX0, 0, -1];
      overlay = big2("HEP İŞE YARIYOR", f, sw(1));
      break;
    }
    case "lab": {
      sci({ face: "talk", talk: E.talk(f) * 0 });
      R.lamp.material.emissiveIntensity = 0.8 + 0.8 * Math.abs(Math.sin(f / 6));
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX - 0.6, 2.4, 7.4], look: [LX - 0.4, 2.0, 0], fov: 46 }, { f: sh.f1, pos: [LX - 0.4, 2.3, 6.8], look: [LX - 0.3, 2.0, 0], fov: 46 }]);
      focusPt = [LX, 0, 0];
      overlay = f > sh.f0 + 12 ? card("Bir deney", "tüfek mermileri suya ateşlendi") : null;
      break;
    }
    case "shatter": {
      const hit = sw(4); // "suya" ~ çarpma
      const y = f < hit ? X.lerp(3.5, SURF, X.span(f, sh.f0, hit)) : -50;
      put(R.fast, LX, y, 0, 0, 1.0); if (f < hit) FX.push({ kind: "lines", pos: [LX, y + 0.35, 0.05], size: 0.35, rot: Math.PI / 2, t: t / 10 }); R.fast.position.y = y;
      if (f >= hit) shatter(f, hit, LX, SURF, 0);
      if (f >= hit && f < hit + 14) FX.push({ kind: "burst", pos: [LX, SURF + 0.05, -0.1], size: 0.32 * X.back(X.span(f, hit, hit + 6)), t: 0, opt: { col: "#ffffff" } });
      flash = 0.5 * Math.max(0, 1 - Math.abs(f - hit) / 4);
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX + 0.3, SURF + 0.45, 2.3], look: [LX, SURF + 0.15, 0], fov: 40 }, { f: sh.f1, pos: [LX + 0.25, SURF + 0.3, 2.0], look: [LX, SURF - 0.05, 0], fov: 38 }], { creep: 0.03 });
      dof = { focus: [LX, SURF, 0], amount: 6 };
      shake(hit, 0.04, 8);
      overlay = f > hit + 6 ? line("PARÇALANDI", 330, ORANGE, 130, X.span(f, hit + 6, hit + 12)) : null;
      break;
    }
    case "concrete": {
      R.concrete.visible = true; R.surf.visible = false;
      shatter(f, sh.f0 - 60, LX, SURF + 0.12, 0);
      R.frags.forEach((p) => { p.position.y = Math.max(p.position.y, SURF + 0.035); });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX + 0.3, SURF + 1.35, 2.0], look: [LX, SURF - 0.2, -0.05], fov: 42 }, { f: sh.f1, pos: [LX + 0.25, SURF + 1.25, 1.8], look: [LX, SURF - 0.2, -0.05], fov: 40 }]);
      dof = { focus: [LX, SURF, 0], amount: 5 };
      overlay = line("BETON GİBİ", 330, "#d8d8d8", 150, X.span(f, sh.f0 + 3, sh.f0 + 10));
      break;
    }
    case "meter": {
      R.bandG.visible = true; R.bandG.material.opacity = 0.2 + 0.35 * X.smooth(X.span(f, sh.f0 + 4, sh.f0 + 16));
      shatter(f, sh.f0 - 120, LX, SURF, 0);
      put(R.fish, LX + 0.2 + 0.1 * Math.sin(f / 20), SURF - 1.35, 0.1, 0, 1); R.fish.rotation.y = 0.4 * Math.sin(f / 30);
      if (f > sh.f0 + 18) FX.push({ kind: "check", pos: [LX + 0.55, SURF - 1.0, 0.5], size: 0.35 * X.back(X.span(f, sh.f0 + 18, sh.f0 + 26)) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX + 0.6, SURF - 0.4, 3.4], look: [LX + 0.3, SURF - 0.7, 0], fov: 42 }, { f: sh.f1, pos: [LX + 0.5, SURF - 0.6, 3.0], look: [LX + 0.3, SURF - 0.8, 0], fov: 40 }]);
      dof = { focus: [LX + 0.3, SURF - 0.8, 0.4], amount: 3 };
      overlay = line("1 METRE", 330, "#5fe08a", 150, X.span(f, sh.f0 + 4, sh.f0 + 10));
      break;
    }
    case "slow": {
      const d = X.span(f, sh.f0 + 4, sh.f1 + 30);
      const y = SURF + 0.4 - 1.6 * d;
      put(R.slow, LX + 0.1, y, 0, 0, 1);
      const top = SURF + 0.05, L = Math.max(0.01, top - (y + 0.25));
      if (y < SURF) { R.trail.position.set(LX + 0.1, (top + y + 0.25) / 2, 0); R.trail.scale.set(1, L, 1); }
      R.bubbles.forEach((b, i) => { if (y > SURF) return; const k = i / R.bubbles.length; b.position.set(LX + 0.1 + 0.06 * Math.sin(i * 3 + f / 5), X.lerp(SURF, y, k) + ((f * 0.01 + k) % 0.2), 0.05 * Math.cos(i)); });
      sci({ face: "wow", arms: "point" });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX - 0.5, SURF - 0.2, 4.2], look: [LX - 0.1, SURF - 0.5, 0], fov: 44 }, { f: sh.f1, pos: [LX - 0.4, SURF - 0.6, 4.0], look: [LX - 0.1, SURF - 0.9, 0], fov: 44 }]);
      focusPt = [LX, 0, 0];
      overlay = f > sh.f0 + 10 ? card("Tabanca mermisi", "daha yavaş, ama parçalanmıyor") : null;
      break;
    }
    case "danger": {
      R.bandR.visible = true; R.bandR.material.opacity = 0.18 + 0.3 * X.smooth(X.span(f, sh.f0 + 4, sh.f0 + 20)) + 0.08 * Math.sin(f / 4);
      const y = X.lerp(SURF - 1.6, SURF - 2.45, X.easeOut(X.span(f, sh.f0, sh.f0 + 40)));
      put(R.slow, LX + 0.1, y, 0, 0, 1);
      R.trail.position.set(LX + 0.1, (SURF + y + 0.25) / 2, 0); R.trail.scale.set(1, SURF - y - 0.25, 1);
      FX.push({ kind: "exclaim", pos: [LX + 0.55, SURF - 2.2, 0.6], size: 0.5 * X.back(X.span(f, sh.f0 + 10, sh.f0 + 18)) });
      cam = E.camAt(f, [{ f: sh.f0, pos: [LX + 0.4, 1.8, 6.4], look: [LX + 0.2, 1.6, 0], fov: 44 }, { f: sh.f1, pos: [LX + 0.3, 1.7, 5.8], look: [LX + 0.2, 1.6, 0], fov: 44 }]);
      focusPt = [LX, 0, 0];
      overlay = line("2,5 METRE", 330, "#ff5a4f", 150, X.span(f, sh.f0 + 4, sh.f0 + 10));
      break;
    }
    case "end": {
      const wink = sw(10); // "çabuk"
      if (f < wink) {
        R.lblFast.visible = R.lblSlow.visible = true;
        shatter(f, sh.f0 - 200, LX - 0.45, SURF, 0);
        put(R.slow, LX + 0.45, SURF - 2.4, 0, 0, 1);
        R.trail.position.set(LX + 0.45, (SURF + SURF - 2.15) / 2, 0); R.trail.scale.set(1, 2.15, 1);
        FX.push({ kind: "cross", pos: [LX - 0.45, SURF - 0.65, 0.6], size: 0.3 }, { kind: "exclaim", pos: [LX + 0.75, SURF - 2.1, 0.6], size: 0.35 });
        cam = E.camAt(f, [{ f: sh.f0, pos: [LX, 1.9, 6.6], look: [LX, 1.7, 0], fov: 44 }, { f: wink, pos: [LX, 1.9, 6.2], look: [LX, 1.7, 0], fov: 44 }]);
        focusPt = [LX, 0, 0];
        overlay = all(line("HIZLI = KISA ÖMÜR", 300, ORANGE, 110, X.span(f, sh.f0 + 6, sh.f0 + 14)));
      } else {
        A.push({ id: "hero", pos: [UX, 0.6 + 0.08 * Math.sin(f / 10), -0.5], st: { ...st(1), face: f > wink + 12 && f < wink + 26 ? "sly" : "happy", arms: "cheer", blink: f > wink + 12 && f < wink + 26 ? 0 : E.blink(f, 1) } });
        R.bubbles.forEach((b, i) => b.position.set(UX + (i % 2 ? 1 : -1) * (0.55 + (i % 4) * 0.12), 0.4 + ((f * 0.02 + i * 0.37) % 3.4), -0.3 + (i % 3) * 0.2));
        cam = E.camAt(f, [{ f: wink, pos: [UX, 1.7, 3.6], look: [UX, 1.5, -0.5], fov: 44 }, { f: sh.f1, pos: [UX, 1.7, 3.0], look: [UX, 1.5, -0.5], fov: 42 }]);
        focusPt = [UX, 0, 0]; light = "day";
        FX.push({ kind: "sparkle", pos: [UX + 0.7, 2.6, -0.3], size: 0.5, t: t / 20 });
        overlay = all(tint("#1f6fb0", 0.18), line("GÜVENDE", 330, AQUA, 150, X.span(f, wink + 4, wink + 10)));
      }
      break;
    }
  }
  return { cam, light, dof, actors: A, fx: FX, flash, overlay, focusPt };
}
function big2(txt, f, f0) { return line(txt, 330, ORANGE, 120, Math.max(0, Math.min(1, (f - f0) / 6))); }
