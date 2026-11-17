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
