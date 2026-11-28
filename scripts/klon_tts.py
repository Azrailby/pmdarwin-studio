"""Chatterbox Multilingual ile referans sesten Türkçe anlatım üretir.

Kullanım:
    python scripts/klon_tts.py --ref <wav> --text "<metin>" --out <wav|mp3> [--exaggeration 0.6] [--cfg 0.4]

Not: Referans kayıt ve üretilen ses dosyaları repoya EKLENMEZ.
"""
import argparse
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time

import torch
import torchaudio as ta


def ffmpeg_exe():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        sys.exit("ffmpeg bulunamadı (PATH'e ekleyin ya da `pip install imageio-ffmpeg`).")


def split_sentences(text):
    parts = re.split(r"(?<=[.!?…])\s+", text.strip())
    return [p.strip() for p in parts if p.strip()]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--ref", required=True)
    ap.add_argument("--text", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--exaggeration", type=float, default=0.6)
    ap.add_argument("--cfg", type=float, default=0.4)
    ap.add_argument("--lang", default="tr")
    ap.add_argument("--pause", type=float, default=0.25)
    ap.add_argument("--lufs", type=float, default=-16.0)
    ap.add_argument("--bitrate", default="128k")
    ap.add_argument("--retries", type=int, default=2)
    ap.add_argument("--min-sec-per-char", type=float, default=0.065)
    ap.add_argument("--device", default="cuda" if torch.cuda.is_available() else "cpu")
    args = ap.parse_args()

    from chatterbox.mtl_tts import ChatterboxMultilingualTTS

    t0 = time.time()
    m = ChatterboxMultilingualTTS.from_pretrained(device=args.device)
    print(f"model yüklendi ({args.device}) {time.time() - t0:.1f}s", flush=True)

    t1 = time.time()
    sr = m.sr
    silence = torch.zeros(1, int(sr * args.pause))
    chunks = []
    for i, s in enumerate(split_sentences(args.text)):
        # Model bazen tekrar algılayıp cümleyi erken bitiriyor (forcing EOS).
        # Harf sayısına göre beklenenden kısa çıkarsa yeniden üret, en uzununu tut.
        min_dur = len(s) * args.min_sec_per_char
        best = None
        for attempt in range(1 + args.retries):
            wav = m.generate(
                s,
                language_id=args.lang,
                audio_prompt_path=args.ref,
                exaggeration=args.exaggeration,
                cfg_weight=args.cfg,
            ).detach().cpu()
            if wav.dim() == 1:
                wav = wav.unsqueeze(0)
            if best is None or wav.shape[-1] > best.shape[-1]:
                best = wav
            dur = wav.shape[-1] / sr
            if dur >= min_dur:
                break
            print(f"  cümle {i + 1}: {dur:.2f}s < {min_dur:.2f}s, tekrar ({attempt + 1})", flush=True)
        wav = best
        if chunks:
            chunks.append(silence)
        chunks.append(wav)
        print(f"  cümle {i + 1}: {wav.shape[-1] / sr:.2f}s", flush=True)
    full = torch.cat(chunks, dim=-1)
    gen_time = time.time() - t1

    out = os.path.abspath(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    fd, tmp = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        ta.save(tmp, full, sr)
        cmd = [ffmpeg_exe(), "-y", "-loglevel", "error", "-i", tmp,
               "-af", f"loudnorm=I={args.lufs}:TP=-1.5:LRA=11", "-ar", str(sr), "-ac", "1"]
        if out.lower().endswith(".mp3"):
            cmd += ["-c:a", "libmp3lame", "-b:a", args.bitrate]
        cmd.append(out)
        subprocess.run(cmd, check=True)
    finally:
        os.remove(tmp)

    print(f"çıktı: {out} | süre {full.shape[-1] / sr:.2f}s | üretim {gen_time:.1f}s", flush=True)


if __name__ == "__main__":
    main()
