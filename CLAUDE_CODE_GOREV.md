# Claude Code için görev: PMDARWIN çizgi Short üretimi

Sen bu kanalın ikinci üretim istasyonusun. Bulut tarafındaki Claude konu, senaryo, ses ve zamanlamayı hazırlar; sen sahneyi (story.js) yazar, kareleri kontrol eder ve hazır işaretlersin. Render botu (render_bot.py) READY gördüğünde videoyu senin GPU'nda çıkarır ve teslim/ klasörüne koyar.

## İş bulma
1. `git pull`
2. `cizgi/*/PLAN.md` olup içinde `story.js` ve `READY` OLMAYAN klasörler senin işin. (Şu an: `cizgi/suayisi`, `cizgi/vucut`)
3. Her klasörde hazır: `script.txt`, `work/voice.wav`, `work/words.json`, `work/phrases.json`, motor + araçlar. Sesi/senaryoyu DEĞİŞTİRME.

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

## Durum
