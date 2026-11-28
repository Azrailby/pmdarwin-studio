"""Bir cizgi projesi için kanal sahibinin klon sesiyle (Barış anlatıcı) seslendirme + kelime zamanlaması üretir.

Kullanım (kanal sahibinin bilgisayarında, pmdarwin_tts sanal ortamıyla):
    %USERPROFILE%\\pmdarwin_tts\\Scripts\\python scripts/ses_uret.py cizgi/<ad>

Girdi : cizgi/<ad>/script.txt  (okunacak metin, rakamlar yazıyla; yabancı adlar okunduğu gibi)
        cizgi/<ad>/okunus.json (isteğe bağlı) {"Aynştayn": "Einstein"} — altyazıda doğru yazım
Çıktı : cizgi/<ad>/work/voice.wav, words.json, phrases.json, timing.txt
        (words: [{w,s,e}], phrases: [{text,s,e,w0,w1}] — motor ve audio.py bu biçimi bekler)

Ses ayarı: "Barış anlatıcı" = exaggeration 0.6, cfg 0.4 (kanal sahibi 28.11.2026'da seçti).
Referans kayıt: %USERPROFILE%\\OneDrive\\Masaüstü\\PMDARWIN\\Ses\\ref_baris.wav — REPOYA EKLENMEZ.
Üretilen voice.wav da repoya eklenmez (.gitignore); render botu aynı bilgisayarda çalıştığı için gerek yok.
"""
import json
import os
import re
import sys
import time

import numpy as np
import torch

REF = os.path.join(os.path.expanduser("~"), "OneDrive", "Masaüstü", "PMDARWIN", "Ses", "ref_baris.wav")
EXAG, CFG = 0.6, 0.4
GAP = 0.20          # cümleler arası sessizlik (sn)
COMMA_PAUSE = 0.15  # virgül sonrası tahmini duraklama (sn)
MIN_SEC_PER_CHAR = 0.065
RETRIES = 2
VOWELS = set("aeıioöuüâîûAEIİOÖUÜÂÎÛ")


def syl(w):
    return max(1, sum(c in VOWELS for c in w))


def split_sentences(text):
    return [p.strip() for p in re.split(r"(?<=[.!?…])\s+", text.strip()) if p.strip()]


def main():
    proj = sys.argv[1].rstrip("/\\")
    text = open(os.path.join(proj, "script.txt"), encoding="utf-8").read().strip()
    work = os.path.join(proj, "work")
    os.makedirs(work, exist_ok=True)
    if not os.path.isfile(REF):
        sys.exit(f"referans kayıt yok: {REF}")

    from chatterbox.mtl_tts import ChatterboxMultilingualTTS
    dev = "cuda" if torch.cuda.is_available() else "cpu"
    t0 = time.time()
    m = ChatterboxMultilingualTTS.from_pretrained(device=dev)
    sr = m.sr
    print(f"model yüklendi ({dev}) {time.time() - t0:.0f}s", flush=True)

    out, words, phr = [], [], []
    cur = 0.0
    for si, s in enumerate(split_sentences(text)):
        best = None
        for attempt in range(1 + RETRIES):
            w = m.generate(s, language_id="tr", audio_prompt_path=REF,
                           exaggeration=EXAG, cfg_weight=CFG).detach().cpu().numpy().reshape(-1).astype(np.float32)
            if best is None or len(w) > len(best):
                best = w
            if len(w) / sr >= len(s) * MIN_SEC_PER_CHAR:
                break
            print(f"  cümle {si + 1} kısa çıktı, tekrar ({attempt + 1})", flush=True)
        y = best
        # baş/son sessizliği kırp (konuşma başlangıcı zamanlamayı kaydırmasın)
        win = max(1, int(sr * 0.02))
        env = np.convolve(np.abs(y), np.ones(win) / win, "same")
        act = np.where(env > 0.02 * env.max())[0]
        if len(act):
            a0 = max(0, act[0] - int(0.03 * sr))
            a1 = min(len(y), act[-1] + int(0.06 * sr))
            y = y[a0:a1]
        dur = len(y) / sr
        parts = [p.strip() for p in re.split(r"(?<=[,:;])\s+", s) if p.strip()]
        toks = [(p, p.split()) for p in parts]
        pause = COMMA_PAUSE * (len(parts) - 1)
        tot = sum(syl(x) for _, ws in toks for x in ws)
        speak = max(0.1, dur - pause)
        x = cur
        for pi, (p, ws) in enumerate(toks):
            w0, ps = len(words), x
            for ww in ws:
                d = speak * syl(ww) / tot
                words.append({"w": ww, "s": round(x, 3), "e": round(x + d, 3)})
                x += d
            phr.append({"text": p, "s": round(ps, 3), "e": round(x, 3), "w0": w0, "w1": len(words) - 1})
            if pi < len(toks) - 1:
                x += COMMA_PAUSE
        out += [y, np.zeros(int(GAP * sr), np.float32)]
        cur += dur + GAP
        print(f"  cümle {si + 1}: {dur:.2f}s  {s[:50]}", flush=True)

    # okunus.json: {"Aynştayn": "Einstein"} gibi; TTS için fonetik yazılan kelimeler altyazıda doğru yazılsın
    fix_path = os.path.join(proj, "okunus.json")
    if os.path.isfile(fix_path):
        fix = json.load(open(fix_path, encoding="utf-8"))
        def fx(t):
            for k, v in fix.items():
                t = t.replace(k, v)
            return t
        for w in words:
            w["w"] = fx(w["w"])
        for p in phr:
            p["text"] = fx(p["text"])

    yy = np.concatenate(out)
    peak = float(np.abs(yy).max()) or 1.0
    yy = (yy / peak * 0.89).astype(np.float32)  # tepe ~ -1 dB; ses seviyesi audio.py'de ayarlanır
    import soundfile as sf
    sf.write(os.path.join(work, "voice.wav"), yy, sr)
    json.dump(words, open(os.path.join(work, "words.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
    json.dump(phr, open(os.path.join(work, "phrases.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    lines = [f"yöntem: Barış anlatıcı (chatterbox, exag {EXAG}, cfg {CFG}) · ses {len(yy) / sr:.2f} sn · {len(words)} kelime · {len(phr)} parça"]
    for i, p in enumerate(phr):
        lines.append(f"  P{i:02d} {p['s']:6.2f}-{p['e']:6.2f}  kare {round(p['s'] * 30):4d}-{round(p['e'] * 30):4d}  w{p['w0']}-{p['w1']}  {p['text']}")
    lines.append(f"toplam kare (30 fps): {int(np.ceil((len(yy) / sr + 1.0) * 30))}")
    open(os.path.join(work, "timing.txt"), "w", encoding="utf-8").write("\n".join(lines) + "\n")
    print("\n".join(lines))

    # Gerçek kelime zamanları: Whisper ile hizala (hece tahmini yerine). Kurulu değilse uyar.
    try:
        import whisper
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        import zamanla
        del m
        torch.cuda.empty_cache() if dev == "cuda" else None
        zamanla.align(proj, whisper.load_model(zamanla.MODEL_NAME, device=dev))
    except ImportError:
        print("UYARI: openai-whisper kurulu değil; zamanlama hece tahmini. Kur: pip install -U openai-whisper", flush=True)


if __name__ == "__main__":
    main()
