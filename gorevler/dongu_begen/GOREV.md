# Görev: Döngü sonu + görünür Beğen rozeti (amip, mermi, einstein)

Kullanıcı amip videosunu izledi, iki eksik buldu:
1. **Son ile baş birbirine bağlanmıyor.** Shorts'ta video başa sardığında fark edilmeden devam etmeli.
2. **Beğen hatırlatması görünmüyor.** Takip et belli oluyor ama Beğen rozeti çok küçük ve kısa kalıyor.

SESE DOKUNMA (voice.wav, words.json aynen kalsın). Sadece story.js / cta_katmani.js / sound.json.

## 1) Döngü (loop) sonu — üç videoda da
- Son çekimin son ~0,7 sn'si, kare 0'daki açılış görüntüsüyle AYNI kompozisyona (aynı kamera konumu, aynı ışık, aynı karakter/obje yerleşimi) yumuşakça varsın. Son kare ile kare 0 arasında kamera/renk sıçraması olmasın.
  - amip: "Tek kapısı burun." → kamera, açılıştaki burun+amip yakın planına geri döner; amip tekrar burnun önünde belirir (açılış karesinin aynısı).
  - mermi: son cümle → açılıştaki "suya atlama" karesine döner.
  - einstein: son cümle → açılıştaki Einstein/beyin karesine döner.
- Son karede fade/siyah YOK, müzik sting'i son 0,3 sn'de bitsin ki başa sarınca ses de kesik durmasın.
- Kontrol: `render.py . stills 0,<son kare>` alıp iki kareyi yan yana sheet yap ve neredeyse aynı olduklarını gör.

## 2) Beğen rozeti
- `scripts/cta_katmani.js`: Beğen rozetini Takip et ile AYNI boyuta getir (şu an küçük), ekranda en az 3 sn kalsın, kalp 2 kez belirgin atsın, rozet girişte hafif büyüyüp otursun (pop).
- Konum: üstte, başlık yazılarıyla çakışmasın (çakışıyorsa y'yi ayarla). Yüzü/önemli objeyi kapatmasın.
- Zaman: videonun ~%40–55'inde, bir cümle bittikten hemen sonra (BEGEN_KELIME).
- Takip et rozetinin "TEK KAPISI" gibi büyük yazılarla üst üste binmesini de düzelt.
- Kontrol: Beğen'in göründüğü 3 kareden still al, gözle bak.

## 3) Bitir
- Üç videoda frames/ ve out/ sil, `git rm` teslim/amip|mermi|einstein mp4 ve _qa.jpg, READY kalsın, push → bot yeniden render etsin.
- teslim/aglamak.mp4 ve aglamak_qa.jpg depoya yanlışlıkla geri gelmiş: `git rm` et ve yerel teslim/ klasöründen de kaldır ki bot tekrar eklemesin.
- CLAUDE_CODE_GOREV.md'ye kural ekle: "Her video döngü sonuyla biter: son kare kare 0'a görsel olarak bağlanır. Beğen ve Takip et rozetleri aynı boyutta ve belirgin."
- DONE koy, commit, push.
