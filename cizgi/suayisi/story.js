// Su Ayısı — PMDARWIN (~31 sn, 932 kare)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [116, "name"], [149, "size"], [216, "sat"], [369, "tray"], [494, "wake"], [575, "eggs"],
  [666, "dry"], [776, "sleep"], [867, "end"]];
const END = 932;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const ICE = "#9fe7ff", VIO = "#c3a8ff";
const BEAR = "#d9c6ec", FADED = "#c2bcc4";
const MX = 100, LX = 200; // yosun dünyası, laboratuvar (uzay x=0)
let R = {};

const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };

// ---------------- su ayısı ----------------
function makeBear(E, id, col = BEAR) {
  const g = E.group(null, [0, -50, 0]);
  const skin = E.mat(col, { id: "bear" + id });
  const claw = E.mat("#4a3550");
  const body = E.group(g, [0, 0.42, 0]);
  const segX = [0.42, 0.14, -0.14, -0.4], segR = [0.27, 0.32, 0.31, 0.26];
  const segs = segX.map((x, i) => { const s = E.sphere(segR[i], skin, [x, 0, 0], { parent: body, seg: 22 }); s.scale.set(1.05, 0.92, 1); return s; });
  const head = E.group(body, [0.62, 0.03, 0]);
  E.sphere(0.22, skin, [0, 0, 0], { parent: head, seg: 20 });
  E.cyl(0.075, 0.095, 0.16, skin, [0.2, -0.04, 0], { parent: head, center: true, rot: [0, 0, -Math.PI / 2], seg: 14 });
  E.cyl(0.05, 0.05, 0.02, E.mat("#5a2f4a"), [0.285, -0.04, 0], { parent: head, center: true, rot: [0, 0, -Math.PI / 2], seg: 14 });
  const lids = [];
  for (const z of [0.1, -0.1]) {
    E.sphere(0.08, E.mat("#ffffff"), [0.15, 0.085, z * 1.15], { parent: head, seg: 14 });
    E.sphere(0.042, E.mat("#151018"), [0.215, 0.095, z * 1.2], { parent: head, seg: 10 });
    E.sphere(0.014, E.mat("#ffffff"), [0.25, 0.115, z * 1.15], { parent: head, seg: 6 });
    const lid = E.sphere(0.086, skin, [0.15, 0.085, z * 1.15], { parent: head, seg: 12 }); lid.visible = false; lids.push(lid);
  }
  const legs = [];
  segX.forEach((x, i) => {
    for (const z of [0.22, -0.22]) {
      const l = E.group(body, [x, -0.12, z]);
      E.cyl(0.075, 0.09, 0.24, skin, [0, -0.24, 0], { parent: l, seg: 10 });
      for (const [dx, dz] of [[0.04, 0], [0.01, 0.035], [0.01, -0.035]]) E.cone(0.018, 0.07, claw, [dx, -0.3, dz], { parent: l, seg: 6, rot: [Math.PI, 0, 0] });
      l.userData.base = i === 3 ? 0.5 : 0; l.userData.side = z > 0 ? 1 : -1; l.userData.idx = i;
      legs.push(l);
    }
  });
  g.userData = { body, segs, head, lids, legs, skin, segX };
  return g;
}

/** c: top olma (0 açık, 1 top), walk: kare (yürüme) veya null, blink 0/1, fade: renk solması, wave: el sallama */
function setBear(g, o = {}) {
  const u = g.userData, c = o.c || 0, X = R.X;
  u.segs.forEach((s, i) => { s.position.x = u.segX[i] * (1 - 0.7 * c); s.scale.set(1.05 - 0.1 * c, 0.92 + 0.12 * c, 1); });
  u.head.position.x = X.lerp(0.62, 0.3, c); u.head.scale.setScalar(1 - 0.45 * c);
  u.body.position.y = 0.42 - 0.08 * c;
  u.legs.forEach((l) => {
    l.scale.set(1, Math.max(0.02, 1 - c), 1); l.visible = c < 0.95;
    l.position.x = u.segX[l.userData.idx] * (1 - 0.7 * c);
    const ph = l.userData.idx * 1.6 + (l.userData.side > 0 ? 0 : Math.PI);
    l.rotation.set(0.22 * l.userData.side * (1 - c), 0, l.userData.base + (o.walk != null ? 0.38 * Math.sin(o.walk * 0.32 + ph) : 0) + (o.paddle ? 0.25 * Math.sin(o.paddle * 0.12 + ph) : 0));
  });
  if (o.wave) { const l = u.legs[0]; l.rotation.set(0.35 + 0.3 * Math.sin(o.wave * 0.45), 0, 1.45); }
  const closed = o.blink || c > 0.55;
  u.lids.forEach((l) => { l.visible = !!closed; });
  const fd = (o.fade || 0);
  u.skin.color.set(BEAR).lerp(new E_THREE.Color(FADED), fd);
}
let E_THREE = null;

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

// ---------------- sahneler ----------------
export function build(E) {
  const { T } = E; const TH = E.THREE; E_THREE = TH; R.X = E.X;
  const noShadow = (m) => { m.castShadow = false; m.receiveShadow = false; return m; };
  // ---- uzay (x=0) ----
  const bg = noShadow(E.sphere(46, E.flat("#05060f", { side: TH.BackSide, fog: false }), [0, 0, 0], { seg: 32 })); bg.userData.noink = true;
  for (let i = 0; i < 260; i++) {
    const th = rnd(i) * Math.PI * 2, ph = Math.acos(2 * rnd(i + 500) - 1), r = 42;
    const s = noShadow(E.sphere(0.06 + rnd(i + 900) * 0.12, E.flat(i % 7 ? "#ffffff" : "#cdb8ff", { fog: false }), [r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], { seg: 6 }));
    s.userData.noink = true;
  }
  // Dünya
  const earth = E.group(null, [-6, -11, -38]); R.earth = earth;
  noShadow(E.sphere(7, E.mat("#2f72d6", { emissive: "#0d2f6a", glow: 0.5 }), [0, 0, 0], { parent: earth, seg: 48 }));
  for (let i = 0; i < 9; i++) {
    const th = rnd(i + 40) * Math.PI * 2, ph = 0.4 + rnd(i + 60) * 2.2, n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    const c = noShadow(E.sphere(1.8 + rnd(i + 80) * 1.0, E.mat(i % 3 ? "#4fae5a" : "#c8b06a", { emissive: "#1b4a22", glow: 0.35 }), n.map((v) => v * 5.6), { parent: earth, seg: 20 }));
    c.scale.set(1, 1, 1);
  }
  for (let i = 0; i < 10; i++) {
    const th = rnd(i + 140) * Math.PI * 2, ph = 0.3 + rnd(i + 160) * 2.4, n = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    noShadow(E.sphere(0.9 + rnd(i + 180) * 0.8, E.mat("#ffffff", { emissive: "#c8dcff", glow: 0.4 }), n.map((v) => v * 6.75), { parent: earth, seg: 14 })).scale.set(1.6, 0.35, 1);
  }
  // Güneş
  R.sun = E.group(null, [7, 6, -22]);
  noShadow(E.sphere(1.6, E.mat("#ffe27a", { emissive: "#ffc93c", glow: 1.8 }), [0, 0, 0], { parent: R.sun, seg: 28 }));
  R.rays = [];
  for (let i = 0; i < 10; i++) { const r = noShadow(E.box(0.18, 3.2, 0.04, E.mat("#fff1a8", { emissive: "#ffd34a", glow: 1.6 }), [0, 0, 0], { parent: R.sun, center: true })); r.rotation.z = (i / 10) * Math.PI * 2; r.translateY(2.6); R.rays.push(r); }
  R.sun.visible = false;
  // uydu
  const sat = E.group(null, [0, -50, 0]); R.sat = sat;
  E.sphere(0.62, E.mat("#cfc6b2"), [0.55, 0, 0], { parent: sat, seg: 28 });
  E.cyl(0.5, 0.5, 1.1, E.mat("#9aa3b2", { map: T.metal("#9aa3b2") }), [-0.3, 0, 0], { parent: sat, center: true, rot: [0, 0, Math.PI / 2], seg: 24 });
  E.cyl(0.52, 0.52, 0.18, E.mat("#e3b54a", { emissive: "#7a5410", glow: 0.3 }), [-0.3, 0, 0], { parent: sat, center: true, rot: [0, 0, Math.PI / 2], seg: 24 });
  E.cyl(0.36, 0.5, 0.35, E.mat("#6f7888"), [-1.0, 0, 0], { parent: sat, center: true, rot: [0, 0, Math.PI / 2], seg: 20 });
  for (const z of [1, -1]) {
    E.cyl(0.025, 0.025, 0.5, E.mat("#d8dde6"), [-0.3, 0, z * 0.7], { parent: sat, center: true, rot: [Math.PI / 2, 0, 0], seg: 6 });
    const p = E.box(0.75, 0.03, 1.3, E.mat("#2b4fa8", { emissive: "#0f2a6a", glow: 0.4 }), [-0.3, 0, z * 1.55], { parent: sat, center: true });
    for (let k = -2; k <= 2; k++) E.box(0.77, 0.035, 0.02, E.mat("#cfd8ea"), [-0.3, 0, z * 1.55 + k * 0.26], { parent: sat, center: true });
    p.rotation.x = 0;
  }
  E.cyl(0.012, 0.012, 0.7, E.mat("#d8dde6"), [0.55, 0.85, 0], { parent: sat, seg: 6 });
  E.sphere(0.04, E.mat("#ff6b6b", { emissive: "#ff3030", glow: 1.2 }), [0.55, 1.2, 0], { parent: sat, seg: 8 });
  // dıştaki açık tepsi (deney)
  const tray = E.group(sat, [-0.3, 0.5, 0]); R.tray = tray;
  E.box(0.7, 0.05, 0.5, E.mat("#c9ced8"), [0, 0, 0], { parent: tray, center: true });
  for (const [x, z, w, d] of [[0, 0.24, 0.7, 0.03], [0, -0.24, 0.7, 0.03], [0.34, 0, 0.03, 0.5], [-0.34, 0, 0.03, 0.5]]) E.box(w, 0.07, d, E.mat("#aab1be"), [x, 0.03, z], { parent: tray, center: true });
  E.box(0.6, 0.012, 0.4, E.mat("#e8f4ff"), [0, 0.03, 0], { parent: tray, center: true });
  // küçük kapsül (uydu yanında)
  R.capsule = E.group(sat, [0.55, 0.0, 0.66]);
  E.cyl(0.09, 0.09, 0.22, E.mat("#bfe6ff", { transparent: true, opacity: 0.55 }), [0, 0, 0], { parent: R.capsule, center: true, rot: [Math.PI / 2, 0, 0], seg: 14 });
  // ---- yosun dünyası (x=MX) ----
  E.box(40, 0.1, 40, E.mat("#4c6b34", { map: T.grass("#5a7d3c") }), [MX, -0.1, 0]);
  for (let i = 0; i < 46; i++) {
    const x = MX - 7 + rnd(i + 300) * 14, z = -1.2 - rnd(i + 320) * 7, h = 1.6 + rnd(i + 340) * 3.2;
    const st = E.group(null, [x, 0, z]);
    E.cyl(0.05, 0.07, h, E.mat("#5d7d2e"), [0, 0, 0], { parent: st, seg: 6 });
    const col = i % 3 ? "#7fbf3f" : "#9bd35a";
    for (let k = 0; k < 7; k++) {
      const lf = E.sphere(0.26, E.mat(col), [0, h * (0.25 + k * 0.11), 0], { parent: st, seg: 8 });
      lf.scale.set(1.3, 0.12, 0.45); lf.rotation.y = k * 1.3 + i; lf.rotation.z = 0.3;
    }
    st.rotation.z = (rnd(i + 360) - 0.5) * 0.25;
  }
  for (let i = 0; i < 14; i++) { const x = MX - 4 + rnd(i + 400) * 8, z = 0.8 + rnd(i + 420) * 2.5; const lf = E.sphere(0.4, E.mat(i % 2 ? "#79b43c" : "#8fc84d"), [x, 0.05, z], { seg: 8 }); lf.scale.set(1.4, 0.12, 0.5); lf.rotation.y = rnd(i) * 3; }
  for (let i = 0; i < 6; i++) { const d = E.sphere(0.18 + rnd(i + 440) * 0.15, E.mat("#bfe9ff", { transparent: true, opacity: 0.45, emissive: "#8fd0ff", glow: 0.4 }), [MX - 3 + rnd(i + 460) * 6, 0.2, -0.8 - rnd(i + 480) * 1.5], { seg: 14 }); d.scale.y = 0.7; }
  // kum tanesi + iğne (ölçek)
  R.grain = E.sphere(0.62, E.mat("#e2c38c", { map: T.dirt("#e2c38c") }), [MX + 1.25, 0.5, -0.35], { seg: 18 }); R.grain.scale.set(1.0, 0.82, 0.9); R.grain.rotation.set(0.4, 0.8, 0.2);
  R.needle = E.group(null, [MX + 0.35, 1.25, -0.7]);
  E.cyl(0.13, 0.13, 6, E.mat("#c9d0d8", { map: T.metal("#c9d0d8") }), [0, 0.55, 0], { parent: R.needle, seg: 18 });
  E.cone(0.13, 0.55, E.mat("#c9d0d8"), [0, 0, 0], { parent: R.needle, seg: 18, rot: [Math.PI, 0, 0] });
  // ---- laboratuvar (x=LX) ----
  E.box(14, 0.1, 10, E.mat("#e9edf2", { map: T.tiles("#eef1f5", "#dfe5ec", 8) }), [LX, -0.1, 0]);
  E.box(14, 6, 0.2, E.mat("#cfe0ea"), [LX, 0, -3]);
  E.box(3.4, 0.08, 2.0, E.mat("#bfe6ff", { transparent: true, opacity: 0.5 }), [LX, 0, 0]); // lam (cam)
  // mikroskop objektifi (yukarıdan)
  const obj = E.group(null, [LX - 0.2, 3.2, -0.4]);
  E.cyl(0.45, 0.35, 1.2, E.mat("#2d3440"), [0, 0, 0], { parent: obj, seg: 22 });
  E.cyl(0.22, 0.22, 0.25, E.mat("#9fb2c8"), [0, -0.2, 0], { parent: obj, seg: 18 });
  E.box(0.6, 3, 0.6, E.mat("#3a4250"), [LX + 2.4, 0, -2.2]);
  // su damlası
  R.drop = E.sphere(1.25, E.mat("#9fd8ff", { transparent: true, opacity: 0.22, emissive: "#6fc0ff", glow: 0.25 }), [LX, 0.05, 0], { seg: 32 });
  R.drop.userData.noink = true; R.drop.castShadow = false;
  // yumurtalar
  R.eggs = E.group(null, [LX - 0.55, 0.12, 0.55]);
  R.eggList = [];
  for (let i = 0; i < 6; i++) { const e = E.sphere(0.075, E.mat("#f6e9b8", { emissive: "#fff2c4", glow: 0.3 }), [(i % 3) * 0.15, 0, Math.floor(i / 3) * 0.15], { parent: R.eggs, seg: 10 }); R.eggList.push(e); }
  // karakterler
  R.bear = makeBear(E, "main");
  R.minis = [0, 1, 2, 3, 4].map((i) => { const m = makeBear(E, "m" + i); R.tray.add(m); return m; });
  R.babies = [0, 1, 2].map((i) => makeBear(E, "b" + i));
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(14,12,34,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = VIO; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#d9ccff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = ICE, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#0b0a1e"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};
const both = (a, b) => (g, w, h) => { if (a) a(g, w, h); if (b) b(g, w, h); };

function reset() {
  hide(R.bear); R.minis.forEach(hide); R.babies.forEach(hide);
  [R.bear, ...R.minis, ...R.babies].forEach((b) => setBear(b, {}));
  hide(R.sat); R.sun.visible = false;
  R.drop.visible = true; R.drop.scale.set(1, 0.62, 1); R.drop.position.set(LX, 0.05, 0);
  R.eggs.visible = false; R.eggList.forEach((e) => e.scale.setScalar(1));
  R.earth.position.set(-6, -11, -38); R.earth.rotation.y = 0; R.needle.position.y = 60;
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, FX = [];
  let cam, light = "day", dof = { focus: 3, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0], tint = null;
  reset();
  R.earth.rotation.y = f * 0.0012;
  const B = R.bear;

  switch (sh.name) {
    case "hook": {
      put(B, 0, -0.35 + 0.06 * Math.sin(f / 22), 0, 0.35 + 0.15 * Math.sin(f / 40));
      B.rotation.z = 0.1 * Math.sin(f / 30);
      setBear(B, { paddle: f, blink: f >= 100 && f <= 104 ? 1 : E.blink(f, 3) });
      cam = E.camAt(f, [{ f: 0, pos: [1.0, 0.55, 3.7], look: [0.05, 0.05, 0], fov: 46 }, { f: 78, pos: [1.25, 0.45, 2.6], look: [0.3, 0.05, 0], fov: 44 }, { f: 115, pos: [1.95, 0.3, 0.2], look: [0.74, 0.1, -0.24], fov: 42 }]);
      dof = { focus: [0.5, 0.1, -0.1], amount: 3 };
      break;
    }
    case "name": {
      light = "day";
      const x = MX - 0.9 + 0.006 * t;
      put(B, x, 0, 0, 0.25); setBear(B, { walk: f, blink: E.blink(f, 4) });
      cam = E.camAt(f, [{ f: 116, pos: [x + 2.0, 1.0, 2.6], look: [x + 0.35, 0.45, 0], fov: 44 }, { f: 148, pos: [x + 1.85, 0.95, 2.4], look: [x + 0.4, 0.45, 0], fov: 44 }]);
      dof = { focus: [x + 0.4, 0.45, 0], amount: 6 }; focusPt = [MX, 0, 0];
      overlay = card("Su ayısı", "tardigrad · 8 bacaklı mikro hayvan");
      break;
    }
    case "size": {
      const x = MX - 0.15;
      put(B, x, 0, 0, 0.3); setBear(B, { walk: t < 20 ? f : null, blink: E.blink(f, 5) });
      R.needle.position.y = 1.25 + 3 * (1 - X.easeOut(X.span(f, 152, 175)));
      cam = E.camAt(f, [{ f: 149, pos: [MX + 0.6, 1.25, 3.6], look: [MX + 0.35, 0.6, -0.2], fov: 46 }, { f: 215, pos: [MX + 0.55, 1.15, 3.3], look: [MX + 0.35, 0.6, -0.2], fov: 46 }]);
      dof = { focus: [MX + 0.3, 0.5, -0.2], amount: 4 }; focusPt = [MX, 0, 0];
      overlay = big("< 0,5 mm", X.span(f, 160, 168), "kum tanesinden küçük", ICE, 160);
      break;
    }
    case "sat": {
      const a = 0.4 + 0.004 * t;
      put(R.sat, 0, 0, 0, a); R.sat.rotation.z = 0.12;
      R.earth.position.set(-5, -10.5, -34);
      cam = E.camAt(f, [{ f: 216, pos: [2.2, 1.6, 5.6], look: [-0.1, -0.2, 0], fov: 48 }, { f: 368, pos: [1.4, 1.1, 4.4], look: [-0.1, -0.1, 0], fov: 46 }]);
      overlay = card("FOTON-M3, 2007", "Eylül 2007 · araştırma uydusu");
      break;
    }
    case "tray": {
      put(R.sat, 0, 0, 0, 0.4); R.sat.rotation.z = 0.12;
      R.sun.visible = true; R.sun.position.set(5, 4.5, -16); R.rays.forEach((r, i) => r.scale.set(1, 0.85 + 0.2 * Math.sin(f / 6 + i), 1));
      // tepsi dünya konumu: uydu dönüşünden hesapla
      R.sat.updateMatrixWorld(true);
      const tp = new E_THREE.Vector3(); R.tray.getWorldPosition(tp);
      R.minis.forEach((m, i) => {
        const px = [-0.2, 0, 0.2, -0.1, 0.12][i], pz = [-0.1, 0.08, -0.08, 0.12, -0.14][i];
        put(m, px, 0.03, pz, i * 1.3, 0.2);
        setBear(m, { c: 1, fade: 0.6 });
      });
      cam = E.camAt(f, [{ f: 369, pos: [tp.x + 1.1, tp.y + 1.15, tp.z + 1.4], look: [tp.x, tp.y + 0.05, tp.z], fov: 42 }, { f: 493, pos: [tp.x + 0.85, tp.y + 0.95, tp.z + 1.15], look: [tp.x, tp.y + 0.05, tp.z], fov: 40 }]);
      dof = { focus: [tp.x, tp.y, tp.z], amount: 4 };
      flash = 0.08 + 0.04 * Math.sin(f / 5);
      tint = "sun";
      overlay = big("10 gün", X.span(f, 372, 380), "boşluk + güneş ışınları", "#ffe27a", 170);
      break;
    }
    case "wake": {
      light = "interior";
      const c = 1 - X.smooth(X.span(f, 520, 560));
      put(B, LX - 0.05, 0.04, 0, 0.45); setBear(B, { c, fade: c * 0.7, blink: f > 562 && f < 567 ? 1 : 0, paddle: c < 0.3 ? f : null });
      cam = E.camAt(f, [{ f: 494, pos: [LX + 1.0, 1.35, 3.1], look: [LX + 0.15, 0.35, 0], fov: 44 }, { f: 574, pos: [LX + 0.9, 1.2, 2.7], look: [LX + 0.2, 0.35, 0], fov: 44 }]);
      dof = { focus: [LX + 0.1, 0.35, 0], amount: 5 }; focusPt = [LX, 0, 0];
      if (f > 525) FX.push({ kind: "sparkle", pos: [LX + 0.1, 0.95, 0.2], size: 0.7, t: (f - 525) / 30 });
      break;
    }
    case "eggs": {
      light = "interior";
      put(B, LX + 0.35, 0.04, -0.1, -2.42); setBear(B, { blink: E.blink(f, 6), paddle: f });
      R.eggs.visible = true;
      const hatch = X.span(f, WF(E, 45), WF(E, 46) + 8);
      R.eggList.forEach((e, i) => e.scale.setScalar(i < 3 ? 1 - X.smooth(X.span(f, WF(E, 45) + i * 8, WF(E, 45) + i * 8 + 10)) : 1));
      R.babies.forEach((b, i) => {
        const k = X.back(X.span(f, WF(E, 45) + i * 8, WF(E, 45) + i * 8 + 12));
        if (k > 0.01) { put(b, LX - 0.55 + i * 0.22, 0.04, 0.85 + (i % 2) * 0.12, 0.3 + i * 0.4, 0.3 * k); setBear(b, { walk: f + i * 7, blink: E.blink(f, 10 + i) }); }
      });
      cam = E.camAt(f, [{ f: 575, pos: [LX + 0.3, 1.5, 3.5], look: [LX - 0.1, 0.3, 0.3], fov: 46 }, { f: 665, pos: [LX + 0.2, 1.35, 3.1], look: [LX - 0.15, 0.3, 0.35], fov: 46 }]);
      dof = { focus: [LX - 0.1, 0.3, 0.3], amount: 5 }; focusPt = [LX, 0, 0];
      if (hatch > 0.2) FX.push({ kind: "hearts", pos: [LX - 0.25, 0.9, 0.7], size: 0.6, t: (f - WF(E, 45)) / 30 });
      break;
    }
    case "dry": {
      light = "interior";
      const fk = WF(E, 50), ftop = WF(E, 51), fb = WF(E, 53);
      const dry = X.smooth(X.span(f, fk - 4, fk + 18));
      R.drop.scale.set(1 - 0.85 * dry, 0.62 * (1 - 0.95 * dry), 1 - 0.85 * dry); R.drop.visible = dry < 0.97;
      const c = X.smooth(X.span(f, ftop - 2, fb + 14));
      put(B, LX - 0.05, 0.04, 0, 0.45); setBear(B, { c, fade: X.span(f, fk, fb + 30) });
      cam = E.camAt(f, [{ f: 666, pos: [LX + 1.0, 1.3, 3.0], look: [LX + 0.15, 0.35, 0], fov: 44 }, { f: 775, pos: [LX + 0.8, 1.0, 2.2], look: [LX + 0.05, 0.3, 0], fov: 42 }]);
      dof = { focus: [LX + 0.05, 0.3, 0], amount: 6 }; focusPt = [LX, 0, 0];
      if (f > WF(E, 56)) FX.push({ kind: "zzz", pos: [LX + 0.3, 0.85, 0.15], size: 0.4, t: (f - WF(E, 56)) / 30 });
      break;
    }
    case "sleep": {
      put(B, 0, 0.0 + 0.05 * Math.sin(f / 25), 0, 0.5 + 0.004 * t); B.rotation.z = 0.004 * t;
      setBear(B, { c: 1, fade: 1 });
      R.earth.position.set(-5.5, -9.5, -32);
      cam = E.camAt(f, [{ f: 776, pos: [0.9, 0.7, 2.9], look: [0.05, 0.25, 0], fov: 46 }, { f: 866, pos: [0.7, 0.6, 2.4], look: [0.05, 0.28, 0], fov: 44 }]);
      FX.push({ kind: "zzz", pos: [0.35, 0.85, 0.1], size: 0.4, t: t / 30 });
      break;
    }
    case "end": {
      const c = 1 - X.smooth(X.span(f, 867, 886));
      put(B, 0, -0.3 + 0.3 * c + 0.04 * Math.sin(f / 22), 0, 0.45);
      setBear(B, { c, fade: c, wave: f > 888 ? f : 0, blink: f > 898 && f < 903 ? 1 : 0, paddle: f });
      R.earth.position.set(-6, -10, -34);
      cam = E.camAt(f, [{ f: 867, pos: [1.2, 0.5, 2.9], look: [0.1, 0.0, 0], fov: 46 }, { f: 931, pos: [1.25, 0.45, 2.7], look: [0.15, 0.0, 0], fov: 45 }]);
      dof = { focus: [0.2, 0.0, 0], amount: 2 };
      if (f > 870 && f < 900) FX.push({ kind: "sparkle", pos: [0.2, 0.5, 0.2], size: 0.6, t: (f - 870) / 30 });
      overlay = big("Tuhaf ama gerçek.", X.span(f, 870, 878), "", "#ffffff", 100);
      break;
    }
  }
  const ov = overlay, tn = tint;
  const fin = (g, w, h) => {
    if (tn === "sun") { const gr = g.createRadialGradient(w * 0.95, h * 0.05, 10, w * 0.95, h * 0.05, h * 0.75); gr.addColorStop(0, "rgba(255,240,170,0.85)"); gr.addColorStop(0.25, "rgba(255,210,110,0.35)"); gr.addColorStop(1, "rgba(255,200,100,0)"); g.save(); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore(); }
    if (ov) ov(g, w, h);
  };
  return { cam, light, dof, actors: [], fx: FX, flash, flashCol: "#fff3c4", overlay: fin, focusPt };
}
