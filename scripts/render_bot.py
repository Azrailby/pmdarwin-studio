#!/usr/bin/env python3
"""PMDARWIN render botu: bulut Claude ile yerel bilgisayar arasındaki köprü.

Bulut tarafı (Claude) yeni bir video projesini cizgi/<ad>/ altına koyar ve içine
READY dosyası ekleyip GitHub'a gönderir. Bu bot yerel bilgisayarda birkaç dakikada
bir çalışır:
  1) git pull
  2) READY olan ama henüz teslim edilmemiş her proje için: ses -> kareler (GPU) -> mp4
  3) mp4'ü teslim/<ad>.mp4 olarak repoya ekler ve gönderir
Bulut tarafı mp4'ü oradan alır, kontrol eder ve yayına planlar.

Kullanım:  python scripts/render_bot.py            (bir tur çalışır ve çıkar)
           python scripts/render_bot.py --loop 600 (10 dakikada bir, sürekli)
"""
import json, os, shutil, subprocess, sys, time, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
GIT = shutil.which("git") or r"C:\Program Files\Git\cmd\git.exe"
PY = sys.executable
LOG = os.path.join(ROOT, "teslim", "bot.log")
# Windows'ta pythonw altında git/python/ffmpeg her çağrıda konsol penceresi açmasın.
# Gizli konsol alt süreçlere de geçer (ör. finish.py içindeki ffmpeg).
NOWIN = {"creationflags": subprocess.CREATE_NO_WINDOW} if os.name == "nt" else {}


def log(msg):
    line = f"{datetime.datetime.now():%Y-%m-%d %H:%M:%S}  {msg}"
    print(line, flush=True)
    os.makedirs(os.path.dirname(LOG), exist_ok=True)
    with open(LOG, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def git(*args, check=True):
    return subprocess.run([GIT, *args], cwd=ROOT, check=check, capture_output=True, text=True, **NOWIN)


def run(cmd, cwd):
    r = subprocess.run(cmd, cwd=cwd, capture_output=True, text=True, encoding="utf-8", errors="replace", **NOWIN)
    tail = (r.stdout + r.stderr).strip().splitlines()[-6:]
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(cmd)} başarısız:\n" + "\n".join(tail))
    return "\n".join(tail)


def one_pass():
    try:
        git("pull", "--rebase", "--autostash")
    except subprocess.CalledProcessError as e:
        log(f"git pull hatası: {e.stderr.strip()[:300]}")
        return
    base = os.path.join(ROOT, "cizgi")
    if not os.path.isdir(base):
        return
    for name in sorted(os.listdir(base)):
        proj = os.path.join(base, name)
        out_mp4 = os.path.join(ROOT, "teslim", f"{name}.mp4")
        if not os.path.isfile(os.path.join(proj, "READY")) or os.path.isfile(out_mp4):
            continue
        meta = {}
        if os.path.isfile(os.path.join(proj, "meta.json")):
            meta = json.load(open(os.path.join(proj, "meta.json"), encoding="utf-8"))
        title = meta.get("file_title", name)
        log(f"{name}: başladı")
        t0 = time.time()
        try:
            run([PY, "tools/audio.py", "."], proj)
            run([PY, "tools/render.py", ".", "frames", "--resume"], proj)
            res = run([PY, "tools/finish.py", ".", title], proj)
        except Exception as e:
            log(f"{name}: HATA {e}")
            with open(os.path.join(ROOT, "teslim", f"{name}.HATA.txt"), "w", encoding="utf-8") as f:
                f.write(str(e))
            push(f"render hatası: {name}", [f"teslim/{name}.HATA.txt", "teslim/bot.log"])
            continue
        made = [f for f in os.listdir(os.path.join(proj, "out")) if f.endswith(".mp4")]
        made.sort(key=lambda f: os.path.getmtime(os.path.join(proj, "out", f)))
        shutil.copy2(os.path.join(proj, "out", made[-1]), out_mp4)
        qa = os.path.join(proj, "out", "qa_sheet.jpg")
        if os.path.isfile(qa):
            shutil.copy2(qa, os.path.join(ROOT, "teslim", f"{name}_qa.jpg"))
        log(f"{name}: bitti ({time.time() - t0:.0f} sn) | {res.splitlines()[-1] if res else ''}")
        push(f"render teslim: {name}", [f"teslim/{name}.mp4", f"teslim/{name}_qa.jpg", "teslim/bot.log"])


def push(msg, files):
    files = [f for f in files if os.path.exists(os.path.join(ROOT, f))]
    git("add", "-f", *files)
    git("commit", "-m", msg, check=False)
    for _ in range(3):
        if git("push", "origin", "HEAD:main", check=False).returncode == 0:
            return
        git("pull", "--rebase", "--autostash", check=False)
    log("push başarısız (3 deneme)")


if __name__ == "__main__":
    if "--loop" in sys.argv:
        every = int(sys.argv[sys.argv.index("--loop") + 1])
        while True:
            one_pass(); time.sleep(every)
    else:
        one_pass()
