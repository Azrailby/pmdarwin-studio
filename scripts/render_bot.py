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


def claude_busy():
    """Claude Code oturumu hâlâ çalışıyor mu? (kilit dosyası + canlı süreç + süre sınırı)"""
    if not os.path.isfile(LOCK):
        return False
    try:
        info = json.load(open(LOCK, encoding="utf-8"))
        age = (time.time() - info.get("t", 0)) / 60
        return pid_alive(info.get("pid", -1)) and age < LOCK_MAX_MIN
    except Exception:
        return False


def one_pass():
    # Claude çalışırken dokunma: git pull (autostash) oturumun yarım değişikliklerini kenara alıp
    # geri koymaya çalışır ve açık claude.log yüzünden Windows'ta başarısız olur; render de yarım
    # düzenlenmiş projeyi çizebilir. Oturum bitince bir sonraki tur her şeyi yapar.
    if claude_busy():
        return
    try:
        git("pull", "--rebase", "--autostash")
    except subprocess.CalledProcessError as e:
        log(f"git pull hatası: {e.stderr.strip()[:300]}")
        return
    try:
        maybe_start_claude()
    except Exception as e:
        log(f"claude başlatıcı hatası: {e}")
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


# ---------------------------------------------------------------------------
# Claude Code otomatik başlatıcı
# cizgi/<ad>/PLAN.md olup henüz READY'si olmayan işler varsa ve Claude Code şu an
# çalışmıyorsa, Claude Code'u arka planda (headless, -p) CLAUDE_CODE_GOREV.md ile başlatır.
# Böylece kullanıcının talimat yapıştırmasına gerek kalmaz.
LOCK = os.path.join(ROOT, ".claude_lock")
CLOG = os.path.join(ROOT, "teslim", "claude.log")
LOCK_MAX_MIN = 150


def find_claude():
    for name in ("claude", "claude.exe", "claude.cmd"):
        p = shutil.which(name)
        if p:
            return p
    home = os.path.expanduser("~")
    for p in (os.path.join(home, ".local", "bin", "claude.exe"),
              os.path.join(os.environ.get("APPDATA", ""), "npm", "claude.cmd"),
              os.path.join(home, "AppData", "Roaming", "npm", "claude.cmd")):
        if os.path.isfile(p):
            return p
    return None


def pid_alive(pid):
    if os.name == "nt":
        r = subprocess.run(["tasklist", "/FI", f"PID eq {pid}", "/NH"], capture_output=True, text=True, **NOWIN)
        return str(pid) in r.stdout
    try:
        os.kill(pid, 0); return True
    except OSError:
        return False


def pending_jobs():
    base = os.path.join(ROOT, "cizgi")
    if not os.path.isdir(base):
        return []
    return [n for n in sorted(os.listdir(base))
            if os.path.isfile(os.path.join(base, n, "PLAN.md")) and not os.path.isfile(os.path.join(base, n, "READY"))]


def pending_tasks():
    # gorevler/<ad>/GOREV.md olup DONE'u olmayan özel görevler (ses, kurulum vb.)
    base = os.path.join(ROOT, "gorevler")
    if not os.path.isdir(base):
        return []
    return [n for n in sorted(os.listdir(base))
            if os.path.isfile(os.path.join(base, n, "GOREV.md")) and not os.path.isfile(os.path.join(base, n, "DONE"))]


def maybe_start_claude():
    tasks = pending_tasks()
    jobs = pending_jobs() + [f"gorev:{t}" for t in tasks]
    if os.path.isfile(LOCK):
        try:
            info = json.load(open(LOCK, encoding="utf-8"))
            age = (time.time() - info.get("t", 0)) / 60
            if pid_alive(info.get("pid", -1)) and age < LOCK_MAX_MIN:
                return  # hâlâ çalışıyor
        except Exception:
            pass
        os.remove(LOCK)
        log("claude: önceki oturum bitti")
        push("claude günlüğü", ["teslim/claude.log", "teslim/bot.log"])
    if not jobs:
        return
    exe = find_claude()
    if not exe:
        log("claude: claude komutu bulunamadı, otomatik başlatılamadı")
        return
    if tasks:
        prompt = ("pmdarwin-studio reposundasın. Önce git pull yap. Özel görevler var: "
                  + ", ".join(f"gorevler/{t}/GOREV.md" for t in tasks)
                  + ". Her birini baştan sona oku ve aynen uygula; bitince o klasöre DONE dosyası koy, commit ve push et. "
                  "Soru sorma. Görevler bittikten sonra cizgi/ altında bekleyen video işi varsa CLAUDE_CODE_GOREV.md'ye göre onları da yap.")
    else:
      prompt = ("pmdarwin-studio reposundasın. Önce git pull yap. Sonra CLAUDE_CODE_GOREV.md dosyasını baştan sona oku ve uygula. "
              f"Bekleyen işler: {', '.join(jobs)}. Bunları CLAUDE_CODE_GOREV.md içindeki 'Sıra' listesindeki sırayla yap (en erken yayın tarihi önce). Her biri için PLAN.md'ye göre story.js yaz, "
              "kare kontrolünü en az 2 tur yap, sound.json ve meta.json yaz, audio.py çalıştır, READY oluştur, commit ve push et, "
              "Durum bölümüne satır ekle. Ses dosyalarına ve script.txt'ye dokunma. Soru sorma, hepsini bitirene kadar devam et.")
    cmd = [exe, "-p", prompt, "--allowedTools", "Read,Write,Edit,Glob,Grep,Bash,TodoWrite", "--permission-mode", "acceptEdits"]
    if exe.lower().endswith(".cmd"):
        cmd = ["cmd", "/c"] + cmd
    os.makedirs(os.path.dirname(CLOG), exist_ok=True)
    out = open(CLOG, "a", encoding="utf-8")
    out.write(f"\n===== {datetime.datetime.now():%Y-%m-%d %H:%M} başlatıldı: {', '.join(jobs)}\n"); out.flush()
    flags = {}
    if os.name == "nt":
        flags["creationflags"] = subprocess.CREATE_NO_WINDOW | subprocess.CREATE_NEW_PROCESS_GROUP
    pr = subprocess.Popen(cmd, cwd=ROOT, stdout=out, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, **flags)
    json.dump({"pid": pr.pid, "t": time.time(), "jobs": jobs}, open(LOCK, "w", encoding="utf-8"))
    log(f"claude: başlatıldı (pid {pr.pid}) işler: {', '.join(jobs)}")
    push("claude başlatıldı", ["teslim/bot.log", "teslim/claude.log"])


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
