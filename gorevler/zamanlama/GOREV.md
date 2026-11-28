# Görev: Altyazı–ses kaymasını düzelt (Whisper hizalama) + Pazar videolarını yeniden üret

Kanal sahibi amip videosunda sesle altyazının kaydığını söyledi (28.11 20:22). Sebep: ses_uret.py kelime
zamanlarını hece sayısından TAHMİN ediyordu. Artık scripts/zamanla.py gerçek sesi Whisper ile dinleyip
kelime zamanlarını çıkarıyor (ses_uret.py de sonunda bunu otomatik çağırıyor).

## Adımlar
1. Kurulum: `%USERPROFILE%\pmdarwin_tts\Scripts\python -m pip install -U openai-whisper`
   (ffmpeg PATH'te olmalı; yoksa kur). İlk çalıştırmada "turbo" modeli iner (~1,5 GB).
2. Üç proje için SESİ YENİDEN ÜRETME, sadece hizala:
   `%USERPROFILE%\pmdarwin_tts\Scripts\python scripts/zamanla.py cizgi/amip cizgi/mermi cizgi/einstein`
   Çıktıdaki "Whisper eşleşen x/y" oranı her projede %80'in üstünde olmalı. Altındaysa sebebini incele
   (ör. Whisper başka dil sandıysa) ve düzelt.
3. Kontrol: her proje için work/words.json'daki birkaç kelimenin başlangıcını ses dalgasıyla karşılaştır
   (ör. cümle başlarında sessizlikten sonra enerji başladığı an ±0,1 sn). Ayrıca timing.txt'yi oku.
4. story.js çekim sınırları words.json'dan hesaplanıyor; yine de her story.js'de sabit kare numarası
   kalmış mı bak, kaldıysa words.json'a bağla. sound.json'daki efekt zamanlarını yeni kelime zamanlarına
   göre güncelle (efekt, tetikleyen kelimeyle aynı anda).
5. Stills sayfasıyla 3 projeyi tekrar kontrol et (geçişler doğru cümlede mi).
6. Yeniden render ettir: her projede `frames/` ve `out/` içeriğini sil, `teslim/amip.mp4`, `teslim/mermi.mp4`,
   `teslim/einstein.mp4` ve _qa.jpg'lerini `git rm` ile kaldır, READY kalsın. Commit + push → render botu
   teslim/ dosyası olmayan READY projeleri yeniden çıkarır.
7. mermi: "Ama yavaş tabanca mermileri parçalanmadı." cümlesi 5,9 sn ile anormal yavaş. Bu projede sesi
   `scripts/ses_uret.py cizgi/mermi` ile BAŞTAN üret (artık otomatik Whisper hizalamalı), cümle süresi
   2,5–3,5 sn civarına inmeli; inmezse 2 kez daha dene ve en kısa doğal olanı tut. Sonra 4–6'yı mermi için uygula.
8. CLAUDE_CODE_GOREV.md "Bilinen tuzaklar" listesine bu hatayı ve çözümünü ekle. Sonra DONE koy, commit + push.
