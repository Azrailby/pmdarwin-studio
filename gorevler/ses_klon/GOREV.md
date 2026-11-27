# Görev: Kanal sahibinin sesiyle anlatıcı ses örneği (Chatterbox Multilingual)

Kanal sahibi kendi sesinin klonlanmasını ve videolarda anlatıcı olarak kullanılmasını istedi (27.11.2026, ana sohbette açık izin).
Referans kayıt: `%USERPROFILE%\Downloads\pmdarwin_ses\ref_baris.wav` (17 sn, 24 kHz mono, temizlenmiş).

## GİZLİLİK (çok önemli)
Repo herkese açık. Referans kaydı ve üretilen ses örneklerini ASLA repoya ekleme/commit etme/push etme.
Tüm ses dosyaları sadece `%USERPROFILE%\Downloads\pmdarwin_ses\` içinde kalsın.

## Adımlar
1. Ayrı bir sanal ortam kur: `py -3.11 -m venv %USERPROFILE%\pmdarwin_tts` (3.11 yoksa 3.10; 3.12+ değil). Bu ortamı kullan.
2. `pip install chatterbox-tts` (Resemble AI, MIT lisans). Sonra torch'un CUDA sürümü olduğundan emin ol:
   `python -c "import torch;print(torch.__version__, torch.cuda.is_available())"`. False ise chatterbox'ın istediği torch sürümünün
   CUDA tekerleğini kur (örn. `pip install torch==<aynı sürüm> torchaudio==<aynı sürüm> --index-url https://download.pytorch.org/whl/cu124`).
3. `scripts/klon_tts.py` adlı tekrar kullanılabilir bir betik yaz (bu betik repoya girebilir, ses dosyası değil):
   ```
   python scripts/klon_tts.py --ref <wav> --text "<metin>" --out <wav> [--exaggeration 0.6] [--cfg 0.4]
   ```
   İçeride: `from chatterbox.mtl_tts import ChatterboxMultilingualTTS`; `m = ChatterboxMultilingualTTS.from_pretrained(device="cuda")`;
   metni cümlelere böl, her cümleyi `m.generate(cümle, language_id="tr", audio_prompt_path=ref, exaggeration=..., cfg_weight=...)` ile üret,
   cümleler arasına 0,25 sn sessizlik koy, birleştirip kaydet. Sonda çıktıyı -16 LUFS'a normalize et (ffmpeg loudnorm).
4. Şu metni üç ayarla üret:
   METİN: "Kamerun, bin dokuz yüz seksen altı. Bir gece, bir göl bin yedi yüz kişiyi öldürdü. Ama kimse boğulmadı. Gölün dibinden yükselen görünmez bir gaz, uyuyan köyleri sessizce doldurdu."
   - `ornek_1_sakin.mp3`   exaggeration 0.4, cfg 0.5
   - `ornek_2_anlatici.mp3` exaggeration 0.6, cfg 0.4
   - `ornek_3_dramatik.mp3` exaggeration 0.8, cfg 0.3
   Hepsini `%USERPROFILE%\Downloads\pmdarwin_ses\` içine mp3 (128k) olarak yaz.
5. Kontrol: her dosyanın süresi 8–20 sn arası olmalı, boş/kırpık olmamalı. Türkçe karakterler (ö, ü, ş, ğ, ı) doğru okunuyor mu bilemezsin;
   sadece teknik kontrol yap. Sorun varsa düzeltmeyi dene.
6. Sonuç notu: `gorevler/ses_klon/SONUC.md` dosyasına kısa not yaz (kurulum başarılı mı, GPU kullanıldı mı, her örneğin üretim süresi, hata varsa ne).
   SONUC.md ve scripts/klon_tts.py'yi commit + push et (ses dosyalarını DEĞİL). Sonra bu klasöre `DONE` koy, commit + push.
