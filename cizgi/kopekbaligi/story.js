// 500 Yıl Yaşayan Köpekbalığı — PMDARWIN (dfki sesi, ~34 sn)
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [128, "name"], [161, "ice"], [265, "slow"], [350, "grow"], [425, "lab"], [524, "c272"],
  [595, "c392"], [651, "c500"], [675, "cake"], [821, "baby"], [963, "end"]];
const END = 1029;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };

const ICE = "#9fe7ff";
const IX = 100, LX = 200; // buzullar, laboratuvar
let R = {};

function makeShark(E) {
  const g = E.group(null, [0, -50, 0]);
  const skin = E.mat("#5d5a5f"), belly = E.mat("#8e8b90");
  const b = E.sphere(0.5, skin, [0, 0, 0], { parent: g, seg: 24 }); b.scale.set(3.0, 0.78, 0.85);
  const bl = E.sphere(0.46, belly, [0.1, -0.12, 0], { parent: g, seg: 20 }); bl.scale.set(2.7, 0.55, 0.78);
  // göz (uykulu): beyaz + gözbebeği + göz kapağı
  for (const z of [0.3, -0.3]) {
    E.sphere(0.075, E.mat("#e9edf0"), [1.18, 0.1, z], { parent: g, seg: 10 });
    E.sphere(0.04, E.mat("#111111"), [1.24, 0.1, z * 1.04], { parent: g, seg: 8 });
    const lid = E.sphere(0.08, skin, [1.19, 0.15, z], { parent: g, seg: 10 }); lid.scale.set(1, 0.55, 1);
  }
  E.box(0.35, 0.02, 0.5, E.mat("#2e2b30"), [1.15, -0.2, 0], { parent: g, center: true });
  const d1 = E.cone(0.16, 0.3, skin, [0.05, 0.3, 0], { parent: g, seg: 4 }); d1.rotation.z = 0.5; d1.scale.z = 0.25;
  const d2 = E.cone(0.12, 0.22, skin, [-0.55, 0.24, 0], { parent: g, seg: 4 }); d2.rotation.z = 0.5; d2.scale.z = 0.25;
  for (const z of [0.42, -0.42]) { const p = E.box(0.45, 0.04, 0.32, skin, [0.55, -0.22, z], { parent: g, center: true, rot: [z > 0 ? 0.4 : -0.4, 0, -0.3] }); }
  const tail = E.group(g, [-1.4, 0.02, 0]); g.userData.tail = tail;
  const t1 = E.cone(0.18, 0.65, skin, [-0.3, 0.12, 0], { parent: tail, seg: 4 }); t1.rotation.z = 2.0; t1.scale.z = 0.2;
  const t2 = E.cone(0.14, 0.4, skin, [-0.2, -0.12, 0], { parent: tail, seg: 4 }); t2.rotation.z = 1.0; t2.scale.z = 0.2;
  const ts = E.sphere(0.2, skin, [-0.1, 0, 0], { parent: tail, seg: 10 }); ts.scale.set(1.4, 0.5, 0.5);
  const hat = E.cone(0.14, 0.38, E.mat("#ff5c8a"), [0.85, 0.32, 0], { parent: g, seg: 12 }); hat.rotation.z = -0.25; hat.visible = false; g.userData.hat = hat;
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.sand("#3d4a4a"), 600, 0.4);
  // ---- deniz altı (x=0) ----
  E.box(80, 30, 0.4, E.mat("#1d5a86"), [0, -2, -10]);
  E.box(0.4, 30, 30, E.mat("#1d5a86"), [-25, -2, 0]); E.box(0.4, 30, 30, E.mat("#1d5a86"), [25, -2, 0]);
  E.plane(80, 40, E.mat("#2f7fb0", { transparent: true, opacity: 0.55, emissive: "#1f5f8a", glow: 0.4 }), [0, 6, 0], { rot: [Math.PI / 2, 0, 0] });
  const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
  R.snow = []; for (let i = 0; i < 50; i++) R.snow.push(E.sphere(0.025, E.mat("#dff4ff", { emissive: "#bfe9ff", glow: 0.8 }), [-6 + rnd(i) * 12, 0.3 + rnd(i + 9) * 5, -4 + rnd(i + 3) * 6], { seg: 6 }));
  for (let i = 0; i < 12; i++) { const r = E.sphere(0.3 + rnd(i + 40) * 0.6, E.mat("#2b3536"), [-8 + rnd(i + 20) * 16, 0, -6 + rnd(i + 30) * 5], { seg: 10 }); r.scale.y = 0.5; }
  // Osmanlı gemisi (yüzeyde)
  const ship = E.group(null, [1.5, 6, -1.5]); R.ship = ship;
  E.box(4.5, 0.9, 1.4, E.mat("#5a3a22"), [0, -0.5, 0], { parent: ship });
  E.box(1.2, 0.6, 1.3, E.mat("#6b4428"), [-1.7, 0.4, 0], { parent: ship });
  E.cyl(0.07, 0.09, 4.2, E.mat("#3b2716"), [0.3, 0.4, 0], { parent: ship, seg: 8 });
  E.box(1.8, 1.6, 0.05, E.mat("#efe6cf"), [0.3, 1.6, 0], { parent: ship });
  E.label(T.sign("☾", { bg: "#c0262e", fg: "#ffffff", size: 160 }), 0.7, 0.45, [1.8, 10.2, -1.5]);
  // pasta (deniz tabanı)
  const cake = E.group(null, [-1.2, 0, 0.6]); R.cake = cake;
  E.cyl(0.55, 0.55, 0.35, E.mat("#f4d8e4"), [0, 0, 0], { parent: cake, seg: 28 });
  E.cyl(0.42, 0.42, 0.3, E.mat("#fbeef4"), [0, 0.35, 0], { parent: cake, seg: 28 });
  R.flames = [];
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 0.32 : 0.2; E.cyl(0.015, 0.015, 0.16, E.mat("#7ec8ff"), [r * Math.cos(a), 0.65, r * Math.sin(a)], { parent: cake, seg: 6 }); R.flames.push(E.sphere(0.03, E.mat("#ffd36b", { emissive: "#ffb400", glow: 1.6 }), [r * Math.cos(a), 0.84, r * Math.sin(a)], { parent: cake, seg: 6 })); }
  E.label(T.sign("150", { bg: "#ff5c8a", fg: "#ffffff", size: 150 }), 0.5, 0.25, [-1.2, 0.08, 1.16]);
  R.cake.visible = false;
  // cetvel
  R.ruler = E.label(T.sign("| 1 cm |", { bg: "#ffd23f", fg: "#1a1a1a", size: 120 }), 0.9, 0.22, [0, -50, 0.6]);
  // hızlı balık
  R.fish = E.group(null, [0, -50, 0]);
  const fb = E.sphere(0.12, E.mat("#ff8a3d"), [0, 0, 0], { parent: R.fish, seg: 10 }); fb.scale.set(1.8, 1, 0.6);
  const ft = E.cone(0.09, 0.14, E.mat("#ff8a3d"), [-0.25, -0.07, 0], { parent: R.fish, seg: 4 }); ft.rotation.z = Math.PI / 2;
  // ---- buzullar (x=IX) ----
  E.box(60, 0.05, 60, E.mat("#123d5c", { emissive: "#0d2d45", glow: 0.3 }), [IX, 0.02, 0]);
  for (let i = 0; i < 7; i++) { const c = E.cone(0.8 + rnd(i + 60) * 1.4, 1.2 + rnd(i + 70) * 2.2, E.mat(i % 2 ? "#eaf8ff" : "#cdeefc", { emissive: "#bfe9ff", glow: 0.2 }), [IX - 9 + i * 3, 0, -5 - rnd(i + 80) * 6], { seg: 5 }); c.rotation.y = rnd(i) * 3; }
  S.mountains && S.clouds();
  // ---- laboratuvar (x=LX) ----
  const lab = E.group(null, [LX, 0, 0]);
  E.box(8, 3.4, 0.2, E.mat("#5e6d72"), [0, 0, -2.2], { parent: lab });
  E.box(1.8, 0.95, 0.8, E.mat("#e9eef0"), [0.4, 0, -0.3], { parent: lab });
  const jar = E.cyl(0.32, 0.32, 0.55, E.mat("#bfe6ff", { transparent: true, opacity: 0.35 }), [0.6, 0.95, -0.3], { parent: lab, seg: 24 });
  R.eye = E.sphere(0.2, E.mat("#e9edf0"), [LX + 0.6, 1.22, -0.3], { seg: 18 });
  E.sphere(0.11, E.mat("#2f6f8f"), [LX + 0.6, 1.22, -0.13], { seg: 14 }).scale.z = 0.5;
  E.sphere(0.055, E.mat("#0b0b0b"), [LX + 0.6, 1.22, -0.08], { seg: 10 }).scale.z = 0.4;
  E.actor("sci", { jacket: "#eef1f2", shirt: "#7c8fa3", pants: "#3a3a44", tie: "#2b4a7a", hair: "bun", hairCol: "#7a4a2a", glasses: true, skin: "#f6dcc0", seed: 9 });
  R.shark = makeShark(E); R.baby = makeShark(E);
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(8,20,30,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = ICE; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#cdf3ff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = ICE, size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#06141e"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
function swim(f, sp = 1, o = R.shark) { o.userData.tail.rotation.y = 0.35 * Math.sin(f / 9 * sp); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  let cam, light = "night", dof = { focus: 4, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0];
  R.shark.visible = R.baby.visible = false; R.shark.position.y = R.baby.position.y = -50; R.shark.userData.hat.visible = false; R.cake.visible = false;
  R.ruler.position.y = -50; R.fish.position.y = -50;
  R.snow.forEach((s, i) => { s.position.y = 0.3 + ((i * 0.37 + 5 - f * 0.004) % 5 + 5) % 5; });
  const sx = (x0, v = 0.004) => x0 + v * t;

  switch (sh.name) {
    case "hook": {
      const x = sx(-1.8, 0.006); put(R.shark, x, 2.2, 0, 0); swim(f);
      R.ship.position.x = 1.5 - 0.003 * f;
      cam = E.camAt(f, [{ f: 0, pos: [-0.5, 1.3, 5.5], look: [0.0, 3.6, -0.5], fov: 50 }, { f: 127, pos: [-0.2, 1.4, 4.8], look: [0.2, 3.4, -0.5], fov: 48 }]);
      focusPt = [0, 0, 0];
      overlay = big("Osmanlı'dan", X.span(f, 20, 28), "beri yüzüyor", "#ffd27a", 120);
      break;
    }
    case "name": {
      const x = sx(-0.4, 0.004); put(R.shark, x, 1.6, 0, 0); swim(f);
      cam = E.camAt(f, [{ f: 128, pos: [x + 1.6, 1.9, 3.6], look: [x + 0.3, 1.6, 0], fov: 44 }, { f: 160, pos: [x + 1.4, 1.85, 3.3], look: [x + 0.3, 1.6, 0], fov: 44 }]);
      dof = { focus: [x + 0.4, 1.6, 0], amount: 6 };
      overlay = card("Grönland köpekbalığı", "Somniosus microcephalus");
      break;
    }
    case "ice": {
      light = "day";
      cam = E.camAt(f, [{ f: 161, pos: [IX - 2, 1.6, 7], look: [IX, 1.4, -6], fov: 50 }, { f: 264, pos: [IX - 0.5, 1.5, 6], look: [IX + 1, 1.3, -6], fov: 50 }]);
      focusPt = [IX, 0, -4];
      overlay = card("Kuzey Atlantik", "buz gibi, karanlık sular");
      break;
    }
    case "slow": {
      const x = sx(-0.8, 0.004); put(R.shark, x, 1.6, 0, 0); swim(f, 0.7);
      const fx = -4 + 10 * X.span(f, 290, 330); put(R.fish, fx, 1.9, 0.9, 0);
      cam = E.camAt(f, [{ f: 265, pos: [x, 1.9, 4.8], look: [x, 1.6, 0], fov: 46 }, { f: 349, pos: [x + 0.2, 1.85, 4.4], look: [x + 0.2, 1.6, 0], fov: 46 }]);
      dof = { focus: [x, 1.6, 0], amount: 4 };
      if (f > 290 && f < 335) FX.push({ kind: "lines", pos: [fx - 0.4, 1.9, 0.9], size: 0.35, t: (f % 10) / 10 });
      overlay = big("≈ 1,2 km/sa", X.span(f, 272, 280), "yürüyüşünün dörtte biri", ICE, 120);
      break;
    }
    case "grow": {
      put(R.shark, 0, 1.4, 0, 0); swim(f, 0.5);
      R.ruler.position.set(1.42 + 0.03 * X.span(f, 370, 410), 1.1, 0.6);
      cam = E.camAt(f, [{ f: 350, pos: [1.6, 1.7, 2.6], look: [1.1, 1.35, 0.2], fov: 40 }, { f: 424, pos: [1.5, 1.65, 2.3], look: [1.15, 1.35, 0.2], fov: 38 }]);
      dof = { focus: [1.3, 1.3, 0.4], amount: 7 };
      overlay = big("+1 cm", X.span(f, 360, 368), "yılda", "#ffd23f", 140);
      break;
    }
    case "lab": {
      light = "interior";
      A.push({ id: "sci", pos: [LX - 0.6, 0, -0.9], st: { blink: E.blink(f, 9), ...E.idle(f, 9), face: "think", arms: "hold", prop: { kind: "magnifier", hand: "r" }, look: 0.6 } });
      cam = E.camAt(f, [{ f: 425, pos: [LX + 1.2, 1.7, 2.8], look: [LX + 0.1, 1.3, -0.4], fov: 42 }, { f: 523, pos: [LX + 1.0, 1.6, 2.4], look: [LX + 0.2, 1.3, -0.4], fov: 40 }]);
      dof = { focus: [LX + 0.3, 1.3, -0.4], amount: 5 }; focusPt = [LX, 0, -0.5];
      overlay = card("Göz merceği", "radyokarbon tarihleme");
      break;
    }
    case "c272": case "c392": case "c500": {
      const x = sx(-0.2, 0.003); put(R.shark, x, 1.6, 0, 0.35); swim(f, 0.6);
      const n = sh.name === "c272" ? Math.round(272 * X.easeOut(X.span(f, 524, 580))) : sh.name === "c392" ? 272 + Math.round(120 * X.easeOut(X.span(f, 597, 630))) : 500;
      const txt = sh.name === "c500" ? "500?" : sh.name === "c272" ? `${n}+` : `≈${n}`;
      const sub = sh.name === "c272" ? "en az (yıl)" : sh.name === "c392" ? "tahmini yaş" : "belki";
      cam = E.camAt(f, [{ f: 524, pos: [x + 2.6, 1.8, 3.4], look: [x + 0.4, 1.6, 0], fov: 44 }, { f: 674, pos: [x + 2.0, 1.75, 2.9], look: [x + 0.4, 1.6, 0], fov: 42 }]);
      dof = { focus: [x + 0.6, 1.6, 0], amount: 6 };
      overlay = big(txt, 1, sub, sh.name === "c500" ? "#ff8a8a" : "#ffd27a", 190);
      if (sh.name === "c500") { flash = Math.max(0, 1 - Math.abs(f - 653) / 5) * 0.4; FX.push({ kind: "question", pos: [x + 1.2, 2.5, 0], size: 0.5 }); }
      break;
    }
    case "cake": {
      R.cake.visible = true;
      R.flames.forEach((fl, i) => fl.scale.setScalar(1 + 0.25 * Math.sin(f / 3 + i)));
      put(R.shark, 0.9, 1.0, 0.3, Math.PI - 0.35); swim(f, 0.5); R.shark.userData.hat.visible = true;
      cam = E.camAt(f, [{ f: 675, pos: [-0.5, 1.6, 3.8], look: [-0.3, 0.8, 0.4], fov: 46 }, { f: 820, pos: [-0.4, 1.4, 3.2], look: [-0.3, 0.8, 0.4], fov: 44 }]);
      dof = { focus: [-0.4, 0.8, 0.5], amount: 5 };
      FX.push({ kind: "sparkle", pos: [-1.2, 1.2, 0.6], size: 0.5, t: t / 20 });
      overlay = big("Yavru için", X.span(f, 700, 708), "≈ 150 yaş beklemek lazım", "#ff9dc0", 120);
      break;
    }
    case "baby": {
      const x = sx(-1.0, 0.006); put(R.baby, x, 1.3, 0.4, 0, 0.35); R.baby.visible = true;
      swim(f, 1.8, R.baby);
      const yr = 2026 + Math.round(150 * X.smooth(X.span(f, 880, 950)));
      cam = E.camAt(f, [{ f: 821, pos: [x + 0.4, 1.5, 2.2], look: [x + 0.1, 1.3, 0.4], fov: 40 }, { f: 962, pos: [x + 0.5, 1.5, 2.0], look: [x + 0.2, 1.3, 0.4], fov: 40 }]);
      dof = { focus: [x + 0.15, 1.3, 0.4], amount: 8 };
      overlay = big(String(yr), X.span(f, 828, 836), f > 950 ? "ilk yavrusu" : "doğdu", "#ffd27a", 170);
      break;
    }
    case "end": {
      const x = sx(0.5, 0.012); put(R.shark, x, 1.8, -1.0, 0.25); swim(f, 0.7);
      cam = E.camAt(f, [{ f: 963, pos: [-1.5, 1.6, 4.2], look: [0.6, 1.8, -1], fov: 46 }, { f: 1028, pos: [-1.2, 1.7, 4.0], look: [1.3, 1.8, -1], fov: 46 }]);
      overlay = big("Tuhaf ama gerçek.", X.span(f, 965, 973), "", "#ffffff", 100);
      break;
    }
  }
  const under = sh.name !== "ice" && sh.name !== "lab";
  if (under) light = "day";
  const ov = overlay;
  const fin = (g, w, h) => { if (under) { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(60,150,210,0.30)"); gr.addColorStop(1, "rgba(5,30,60,0.55)"); g.save(); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.restore(); } if (ov) ov(g, w, h); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
