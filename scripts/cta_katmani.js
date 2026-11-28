// CTA katmanı (beğen + takip et hatırlatması) — her story.js'ye kopyalanır.
// Kanal sahibinin isteği (28.11): videoda beğeni ve takip etmeyi hatırlatan hareketli öğeler, SES YOK, video uzamaz.
//
// Kullanım (story.js içinde):
//   1) Bu dosyadaki ctaKatmani fonksiyonunu story.js'nin sonuna kopyala.
//   2) frame() dönüşünde overlay'i sar:
//        const ov = ...mevcut overlay ya da null...;
//        return { ..., overlay: (g, w, h, s) => { if (ov) ov(g, w, h, s); ctaKatmani(f, E, g, w, h, BEGEN_KELIME, CTA_Y); } };
//   3) story.js'nin başında: const BEGEN_KELIME = <ters köşe cümlesinin son kelime indeksi>, CTA_Y = <0..1>;
//
// Zamanlama:
//   - BEĞEN: videonun en ilginç dönüşünden hemen sonra (varsayılan: kelimelerin %55'i), 2,2 sn.
//     Daha uygun bir an varsa (ör. "Ama..." cümlesinin bitişi) BEGEN_KELIME ile o kelimenin indeksini ver.
//   - TAKİP ET: son cümle okunurken, sesin bitişinden 1,8 sn önce başlar, video sonuna kadar.
// Yerleşim: ekranın üst kısmı (varsayılan y ≈ %13; CTA_Y ile değişir). Overlay başlıkları y≈300–330'daysa
//   CTA_Y = 0.085 kullan (rozet 110–216 px arasında kalır, başlığa binmez). Altyazı (%65), YouTube'un sağdaki butonları ve alttaki başlık alanı boş kalır.
// Marka logosu YOK: kalp ve zil simgesi kodla çizilir, YouTube logosu kullanılmaz.

function ctaKatmani(f, E, g, w, h, BEGEN_KELIME = null, CTA_Y = 0.13) {
  const fps = E.fps || 30;
  const ws = E.words || [];
  if (!ws.length) return;
  const iLike = BEGEN_KELIME != null ? BEGEN_KELIME : Math.floor(ws.length * 0.55);
  const likeStart = Math.round(ws[Math.min(iLike, ws.length - 1)].e * fps);
  const likeEnd = likeStart + Math.round(2.2 * fps);
  const voiceEnd = Math.round(ws[ws.length - 1].e * fps);
  const followStart = voiceEnd - Math.round(1.8 * fps);

  const pop = (t) => { // 0..1 → yay etkili ölçek
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return 1 - Math.cos(t * Math.PI * 2.5) * Math.exp(-t * 6);
  };
  const pill = (cx, cy, pw, ph, fill) => {
    const r = ph / 2;
    g.beginPath();
    g.moveTo(cx - pw / 2 + r, cy - ph / 2);
    g.arcTo(cx + pw / 2, cy - ph / 2, cx + pw / 2, cy + ph / 2, r);
    g.arcTo(cx + pw / 2, cy + ph / 2, cx - pw / 2, cy + ph / 2, r);
    g.arcTo(cx - pw / 2, cy + ph / 2, cx - pw / 2, cy - ph / 2, r);
    g.arcTo(cx - pw / 2, cy - ph / 2, cx + pw / 2, cy - ph / 2, r);
    g.closePath();
    g.fillStyle = fill; g.fill();
    g.lineWidth = ph * 0.07; g.strokeStyle = "#1b1b1b"; g.stroke();
  };
  const heart = (x, y, s, col) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.beginPath();
    g.moveTo(0, 0.35);
    g.bezierCurveTo(-0.9, -0.25, -0.45, -0.95, 0, -0.45);
    g.bezierCurveTo(0.45, -0.95, 0.9, -0.25, 0, 0.35);
    g.fillStyle = col; g.fill(); g.lineWidth = 0.09; g.strokeStyle = "#1b1b1b"; g.stroke();
    g.restore();
  };
  const bell = (x, y, s, ang) => {
    g.save(); g.translate(x, y); g.rotate(ang); g.scale(s, s);
    g.beginPath();
    g.moveTo(-0.5, 0.35); g.quadraticCurveTo(-0.45, -0.55, 0, -0.6);
    g.quadraticCurveTo(0.45, -0.55, 0.5, 0.35); g.closePath();
    g.fillStyle = "#ffd23f"; g.fill(); g.lineWidth = 0.09; g.strokeStyle = "#1b1b1b"; g.stroke();
    g.beginPath(); g.arc(0, 0.45, 0.13, 0, Math.PI * 2); g.fill(); g.stroke();
    g.restore();
  };
  const label = (txt, x, y, size, col) => {
    // motor Nunito'yu "CizgiFont" adıyla yükler
    g.font = `900 ${size}px CizgiFont, Nunito, sans-serif`; g.textAlign = "left"; g.textBaseline = "middle";
    g.lineWidth = size * 0.12; g.strokeStyle = "#1b1b1b"; g.strokeText(txt, x, y);
    g.fillStyle = col; g.fillText(txt, x, y);
  };

  const cy = h * CTA_Y, ph = h * 0.055;

  // BEĞEN
  if (f >= likeStart && f < likeEnd) {
    const t = (f - likeStart) / fps;
    const out = Math.max(0, (f - (likeEnd - 8)) / 8); // son 8 karede küçülerek çık
    const s = pop(t / 0.5) * (1 - out);
    if (s > 0.01) {
      g.save(); g.translate(w / 2, cy); g.scale(s, s);
      pill(0, 0, w * 0.42, ph, "#ffffff");
      const beat = 1 + 0.12 * Math.max(0, Math.sin(t * 9)); // kalp atışı
      heart(-w * 0.13, 0, ph * 0.42 * beat, "#e63946");
      label("Beğen", -w * 0.075, ph * 0.04, ph * 0.5, "#1b1b1b");
      g.restore();
      // kalpten yükselen küçük kalpler
      for (let k = 0; k < 4; k++) {
        const tt = t - k * 0.25;
        if (tt > 0 && tt < 1.2) heart(w / 2 - w * 0.13 + (k - 1.5) * w * 0.03, cy - tt * h * 0.06, ph * 0.18 * (1 - tt / 1.2) * s, "#ff6b81");
      }
    }
  }

  // TAKİP ET
  if (f >= followStart) {
    const t = (f - followStart) / fps;
    const s = pop(t / 0.5);
    g.save(); g.translate(w / 2, cy); g.scale(s, s);
    pill(0, 0, w * 0.5, ph, "#e63946");
    bell(-w * 0.17, 0, ph * 0.5, Math.sin(t * 14) * 0.35 * Math.exp(-t * 1.5)); // zil sallanır
    label("Takip et", -w * 0.115, ph * 0.04, ph * 0.5, "#ffffff");
    g.restore();
  }
}
