# Claude Code için görev: PMDARWIN çizgi Short üretimi

Sen bu kanalın ikinci üretim istasyonusun. Bulut tarafındaki Claude konu, senaryo, ses ve zamanlamayı hazırlar; sen sahneyi (story.js) yazar, kareleri kontrol eder ve hazır işaretlersin. Render botu (render_bot.py) READY gördüğünde videoyu senin GPU'nda çıkarır ve teslim/ klasörüne koyar.

## İş bulma
1. `git pull`
2. `cizgi/*/PLAN.md` olup içinde `READY` OLMAYAN klasörler senin işin. Aşağıdaki "Sıra" listesine göre çalış.
   Bu dosya otomatik çalışır: render botu bekleyen iş görünce seni kendisi başlatır (claude -p). Kullanıcı yok, soru sorma.
3. Her klasörde hazır: `script.txt`, `PLAN.md`, motor + araçlar. Sesi önce `scripts/ses_uret.py` ile SEN üretirsin (aşağıdaki "Ses" bölümü). Senaryoyu DEĞİŞTİRME.


## Ses (28.11'den itibaren — ÖNEMLİ)
Seslendirme artık kanal sahibinin klon sesi "Barış anlatıcı" (Chatterbox Multilingual, exaggeration 0.6, cfg 0.4).
Bulut tarafı sadece `script.txt` (+ varsa `okunus.json`) ve `PLAN.md` gönderir; `work/voice.wav` YOKTUR. Her yeni projede İLK adım:
`%USERPROFILE%\pmdarwin_tts\Scripts\python scripts/ses_uret.py cizgi/<ad>`
→ work/voice.wav, words.json, phrases.json, timing.txt oluşur. PLAN.md'deki çekim tablosu cümle cümle verilir; kare aralıklarını timing.txt'deki P parçalarından sen eşleştir.
- Sesi dinleyemezsin: timing.txt'deki toplam süreyi kontrol et (30–45 sn arası olmalı); bir cümle anormal kısa/uzunsa ses_uret.py'yi o proje için tekrar çalıştır.
- `work/voice.wav` repoya EKLENMEZ (.gitignore). Render botu aynı bilgisayarda olduğu için gerek yok. words/phrases/timing commit edilebilir.
- Referans kayıt `Masaüstü\PMDARWIN\Ses\ref_baris.wav` asla repoya girmez.

## Her video için adımlar
1. `PLAN.md`'yi oku. Çekim tablosu kare aralıklarıyla verildi (phrases.json ile eşleşir).
2. Örnek olarak `cizgi/iblis/story.js`, `cizgi/zombi/story.js`, `cizgi/kopekbaligi/story.js` dosyalarına bak; aynı yapıyı kullan (SHOTS listesi, shotAt, card/big overlay, put/reset).
3. `story.js` yaz. Özgün karakter ve modeller (küre/silindir/koni ile). Kare 0 boş olmasın.
4. Kare kontrolü: `python tools/render.py . stills 30,90,...` (her çekimin ortasından 1 kare) → `python tools/sheet.py stills stills/sheet.jpg` → sayfaya BAK, düzelt, tekrar. En az 2 tur.
5. `sound.json` yaz (müzik stili + kelime anlarına sfx; örneklere bak) → `python tools/audio.py .`
6. `meta.json`: `{"file_title": "<PLAN.md'deki başlık>"}`
7. Kendin render etmek istersen: `python tools/render.py . frames` → `python tools/finish.py . "<başlık>"` → `out/qa_sheet.jpg`'ye bak. Ya da sadece READY bırak, bot yapar.
8. `READY` dosyası oluştur, `git add cizgi/<ad>` (frames/out/stills gitignore'da), commit, push.
9. Bu dosyanın sonundaki "Durum" bölümüne bir satır ekle: `- <ad>: hazır (saat)` ve onu da push et.

## Bilinen tuzaklar (önemli)
- `E.W(n)` ÇALIŞMIYOR (motorda W = genişlik ile çakışıyor). Kelime karesi için: `const WF = (E, n) => Math.round(E.words[Math.min(n, E.words.length - 1)].s * E.fps);`
- Kadraj dikey ve dar: 4 m mesafede yatayda yalnız ±0,8 m görünür. Yakın plan için kamerayı nesneden en az 1,3–1,6 m uzak tut; iki şeyi yan yana göstereceksen kamerayı çapraz koy.
- Bir sahnede kullanılan nesneyi sonraki sahnelerde gizle: her karede başta `reset()` ile görünürlüğü/konumu sıfırla (yoksa önceki sahneden asılı kalır).
- Büyük yarı saydam parıltı küreleri yüzleri kapatır; parıltı küçük olsun, etkiyi overlay ile ekranı hafif boyayarak ver.
- "night" ışığı çok karanlık; uzay/su altı için "day" + overlay renk tonu kullan.
- Aynı model iki kez yaratılıyorsa referansları `g.userData` içinde tut (R.xxx üzerine yazılmasın).
- Altyazı motor tarafından otomatik; overlay yazıları ekranın üstünde (y≈330) ve kartlar altta (y≈1390) dursun.
- Gerçek kişi birebir benzetilmez, marka/logo yok, kanlı/iğrenç detay yok.

## Sıra (yayın tarihine göre)
1. amip (Paz 29 Kas 09:30) 2. mermi (Paz 13:30) 3. einstein (Paz 20:30)

Her videoyu bitirip push ettikten sonra sıradakine geç; böylece bot sen çalışırken bitenleri render eder.
Hassas konular (radyum, nyos, filayagi, cambeyin): ceset/hastalık/yanık detayı yok, saygılı ton.
- Büyük overlay yazısı ekran genişliğini aşmasın: uzun başlıkta fontu küçült ya da `g.measureText` ile ölçüp sığdır (örn. "KARANLIKTA PARLAR" iki yandan kesildi).
- Hiçbir çekim boş/karanlık duvar olarak kalmasın; her karede kadrajda bir özne (karakter/nesne) olsun. Açılış (kare 0-90) özellikle dolu ve dikkat çekici olsun.
- Karanlık sahnede ya da parlama efektinde yüzler okunabilir kalsın; karakteri siyaha boyama.
- Yüzün önüne düz kutu/kare koyma (havlu gibi); hata gibi görünür. Nesneyi elde ya da yüzün yanında göster.
- Yakın planda kafanın üstü kesilmesin.

## Durum
- suayisi: hazır (21.11 23:50)
- vucut: hazır (21.11 23:55)
- sullivan: hazır (22.11 00:29)
- mantis: hazır (22.11 00:35)
- radyum: hazır (22.11 00:40)
- osborne: hazır (22.11 00:43)
- muz: hazır (22.11 00:46)
- dans: hazır (22.11 00:49)
- aglamak: hazır (22.11 00:52)
- cambeyin: hazır (22.11 00:55)
- nyos: hazır (22.11 00:58)
- balina: hazır (22.11 01:02)
- mumya: hazır (22.11 04:55)
- filayagi: hazır (22.11 05:01)
- amip: hazır (28.11 14:43)

## Dosya düzeni (kanal sahibinin kuralı, 27.11)
Kullanıcının bilgisayarında repo dışı üretilen her dosya (ses kaydı, örnek, rapor, dışa aktarım) masaüstündeki
`%USERPROFILE%\OneDrive\Masaüstü\PMDARWIN\` klasörüne, konusuna göre alt klasöre konur. İndirilenler'e ya da başka yere dağınık dosya bırakma.
