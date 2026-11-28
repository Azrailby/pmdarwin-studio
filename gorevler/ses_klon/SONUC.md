# Sonuç: ses klonu (Chatterbox Multilingual)

Tarih: 28.11.2026

## Kurulum
- Sanal ortam: `%USERPROFILE%\pmdarwin_tts` (Python 3.11.9), `chatterbox-tts 0.1.7`.
- Önceki denemeden torch bozuk kalmıştı (DLL hatası); `torch==2.6.0+cu124` / `torchaudio==2.6.0+cu124` yeniden kuruldu.
- `torch.cuda.is_available()` → True. GPU: NVIDIA RTX 3050 6GB Laptop. Üretim GPU'da yapıldı.
- ffmpeg sistemde yok; betik `imageio-ffmpeg` içindeki ffmpeg'i kullanıyor (PATH'te ffmpeg varsa onu tercih eder).

## Klasörler
- `Masaüstü\PMDARWIN\`, `Ses\`, `Ses\Ornekler\` ve `BENIOKU.txt` zaten mevcuttu.
- `ref_baris.wav` hedefte vardı (aynı MD5); Downloads'taki kopya silindi, boş `pmdarwin_ses` klasörü kaldırıldı.
- 0 baytlık `ses_ornegi_edge_*.mp3` dosyaları Downloads'ta zaten yoktu.

## Örnekler (`Masaüstü\PMDARWIN\Ses\Ornekler\`, mp3 128k)
| Dosya | exaggeration / cfg | Süre | Üretim süresi | Loudness |
|---|---|---|---|---|
| ornek_1_sakin.mp3 | 0.4 / 0.5 | 18.0 s | 219 s (ilk çalıştırma) | -16.2 LUFS |
| ornek_2_anlatici.mp3 | 0.6 / 0.4 | 16.0 s | 125 s | -15.5 LUFS |
| ornek_3_dramatik.mp3 | 0.8 / 0.3 | 16.4 s | 142 s | -16.1 LUFS |

Model yükleme ayrıca ~80 s. Tepe seviyesi -1.9 dB, kırpılma yok, uzun sessizlik yok.

## Sorunlar / düzeltmeler
- Model bazı cümlelerde "forcing EOS (token_repetition)" uyarısı verip cümleyi erken bitiriyor.
  İlk turda ornek_2'nin 2. cümlesi 2.8 s çıktı (diğerlerinde 3.6–4.7 s), kırpık olabileceği için
  betiğe kısa-cümle kontrolü eklendi (harf başına 0.065 s altıysa en çok 2 kez yeniden üretir, en uzununu tutar)
  ve ornek_2 yeniden üretildi (2. cümle 3.5 s).
- Türkçe telaffuz kulakla kontrol edilmedi; yalnızca teknik kontrol yapıldı.

## Kullanım
```
%USERPROFILE%\pmdarwin_tts\Scripts\python scripts/klon_tts.py --ref <wav> --text "<metin>" --out <wav|mp3> [--exaggeration 0.6] [--cfg 0.4]
```
Ses dosyaları repoya eklenmedi.
