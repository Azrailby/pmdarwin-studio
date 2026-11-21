// Bir Şehri Dans Ettiren Salgın — PMDARWIN (~33 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [120, "stop"], [153, "city"], [197, "days"], [312, "join"], [404, "month"], [513, "officials"],
  [573, "more"], [606, "stage"], [685, "chaos"], [734, "rumor"], [818, "unknown"], [906, "end"]];
const END = 1002;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const ORANGE = "#ff9a3c", CREAM = "#fff1d6", RED = "#e04848";
const LX = 100; // tarihçinin odası
const ND = 18; // kart dansçı sayısı
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makeMini(E, i) {
  const g = E.group(null, [0, -50, 0]);
  const cols = ["#c84a3a", "#3f6fb5", "#3f8a4a", "#e8a33c", "#8a4a8a", "#5a8a9a", "#b8743a", "#d86a8a"];
  E.cyl(0.13, 0.2, 0.75, E.mat(cols[i % cols.length]), [0, 0.25, 0], { parent: g, seg: 8 });
  E.sphere(0.15, E.mat(["#f6dcc0", "#f0c9a4", "#e9c3a0", "#c98f66"][i % 4]), [0, 1.15, 0], { parent: g, seg: 10 });
  for (const s of [-1, 1]) { const a = E.cyl(0.035, 0.035, 0.45, E.mat(cols[i % cols.length]), [s * 0.16, 0.85, 0], { parent: g, seg: 5 }); a.rotation.z = -s * 2.4; }
  for (const s of [-1, 1]) E.cyl(0.045, 0.045, 0.3, E.mat("#3b3f52"), [s * 0.08, 0, 0], { parent: g, seg: 5 });
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E;
  // ---- meydan (x=0) ----
  E.ground(T.cobble("#b7a68a"), 120, 0.35, [0, 0, 0]);
  const walls = ["#f1e3c6", "#f3d6b9", "#e9dcc4", "#f4e6c8", "#ead2b0"];
  S.row(-16, 16, -11, { walls, roofs: ["#8a4a3a", "#a8543a", "#6a3a2a"], seed: 7, d: 6 });
  S.row(-16, 16, 11, { walls, roofs: ["#8a4a3a", "#a8543a"], seed: 9, d: 6, rot: Math.PI });
  for (const s of [-1, 1]) { const g = E.group(null, [s * 12, 0, 0], s * -Math.PI / 2); S.row(-10, 10, 0, { walls, seed: 11 + s, d: 6, parent: g }); }
  // katedral
  const cat = E.group(null, [3, 0, -24]);
  E.box(9, 12, 7, E.mat("#c9a98a", { map: T.stone("#c9a98a") }), [0, 0, 0], { parent: cat });
  E.box(3.2, 22, 3.2, E.mat("#c9a98a", { map: T.stone("#c9a98a") }), [-2.6, 0, 2.2], { parent: cat });
  E.cone(2.3, 9, E.mat("#9a7a64"), [-2.6, 22, 2.2], { parent: cat, seg: 8 });
  E.cone(1.2, 4, E.mat("#9a7a64"), [2.6, 12, 2.2], { parent: cat, seg: 8 });
  E.sphere(1.1, E.mat("#e8c45a", { emissive: "#8a5a10", glow: 0.3 }), [-2.6, 15, 3.85], { parent: cat, seg: 16 }).scale.z = 0.1;
  S.clouds({ n: 6, y: 34, z: -110 });
  S.lamp(-5.5, -6.5); S.lamp(5.5, -6.5);
  for (let i = 0; i < 4; i++) S.barrel(-7 + i * 0.9, -8.6, 0.9);
  R.minis = [];
  for (let i = 0; i < 170; i++) R.minis.push(makeMini(E, i));
  // sahne
  R.stage = E.group(null, [0, -50, -5.0]);
  E.box(4.2, 0.7, 2.0, E.mat("#ffffff", { map: T.planks("#a8743f") }), [0, 0, 0], { parent: R.stage });
  for (const s of [-1, 1]) E.box(0.15, 2.6, 0.15, E.mat("#6b4428"), [s * 2.0, 0.7, -0.9], { parent: R.stage });
  E.box(4.3, 0.5, 0.1, E.mat("#c84a3a"), [0, 3.0, -0.9], { parent: R.stage });
  R.drum = E.group(null, [0, -50, 0]);
  E.cyl(0.32, 0.32, 0.4, E.mat("#c84a3a"), [0, 0, 0], { parent: R.drum, seg: 16 });
  E.cyl(0.33, 0.33, 0.03, E.mat("#f4efe4"), [0, 0.4, 0], { parent: R.drum, seg: 16 });
  R.flute = E.cyl(0.02, 0.02, 0.45, E.mat("#8a5a36"), [0, -50, 0], { center: true, seg: 6 });
  // ---- tarihçi odası (x=LX) ----
  S.room({ x: LX, w: 10, d: 8, wall: T.wallpaper("#e9d6b5", "#dcc49c"), floor: T.planks("#8a5a36"), window: true, door: false });
  S.shelf(LX - 2.2, -3.6, { seed: 2 }); S.shelf(LX + 2.2, -3.6, { seed: 6 });
  S.desk(LX + 0.2, -1.8);
  S.frame(LX, 2.2, -3.95, { kind: "landscape" });
  // ---- karakterler ----
  E.actor("troffea", { dress: "#c84a3a", shirt: "#c84a3a", apron: "#f4efe4", hair: "bun", hairCol: "#7a4a2a", skin: "#f6dcc0", seed: 71 });
  const dc = ["#3f6fb5", "#3f8a4a", "#e8a33c", "#8a4a8a", "#5a8a9a", "#b8743a", "#d86a8a", "#6a7a3a", "#a83a5a"];
  for (let i = 0; i < ND; i++) {
    const fem = i % 2 === 0;
    E.actor("d" + i, { shirt: dc[i % dc.length], pants: "#4a3a2a", dress: fem ? dc[i % dc.length] : null, apron: fem && i % 4 === 0 ? "#f4efe4" : null, hair: fem ? ["bun", "long"][i % 2 === 0 && i % 4 ? 1 : 0] : ["short", "spiky", "part"][i % 3], hairCol: ["#7a4a2a", "#3a2a20", "#c9a24a", "#5a3a22", "#a8543a"][i % 5], hat: !fem && i % 3 === 1 ? "beret" : null, hatCol: "#5a3a2a", skin: ["#f6dcc0", "#f0c9a4", "#e9c3a0", "#c98f66"][i % 4], seed: 80 + i, build: i % 7 === 3 ? "stout" : "adult" });
  }
  for (let i = 0; i < 3; i++) E.actor("of" + i, { jacket: ["#3a2a4a", "#2a3a5a", "#5a2a2a"][i], shirt: "#e8dcc4", pants: "#2a2a30", hat: i === 1 ? "tophat" : "beret", hatCol: "#1d1622", hatBand: "#c9a24a", moustache: i !== 2 ? "#3a2a20" : null, beard: i === 2 ? "#8a8a8a" : null, hair: "short", hairCol: "#3a2a20", skin: "#f0c9a4", seed: 110 + i, build: i === 0 ? "stout" : "adult" });
  E.actor("mus1", { shirt: "#3f8a4a", pants: "#4a3a2a", hat: "beret", hatCol: "#c84a3a", hair: "short", skin: "#e9c3a0", seed: 120 });
  E.actor("mus2", { shirt: "#e8a33c", pants: "#4a3a2a", hair: "spiky", hairCol: "#3a2a20", skin: "#f6dcc0", seed: 121 });
  E.actor("hist", { jacket: "#6a4a2a", shirt: "#e8dcc4", tie: "#3f6fb5", pants: "#3a3a44", hair: "part", hairCol: "#8a8a8a", glasses: true, beard: "#8a8a8a", skin: "#f0c9a4", seed: 130 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(40,20,8,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = ORANGE; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffe2c0"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = ORANGE, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#2a1408"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() { R.minis.forEach(hide); hide(R.stage); hide(R.drum); hide(R.flute); }
const ARMSET = ["up", "cheer", "wave", "shrug", "point", "up"];
// dans pozu: kart çevirme + salınım + yürüyüş bacakları
function dance(E, f, seed, o = {}) {
  const sp = o.speed || 1, ph = f / (9 / sp) + seed * 0.37;
  return { st: { face: o.face || "grin", arms: ARMSET[Math.floor((f * sp) / 14 + seed) % ARMSET.length], legs: o.legs || "walk", phase: ph / 2, blink: E.blink(f, seed), bob: 6 * Math.sin(f / 4 + seed), headTilt: 8 * Math.sin(f / 7 + seed), sweat: !!o.sweat, look: 0.6 * Math.sin(f / 10 + seed) }, flip: Math.sin(f / (8 / sp) + seed) > 0, roll: 0.14 * Math.sin(f / (7 / sp) + seed) };
}
function minis(f, n, cx, cz, rIn, rOut, sp = 1) {
  for (let i = 0; i < n && i < R.minis.length; i++) {
    const a = rnd(i + 300) * Math.PI * 2 + f * 0.004 * (i % 2 ? 1 : -1) * sp, r = rIn + (rOut - rIn) * Math.sqrt(rnd(i + 301));
    const m = R.minis[i]; put(m, cx + Math.cos(a) * r, 0.12 * Math.abs(Math.sin(f / (5 / sp) + i)), cz + Math.sin(a) * r * 0.75, f * 0.15 * sp + i, 1);
    m.rotation.z = 0.15 * Math.sin(f / 6 + i);
  }
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "golden", dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, 0], tint = "rgba(255,150,60,0.06)";
  reset();
  const tro = (o = {}, pos = [0, 0, 0]) => { const d = dance(E, f, 71, o); A.push({ id: "troffea", pos, ...d, ...(o.extra || {}) }); };
  const ring = (n, r, cz = 0, o = {}) => { for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2 + f * 0.006, d = dance(E, f, 80 + i, o); A.push({ id: "d" + i, pos: [Math.cos(a) * r, 0, cz + Math.sin(a) * r * 0.7], ...d }); } };

  switch (sh.name) {
    case "hook": case "stop": {
      const tired = sh.name === "stop";
      tro({ face: tired ? "nervous" : "grin", sweat: tired, speed: tired ? 0.8 : 1 });
      FX.push({ kind: "lines", pos: [-0.6, 1.3, 0.2], size: 0.45, rot: Math.PI / 2 });
      FX.push({ kind: "lines", pos: [0.6, 1.0, 0.2], size: 0.4, rot: -Math.PI / 2 });
      if (tired) FX.push({ kind: "sweat", pos: [0.45, 2.1, 0.2], size: 0.2 });
      cam = E.camAt(f, [{ f: 0, pos: [0.3, 1.3, 4.6], look: [0, 1.6, 0], fov: 48 }, { f: 119, pos: [0.25, 1.3, 3.8], look: [0, 1.55, 0], fov: 48 }, { f: 152, pos: [0.2, 1.35, 3.3], look: [0, 1.55, 0], fov: 46 }]);
      if (!tired) ov.push(big("1518", 1, f > WF(E, 8) - 3 ? "bir kadın dans etmeye başladı" : "", ORANGE, 190));
      else ov.push(big("DURAMADI", X.span(f, WF(E, 12) - 3, WF(E, 12) + 4), "", "#ffffff", 150));
      break;
    }
    case "city": {
      tro({}, [0, 0, 1.0]);
      cam = E.camAt(f, [{ f: 153, pos: [-1.0, 2.0, 14], look: [1.0, 14.5, -18], fov: 60 }, { f: 196, pos: [-0.8, 2.0, 13], look: [1.0, 14.5, -18], fov: 60 }]);
      ov.push(card("Strazburg", "Temmuz 1518"));
      ov.push(big("STRAZBURG", X.span(f, WF(E, 14) - 3, WF(E, 14) + 5), "", CREAM, 140));
      break;
    }
    case "days": {
      const day = (f - 197) / 26, nt = 0.5 - 0.5 * Math.cos(day * Math.PI * 2);
      light = ["golden", "night", nt * 0.85]; tint = nt > 0.5 ? "rgba(20,30,80,0.12)" : tint;
      tro({ face: day > 2.5 ? "nervous" : "grin", sweat: day > 3 });
      cam = E.camAt(f, [{ f: 197, pos: [0.2, 1.35, 4.2], look: [0, 1.6, 0], fov: 48 }, { f: 311, pos: [0.15, 1.35, 3.6], look: [0, 1.6, 0], fov: 48 }]);
      ov.push(card("Frau Troffea", "ilk dansçı"));
      ov.push(big(`${Math.min(6, 1 + Math.floor(day))}. gün`, X.span(f, WF(E, 20) - 3, WF(E, 20) + 5), "hâlâ dans ediyor", CREAM, 140));
      break;
    }
    case "join": {
      const n = Math.min(ND, Math.floor(X.span(f, 316, 392) * ND));
      tro();
      ring(n, 1.9 + 0.6 * X.span(f, 316, 392), -0.4);
      if (f > 330) minis(f, Math.floor(X.span(f, 340, 404) * 16), 0, -0.4, 3.0, 4.2);
      cam = E.camAt(f, [{ f: 312, pos: [0.2, 2.3, 6.0], look: [0, 1.3, -0.5], fov: 52 }, { f: 403, pos: [0.0, 3.0, 7.6], look: [0, 1.1, -0.6], fov: 52 }]);
      const c = Math.round(30 * X.easeOut(X.span(f, WF(E, 28) - 4, WF(E, 30) + 4)));
      ov.push(big(f < WF(E, 28) - 4 ? "1 hafta" : `${c}+ kişi`, 1, "", ORANGE, 150));
      break;
    }
    case "month": {
      tro();
      ring(ND, 2.6, -0.4);
      const n = Math.floor(30 + 140 * X.easeOut(X.span(f, 410, WF(E, 39) + 6)));
      minis(f, n, 0, -0.5, 3.2, 9.0);
      cam = E.camAt(f, [{ f: 404, pos: [0.0, 6.0, 12.0], look: [0, 0.5, -1.5], fov: 55 }, { f: 512, pos: [0.0, 9.0, 13.5], look: [0, 0.5, -2.0], fov: 55 }]);
      focusPt = [0, 0, -2];
      const c = Math.round(30 + 370 * X.easeOut(X.span(f, 410, WF(E, 39) + 6)));
      ov.push(big(`≈ ${c}`, 1, f > WF(E, 33) - 3 ? "1 ay sonra" : "", ORANGE, 170));
      break;
    }
    case "officials": case "more": {
      const more = sh.name === "more", idea = f >= WF(E, 43) - 3;
      for (let i = 0; i < 3; i++) A.push({ id: "of" + i, pos: [-0.85 + i * 0.85, 0, 7.6 - (i === 1 ? 0.3 : 0)], st: st(110 + i, { face: more ? "grin" : idea && i === 1 ? "wow" : "think", arms: more ? "cheer" : idea && i === 1 ? "point" : i === 0 ? "chin" : "hip", look: (1 - i) * 0.5 }) });
      if (idea && !more) FX.push({ kind: "idea", pos: [0.05, 2.75, 7.5], size: 0.55 * X.back(X.span(f, WF(E, 43) - 3, WF(E, 43) + 5)) });
      minis(f, 60, 0, -1.5, 1.5, 6.0, more ? 1.4 : 1);
      cam = E.camAt(f, [{ f: 513, pos: [0.0, 1.4, 12.6], look: [0, 1.6, 7.4], fov: 48 }, { f: 605, pos: [0.0, 1.4, 12.0], look: [0, 1.6, 7.4], fov: 48 }]);
      focusPt = [0, 0, 7.5];
      if (more) ov.push(big("DAHA ÇOK DANS!", X.span(f, 574, 580), "", "#ffd23f", 120));
      else ov.push(big("çözüm?", X.span(f, WF(E, 42) - 3, WF(E, 42) + 5), "yetkililer düşünüyor", CREAM, 140));
      break;
    }
    case "stage": {
      const up = X.easeOut(X.span(f, WF(E, 51) - 6, WF(E, 52) + 6));
      put(R.stage, 0, -0.7 + 0.7 * up, -4.6);
      const sy = 0.7 * up;
      A.push({ id: "mus1", pos: [-0.85, sy, -4.4], st: st(120, { face: "happy", arms: f % 12 < 6 ? "hold" : "reach", look: 0.4 }), blob: up > 0.9 });
      put(R.drum, -0.5, sy, -4.15, 0, 0.9);
      A.push({ id: "mus2", pos: [0.85, sy, -4.4], st: st(121, { face: "smug", arms: "whisper", look: -0.4, bob: 0 }), blob: up > 0.9 });
      put(R.flute, 0.98, sy + 1.25, -4.3); R.flute.rotation.set(0, 0, 1.2);
      for (let i = 0; i < 8; i++) { const d = dance(E, f, 80 + i); A.push({ id: "d" + i, pos: [-2.4 + i * 0.68, 0, -2.4 + (i % 2) * 0.6], ...d }); }
      minis(f, 80, 0, -1.5, 3.4, 8.0);
      if (f % 16 < 8) FX.push({ kind: "burst", pos: [-0.5, sy + 1.0, -3.9], size: 0.25, opt: { col: "#ffd23f", text: "DUM", size: 120 } });
      cam = E.camAt(f, [{ f: 606, pos: [0.0, 1.7, 3.6], look: [0, 1.5, -4.0], fov: 50 }, { f: 684, pos: [0.0, 1.8, 2.8], look: [0, 1.6, -4.0], fov: 50 }]);
      focusPt = [0, 0, -3];
      ov.push(big("müzisyenler", X.span(f, WF(E, 48) - 3, WF(E, 48) + 5), f > WF(E, 51) - 3 ? "ve sahne!" : "", "#ffd23f", 130));
      break;
    }
    case "chaos": {
      put(R.stage, 0, 0, -4.6);
      A.push({ id: "mus1", pos: [-0.85, 0.7, -4.4], st: st(120, { face: "grin", arms: f % 8 < 4 ? "hold" : "reach" }), blob: true });
      put(R.drum, -0.5, 0.7, -4.15, 0, 0.9);
      tro({ speed: 1.6, face: "shock", sweat: true });
      ring(ND, 2.4, -0.3, { speed: 1.6, face: "nervous", sweat: true });
      minis(f, 170, 0, -0.5, 3.0, 9.0, 1.8);
      const a = (f - 685) * 0.03;
      cam = { pos: [Math.sin(a) * 7.5, 3.6, Math.cos(a) * 7.5], look: [0, 1.2, -0.4], fov: 52, roll: 0.06 * Math.sin(f / 4) };
      ov.push(big("KAOS", X.span(f, WF(E, 56) - 3, WF(E, 56) + 4), "daha da kötüleşti", RED, 170));
      break;
    }
    case "rumor": {
      light = ["golden", "dramatic", 0.6]; tint = "rgba(60,30,60,0.12)";
      const pos = [[-0.9, -0.3], [0.2, 0.3], [1.1, -0.5], [-1.8, -1.4], [1.9, -1.6]];
      pos.forEach(([x, z], i) => A.push({ id: "d" + i, pos: [x, 0, z], st: st(80 + i, { face: i % 2 ? "sad" : "nervous", sweat: true, arms: "hang", legs: "sit", look: 0.2 }), tint: "#e8d0c0" }));
      cam = E.camAt(f, [{ f: 734, pos: [0.2, 1.4, 4.6], look: [0, 1.1, -0.6], fov: 48 }, { f: 817, pos: [0.2, 1.4, 4.0], look: [0, 1.1, -0.6], fov: 48 }], { creep: 0.06 });
      ov.push(card("Rivayete göre…", "bazıları yorgunluktan öldü"));
      ov.push(big("rivayet", X.span(f, WF(E, 57) - 3, WF(E, 57) + 5) * 0.9, "kayıtlar tartışmalı", CREAM, 120));
      break;
    }
    case "unknown": {
      light = "interior"; tint = null;
      A.push({ id: "hist", pos: [LX, 0, -0.8], st: st(130, { face: f > WF(E, 66) ? "think" : "nervous", arms: f > WF(E, 66) ? "chin" : "shrug", look: 0.3, prop: f > WF(E, 66) ? null : { kind: "scroll", hand: "l" } }) });
      [[-0.6, 2.15], [0.65, 2.3], [0.5, 1.75]].forEach(([dx, y], i) => { if (f > 822 + i * 14) FX.push({ kind: "question", pos: [LX + dx, y + 0.05 * Math.sin(f / 6 + i), -0.6], size: 0.35 * X.back(X.span(f, 822 + i * 14, 830 + i * 14)) }); });
      cam = E.camAt(f, [{ f: 818, pos: [LX + 0.2, 1.35, 3.0], look: [LX, 1.6, -0.8], fov: 46 }, { f: 905, pos: [LX + 0.2, 1.35, 2.6], look: [LX, 1.6, -0.8], fov: 46 }]);
      focusPt = [LX, 0, -1];
      ov.push(big("NEDEN?", X.span(f, WF(E, 66) - 3, WF(E, 66) + 5), "hâlâ bilinmiyor", "#ffffff", 160));
      break;
    }
    case "end": {
      light = { ...X.LIGHTS.golden, top: "#ff7a3a", bot: "#ffd08a", fog: "#ffb070", sunI: 0.6, hemiI: 0.4 };
      tint = "rgba(255,120,40,0.10)";
      const d = dance(E, f, 71, { speed: 0.7 });
      A.push({ id: "troffea", pos: [0, 0, 6.5], ...d, tint: "#1d1420", blob: false });
      cam = E.camAt(f, [{ f: 906, pos: [0.2, 0.45, 10.4], look: [0, 2.0, 3], fov: 50 }, { f: 1001, pos: [0.2, 0.45, 9.8], look: [0, 2.0, 3], fov: 50 }], { creep: 0.05 });
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 908, 916), f >= WF(E, 72) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
