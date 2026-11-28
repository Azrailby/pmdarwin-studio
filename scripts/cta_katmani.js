// CTA katmanı (beğen + takip et hatırlatması) — her story.js'ye kopyalanır.
// Kanal sahibinin isteği (28.11): videoda beğeni ve takip etmeyi hatırlatan hareketli öğeler, SES YOK, video uzamaz.
// Güncelleme (28.11 akşam, dongu_begen görevi): Beğen rozeti Takip et ile AYNI boyutta, en az 3 sn ekranda,
//   kalp 2 kez belirgin atar, girişte pop; iki rozet de daha yukarıda (başlık yazılarına binmez).
//   amip/mermi/einstein'daki eski kopyalar BİLEREK değiştirilmedi; bu sürüm sonraki videolar içindir.
//
// Kullanım (story.js içinde):
//   1) Bu dosyadaki ctaKatmani fonksiyonunu story.js'nin sonuna kopyala.
//   2) frame() dönüşünde overlay'i sar:
//        const ov = ...mevcut overlay ya da null...;
//        return { ..., overlay: (g, w, h, s) => { if (ov) ov(g, w, h, s); ctaKatmani(f, E, g, w, h, BEGEN_KELIME, CTA_Y); } };
//   3) story.js'nin başında: const BEGEN_KELIME = <cümle sonu kelime indeksi>, CTA_Y = <0..1>;
//
// Zamanlama:
//   - BEĞEN: videonun ~%40–55'inde, bir cümle BİTTİKTEN hemen sonra; 3,4 sn ekranda.
//     BEGEN_KELIME = o cümlenin son kelimesinin indeksi (noktalı kelime). null verilirse kod
//     %40–55 aralığındaki, %47'ye en yakın cümle sonunu kendisi seçer.
//   - TAKİP ET: son cümle okunurken, sesin bitişinden 1,8 sn önce başlar, video sonuna kadar.
// Boyut: iki rozet de aynı hap (genişlik w*0.5, yükseklik h*0.055), aynı yazı boyu.
// Yerleşim: varsayılan CTA_Y = 0.068 → 1920'lik karede rozet ≈ 78–183 px (pop taşmasıyla ≈ 190 px'e kadar).
//   Overlay başlıklarının ÜST kenarı en az 230 px'te olmalı (120 punto başlık için taban çizgisi y ≥ 300).
//   Daha büyük (170+ punto) başlık/yıl varsa başlığı aşağı kaydır ya da CTA_Y'yi 0.06'ya indir.
//   Altyazı (%65), YouTube'un sağdaki butonları ve alttaki başlık alanı boş kalır.
// Marka logosu YOK: kalp ve zil simgesi kodla çizilir, YouTube logosu kullanılmaz.

function ctaKatmani(f, E, g, w, h, BEGEN_KELIME = null, CTA_Y = 0.068) {
  const fps = E.fps || 30;
  const ws = E.words || [];
  if (!ws.length) return;

  // BEĞEN kelimesi: verilmediyse %40–55 aralığında %47'ye en yakın cümle sonu
  let iLike = BEGEN_KELIME;
  if (iLike == null) {
    const T = ws[ws.length - 1].e;
    let best = null, bestD = 1e9;
    ws.forEach((wd, i) => {
      const r = wd.e / T;
      if (/[.!?…]$/.test(wd.w || "") && r >= 0.40 && r <= 0.55 && Math.abs(r - 0.47) < bestD) { best = i; bestD = Math.abs(r - 0.47); }
    });
    iLike = best != null ? best : Math.floor(ws.length * 0.47);
  }
  const likeStart = Math.round(ws[Math.min(iLike, ws.length - 1)].e * fps) + 2; // cümle bittikten hemen sonra
  const likeEnd = likeStart + Math.round(3.4 * fps); // en az 3 sn
  const voiceEnd = Math.round(ws[ws.length - 1].e * fps);
  const followStart = voiceEnd - Math.round(1.8 * fps);

  const pop = (t) => { // 0..1 → hafif taşan yay etkili ölçek (≈%9 büyüyüp oturur)
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

  // İki rozet için ORTAK ölçüler
  const cy = h * CTA_Y, ph = h * 0.055, pw = w * 0.5;
  const iconX = -w * 0.17, textX = -w * 0.115, textSize = ph * 0.5;

  // BEĞEN — Takip et ile aynı boyut
  if (f >= likeStart && f < likeEnd) {
    const t = (f - likeStart) / fps;
    const out = Math.max(0, (f - (likeEnd - 8)) / 8); // son 8 karede küçülerek çık
    const s = pop(t / 0.5) * (1 - out);
    if (s > 0.01) {
      g.save(); g.translate(w / 2, cy); g.scale(s, s);
      pill(0, 0, pw, ph, "#ffffff");
      // kalp 2 kez belirgin atar (0,7 sn ve 1,4 sn), sonra hafif nabız
      const bump = (c) => Math.exp(-Math.pow((t - c) / 0.09, 2));
      const beat = 1 + 0.45 * bump(0.7) + 0.45 * bump(1.4) + 0.05 * Math.max(0, Math.sin(t * 6));
      heart(iconX, 0, ph * 0.5 * beat, "#e63946");
      label("Beğen", textX, ph * 0.04, textSize, "#1b1b1b");
      g.restore();
      // her atışta kalpten yükselen küçük kalpler
      [0.7, 1.4].forEach((c) => {
        for (let k = 0; k < 3; k++) {
          const tt = t - c - k * 0.12;
          if (tt > 0 && tt < 1.0) heart(w / 2 + iconX + (k - 1) * w * 0.035, cy - ph * 0.3 - tt * h * 0.05, ph * 0.28 * (1 - tt) * s, "#ff6b81");
        }
      });
    }
  }

  // TAKİP ET
  if (f >= followStart) {
    const t = (f - followStart) / fps;
    const s = pop(t / 0.5);
    g.save(); g.translate(w / 2, cy); g.scale(s, s);
    pill(0, 0, pw, ph, "#e63946");
    bell(iconX, 0, ph * 0.5, Math.sin(t * 14) * 0.35 * Math.exp(-t * 1.5)); // zil sallanır
    label("Takip et", textX, ph * 0.04, textSize, "#ffffff");
    g.restore();
  }
}
