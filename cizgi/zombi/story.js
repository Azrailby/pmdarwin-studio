// Zombi Hamamböceği Arısı — PMDARWIN (dfki sesi, ~36 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [142, "name"], [208, "sting1"], [331, "sting2"], [430, "alive"], [473, "will"], [549, "lead"],
  [662, "burrow"], [809, "hatch"], [846, "eat"], [932, "calm"], [984, "boss"], [1036, "end"]];
const END = 1102;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const GREEN = "#3ddc97";
const BX = 100; // yuva içi
let R = {};

function makeRoach(E) {
  const g = E.group(null, [0, 0, 0]);
  R.rMat = E.mat("#6b3a1e", { transparent: true, opacity: 1 });
  const body = E.sphere(0.33, R.rMat, [0, 0.34, 0], { parent: g, seg: 20 }); body.scale.set(2.0, 0.55, 1.15);
  R.rMat2 = E.mat("#8a5530", { transparent: true, opacity: 1 });
  const pro = E.sphere(0.22, R.rMat2, [0.55, 0.38, 0], { parent: g, seg: 16 }); pro.scale.set(1, 0.5, 1.25);
  const head = E.group(g, [0.82, 0.32, 0]); R.rHead = head;
  E.sphere(0.14, E.mat("#4a2814"), [0, 0, 0], { parent: head, seg: 14 });
  R.rPupils = [];
  for (const z of [0.075, -0.075]) {
    E.sphere(0.06, E.mat("#ffffff"), [0.09, 0.07, z], { parent: head, seg: 10 });
    R.rPupils.push(E.sphere(0.03, E.mat("#111111"), [0.14, 0.075, z], { parent: head, seg: 8 }));
  }
  R.rBrain = E.sphere(0.075, E.mat("#ff8fb1", { emissive: "#ff4f8b", glow: 1.4 }), [0.02, 0.12, 0], { parent: head, seg: 10 }); R.rBrain.visible = false;
  R.rAnt = [];
  for (const z of [0.05, -0.05]) {
    const a = E.group(head, [0.1, 0.1, z]);
    E.cyl(0.012, 0.016, 0.9, E.mat("#3a1f0f"), [0, 0, 0], { parent: a, seg: 6 });
    a.rotation.z = -0.9; a.rotation.x = z > 0 ? -0.25 : 0.25; R.rAnt.push(a);
  }
  R.rLegs = [];
  for (let i = 0; i < 3; i++) for (const z of [0.22, -0.22]) {
    const p = E.group(g, [0.35 - i * 0.35, 0.3, z]);
    E.cyl(0.022, 0.018, 0.4, E.mat("#4a2814"), [0, -0.4, 0], { parent: p, seg: 6 });
    p.rotation.x = z > 0 ? -0.55 : 0.55; R.rLegs.push(p);
  }
  R.larva = E.group(g, [0, 0.33, 0]); R.larvaParts = [];
  for (let i = 0; i < 5; i++) R.larvaParts.push(E.sphere(0.1 - Math.abs(i - 2) * 0.012, E.mat("#f4ecd2", { emissive: "#fff3c4", glow: 0.5 }), [0.3 - i * 0.15, 0, 0], { parent: R.larva, seg: 10 }));
  R.larva.visible = false;
  R.egg = E.sphere(0.06, E.mat("#fbf7ea", { emissive: "#fff8d8", glow: 0.4 }), [0.38, 0.12, 0.33], { parent: g, seg: 10 }); R.egg.scale.set(1.8, 1, 1); R.egg.visible = false;
  return g;
}

function makeWasp(E) {
  const g = E.group(null, [0, -50, 0]);
  const body = E.group(g, [0, 0.32, 0]);
  const met = E.mat("#16a37a", { emissive: "#0a6b4d", glow: 0.35 });
  E.sphere(0.13, met, [0, 0, 0], { parent: body, seg: 14 });
  const abd = E.group(body, [-0.12, 0, 0]); R.wAbd = abd;
  const a = E.sphere(0.16, E.mat("#1a7fb0", { emissive: "#0a4a7a", glow: 0.35 }), [-0.24, 0, 0], { parent: abd, seg: 16 }); a.scale.set(1.8, 0.8, 0.9);
  const sting = E.cone(0.022, 0.13, E.mat("#2a2a2a"), [-0.5, 0, 0], { parent: abd, seg: 6 }); sting.rotation.z = Math.PI / 2; R.wSting = sting;
  const head = E.group(body, [0.2, 0.03, 0]); R.wHead = head;
  E.sphere(0.1, met, [0, 0, 0], { parent: head, seg: 12 });
  for (const z of [0.055, -0.055]) {
    E.sphere(0.046, E.mat("#ffffff"), [0.065, 0.045, z], { parent: head, seg: 10 });
    E.sphere(0.024, E.mat("#111111"), [0.1, 0.05, z], { parent: head, seg: 8 });
    E.box(0.07, 0.014, 0.02, E.mat("#0a3a2a"), [0.06, 0.095, z], { parent: head, rot: [0, 0, z > 0 ? -0.35 : -0.35] });
  }
  R.wWings = [];
  for (const z of [0.17, -0.17]) {
    const w = E.group(body, [-0.05, 0.11, z * 0.4]);
    const p = E.sphere(0.25, E.mat("#d6ecff", { transparent: true, opacity: 0.4 }), [-0.12, 0, z * 0.6], { parent: w, seg: 12 }); p.scale.set(1.3, 0.04, 0.45);
    R.wWings.push(w);
  }
  R.wLegs = [];
  for (let i = 0; i < 3; i++) for (const z of [0.1, -0.1]) {
    const p = E.group(body, [0.08 - i * 0.08, -0.05, z]);
    E.cyl(0.013, 0.011, 0.3, E.mat("#c0392b"), [0, -0.3, 0], { parent: p, seg: 6 });
    p.rotation.x = z > 0 ? -0.5 : 0.5; R.wLegs.push(p);
  }
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.dirt("#8a6a48"), 400, 0.8);
  S.clouds();
  // dev çimen yaprakları + çakıllar (makro dünya)
  const rnd = (i) => { const x = Math.sin(i * 91.7) * 43758.5; return x - Math.floor(x); };
  for (let i = 0; i < 70; i++) {
    const x = -8 + rnd(i) * 20, z = -2.5 - rnd(i + 99) * 7, h = 1.5 + rnd(i + 7) * 3;
    E.box(0.09, h, 0.03, E.mat(i % 3 ? "#5f9a3a" : "#7bb34a"), [x, 0, z], { rot: [0, rnd(i + 3) * 3, (rnd(i + 5) - 0.5) * 0.4] });
  }
  for (let i = 0; i < 18; i++) { const s = E.sphere(0.12 + rnd(i + 50) * 0.25, E.mat(i % 2 ? "#9b9184" : "#7f776c"), [-6 + rnd(i + 20) * 16, 0.05, 1.5 + rnd(i + 30) * 3.5], { seg: 10 }); s.scale.y = 0.6; }
  // yuva tümseği (x=7)
  const m = E.sphere(1.4, E.mat("#7a5a3a"), [7, 0, 0], { seg: 24 }); m.scale.set(1, 0.45, 1);
  const hole = E.cyl(0.42, 0.42, 0.05, E.mat("#120a05"), [5.72, 0.36, 0], { seg: 24 }); hole.rotation.z = Math.PI / 2;
  R.seal = []; for (let i = 0; i < 9; i++) { const s = E.sphere(0.13, E.mat(i % 2 ? "#9b9184" : "#857c70"), [5.66, -50, 0], { seg: 10 }); R.seal.push(s); }
  // yuva içi (x=BX)
  E.box(10, 5, 0.2, E.mat("#2a1a10"), [BX, 0, -1.5]);
  E.box(0.2, 5, 6, E.mat("#2a1a10"), [BX - 2.0, 0, 0]);
  const door = E.cyl(0.55, 0.55, 0.05, E.mat("#ffe2a0", { emissive: "#ffcf6b", glow: 1.6 }), [BX - 1.88, 0.6, 0], { seg: 24 }); door.rotation.z = Math.PI / 2;
  R.peb = []; for (let i = 0; i < 9; i++) { const s = E.sphere(0.17, E.mat(i % 2 ? "#9b9184" : "#857c70"), [BX - 1.78, -50, 0], { seg: 10 }); R.peb.push(s); }
  R.roach = makeRoach(E); R.wasp = makeWasp(E);
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(10,24,18,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = GREEN; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#bff5dc"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = "#8dffc9", size = 140) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#0a1a12"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
function roachWalk(f, sp = 1, amp = 0.5) { R.rLegs.forEach((l, i) => (l.rotation.z = amp * Math.sin(f * 0.5 * sp + (i % 2 ? Math.PI : 0) + Math.floor(i / 2) * 2))); }
function waspWalk(f, sp = 1) { R.wLegs.forEach((l, i) => (l.rotation.z = 0.5 * Math.sin(f * 0.6 * sp + (i % 2 ? Math.PI : 0) + Math.floor(i / 2) * 2))); }
function wings(f, fast = false) { R.wWings.forEach((w, i) => (w.rotation.x = (i ? -1 : 1) * (fast ? 0.5 * Math.sin(f * 2.2) : 0.08 * Math.sin(f / 6)))); }
function pupils(s, look = 0) { R.rPupils.forEach((p) => { p.scale.setScalar(s); p.position.z = Math.sign(p.position.z) * (0.075 + 0.02 * look); }); }
function reset() {
  R.rMat.opacity = 1; R.rMat2.opacity = 1; R.rBrain.visible = false; R.larva.visible = false; R.egg.visible = false;
  R.rAnt.forEach((a, i) => { a.rotation.z = -0.9; a.rotation.x = i ? 0.25 : -0.25; });
  R.rLegs.forEach((l) => (l.rotation.z = 0)); R.wLegs.forEach((l) => (l.rotation.z = 0));
  R.wAbd.rotation.z = 0; R.roach.visible = true; R.wasp.visible = false; R.wasp.position.y = -50; pupils(1);
  R.peb.forEach((p) => (p.position.y = -50)); R.seal.forEach((p) => (p.position.y = -50));
}
// tasma: hamamböceği x'te, arı önde, yüzü geriye dönük, anten ağzında
function leash(f, x, walking = true) {
  put(R.roach, x, 0, 0, 0); if (walking) roachWalk(f, 1.2, 0.4);
  R.rAnt[0].rotation.z = -1.62; R.rAnt[0].rotation.x = -0.05;
  R.rAnt[1].rotation.z = -0.8 + 0.08 * Math.sin(f / 10);
  put(R.wasp, x + 2.12, 0, 0.05, Math.PI); if (walking) waspWalk(f, 1.2); wings(f);
}
function seal(n, list, baseX, y0, r) {
  const pos = [[0, -0.32], [0.26, -0.32], [-0.26, -0.32], [0.13, -0.08], [-0.13, -0.08], [0.28, -0.08], [-0.28, -0.08], [0.06, 0.16], [-0.12, 0.18]];
  list.forEach((p, i) => { if (i < n) { p.position.set(baseX, y0 + pos[i][1] * r, pos[i][0] * r); } });
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, FX = [];
  let cam, light = "day", dof = { focus: 3, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0];
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  reset();

  switch (sh.name) {
    case "hook": {
      const x = -2.2 + 2.4 * (f / 142);
      leash(f, x);
      pupils(1.7);
      cam = E.camAt(f, [{ f: 0, pos: [x + 3.9, 1.05, 2.4], look: [x + 1.55, 0.38, 0], fov: 42 }, { f: 141, pos: [x + 3.5, 0.95, 2.1], look: [x + 1.55, 0.38, 0], fov: 40 }]);
      dof = { focus: [x + 1.6, 0.4, 0], amount: 5 }; focusPt = [x + 1.4, 0, 0];
      if (f > 60) FX.push({ kind: "question", pos: [x + 0.9, 1.05, 0.1], size: 0.35 * X.back(X.span(f, 60, 70)) });
      break;
    }
    case "name": {
      R.roach.visible = false;
      put(R.wasp, 0, 0, 0, -0.5); wings(f, f % 60 < 20);
      R.wHead.rotation.y = 0.2 * Math.sin(f / 15);
      cam = E.camAt(f, [{ f: 142, pos: [0.9, 0.55, 1.3], look: [0, 0.35, 0], fov: 38 }, { f: 207, pos: [0.75, 0.5, 1.05], look: [0, 0.35, 0], fov: 36 }]);
      dof = { focus: [0.05, 0.35, 0], amount: 10 };
      overlay = card("Zümrüt hamamböceği eşekarısı", "Ampulex compressa");
      break;
    }
    case "sting1": {
      const fs = WF(E, 16), fz = WF(E, 21);
      put(R.roach, 0, 0, 0, 0);
      if (f < fz) roachWalk(f, 2.5, 0.6);
      pupils(f < fs ? 1 : 1.5);
      const app = X.smooth(X.span(f, 208, fs - 4));
      put(R.wasp, 0.45, 0.18 * app, 0.55 + 0.6 * (1 - app), Math.PI / 2); wings(f, f < fs - 4);
      R.wAbd.rotation.z = 1.5 * X.smooth(X.span(f, fs - 6, fs)) * (1 - X.span(f, fs + 20, fs + 30));
      cam = E.camAt(f, [{ f: 208, pos: [1.9, 1.1, 2.4], look: [0.35, 0.4, 0.2], fov: 40 }, { f: 330, pos: [1.6, 1.0, 2.0], look: [0.35, 0.4, 0.2], fov: 38 }]);
      dof = { focus: [0.4, 0.4, 0.3], amount: 7 };
      if (f >= fs) { FX.push({ kind: "burst", pos: [0.45, 0.5, 0.35], size: 0.4 * X.back(X.span(f, fs, fs + 6)), t: X.span(f, fs, fs + 22), opt: { text: "!" } }); shake(fs, 0.03, 10); }
      if (f >= fz) { FX.push({ kind: "cross", pos: [0.0, 0.18, 0.5], size: 0.22 * X.back(X.span(f, fz, fz + 8)) }); overlay = big("Bacaklar: felç", X.span(f, fz, fz + 8), "", "#8dffc9", 110); }
      break;
    }
    case "sting2": {
      const fs = WF(E, 28) - 4;
      put(R.roach, 0, 0, 0, 0); pupils(1.5);
      R.rBrain.visible = f > WF(E, 27) - 6; R.rBrain.scale.setScalar(1 + 0.2 * Math.abs(Math.sin(f / 4)));
      put(R.wasp, 0.95, 0.12, 0.5, Math.PI / 2); wings(f);
      R.wAbd.rotation.z = 1.7 * X.smooth(X.span(f, fs - 8, fs));
      cam = E.camAt(f, [{ f: 331, pos: [2.6, 1.35, 1.0], look: [0.85, 0.42, 0.25], fov: 36 }, { f: 429, pos: [2.4, 1.3, 0.9], look: [0.85, 0.42, 0.25], fov: 35 }]);
      dof = { focus: [0.85, 0.45, 0.15], amount: 10 };
      if (f >= fs) { flash = Math.max(0, 1 - Math.abs(f - fs) / 5) * 0.4; FX.push({ kind: "stars", pos: [0.85, 0.75, 0.1], size: 0.35, t: X.span(f, fs, fs + 40) }); shake(fs, 0.025, 10); }
      if (f > 340) overlay = card("İkinci iğne", "doğrudan beyne");
      break;
    }
    case "alive": {
      put(R.roach, 0, 0, 0, 0); pupils(1.3);
      R.rAnt.forEach((a, i) => (a.rotation.z = -0.9 + 0.1 * Math.sin(f / 7 + i)));
      cam = E.camAt(f, [{ f: 430, pos: [1.6, 0.6, 1.6], look: [0.6, 0.4, 0], fov: 38 }, { f: 472, pos: [1.45, 0.58, 1.45], look: [0.6, 0.4, 0], fov: 37 }]);
      dof = { focus: [0.75, 0.42, 0], amount: 8 };
      FX.push({ kind: "check", pos: [0.85, 0.85, 0.1], size: 0.25 * X.back(X.span(f, 436, 446)) });
      break;
    }
    case "will": {
      put(R.roach, 0, 0, 0, 0); pupils(1.9, 0);
      R.rAnt.forEach((a, i) => (a.rotation.z = -1.2 - 0.25 * X.span(f, 473, 520)));
      cam = E.camAt(f, [{ f: 473, pos: [2.5, 0.62, 0.7], look: [0.85, 0.45, 0], fov: 36 }, { f: 548, pos: [2.25, 0.6, 0.6], look: [0.85, 0.45, 0], fov: 34 }]);
      dof = { focus: [0.85, 0.4, 0], amount: 9 };
      FX.push({ kind: "question", pos: [0.85, 0.95, 0], size: 0.3, t: t / 20 });
      if (f > 500) FX.push({ kind: "cross", pos: [0.85, 1.2, 0], size: 0.25 * X.back(X.span(f, 500, 508)) });
      overlay = big("KAÇ?", X.span(f, 482, 490), "sinyal yok", "#ff8f8f");
      break;
    }
    case "lead": {
      const x = 0.6 + 2.6 * X.span(f, 549, 662);
      leash(f, x);
      pupils(1.8);
      cam = E.camAt(f, [{ f: 549, pos: [x + 1.0, 1.7, 4.2], look: [x + 1.2, 0.4, 0], fov: 44 }, { f: 661, pos: [x + 1.6, 1.5, 3.6], look: [x + 1.5, 0.4, 0], fov: 44 }]);
      focusPt = [x + 1.2, 0, 0];
      if (f > 600) FX.push({ kind: "lines", pos: [x - 0.6, 0.4, 0], size: 0.4, t: t / 12 });
      break;
    }
    case "burrow": {
      light = "interior";
      put(R.roach, BX, 0, 0, -0.3); pupils(1.8);
      const fe = WF(E, 47), fp = WF(E, 50);
      R.egg.visible = f >= fe; R.egg.scale.set(1.8 * X.back(X.span(f, fe, fe + 8)), X.back(X.span(f, fe, fe + 8)), X.back(X.span(f, fe, fe + 8)));
      const n = Math.floor(9 * X.span(f, fp, 805)); seal(n, R.peb, BX - 1.78, 0.6, 1.5);
      const wx = f < fp ? BX + 0.6 : BX - 1.35;
      put(R.wasp, wx, 0, f < fp ? -0.6 : 0.25, f < fp ? -Math.PI / 2 : Math.PI); waspWalk(f, f < fp ? 0.3 : 1.4); wings(f);
      if (f < fp) R.wAbd.rotation.z = 0.8 * X.smooth(X.span(f, fe - 10, fe)) * (1 - X.span(f, fe + 15, fe + 25));
      cam = f < fp ? E.camAt(f, [{ f: 662, pos: [BX + 1.3, 1.5, 3.3], look: [BX + 0.2, 0.3, 0.0], fov: 40 }, { f: fp, pos: [BX + 1.1, 1.2, 2.6], look: [BX + 0.3, 0.25, 0.2], fov: 38 }])
        : E.camAt(f, [{ f: fp, pos: [BX + 0.6, 1.1, 2.6], look: [BX - 1.4, 0.6, 0], fov: 44 }, { f: 808, pos: [BX + 0.3, 1.0, 2.2], look: [BX - 1.5, 0.6, 0], fov: 42 }]);
      dof = { focus: f < fp ? [BX + 0.35, 0.25, 0.3] : [BX - 1.5, 0.6, 0], amount: 6 };
      if (f > fe && f < fp) overlay = card("Tek bir yumurta", "hamamböceğinin bacağına");
      if (f >= fp) FX.push({ kind: "dust", pos: [BX - 1.6, 0.3, 0.2], size: 0.4, t: (f % 20) / 20 });
      break;
    }
    case "hatch": {
      light = "interior";
      put(R.roach, BX, 0, 0, -0.3); pupils(1.8); seal(9, R.peb, BX - 1.78, 0.6, 1.5);
      R.egg.visible = f < 828;
      R.larva.visible = f >= 826; R.larva.position.set(0.38, 0.14, 0.42); R.larva.scale.setScalar(0.35 * X.back(X.span(f, 826, 838)));
      R.larvaParts.forEach((p, i) => (p.position.y = 0.02 * Math.sin(f / 3 + i)));
      cam = E.camAt(f, [{ f: 809, pos: [BX + 0.9, 0.75, 1.9], look: [BX + 0.45, 0.2, 0.45], fov: 36 }, { f: 845, pos: [BX + 0.85, 0.7, 1.7], look: [BX + 0.45, 0.2, 0.45], fov: 35 }]);
      dof = { focus: [BX + 0.45, 0.2, 0.45], amount: 8 };
      if (f >= 826) FX.push({ kind: "puff", pos: [BX + 0.36, 0.2, 0.4], size: 0.15, t: X.span(f, 826, 845) });
      break;
    }
    case "eat": {
      light = "dramatic";
      put(R.roach, BX, 0, 0, -0.3); pupils(1.8); seal(9, R.peb, BX - 1.78, 0.6, 1.5);
      R.rMat.opacity = 0.35; R.rMat2.opacity = 0.35;
      R.larva.visible = true; R.larva.position.set(0, 0.34, 0); R.larva.scale.setScalar(0.45 + 0.4 * X.smooth(X.span(f, 850, 930)));
      R.larvaParts.forEach((p, i) => (p.position.y = 0.025 * Math.sin(f / 3 + i)));
      cam = E.camAt(f, [{ f: 846, pos: [BX + 0.4, 1.3, 2.3], look: [BX + 0.1, 0.35, 0], fov: 38 }, { f: 931, pos: [BX + 0.3, 1.15, 1.9], look: [BX + 0.1, 0.35, 0], fov: 36 }]);
      dof = { focus: [BX + 0.1, 0.35, 0], amount: 7 };
      overlay = big("İçeriden", X.span(f, 870, 878), "canlı canlı", "#ffd27a", 120);
      break;
    }
    case "calm": {
      light = "interior";
      put(R.roach, BX, 0, 0, -0.3); pupils(2.0); seal(9, R.peb, BX - 1.78, 0.6, 1.5);
      R.rAnt.forEach((a) => (a.rotation.z = -0.45));
      cam = E.camAt(f, [{ f: 932, pos: [BX + 1.9, 0.6, 1.1], look: [BX + 0.8, 0.42, 0.24], fov: 34 }, { f: 983, pos: [BX + 1.75, 0.58, 1.0], look: [BX + 0.8, 0.42, 0.24], fov: 33 }]);
      dof = { focus: [BX + 0.8, 0.42, 0.24], amount: 9 };
      FX.push({ kind: "zzz", pos: [BX + 0.95, 0.85, 0.3], size: 0.25, t: t / 30 });
      break;
    }
    case "boss": {
      R.roach.visible = false;
      put(R.wasp, 0, 0, 0, -0.6); wings(f);
      R.wHead.rotation.y = 0.15; R.wHead.rotation.z = 0.12;
      cam = E.camAt(f, [{ f: 984, pos: [0.75, 0.48, 0.95], look: [0.1, 0.38, 0], fov: 36 }, { f: 1035, pos: [0.65, 0.45, 0.8], look: [0.1, 0.38, 0], fov: 34 }]);
      dof = { focus: [0.12, 0.38, 0], amount: 10 };
      overlay = big("Karar veren:", X.span(f, 990, 998), "artık arı", "#8dffc9", 120);
      break;
    }
    case "end": {
      R.roach.visible = false;
      seal(9, R.seal, 5.66, 0.36, 1.1);
      const up = X.smooth(X.span(f, 1045, 1100));
      put(R.wasp, 5.3 + 0.8 * up, 0.0 + 2.2 * up, 0.6, -0.3); wings(f, up > 0.02);
      cam = E.camAt(f, [{ f: 1036, pos: [4.6, 1.3, 4.2], look: [6.3, 0.7, 0], fov: 44 }, { f: 1101, pos: [4.8, 1.7, 3.9], look: [6.2, 1.3, 0], fov: 44 }]);
      focusPt = [6, 0, 0];
      overlay = big("Tuhaf ama gerçek.", X.span(f, 1038, 1046), "", "#ffffff", 100);
      break;
    }
  }
  return { cam, light, dof, actors: [], fx: FX, flash, overlay, focusPt };
}
