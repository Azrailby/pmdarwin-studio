"""Seslendirmeyi Whisper ile dinleyip kelime zamanlarını GERÇEK sese göre çıkarır (altyazı/sahne senkronu).

Kullanım (pmdarwin_tts sanal ortamıyla; ilk kez: pip install -U openai-whisper):
    %USERPROFILE%\\pmdarwin_tts\\Scripts\\python scripts/zamanla.py cizgi/<ad> [cizgi/<ad2> ...]

Girdi : cizgi/<ad>/work/voice.wav, cizgi/<ad>/script.txt, (varsa) okunus.json
Çıktı : work/words.json, work/phrases.json, work/timing.txt  (üzerine yazar; voice.wav'a DOKUNMAZ)

Yöntem: Whisper (turbo, Türkçe, word_timestamps) sesi kelime kelime zamanlar. Altyazıdaki kelimeler
her zaman script.txt'den gelir (Whisper'ın yazımı değil); Whisper kelimeleri script kelimeleriyle
sıra hizalamasıyla (difflib) eşleştirilir, eşleşmeyenlerin zamanı komşulardan hece oranıyla doldurulur.
Ayrıca sessizlik analizi: kelime başlangıcı, gerçek ses enerjisinin başladığı ana çekilir.
"""
import difflib
import json
import os
import re
import sys

import numpy as np

VOWELS = set("aeıioöuüâîûAEIİOÖUÜÂÎÛ")
MODEL_NAME = os.environ.get("WHISPER_MODEL", "turbo")


def syl(w):
    return max(1, sum(c in VOWELS for c in w))


def norm(w):
    w = w.replace("I", "ı").replace("İ", "i").lower()
    return re.sub(r"[^0-9a-zçğıöşüâîû]", "", w)


def load_audio(path):
    import soundfile as sf
    y, sr = sf.read(path, dtype="float32")
    if y.ndim > 1:
        y = y.mean(axis=1)
    return y, sr


def _activity(y, sr):
    """10 ms karelerde konuşma etkinliği. Nefes / ağız tıkırtısı konuşma sayılmaz: arkasından ≥0,1 sn
    sessizlik gelen kısa ses parçası gürültü gibiyse (yüksek sıfır geçişi = nefes) ya da çok kısa ve
    periyodik değilse (tık) sessizlik sayılır. Eşik çevresinde titreyen nefes tek parça sayılsın diye
    0,08 sn'den kısa boşluklar önce kapatılır. (amip "Ilık" öncesi 0,4 sn nefes vardı.)"""
    hop = int(sr * 0.01)
    env = np.sqrt(np.convolve(y ** 2, np.ones(hop) / hop, "same"))[::hop]
    act = env > 0.06 * float(env.max() or 1)
    n = len(act)
    idx = np.where(act)[0]
    for a, b in zip(idx[:-1], idx[1:]):  # kısa boşlukları kapat
        if 1 < b - a <= 8:
            act[a:b] = True
    k = 0
    while k < n:
        if not act[k]:
            k += 1
            continue
        j = k
        while j < n and act[j]:
            j += 1
        if j - k < 60 and not act[j:j + 10].any():
            x = y[k * hop:j * hop]
            zcr = np.mean(np.abs(np.diff(np.sign(x)))) / 2 * sr if len(x) > 1 else 0
            xx = x - x.mean()
            ac = np.correlate(xx, xx, "full")[len(xx) - 1:]
            per = float(ac[int(sr / 400):int(sr / 70)].max() / (ac[0] + 1e-9)) if len(xx) > sr / 70 else 0.0
            if zcr > 6000 or (j - k < 25 and per < 0.3):
                act[k:j] = False
        k = j
    return act


def _sentence_gaps(y, sr):
    """ses_uret.py cümleler arasına ≥0,2 sn dijital sıfır koyar; bunların (başlangıç, bitiş) saniyeleri."""
    z = np.abs(y) < 1e-4
    gaps, k, n, mn = [], 0, len(z), int(0.18 * sr)
    while k < n:
        if not z[k]:
            k += 1
            continue
        j = k
        while j < n and z[j]:
            j += 1
        if j - k >= mn and k > 0 and j < n:
            gaps.append((k / sr, j / sr))
        k = j
    return gaps


def snap_starts(words, y, sr):
    """Kelime başlangıçlarını gerçek ses enerjisine oturt (10 ms çözünürlük).
    1) Cümle çapası: ses_uret.py'nin cümle aralarındaki dijital sessizlik sayısı cümle sayısı - 1 ise her
       cümlenin ilk kelimesi o boşluktan sonraki ilk gerçek sese (nefes hariç) oturur, cümlenin kelimeleri
       o cümlenin ses aralığının dışına taşmaz. (einstein "Beyin," Whisper'da önceki cümlenin içindeydi.)
    2) Whisper başlangıcı sessizliğin İÇİNDEYSE (duraklamadan sonraki kelimeyi 0,3–0,7 sn erken veriyor),
       kelimenin sonuna kadar ileri bakıp ilk ses enerjisine taşı.
    3) Ses varken başlıyorsa, -0,45/+0,15 sn içinde ≥0,1 sn sessizlikten sonra başlayan ses varsa ona çek;
       yoksa (bitişik konuşma) Whisper zamanını koru. Önceki kelimenin başlangıcının gerisine geçmez.
       (Eski sürüm sadece ±0,12 sn'ye bakıp bitişik konuşmada başlangıcı hep 0,12 sn geri çekiyordu.)"""
    act = _activity(y, sr)
    n = len(act)
    dur = len(y) / sr

    # 1) cümle çapası
    first = [0] + [k + 1 for k in range(len(words) - 1) if re.search(r"[.!?…]$", words[k]["w"])]
    gaps = _sentence_gaps(y, sr)
    anchored = set()
    if len(gaps) == len(first) - 1:
        bounds = []
        for si, k0 in enumerate(first):
            g0 = gaps[si - 1][1] if si > 0 else 0.0
            g1 = gaps[si][0] if si < len(gaps) else dur
            i = int(g0 * 100)
            while i < n and not act[i]:
                i += 1
            bounds.append((min(i / 100, g1 - 0.05), g1))
        for si, k0 in enumerate(first):
            k1 = first[si + 1] if si + 1 < len(first) else len(words)
            s0, s1 = bounds[si]
            words[k0]["s"] = round(s0, 3)
            anchored.add(k0)
            for k in range(k0, k1):
                w = words[k]
                w["s"] = round(min(max(w["s"], s0), s1 - 0.05), 3)
                w["e"] = round(min(max(w["e"], w["s"] + 0.05), s1), 3)
    else:
        print(f"  not: cümle arası sessizlik {len(gaps)} adet, cümle {len(first)} — cümle çapası atlandı", flush=True)

    # 2–3) kelime bazında
    prev = -1
    for k, w in enumerate(words):
        if k in anchored:
            prev = int(round(w["s"] * 100))
            continue
        i0 = min(n - 1, int(round(w["s"] * 100)))
        i1 = min(n, max(i0 + 1, int(round(w["e"] * 100))))
        if not act[i0]:
            seg = np.where(act[i0:i1])[0]
            if len(seg):
                w["s"] = round((i0 + seg[0]) / 100, 3)
        else:
            on = [j for j in range(max(10, i0 - 45, prev + 5), min(n, i0 + 16))
                  if act[j] and not act[j - 10:j].any()]
            if on:
                w["s"] = round(min(on, key=lambda j: abs(j - i0)) / 100, 3)
        if w["s"] * 100 < prev + 5:
            w["s"] = round((prev + 5) / 100, 3)
        prev = int(round(w["s"] * 100))
    for i in range(len(words) - 1):  # sıralı ve çakışmasız kalsın
        if words[i]["e"] > words[i + 1]["s"]:
            words[i]["e"] = words[i + 1]["s"]
        if words[i]["e"] <= words[i]["s"]:
            words[i]["e"] = round(words[i]["s"] + 0.05, 3)
    return words


def align(proj, model):
    work = os.path.join(proj, "work")
    wav = os.path.join(work, "voice.wav")
    text = open(os.path.join(proj, "script.txt"), encoding="utf-8").read().strip()
    y, sr = load_audio(wav)
    dur = len(y) / sr

    res = model.transcribe(wav, language="tr", word_timestamps=True, initial_prompt=text,
                           condition_on_previous_text=False, temperature=0.0)
    hw = [(x["word"].strip(), float(x["start"]), float(x["end"]))
          for seg in res["segments"] for x in seg.get("words", []) if x["word"].strip()]

    sw = text.split()  # script kelimeleri (noktalama dahil, altyazıda görünen)
    a = [norm(w) for w in sw]
    b = [norm(w[0]) for w in hw]
    times = [None] * len(sw)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            _, s, e = hw[blk.b + k]
            times[blk.a + k] = [s, e]
    matched = sum(t is not None for t in times)

    # eşleşmeyenleri komşu zamanlar arasında hece oranıyla doldur
    i = 0
    while i < len(sw):
        if times[i] is not None:
            i += 1
            continue
        j = i
        while j < len(sw) and times[j] is None:
            j += 1
        t0 = times[i - 1][1] if i > 0 else 0.0
        t1 = times[j][0] if j < len(sw) else dur
        if t1 <= t0:
            t1 = t0 + 0.2 * (j - i)
        tot = sum(syl(sw[k]) for k in range(i, j))
        x = t0
        for k in range(i, j):
            d = (t1 - t0) * syl(sw[k]) / tot
            times[k] = [x, x + d]
            x += d
        i = j

    words = [{"w": sw[k], "s": round(times[k][0], 3), "e": round(times[k][1], 3)} for k in range(len(sw))]
    words = snap_starts(words, y, sr)

    # parçalar: cümle sonu ve virgül/iki nokta/noktalı virgülde böl (ses_uret.py ile aynı mantık)
    phr, w0 = [], 0
    for k, w in enumerate(words):
        if re.search(r"[.!?…,:;]$", w["w"]) or k == len(words) - 1:
            phr.append({"text": " ".join(x["w"] for x in words[w0:k + 1]), "s": words[w0]["s"],
                        "e": words[k]["e"], "w0": w0, "w1": k})
            w0 = k + 1

    fix_path = os.path.join(proj, "okunus.json")
    if os.path.isfile(fix_path):
        fix = json.load(open(fix_path, encoding="utf-8"))
        def fx(t):
            for kk, v in fix.items():
                t = t.replace(kk, v)
            return t
        for w in words:
            w["w"] = fx(w["w"])
        for p in phr:
            p["text"] = fx(p["text"])

    json.dump(words, open(os.path.join(work, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(phr, open(os.path.join(work, "phrases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    lines = [f"yöntem: Barış anlatıcı + Whisper hizalama ({MODEL_NAME}) · ses {dur:.2f} sn · {len(words)} kelime · "
             f"{len(phr)} parça · Whisper eşleşen {matched}/{len(sw)}"]
    for k, p in enumerate(phr):
        lines.append(f"  P{k:02d} {p['s']:6.2f}-{p['e']:6.2f}  kare {round(p['s'] * 30):4d}-{round(p['e'] * 30):4d}  "
                     f"w{p['w0']}-{p['w1']}  {p['text']}")
    lines.append(f"toplam kare (30 fps): {int(np.ceil((dur + 1.0) * 30))}")
    open(os.path.join(work, "timing.txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("\n".join(lines), flush=True)
    if matched < 0.7 * len(sw):
        print(f"UYARI: {proj} Whisper eşleşmesi düşük ({matched}/{len(sw)}) — sesi dinlemek gerekebilir", flush=True)


def main():
    import whisper
    import torch
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    model = whisper.load_model(MODEL_NAME, device=dev)
    for proj in sys.argv[1:]:
        print(f"== {proj}", flush=True)
        align(proj.rstrip("/\\"), model)


if __name__ == "__main__":
    main()
