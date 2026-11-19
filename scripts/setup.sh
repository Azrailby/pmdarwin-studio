#!/usr/bin/env bash
# Installs everything the renderer needs. Safe to run more than once.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
pip install --quiet --break-system-packages "sherpa-onnx<1.13" soundfile cairosvg numpy pillow 2>/dev/null \
  || pip install --quiet "sherpa-onnx<1.13" soundfile cairosvg numpy pillow
# Manim (uzun videolarda bilimsel animasyon sahneleri) — isteğe bağlı; kurulamazsa SVG çizimlerle devam edilir
if ! python3 -c "import manim" 2>/dev/null; then
  (dpkg -s libpango1.0-dev >/dev/null 2>&1 || (apt-get install -y -q libpango1.0-dev pkg-config >/dev/null 2>&1 \
     || (apt-get update -q >/dev/null 2>&1 && apt-get install -y -q libpango1.0-dev pkg-config >/dev/null 2>&1))) || true
  pip install --quiet --break-system-packages manim 2>/dev/null || pip install --quiet manim 2>/dev/null \
    || echo "UYARI: manim kurulamadı; manim sahneleri yerine SVG çizim kullan."
fi
command -v ffmpeg >/dev/null || { echo "ffmpeg gerekli (apt-get install ffmpeg)"; exit 1; }
mkdir -p "$ROOT/.cache"
V="$ROOT/.cache/vits-piper-tr_TR-dfki-medium"
if [ ! -f "$V/tr_TR-dfki-medium.onnx" ]; then
  curl -sSL -o "$ROOT/.cache/dfki.tar.bz2" \
    https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-tr_TR-dfki-medium.tar.bz2
  tar xjf "$ROOT/.cache/dfki.tar.bz2" -C "$ROOT/.cache" && rm "$ROOT/.cache/dfki.tar.bz2"
fi
echo "Kurulum tamam."
