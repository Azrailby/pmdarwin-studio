// Bir Gecede 1.700 Kişiyi Öldüren Göl — PMDARWIN (~34 sn) · saygılı ton, insan bedeni yok
export const meta = { fps: 30 };

const SHOTS = [[0, "hook"], [32, "foam"], [149, "year"], [198, "cam"], [225, "section"], [331, "rise"], [401, "flow"],
  [494, "village"], [568, "count"], [690, "morning"], [740, "today"], [824, "fountain"], [930, "end"]];
const END = 1025;
const shotAt = (f) => { let i = 0; while (i < SHOTS.length - 1 && f >= SHOTS[i + 1][0]) i++; return { name: SHOTS[i][1], f0: SHOTS[i][0], f1: (SHOTS[i + 1] || [END])[0], t: f - SHOTS[i][0] }; };
const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);

const MOON = "#dfe8ff", MIST = "#b8e8c0", BLUE = "#7cb4ff";
const SX = 100, VX = 200; // kesit, vadi (göl x=0)
let R = {};
const rnd = (i) => { const x = Math.sin(i * 77.3) * 43758.5; return x - Math.floor(x); };
function put(o, x, y, z, yaw = 0, s = 1) { o.position.set(x, y, z); o.rotation.set(0, yaw, 0); o.scale.setScalar(s); o.visible = true; }
const hide = (o) => { o.visible = false; o.position.y = -50; };

function makeHut(E, x, z, i) {
  const g = E.group(null, [x, 0, z], rnd(i) * 6);
  E.cyl(1.1, 1.15, 1.6, E.mat("#b8865a", { map: E.T.plaster("#b8865a") }), [0, 0, 0], { parent: g, seg: 14 });
  E.cone(1.5, 1.4, E.mat("#c9a45a", { map: E.T.planks("#c9a45a", 10) }), [0, 1.55, 0], { parent: g, seg: 14 });
  E.box(0.5, 0.9, 0.05, E.mat("#4a2f20"), [0, 0, 1.12], { parent: g });
  const w = E.box(0.35, 0.3, 0.05, E.mat("#ffd27a", { emissive: "#ffb040", glow: 1.2 }).clone(), [0.6, 0.85, 0.95], { parent: g }); w.rotation.y = 0.55;
  g.userData.win = w; return g;
}

// ---------------- sahneler ----------------
export function build(E) {
  const { T, S } = E; const TH = E.THREE;
  // ---- krater gölü (x=0) ----
  E.ground(T.grass("#4f7a4a"), 400, 0.2, [0, -0.02, 0]);
  const wt = T.water("#2f5a8a").clone(); wt.needsUpdate = true; wt.repeat.set(6, 6);
  R.lake = E.cyl(13, 13, 0.1, E.mat("#ffffff", { map: wt }), [0, 0, -14], { seg: 48 });
  for (let i = 0; i < 30; i++) { const a = (i / 30) * Math.PI * 2, r = 17 + rnd(i) * 3; const h = E.sphere(5 + rnd(i + 3) * 3, E.mat(i % 2 ? "#5f8a4f" : "#557f47"), [Math.cos(a) * r, -1.5, -14 + Math.sin(a) * r], { seg: 12 }); h.scale.y = 0.55 + rnd(i + 5) * 0.35; h.castShadow = false; }
  R.moon = E.sphere(3, E.flat(MOON, { fog: false }), [-18, 30, -90], { seg: 20 }); R.moon.userData.noink = true;
  R.stars = [];
  for (let i = 0; i < 80; i++) { const s = E.sphere(0.12 + rnd(i) * 0.1, E.flat("#ffffff", { fog: false }), [-60 + rnd(i + 1) * 120, 18 + rnd(i + 2) * 40, -100 - rnd(i + 3) * 10], { seg: 6 }); s.userData.noink = true; s.castShadow = false; R.stars.push(s); }
  R.foam = [];
  for (let i = 0; i < 36; i++) { const s = E.sphere(1, E.mat("#e8f4f8"), [0, -50, 0], { seg: 10 }); s.castShadow = false; R.foam.push(s); }
  // sal + boru + mühendis
  R.raft = E.group(null, [0, -50, 0]);
  E.box(3.2, 0.3, 2.2, E.mat("#ffffff", { map: T.planks("#a8743f") }), [0, 0, 0], { parent: R.raft });
  for (const s of [-1, 1]) E.cyl(0.25, 0.25, 3.2, E.mat("#e8eaf0"), [0, 0.0, s * 0.9], { parent: R.raft, center: true, seg: 10 }).rotation.z = Math.PI / 2;
  E.cyl(0.18, 0.18, 2.8, E.mat("#e8eaf0"), [0.6, 0.15, 0], { parent: R.raft, seg: 12 });
  E.cyl(0.24, 0.24, 0.12, E.mat("#e04848"), [0.6, 2.9, 0], { parent: R.raft, seg: 12 });
  E.cyl(0.18, 0.18, 4, E.mat("#9aa3b2", { transparent: true, opacity: 0.6 }), [0.6, -4, 0], { parent: R.raft, seg: 12 });
  R.jet = [];
  for (let i = 0; i < 60; i++) { const s = E.sphere(0.32, E.mat("#e8f8ff", { emissive: "#bfe8ff", glow: 0.3 }), [0, -50, 0], { seg: 8 }); s.castShadow = false; R.jet.push(s); }
  // ---- kesit (x=SX) ----
  E.box(40, 34, 0.5, E.mat("#0b1430"), [SX, -16, -3]);
  const soil = E.mat("#6a4a32", { map: T.dirt("#6a4a32") });
  E.box(16, 3, 1.2, soil, [SX, -6.0, 0]); E.box(4, 6, 1.2, soil, [SX - 6, -3, 0]); E.box(4, 6, 1.2, soil, [SX + 6, -3, 0]);
  E.box(3, 1, 1.21, E.mat("#4f7a4a"), [SX - 6.5, 2.5, 0]); E.box(3, 1, 1.21, E.mat("#4f7a4a"), [SX + 6.5, 2.5, 0]);
  R.water = E.box(8, 5.6, 1.0, E.mat("#3f7ad8", { transparent: true, opacity: 0.55 }), [SX, -3.0, 0]);
  R.co2 = E.box(7.9, 1.8, 1.05, E.mat("#b48cff", { transparent: true, opacity: 0.6, emissive: "#5a3a9a", glow: 0.4 }), [SX, -3.0, 0]);
  R.co2lbl = E.label(T.sign("CO2", { bg: "#5a3a9a", fg: "#ffffff", size: 220, w: 512, h: 256, border: null }), 1.4, 0.7, [SX, -2.1, 0.56], { lit: false });
  R.bub = [];
  for (let i = 0; i < 24; i++) { const b = E.sphere(0.15, E.mat("#e8dcff", { emissive: "#b48cff", glow: 0.5 }), [0, -50, 0], { seg: 8 }); b.castShadow = false; R.bub.push(b); }
  // ---- vadi + köy (x=VX) ----
  E.ground(T.grass("#5a8a4f"), 200, 0.2, [VX, 0.01, 0]);
  for (const s of [-1, 1]) for (let i = 0; i < 8; i++) { const h = E.sphere(9, E.mat(i % 2 ? "#5f8a4f" : "#557f47"), [VX + s * (12 + rnd(i) * 4), -2, -6 - i * 9], { seg: 12 }); h.scale.set(1, 0.7 + rnd(i + 9) * 0.4, 1.3); h.castShadow = false; }
  E.box(2.4, 0.03, 120, E.mat("#ffffff", { map: T.dirt("#b8946a") }), [VX, 0.01, -40]);
  R.huts = [];
  for (let i = 0; i < 9; i++) R.huts.push(makeHut(E, VX + (i % 2 ? 3.2 : -3.2) + (rnd(i) - 0.5), -2 - i * 4.2, i));
  for (let i = 0; i < 10; i++) S.tree(VX + (i % 2 ? 6 : -6) + (rnd(i + 3) - 0.5) * 2, -4 - i * 4.5, { type: "palm", s: 0.9, col: "#4f8a3f" });
  E.cyl(10, 10, 0.1, E.mat("#ffffff", { map: wt }), [VX, 9, -75], { seg: 32 });
  E.sphere(14, E.mat("#557f47"), [VX, 0, -80], { seg: 14 }).scale.y = 0.62;
  R.mist = [];
  for (let i = 0; i < 40; i++) { const m = E.sphere(1, E.mat(MIST, { transparent: true, opacity: 0.28 }), [0, -50, 0], { seg: 10 }); m.userData.noink = true; m.castShadow = false; R.mist.push(m); }
  // ---- karakter ----
  E.actor("eng", { shirt: "#ff8a2a", pants: "#2f4a6a", hat: "hardhat", hatCol: "#ffd23f", glasses: false, hair: "short", hairCol: "#1d1622", skin: "#8d5a3b", seed: 161, belt: "#d8e0e8" });
}

const card = (title, sub) => (g, w) => {
  const k = w / 1080, x = 70 * k, y = 1390 * k, pw = Math.max(460, 60 + Math.max(title.length, sub.length * 0.7) * 30) * k;
  g.save(); g.fillStyle = "rgba(10,16,34,.9)"; g.beginPath(); g.roundRect(x, y, pw, 112 * k, 22 * k); g.fill();
  g.fillStyle = MIST; g.fillRect(x, y, 10 * k, 112 * k);
  g.font = `900 ${46 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#fff"; g.textBaseline = "middle"; g.fillText(title, x + 34 * k, y + 40 * k);
  g.font = `700 ${30 * k}px CizgiFont, Nunito, sans-serif`; g.fillStyle = "#d8e8f0"; g.fillText(sub, x + 34 * k, y + 82 * k); g.restore();
};
const big = (txt, a = 1, sub = "", col = "#ffffff", size = 150) => (g, w) => {
  const k = w / 1080; g.save(); g.globalAlpha = Math.max(0, Math.min(1, a)); g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `900 ${size * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 16 * k; g.lineJoin = "round"; g.strokeStyle = "#0a0e1a"; g.strokeText(txt, w / 2, 330 * k);
  g.fillStyle = col; g.fillText(txt, w / 2, 330 * k);
  if (sub) { const y = 330 * k + size * 0.5 * k + 40 * k; g.font = `800 ${50 * k}px CizgiFont, Nunito, sans-serif`; g.lineWidth = 9 * k; g.strokeText(sub, w / 2, y); g.fillStyle = "#fff"; g.fillText(sub, w / 2, y); }
  g.restore();
};

function reset() {
  R.foam.forEach(hide); R.jet.forEach(hide); R.bub.forEach(hide); R.mist.forEach(hide); hide(R.raft);
  R.huts.forEach((h) => (h.userData.win.material.emissiveIntensity = 1.2));
  R.moon.visible = true; R.stars.forEach((s) => (s.visible = true));
}

export function frame(f, E) {
  const X = E.X, sh = shotAt(f), t = sh.t, A = [], FX = [], ov = [];
  const st = (seed, o = {}) => ({ blink: E.blink(f, seed), ...E.idle(f, seed), ...o });
  const NIGHT = { ...X.LIGHTS.night, sunI: 0.95, hemiI: 0.95, amb: 0.25, top: "#060d2a", bot: "#1d2c5a", fog: "#1a2850", fogNear: 40, fogFar: 160, card: "#b8c4f0", sat: 1.0, vig: 0.5 };
  let cam, light = NIGHT, dof = { focus: 4, amount: 0 }, flash = 0, focusPt = [0, 0, -10], tint = "rgba(20,40,110,0.10)";
  reset();
  const day = () => { light = "day"; tint = null; R.moon.visible = false; R.stars.forEach((s) => (s.visible = false)); };
  const lakeCam = (f0, f1) => E.camAt(f, [{ f: f0, pos: [2, 7.8, 9], look: [0, 3.0, -24], fov: 52 }, { f: f1, pos: [1.5, 7.4, 7], look: [0, 3.0, -24], fov: 52 }]);

  switch (sh.name) {
    case "hook": case "foam": {
      cam = lakeCam(0, 148);
      if (sh.name === "foam") R.foam.forEach((s, i) => { const k = X.span(f, 40 + i * 2, 120); if (k <= 0) return; const a = rnd(i) * 6.28, r = rnd(i + 2) * 6; put(s, Math.cos(a) * r, 0.05 + 0.15 * Math.abs(Math.sin(f / 6 + i)), -14 + Math.sin(a) * r, 0, 0.15 + 0.25 * k * Math.abs(Math.sin(f / 9 + i))); });
      ov.push(big("1.746", 1, f > WF(E, 4) - 3 ? "kimseye dokunmadan" : "bir gece · bir göl", "#ffffff", 190));
      break;
    }
    case "year": case "cam": {
      cam = E.camAt(f, [{ f: 149, pos: [-8, 8, 3], look: [2, 3.0, -26], fov: 52 }, { f: 224, pos: [-7, 7.6, 1], look: [2, 3.0, -26], fov: 52 }]);
      ov.push(big("1986", X.span(f, WF(E, 13) - 3, WF(E, 13) + 5), "21 Ağustos", "#ffffff", 180));
      if (sh.name === "cam") ov.push(card("Kamerun", "Nyos Gölü · krater gölü"));
      break;
    }
    case "section": case "rise": {
      light = "day"; tint = "rgba(10,20,60,0.25)";
      const rise = sh.name === "rise" ? X.smooth(X.span(f, WF(E, 29) - 4, WF(E, 31) + 6)) : 0;
      const sk = sh.name === "section" ? 0.2 + 0.8 * X.span(f, 240, 310) : 1;
      R.co2.scale.y = sk; R.co2.position.y = -3.0 + 0.9 * sk + rise * 3.4; R.co2lbl.position.y = R.co2.position.y;
      R.bub.forEach((b, i) => { const p = ((f * 0.03 + rnd(i)) % 1); if (sh.name !== "rise" && i > 6) return; put(b, SX - 3.5 + rnd(i + 4) * 7, -3 + p * 5.6, 0.6, 0, 0.7 + rnd(i) * 0.6); });
      if (rise > 0.6) for (let i = 0; i < 12; i++) { const s = R.foam[i]; put(s, SX - 2 + i * 0.36, 2.6 + 0.8 * Math.sin((i / 11) * Math.PI) * rise, 0.6, 0, 0.4); }
      cam = { pos: [SX, -0.3, 24], look: [SX, -0.3, 0], fov: 40 };
      focusPt = [SX, -3, 0];
      if (sh.name === "section") ov.push(big("CO2", X.span(f, WF(E, 23) - 3, WF(E, 23) + 5), "dipte yıllarca birikti", "#d8c4ff", 170));
      else ov.push(big("YUKARI!", X.span(f, WF(E, 29) - 3, WF(E, 29) + 5), "gaz aniden yüzeye çıktı", "#ffffff", 150));
      break;
    }
    case "flow": {
      const k = X.span(f, 401, 494);
      R.mist.forEach((m, i) => { const p = X.clamp(k * 1.5 - (i / 40) * 0.5); if (p <= 0) return; const z = X.lerp(-70, -2, p), y = X.lerp(8, 0.6, Math.min(1, p * 1.3)); put(m, VX + (rnd(i) - 0.5) * 9 * (0.5 + p), y + rnd(i + 3) * 1.2, z + (rnd(i + 5) - 0.5) * 6, 0, 2.2 + rnd(i + 7) * 2); m.scale.y *= 0.45; });
      cam = E.camAt(f, [{ f: 401, pos: [VX + 3, 9, 14], look: [VX, 1, -25], fov: 52 }, { f: 493, pos: [VX + 2.5, 8, 11], look: [VX, 1, -22], fov: 52 }]);
      focusPt = [VX, 0, -20];
      ov.push(big("havadan ağır", X.span(f, WF(E, 33) - 3, WF(E, 33) + 5), "vadilere aktı", MIST, 130));
      break;
    }
    case "village": {
      R.huts.forEach((h, i) => { const off = WF(E, 41) + i * 4; h.userData.win.material.emissiveIntensity = f > off ? 0 : 1.2; });
      R.mist.forEach((m, i) => { put(m, VX + (rnd(i) - 0.5) * 12, 0.4 + rnd(i + 3) * 0.6, -2 - rnd(i + 5) * 34, 0, 2 + rnd(i + 7) * 2); m.scale.y *= 0.3; });
      cam = E.camAt(f, [{ f: 494, pos: [VX + 1.2, 2.2, 6], look: [VX, 1.2, -14], fov: 50 }, { f: 567, pos: [VX + 1.0, 2.1, 4.5], look: [VX, 1.2, -14], fov: 50 }]);
      focusPt = [VX, 0, -8];
      ov.push(big("uyuyordu", X.span(f, WF(E, 40) - 3, WF(E, 40) + 5), "hiçbir şey hissetmediler", "#ffffff", 140));
      break;
    }
    case "count": {
      tint = "rgba(10,16,40,0.25)";
      R.huts.forEach((h) => (h.userData.win.material.emissiveIntensity = 0));
      cam = E.camAt(f, [{ f: 568, pos: [VX, 1.6, 4], look: [VX, 1.4, -30], fov: 50 }, { f: 689, pos: [VX, 1.6, 1.5], look: [VX, 1.4, -30], fov: 50 }], { creep: 0.04 });
      focusPt = [VX, 0, -8];
      const n = Math.round(1746 * X.easeOut(X.span(f, WF(E, 44) - 3, WF(E, 49))));
      ov.push(big(n.toLocaleString("tr-TR"), 1, f > WF(E, 51) - 3 ? "ve binlerce hayvan" : "kişi", "#ffffff", 180));
      break;
    }
    case "morning": {
      light = ["golden", "day", 0.4]; tint = "rgba(200,210,220,0.18)"; R.moon.visible = false; R.stars.forEach((s) => (s.visible = false));
      R.huts.forEach((h) => (h.userData.win.material.emissiveIntensity = 0));
      cam = E.camAt(f, [{ f: 690, pos: [VX - 1.5, 2.0, 3], look: [VX, 1.2, -20], fov: 50 }, { f: 739, pos: [VX - 1.3, 2.0, 2], look: [VX, 1.2, -20], fov: 50 }], { creep: 0.03 });
      focusPt = [VX, 0, -8];
      ov.push(big("sessizlik", X.span(f, WF(E, 58) - 3, WF(E, 58) + 6) * 0.9, "sabah", "#ffffff", 140));
      break;
    }
    case "today": case "fountain": case "end": {
      day();
      put(R.raft, 0, 0.1, -10);
      if (sh.name === "today") A.push({ id: "eng", pos: [-0.7, 0.4, -9.4], st: st(161, { face: "happy", arms: f > 790 ? "point" : "hip", look: 0.5 }) });
      const on = sh.name !== "today" || f > 800;
      if (on) R.jet.forEach((s, i) => { const p = ((f * 0.025 + i / 60) % 1), h = 4 * Math.sin(p * Math.PI) + 3.2 * p * (1 - p) * 0, spread = p * 1.1; put(s, 0.6 + Math.cos(i * 2.4) * spread, 3.0 + h * (sh.name === "end" ? 0.8 : 1), -10 + Math.sin(i * 2.4) * spread, 0, 0.7 + p * 0.8); });
      if (sh.name === "end") { light = ["golden", "day", 0.25]; tint = "rgba(255,170,90,0.08)"; }
      if (sh.name === "today") cam = E.camAt(f, [{ f: 740, pos: [1.5, 2.2, -3.2], look: [0.2, 1.8, -10], fov: 50 }, { f: 823, pos: [1.2, 2.2, -4.2], look: [0.2, 1.9, -10], fov: 50 }]);
      else if (sh.name === "fountain") cam = E.camAt(f, [{ f: 824, pos: [2.5, 3.0, 1.5], look: [0.4, 4.2, -10], fov: 50 }, { f: 929, pos: [4, 4.0, 5], look: [0.4, 4.2, -10], fov: 50 }]);
      else cam = E.camAt(f, [{ f: 930, pos: [4, 5, 10], look: [0, 2.0, -14], fov: 50 }, { f: 1024, pos: [3, 5, 9], look: [0, 2.0, -14], fov: 50 }], { creep: 0.05 });
      focusPt = [0, 0, -10];
      if (sh.name === "today") { ov.push(card("Gaz giderme boruları", "2001'den beri")); ov.push(big("BORULAR", X.span(f, WF(E, 62) - 3, WF(E, 62) + 5), "gölün dibine", BLUE, 150)); }
      if (sh.name === "fountain") ov.push(big("ÇEŞME", X.span(f, WF(E, 69) - 3, WF(E, 69) + 5), "gaz yavaş yavaş salınıyor", BLUE, 160));
      if (sh.name === "end") ov.push(big("Tuhaf ama gerçek.", X.span(f, 932, 940), f >= WF(E, 76) - 2 ? "Her gün." : "", "#ffffff", 100));
      break;
    }
  }
  const tn = tint, list = ov;
  const fin = (g, w, h) => { if (tn) { g.save(); g.fillStyle = tn; g.fillRect(0, 0, w, h); g.restore(); } list.forEach((o) => o(g, w, h)); };
  return { cam, light, dof, actors: A, fx: FX, flash, overlay: fin, focusPt };
}
