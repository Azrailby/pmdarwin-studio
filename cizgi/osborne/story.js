// 68 Yıl Boyunca Hıçkıran Adam — PMDARWIN (~30 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [92, "name"], [112, "pig"], [215, "first"], [282, "calendar"], [310, "metro"], [399, "family"],
  [506, "count"], [642, "silence"], [751, "chair"], [824, "end"]];
const END = 922;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const ORANGE = "#ffb347", PINK = "#ff8fb1", CREAM = "#fff1d6";
const HX = 100; // ev içi (çiftlik x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makePig(E) {
  const g = E.group(null, [0, -50, 0]), pk = E.mat("#ffc8d8"), dk = E.mat("#f59ab4");
  E.sphere(0.32, pk, [0, 0.42, 0], { parent: g, seg: 20 }).scale.set(1.45, 1, 1);
  const head = E.group(g, [0.45, 0.55, 0]); g.userData.head = head;
  E.sphere(0.22, pk, [0, 0, 0], { parent: head, seg: 18 });
  const sn = E.cyl(0.09, 0.1, 0.08, dk, [0.2, -0.03, 0], { parent: head, center: true, seg: 14 }); sn.rotation.z = Math.PI / 2;
  for (const s of [-1, 1]) {
    E.sphere(0.018, E.mat("#7a3a4a"), [0.245, -0.03, s * 0.035], { parent: head, seg: 6 });
    E.sphere(0.035, E.mat("#ffffff"), [0.15, 0.08, s * 0.1], { parent: head, seg: 8 });
    E.sphere(0.02, E.mat("#120c18"), [0.18, 0.08, s * 0.1], { parent: head, seg: 6 });
    const ear = E.cone(0.07, 0.14, dk, [-0.02, 0.15, s * 0.12], { parent: head, seg: 6 }); ear.rotation.set(s * 0.5, 0, -0.3);
  }
  g.userData.legs = [];
  for (const [x, z] of [[0.28, 0.16], [0.28, -0.16], [-0.28, 0.16], [-0.28, -0.16]]) { const l = E.cyl(0.06, 0.06, 0.22, pk, [x, 0, z], { parent: g, seg: 8 }); g.userData.legs.push(l); }
  const tail = E.cyl(0.02, 0.02, 0.14, dk, [-0.48, 0.55, 0], { parent: g, center: true, seg: 6 }); tail.rotation.z = 0.9;
  return g;
}
function makeMetronome(E) {
  const g = E.group(null, [0, -50, 0]);
  E.cone(0.22, 0.6, E.mat("#8a5a36", { map: E.T.wood("#8a5a36") }), [0, 0, 0], { parent: g, seg: 4 }).rotation.y = Math.PI / 4;
  E.box(0.3, 0.06, 0.3, E.mat("#5a3a22"), [0, 0, 0], { parent: g });
  const rod = E.group(g, [0, 0.1, 0.12]); g.userData.rod = rod;
  E.box(0.02, 0.55, 0.02, E.mat("#d8d0c0"), [0, 0, 0], { parent: rod });
  E.box(0.07, 0.07, 0.03, E.mat("#e8c45a"), [0, 0.38, 0], { parent: rod });
  return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E;
  // ---- çiftlik (x=0) ----
  E.ground(T.grass("#86b35a"), 300, 0.25, [0, 0, 0]);
  E.box(5, 0.02, 30, E.mat("#ffffff", { map: T.dirt("#c9a87a") }), [1.2, 0, -10]);
  S.building(-2.6, -6.5, { w: 6, d: 5, floors: 2, wall: "#b8423a", roof: "#5a3a2a", shutter: null, win: "#f4e3b0", cols: 2, chimney: false });
  E.box(2.2, 2.6, 0.08, E.mat("#ffffff", { map: T.planks("#f4efe4", 6) }), [-2.6, 0, -3.95]);
  S.fence(-6, 4.5, -2.6, { col: "#e8dcc4" });
  for (let i = 0; i < 4; i++) { const b = E.cyl(0.45, 0.45, 0.8, E.mat("#e8c45a"), [2.4 + (i % 2) * 0.95, 0.45, -3.6 - Math.floor(i / 2) * 0.7], { center: true, seg: 16 }); b.rotation.x = Math.PI / 2; }
  for (let i = 0; i < 10; i++) S.tree((i % 2 ? 1 : -1) * (6 + rnd(i) * 10), -10 - rnd(i + 3) * 18, { s: 1 + rnd(i + 7) * 0.5, col: "#5f9e4a" });
  S.hills({ z: -80, col: "#8fbf5f" }); S.clouds({ n: 5, y: 40 });
  R.pig = makePig(E);
  // ---- ev (x=HX) ----
  S.room({ w: 10, d: 8, x: HX, wall: T.wallpaper("#f3d9a8", "#e9c58a", "diamond"), floor: T.planks("#a8743f"), window: true, door: false });
  S.rug(HX, 0.4, 3.5, 2.6, "#a8343e");
  R.chair = E.group(null, [HX + 1.0, 0, -1.6]);
  E.box(0.8, 0.12, 0.7, E.mat("#8a3a3a"), [0, 0.5, 0], { parent: R.chair });
  E.box(0.8, 1.1, 0.12, E.mat("#8a3a3a"), [0, 0.55, -0.32], { parent: R.chair });
  for (const s of [-1, 1]) { const rk = E.box(0.06, 0.06, 1.0, E.mat("#5a3a22"), [s * 0.36, 0.05, 0], { parent: R.chair }); rk.rotation.x = 0.05; E.box(0.06, 0.5, 0.06, E.mat("#5a3a22"), [s * 0.36, 0, 0.25], { parent: R.chair }); E.box(0.06, 0.5, 0.06, E.mat("#5a3a22"), [s * 0.36, 0, -0.25], { parent: R.chair }); }
  E.box(0.6, 0.06, 0.5, E.mat("#e8dcc4"), [0, 0.65, 0.05], { parent: R.chair });
  S.table(HX - 2.0, -2.6, { w: 1.4, d: 0.8, cloth: "#f4efe4" });
  E.box(0.5, 0.5, 0.18, E.mat("#8a5a36"), [HX - 2.0, 0.95, -2.7]);
  E.cyl(0.18, 0.18, 0.02, E.mat("#f4efe4"), [HX - 2.0, 1.2, -2.6], { center: true, seg: 16 }).rotation.x = Math.PI / 2;
  // takvim
  E.box(0.9, 1.15, 0.04, E.mat("#ffffff"), [HX - 0.6, 1.5, -3.97]);
  R.cal = {};
  for (const y of [1922, 1925, 1930, 1940, 1950, 1960, 1970, 1980, 1990]) { const l = E.label(T.sign(String(y), { bg: "#ffffff", fg: "#b8262e", size: 220, w: 768, h: 900, sub: "OCAK", subSize: 90 }), 0.8, 0.95, [HX - 0.6, 2.07, -3.94], { lit: false }); l.visible = false; R.cal[y] = l; }
  R.page = E.plane(0.8, 0.95, E.mat("#ffffff", { side: E.THREE.DoubleSide }), [0, -50, 0]);
  R.metro = makeMetronome(E);
  // ---- karakterler ----
  const farmer = { shirt: "#c84a3a", apron: "#3f5f8a", pants: "#3f5f8a", hat: "cap", hatCol: "#3f5f8a", hair: "short", skin: "#f0c9a4", belt: null };
  E.actor("old", { ...farmer, hairCol: "#e8e8e8", moustache: "#e8e8e8", seed: 41 });
  E.actor("young", { ...farmer, hairCol: "#7a4a2a", seed: 42 });
  E.actor("youngS", { ...farmer, hat: null, hairCol: "#7a4a2a", jacket: "#2b2633", tie: "#b8262e", seed: 42 });
  E.actor("bride", { dress: "#ffffff", shirt: "#ffffff", hair: "long", hairCol: "#8a5a30", skin: "#f6dcc0", seed: 43, hat: "crown", hatCol: "#f4efe4" });
  const kc = ["#e04848", "#3f7ad8", "#3fbf6a", "#f2c23a", "#b48cff", "#ff8a2a", "#2fb0b8", "#ff5fa8"];
  for (let i = 0; i < 8; i++) E.actor("k" + i, { build: "kid", shirt: kc[i], pants: "#3b3f52", hair: ["short", "long", "spiky", "bun"][i % 4], hairCol: ["#7a4a2a", "#3a2a20", "#c9a24a", "#5a3a22"][i % 4], skin: ["#f6dcc0", "#f0c9a4", "#e9c3a0"][i % 3], seed: 50 + i, dress: i % 2 ? kc[i] : null }, { h: 1.4 + (i % 3) * 0.12 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(42,24,12,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = ORANGE; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffe2b8"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = ORANGE, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#2a1408"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  hide(R.pig); hide(R.metro); hide(R.page);
  Object.values(R.cal).forEach((l) => (l.visible = false));
  R.pig.userData.head.rotation.set(0, 0, 0);
}
// hıçkırık: liste içindeki karelerde kısa sıçrama
function hicAt(f, list) { for (const h of list) { const d = f - h; if (d >= 0 && d < 9) return { d, k: Math.sin((Math.PI * d) / 9) }; } return null; }
const every = (a, b, step, off = 0) => { const o = []; for (let x = a + off; x < b; x += step) o.push(Math.round(x)); return o; };

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "golden", dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, 0], tint = "rgba(255,170,80,0.06)";
  reset();
  // hıçkıran karakter: zıplama + 'HIK!' balonu
  const hicActor = (id, seed, pos, list, o = {}, size = 0.42) => {
    const h = hicAt(f, list), jump = h ? 0.13 * h.k : 0;
    A.push({ id, pos: [pos[0], pos[1] + jump, pos[2]], st: st(seed, { face: h ? "shock" : o.face || "neutral", arms: h ? "shrug" : o.arms || "hang", ...o.st }), blob: true });
    if (h && h.d < 8) {
      FX.push({ kind: "burst", pos: [pos[0] + 0.5 * (o.side || 1), pos[1] + (o.hy || 2.25), pos[2] + 0.15], size: size * X.back(h.d / 4), opt: { col: "#fff3a8", text: "HIK!", size: 110 } });
      FX.push({ kind: "lines", pos: [pos[0] - 0.45 * (o.side || 1), pos[1] + 1.4, pos[2] + 0.1], size: 0.35, rot: Math.PI / 2 });
    }
    return h;
  };

  switch (sh.name) {
    case "hook": {
      hicActor("old", 41, [0, 0, 0], every(4, 92, 16), { face: "nervous" }, 0.55);
      cam = E.camAt(f, [{ f: 0, pos: [0.3, 1.3, 4.2], look: [0.1, 1.5, 0], fov: 46 }, { f: 91, pos: [0.25, 1.3, 3.6], look: [0.1, 1.5, 0], fov: 46 }]);
      ov.push(big("68 YIL", 1, f > WF(E, 7) - 3 ? "hıçkırık" : "", ORANGE, 190));
      break;
    }
    case "name": {
      hicActor("old", 41, [0, 0, 0], [100], { face: "smug", arms: "hip" }, 0.32);
      cam = E.camAt(f, [{ f: 92, pos: [0.25, 1.5, 2.4], look: [0.05, 1.65, 0], fov: 42 }, { f: 111, pos: [0.25, 1.5, 2.2], look: [0.05, 1.65, 0], fov: 42 }]);
      dof = { focus: [0, 1.5, 0], amount: 5 };
      ov.push(card("Charles Osborne", "çiftçi · ABD"));
      break;
    }
    case "pig": {
      const lift = X.smooth(X.span(f, WF(E, 17) - 6, WF(E, 17) + 14)), fall = X.easeIn(X.span(f, WF(E, 18) - 3, WF(E, 18) + 5));
      const strain = lift > 0.2 && fall === 0;
      A.push({ id: "young", pos: [-0.25 - 0.25 * fall, 0, 0], roll: 1.25 * fall, st: st(42, { face: fall > 0 ? "shock" : strain ? "determined" : "happy", arms: lift > 0 && fall < 0.5 ? "reach" : "hang", look: 0.5, sweat: strain }) });
      const py = fall > 0 ? X.lerp(0.75, 0, X.easeIn(X.span(f, WF(E, 18) - 3, WF(E, 18) + 2))) : 0.75 * lift + 0.04 * Math.sin(f * 1.2) * (strain ? 1 : 0);
      const px = fall > 0 ? 0.35 + 0.03 * Math.max(0, f - WF(E, 18) - 2) : 0.35;
      put(R.pig, px, py, 0.3, fall > 0 ? 0 : -0.4, 0.95);
      R.pig.userData.head.rotation.z = 0.15 * Math.sin(f / 5);
      if (f >= WF(E, 18) + 2) FX.push({ kind: "dust", t: X.span(f, WF(E, 18) + 2, WF(E, 18) + 16), pos: [-0.5, 0.25, 0.3], size: 0.8 });
      if (strain && f > WF(E, 17)) FX.push({ kind: "sweat", pos: [0.2, 2.05, 0.1], size: 0.18 });
      cam = E.camAt(f, [{ f: 112, pos: [0.4, 1.4, 4.4], look: [0.1, 1.35, 0], fov: 48 }, { f: 214, pos: [0.3, 1.3, 3.9], look: [0.0, 1.25, 0], fov: 48 }]);
      ov.push(big("1922", X.span(f, WF(E, 10) - 3, WF(E, 10) + 5), "bir domuz… ve bir düşüş", ORANGE, 160));
      break;
    }
    case "first": {
      const h1 = WF(E, 22) - 3;
      const h = hicAt(f, [h1, h1 + 30]);
      A.push({ id: "young", pos: [-0.2, h ? 0.08 * h.k : 0, 0], st: st(42, { face: h ? "shock" : f > h1 ? "think" : "nervous", arms: h ? "up" : "hang", legs: "sit", look: 0.3 }) });
      if (h && h.d < 8) FX.push({ kind: "lines", pos: [-0.65, 1.2, 0.1], size: 0.35, rot: Math.PI / 2 });
      put(R.pig, 1.0, 0, -0.6, -2.3, 0.9);
      R.pig.userData.head.rotation.z = 0.2 * Math.sin(f / 7);
      if (f > h1 + 4) FX.push({ kind: "question", pos: [1.0, 1.15, -0.5], size: 0.3 });
      cam = E.camAt(f, [{ f: 215, pos: [0.35, 1.2, 3.4], look: [0.25, 1.25, -0.2], fov: 46 }, { f: 281, pos: [0.3, 1.15, 3.0], look: [0.25, 1.2, -0.2], fov: 46 }]);
      ov.push(big("HIK!", X.span(f, h1, h1 + 4), "ilk hıçkırık", "#ffffff", 170));
      break;
    }
    case "calendar": {
      light = "interior"; tint = null;
      const years = [1922, 1925, 1930, 1940, 1950, 1960, 1970, 1980];
      const i = Math.min(years.length - 1, Math.floor((f - 282) / 3.5));
      R.cal[years[i]].visible = true;
      const pf = (f - 282) % 4; put(R.page, HX - 0.6 + 0.18 * pf, 2.07 - 0.25 * pf, -3.88 + 0.08 * pf, 0, 0.55); R.page.rotation.set(0.2 * pf, 0.3 * pf, 0.6 * pf);
      hicActor("young", 42, [HX + 0.45, 0, -3.3], every(284, 310, 9), { face: "nervous" }, 0.36);
      cam = E.camAt(f, [{ f: 282, pos: [HX - 0.1, 1.6, -0.4], look: [HX - 0.15, 1.75, -3.9], fov: 46 }, { f: 309, pos: [HX - 0.1, 1.6, -0.8], look: [HX - 0.15, 1.75, -3.9], fov: 46 }]);
      ov.push(big("DURMADI", X.span(f, WF(E, 25) - 3, WF(E, 25) + 3), "", ORANGE, 160));
      break;
    }
    case "metro": {
      light = "interior"; tint = null;
      const per = 45, h0 = 314, hl = every(h0, 399, per);
      put(R.metro, HX + 0.55, 0.9, -0.6, -0.2);
      const ph = ((f - h0) / per) * Math.PI;
      R.metro.userData.rod.rotation.z = 0.45 * Math.cos(ph);
      hicActor("young", 42, [HX - 0.35, 0, -0.9], hl, { face: "nervous", st: { look: 0.6 } }, 0.38);
      cam = E.camAt(f, [{ f: 310, pos: [HX + 0.15, 1.45, 3.4], look: [HX + 0.05, 1.4, -0.8], fov: 46 }, { f: 398, pos: [HX + 0.15, 1.4, 3.0], look: [HX + 0.05, 1.4, -0.8], fov: 46 }]);
      ov.push(big("dakikada 40", X.span(f, WF(E, 28) - 3, WF(E, 28) + 5), "hık · hık · hık", ORANGE, 130));
      break;
    }
    case "family": {
      const kids = WF(E, 38) - 3, wed2 = WF(E, 34) - 2;
      const hl = every(404, 506, 23);
      if (f < kids) {
        hicActor("youngS", 42, [-0.4, 0, 0], hl, { face: "happy", arms: "hang", side: -1 }, 0.34);
        A.push({ id: "bride", pos: [0.45, 0, 0.05], st: st(43, { face: "happy", arms: "hold", look: -0.6 }) });
        FX.push({ kind: "hearts", t: ((f - 399) % 40) / 40, pos: [0.05, 2.4, 0.2], size: 0.6 });
      } else {
        hicActor("old", 41, [0, 0, -0.9], hl, { face: "grin", arms: "hip" }, 0.36);
        for (let i = 0; i < 8; i++) {
          const born = kids + i * 4; if (f < born) continue;
          const s = X.back(X.span(f, born, born + 6)), x = (i % 2 ? 1 : -1) * (0.55 + Math.floor(i / 2) * 0.42), z = -0.3 + (Math.floor(i / 2) % 2) * 0.25;
          const kh = hicAt(f, [born + 10 + i * 3, born + 40 + i * 2]);
          A.push({ id: "k" + i, pos: [x, kh ? 0.06 * kh.k : 0, z], scale: Math.max(0.01, s), st: st(50 + i, { face: kh ? "shock" : "grin", arms: kh ? "shrug" : i % 3 ? "wave" : "cheer", phase: f / 30 + i * 0.2, look: -Math.sign(x) * 0.4 }) });
          if (kh && kh.d < 6) FX.push({ kind: "burst", pos: [x + 0.22, 1.7, z + 0.1], size: 0.22, opt: { col: "#fff3a8", text: "hık", size: 120 } });
        }
      }
      cam = f < kids ? E.camAt(f, [{ f: 399, pos: [0.05, 1.4, 4.0], look: [0, 1.45, 0], fov: 46 }, { f: kids, pos: [0.05, 1.4, 3.6], look: [0, 1.45, 0], fov: 46 }])
        : E.camAt(f, [{ f: kids, pos: [0.0, 1.6, 5.6], look: [0, 1.35, -0.3], fov: 50 }, { f: 505, pos: [0.0, 1.55, 5.1], look: [0, 1.35, -0.3], fov: 50 }]);
      if (f < kids) ov.push(big("2 evlilik", X.span(f, wed2, wed2 + 6), "", PINK, 140));
      else ov.push(big("8 çocuk", X.span(f, kids, kids + 6), "", ORANGE, 150));
      break;
    }
    case "count": {
      hicActor("old", 41, [0, 0, 0], every(510, 642, 11), { face: "nervous" }, 0.34);
      cam = E.camAt(f, [{ f: 506, pos: [0.2, 1.3, 4.6], look: [0.1, 1.6, 0], fov: 48 }, { f: 641, pos: [0.15, 1.3, 3.9], look: [0.1, 1.6, 0], fov: 48 }]);
      const p = X.easeOut(X.span(f, 510, WF(E, 50) + 4)), n = Math.round(430000000 * p);
      const txt = n.toLocaleString("tr-TR");
      ov.push(big(txt, 1, f > WF(E, 50) ? "≈ 430 milyon hıçkırık" : "hıçkırık", ORANGE, 115));
      break;
    }
    case "silence": {
      light = "interior"; tint = null;
      A.push({ id: "old", pos: [HX - 0.2, 0, -0.6], st: st(41, { face: f > WF(E, 58) ? "wow" : "think", arms: f > WF(E, 58) ? "shrug" : "chin", look: 0.5 }) });
      if (f > WF(E, 57)) FX.push({ kind: "question", pos: [HX + 0.4, 2.45, -0.5], size: 0.35 + 0.03 * Math.sin(f / 5) });
      R.cal[1990].visible = true;
      cam = E.camAt(f, [{ f: 642, pos: [HX + 0.4, 1.4, 3.6], look: [HX - 0.2, 1.65, -1.0], fov: 46 }, { f: 750, pos: [HX + 0.35, 1.4, 3.1], look: [HX - 0.2, 1.65, -1.0], fov: 46 }]);
      ov.push(big("1990", X.span(f, WF(E, 53) - 3, WF(E, 53) + 5), f > WF(E, 58) - 3 ? "…sessizlik" : "", "#ffffff", 160));
      break;
    }
    case "chair": {
      light = ["interior", "golden", 0.55]; tint = "rgba(255,200,140,0.10)";
      cam = E.camAt(f, [{ f: 751, pos: [HX + 1.2, 1.35, 1.6], look: [HX + 0.9, 0.95, -1.6], fov: 44 }, { f: 823, pos: [HX + 1.15, 1.3, 1.2], look: [HX + 0.9, 0.95, -1.6], fov: 44 }], { creep: 0.05 });
      dof = { focus: [HX + 1.0, 0.8, -1.6], amount: 4 };
      R.chair.rotation.x = 0.05 * Math.sin(f / 20);
      ov.push(big("1991", X.span(f, WF(E, 61) - 3, WF(E, 61) + 8) * 0.9, "", CREAM, 130));
      break;
    }
    case "end": {
      A.push({ id: "young", pos: [-0.35, 0, 0], st: st(42, { face: "grin", arms: "wave", phase: f / 30, look: 0.3 }) });
      put(R.pig, 0.45, 0.02 * Math.abs(Math.sin(f / 5)), 0.15, -0.6, 0.85);
      R.pig.userData.head.rotation.z = 0.1 * Math.sin(f / 6);
      FX.push({ kind: "hearts", t: ((f - 824) % 40) / 40, pos: [0.05, 2.35, 0.2], size: 0.55 });
      cam = E.camAt(f, [{ f: 824, pos: [0.1, 1.35, 4.0], look: [0.05, 1.45, 0], fov: 46 }, { f: 921, pos: [0.1, 1.35, 3.6], look: [0.05, 1.45, 0], fov: 46 }]);
      ov.push(big("Tuhaf ama gerçek.", X.span(f, 826, 834), f >= WF(E, 69) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
