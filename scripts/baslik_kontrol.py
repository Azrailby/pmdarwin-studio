#!/usr/bin/env python3
"""baslik_kontrol.py - Türkçe YouTube başlığı ve kanca kontrolü (yayından önce).

    python3 scripts/baslik_kontrol.py --baslik "Bu Mantar Karıncayı Kuklaya Çeviriyor #shorts"
    python3 scripts/baslik_kontrol.py --baslik "..." --kapak "ZOMBİ KARINCA"
    python3 scripts/baslik_kontrol.py --kanca "Bu mantar, bir karıncayı canlıyken kukla gibi yönetiyor."
    python3 scripts/baslik_kontrol.py --json --baslik "..."

Puan 70'in altındaysa başlığı/kancayı düzelt. Kurallar:
- Başlık: masaüstü aramada ~60, mobil ana sayfada ~40 karakterden sonrası kesilir (#shorts hariç sayılır).
- En çok 2 tamamen büyük harfli kelime; boş sıfatlar (inanılmaz, şok, efsane...) yerine sayı, isim, tarih.
- Konu ilk 3 kelimede olmalı. Kapak yazısı başlığı tekrar etmemeli, en çok 3 kelime.
- Not: Her Kelimesi Büyük başlıklarda özel isim ayırt edilemez; "somut yok" uyarısında isim varsa yok say.
- Kanca (ilk cümle): en çok 12 kelime, selam/abone/bugün gibi dolgu yok, somut bir şey (sayı, isim, yer) ve
  merak açığı (ama, neden, kimse, hâlâ, aslında...) taşımalı.

Başlık kurallarının bir kısmı jakeschincariol/youtube-agent-skill (MIT lisansı, (c) 2026 Jake Schincariol)
içindeki title.py'den uyarlanmıştır; Türkçe kelime listeleri ve kanca kontrolü bu depoya özeldir.
"""
import json, re, sys

MASAUSTU, MOBIL, SINIR = 60, 40, 100
BOS = {"inanılmaz", "şok", "şoke", "efsane", "müthiş", "harika", "çılgın", "akılalmaz", "mükemmel", "süper",
       "olağanüstü", "korkunç", "dehşet", "bomba", "sır", "sırrı", "gizli", "devasa", "muhteşem"}
DOLGU = {"merhaba", "selam", "arkadaşlar", "bugün", "video", "videoda", "abone", "kanal", "kanala", "beğen", "hadi",
         "yani", "aslında", "şimdi", "evet"}
DURAK = {"bir", "bu", "şu", "o", "ve", "ile", "de", "da", "ki", "mi", "mı", "mu", "mü", "için", "gibi", "ne", "neden",
         "nasıl", "sen", "senin", "ben", "biz", "çok"}
SAYI_KELIME = {"iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on", "yirmi", "otuz", "kırk", "elli",
               "altmış", "yetmiş", "seksen", "doksan", "yüz", "bin", "milyon", "milyar", "trilyon", "saniye", "dakika",
               "saat", "gün", "yıl", "yüzyıl", "metre", "kilometre", "derece"}
MERAK = {"ama", "neden", "nasıl", "kimse", "hâlâ", "hala", "aslında", "sonra", "meğer", "ancak", "fakat", "hiç",
         "asla", "gerçekte", "ne", "olursa", "olur", "kadar", "yaşarsın", "bilmiyor"}
TEHLIKE = {"ölüm", "ölür", "öldü", "ölümüne", "öldürür", "yaşar", "yaşadı", "kör", "çıldır", "beyin", "beynini", "canlı",
           "canlıyken", "kukla", "parazit", "zehir", "yok", "patlar", "erir", "kaybol"}


def low(s):
    return s.replace("I", "ı").replace("İ", "i").lower()


def kelimeler(t):
    return re.findall(r"[0-9a-zçğıöşüâîû']+", low(t))


def somut_mu(t):
    k = kelimeler(t)
    rakam = re.findall(r"\d[\d.,]*", t)
    sayi = [w for w in k if w in SAYI_KELIME]
    ws = [w for w in t.split() if w[:1].isalpha()]
    baslik_duzeni = ws and sum(w[:1].isupper() for w in ws) / len(ws) > 0.6   # Her Kelime Büyük -> isim sinyali yok
    ozel = [] if baslik_duzeni else [w for i, w in enumerate(t.split()) if i > 0 and w[:1].isupper() and not w.isupper()]
    return rakam + sayi + ozel


def baslik(t, kapak=None):
    temiz = re.sub(r"\s*#\w+", "", t).strip()
    n = len(temiz)
    sorun, iyi = [], []
    if n > SINIR: sorun.append(("uzunluk", f"{n} karakter - YouTube sınırı {SINIR}"))
    elif n > MASAUSTU: sorun.append(("uzunluk", f"{n} karakter - masaüstü aramada ~{MASAUSTU}'tan sonra kesilir"))
    else: iyi.append(f"{n} karakter, {MASAUSTU} sınırının içinde")
    if n > MOBIL:
        bas = temiz[:MOBIL].rsplit(" ", 1)[0]
        sorun.append(("mobil", f'mobilde "{bas}..." görünür - konu bu kısımda kalıyor mu kontrol et'))
    buyuk = [w for w in temiz.split() if len(w) > 2 and w.isupper()]
    if len(buyuk) > 2: sorun.append(("bağırma", f"{len(buyuk)} büyük harfli kelime - en çok 2"))
    bos = [w for w in kelimeler(temiz) if w in BOS]
    if bos: sorun.append(("boş sıfat", f"{', '.join(sorted(set(bos)))} - yerine sayı, isim ya da tarih koy"))
    s = somut_mu(temiz)
    if s: iyi.append(f"somut öğe var ({', '.join(s[:3])})")
    else: sorun.append(("somut yok", "sayı, tarih ya da isim yok - en etkili tek düzeltme"))
    if temiz.endswith("?"): iyi.append("başlık açık bir soru soruyor")
    on = [w for w in kelimeler(temiz)[:3] if w not in DURAK]
    if not on: sorun.append(("konu geride", "ilk üç kelime dolgu - konuyu öne al"))
    if kapak:
        ortak = (set(kelimeler(temiz)) - DURAK) & (set(kelimeler(kapak)) - DURAK)
        if ortak: sorun.append(("tekrar", f"kapak yazısı başlığı tekrarlıyor ({', '.join(sorted(ortak))}) - başka kelimeler kullan"))
        else: iyi.append("kapak ve başlık farklı kelimeler taşıyor")
        if len(kelimeler(kapak)) > 3: sorun.append(("kapak uzun", f"kapakta {len(kelimeler(kapak))} kelime - en çok 3"))
    puan = max(0, min(100, 100 - 14 * len(sorun) + 4 * len(iyi)))
    return {"tur": "başlık", "metin": t, "karakter": n, "puan": puan, "sorunlar": sorun, "iyiler": iyi}


def kanca(t):
    k = kelimeler(t)
    sorun, iyi = [], []
    if len(k) > 12: sorun.append(("uzun", f"{len(k)} kelime - en çok 12; ilk saniyede okunmalı"))
    else: iyi.append(f"{len(k)} kelime")
    d = [w for w in k if w in DOLGU]
    if d: sorun.append(("dolgu", f"{', '.join(sorted(set(d)))} - giriş/abone çağrısı kancada olmaz"))
    if k[:1] and k[0] in {"merhaba", "selam", "bugün", "arkadaşlar"}:
        sorun.append(("giriş", "selamla ya da 'bugün' ile açma - doğrudan en çarpıcı bilgiyle başla"))
    s = somut_mu(t)
    if s: iyi.append(f"somut öğe ({', '.join(s[:3])})")
    m = [w for w in k if w in MERAK]
    tehl = [w for w in k if w in TEHLIKE]
    if m or t.strip().endswith("?"): iyi.append("merak açığı var")
    if tehl: iyi.append(f"tehlike/gerilim kelimesi ({', '.join(tehl[:2])})")
    if not (s or tehl): sorun.append(("belirsiz", "somut bir şey ya da gerilim yok - bir sayı, isim veya sonuç ekle"))
    if not (m or tehl or t.strip().endswith("?")): sorun.append(("merak yok", "izleyicinin kapatamayacağı bir soru aç"))
    puan = max(0, min(100, 100 - 18 * len(sorun) + 5 * len(iyi)))
    return {"tur": "kanca", "metin": t, "puan": puan, "sorunlar": sorun, "iyiler": iyi}


def goster(r):
    print(f'\n  {r["tur"].upper()}: "{r["metin"]}"\n  puan {r["puan"]}/100' + ("  (düzelt)" if r["puan"] < 70 else ""))
    for a, m in r["sorunlar"]: print(f"    x  {a:<12} {m}")
    for m in r["iyiler"]: print(f"    ok              {m}")


def main():
    a = sys.argv[1:]
    js = "--json" in a; a = [x for x in a if x != "--json"]
    out = []
    if "--baslik" in a: out.append(baslik(a[a.index("--baslik") + 1], a[a.index("--kapak") + 1] if "--kapak" in a else None))
    if "--kanca" in a: out.append(kanca(a[a.index("--kanca") + 1]))
    if not out: print(__doc__); sys.exit(1)
    if js: print(json.dumps(out, ensure_ascii=False, indent=1)); return
    for r in out: goster(r)
    print()


if __name__ == "__main__":
    main()
