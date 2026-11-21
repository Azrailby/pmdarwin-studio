// Toksoplazma — PMDARWIN (dfki sesi, ~36 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [87, "micro"], [140, "catdream"], [174, "multiply"], [221, "ratfood"], [299, "ratbrain"],
  [379, "flee"], [476, "approach"], [601, "pounce"], [644, "home"], [689, "human"], [792, "food"], [865, "crowd"], [975, "end"]];
const END = 1092;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };

const LX = 100, CX = 200; // laboratuvar (mikroskop), kalabalık sokak
const PURPLE = "#b45cff";
let R = {};

function parasite(E, parent, pos, s = 1) {
  const g = E.group(parent, pos);
  const b = E.sphere(0.12 * s, E.mat("#c77dff", { emissive: PURPLE, glow: 0.9 }), [0, 0, 0], { parent: g, seg: 14 });
  b.scale.set(2.2, 0.8, 0.9); b.rotation.z = 0.35;
  E.sphere(0.035 * s, E.mat("#5a1d8a"), [0.05 * s, 0.03 * s, 0.09 * s], { parent: g, seg: 8 });
  return g;
}

function makeRat(E, s = 1) {
  const g = E.group(null, [0, 0, 0]);
  const fur = E.mat("#8d8a93"), pink = E.mat("#e7a6b1");
  const body = E.sphere(0.22 * s, fur, [0, 0.2 * s, 0], { parent: g, seg: 14 }); body.scale.set(1.6, 0.95, 1.0);
  const head = E.group(g, [0.36 * s, 0.25 * s, 0]);
  const h = E.sphere(0.13 * s, fur, [0, 0, 0], { parent: head, seg: 12 }); h.scale.set(1.4, 1, 1);
  E.sphere(0.035 * s, pink, [0.18 * s, -0.01 * s, 0], { parent: head, seg: 8 });
  for (const z of [0.08, -0.08]) {
    const ear = E.sphere(0.07 * s, pink, [-0.03 * s, 0.11 * s, z * s], { parent: head, seg: 8 }); ear.scale.set(0.4, 1, 1);
    E.sphere(0.028 * s, E.mat("#ffffff"), [0.09 * s, 0.05 * s, z * 0.75 * s], { parent: head, seg: 8 });
    E.sphere(0.017 * s, E.mat("#111111"), [0.11 * s, 0.05 * s, z * 0.8 * s], { parent: head, seg: 6 });
  }
  R.ratBrain = E.sphere(0.075 * s, E.mat("#c77dff", { emissive: PURPLE, glow: 1.6 }), [0.02 * s, 0.1 * s, 0], { parent: head, seg: 10 });
  R.ratBrain.visible = false;
  const tail = E.cyl(0.015 * s, 0.03 * s, 0.6 * s, pink, [0, 0, 0], { parent: g, seg: 6 }); tail.rotation.z = 1.25; tail.position.set(-0.5 * s, 0.16 * s, 0);
  R.ratLegs = [];
  for (const [x, z] of [[0.18, 0.1], [0.18, -0.1], [-0.18, 0.1], [-0.18, -0.1]]) R.ratLegs.push(E.box(0.05 * s, 0.12 * s, 0.05 * s, pink, [x * s, 0, z * s], { parent: g }));
  R.ratHead = head;
  return g;
}

function makeCat(E, s = 1) {
  const g = E.group(null, [0, 0, 0]);
  const fur = E.mat("#2b2633");
  const body = E.sphere(0.35 * s, fur, [0, 0.42 * s, 0], { parent: g, seg: 14 }); body.scale.set(1.5, 0.9, 0.9);
  R.catBelly = E.sphere(0.2 * s, E.mat("#c77dff", { emissive: PURPLE, glow: 1.4, transparent: true, opacity: 0.85 }), [0, 0.38 * s, 0.18 * s], { parent: g, seg: 12 });
  R.catBelly.visible = false;
  const head = E.group(g, [0.55 * s, 0.75 * s, 0]);
  E.sphere(0.25 * s, fur, [0, 0, 0], { parent: head, seg: 14 });
  for (const z of [0.13, -0.13]) {
    const ear = E.cone(0.09 * s, 0.2 * s, fur, [-0.02 * s, 0.2 * s, z * s], { parent: head, seg: 4 }); ear.rotation.x = z > 0 ? -0.3 : 0.3;
    E.sphere(0.065 * s, E.mat("#ffd23f", { emissive: "#ffb800", glow: 1.3 }), [0.19 * s, 0.05 * s, z * 0.75 * s], { parent: head, seg: 10 });
    E.box(0.02 * s, 0.09 * s, 0.03 * s, E.mat("#111111"), [0.25 * s, 0.005 * s, z * 0.75 * s], { parent: head });
  }
  E.sphere(0.03 * s, E.mat("#e58a9a"), [0.25 * s, -0.04 * s, 0], { parent: head, seg: 6 });
  const tail = E.cyl(0.04 * s, 0.05 * s, 0.7 * s, fur, [0, 0, 0], { parent: g, seg: 8 }); tail.position.set(-0.6 * s, 0.6 * s, 0); tail.rotation.z = 0.6;
  for (const [x, z] of [[0.3, 0.15], [0.3, -0.15], [-0.3, 0.15], [-0.3, -0.15]]) E.cyl(0.06 * s, 0.06 * s, 0.32 * s, fur, [x * s, 0, z * s], { parent: g, seg: 8 });
  R.catHead = head;
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.grass("#4f6b3f"), 400, 0.25);
  // ---- ev (x=0): oturma odası + mutfak ----
  S.room({ w: 9, d: 7, h: 3.4, wall: T.wallpaper("#3e4a5c", "#36414f", "stripe"), floor: T.planks("#6b4428"), window: true, door: true, night: true });
  S.rug(0, 0.5, 4, 3, "#7a3040");
  // kanepe
  const sofa = E.group(null, [-1.2, 0, -1.6]);
  const sm = E.mat("#5d3a4a");
  E.box(2.4, 0.45, 0.9, sm, [0, 0, 0], { parent: sofa }); E.box(2.4, 0.6, 0.25, sm, [0, 0.45, -0.33], { parent: sofa });
  E.box(0.25, 0.35, 0.9, sm, [-1.1, 0.45, 0], { parent: sofa }); E.box(0.25, 0.35, 0.9, sm, [1.1, 0.45, 0], { parent: sofa });
  S.lamp && S.hangLamp(0.5, 3.4, -0.5, {});
  S.table(2.2, -1.8, { w: 1.4, d: 0.8 }); S.shelf(3.6, -3.2, {});
  // peynir/yemek kabı
  R.cheese = E.box(0.18, 0.1, 0.14, E.mat("#ffcf4a"), [1.0, 0, 1.4]);
  // kedi kumu + çiğ et (mutfak masası)
  const lb = E.group(null, [-2.8, 0, 0.6]);
  E.box(0.8, 0.22, 0.6, E.mat("#3a4a5e"), [0, 0, 0], { parent: lb }); E.box(0.72, 0.04, 0.52, E.mat("#d9c49a"), [0, 0.2, 0], { parent: lb });
  E.label(T.sign("KEDİ KUMU", { bg: "#3a4a5e", fg: "#ffffff", size: 110 }), 0.6, 0.13, [-2.8, 0.06, 0.92]);
  const steak = E.sphere(0.2, E.mat("#c2405a"), [2.0, 0.98, -1.75], { seg: 12 }); steak.scale.set(1.3, 0.3, 1);
  E.sphere(0.13, E.mat("#ef8aa0"), [2.0, 1.02, -1.75], { seg: 10 }).scale.set(1.2, 0.25, 0.9);
  R.cat = makeCat(E, 1); R.rat = makeRat(E, 1);
  R.parasites = [];
  for (let i = 0; i < 9; i++) R.parasites.push(parasite(E, null, [0, -50, 0], 1));
  // ---- laboratuvar / mikroskop (x=LX) ----
  E.box(12, 8, 0.2, E.mat("#0c0716"), [LX, 0, -3]);
  const lens = E.cyl(2.2, 2.2, 0.05, E.mat("#1c0f30", { emissive: "#2a1048", glow: 0.6 }), [LX, 2, -2.85], { seg: 48 }); lens.rotation.x = Math.PI / 2;
  E.cyl(2.35, 2.35, 0.04, E.mat("#3b2a55"), [LX, 2, -2.88], { seg: 48 }).rotation.x = Math.PI / 2;
  R.micro = []; for (let i = 0; i < 6; i++) R.micro.push(parasite(E, null, [LX + (i - 2.5) * 0.6, 2 + Math.sin(i * 2) * 0.8, -2.6], i === 2 ? 2.6 : 1.2));
  // ---- kalabalık sokak (x=CX) ----
  S.street({ len: 60, z: 0 }); S.row(CX - 25, CX + 25, -9, { seed: 3 }); S.clouds();
  R.halos = [];
  for (let i = 0; i < 9; i++) { const h = E.sphere(0.13, E.mat("#c77dff", { emissive: PURPLE, glow: 1.8 }), [0, -50, 0], { seg: 10 }); R.halos.push(h); }
  // ---- karakterler ----
  E.actor("man", { skin: "#f2d2b0", shirt: "#3f6fb5", pants: "#2b2633", hair: "short", hairCol: "#2a1d16", beard: "#2a1d16", seed: 7 });
  const cols = ["#c2843a", "#7b5ac9", "#3f8a6a", "#b5653f", "#5d6b7a", "#e8dcc4", "#8a3a3a", "#3f6fb5", "#c9a24a"];
  for (let i = 0; i < 9; i++) E.actor("p" + i, { shirt: cols[i], dress: i % 4 === 1 ? cols[i] : null, hair: ["short", "long", "bun", "part", "spiky"][i % 5], hairCol: ["#2a1d16", "#7a4a2a", "#c9a24a"][i % 3], glasses: i === 4, seed: 30 + i * 5, skin: ["#fbf5ea", "#e9c3a0", "#f6dcc0", "#c98f66"][i % 4] });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(20,14,24,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = PURPLE; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#e3c2ff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "") => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${150 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#1a0f24"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = "#d9a6ff"; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

function place(obj, x, y, z, yaw = 0, s = 1) { obj.position.set(x, y, z); obj.rotation.y = yaw; obj.scale.setScalar(s); obj.visible = true; }
function hideAll() {
  R.cat.visible = R.rat.visible = false; R.catBelly.visible = false; R.ratBrain.visible = false;
  R.parasites.forEach((p) => (p.visible = false)); R.halos.forEach((h) => (h.position.y = -50));
}
function walk(f, speed = 1) { R.ratLegs.forEach((l, i) => (l.rotation.z = 0.6 * Math.sin(f * 0.6 * speed + (i % 2) * Math.PI))); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "night", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = null;
  const flashIn = (f0, n = 6) => Math.max(0, 1 - Math.abs(f - f0) / n);
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  hideAll();
  R.micro.forEach((p, i) => { p.rotation.z = 0.3 * Math.sin(f / 20 + i); p.position.y = 2 + Math.sin(i * 2) * 0.8 + 0.08 * Math.sin(f / 15 + i); });

  switch (sh.name) {
    case "hook": case "end": {
      light = sh.name === "hook" ? "dramatic" : "night";
      A.push({ id: "man", pos: [-1.0, 0.25, -1.4], st: st(1, { legs: "sit", face: sh.name === "end" ? "nervous" : "neutral", arms: "hang", look: 0.5, sweat: sh.name === "end" }) });
      place(R.cat, 0.3, 0.45, -1.5, -2.6, 0.7);
      R.catHead.rotation.y = 0.3;
      // kafadaki parazitler (parlayan noktalar)
      for (let i = 0; i < 4; i++) { const p = R.parasites[i]; const a = f / 18 + i * 1.6; place(p, -1.0 + 0.22 * Math.cos(a), 1.8 + 0.07 * Math.sin(a * 1.3), -1.5, 0, 0.22 + 0.05 * Math.sin(f / 7 + i)); }
      const near = sh.name === "end" ? X.smooth(X.span(f, 975, 1090)) : 0;
      cam = E.camAt(f, sh.name === "hook"
        ? [{ f: 0, pos: [-0.7, 1.45, 1.5], look: [-0.95, 1.25, -1.4], fov: 40 }, { f: 86, pos: [-0.8, 1.42, 0.9], look: [-0.98, 1.3, -1.4], fov: 38 }]
        : [{ f: 975, pos: [0.0, 1.6, 3.0], look: [-0.5, 1.0, -1.4], fov: 44 }, { f: 1091, pos: [-0.75, 1.45, 1.0], look: [-0.98, 1.28, -1.4], fov: 38 }]);
      dof = { focus: [-1.0, 1.3, -1.4], amount: 9 }; focusPt = [-0.6, 0, -1.4];
      if (sh.name === "end" && f > 1036) overlay = big("Peki ya sen?", X.span(f, 1038, 1046));
      break;
    }
    case "micro": {
      light = "night";
      cam = E.camAt(f, [{ f: 87, pos: [LX, 2, 3.2], look: [LX, 2, -2.8], fov: 46 }, { f: 139, pos: [LX + 0.2, 2.05, 2.2], look: [LX, 2, -2.8], fov: 44 }]);
      overlay = card("Toxoplasma gondii", "tek hücreli bir parazit");
      break;
    }
    case "catdream": case "multiply": {
      light = "interior";
      place(R.cat, 0.4, 0, 0.2, -1.1, 1.2);
      R.catHead.rotation.y = 0.2 * Math.sin(f / 25);
      if (sh.name === "multiply") {
        R.catBelly.visible = true; const s = 0.6 + 0.6 * X.easeOut(X.span(f, 174, 210)); R.catBelly.scale.setScalar(s);
        for (let i = 0; i < 7; i++) { const a = i * 0.9 + f / 30; place(R.parasites[i], 0.4 + 0.35 * Math.cos(a), 0.55 + 0.18 * Math.sin(a), 0.75, 0, 0.3 * X.back(X.span(f, 176 + i * 4, 190 + i * 4))); }
        FX.push({ kind: "sparkle", pos: [0.4, 1.0, 0.8], size: 0.6, t: t / 20 });
      } else {
        place(R.parasites[0], 0.2 + 1.2 * (1 - X.span(f, 140, 172)), 2.1 - 1.3 * X.span(f, 140, 172), 1.0, 0, 0.45);
        FX.push({ kind: "hearts", pos: [0.9, 1.9, 0.6], size: 0.5, t: t / 20 });
      }
      cam = E.camAt(f, [{ f: 140, pos: [1.2, 1.4, 4.4], look: [0.5, 0.75, 0.2], fov: 42 }, { f: 220, pos: [1.1, 1.3, 3.8], look: [0.5, 0.7, 0.2], fov: 40 }]);
      dof = { focus: [0.5, 0.7, 0.3], amount: 7 };
      break;
    }
    case "ratfood": {
      light = "interior";
      const x = X.keyed(f, [[221, -1.2], [270, 0.75], [298, 0.75]], (v) => v);
      place(R.rat, x, 0, 1.4, 0, 1.2); if (f < 270) walk(f, 1.5);
      R.ratHead.rotation.z = f > 270 ? 0.25 * Math.abs(Math.sin(f / 3)) : 0;
      R.cheese.visible = true;
      const fall = X.span(f, 225, 262); place(R.parasites[0], 1.0, 2.0 - 1.9 * fall, 1.4, 0, 0.3); R.parasites[0].visible = fall < 1;
      cam = E.camAt(f, [{ f: 221, pos: [0.0, 1.2, 4.6], look: [0.2, 0.3, 1.4], fov: 42 }, { f: 298, pos: [0.6, 1.0, 3.8], look: [0.7, 0.3, 1.4], fov: 40 }]);
      dof = { focus: [0.8, 0.3, 1.4], amount: 8 }; focusPt = [0.5, 0, 1.4];
      overlay = card("Kahverengi sıçan", "parazitin taşıyıcısı");
      if (f < 240) overlay = null;
      break;
    }
    case "ratbrain": {
      light = "dramatic";
      place(R.rat, 0, 0, 1.4, 0, 1.6); R.ratBrain.visible = true;
      const s = 1 + 0.25 * Math.abs(Math.sin(t / 5)); R.ratBrain.scale.setScalar(s);
      cam = E.camAt(f, [{ f: 299, pos: [1.3, 1.0, 3.9], look: [0.45, 0.45, 1.4], fov: 38 }, { f: 378, pos: [1.1, 0.95, 3.4], look: [0.5, 0.45, 1.4], fov: 36 }]);
      dof = { focus: [0.55, 0.45, 1.4], amount: 10 };
      if (f > 335) FX.push({ kind: "cross", pos: [0.9, 1.0, 1.5], size: 0.28 * X.back(X.span(f, 335, 345)) });
      else FX.push({ kind: "exclaim", pos: [0.6, 0.95, 1.5], size: 0.4 });
      overlay = big("Korku: 0", X.span(f, 340, 348));
      break;
    }
    case "flee": case "approach": {
      light = "interior";
      place(R.cat, 2.4, 0, -0.4, -2.2, 1.0); R.catHead.rotation.y = 0.15 * Math.sin(f / 20);
      const flee = sh.name === "flee";
      const x = flee ? X.keyed(f, [[379, 0.6], [470, -2.6]], (v) => v) : X.keyed(f, [[476, -1.5], [598, 1.1]], (v) => v);
      place(R.rat, x, 0, 1.0, flee ? Math.PI : -0.25, 1.1); walk(f, flee ? 2.2 : 0.8);
      if (flee) FX.push({ kind: "lines", pos: [x + 0.6, 0.4, 1.0], size: 0.6, t: t / 10 }, { kind: "sweat", pos: [x, 0.7, 1.0], size: 0.4 });
      else { R.ratHead.rotation.z = 0.1 * Math.sin(f / 8); FX.push({ kind: "hearts", pos: [x + 0.4, 0.8, 1.0], size: 0.35, t: t / 20 }); }
      cam = E.camAt(f, flee ? [{ f: 379, pos: [-0.2, 1.4, 4.6], look: [0, 0.4, 0.6], fov: 46 }, { f: 475, pos: [-0.8, 1.3, 4.4], look: [-0.6, 0.4, 0.6], fov: 46 }]
        : [{ f: 476, pos: [-0.6, 1.0, 4.0], look: [0.4, 0.5, 0.4], fov: 46 }, { f: 600, pos: [0.4, 0.9, 3.4], look: [1.4, 0.6, 0.2], fov: 44 }]);
      dof = { focus: [x, 0.4, 1.0], amount: 5 }; focusPt = [0.5, 0, 0.5];
      break;
    }
    case "pounce": {
      light = "dramatic";
      flash = flashIn(603, 5);
      const p = X.easeOut(X.span(f, 601, 615));
      place(R.cat, 2.4 - 1.1 * p, 0.25 * Math.sin(p * Math.PI), -0.4 + 1.2 * p, -2.4, 1.0);
      place(R.rat, 1.1, 0, 1.0, -0.25, 1.1); R.rat.visible = f < 612;
      FX.push({ kind: "burst", pos: [1.2, 1.2, 1.2], size: 1.3 * X.back(X.span(f, 603, 612)), t: X.span(f, 603, 640), opt: { text: "HAP!" } });
      cam = { pos: [0.6, 1.2, 3.8], look: [1.2, 0.6, 0.6], fov: 44, roll: 0 }; shake(605, 0.08, 15);
      break;
    }
    case "home": {
      light = "interior";
      place(R.cat, 0.4, 0, 0.2, -1.1, 1.2); R.catBelly.visible = true; R.catBelly.scale.setScalar(1 + 0.15 * Math.sin(f / 6));
      FX.push({ kind: "sparkle", pos: [0.4, 0.9, 0.9], size: 0.7, t: t / 20 });
      cam = E.camAt(f, [{ f: 644, pos: [1.2, 1.4, 4.4], look: [0.45, 0.7, 0.2], fov: 42 }, { f: 688, pos: [1.1, 1.3, 4.0], look: [0.45, 0.7, 0.2], fov: 40 }]);
      dof = { focus: [0.45, 0.7, 0.3], amount: 7 };
      overlay = big("Eve döndü", X.span(f, 650, 658));
      break;
    }
    case "human": {
      light = "interior";
      A.push({ id: "man", pos: [0.6, 0, -0.6], st: st(1, { face: "happy", arms: "reach", look: -0.6 }) });
      place(R.cat, -0.5, 0, 0.2, -0.4, 0.75); R.catHead.rotation.y = -0.8;
      FX.push({ kind: "hearts", pos: [0.0, 1.6, 0.0], size: 0.4, t: t / 20 });
      if (f > 713) FX.push({ kind: "question", pos: [0.8, 2.9, -0.5], size: 0.6 * X.back(X.span(f, 713, 722)) });
      cam = E.camAt(f, [{ f: 689, pos: [0.1, 1.7, 3.8], look: [0.1, 1.2, -0.3], fov: 44 }, { f: 791, pos: [0.2, 1.6, 3.0], look: [0.2, 1.2, -0.3], fov: 42 }]);
      dof = { focus: [0.2, 1.2, -0.3], amount: 5 }; focusPt = [0, 0, -0.2];
      break;
    }
    case "food": {
      light = "interior";
      const toLitter = f > 830;
      cam = toLitter ? E.camAt(f, [{ f: 830, pos: [-2.3, 1.0, 2.0], look: [-2.8, 0.2, 0.6], fov: 38 }, { f: 864, pos: [-2.4, 0.9, 1.7], look: [-2.8, 0.2, 0.6], fov: 36 }])
        : E.camAt(f, [{ f: 792, pos: [1.6, 1.6, -0.6], look: [2.0, 1.0, -1.75], fov: 38 }, { f: 829, pos: [1.7, 1.5, -0.9], look: [2.0, 1.0, -1.75], fov: 36 }]);
      const target = toLitter ? [-2.8, 0.45, 0.65] : [2.0, 1.2, -1.6];
      for (let i = 0; i < 3; i++) place(R.parasites[i], target[0] + (i - 1) * 0.12, target[1] + 0.04 * Math.sin(f / 6 + i), target[2], 0, 0.13);
      dof = { focus: target, amount: 9 };
      break;
    }
    case "crowd": {
      light = "day";
      for (let i = 0; i < 9; i++) {
        const x = CX - 2.4 + (i % 3) * 2.4 + (Math.floor(i / 3) % 2) * 0.8, z = -Math.floor(i / 3) * 1.6;
        A.push({ id: "p" + i, pos: [x, 0, z], st: st(40 + i, { face: "neutral", arms: "hang", legs: "walk", phase: (f + i * 7) / 26 }) });
        if (i % 3 === 1) { const h = R.halos[i]; h.position.set(x, 2.45 + 0.05 * Math.sin(f / 8 + i), z + 0.1); h.scale.setScalar(X.back(X.span(f, 880 + i * 6, 892 + i * 6))); }
      }
      cam = E.camAt(f, [{ f: 865, pos: [CX, 3.0, 7.5], look: [CX, 1.3, -1.6], fov: 46 }, { f: 974, pos: [CX, 2.7, 6.4], look: [CX, 1.3, -1.6], fov: 46 }]);
      focusPt = [CX, 0, -1.5];
      overlay = big("3 kişiden 1", X.span(f, 905, 913), "tahmini, dünya geneli");
      break;
    }
  }
  return { cam, light, dof, actors: A, fx: FX, flash, overlay, focusPt };
}
