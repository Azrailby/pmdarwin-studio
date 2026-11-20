"""v5 prototype: Toxoplasma. 16 short scenes (~2.5 s each), question hook, loop ending.
Writes examples/103_toksoplazma_v5.json"""
import json, math, os

ACC = "#c77dff"     # parasite purple
RED = "#ff3b5c"

def parasite(x, y, s=1.0, rot=0, op=1.0):
    return (f'<g transform="translate({x},{y}) rotate({rot}) scale({s})" opacity="{op}">'
            f'<circle r="70" fill="url(#pglow)"/>'
            f'<path d="M-60,10 C-40,-40 40,-40 60,10 C40,-10 -40,-10 -60,10Z" fill="{ACC}"/>'
            f'<path d="M-46,4 C-28,-26 28,-26 46,4" stroke="#f0d9ff" stroke-width="4" fill="none" opacity="0.7"/>'
            f'<circle cx="6" cy="-12" r="9" fill="#5a1d8a"/></g>')

def rat(x, y, s=1.0, frame=0, flip=False, col="#8d8a93", eye="#111"):
    f = -1 if flip else 1
    legs = ""
    for i, lx in enumerate([-40, -10, 30, 55]):
        o = 12 if (i + frame) % 2 == 0 else -12
        legs += f'<path d="M{lx},20 L{lx+o},52" stroke="#5e5b63" stroke-width="9" stroke-linecap="round"/>'
    tail = f'<path d="M-80,10 C-140,{0+frame*10} -170,{40-frame*12} -230,20" stroke="#c9a0a8" stroke-width="7" fill="none" stroke-linecap="round"/>'
    body = (f'<ellipse cx="-10" cy="0" rx="85" ry="45" fill="{col}"/>'
            f'<ellipse cx="-25" cy="-18" rx="45" ry="16" fill="#b3b0b9" opacity="0.6"/>'
            f'<path d="M50,-30 Q120,-20 135,10 Q110,30 50,30Z" fill="{col}"/>'
            f'<circle cx="132" cy="10" r="8" fill="#e58a9a"/>'
            f'<circle cx="62" cy="-36" r="22" fill="#a9a6af"/><circle cx="62" cy="-36" r="12" fill="#e7a6b1"/>'
            f'<circle cx="95" cy="-8" r="7" fill="{eye}"/><circle cx="97" cy="-10" r="2.5" fill="#fff"/>'
            f'<path d="M125,6 L165,-4 M125,10 L168,12 M125,14 L160,26" stroke="#ddd" stroke-width="2"/>')
    return f'<g transform="translate({x},{y}) scale({s*f},{s})">{tail}{legs}{body}</g>'

def cat_face(x, y, s=1.0, mouth=False, glow=True):
    eyes = ""
    for ex in (-90, 90):
        eyes += (f'<ellipse cx="{ex}" cy="-10" rx="48" ry="40" fill="#ffd23f"/>'
                 f'<ellipse cx="{ex}" cy="-10" rx="10" ry="36" fill="#120a00"/>'
                 + (f'<circle cx="{ex}" cy="-10" r="110" fill="url(#yglow)"/>' if glow else ""))
    m = ('<path d="M-70,110 Q0,200 70,110 Q0,140 -70,110Z" fill="#3a0d14"/>'
         '<path d="M-50,118 L-40,150 L-30,122 M30,122 L40,150 L50,118" fill="#f4eee6"/>') if mouth else \
        '<path d="M-30,100 Q0,125 0,95 Q0,125 30,100" stroke="#05070a" stroke-width="7" fill="none"/>'
    head = ('<path d="M-260,40 C-270,-120 -230,-230 -200,-330 L-90,-200 C-30,-215 30,-215 90,-200 L200,-330 '
            'C230,-230 270,-120 260,40 C240,200 120,260 0,260 C-120,260 -240,200 -260,40Z" fill="#141019"/>'
            '<path d="M-200,-300 L-120,-210 L-180,-170Z M200,-300 L120,-210 L180,-170Z" fill="#2a1f30"/>'
            '<path d="M-14,60 L14,60 L0,80Z" fill="#e58a9a"/>')
    whisk = ''.join(f'<path d="M{d*40},75 L{d*250},{40+i*30}" stroke="#4a4152" stroke-width="3"/>' for d in (-1, 1) for i in range(3))
    return f'<g transform="translate({x},{y}) scale({s})">{head}{whisk}{eyes}{m}</g>'

def head(x, y, s=1.0, col="#1d2430", brain=True, bglow=0.0):
    h = ('<path d="M-150,320 C-160,220 -200,160 -200,40 C-200,-140 -80,-240 40,-240 C170,-240 240,-150 240,-20 '
         'C240,30 270,60 300,110 C310,125 290,135 270,138 C275,165 265,185 255,195 C265,215 255,240 225,245 '
         'C215,290 180,300 120,300 L110,380 Z" fill="' + col + '"/>')
    b = ""
    if brain:
        b = (f'<g transform="translate(20,-60)">'
             + (f'<circle r="200" fill="url(#pglow)" opacity="{bglow}"/>' if bglow else "")
             + '<path d="M-150,10 C-170,-90 -80,-150 10,-140 C110,-140 170,-80 160,10 C150,80 80,100 0,95 C-80,100 -140,80 -150,10Z" fill="#e9a3b8"/>'
             '<path d="M-110,-40 C-70,-80 -40,-20 0,-60 C40,-100 70,-30 120,-60 M-120,30 C-80,0 -40,60 0,20 C40,-10 80,50 130,20 M0,-135 C-10,-60 20,0 0,90" '
             'stroke="#b8667f" stroke-width="8" fill="none" stroke-linecap="round"/></g>')
    return f'<g transform="translate({x},{y}) scale({s})">{h}{b}</g>'

def smell(x, y, s=1.0, flip=False):
    f = -1 if flip else 1
    w = ''.join(f'<path d="M0,{i*60} C60,{i*60-40} 120,{i*60+40} 180,{i*60} S300,{i*60-40} 360,{i*60}" stroke="#d8ff7a" stroke-width="8" fill="none" opacity="{0.8-i*0.15}" stroke-linecap="round"/>' for i in range(4))
    return f'<g transform="translate({x},{y}) scale({s*f},{s})">{w}</g>'

def ground(y=1100, col="#120f16"):
    return f'<path d="M0,{y} Q270,{y-30} 540,{y} T1080,{y} V1920 H0Z" fill="{col}"/>'

def stars(n=40):
    return ''.join(f'<circle cx="{(i*397)%1080}" cy="{(i*251)%1000}" r="{1.5+(i%3)}" fill="#cfc6ff" opacity="{0.25+(i%4)*0.12}"/>' for i in range(n))

defs = (f'<radialGradient id="pglow"><stop offset="0" stop-color="{ACC}" stop-opacity="0.6"/><stop offset="1" stop-color="{ACC}" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="yglow"><stop offset="0" stop-color="#ffd23f" stop-opacity="0.35"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></radialGradient>'
        f'<radialGradient id="rglow"><stop offset="0" stop-color="{RED}" stop-opacity="0.55"/><stop offset="1" stop-color="{RED}" stop-opacity="0"/></radialGradient>'
        '<radialGradient id="lens"><stop offset="0" stop-color="#2a1840"/><stop offset="0.85" stop-color="#140a22"/><stop offset="1" stop-color="#05020a"/></radialGradient>')

NIGHT = ["#120b1e", "#030207"]
S = []
def sc(say, layers, sky=NIGHT, kicker="", cam=None, sfx=None):
    d = {"say": say, "kicker": kicker, "art": {"sky": sky, "layers": layers}}
    if cam: d["cam"] = cam
    if sfx: d["sfx"] = sfx
    S.append(d)

# 0 hook — your head, glowing brain, parasites drifting in
sc("Beyninde şu an bir parazit yaşıyor olabilir.", [
    {"svg": stars(), "anim": "none"},
    {"svg": head(470, 1180, 1.55, bglow=0.9), "anim": "float", "amp": 6},
    {"svg": parasite(520, 950, 0.55, 20), "anim": "drift", "from": [-380, -260], "to": [0, 0], "dur": 0.9},
    {"svg": parasite(560, 1050, 0.45, -30), "anim": "drift", "from": [420, -120], "to": [0, 0], "start": 0.15, "dur": 0.8},
], cam='in')
# 1 microscope
sc("Adı Toksoplazma. Mikroskobik bir avcı.", [
    {"svg": '<circle cx="540" cy="760" r="470" fill="url(#lens)" stroke="#3b2a55" stroke-width="26"/>', "anim": "none"},
    {"svg": parasite(540, 760, 3.2, -15), "anim": "float", "amp": 14},
    {"svg": parasite(330, 560, 0.9, 40, 0.7), "anim": "drift", "from": [0, 0], "to": [60, 40]},
    {"svg": parasite(760, 980, 0.8, -60, 0.6), "anim": "drift", "from": [0, 0], "to": [-50, -30]},
], kicker="Toxoplasma gondii")
# 2 cat face — the dream
sc("Tek bir hayali var: bir kedinin bağırsağı.", [
    {"svg": cat_face(540, 760, 1.6), "anim": "pulse", "amp": 0.02},
    {"svg": parasite(540, 330, 0.6, 0), "anim": "float", "amp": 10},
], sky=["#0c0712", "#010002"], sfx="hit")
# 3 only there it multiplies
cat_side = ('<path d="M300,1060 C260,860 330,640 470,600 C520,560 560,540 600,560 L640,470 L680,560 L720,470 L740,600 '
            'C800,660 800,760 760,820 C860,900 880,1000 860,1060Z" fill="#141019"/>'
            '<path d="M300,1060 C200,1040 160,960 220,900" stroke="#141019" stroke-width="34" fill="none" stroke-linecap="round"/>'
            '<ellipse cx="660" cy="640" rx="14" ry="10" fill="#ffd23f"/><ellipse cx="700" cy="640" rx="14" ry="10" fill="#ffd23f"/>')
cluster = ''.join(parasite(560 + 80 * math.cos(a), 900 + 60 * math.sin(a), 0.42, a * 57) for a in [i * 0.9 for i in range(7)])
sc("Çünkü yalnızca orada çoğalabiliyor.", [
    {"svg": cat_side, "anim": "none"},
    {"svg": '<circle cx="560" cy="900" r="210" fill="url(#pglow)"/>', "anim": "pulse", "amp": 0.15, "speed": 1.4},
    {"svg": cluster, "anim": "grow", "axis": "xy", "pivot": [560, 900], "dur": 0.7},
], cam='pan')
# 4 first a rat
sc("Ama önce bir fareye girmesi gerekiyor.", [
    {"svg": ground(1000), "anim": "none"},
    {"frames": [rat(200, 930, 1.6, 0), rat(200, 930, 1.6, 1)], "fps": 8, "anim": "walk", "from": [-350, 0], "to": [250, 0], "amp": 4},
    {"svg": parasite(560, 300, 0.4, 10), "anim": "rain", "count": 6, "spread": 700, "fall": 600},
], sky=["#0e0b18", "#020104"])
# 5 into the brain
sc("Farenin beynine yerleşiyor.", [
    {"svg": rat(430, 820, 4.2, 0), "anim": "float", "amp": 5},
    {"svg": '<circle cx="640" cy="640" r="150" fill="url(#pglow)"/>', "anim": "pulse", "amp": 0.2, "speed": 1.6},
    {"svg": parasite(640, 640, 0.7, 25), "anim": "fadein", "start": 0.1, "dur": 0.5},
], cam='in')
# 6 deletes fear
fear = (f'<g transform="translate(540,520)"><circle r="150" fill="url(#rglow)"/>'
        f'<rect x="-22" y="-110" width="44" height="140" rx="20" fill="#fff"/><circle cy="80" r="24" fill="#fff"/></g>')
cross = f'<path d="M380,360 L700,680 M700,360 L380,680" stroke="{RED}" stroke-width="40" stroke-linecap="round"/>'
sc("Ve korkusunu siliyor.", [
    {"svg": rat(470, 1000, 2.0, 0), "anim": "none"},
    {"svg": fear, "anim": "shake", "amp": 4},
    {"svg": cross, "anim": "reveal", "start": 0.3, "dur": 0.35},
], kicker="Korku: 0", sfx="hit")
# 7 normally runs from smell
sc("Normalde kedi kokusundan kaçan fare,", [
    {"svg": ground(1000), "anim": "none"},
    {"svg": smell(700, 700, 1.0), "anim": "sway", "amp": 2},
    {"frames": [rat(700, 930, 1.4, 0, flip=True), rat(700, 930, 1.4, 1, flip=True)], "fps": 12, "anim": "walk", "from": [0, 0], "to": [-700, 0], "amp": 6, "speed": 1.8},
], sky=["#0e0b18", "#020104"])
# 8 now walks toward it
sc("artık o kokuya doğru yürüyor.", [
    {"svg": ground(1000), "anim": "none"},
    {"svg": cat_face(900, 520, 0.7), "anim": "fadein", "dur": 0.6},
    {"svg": smell(800, 760, 1.0, flip=True), "anim": "sway", "amp": 2},
    {"frames": [rat(80, 930, 1.4, 0), rat(80, 930, 1.4, 1)], "fps": 6, "anim": "walk", "from": [0, 0], "to": [420, 0], "amp": 3, "speed": 0.7},
], sky=["#0e0b18", "#020104"])
# 9 caught
sc("Kedi onu yakalıyor. Parazit eve döndü.", [
    {"svg": '<rect width="1080" height="1920" fill="#2a0610"/>', "anim": "none"},
    {"svg": cat_face(540, 740, 1.9, mouth=True), "anim": "shake", "amp": 7},
    {"svg": parasite(540, 1020, 0.8, 0), "anim": "fadein", "start": 0.5, "dur": 0.4},
], sky=["#1c040a", "#050002"], sfx="hit")
# 10 humans join the cycle
ring = (f'<circle cx="540" cy="760" r="330" stroke="{ACC}" stroke-width="10" fill="none" stroke-dasharray="40 30" opacity="0.8"/>'
        f'<path d="M870,760 l-26,-34 l52,0Z" fill="{ACC}"/><path d="M210,760 l-26,34 l52,0Z" fill="{ACC}"/>')
sc("Sorun şu: insanlar da bu döngüye karışıyor.", [
    {"svg": ring, "anim": "spin", "pivot": [540, 760], "speed": 0.8},
    {"svg": cat_face(540, 470, 0.45, glow=False), "anim": "float", "amp": 6},
    {"svg": rat(320, 940, 0.9, 0), "anim": "float", "amp": 6},
    {"svg": head(770, 950, 0.5, col="#3a4256", brain=False), "anim": "float", "amp": 6},
])
# 11 meat & litter
steak = ('<g transform="translate(300,760)"><path d="M-170,-40 C-150,-150 120,-170 170,-60 C210,40 120,140 -20,130 C-150,120 -190,60 -170,-40Z" fill="#a8243a"/>'
         '<path d="M-120,-30 C-100,-100 90,-110 120,-40 C140,30 80,90 -20,85 C-110,80 -135,40 -120,-30Z" fill="#e2677e"/>'
         '<path d="M-160,-30 C-120,-150 140,-160 170,-60" stroke="#f3e2d6" stroke-width="16" fill="none"/></g>')
litter = ('<g transform="translate(790,800)"><path d="M-180,-40 L180,-40 L150,110 L-150,110Z" fill="#3a4a5e"/>'
          '<path d="M-170,-40 Q0,-90 170,-40Z" fill="#d9c49a"/>'
          + ''.join(f'<circle cx="{-90+i*60}" cy="-55" r="9" fill="#a8946a"/>' for i in range(4)) + '</g>')
sc("Az pişmiş etle ya da kedi kumuyla.", [
    {"svg": steak, "anim": "float", "amp": 10},
    {"svg": litter, "anim": "float", "amp": 8, "speed": 1.3},
    {"svg": parasite(300, 560, 0.5, 0), "anim": "pulse", "amp": 0.15},
    {"svg": parasite(790, 600, 0.5, 30), "anim": "pulse", "amp": 0.15},
], sky=["#14101c", "#040306"], cam='pan')
# 12 one in three
def person(x, y, c):
    return f'<g transform="translate({x},{y})"><circle cy="-60" r="34" fill="{c}"/><path d="M-50,40 C-50,-20 50,-20 50,40Z" fill="{c}"/></g>'
grid = ''.join(person(200 + (i % 4) * 230, 380 + (i // 4) * 210, ACC if i % 3 == 2 else "#3a4256") for i in range(12))
sc("Dünyada yaklaşık her üç kişiden biri bunu taşıyor olabilir.", [
    {"svg": grid, "anim": "fadein", "dur": 0.4},
    {"svg": '<circle cx="540" cy="600" r="420" fill="url(#pglow)" opacity="0.5"/>', "anim": "pulse", "amp": 0.06},
], kicker="1 / 3", sfx="hit")
# 13 most feel nothing
sc("Çoğu kişi hiçbir şey hissetmiyor.", [
    {"svg": stars(), "anim": "none"},
    {"svg": head(470, 1180, 1.55, col="#262e3d", bglow=0.35), "anim": "float", "amp": 4},
], cam='out')
# 14 slower reactions
watch = ('<g transform="translate(560,700)"><circle r="260" fill="#e9e4ee"/><circle r="230" fill="#1a1622"/>'
         '<rect x="-30" y="-320" width="60" height="70" rx="10" fill="#e9e4ee"/>'
         + ''.join(f'<rect x="-6" y="-225" width="12" height="36" fill="#e9e4ee" transform="rotate({i*30})"/>' for i in range(12)) + '</g>')
hand = f'<path d="M560,700 L560,520" stroke="{RED}" stroke-width="14" stroke-linecap="round"/><circle cx="560" cy="700" r="18" fill="{RED}"/>'
sc("Ama bazı araştırmalar, tepkilerin yavaşladığını öne sürüyor.", [
    {"svg": watch, "anim": "none"},
    {"svg": hand, "anim": "spin", "pivot": [560, 700], "speed": 0.35},
    {"svg": parasite(560, 700, 0.5, 0, 0.9), "anim": "pulse", "amp": 0.1},
])
# 15 loop ending
sc("Fare de hiçbir şey hissetmemişti. Peki ya sen?", [
    {"svg": cat_face(540, 400, 0.9), "anim": "fadein", "dur": 0.7},
    {"svg": head(440, 960, 0.95, col="#262e3d", bglow=0.9), "anim": "none"},
], sky=["#0c0712", "#010002"], cam='in')

spec = {
    "title": "Kedin Beynini Kontrol Ediyor Olabilir mi? #shorts",
    "description": "Toxoplasma gondii yalnızca kedilerin bağırsağında çoğalabiliyor. Oraya ulaşmak için farenin korkusunu siliyor. Peki insanlarda ne yapıyor?\n\nHer gün tuhaf ama gerçek bir bilim olayı için abone ol.\n\n#bilim #parazit #toksoplazma #kedi #beyin #ilginçbilgiler #shorts",
    "tags": ["toksoplazma", "toxoplasma", "parazit", "kedi", "beyin", "bilim", "shorts"],
    "accent": ACC, "tint": "#120b1e", "drone": 46.0, "gap": 0.06,
    "hook": "Beyninde şu an bir parazit yaşıyor olabilir.", "hook_red": "PARAZİT",
    "defs": defs, "scenes": S,
}
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "103_toksoplazma_v5.json")
json.dump(spec, open(out, "w"), ensure_ascii=False, indent=1)
print(out, len(S), "scenes", sum(len(s["say"].split()) for s in S), "words")
