// Kendine Sivrisinek Isırtan Doktor (Jesse Lazear) — PMDARWIN (dfki sesi, ~37 sn)
export const meta = { fps: 30 };

// P01 16 hook · P02 128 yıl · P03 159 Küba · P04 246 kimse bilmiyor · P05 338 Lazear · P06 440 deney · P07 578 ısırıldı
// P08 635 rivayet · P09 711 defter · P10 793 ateş · P11 900 haklıydı · P12 931 miras · P14 1049 son
const SHOTS = [[0, "hook"], [128, "year"], [159, "camp"], [246, "doctors"], [338, "lazear"], [440, "test"], [578, "bite"],
  [635, "rumor"], [711, "book"], [793, "fever"], [900, "right"], [931, "legacy"], [1049, "end"]];
const END = 1118;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const GOLD = "#ffcf5a";
const CX = -100, HX = 100, MX = 200; // kamp, hasta odası, modern şehir
let R = {};

function makeMosquito(E) {
  const g = E.group(null, [0, -50, 0]);
  const dark = E.mat("#3a3530"), stripe = E.mat("#d9d2c5");
  const ab = E.group(g, [-0.12, 0, 0]);
  for (let i = 0; i < 4; i++) { const s = E.sphere(0.05, i % 2 ? stripe : dark, [-0.06 * i, -0.01 * i, 0], { parent: ab, seg: 8 }); s.scale.set(1.2, 0.8, 0.8); }
  E.sphere(0.06, dark, [0, 0, 0], { parent: g, seg: 10 });
  const head = E.group(g, [0.08, 0.01, 0]);
  E.sphere(0.04, dark, [0, 0, 0], { parent: head, seg: 8 });
  for (const z of [0.025, -0.025]) { E.sphere(0.022, E.mat("#ffffff"), [0.02, 0.02, z], { parent: head, seg: 8 }); E.sphere(0.011, E.mat("#111111"), [0.037, 0.022, z], { parent: head, seg: 6 }); }
  const prob = E.cyl(0.004, 0.004, 0.14, dark, [0.04, -0.02, 0], { parent: head, seg: 4 }); prob.rotation.z = -1.9;
  const wings = [];
  for (const z of [0.05, -0.05]) { const w = E.group(g, [0, 0.04, z]); const p = E.sphere(0.1, E.mat("#e8f1ff", { transparent: true, opacity: 0.45 }), [-0.07, 0, z * 0.8], { parent: w, seg: 10 }); p.scale.set(1.4, 0.05, 0.5); wings.push(w); }
  for (let i = 0; i < 3; i++) for (const z of [0.03, -0.03]) { const l = E.cyl(0.004, 0.004, 0.2, dark, [0.02 - i * 0.03, -0.2, z * 2.5], { parent: g, seg: 4 }); l.rotation.x = z > 0 ? -0.4 : 0.4; }
  g.userData.wings = wings;
  return g;
}
function buzz(m, f, on = true) { m.userData.wings.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * (on ? 0.6 * Math.sin(f * 2.4) : 0.1))); }

export function build(E) {
  const { S, T } = E;
  E.ground(T.grass("#6f8f3f"), 500, 0.25);
  // ---- laboratuvar (x=0) ----
  S.room({ w: 8, d: 6, h: 3.3, wall: T.plaster("#d8c9a8"), floor: T.planks("#7a5232"), window: true, door: true });
  S.desk(0.4, -0.9, {}); S.shelf(-2.8, -2.7, {}); S.hangLamp(0.2, 3.3, -0.4, {});
  R.jars = [];
  for (let i = 0; i < 4; i++) { const j = E.cyl(0.11, 0.11, 0.26, E.mat("#cfe9ff", { transparent: true, opacity: 0.35 }), [-0.1 + i * 0.28, 0.78, -1.05], { seg: 16 }); R.jars.push(j); E.cyl(0.115, 0.115, 0.03, E.mat("#e9e2d0"), [-0.1 + i * 0.28, 1.04, -1.05], { seg: 16 }); }
  R.book = E.box(0.42, 0.08, 0.32, E.mat("#8a2b2b"), [0.3, 1.0, -0.6]);
  E.label(T.sign("SARI HUMMA", { bg: "#f2c230", fg: "#1a1a1a", size: 110 }), 1.1, 0.3, [0, 2.3, -2.95]);
  // ---- kamp (x=CX) ----
  for (let i = 0; i < 6; i++) { const x = CX - 5 + (i % 3) * 4.2, z = -3 - Math.floor(i / 3) * 4; const c = E.cone(1.4, 1.8, E.mat(i % 2 ? "#d9cfae" : "#cbbf98"), [x, 0, z], { seg: 4 }); c.rotation.y = Math.PI / 4; }
  S.tree(CX - 7, -8, { type: "palm", s: 1.3 }); S.tree(CX + 7, -7, { type: "palm", s: 1.1 }); S.tree(CX + 3, -11, { type: "palm", s: 1.4 });
  S.signpost(CX + 1.8, 0.3, "KÜBA 1900");
  S.clouds();
  // ---- hasta odası (x=HX) ----
  const hr = E.group(null, [HX, 0, 0]);
  E.box(6, 3.2, 0.2, E.mat("#e8e0cc"), [0, 0, -2], { parent: hr });
  E.box(2.0, 0.5, 0.95, E.mat("#f3efe4"), [0, 0, -0.9], { parent: hr });
  E.box(0.1, 0.9, 0.95, E.mat("#6b5a48"), [-1.0, 0, -0.9], { parent: hr });
  R.cal = E.label(T.sign("25", { bg: "#ffffff", fg: "#b8262e", size: 200, sub: "EYLÜL 1900" }), 0.6, 0.7, [HX + 0.9, 2.0, -1.88]);
  // ---- modern şehir (x=MX) ----
  S.street({ len: 60, z: 0 }); S.row(MX - 25, MX + 25, -9, { seed: 5 });
  R.mos = makeMosquito(E); R.mos2 = makeMosquito(E); R.mos3 = makeMosquito(E);
  // ---- karakterler ----
  E.actor("laz", { jacket: "#f1efe8", shirt: "#8ea3b8", pants: "#3a3a44", tie: "#2b2b4a", hair: "part", hairCol: "#3a2a1c", moustache: "#3a2a1c", skin: "#f2d2b0", seed: 13 });
  E.actor("d1", { jacket: "#3b3a46", shirt: "#e8e2d4", pants: "#2b2b33", hat: "bowler", hatCol: "#222", moustache: "#5a4030", beard: "#5a4030", skin: "#f6dcc0", seed: 23 });
  E.actor("d2", { jacket: "#5a4a3a", shirt: "#e8e2d4", pants: "#2b2b33", glasses: true, hair: "short", hairCol: "#888888", skin: "#e9c3a0", seed: 33 });
  const kh = { shirt: "#b9a67a", pants: "#8a7a55", hat: "cap", hatCol: "#8a7a55" };
  for (let i = 0; i < 4; i++) E.actor("s" + i, { ...kh, skin: ["#f2d2b0", "#c98f66", "#e9c3a0", "#a0704a"][i], seed: 50 + i * 7, moustache: i === 2 ? "#3a2a1c" : null });
  const cols = ["#c2843a", "#7b5ac9", "#3f8a6a", "#b5653f", "#3f6fb5", "#e8dcc4", "#8a3a3a", "#c9a24a"];
  for (let i = 0; i < 8; i++) E.actor("p" + i, { shirt: cols[i], dress: i % 3 === 1 ? cols[i] : null, hair: ["short", "long", "bun", "part", "spiky"][i % 5], hairCol: ["#2a1d16", "#7a4a2a", "#c9a24a"][i % 3], skin: ["#fbf5ea", "#e9c3a0", "#f6dcc0", "#c98f66"][i % 4], seed: 80 + i * 5 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(28,22,12,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = GOLD; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffe9b3"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = GOLD, size = 140) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#1a140a"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};
const sepia = (a) => (g, w, h) => { g.save(); g.fillStyle = `rgba(150,110,50,${a})`; g.fillRect(0, 0, w, h); g.restore(); };

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "interior", dof = { focus: 3, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0], tint = 0.12;
  [R.mos, R.mos2, R.mos3].forEach((m) => { m.visible = false; m.position.y = -50; });
  R.book.visible = true; R.book.position.set(0.3, 1.0, -0.6); R.book.rotation.set(0, 0, 0); R.book.scale.setScalar(1);
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  const laz = (o) => A.push({ id: "laz", pos: [0, 0, -0.2], st: st(13, o) });

  switch (sh.name) {
    case "hook": {
      // doktor kolunu uzatır, sivrisinek koluna konar
      laz({ face: "determined", arms: [[-10, 75], [-10, 10]], look: 0.5 });
      const p = X.smooth(X.span(f, 20, WF(E, 8) - 4));
      put(R.mos, 0.75 - 0.3 * p + 0.03 * Math.sin(f / 3), 1.9 - 0.65 * p + 0.03 * Math.sin(f / 4), 0.3, Math.PI, 1.1); buzz(R.mos, f, p < 0.98);
      cam = E.camAt(f, [{ f: 0, pos: [0.9, 1.75, 2.4], look: [0.25, 1.45, -0.1], fov: 40 }, { f: 127, pos: [0.75, 1.65, 1.9], look: [0.35, 1.35, 0], fov: 38 }]);
      dof = { focus: [0.4, 1.4, 0.1], amount: 6 };
      if (f >= WF(E, 8)) FX.push({ kind: "exclaim", pos: [0.0, 2.75, -0.2], size: 0.45 * X.back(X.span(f, WF(E, 8), WF(E, 8) + 8)) });
      break;
    }
    case "year": {
      light = "golden";
      cam = E.camAt(f, [{ f: 128, pos: [CX - 1, 2.4, 9], look: [CX, 1.4, -4], fov: 46 }, { f: 158, pos: [CX - 0.5, 2.2, 8.2], look: [CX, 1.4, -4], fov: 46 }]);
      focusPt = [CX, 0, -3];
      overlay = big("1900", X.span(f, 130, 138), "", GOLD, 190);
      break;
    }
    case "camp": {
      light = "day"; tint = 0.1;
      for (let i = 0; i < 4; i++) A.push({ id: "s" + i, pos: [CX - 2.4 + i * 1.6, i % 2 ? 0.3 : 0, -0.6 - (i % 2) * 0.6], st: st(50 + i, { legs: i % 2 ? "sit" : "stand", face: i % 2 ? "sad" : "nervous", arms: i % 2 ? "hang" : "cross", sweat: true }) });
      cam = E.camAt(f, [{ f: 159, pos: [CX, 2.2, 5.5], look: [CX, 1.2, -1], fov: 46 }, { f: 245, pos: [CX + 0.4, 2.0, 4.8], look: [CX, 1.2, -1], fov: 46 }]);
      focusPt = [CX, 0, -1];
      overlay = card("Sarı humma", "Küba'daki askerler arasında salgın");
      break;
    }
    case "doctors": {
      A.push({ id: "d1", pos: [-0.9, 0, -0.5], st: st(23, { face: "think", arms: "chin" }) });
      A.push({ id: "d2", pos: [0.9, 0, -0.5], st: st(33, { face: "nervous", arms: "shrug" }) });
      A.push({ id: "laz", pos: [0, 0, -1.4], st: st(13, { face: "think", arms: "cross" }) });
      cam = E.camAt(f, [{ f: 246, pos: [0, 1.8, 3.6], look: [0, 1.4, -0.8], fov: 46 }, { f: 337, pos: [0, 1.75, 3.1], look: [0, 1.4, -0.8], fov: 46 }]);
      for (let i = 0; i < 3; i++) FX.push({ kind: "question", pos: [-0.9 + i * 0.9, 2.7 + 0.08 * Math.sin(f / 9 + i), -0.5 - (i === 1 ? 0.9 : 0)], size: 0.35 * X.back(X.span(f, 252 + i * 8, 262 + i * 8)) });
      break;
    }
    case "lazear": {
      laz({ face: "think", arms: "hold", prop: { kind: "magnifier", hand: "r" }, look: 0.6 });
      put(R.mos, 0.32, 0.92, -1.05, 0, 1.2); buzz(R.mos, f);
      cam = E.camAt(f, [{ f: 338, pos: [1.2, 1.75, 2.2], look: [0.2, 1.3, -0.6], fov: 42 }, { f: 439, pos: [1.0, 1.7, 1.9], look: [0.2, 1.3, -0.6], fov: 40 }]);
      dof = { focus: [0.2, 1.3, -0.6], amount: 6 };
      overlay = card("Dr. Jesse Lazear", "sivrisineklerden şüpheleniyordu");
      break;
    }
    case "test": {
      // kavanozdaki sivrisinek: hasta → sağlıklı gönüllü
      const p = X.smooth(X.span(f, 470, 560));
      A.push({ id: "s1", pos: [-1.3, 0.3, -0.6], st: st(57, { legs: "sit", face: "sad", sweat: true, arms: "hang" }) });
      A.push({ id: "p2", pos: [1.3, 0, -0.6], st: st(90, { face: f > 545 ? "nervous" : "neutral", arms: "hang" }) });
      laz({ face: "determined", arms: "present" });
      put(R.mos, -1.1 + 2.3 * p, 1.6 + 0.4 * Math.sin(p * Math.PI) + 0.03 * Math.sin(f / 3), -0.3, 0, 1.6); buzz(R.mos, f);
      cam = E.camAt(f, [{ f: 440, pos: [0, 1.9, 4.2], look: [0, 1.35, -0.5], fov: 46 }, { f: 577, pos: [0, 1.85, 3.7], look: [0, 1.35, -0.5], fov: 46 }]);
      FX.push({ kind: "lines", pos: [-1.1 + 2.3 * p - 0.25, 1.6 + 0.4 * Math.sin(p * Math.PI), -0.3], size: 0.25, t: (f % 10) / 10 });
      overlay = card("Deney", "hasta → sivrisinek → sağlıklı gönüllü");
      break;
    }
    case "bite": {
      const fb = WF(E, 40) - 3;
      laz({ face: f < fb ? "neutral" : "shock", arms: [[-10, 75], [-10, 10]], look: 0.5 });
      const p = X.smooth(X.span(f, 578, fb));
      put(R.mos, 0.75 - 0.3 * p, 1.9 - 0.65 * p, 0.3, Math.PI, 1.1); buzz(R.mos, f, p < 0.98);
      cam = E.camAt(f, [{ f: 578, pos: [0.85, 1.55, 1.5], look: [0.45, 1.35, 0.2], fov: 36 }, { f: 634, pos: [0.75, 1.5, 1.3], look: [0.45, 1.35, 0.2], fov: 34 }]);
      dof = { focus: [0.5, 1.4, 0.3], amount: 10 };
      if (f >= fb) { FX.push({ kind: "burst", pos: [0.55, 1.5, 0.4], size: 0.3 * X.back(X.span(f, fb, fb + 6)), t: X.span(f, fb, fb + 20), opt: { text: "!" } }); shake(fb, 0.02, 8); }
      break;
    }
    case "rumor": {
      laz({ face: "sly", arms: "hip", look: 0.4 });
      put(R.mos, 0.55, 2.0 + 0.05 * Math.sin(f / 5), 0.2, Math.PI, 1.1); buzz(R.mos, f);
      cam = E.camAt(f, [{ f: 635, pos: [0.4, 1.8, 2.8], look: [0.1, 1.6, -0.2], fov: 42 }, { f: 710, pos: [0.3, 1.75, 2.4], look: [0.1, 1.6, -0.2], fov: 40 }]);
      dof = { focus: [0.1, 1.6, -0.2], amount: 6 };
      overlay = big("Bilerek mi?", X.span(f, 645, 653), "rivayete göre", GOLD, 120);
      FX.push({ kind: "question", pos: [-0.5, 2.8, -0.2], size: 0.4 });
      break;
    }
    case "book": {
      const p = X.span(f, 730, 790);
      R.book.visible = p < 0.95;
      R.book.scale.setScalar(1 - 0.9 * X.smooth(X.span(f, 755, 790)));
      cam = E.camAt(f, [{ f: 711, pos: [1.0, 1.75, 1.1], look: [0.3, 1.05, -0.6], fov: 36 }, { f: 792, pos: [0.9, 1.65, 0.9], look: [0.3, 1.05, -0.6], fov: 34 }]);
      dof = { focus: [0.3, 1.05, -0.6], amount: 8 };
      if (f > 755) FX.push({ kind: "puff", pos: [0.3, 1.1, -0.6], size: 0.35, t: X.span(f, 755, 792) });
      if (f > 770) FX.push({ kind: "question", pos: [0.3, 1.45, -0.6], size: 0.3 * X.back(X.span(f, 770, 780)) });
      overlay = card("Defteri kayboldu", "kimse emin değil");
      break;
    }
    case "fever": {
      light = "night"; tint = 0.18;
      A.push({ id: "laz", pos: [HX - 0.25, 0.3, -0.8], st: st(13, { legs: "sit", face: "sad", arms: "hang", sweat: true, look: 0.4 }) });
      cam = E.camAt(f, [{ f: 793, pos: [HX + 0.35, 1.7, 3.8], look: [HX + 0.3, 1.45, -1.2], fov: 46 }, { f: 899, pos: [HX + 0.35, 1.65, 3.3], look: [HX + 0.3, 1.45, -1.2], fov: 46 }]);
      focusPt = [HX, 0, -1]; dof = { focus: [HX + 0.4, 1.4, -1.2], amount: 3 };
      break;
    }
    case "right": {
      laz({ face: "determined", arms: "present" });
      put(R.mos, 0.6, 1.9, 0.3, Math.PI, 1.6); buzz(R.mos, f);
      cam = E.camAt(f, [{ f: 900, pos: [0.3, 1.8, 2.6], look: [0.1, 1.6, -0.2], fov: 42 }, { f: 930, pos: [0.25, 1.78, 2.4], look: [0.1, 1.6, -0.2], fov: 42 }]);
      overlay = big("HAKLIYDI", X.span(f, 902, 908), "", GOLD, 170);
      flash = Math.max(0, 1 - Math.abs(f - 903) / 5) * 0.3;
      break;
    }
    case "legacy": {
      light = "day"; tint = 0;
      for (let i = 0; i < 8; i++) { const x = MX - 2.6 + (i % 4) * 1.75, z = -Math.floor(i / 4) * 1.8; A.push({ id: "p" + i, pos: [x, 0, z], st: st(80 + i, { face: "happy", arms: i % 3 === 0 ? "wave" : "hang", legs: "walk", phase: (f + i * 7) / 26 }) }); }
      cam = E.camAt(f, [{ f: 931, pos: [MX, 2.8, 7.2], look: [MX, 1.3, -1], fov: 46 }, { f: 1048, pos: [MX, 2.6, 6.2], look: [MX, 1.3, -1], fov: 46 }]);
      focusPt = [MX, 0, -1];
      overlay = big("milyonlarca", X.span(f, 950, 958), "kurtarılan hayat", "#9fe8a0", 140);
      FX.push({ kind: "hearts", pos: [MX, 3.0, -0.5], size: 0.5, t: t / 20 });
      break;
    }
    case "end": {
      laz({ face: "happy", arms: "wave" });
      cam = E.camAt(f, [{ f: 1049, pos: [0.2, 1.85, 3.0], look: [0, 1.55, -0.2], fov: 42 }, { f: 1117, pos: [0.2, 1.8, 2.6], look: [0, 1.55, -0.2], fov: 42 }]);
      overlay = big("Tuhaf ama gerçek.", X.span(f, 1051, 1059), "", "#ffffff", 100);
      break;
    }
  }
  const ov = overlay, tn = tint;
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: (g, w, h) => { if (tn > 0) sepia(tn)(g, w, h); if (ov) ov(g, w, h); }, focusPt };
}
