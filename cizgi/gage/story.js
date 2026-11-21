// Fineas Geyç (Phineas Gage) — PMDARWIN deneme (41 sn, dfki sesi)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [93, "stand"], [154, "site"], [206, "gage"], [280, "crew"], [334, "tamp"], [431, "blast"], [483, "through"],
  [539, "calm"], [595, "cart"], [719, "friends"], [811, "notgage"], [847, "polite"], [878, "angry"], [965, "doctor"], [1006, "brain"],
  [1093, "museum"], [1149, "case"]];
const END = 1240;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { i, name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };

const RX = 100, IX = -200, DX = -320, MX = 300; // yol, ev içi, doktor odası, müze
const HEAD = 1.22; // kart kafasının merkez yüksekliği (m)
let R = {};

function rod(E, len = 1.05) {
  const g = E.group(null, [0, 0, 0]);
  E.cyl(0.024, 0.024, len, E.mat("#4a4f5a", { map: E.T.metal("#4a4f5a") }), [0, -len / 2, 0], { parent: g, seg: 10 });
  return g;
}

export function build(E) {
  const { S, T } = E;
  // ---- şantiye (x=0) ----
  E.ground(T.dirt("#b08a5a"), 400, 0.25);
  for (let x = -60; x <= 60; x += 1.2) E.box(0.25, 0.12, 2.4, E.mat("#6b4428", { map: T.wood("#6b4428") }), [x, 0, -6]);
  for (const z of [-6.7, -5.3]) E.box(122, 0.12, 0.1, E.mat("#8a8f9a"), [0, 0.12, z]);
  const rockM = E.mat("#9a9488", { map: T.stone("#9a9488") });
  R.rock = E.sphere(1.3, rockM, [0.9, 0.2, -2.2], { seg: 9 }); R.rock.scale.set(1.3, 0.75, 1.0);
  E.cyl(0.06, 0.06, 0.04, E.mat("#1a1410"), [0.55, 1.15, -1.75], { seg: 12 });
  for (const [x, z, s] of [[-4, -3, 0.8], [4.5, -3.5, 1.1], [-7, -1.5, 0.6], [7, -0.8, 0.7]]) { const r = E.sphere(s, rockM, [x, 0, z], { seg: 8 }); r.scale.y = 0.7; }
  for (const [x, z] of [[-9, -14], [-4, -16], [6, -15], [11, -13]]) S.tree(x, z, { type: "pine", s: 1.4 });
  S.crate(-2.2, -0.6, 0.6); S.barrel(-2.9, -0.2, 0.8); S.sack(3.0, 0.3, 0.8, "BARUT");
  S.hills({ z: -70, col: "#7fa05f" }); S.mountains({ z: -150 }); S.clouds({ n: 6, z: -110, y: 40 });
  R.rod = rod(E); R.rodLow = rod(E, 0.55); R.rodHigh = rod(E, 0.55);
  // ---- köy yolu (x=RX) ----
  E.box(160, 0.04, 4, E.mat("#c9a978", { map: T.dirt("#c9a978") }), [RX, -0.02, 0]);
  S.row(RX - 40, RX + 40, -14, { seed: 6 });
  for (const x of [-12, -5, 6, 13]) S.tree(RX + x, -6, { type: "round", s: 1.1 });
  S.fence(RX - 20, RX + 20, -3.2);
  R.cart = E.group(null, [RX, 0, 0]);
  const wm = E.mat("#8a5a36", { map: T.planks("#8a5a36") });
  E.box(1.9, 0.12, 1.2, wm, [0, 0.62, 0], { parent: R.cart }); E.box(1.9, 0.35, 0.06, wm, [0, 0.68, 0.6], { parent: R.cart }); E.box(1.9, 0.35, 0.06, wm, [0, 0.68, -0.6], { parent: R.cart });
  R.wheels = [];
  for (const z of [0.68, -0.68]) { const w = E.cyl(0.42, 0.42, 0.08, E.mat("#5a3a22"), [0, 0, 0], { parent: R.cart, seg: 14 }); w.rotation.x = Math.PI / 2; w.position.set(-0.2, 0.42, z); R.wheels.push(w); }
  R.ox = E.group(R.cart, [2.0, 0, 0]);
  const om = E.mat("#7a4a2a");
  const ob = E.sphere(0.5, om, [0, 0.95, 0], { parent: R.ox, seg: 14 }); ob.scale.set(1.6, 0.8, 0.85);
  E.sphere(0.22, E.mat("#efe6d2"), [-0.2, 1.0, 0.36], { parent: R.ox, seg: 10 }).scale.set(1.6, 1, 0.4);
  const head = E.group(R.ox, [0.95, 1.05, 0]);
  E.sphere(0.27, om, [0, 0, 0], { parent: head, seg: 12 }).scale.set(1.1, 1, 0.95);
  E.sphere(0.16, E.mat("#e8b9a0"), [0.24, -0.1, 0], { parent: head, seg: 10 }).scale.set(0.9, 0.8, 1.2);
  for (const z of [0.13, -0.13]) { E.sphere(0.05, E.mat("#ffffff"), [0.16, 0.08, z], { parent: head, seg: 8 }); E.sphere(0.028, E.mat("#120a06"), [0.2, 0.08, z], { parent: head, seg: 6 }); }
  for (const z of [1, -1]) { const h = E.cone(0.05, 0.32, E.mat("#efe6d2"), [0, 0.2, z * 0.18], { parent: head, seg: 6 }); h.rotation.x = -z * 0.9; const ear = E.sphere(0.07, om, [-0.05, 0.08, z * 0.27], { parent: head, seg: 6 }); ear.scale.set(0.6, 0.5, 1.4); }
  const tail = E.cyl(0.025, 0.025, 0.5, om, [-0.8, 0.55, 0], { parent: R.ox, seg: 6 }); tail.rotation.z = 0.25;
  R.oxLegs = []; for (const [x, z] of [[-0.55, 0.25], [-0.55, -0.25], [0.55, 0.25], [0.55, -0.25]]) R.oxLegs.push(E.box(0.16, 0.72, 0.16, om, [x, 0, z], { parent: R.ox }));
  E.box(0.08, 0.08, 1.4, E.mat("#5a3a22"), [1.05, 0.7, 0], { parent: R.cart });
  // ---- ev içi (x=IX) ----
  S.room({ x: IX, w: 8, d: 6, h: 3.4, wall: T.wallpaper("#d9b98a", "#c9a676", "stripe"), floor: T.planks("#8a5a36"), window: true, door: true });
  S.table(IX, -1.0, { w: 1.6, d: 0.9 }); S.hangLamp(IX, 3.4, -1.0, {}); S.shelf(IX + 3, -2.7, {});
  // ---- doktor odası (x=DX) ----
  S.room({ x: DX, w: 8, d: 6, h: 3.4, wall: T.wallpaper("#5a6e6a", "#4e605c", "diamond"), floor: T.planks("#6b4428"), window: true, door: false, night: true });
  S.desk(DX + 0.6, -1.6, {}); S.shelf(DX - 2.6, -2.7, {}); S.hangLamp(DX + 0.6, 3.4, -1.4, {});
  R.brain = E.group(null, [DX + 0.6, 1.0, -1.6]);
  const bm = E.mat("#e9a3b8"); const b1 = E.sphere(0.36, bm, [0, 0.3, 0], { parent: R.brain, seg: 18 }); b1.scale.set(1.25, 0.85, 1);
  R.front = E.sphere(0.24, E.mat("#ff6a8a", { emissive: "#ff3b6a", glow: 1.2 }), [0.32, 0.36, 0.12], { parent: R.brain, seg: 16 }); R.front.scale.set(1, 0.8, 1);
  E.cyl(0.08, 0.1, 0.3, E.mat("#d98aa0"), [-0.05, 0, 0], { parent: R.brain, seg: 10 });
  // ---- müze (x=MX) ----
  S.room({ x: MX, w: 10, d: 8, h: 4, wall: T.wallpaper("#3a3f52", "#33384a", "stripe"), floor: T.marble("#d9d4c8"), window: false, door: false });
  E.box(1.4, 1.0, 1.0, E.mat("#2b2633", { map: T.wood("#3a2a20") }), [MX, 0, -2]);
  R.glass = E.box(1.3, 1.1, 0.9, E.mat("#cfe8ff", { transparent: true, opacity: 0.18 }), [MX, 1.0, -2]); R.glass.userData.noink = true; R.glass.castShadow = false;
  const skull = E.group(null, [MX - 0.35, 1.0, -2]);
  const sk = E.sphere(0.22, E.mat("#efe6d2"), [0, 0.2, 0], { parent: skull, seg: 18 }); sk.scale.set(1, 1.05, 1.15);
  E.box(0.24, 0.12, 0.2, E.mat("#efe6d2"), [0, 0.02, 0.06], { parent: skull });
  for (const x of [-0.08, 0.08]) E.sphere(0.05, E.mat("#2b2633"), [x, 0.2, 0.2], { parent: skull, seg: 8 });
  const r2 = rod(E, 1.05); r2.position.set(MX + 0.08, 2.02, -2.05); r2.rotation.set(0, 0, 0.5);
  E.label(T.sign("PHINEAS GAGE · 1848", { bg: "#c9a24a", fg: "#2b2633", border: "#7a5a1a", size: 120 }), 1.1, 0.22, [MX, 1.02, -1.48]);
  for (const x of [-3, 3]) S.frame(MX + x, 2.3, -3.95, { w: 1.4, h: 1.0, kind: "portrait" });
  S.hangLamp(MX, 4, -2, {});
  // ---- karakterler ----
  const g = { skin: "#f2d2b0", shirt: "#e8dcc4", pants: "#4a3b2a", belt: "#3a2a20", hair: "short", hairCol: "#3a2a20", seed: 11 };
  E.actor("gage", g); E.actor("gageH", { ...g, hat: "cap", hatCol: "#6b5a44" });
  E.actor("gageA", { ...g, shirt: "#8a3a3a" });
  E.actor("w1", { shirt: "#5d6b7a", pants: "#3b3f52", hat: "cap", hatCol: "#4a4f5a", moustache: "#2a1d16", seed: 21, skin: "#e9c3a0" });
  E.actor("w2", { shirt: "#b5653f", pants: "#3b3f52", hat: "bowler", seed: 25, skin: "#f6dcc0", beard: "#5a3a22" });
  E.actor("f1", { dress: "#5d7a3a", shirt: "#5d7a3a", hair: "bun", hairCol: "#7a4a2a", seed: 31, skin: "#f6dcc0" });
  E.actor("f2", { shirt: "#3f6fb5", jacket: "#2b2633", hat: "bowler", moustache: "#3a2a20", seed: 35, skin: "#e9c3a0" });
  E.actor("doc", { shirt: "#f4f1ea", jacket: "#2b2633", tie: "#8a2a3a", hair: "part", hairCol: "#5a4a3a", beard: "#5a4a3a", glasses: true, seed: 41, skin: "#f6dcc0" });
  for (let i = 0; i < 4; i++) E.actor("v" + i, { shirt: ["#3f6fb5", "#c2843a", "#7b5ac9", "#3f8a6a"][i], dress: i === 1 ? "#c2843a" : null, hair: i === 1 ? "long" : "short", hairCol: ["#2a1d16", "#7a4a2a", "#c9a24a", "#2a1d16"][i], glasses: i === 2, seed: 60 + i * 7, skin: ["#fbf5ea", "#e9c3a0", "#f6dcc0", "#c98f66"][i] });
}

const card = (title, sub) => (g, w, h) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(20,14,24,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = "#ff3b5c"; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#ffcf4a"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "") => (g, w, h) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${150 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#2b1a10"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = "#ffcf4a"; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

function rodThrough(x, z) {
  // çubuk his sol yanağının altından girip kafanın tepesinden çıkıyor: yüz açık kalsın diye iki parça
  R.rodLow.visible = R.rodHigh.visible = true;
  const t = 0.12, L = 0.55, jx = x + 0.1, jy = HEAD - 0.29, bx = x + 0.04, by = HEAD + 0.29;
  R.rodLow.position.set(jx, jy, z + 0.06); R.rodLow.rotation.set(0, 0, t);
  R.rodHigh.position.set(bx - L * Math.sin(t), by + L * Math.cos(t), z + 0.02); R.rodHigh.rotation.set(0, 0, t);
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "day", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = null;
  const flashIn = (f0, n = 6) => Math.max(0, 1 - Math.abs(f - f0) / n);
  R.rod.visible = false; R.rodLow.visible = R.rodHigh.visible = false; R.front.scale.set(1, 0.8, 1);
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };

  switch (sh.name) {
    case "hook": {
      light = "dramatic";
      A.push({ id: "gage", pos: [0, 0, 0], st: st(1, { face: f < 50 ? "nervous" : "grin", arms: "shrug", look: 0.2, sweat: true }) });
      rodThrough(0, 0.05);
      cam = E.camAt(f, [{ f: 0, pos: [0.05, 1.6, 2.9], look: [0.05, 1.55, 0], fov: 40 }, { f: 92, pos: [0.05, 1.6, 2.4], look: [0.05, 1.6, 0], fov: 38 }]);
      dof = { focus: [0, 1.6, 0], amount: 10 };
      FX.push({ kind: "stars", pos: [-0.35, 2.55, 0.1], size: 0.8, t: t / 30 });
      break;
    }
    case "stand": {
      const up = X.easeOut(X.span(f, 96, 120));
      A.push({ id: "gage", pos: [0, 0, 0], roll: (1 - up) * 1.35, st: st(1, { face: "happy", arms: up < 1 ? "hang" : "wave", talk: f > 122 ? E.talk(f, 122, 152) : 0, look: 0.6 }) });
      A.push({ id: "w1", pos: [1.3, 0, -0.8], st: st(2, { face: "shock", arms: "up", look: -0.8 }) });
      A.push({ id: "w2", pos: [-1.2, 0, -1.0], st: st(3, { face: "scared", arms: "facepalm", look: 0.8, sweat: true }) });
      if (f > 118) FX.push({ kind: "exclaim", pos: [1.4, 2.9, -0.7], size: 0.6 * X.back(X.span(f, 118, 126)) });
      cam = E.camAt(f, [{ f: 93, pos: [0, 1.9, 4.2], look: [0, 1.2, -0.4], fov: 44 }, { f: 153, pos: [0.2, 1.8, 3.6], look: [0, 1.4, -0.4], fov: 42 }]);
      dof = { focus: [0, 1.4, 0], amount: 5 }; focusPt = [0, 0, 0];
      FX.push({ kind: "dust", pos: [0, 0.4, 0.2], size: 1.2, t: X.span(f, 93, 125) });
      break;
    }
    case "site": {
      cam = E.camAt(f, [{ f: 154, pos: [-6, 4.5, 9], look: [0, 1.0, -4], fov: 50 }, { f: 205, pos: [-3.5, 3.6, 7.5], look: [0.5, 1.2, -3], fov: 48 }]);
      A.push({ id: "w1", pos: [-1.8, 0, -1.2], st: st(2, { face: "determined", arms: "hold", legs: "walk", phase: t / 24 }) });
      A.push({ id: "w2", pos: [3.2, 0, -1.6], st: st(3, { face: "neutral", arms: "hip" }) });
      A.push({ id: "gageH", pos: [0.2, 0, -0.6], st: st(1, { face: "smug", arms: "point", look: 0.6 }) });
      overlay = big("1848", X.span(f, 154, 162), "Vermont, ABD");
      focusPt = [0, 0, -2];
      break;
    }
    case "gage": {
      A.push({ id: "gageH", pos: [0, 0, 0], st: st(1, { face: "smug", arms: "hip", look: -0.2 }) });
      A.push({ id: "w1", pos: [1.6, 0, -2.4], st: st(2, { face: "neutral", arms: "hold" }) });
      cam = E.camAt(f, [{ f: 206, pos: [-0.3, 1.75, 3.4], look: [0, 1.5, 0], fov: 42 }, { f: 279, pos: [-0.2, 1.75, 2.8], look: [0, 1.55, 0], fov: 40 }]);
      dof = { focus: [0, 1.5, 0], amount: 9 };
      overlay = card("Phineas Gage", "25 yaşında demiryolu ustabaşı");
      break;
    }
    case "crew": {
      R.rod.visible = true; R.rod.position.set(-1.4, 1.6, 0.2); R.rod.rotation.set(0, 0, 0.1);
      A.push({ id: "w1", pos: [-1.6, 0, 0], st: st(2, { face: "determined", arms: "hold", bob: 10 * Math.abs(Math.sin(f / 4)) }) });
      A.push({ id: "w2", pos: [-0.2, 0, -1.0], st: st(3, { face: "talk", arms: "count", talk: E.talk(f) }) });
      A.push({ id: "gageH", pos: [1.3, 0, -0.4], st: st(1, { face: "smug", arms: "point", look: -0.9 }) });
      cam = E.camAt(f, [{ f: 280, pos: [2.8, 2.4, 4.0], look: [0, 1.2, -0.5], fov: 46 }, { f: 333, pos: [1.6, 2.2, 3.6], look: [-0.3, 1.2, -0.5], fov: 44 }]);
      dof = { focus: [0, 1.2, -0.3], amount: 4 }; focusPt = [0, 0, -0.3];
      FX.push({ kind: "dust", pos: [-1.4, 0.3, 0.3], size: 0.8, t: (t % 15) / 15 });
      break;
    }
    case "tamp": {
      light = "golden";
      const bob = 0.18 * Math.abs(Math.sin(t / 5));
      R.rod.visible = true; R.rod.position.set(0.55, 2.2 + bob, -1.75); R.rod.rotation.set(0, 0, 0);
      A.push({ id: "gageH", pos: [0.05, 0, -1.35], st: st(1, { face: f > 400 ? "shock" : "determined", arms: [[-30, 150], [-25, 150]], look: 0.7 }) });
      cam = E.camAt(f, [{ f: 334, pos: [1.6, 1.6, 1.3], look: [0.5, 1.2, -1.7], fov: 42 }, { f: 430, pos: [1.2, 1.4, 0.6], look: [0.55, 1.2, -1.75], fov: 38 }]);
      dof = { focus: [0.55, 1.2, -1.75], amount: 8 };
      if (f > 398) { FX.push({ kind: "sparkle", pos: [0.6, 1.25, -1.6], size: 0.5 + 0.5 * X.span(f, 398, 430), t: t / 10 }); shake(398, 0.015, 30); }
      break;
    }
    case "blast": {
      light = "dramatic";
      flash = flashIn(431, 6);
      const p = X.easeOut(X.span(f, 431, 470));
      R.rod.visible = true; R.rod.position.set(0.55, 2.3 + 14 * p, -1.75); R.rod.rotation.set(0, 0, 0.3 + 6 * p);
      A.push({ id: "gageH", pos: [0.05, 0, -1.35], roll: 0.9 * X.easeOut(X.span(f, 436, 460)), st: st(1, { face: "shock", arms: "up" }) });
      FX.push({ kind: "burst", pos: [0.55, 2.5, -1.4], size: 1.8 * X.back(X.span(f, 431, 440)), t: X.span(f, 431, 470), opt: { text: "BUM!" } });
      FX.push({ kind: "puff", pos: [0.3, 1.0, -1.2], size: 2.2, t: X.span(f, 431, 482) });
      cam = E.camAt(f, [{ f: 431, pos: [0.4, 2.0, 4.2], look: [0.4, 2.2, -1.5], fov: 48 }, { f: 482, pos: [0.3, 2.4, 4.8], look: [0.4, 3.4, -1.5], fov: 50 }]);
      shake(431, 0.12, 20); focusPt = [0.3, 0, -1.4];
      break;
    }
    case "through": {
      light = "dramatic";
      A.push({ id: "gage", pos: [0, 0, 0], st: st(1, { face: "wow", arms: "hang", look: 0 }) });
      rodThrough(0, 0.05);
      FX.push({ kind: "lines", pos: [0.45, 2.6, 0.2], size: 0.9, t: X.span(f, 483, 538) });
      cam = E.camAt(f, [{ f: 483, pos: [0, 1.7, 2.4], look: [0, 1.65, 0], fov: 40 }, { f: 538, pos: [0.15, 1.65, 2.8], look: [0.05, 1.6, 0], fov: 40 }]);
      dof = { focus: [0, 1.7, 0], amount: 11 };
      flash = flashIn(483, 3) * 0.5;
      break;
    }
    case "calm": {
      A.push({ id: "gage", pos: [-0.3, 0, 0], st: st(1, { face: "smug", arms: "shrug", talk: E.talk(f, 545, 590), look: 0.6 }) });
      A.push({ id: "w1", pos: [0.9, 0, -0.6], st: st(2, { face: "shock", arms: "facepalm", look: -0.8, sweat: true }) });
      FX.push({ kind: "question", pos: [1.1, 2.85, -0.5], size: 0.55 * X.back(X.span(f, 548, 556)) });
      cam = E.camAt(f, [{ f: 539, pos: [0.3, 1.75, 3.6], look: [0.3, 1.5, -0.3], fov: 42 }, { f: 594, pos: [0.3, 1.7, 3.1], look: [0.3, 1.5, -0.3], fov: 40 }]);
      dof = { focus: [0.3, 1.5, -0.2], amount: 6 };
      break;
    }
    case "cart": {
      light = "golden";
      const x = X.keyed(f, [[595, -3.5], [718, 2.0]], (v) => v);
      R.cart.position.set(RX + x, 0, 0);
      R.wheels.forEach((w) => (w.rotation.y = -(x + 3.5) / 0.42));
      R.oxLegs.forEach((l, i) => (l.rotation.z = 0.35 * Math.sin(f / 4 + (i % 2) * Math.PI)));
      A.push({ id: "gage", pos: [RX + x - 0.2, 0.62, 0.05], st: st(1, { legs: "sit", face: "happy", arms: "wave", talk: E.talk(f), look: 0.5 }) });
      cam = { pos: [RX + x + 1.6, 2.8, 8.6], look: [RX + x + 1.1, 1.0, 0], fov: 50, roll: 0 };
      dof = { focus: [RX + x, 1.3, 0], amount: 6 }; focusPt = [RX + x, 0, 0];
      FX.push({ kind: "dust", pos: [RX + x - 0.9, 0.2, 0.3], size: 0.8, t: (t % 20) / 20 });
      break;
    }
    case "friends": {
      light = "interior";
      flash = flashIn(719, 6);
      A.push({ id: "f1", pos: [IX - 0.7, 0, -1.6], st: st(4, { face: "sad", arms: "chin", look: 0.6 }) });
      A.push({ id: "f2", pos: [IX + 0.7, 0, -1.6], st: st(5, { face: "nervous", arms: "whisper", talk: E.talk(f, 740, 805), look: -0.6 }) });
      cam = E.camAt(f, [{ f: 719, pos: [IX, 1.9, 2.6], look: [IX, 1.5, -1.4], fov: 44 }, { f: 810, pos: [IX, 1.85, 1.8], look: [IX, 1.55, -1.4], fov: 42 }]);
      dof = { focus: [IX, 1.5, -1.6], amount: 6 }; focusPt = [IX, 0, -1.4];
      overlay = big("Aylar sonra", Math.min(X.span(f, 721, 728), 1 - X.span(f, 770, 780)));
      break;
    }
    case "notgage": {
      light = "interior";
      A.push({ id: "f2", pos: [IX + 0.3, 0, -1.2], st: st(5, { face: "shock", arms: "point", talk: E.talk(f), look: -0.9 }) });
      A.push({ id: "gageA", pos: [IX - 1.6, 0, -2.6], st: st(1, { face: "angry", arms: "cross" }) });
      FX.push({ kind: "question", pos: [IX - 1.4, 3.0, -2.5], size: 0.6 });
      cam = E.camAt(f, [{ f: 811, pos: [IX + 0.6, 1.75, 1.0], look: [IX + 0.2, 1.75, -1.2], fov: 40 }, { f: 846, pos: [IX + 0.6, 1.75, 0.7], look: [IX + 0.2, 1.75, -1.2], fov: 38 }]);
      dof = { focus: [IX + 0.3, 1.7, -1.2], amount: 10 };
      break;
    }
    case "polite": {
      light = "golden";
      A.push({ id: "gageH", pos: [0, 0, 0], st: st(1, { face: "happy", arms: "wave", look: 0.5, blush: true }) });
      A.push({ id: "w1", pos: [1.1, 0, -0.6], st: st(2, { face: "happy", arms: "present", look: -0.6 }) });
      FX.push({ kind: "hearts", pos: [0.3, 2.9, 0.1], size: 0.6, t: t / 30 });
      cam = E.camAt(f, [{ f: 847, pos: [0.5, 1.8, 3.2], look: [0.4, 1.5, -0.3], fov: 42 }, { f: 877, pos: [0.5, 1.8, 3.0], look: [0.4, 1.5, -0.3], fov: 42 }]);
      dof = { focus: [0.3, 1.5, -0.2], amount: 6 };
      break;
    }
    case "angry": {
      light = "dramatic";
      A.push({ id: "gageA", pos: [IX, 0, -1.0], st: st(1, { face: "angry", arms: f % 30 < 15 ? "point" : "cross", talk: E.talk(f), look: 0.7 }) });
      A.push({ id: "f1", pos: [IX + 1.2, 0, -1.8], st: st(4, { face: "scared", arms: "up", look: -0.8, sweat: true }) });
      A.push({ id: "f2", pos: [IX - 1.2, 0, -2.0], st: st(5, { face: "scared", arms: "facepalm", look: 0.8 }) });
      FX.push({ kind: "anger", pos: [IX + 0.35, 2.9, -0.9], size: 0.6, t: t / 15 });
      cam = E.camAt(f, [{ f: 878, pos: [IX, 1.5, 2.6], look: [IX, 1.7, -1.0], fov: 44 }, { f: 964, pos: [IX, 1.45, 1.9], look: [IX, 1.75, -1.0], fov: 42 }]);
      shake(880, 0.04, 10);
      dof = { focus: [IX, 1.6, -1.0], amount: 6 }; focusPt = [IX, 0, -1.2];
      break;
    }
    case "doctor": {
      light = "night";
      A.push({ id: "doc", pos: [DX + 1.3, 0, -0.8], st: st(6, { face: "think", arms: "chin", prop: { kind: "magnifier", hand: "r" }, look: -0.8 }) });
      A.push({ id: "gageA", pos: [DX - 0.2, 0, -1.0], st: st(1, { face: "angry", arms: "cross", look: 0.8 }) });
      FX.push({ kind: "idea", pos: [DX + 1.45, 3.0, -0.7], size: 0.6 * X.back(X.span(f, 985, 995)) });
      cam = E.camAt(f, [{ f: 965, pos: [DX + 0.6, 1.8, 2.8], look: [DX + 0.6, 1.5, -1.0], fov: 44 }, { f: 1005, pos: [DX + 0.6, 1.8, 2.4], look: [DX + 0.6, 1.5, -1.0], fov: 42 }]);
      dof = { focus: [DX + 0.6, 1.5, -0.9], amount: 6 }; focusPt = [DX + 0.6, 0, -1];
      overlay = card("Dr. John Harlow", "Gage'in doktoru");
      break;
    }
    case "brain": {
      light = "night";
      R.brain.rotation.y = 0.3 + 0.004 * t;
      const s = 1 + 0.12 * Math.abs(Math.sin(t / 7)); R.front.scale.set(s, 0.8 * s, s);
      A.push({ id: "doc", pos: [DX + 1.6, 0, -1.3], st: st(6, { face: "wow", arms: "point", look: -0.9 }) });
      FX.push({ kind: "sparkle", pos: [DX + 0.95, 1.55, -1.4], size: 0.6, t: t / 30 });
      cam = E.camAt(f, [{ f: 1006, pos: [DX + 1.1, 1.9, 2.4], look: [DX + 0.9, 1.4, -1.6], fov: 42 }, { f: 1092, pos: [DX + 1.05, 1.8, 1.8], look: [DX + 0.9, 1.4, -1.6], fov: 40 }]);
      dof = { focus: [DX + 0.7, 1.35, -1.6], amount: 10 };
      overlay = big("Ön lob", X.span(f, 1012, 1020), "kişiliğimizin yaşadığı yer");
      break;
    }
    case "museum": {
      light = "interior";
      flash = flashIn(1093, 6);
      for (let i = 0; i < 4; i++) A.push({ id: "v" + i, pos: [MX - 1.9 + i * 1.25, 0, -0.6 + (i % 2) * 0.5], yaw: Math.PI, st: st(20 + i, { face: ["wow", "think", "shock", "wow"][i], arms: ["point", "chin", "up", "hang"][i] }) });
      cam = E.camAt(f, [{ f: 1093, pos: [MX + 0.4, 2.6, 4.6], look: [MX, 1.3, -2], fov: 48 }, { f: 1148, pos: [MX + 0.3, 2.3, 3.6], look: [MX, 1.3, -2], fov: 46 }]);
      dof = { focus: [MX, 1.3, -1.6], amount: 4 }; focusPt = [MX, 0, -1.5];
      break;
    }
    case "case": {
      light = "interior";
      cam = E.camAt(f, [{ f: 1149, pos: [MX + 0.05, 1.7, 1.9], look: [MX, 1.45, -2], fov: 42 }, { f: 1236, pos: [MX + 0.05, 1.65, 1.3], look: [MX, 1.45, -2], fov: 40 }]);
      FX.push({ kind: "sparkle", pos: [MX - 0.6, 2.0, -1.5], size: 0.3, t: t / 30 }, { kind: "sparkle", pos: [MX + 0.6, 1.9, -1.5], size: 0.3, t: t / 30 + 0.5 });
      dof = { focus: [MX, 1.25, -2], amount: 8 };
      overlay = card("Harvard · Warren Anatomi Müzesi", "kafatası ve çubuk, yan yana");
      break;
    }
  }
  return { cam, light, dof, actors: A, fx: FX, flash, overlay, focusPt };
}
