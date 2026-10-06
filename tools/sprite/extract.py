# Ekstrak frame karakter dari lembar aset (idle / jalan / interaksi) menjadi sprite pixel bersih.
# Pakai: python3 extract.py [--list]      (butuh ImageMagick: convert)
# Hasil: tools/sprite/frames/<nama>.png (RGBA, grid piksel sprite) + frames/index.json
#
# Langkah: latar dibuat transparan -> deteksi karakter (komponen terhubung) -> buang label ->
# skala disamakan antar lembar (tinggi karakter berdiri) -> perkecil (box filter) -> palet bersama.
import json, os, subprocess, sys
from collections import deque

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'source')         # lembar aset karakter (sumber, tidak ikut ke website)
OUTD = os.path.join(HERE, 'frames')
TMP = os.path.join(HERE, '.tmp')

SHEETS = {
    'idle': os.path.join(SRC, 'idle-pixel-art-character.png'),
    'walk': os.path.join(SRC, 'new-walk-frame.png'),
    'act':  os.path.join(SRC, 'interaksi.png'),
    'fall': os.path.join(SRC, 'new-up-and-fall.png'),
    'lap':  os.path.join(SRC, 'action-pick-and-use-laptop.png'),
    'cof':  os.path.join(SRC, 'pick-up-coffe.png'),
    'slp':  os.path.join(SRC, 'new-sleep.png'),
    'jump': os.path.join(SRC, 'jump.png'),
    'point': os.path.join(SRC, 'point.png'),
    'turn': os.path.join(SRC, 'turn.png'),
    'slip': os.path.join(SRC, 'drop.png'),
    'emo': os.path.join(SRC, 'emotions.png'),
    'jet': os.path.join(SRC, 'jetpack.png'),
    'jetoff': os.path.join(SRC, 'jetpack-off.png'),
    'jetk': os.path.join(SRC, 'jet-tickle.png'),
    'jetl': os.path.join(SRC, 'jet-lift.png'),
    'jetr': os.path.join(SRC, 'jet-recover.png'),
}
# lembar berlatar hitam dengan cahaya lembut (gradasi): latar dihapus dengan soft_bg, bukan flood fill warna
SOFT_BG = {'jet', 'jetoff'}

def run(*a):
    subprocess.run([str(x) for x in a], check=True)

def soft_bg(src, dst, step=10):
    """Hapus latar bergradasi (hitam + cahaya oranye/putih di sekitar karakter): telusuri dari tepi gambar
       selama selisih warna dengan tetangga kecil (<= step, jumlah |dR|+|dG|+|dB|). Gradasi cahaya lolos,
       outline karakter yang tajam menghentikan penelusuran, jadi rambut/celana gelap tidak ikut terhapus."""
    run('convert', src, '-alpha', 'set', dst)
    w, h, d = load_rgba(dst)
    d = bytearray(d)
    seen = bytearray(w * h)
    q = deque(s for s in range(w * h) if s % w in (0, w - 1) or s // w in (0, h - 1))
    for s in q:
        seen[s] = 1
    while q:
        s = q.popleft(); x, y = s % w, s // w; i = s * 4
        r, g, b = d[i], d[i + 1], d[i + 2]
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h:
                k = ny * w + nx
                if not seen[k]:
                    j = k * 4
                    if abs(d[j] - r) + abs(d[j + 1] - g) + abs(d[j + 2] - b) <= step:
                        seen[k] = 1; q.append(k)
    for s in range(w * h):
        if seen[s]:
            d[s * 4 + 3] = 0
    save_rgba(dst, w, h, d)

def to_rgba(src, dst):
    """Salin ke PNG RGBA. Lembar tanpa transparansi (latar hitam) dibersihkan dengan flood fill
       dari keempat sudut, sehingga pupil/outline gelap di dalam karakter tidak ikut terhapus."""
    opaque = subprocess.run(['identify', '-format', '%[opaque]', src], capture_output=True, text=True).stdout.strip()
    if opaque != 'true':
        run('convert', src, '-alpha', 'set', dst)
        return
    w, h = subprocess.run(['identify', '-format', '%w %h', src], capture_output=True, text=True).stdout.split()
    w, h = int(w) - 1, int(h) - 1
    run('convert', src, '-alpha', 'set', '-fuzz', '2.5%', '-fill', 'none',
        '-draw', 'color 0,0 floodfill', '-draw', 'color %d,0 floodfill' % w,
        '-draw', 'color 0,%d floodfill' % h, '-draw', 'color %d,%d floodfill' % (w, h), dst)

def load_rgba(path):
    pam = path + '.pam'
    run('convert', path, '-alpha', 'on', pam)
    d = open(pam, 'rb').read()
    os.remove(pam)
    hdr, data = d.split(b'ENDHDR\n', 1)
    H = {l.split()[0]: l.split()[1:] for l in hdr.decode().splitlines()[1:]}
    return int(H['WIDTH'][0]), int(H['HEIGHT'][0]), data

def components(w, h, data, step=2):
    """Komponen terhubung pada alpha (dicuplik tiap `step` piksel). Kembalikan bbox + jumlah."""
    gw, gh = w // step, h // step
    fg = bytearray(gw * gh)
    for gy in range(gh):
        row = gy * step * w
        for gx in range(gw):
            fg[gy * gw + gx] = data[(row + gx * step) * 4 + 3] >= 128
    seen = bytearray(gw * gh)
    boxes = []
    for s in range(gw * gh):
        if not fg[s] or seen[s]:
            continue
        q = deque([s]); seen[s] = 1
        x0 = x1 = s % gw; y0 = y1 = s // gw; n = 0
        while q:
            c = q.popleft(); n += 1
            cx, cy = c % gw, c // gw
            if cx < x0: x0 = cx
            if cx > x1: x1 = cx
            if cy < y0: y0 = cy
            if cy > y1: y1 = cy
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < gw and 0 <= ny < gh:
                        k = ny * gw + nx
                        if fg[k] and not seen[k]:
                            seen[k] = 1; q.append(k)
        boxes.append([x0 * step, y0 * step, (x1 + 1) * step, (y1 + 1) * step, n])
    return boxes

def merge(boxes, gap=8):
    """Gabungkan bbox yang berdekatan (helai rambut / aksesori yang terpisah)."""
    changed = True
    while changed:
        changed = False
        out = []
        for b in boxes:
            for o in out:
                if b[0] <= o[2] + gap and o[0] <= b[2] + gap and b[1] <= o[3] + gap and o[1] <= b[3] + gap:
                    o[0], o[1] = min(o[0], b[0]), min(o[1], b[1])
                    o[2], o[3] = max(o[2], b[2]), max(o[3], b[3])
                    o[4] += b[4]
                    changed = True
                    break
            else:
                out.append(list(b))
        boxes = out
    return boxes

def sheet_rgba(name, dst):
    (soft_bg if name in SOFT_BG else to_rgba)(SHEETS[name], dst)

def detect(name):
    rgba = os.path.join(TMP, name + '.png')
    sheet_rgba(name, rgba)
    w, h, data = load_rgba(rgba)
    boxes = merge([b for b in components(w, h, data) if b[4] > 15])
    boxes.sort(key=lambda b: (round(b[1] / 200), b[0]))
    return rgba, w, h, boxes

# ----------------------------------------------------------------------
# daftar frame: (nama, lembar, bbox di lembar, tinggi berdiri asli atau None, jangkar)
#   tinggi berdiri = puncak rambut -> sol sepatu (piksel lembar); None = pakai skala lembar
#   jangkar 'head' = kepala disejajarkan di tengah frame, 'box' = kotak di tengah
# ----------------------------------------------------------------------
TARGET_H = 76                   # tinggi berdiri di sprite
FW, FH = 80, 82                 # ukuran frame
FLOOR = FH - 1                  # baris lantai (sol sepatu)
ACT_REF = 328                   # tinggi berdiri pose interaksi

FRAMES = []
for i, b in enumerate([(566, 164, 734, 512), (808, 164, 978, 512), (1052, 164, 1222, 512), (1292, 164, 1460, 512)]):
    FRAMES.append(('idle_%d' % (i + 1), 'idle', b, 342, 'head'))
for i, b in enumerate([(568, 590, 728, 926), (808, 590, 968, 926), (1052, 592, 1212, 928), (1298, 596, 1456, 926)]):
    FRAMES.append(('idle_%d' % (i + 5), 'idle', b, b[3] - b[1] - 6, 'head'))
# jalan: new-walk-frame.png, 8 frame (2 baris x 4); gambar master besar di kiri tidak dipakai.
# Skala dari lebar kepala walk_1 (= idle) untuk semua frame, warna dikunci ke palet idle.
for i, b in enumerate([(466, 136, 604, 420), (664, 136, 804, 422), (866, 136, 1006, 420), (1062, 136, 1200, 422),
                       (468, 486, 600, 758), (666, 486, 796, 762), (868, 488, 998, 760), (1068, 492, 1198, 762)]):
    # baris 2 digambar ~4.5% lebih kecil dari baris 1 di aset -> disamakan
    FRAMES.append(('walk_%d' % (i + 1), 'walk', b, 280 if i < 4 else 280 / 1.045, 'head'))
for name, b, anchor in (('act_read', (462, 84, 646, 456), 'head'),
                        ('act_wave', (112, 552, 322, 892), 'head'), ('act_think', (448, 560, 670, 892), 'head'),
                        ('act_surprised', (802, 560, 998, 892), 'head')):
    FRAMES.append((name, 'act', b, ACT_REF, anchor))
FRAMES.append(('master', 'idle', (100, 158, 414, 826), None, 'head'))
# diangkat & jatuh: new-up-and-fall.png (3 baris, tanpa label):
#   baris 1: 1-8 diangkat meronta, 9-11 dilepas/terhuyung
#   baris 2: 1-2 jatuh terjengkang, 3-4 menghantam lantai, 5-8 tergeletak tengkurap
#   baris 3: 1-6 bangun (merangkak, berlutut); 7-10 berdiri tidak dipakai (proporsinya lebih gemuk
#            dari idle) - berdiri memakai frame idle. stand_4 hanya acuan skala.
# Skala: satu untuk seluruh lembar, dari TINGGI berdiri frame terakhir (stand_4) = tinggi idle,
# sehingga badan di semua frame sama besar dengan idle. stand_4 diproses pertama.
FALL_STAND_H = 188              # puncak rambut -> sol sepatu stand_4 di lembar aset
FALL_FRAMES = [('stand_4', (2024, 504, 2118, 698), 'head')]
for i, b in enumerate([(20, 16, 188, 264), (214, 14, 406, 262), (406, 14, 615, 262), (598, 14, 801, 262),
                       (801, 14, 964, 262), (1006, 26, 1184, 260), (1204, 28, 1354, 264), (1394, 34, 1554, 266)]):
    FALL_FRAMES.append(('lift_%d' % (i + 1), b, 'head'))
for i, b in enumerate([(1598, 46, 1726, 276), (1784, 66, 1930, 276), (2030, 68, 2146, 284)]):
    FALL_FRAMES.append(('drop_%d' % (i + 1), b, 'head'))
for name, b in (('fall_1', (60, 282, 248, 466)), ('fall_2', (322, 318, 532, 476)),
                ('land_1', (602, 348, 790, 466)), ('land_2', (880, 360, 1076, 466)),
                ('lie_1', (1126, 364, 1372, 470)), ('lie_2', (1448, 366, 1670, 466)),
                ('lie_3', (1716, 376, 1906, 470)), ('lie_4', (1954, 374, 2156, 470))):
    FALL_FRAMES.append((name, b, 'box'))
for i, b in enumerate([(40, 544, 264, 680), (322, 560, 500, 680), (554, 546, 716, 688),
                       (768, 534, 918, 686), (952, 524, 1100, 688), (1178, 522, 1312, 688)]):
    FALL_FRAMES.append(('getup_%d' % (i + 1), b, 'box'))
# Pose di lembar ini digambar dengan ukuran berbeda (kepala diangkat ~1.25x kepala berdiri, dst).
# Koreksi per kelompok pose agar kepala & badan sama besar dengan idle (hasil perbandingan visual).
FALL_GROUP_SCALE = {'lift': 0.70, 'drop': 0.75, 'fall': 0.75, 'land': 0.78, 'lie': 0.78,
                    'getup_1': 0.82, 'getup_2': 0.82, 'getup_3': 0.82,
                    'getup_4': 0.90, 'getup_5': 0.90, 'getup_6': 0.90, 'stand': 1.0}

def fall_scale(name):
    return FALL_GROUP_SCALE.get(name, FALL_GROUP_SCALE.get(name.split('_')[0], 1.0))

for name, b, anchor in FALL_FRAMES:
    FRAMES.append((name, 'fall', b, FALL_STAND_H, anchor))

# laptop: action-pick-and-use-laptop.png (2 baris, tanpa label)
#   baris 1: 1 berdiri, 2 membungkuk mengambil laptop, 3 berdiri memegang laptop, 4-7 duduk bersila mengetik
#   baris 2: 1 menutup laptop, 2 memegang laptop tertutup, 3 jongkok menaruh, 4 bangkit, 5 berdiri
# Ukuran tiap frame di aset ini tidak seragam (baris 2 lebih kecil, frame duduk berbeda-beda), jadi
# setiap frame diskalakan sampai LEBAR KEPALA = idle (seperti pose interaksi), dibatasi tinggi frame.
LAP_STAND_H = 384               # skala awal: puncak rambut -> sol sepatu frame 1
for i, b in enumerate([(50, 58, 212, 450), (286, 168, 514, 460), (546, 52, 714, 452), (774, 190, 964, 474),
                       (1036, 182, 1226, 476), (1288, 194, 1490, 478), (1544, 172, 1740, 478),
                       (66, 560, 264, 834), (372, 556, 550, 834), (692, 562, 928, 838),
                       (1090, 510, 1348, 840), (1426, 508, 1688, 842)]):
    if i + 1 in (1, 3, 11, 12):                 # frame berdiri: tidak dipakai (lebih jangkung dari idle)
        continue
    FRAMES.append(('lap_%d' % (i + 1), 'lap', b, LAP_STAND_H, 'head'))

# kopi: pick-up-coffe.png (3 baris, tanpa label), 19 frame berurutan:
#   1 berdiri, 2 membungkuk ambil gelas, 3 memegang, 4-5 menyeruput, 6 memegang,
#   7-13 mengobrol sambil memegang gelas, 14-15 menyeruput lagi, 16 memegang,
#   17-18 membungkuk menaruh gelas, 19 berdiri.
# Frame berdiri kosong (1, 19) tidak dipakai - diganti frame idle. Ukuran tiap baris di aset berbeda,
# jadi tiap frame diskalakan sampai lebar kepala = idle (seperti laptop).
COF_BOXES = [(46, 40, 218, 366), (344, 98, 548, 366), (602, 42, 766, 366), (824, 44, 1006, 366),
             (1066, 44, 1244, 366), (1300, 42, 1466, 366),
             (46, 400, 206, 708), (270, 402, 428, 710), (494, 404, 652, 710), (700, 404, 856, 708),
             (914, 404, 1074, 710), (1128, 402, 1282, 710), (1336, 402, 1492, 710),
             (64, 732, 228, 1016), (312, 734, 476, 1016), (576, 736, 728, 1016),
             (830, 776, 1014, 1018), (1026, 784, 1214, 1018), (1286, 730, 1440, 1018)]
COF_EXTRA = 1.06
for i, b in enumerate(COF_BOXES):
    if i + 1 in (1, 19):
        continue
    FRAMES.append(('cof_%d' % (i + 1), 'cof', b, 320, 'head'))

# tidur: new-sleep.png (4 baris, tanpa label, tiap baris berbeda skala)
#   r1: 1 membawa bantal, 2-6 membungkuk menaruh bantal, 7 berlutut, 8 rebahan, 9-14 tidur
#   r2: 1-11 tidur (napas; ikon zZ aset terbuang otomatis karena terpisah)
#   r3: 1-5 terduduk kaget, 6 meraih bantal, 9 melempar bantal (7-8 saling menempel -> tidak dipakai)
#   r4: 1-11 berdiri, menggaruk kepala malu-malu, mengedip + jempol
# Skala per baris dari tinggi frame berdiri di baris itu (= tinggi idle); lebar kepala tidak bisa diukur
# andal di aset ini (karakter kecil, rambut bertekstur). Baris 2 (berbaring) sama skalanya dengan baris 1.
SLP_STAND_H = {'r1': 188 / 1.08, 'r2': 188 / 1.08, 'r3': 164 / 0.88, 'r4': 132}
# koreksi visual: r1/r2 kaki lebih panjang (kepala ~10% lebih kecil dari idle) -> x1.08,
#                 r3 kepala ~12% lebih besar dari idle -> x0.88
SLP_ROWS = {
    'r1': (14, 212, [(25, 137), (164, 307), (338, 479), (516, 635), (671, 785), (804, 927), (950, 1061),
                     (1077, 1233), (1242, 1389), (1396, 1538), (1552, 1692), (1705, 1841), (1853, 1986), (2001, 2144)]),
    'r2': (234, 378, [(27, 198), (208, 388), (408, 598), (613, 787), (810, 983), (1006, 1181), (1204, 1384),
                      (1385, 1549), (1579, 1740), (1769, 1918), (1946, 2108)]),
    'r3': (404, 566, [(23, 135), (165, 275), (307, 428), (464, 578), (627, 742), (775, 913), None, None,
                      (1239, 1351)]),
    'r4': (566, 716, [(28, 111), (170, 237), (307, 372), (443, 505), (573, 637), (709, 773), (835, 898),
                      (970, 1033), (1115, 1184), (1265, 1337), (1416, 1496)]),
}
SLP_LYING = {'r1_%d' % i for i in range(7, 15)} | {'r2_%d' % i for i in range(1, 12)}
for row, (y0, y1, cols) in SLP_ROWS.items():
    for i, c in enumerate(cols):
        if c is None:
            continue
        name = 'slp_%s_%d' % (row, i + 1)
        FRAMES.append((name, 'slp', (c[0], y0, c[1], y1), SLP_STAND_H[row], 'box' if name[4:] in SLP_LYING else 'head'))

# lompat: jump.png (1 baris, 6 frame, latar transparan, dibuat dengan GPT):
#   1 ancang-ancang jongkok, 2 menolak, 3 naik (lutut ditarik), 4 puncak, 5 turun, 6 mendarat jongkok.
# Semua frame digambar dengan skala yang sama: satu faktor dari lebar kepala jump_1 (= idle).
for i, b in enumerate([(28, 440, 282, 774), (310, 330, 532, 728), (556, 256, 766, 596),
                       (776, 228, 1004, 578), (1034, 306, 1248, 710), (1296, 436, 1500, 774)]):
    FRAMES.append(('jump_%d' % (i + 1), 'jump', b, 390, 'head'))
# menunjuk: point.png (1 baris, 3 frame, latar transparan, dibuat dengan GPT):
#   1 mengangkat tangan, 2 menunjuk sambil bicara, 3 menunjuk sambil tersenyum (2-3 dipakai bergantian)
for i, b in enumerate([(114, 198, 464, 830), (590, 202, 972, 830), (1092, 200, 1466, 830)]):
    FRAMES.append(('point_%d' % (i + 1), 'point', b, 618, 'head'))
# berbalik: turn.png (1 baris, 2 frame, latar transparan, dibuat dengan GPT): 1 posisi 3/4, 2 menghadap depan
for i, b in enumerate([(352, 148, 672, 894), (852, 148, 1180, 892)]):
    FRAMES.append(('turn_%d' % (i + 1), 'turn', b, 734, 'head'))
# jatuh kaget dari jalan: drop.png (1 baris, 5 frame, latar transparan, dibuat dengan GPT; nama frame
#   slip_* agar tidak bentrok dengan drop_* dari lembar diangkat & jatuh):
#   1 kehilangan pijakan, 2-3 melayang jatuh (bergantian), 4 mendarat jongkok, 5 berdiri lega.
#   Frame 2 & 3 berdempetan di aset -> batas dipotong manual di x=660.
for i, b in enumerate([(18, 320, 330, 758), (342, 310, 660, 712), (660, 318, 960, 712),
                       (984, 426, 1206, 768), (1284, 304, 1510, 762)]):
    FRAMES.append(('slip_%d' % (i + 1), 'slip', b, 452, 'head'))
# ekspresi: emotions.png (2 baris, latar transparan, dibuat dengan GPT; menggantikan ekspresi tempelan di atas idle):
#   baris 1: geli x4 (tertawa memegang perut), marah x2 (tangan di pinggang, mengentak kaki)
#   baris 2: menangis x4 (meraung, mengucek mata, terisak), bingung x2 (menggaruk kepala)
# Skala dari tinggi berdiri per baris (semua pose berdiri), warna: palet idle + warna air mata.
EMO_ROWS = {
    1: (340, [('tickle', (26, 136, 244, 488)), ('tickle', (270, 134, 450, 486)), ('tickle', (490, 148, 674, 488)),
              ('tickle', (724, 116, 896, 484)), ('angry', (1044, 134, 1218, 488)), ('angry', (1272, 136, 1472, 488))]),
    2: (352, [('cry', (56, 550, 230, 918)), ('cry', (282, 554, 466, 918)), ('cry', (506, 550, 678, 918)),
              ('cry', (738, 558, 920, 918)), ('confused', (1032, 550, 1230, 922)), ('confused', (1306, 558, 1490, 922))]),
}
for row, (stand_h, items) in EMO_ROWS.items():
    count = {}
    for kind, b in items:
        count[kind] = count.get(kind, 0) + 1
        FRAMES.append(('emo_%s_%d' % (kind, count[kind]), 'emo', b, stand_h, 'head'))

# jetpack: jetpack.png (1 baris, 8 frame, latar hitam bercahaya, dibuat dengan GPT):
#   1 mengencangkan tali, 2 menyalakan mesin (jongkok), 3 lepas landas, 4-5 melayang (api panjang/pendek),
#   6 terbang turun (bersandar, kaki ke depan), 7-8 terbang naik (tangan ke atas, api panjang/pendek).
#   Frame 6 & 7 berdempetan di aset -> batas dipotong manual di x=1192.
for i, b in enumerate([(22, 412, 156, 704), (208, 430, 360, 704), (400, 380, 560, 678), (578, 354, 756, 646),
                       (788, 364, 950, 654), (986, 332, 1192, 702), (1192, 332, 1352, 702), (1384, 332, 1536, 660)]):
    FRAMES.append(('jet_%d' % (i + 1), 'jet', b, 292, 'head'))
# lepas jetpack: jetpack-off.png (1 baris, 6 frame, latar hitam bercahaya, dibuat dengan GPT):
#   1 mendarat (api padam), 2 mengusap dahi, 3 membuka tali, 4 jetpack dijinjing, 5 dipeluk/disimpan, 6 berdiri tanpa jetpack
for i, b in enumerate([(36, 386, 216, 720), (318, 348, 502, 716), (564, 344, 724, 714), (784, 350, 988, 718),
                       (1078, 348, 1254, 718), (1338, 348, 1494, 718)]):
    FRAMES.append(('jetoff_%d' % (i + 1), 'jetoff', b, 366, 'head'))
# jetpack saat diganggu (latar transparan, 1 baris 8 frame, dibuat dengan GPT):
#   jet-tickle.png  dicolek sambil melayang: kaget, cekikikan, tertawa (condong belakang/depan, goyang), usap air mata, melayang lagi
#   jet-lift.png    diseret (dipegang di gagang atas jetpack): kaget, bergoyang kiri-tengah-kanan, cemberut (loop)
#   jet-recover.png dilepas: kaget, jatuh (api padam), menyala lagi, oleng ke dua sisi, stabil, lega, melayang
JET_EXTRA = {
    'jetk': [(42, 148, 218, 548), (306, 152, 516, 548), (580, 156, 752, 544), (838, 146, 1036, 538),
             (1106, 172, 1324, 544), (1366, 172, 1638, 546), (1684, 150, 1884, 546), (1940, 150, 2114, 548)],
    'jetl': [(32, 154, 236, 556), (294, 154, 524, 560), (552, 154, 794, 554), (854, 154, 1074, 552),
             (1126, 154, 1334, 556), (1366, 154, 1592, 550), (1636, 154, 1878, 556), (1924, 154, 2126, 558)],
    'jetr': [(32, 148, 244, 520), (292, 208, 532, 550), (558, 152, 802, 514), (852, 154, 1080, 528),
             (1116, 182, 1346, 536), (1392, 190, 1626, 546), (1674, 184, 1868, 546), (1956, 154, 2116, 536)],
}
for sheet, boxes in JET_EXTRA.items():
    for i, (x0, y0, x1, y1) in enumerate(boxes):
        FRAMES.append(('%s_%d' % (sheet, i + 1), sheet, (x0 - 4, y0 - 4, x1 + 4, y1 + 4), 360, 'head'))
# frame terbang yang lebih tinggi dari frame (api di bawah kaki): rambut tetap di dalam frame, ujung api dipotong
TOP_FIT = {'jet'}
# posisi vertikal mengikuti lembar aset (bukan sol/ujung api tiap frame), supaya badan tidak meloncat saat
# panjang api berubah: 'bottom' = baris terbawah lembar di lantai frame, 'top' = gagang jetpack (baris teratas)
# selalu di baris 1 (titik pegang saat diseret tetap)
KEEP_Y = {'jetk': 'bottom', 'jetr': 'bottom', 'jetl': 'top'}

# lembar buatan GPT: satu faktor skala per lembar dari lebar kepala frame pertama (= idle) x koreksi
#   jump x0.96: badan di aset sedikit lebih jangkung dari idle; pose meregang (2, 5) muat di frame
#   point x0.9, turn x0.84, slip x0.875, jet x0.925, jetoff x0.885: tinggi berdiri disamakan dengan idle (77 px)
GPT_SHEET_FIX = {'jump': 0.96, 'point': 0.9, 'turn': 0.84, 'slip': 0.875, 'jet': 0.925, 'jetoff': 0.885,
                 'jetk': 0.9, 'jetl': 0.9, 'jetr': 0.9}

# pose yang kepalanya tidak bisa diukur otomatis (berbaring): koreksi skala manual,
# disamakan dengan pose lain di baris yang sama pada lembar interaksi
SCALE_FIX = {}

# area yang dihapus manual (koordinat dalam potongan): ikon zZ di pose tidur
ERASE = {}

def keep_character(w, h, data):
    """Simpan komponen terbesar (karakter) + komponen yang MENEMPEL dengannya (jarak <= 2px),
       mis. barang yang dipegang. Ikon lepas (lampu, tanda seru, zZ) dan potongan frame tetangga
       yang ikut terpotong di tepi kotak dibuang."""
    lab = [0] * (w * h)
    comps = []
    for s in range(w * h):
        if data[s * 4 + 3] < 128 or lab[s]:
            continue
        cid = len(comps) + 1
        q = deque([s]); lab[s] = cid
        x0 = x1 = s % w; y0 = y1 = s // w; n = 0
        while q:
            c = q.popleft(); n += 1
            cx, cy = c % w, c // w
            x0, x1, y0, y1 = min(x0, cx), max(x1, cx), min(y0, cy), max(y1, cy)
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1), (1, 1), (-1, -1), (1, -1), (-1, 1)):
                nx, ny = cx + dx, cy + dy
                if 0 <= nx < w and 0 <= ny < h:
                    k = ny * w + nx
                    if not lab[k] and data[k * 4 + 3] >= 128:
                        lab[k] = cid; q.append(k)
        comps.append((n, x0, y0, x1, y1))
    main = max(range(len(comps)), key=lambda i: comps[i][0])
    keep = {main + 1}
    R = 2
    for s in range(w * h):
        if lab[s] != main + 1:
            continue
        x, y = s % w, s // w
        for dy in range(-R, R + 1):
            for dx in range(-R, R + 1):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h:
                    k = lab[ny * w + nx]
                    if k and k not in keep and comps[k - 1][0] >= 3:
                        keep.add(k)
    out = bytearray(data)
    for s in range(w * h):
        if lab[s] not in keep:
            out[s * 4 + 3] = 0
    return out

def save_rgba(path, w, h, data):
    pam = path + '.pam'
    open(pam, 'wb').write(b'P7\nWIDTH %d\nHEIGHT %d\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n' % (w, h) + bytes(data))
    run('convert', pam, path)
    os.remove(pam)

def crop(sheet_png, box, dst):
    x0, y0, x1, y1 = box
    run('convert', sheet_png, '-crop', '%dx%d+%d+%d' % (x1 - x0, y1 - y0, x0, y0), '+repage', dst)

def opaque_bbox(w, h, d):
    xs = [s % w for s in range(w * h) if d[s * 4 + 3] >= 128]
    ys = [s // w for s in range(w * h) if d[s * 4 + 3] >= 128]
    return min(xs), min(ys), max(xs), max(ys)

def head_center(w, h, d):
    x0, y0, x1, y1 = opaque_bbox(w, h, d)
    band = range(y0, y0 + max(3, int((y1 - y0) * 0.3)))
    xs = [x for y in band for x in range(w) if d[(y * w + x) * 4 + 3] >= 128]
    return sum(xs) / len(xs)

OUTLINE = (24, 17, 15)          # warna outline asli karakter

def clean_outline(w, h, d, light=False):
    """Kikis piksel tepi sisa latar (gelap untuk latar hitam, terang untuk latar putih),
       lalu beri outline 1px yang rapi."""
    d = bytearray(d)
    op = lambda x, y: 0 <= x < w and 0 <= y < h and d[(y * w + x) * 4 + 3] >= 128
    for _ in range(1):                          # satu lapis: tepi gelap diganti outline tipis (ukuran tetap)
        kill = []
        for y in range(h):
            for x in range(w):
                i = (y * w + x) * 4
                fringe = min(d[i:i + 3]) > 175 if light else max(d[i:i + 3]) < 70
                if d[i + 3] < 128 or not fringe:
                    continue
                if any(not op(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                    kill.append(i + 3)
        for k in kill:
            d[k] = 0
    add = []
    for y in range(h):
        for x in range(w):
            if op(x, y):
                continue
            if any(op(x + a, y + b) for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                add.append((y * w + x) * 4)
    for i in add:
        d[i:i + 3] = bytes(OUTLINE); d[i + 3] = 255
    return d

def opaque_h(path):
    w, h, d = load_rgba(path)
    ys = [y for y in range(h) if any(d[(y * w + x) * 4 + 3] >= 128 for x in range(w))]
    return ys[-1] - ys[0] + 1

def head_width(path):
    """Lebar kepala (piksel): median rentang kontinu yang memuat pusat kepala, diukur setinggi
       telinga/mata (baris 14..29 dari puncak rambut). Tangan di samping kepala tidak ikut terhitung
       karena terpisah celah dari kepala."""
    w, h, d = load_rgba(path)
    op = lambda x, y: d[(y * w + x) * 4 + 3] >= 128
    ys = [y for y in range(h) if any(op(x, y) for x in range(w))]
    top = ys[0]
    band = [x for y in range(top, top + 10) for x in range(w) if op(x, y)]
    cx = int(round(sum(band) / len(band)))            # pusat kepala dari pita rambut atas
    ws = []
    for y in range(top + 14, min(h, top + 30)):
        if not op(cx, y):
            continue
        l = r = cx
        while l > 0 and op(l - 1, y):
            l -= 1
        while r < w - 1 and op(r + 1, y):
            r += 1
        ws.append(r - l + 1)
    ws.sort()
    return ws[len(ws) // 2]

def extra_palette(small, prefix, pal_idle, pal_out):
    """Palet idle + 8 warna dari frame berawalan prefix yang tidak punya padanan dekat di palet idle."""
    _, _, pdat = load_rgba(pal_idle)
    idle_cols = [tuple(pdat[k:k + 3]) for k in range(0, len(pdat), 4)]
    extra = bytearray()
    for n in small:
        if n.startswith(prefix):
            w_, h_, d_ = load_rgba(small[n][0])
            for k in range(w_ * h_):
                c_ = tuple(d_[k * 4:k * 4 + 3])
                if d_[k * 4 + 3] >= 128 and min(sum((a - b) ** 2 for a, b in zip(c_, ic)) for ic in idle_cols) > 1600:
                    extra += bytes(c_ + (255,))
    n_px = max(1, len(extra) // 4)
    extra_png = pal_out + '.extra.png'
    open(extra_png + '.pam', 'wb').write(b'P7\nWIDTH %d\nHEIGHT 1\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n' % n_px + bytes(extra or b'\0\0\0\xff'))
    run('convert', extra_png + '.pam', '-alpha', 'off', '+dither', '-colors', '8', '-unique-colors', extra_png)
    os.remove(extra_png + '.pam')
    run('convert', pal_idle, extra_png, '+append', pal_out)
    print('  warna tambahan %s dari %d piksel' % (prefix, len(extra) // 4))

def build(names=None):
    os.makedirs(TMP, exist_ok=True)
    os.makedirs(OUTD, exist_ok=True)
    for n in SHEETS:
        p = os.path.join(TMP, n + '.png')
        if not os.path.exists(p):
            sheet_rgba(n, p)
    # 1) potong + bersihkan + perkecil tiap frame
    small = {}
    walk_fix = None
    gpt_fix = {}
    scales = {}
    for name, sheet, box, stand_h, anchor in FRAMES:
        if names and name not in names:
            continue
        c = os.path.join(TMP, name + '_c.png')
        crop(os.path.join(TMP, sheet + '.png'), box, c)
        w, h, d = load_rgba(c)
        d = keep_character(w, h, d)
        for (ex0, ey0, ex1, ey1) in ERASE.get(name, []):
            for y in range(ey0, min(ey1, h)):
                for x in range(ex0, min(ex1, w)):
                    d[(y * w + x) * 4 + 3] = 0
        save_rgba(c, w, h, d)
        if stand_h is None:                       # master: pakai tinggi kotak
            stand_h = (box[3] - box[1]) - 10
        scale = TARGET_H / stand_h * 100
        sm = os.path.join(TMP, name + '_s.png')
        resize = lambda sc: run('convert', c, '-filter', 'box', '-resize', '%.4f%%' % sc,
                                '-channel', 'A', '-threshold', '50%', '+channel', sm)
        resize(scale)
        if name == 'idle_1':
            ref_head = head_width(sm)
        elif name in SCALE_FIX:
            scale *= SCALE_FIX[name]
            resize(scale)
        elif sheet == 'walk':
            # frame jalan digambar dengan skala yang sama di aset: satu faktor untuk semua (dari frame pertama)
            if walk_fix is None:
                walk_fix = ref_head / head_width(sm)
            scale *= walk_fix
            resize(scale)
            print('  %-14s kepala -> %d (skala x%.3f)' % (name, head_width(sm), walk_fix))
        elif sheet in GPT_SHEET_FIX:
            if sheet not in gpt_fix:
                gpt_fix[sheet] = ref_head / head_width(sm) * GPT_SHEET_FIX[sheet]
            scale *= gpt_fix[sheet]
            resize(scale)
            print('  %-14s kepala -> %d, tinggi %d (skala x%.3f)' % (name, head_width(sm), opaque_h(sm), gpt_fix[sheet]))
        elif sheet == 'fall':
            scale *= fall_scale(name)                  # tinggi berdiri (FALL_STAND_H) x koreksi kelompok
            resize(scale)
        elif sheet in ('slp', 'emo'):
            pass                                       # skala dari tinggi berdiri per baris (SLP_STAND_H)
        elif sheet in ('lap', 'cof'):
            hw = head_width(sm)
            scale *= ref_head / hw
            if sheet == 'cof':
                # kepala karakter di aset kopi relatif besar: setelah kepala = idle badannya ~7% lebih
                # pendek dari idle, jadi diperbesar sedikit agar tinggi & kepala sama-sama mendekati idle
                scale *= COF_EXTRA
            resize(scale)
            if opaque_h(sm) > FH:                      # jangan melebihi tinggi frame (rambut terpotong)
                scale *= FH / opaque_h(sm)
                resize(scale)
            print('  %-14s kepala %d -> %d, tinggi %d' % (name, hw, head_width(sm), opaque_h(sm)))
        elif sheet == 'act':
            # lembar interaksi digambar dengan ukuran berbeda per pose: samakan lebar kepala dengan idle
            hw = head_width(sm)
            scale *= ref_head / hw
            resize(scale)
            print('  %-14s kepala %d -> %d (skala x%.3f)' % (name, hw, head_width(sm), ref_head / hw))
        small[name] = (sm, anchor)
        scales[name] = scale / 100
    # 2) palet bersama dari frame idle (warna asli karakter)
    pal = os.path.join(TMP, 'palette.png')
    pal_idle = os.path.join(TMP, 'palette_idle.png')
    pal_lap = os.path.join(TMP, 'palette_laptop.png')
    pal_cof = os.path.join(TMP, 'palette_coffee.png')
    pal_slp = os.path.join(TMP, 'palette_sleep.png')
    pal_emo = os.path.join(TMP, 'palette_emotions.png')
    pal_jet = os.path.join(TMP, 'palette_jetpack.png')
    if not names:
        refs = [small[n][0] for n in small if n.startswith('idle_') or n.startswith('act_')]
        run('convert', *refs, '+append', '-background', 'none', '-alpha', 'off',
            '+dither', '-colors', '40', '-unique-colors', pal)
        # palet idle saja: frame lembar jatuh dikunci ke warna idle agar batik bernada sama
        refs = [small[n][0] for n in small if n.startswith('idle_')]
        run('convert', *refs, '+append', '-background', 'none', '-alpha', 'off',
            '+dither', '-colors', '32', '-unique-colors', pal_idle)
        # lembar laptop: palet idle + 8 abu-abu dari laptop (piksel bersaturasi rendah & terang)
        grays = bytearray()
        for n in small:
            if n.startswith('lap_'):
                w_, h_, d_ = load_rgba(small[n][0])
                for k in range(w_ * h_):
                    r_, g_, b_, a_ = d_[k * 4:k * 4 + 4]
                    if a_ >= 128 and max(r_, g_, b_) - min(r_, g_, b_) < 22 and max(r_, g_, b_) > 70:
                        grays += bytes((r_, g_, b_, 255))
        n_px = len(grays) // 4
        gray_png = os.path.join(TMP, 'laptop_grays.png')
        open(gray_png + '.pam', 'wb').write(b'P7\nWIDTH %d\nHEIGHT 1\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n' % n_px + bytes(grays))
        run('convert', gray_png + '.pam', '-alpha', 'off', '+dither', '-colors', '8', '-unique-colors', gray_png)
        os.remove(gray_png + '.pam')
        run('convert', pal_idle, gray_png, '+append', pal_lap)
        # lembar kopi & tidur: palet idle + 8 warna yang jauh dari semua warna idle (gelas, bantal)
        for prefix, pal_out in (('cof_', pal_cof), ('slp_', pal_slp), ('emo_', pal_emo), ('jet', pal_jet)):
            extra_palette(small, prefix, pal_idle, pal_out)

    # 3) samakan palet, taruh di frame FWxFH dengan kaki di lantai & kepala di tengah
    index = {}
    sheet_of = {f[0]: f[1] for f in FRAMES}
    box_of = {f[0]: f[2] for f in FRAMES}
    for name, (sm, anchor) in small.items():
        q = os.path.join(TMP, name + '_q.png')
        pal_for = {'fall': pal_idle, 'lap': pal_lap, 'walk': pal_idle, 'cof': pal_cof,
                   'slp': pal_slp, 'jump': pal_idle, 'point': pal_idle, 'turn': pal_idle, 'slip': pal_idle, 'emo': pal_emo,
                   'jet': pal_jet, 'jetoff': pal_jet, 'jetk': pal_jet, 'jetl': pal_jet, 'jetr': pal_jet}.get(sheet_of[name], pal)
        run('convert', sm, '-alpha', 'off', '+dither', '-remap', pal_for, q)
        w, h, d = load_rgba(q)
        _, _, a = load_rgba(sm)                   # transparansi diambil dari sebelum remap
        d = bytearray(d)
        for k in range(w * h):
            d[k * 4 + 3] = 255 if a[k * 4 + 3] >= 128 else 0
        x0, y0, x1, y1 = opaque_bbox(w, h, d)
        cx = head_center(w, h, d) if anchor == 'head' else (x0 + x1) / 2
        ox = int(round(FW / 2 - cx))
        oy = FLOOR - y1
        if sheet_of[name] in TOP_FIT and y1 - y0 + 1 > FH - 1:
            oy = 1 - y0                               # rambut di baris 1, ujung api terpotong di bawah
        if sheet_of[name] in KEEP_Y:
            sb = [f[2] for f in FRAMES if f[1] == sheet_of[name]]
            top = box_of[name][1]                     # baris lembar di y=0 potongan
            if KEEP_Y[sheet_of[name]] == 'bottom':
                tall = (max(b[3] for b in sb) - min(b[1] for b in sb)) * scales[name]
                oy = FLOOR - int(round((max(b[3] for b in sb) - top) * scales[name] - max(0, tall - (FH - 2))))
            else:
                oy = 1 - int(round((min(b[1] for b in sb) - top) * scales[name]))
        # buang bintik lepas di tepi (sisa latar hitam): piksel dengan <= 2 tetangga buram
        for _ in range(2):
            kill = []
            for y in range(h):
                for x in range(w):
                    if d[(y * w + x) * 4 + 3] < 128:
                        continue
                    nb = sum(1 for dx in (-1, 0, 1) for dy in (-1, 0, 1)
                             if (dx or dy) and 0 <= x + dx < w and 0 <= y + dy < h
                             and d[((y + dy) * w + x + dx) * 4 + 3] >= 128)
                    if nb <= 2:
                        kill.append((y * w + x) * 4 + 3)
            for k in kill:
                d[k] = 0
        if sheet_of[name] in ('act', 'fall'):
            d = clean_outline(w, h, d, light=sheet_of[name] == 'fall')
        out = bytearray(FW * FH * 4)
        for y in range(h):
            for x in range(w):
                i = (y * w + x) * 4
                if d[i + 3] < 128:
                    continue
                fx, fy = x + ox, y + oy
                if 0 <= fx < FW and 0 <= fy < FH:
                    j = (fy * FW + fx) * 4
                    out[j:j + 3] = d[i:i + 3]; out[j + 3] = 255
        save_rgba(os.path.join(OUTD, name + '.png'), FW, FH, out)
        index[name] = {'w': x1 - x0 + 1, 'h': y1 - y0 + 1, 'ox': ox, 'oy': oy}
    json.dump(index, open(os.path.join(OUTD, 'index.json'), 'w'), indent=1)
    return index

if __name__ == '__main__':
    if '--list' in sys.argv:
        os.makedirs(TMP, exist_ok=True)
        for name in SHEETS:
            rgba, w, h, boxes = detect(name)
            print(name, w, h)
            for b in boxes:
                print('   box', b[:4], 'w', b[2] - b[0], 'h', b[3] - b[1], 'n', b[4])
    else:
        idx = build()
        for k, v in idx.items():
            print(k, v)
