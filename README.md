# PMDARWIN Studio

PMDARWIN YouTube kanalının (Türkçe "karanlık, tuhaf ama gerçek bilim" Shorts'ları) video üretim düzeni.

## Kullanım

```bash
bash scripts/setup.sh                       # bağımlılıklar + Türkçe ses modeli (dfki)
python3 scripts/render.py examples/101_zombi_mantar.json out.mp4
```

## Video tanımı (JSON)

| Alan | Açıklama |
|---|---|
| `title`, `description`, `tags` | YouTube başlığı, açıklaması, etiketleri |
| `hook` | İlk karede büyük yazıyla görünen kanca cümlesi |
| `hook_red` | Kancada renkli vurgulanacak kelime(ler) |
| `scenes` | Sahneler: `say` (seslendirilecek metin), `kicker` (1–3 kelimelik ara başlık; ilk sahnede boş) |
| `accent`, `tint` | Vurgu ve arka plan rengi (hex) |
| `motif` | Hareketli görsel: `network`, `pulse`, `vortex`, `tentacles`, `stars` |
| `drone` | Arka plan müziğinin taban frekansı (Hz) |

İlk sahnenin `say` metni kanca cümlesiyle aynı olmalı. Rakamları yazıyla yazın ("11" yerine "on bir"), çünkü metin sesli okunuyor.

Yazı tipi: Montserrat (SIL Open Font License, `assets/fonts/OFL.txt`). Ses: Piper `tr_TR-dfki-medium` (sherpa-onnx).

## Haftalık uzun video: "Karanlık Bilim Dosyası"

Her pazar 20:00'de, o haftanın Shorts konularını derinleştiren 16:9 bir bölüm yayınlanır.

- **Biçim:** Soğuk açılış (en çarpıcı gerçekten bir parça, ~20 sn) → geri sayım bölümleri (#7'den #1'e ya da #5'ten #1'e, her biri 45–60 sn, ~120–170 kelime) → kapanış (yorum sorusu + abone çağrısı).
- **Hedef süre:** 6–8 dakika (7 bölüm). Her bölüm kısa videodaki bilginin ötesine geçer: arka plan, keşif hikâyesi, az bilinen bir ayrıntı.
- **Üretim:** `episodes/<tarih>_bolumNN.json` (bkz. `episodes/2026-11-22_bolum01.json`), sonra
  ```bash
  for i in $(seq 0 N); do SEGMENT=$i python3 scripts/render_long.py episodes/X.json out.mp4 & done; wait
  CONCAT_ONLY=1 python3 scripts/render_long.py episodes/X.json out.mp4   # out.chapters.txt bölüm işaretlerini verir
  ```
- **Açıklama:** `description_intro` + boş satır + bölüm işaretleri + boş satır + abone çağrısı + etiketler.

## Çizim animasyonu (v4, Kurzgesagt tarzı) — varsayılan tarz

Her sahneye bir `art` nesnesi eklenir; anlatılan şey ekranda çizilip canlandırılır. Ayrıntılı alan listesi `scripts/art.py` başındaki açıklamada; tam örnek: `examples/102_zombi_mantar_cizim.json`.

- **Tuval:** Shorts 1080×1920, uzun video 1920×1080. Her `layers` öğesi bir SVG parçasıdır (`<g>`, `<path>`, `<circle>`…), tuval koordinatlarında çizilir.
- **Yerleşim (Shorts):** Çizimi y=150–1150 arasına koy. Kanca sahnesinde y=200–700 yazı alanı; diğer sahnelerde y=1150–1550 yazı alanı (karartılır). En alt 300 px'e önemli şey koyma.
- **Yerleşim (uzun video):** Çizimi y=120–760 arasına koy; alt kısım altyazı.
- **Hareketler:** `walk` (yürüme, `frames` ile bacak değişimi), `float`, `sway`, `grow` (sap/damar büyümesi, `pivot` + `axis`), `pulse`, `spin`, `drift`, `rain` (spor, kar, toz yağması), `reveal` (soldan sağa açılma), `fadein`, `shake`.
- **Stil:** Koyu arka plan (`sky`), düz renkli şekiller, 2–3 renk + bir vurgu rengi (accent), parlamalar için `defs` içinde `radialGradient id="glow"`. Yüz ifadesi, mizah ve sevimlilik yok; karanlık ve sinematik.
- **Her sahne en az bir hareketli öğe içermeli** ve anlatılanı göstermeli (karınca tırmanıyorsa karınca tırmanır).
- **Uzun video:** bölümde `arts` listesi verilir; bölüm süresi listeye eşit bölünür (her 10–15 sn için bir çizim önerilir).
- Kural dışı/okunamayan SVG'de cairosvg hata verir: çizim kodunu kısa tut, her `layer` için ayrı ayrı test et.

## Başlık ve kanca kontrolü

Yayından önce her başlık ve kanca kontrol edilir; puan 70'in altındaysa düzeltilir:
```bash
python3 scripts/baslik_kontrol.py --baslik "<başlık>" --kanca "<ilk cümle>"
```
Kurallar dosyanın başında. (Başlık kurallarının bir kısmı MIT lisanslı jakeschincariol/youtube-agent-skill'den uyarlandı.)
