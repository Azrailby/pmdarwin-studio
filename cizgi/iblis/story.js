// İblis Çekirdeği — PMDARWIN (dfki sesi, ~35 sn)
export const meta = { fps: 30 };

// P00 0 hook · P01 112 LosAlamos · P03 173 Slotin · P04 208 kubbe · P05 329 tornavida aralığı · P06 435 ejderha
// P07 577 kaydı · P08 612 kapandı · P09 638 mavi ışık · P10 698 fırlattı · P11 809 dokuz gün · P12 870 bir yıl önce · P13 966 son
const SHOTS = [[0, "hook"], [112, "town"], [173, "slotin"], [208, "dome"], [329, "gap"], [435, "dragon"], [577, "slip"],
  [612, "close"], [638, "blue"], [698, "throw"], [809, "nine"], [870, "past"], [966, "end"]];
const END = 1048;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };

const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);
const BLUE = "#4fc3ff";
const TX = -100, HX = 100, VX = 200; // kasaba, hastane odası, boşluk (çekirdek)
const TOP = 1.0, SHELL = 1.14;       // masa üstü, alt kabuk üstü
let R = {}; let BLUEA = 0;

function makeCore(E, x, y, z) {
  const g = E.group(null, [x, y, z]);
  E.cyl(0.21, 0.17, 0.14, E.mat("#8e9aa6"), [0, 0, 0], { parent: g, seg: 28 });           // alt yarım kabuk
  E.sphere(0.1, E.mat("#b9c0c7"), [0, 0.14, 0], { parent: g, seg: 20 });                  // plütonyum küre
  const dome = E.group(g, [0, 0.4, 0]);
  const d = E.sphere(0.21, E.mat("#a3adb8"), [0, 0, 0], { parent: dome, seg: 28 }); d.scale.set(1, 0.6, 1);
  E.cyl(0.03, 0.03, 0.06, E.mat("#5d6670"), [0, 0.11, 0], { parent: dome, seg: 10 });   // başparmak deliği
  const glow = E.sphere(0.115, E.mat(BLUE, { emissive: BLUE, glow: 2.2, transparent: true, opacity: 0.4 }), [0, 0.14, 0], { parent: g, seg: 24 });
  glow.visible = false;
  return { g, dome, glow };
}
function makeDriver(E) {
  const g = E.group(null, [0, -50, 0]);
  E.cyl(0.012, 0.012, 0.22, E.mat("#e6ecf2"), [0, 0, 0], { parent: g, seg: 6 });
  E.cyl(0.026, 0.022, 0.12, E.mat("#e0a21b"), [0, 0.22, 0], { parent: g, seg: 10 });
  g.rotation.z = Math.PI / 2;
  return g;
}

export function build(E) {
  const { S, T } = E;
  E.ground(T.sand("#c9a56d"), 500, 0.25);
  // ---- laboratuvar (x=0) ----
  S.room({ w: 8, d: 6, h: 3.3, wall: T.plaster("#6f7a78"), floor: T.tiles("#3c4245", "#2e3336", 8), window: false, door: true });
  E.box(1.6, 0.06, 0.9, E.mat("#5b4636"), [0, TOP - 0.06, 0]);
  for (const [x, z] of [[-0.7, 0.35], [0.7, 0.35], [-0.7, -0.35], [0.7, -0.35]]) E.box(0.06, TOP - 0.06, 0.06, E.mat("#3b2d22"), [x, 0, z]);
  S.shelf(-3.2, -2.7, {}); S.desk && S.desk(2.6, -2.4, {});
  E.label(T.sign("RADYASYON", { bg: "#f2c230", fg: "#1a1a1a", size: 120 }), 1.1, 0.3, [0, 2.3, -2.95]);
  S.hangLamp(0, 3.3, 0, {});
  R.core = makeCore(E, 0, TOP, 0);
  R.driver = makeDriver(E);
  // ---- kasaba (x=TX): Los Alamos ----
  S.mountains(); S.clouds();
  S.building(TX - 4, -6, { w: 5, d: 4, floors: 1, wall: "#b8a88a", flatRoof: true });
  S.building(TX + 3, -7, { w: 6, d: 4, floors: 2, wall: "#9e8f78", flatRoof: true });
  S.fence(TX - 6, TX + 6, -3.2, {});
  S.signpost(TX + 1.4, 0.5, "LOS ALAMOS");
  // ---- hastane odası (x=HX) ----
  const hr = E.group(null, [HX, 0, 0]);
  E.box(6, 3.2, 0.2, E.mat("#d9dfe0"), [0, 0, -2], { parent: hr });
  E.box(2.0, 0.5, 0.95, E.mat("#e9eef0"), [0, 0, -0.9], { parent: hr });
  E.box(0.1, 0.9, 0.95, E.mat("#7d8a90"), [-1.0, 0, -0.9], { parent: hr });
  R.cal = E.label(T.sign("1", { bg: "#ffffff", fg: "#b8262e", size: 220, sub: "GÜN" }), 0.55, 0.65, [HX + 0.9, 2.0, -1.88]);
  R.cals = [];
  for (let i = 1; i <= 9; i++) { const l = E.label(T.sign(String(i), { bg: "#ffffff", fg: "#b8262e", size: 220, sub: "GÜN" }), 0.55, 0.65, [HX + 0.9, -50, -1.87]); R.cals.push(l); }
  R.cal.visible = false;
  // ---- boşluk (x=VX): tek başına çekirdek ----
  E.box(14, 10, 0.2, E.mat("#06080f"), [VX, 0, -4]);
  E.cyl(0.35, 0.45, 1.0, E.mat("#2a2f38"), [VX, 0, 0], { seg: 24 });
  R.core2 = makeCore(E, VX, 1.0, 0);
  // ---- karakterler ----
  const coat = { jacket: "#eef1f2", shirt: "#7c8fa3", pants: "#3a3a44", tie: "#2b4a7a" };
  E.actor("slotin", { ...coat, skin: "#f2d2b0", hair: "part", hairCol: "#2a1d16", seed: 11 });
  E.actor("a", { ...coat, tie: "#7a2b2b", skin: "#f6dcc0", hair: "short", hairCol: "#6b4a2a", glasses: true, seed: 21 });
  E.actor("b", { ...coat, tie: null, skin: "#e9c3a0", hair: "short", hairCol: "#1e1a18", moustache: "#1e1a18", seed: 31 });
  E.actor("c", { ...coat, tie: "#3a6a3a", skin: "#fbf5ea", hair: "short", hairCol: "#8a5a2a", seed: 41 });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(12,18,28,.88)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = BLUE; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#bfe8ff"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = "#9fe0ff", size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.strokeStyle = "#0a1220"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { g.font = `800 ${44 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 8 * k; g.strokeText(sub, w / 2, 450 * k); g.fillStyle = "#fff"; g.fillText(sub, w / 2, 450 * k); }
  g.restore();
};

// kubbe açıklığı: 1 = geniş açık, 0 = kapalı
function setDome(c, open) { c.dome.position.y = SHELL + 0.126 + open * 0.16 - TOP; c.dome.rotation.set(0, 0, 0); c.dome.position.x = 0; }
function setDriver(open, slip = 0) {
  const d = R.driver; const y = SHELL + 0.126 * 0 + open * 0.16 * 0.5 + 0.005;
  d.position.set(-0.19 - 0.05 * slip, y - 0.12 * slip, 0.02); d.rotation.set(0, 0, Math.PI / 2 + 0.9 * slip);
}
function glow(c, a, f) { c.glow.visible = a > 0.01; c.glow.scale.setScalar(1 + 0.5 * a + 0.04 * Math.sin(f / 2)); c.glow.material.opacity = 0.8 * a; BLUEA = Math.max(BLUEA, a); }

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  let cam, light = "interior", dof = { focus: 3, amount: 0 }, flash = 0, overlay = null, focusPt = [0, 0, 0];
  const shake = (f0, a, d) => { const s = E.shake(f, f0, a, d); cam.pos = cam.pos.map((v, i) => v + s[i]); };
  const team = (face, o = {}) => {
    A.push({ id: "a", pos: [-1.25, 0, -1.0], st: st(21, { face, arms: "cross", ...o }) });
    A.push({ id: "b", pos: [1.3, 0, -0.95], st: st(31, { face, arms: "hip", ...o }) });
    A.push({ id: "c", pos: [-0.45, 0, -1.9], st: st(41, { face, arms: "hang", ...o }) });
  };
  const slot = (o) => A.push({ id: "slotin", pos: [0, 0, -0.55], st: st(11, { arms: "reach", ...o }) });
  BLUEA = 0; R.driver.position.y = -50; glow(R.core, 0, f); glow(R.core2, 0, f); R.cal.visible = false; R.cals.forEach((c) => (c.position.y = -50));
  setDome(R.core, 1); setDome(R.core2, 0);

  switch (sh.name) {
    case "hook": {
      // açık kubbe + tornavida → kayar (W2) → mavi ışık (W6)
      const fs = WF(E, 2), fb = WF(E, 6);
      const s = X.easeOut(X.span(f, fs - 2, fs + 6));
      setDome(R.core, 0.15 * (1 - s)); setDriver(0.15, s);
      const b = X.span(f, fb - 4, fb + 4) * (1 - 0.3 * X.span(f, 95, 112));
      glow(R.core, b, f); flash = Math.max(0, 1 - Math.abs(f - fb) / 6) * 0.8;
      light = b > 0.2 ? "dramatic" : "interior";
      slot({ face: b > 0.2 ? "shock" : "determined", arms: b > 0.2 ? "up" : "reach", look: 0 });
      if (b > 0.2) team("shock", { arms: "up" });
      cam = f < fb ? E.camAt(f, [{ f: 0, pos: [-0.45, 1.6, 1.6], look: [-0.18, 1.25, 0], fov: 36 }, { f: fb, pos: [-0.38, 1.56, 1.35], look: [-0.16, 1.25, 0], fov: 36 }])
        : E.camAt(f, [{ f: fb, pos: [0.2, 1.7, 3.6], look: [0, 1.3, -0.6], fov: 44 }, { f: 112, pos: [0.15, 1.65, 3.2], look: [0, 1.3, -0.6], fov: 44 }]);
      dof = f < fb ? { focus: [0, 1.2, 0], amount: 10 } : { focus: [0, 1.3, -0.6], amount: 4 };
      if (f >= fs && f < fs + 16) FX.push({ kind: "lines", pos: [-0.15, 1.2, 0.05], size: 0.25, t: (f - fs) / 16 });
      if (f >= fb) shake(fb, 0.05, 14);
      break;
    }
    case "town": {
      light = "golden";
      cam = E.camAt(f, [{ f: 112, pos: [TX - 2.5, 2.2, 8.5], look: [TX, 1.6, -2], fov: 46 }, { f: 172, pos: [TX - 1.0, 1.9, 7.0], look: [TX + 0.6, 1.6, -2], fov: 46 }]);
      focusPt = [TX, 0, -2];
      overlay = big("1946", X.span(f, 130, 138), "Los Alamos, ABD", "#ffd27a");
      break;
    }
    case "slotin": {
      setDome(R.core, 0.6);
      slot({ face: "smug", arms: "present", talk: 0 });
      cam = E.camAt(f, [{ f: 173, pos: [1.1, 2.15, 2.4], look: [0, 1.6, -0.55], fov: 40 }, { f: 207, pos: [0.95, 2.1, 2.1], look: [0, 1.6, -0.55], fov: 40 }]);
      dof = { focus: [0, 1.6, -0.55], amount: 7 };
      overlay = card("Louis Slotin", "fizikçi, Kanada");
      break;
    }
    case "dome": {
      const o = 1 - 0.85 * X.smooth(X.span(f, 220, 320));
      setDome(R.core, o);
      slot({ face: "determined", arms: "reach", look: 0.1 });
      cam = E.camAt(f, [{ f: 208, pos: [1.2, 1.75, 1.9], look: [0, 1.2, 0], fov: 36 }, { f: 328, pos: [0.9, 1.6, 1.5], look: [0, 1.2, 0], fov: 34 }]);
      dof = { focus: [0, 1.2, 0], amount: 9 };
      if (f > 240) overlay = card("Plütonyum küre", "yarım kubbe iniyor");
      break;
    }
    case "gap": {
      setDome(R.core, 0.15); setDriver(0.15, 0.02 * Math.sin(f / 5));
      cam = E.camAt(f, [{ f: 329, pos: [-0.8, 1.4, 1.25], look: [-0.18, 1.22, 0], fov: 36 }, { f: 434, pos: [-0.65, 1.36, 1.05], look: [-0.16, 1.22, 0], fov: 36 }]);
      dof = { focus: [-0.1, 1.2, 0], amount: 12 };
      overlay = big("Tek güvence:", X.span(f, 360, 368), "bir tornavida", "#ffd27a", 110);
      break;
    }
    case "dragon": {
      setDome(R.core, 0.15); setDriver(0.15);
      slot({ face: "smug", arms: "reach" });
      team("nervous", { sweat: true });
      cam = E.camAt(f, [{ f: 435, pos: [-2.2, 1.8, 3.2], look: [0, 1.3, -0.7], fov: 44 }, { f: 576, pos: [-1.6, 1.7, 2.6], look: [0, 1.3, -0.7], fov: 44 }]);
      dof = { focus: [0, 1.3, -0.7], amount: 4 };
      FX.push({ kind: "sweat", pos: [-1.0, 2.3, -0.9], size: 0.35 });
      overlay = big("Ejderhanın", X.span(f, 470, 478), "kuyruğunu gıdıklamak", "#ff9d5c", 120);
      break;
    }
    case "slip": {
      const fs = WF(E, 43) - 3, s = X.easeOut(X.span(f, fs, fs + 7));
      setDome(R.core, 0.15 * (1 - s)); setDriver(0.15, s);
      cam = { pos: [-0.62, 1.36, 1.02], look: [-0.06, 1.22, 0], fov: 32, roll: 0 };
      dof = { focus: [-0.1, 1.2, 0], amount: 12 };
      if (f >= fs) { FX.push({ kind: "lines", pos: [-0.12, 1.2, 0.05], size: 0.22, t: (f - fs) / 12 }); shake(fs + 4, 0.025, 10); }
      break;
    }
    case "close": {
      setDome(R.core, 0); setDriver(0.15, 1);
      cam = E.camAt(f, [{ f: 612, pos: [0.85, 1.5, 1.3], look: [0, 1.22, 0], fov: 34 }, { f: 637, pos: [0.75, 1.47, 1.15], look: [0, 1.22, 0], fov: 33 }]);
      dof = { focus: [0, 1.2, 0], amount: 10 };
      const fc = WF(E, 45) - 2;
      if (f >= fc) { FX.push({ kind: "burst", pos: [0, 1.35, 0.1], size: 0.35 * X.back(X.span(f, fc, fc + 6)), t: X.span(f, fc, fc + 20), opt: { text: "TAK" } }); shake(fc, 0.02, 8); }
      break;
    }
    case "blue": {
      setDome(R.core, 0); setDriver(0.15, 1);
      const b = X.easeOut(X.span(f, 638, 650)); glow(R.core, b, f);
      flash = Math.max(0, 1 - Math.abs(f - 641) / 7) * 0.9;
      light = "dramatic";
      slot({ face: "shock", arms: "up" }); team("scared", { arms: "up" });
      cam = E.camAt(f, [{ f: 638, pos: [0, 1.7, 3.9], look: [0, 1.3, -0.7], fov: 46 }, { f: 697, pos: [0, 1.65, 3.3], look: [0, 1.3, -0.7], fov: 46 }]);
      shake(640, 0.06, 18);
      FX.push({ kind: "exclaim", pos: [0, 2.7, -0.5], size: 0.6 * X.back(X.span(f, 642, 652)) });
      break;
    }
    case "throw": {
      const ft = WF(E, 54) - 4, p = X.easeOut(X.span(f, ft, ft + 14));
      setDome(R.core, 0); R.core.dome.position.x = 1.6 * p; R.core.dome.position.y += 1.1 * Math.sin(p * Math.PI) - 0.9 * p * p; R.core.dome.rotation.z = -4 * p;
      glow(R.core, 1 - X.span(f, ft + 4, ft + 14), f);
      light = f < ft + 10 ? "dramatic" : "interior";
      slot({ face: f < ft ? "determined" : "shock", arms: f < ft ? "reach" : "up" });
      team(f < ft + 10 ? "scared" : "shock");
      cam = E.camAt(f, [{ f: 698, pos: [1.6, 1.6, 2.6], look: [0, 1.3, -0.4], fov: 42 }, { f: 808, pos: [1.3, 1.55, 2.2], look: [0, 1.3, -0.4], fov: 42 }]);
      dof = { focus: [0, 1.3, -0.4], amount: 5 };
      if (f >= ft) FX.push({ kind: "lines", pos: [0.9, 1.45, 0.3], size: 0.35, t: X.span(f, ft, ft + 15) });
      if (f > ft + 14) FX.push({ kind: "puff", pos: [1.5, 1.0, 0.2], size: 0.5, t: X.span(f, ft + 14, ft + 40) });
      break;
    }
    case "nine": {
      light = "interior";
      A.push({ id: "slotin", pos: [HX - 0.25, 0.3, -0.8], st: st(11, { legs: "sit", face: "sad", arms: "hang", look: 0.4 }) });
      const d = Math.min(8, Math.floor(X.span(f, 812, 858) * 9));
      R.cals[d].position.y = 1.85;
      cam = E.camAt(f, [{ f: 809, pos: [HX + 0.35, 1.7, 3.8], look: [HX + 0.3, 1.45, -1.2], fov: 46 }, { f: 869, pos: [HX + 0.35, 1.65, 3.3], look: [HX + 0.3, 1.45, -1.2], fov: 46 }]);
      focusPt = [HX, 0, -1]; dof = { focus: [HX + 0.4, 1.4, -1.2], amount: 3 };
      overlay = big("9 gün sonra", X.span(f, 845, 853), "", "#ffffff", 130);
      break;
    }
    case "past": {
      light = "dramatic";
      glow(R.core2, 0.25 + 0.1 * Math.sin(f / 6), f); setDome(R.core2, 0.2);
      cam = E.camAt(f, [{ f: 870, pos: [VX + 1.2, 1.5, 2.6], look: [VX, 1.15, 0], fov: 38 }, { f: 965, pos: [VX + 0.6, 1.4, 1.9], look: [VX, 1.15, 0], fov: 36 }]);
      focusPt = [VX, 0, 0]; dof = { focus: [VX, 1.15, 0], amount: 8 };
      if (f > 900) overlay = card("1945: Harry Daghlian", "aynı küre, ilk kurban");
      break;
    }
    case "end": {
      light = "dramatic";
      const p = X.smooth(X.span(f, 966, 1047)); setDome(R.core2, 0.25);
      glow(R.core2, 0.45 + 0.25 * Math.sin(f / 4), f);
      cam = E.camAt(f, [{ f: 966, pos: [VX, 1.5, 2.4], look: [VX, 1.15, 0], fov: 40 }, { f: 1047, pos: [VX, 1.3, 1.1], look: [VX, 1.15, 0], fov: 36 }]);
      focusPt = [VX, 0, 0]; dof = { focus: [VX, 1.15, 0], amount: 8 };
      const fe = WF(E, 74) - 2;
      overlay = big("İblis Çekirdeği", X.span(f, fe, fe + 8), "", "#ff6b6b", 120);
      if (f >= fe) flash = Math.max(0, 1 - Math.abs(f - fe) / 6) * 0.5;
      break;
    }
  }
  const ov = overlay, ba = BLUEA * (sh.name === "past" || sh.name === "end" ? 0.35 : 0.55);
  const fin = ba > 0.01 || ov ? (g, w, h) => { if (ba > 0.01) { g.save(); g.fillStyle = `rgba(70,180,255,${0.6 * ba})`; g.fillRect(0, 0, w, h); g.restore(); } if (ov) ov(g, w, h); } : null;
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
