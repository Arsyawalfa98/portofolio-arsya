# Menyusun sprite sheet companion dari frame hasil extract.py.
# Pakai: python3 extract.py && python3 build_sheet.py [--preview out.png]
# Hasil: assets/img/companion/arsya-sheet.png + assets/js/companion-frames.js
#
# Frame dasar diambil apa adanya dari aset (idle, jalan, interaksi). Ekspresi yang tidak ada di aset
# (bicara, kedip) digambar di atas frame idle_1; geli, marah, menangis, bingung memakai emotions.png (GPT).
# Gambar tempel memakai koordinat wajah/lengan/kaki yang dipetakan dari frame idle_1.
import json, os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FRAMES_DIR = os.path.join(HERE, 'frames')
OUT_IMG = os.path.join(HERE, '..', '..', 'assets', 'img', 'companion')
OUT_JS = os.path.join(HERE, '..', '..', 'assets', 'js', 'companion-frames.js')

def load(name):
    """Frame -> grid [y][x] berisi (r,g,b) atau None (transparan)."""
    path = os.path.join(FRAMES_DIR, name + '.png')
    pam = path + '.pam'
    subprocess.run(['convert', path, '-alpha', 'on', pam], check=True)
    d = open(pam, 'rb').read()
    os.remove(pam)
    hdr, data = d.split(b'ENDHDR\n', 1)
    H = {l.split()[0]: l.split()[1:] for l in hdr.decode().splitlines()[1:]}
    w, h = int(H['WIDTH'][0]), int(H['HEIGHT'][0])
    return [[tuple(data[(y * w + x) * 4:(y * w + x) * 4 + 3]) if data[(y * w + x) * 4 + 3] >= 128 else None
             for x in range(w)] for y in range(h)]

FW, FH = 80, 82

def copy(g):
    return [row[:] for row in g]

# ----------------------------------------------------------------------
# warna (diambil dari frame idle)
# ----------------------------------------------------------------------
C = {
    'O': (24, 17, 15),     # outline
    'D': (20, 13, 13),     # iris gelap
    'B': (93, 45, 31),     # iris coklat / bawah mata
    'W': (241, 238, 239),  # putih
    'S': (250, 182, 140),  # kulit
    's': (237, 148, 108),  # kulit bayangan
    'R': (141, 57, 37),    # dalam mulut
    'P': (226, 110, 96),   # lidah
    'p': (250, 150, 136),  # pipi merah
    'C': (150, 212, 255),  # air mata terang
    'c': (84, 158, 232),   # air mata gelap
    'G': (170, 159, 161),  # abu (laptop)
    'g': (110, 104, 110),  # abu gelap
    'N': (40, 70, 140),    # biru buku
    'n': (28, 46, 96),     # biru buku gelap
}

def draw(g, x0, y0, patch):
    """patch: list string; ' ' = lewati, '.' = hapus (transparan), huruf = warna C."""
    for j, row in enumerate(patch):
        for i, ch in enumerate(row):
            x, y = x0 + i, y0 + j
            if ch == ' ' or not (0 <= x < FW and 0 <= y < FH):
                continue
            g[y][x] = None if ch == '.' else C[ch]

def fill(g, x0, y0, x1, y1, col):
    for y in range(y0, y1):
        for x in range(x0, x1):
            g[y][x] = col

def move(g, x0, y0, x1, y1, dx, dy, keep=None):
    """Pindahkan area (x0..x1, y0..y1) sejauh dx,dy. Area lama dikosongkan kecuali piksel keep()."""
    part = [(x, y, g[y][x]) for y in range(y0, y1) for x in range(x0, x1) if g[y][x] is not None]
    for x, y, _ in part:
        if not (keep and keep(x, y)):
            g[y][x] = None
    for x, y, c in part:
        nx, ny = x + dx, y + dy
        if 0 <= nx < FW and 0 <= ny < FH:
            g[ny][nx] = c

def shift_upper(g, dy, waist):
    """Geser badan atas (baris < waist) sejauh dy.
       dy > 0: turun (membungkuk/jongkok), menutupi bagian atas kaki.
       dy < 0: naik (menarik napas); celah di pinggang diisi baris pinggang asli."""
    out = copy(g)
    for y in range(waist):
        out[y] = [None] * FW
    for y in range(waist):
        ny = y + dy
        if 0 <= ny < FH:
            for x in range(FW):
                if g[y][x] is not None:
                    out[ny][x] = g[y][x]
    if dy < 0:
        for y in range(waist + dy, waist):
            for x in range(FW):
                if out[y][x] is None:
                    out[y][x] = g[waist - 1][x]
    return out

def shift_all(g, dx, dy):
    out = [[None] * FW for _ in range(FH)]
    for y in range(FH):
        for x in range(FW):
            if g[y][x] is not None and 0 <= x + dx < FW and 0 <= y + dy < FH:
                out[y + dy][x + dx] = g[y][x]
    return out

def mirror_patch(p):
    return [r[::-1] for r in p]

# ----------------------------------------------------------------------
# peta wajah idle_1 (koordinat frame)
# ----------------------------------------------------------------------

EYES = {
    'closed': ['       ', '       ', 'O     O', ' OOOOO ', '       '],
    'happy':  ['       ', '  OOO  ', ' O   O ', 'O     O', '       '],
    'laugh':  ['OO     ', '  OO   ', '    OO ', '  OO   ', 'OO     '],
    'wide':   [' OOOOO ', 'OWWWWWO', 'OWWDWWO', 'OWWWWWO', ' OOOOO '],
    'angry':  ['       ', 'OOO    ', 'ODDOOOO', 'WDDDBDW', ' BBBBB '],
    'cry':    ['       ', 'OO   OO', '  OOO  ', '       ', '       '],
    'squint': ['       ', '       ', 'OOOOOOO', 'WDDDBDW', ' BBBBB '],
    'sleepy': ['       ', '       ', 'OOOOOOO', 'ODDDBDO', ' BBBBB '],
}
MIRROR_EYES = {'laugh', 'angry'}
BROWS = {
    'angry':  ['OO     ', 'OOOOO  ', '  OOOOO'],
    'sad':    ['     OO', '  OOOOO', 'OOOOO  '],
    'raised': [' OOOOO ', 'OOOOOOO', '       '],
}
MOUTHS = {
    'open':  ['           ', '   OOOOO   ', '   ORRRO   ', '    OOO    '],
    'o':     ['           ', '    OOO    ', '    ORO    ', '    OOO    '],
    'grin':  ['  OOOOOOO  ', ' OWWWWWWWO ', ' ORPPPPPRO ', '  OOOOOOO  '],
    'shout': ['  OOOOOOO  ', ' ORRRRRRRO ', ' ORPPPPPRO ', '  OOOOOOO  '],
    'wail':  ['   OOOOO   ', '  ORRRRRO  ', '  ORPPPRO  ', '   OOOOO   '],
    'wail2': ['           ', '  OOOOOOO  ', '  ORPPPRO  ', '   OOOOO   '],
    'frown': ['           ', '   OOOOO   ', '  O     O  ', '           '],
    'pout':  ['           ', '    OOO    ', '   O   O   ', '           '],
    'wavy':  ['           ', '   OO   O  ', '  O  OOO   ', '           '],
    'flat':  ['           ', '   OOOOO   ', '           ', '           '],
}

# peta wajah per pose: posisi kiri-atas kotak mata (7x5), alis (7x3), mulut (11x4) + ukuran area yang dihapus
FACE_IDLE = {'eye_l': (34, 31), 'eye_r': (46, 31), 'brow_l': (34, 27), 'brow_r': (46, 27),
             'mouth': (38, 38), 'eye_clear': (7, 5), 'blush': ((33, 36), (50, 36)),
             'tears': (35, 51, 35), 'sweat': (57, 16)}
def face(g, eyes=None, brows=None, mouth=None, blush=False, tears=None, sweat=False, eye_r=None, fm=FACE_IDLE):
    """Ganti bagian wajah sesuai peta fm."""
    cw, ch = fm['eye_clear']
    (lx, ly), (rx, ry) = fm['eye_l'], fm['eye_r']
    if eyes:
        fill(g, lx, ly, lx + cw, ly + ch, C['S'])
        fill(g, rx + 1, ry, rx + 1 + cw, ry + ch, C['S'])
        pl = EYES[eyes]
        draw(g, lx, ly, pl)
        draw(g, rx, ry, mirror_patch(pl) if eyes in MIRROR_EYES else pl)
    if eye_r:                                    # hanya mata kanan layar
        fill(g, rx + 1, ry, rx + 1 + cw, ry + ch, C['S'])
        draw(g, rx, ry, EYES[eye_r])
    if brows:
        (bx, by), (cx, cy) = fm['brow_l'], fm['brow_r']
        fill(g, bx + 1, by, bx + 7, by + 3, C['S'])
        fill(g, cx + 1, cy, cx + 7, cy + 3, C['S'])
        pl = BROWS[brows]
        draw(g, bx, by, pl)
        draw(g, cx, cy, mirror_patch(pl))
    if mouth:
        mx, my = fm['mouth']
        fill(g, mx + 1, my, mx + 10, my + 4, C['S'])
        draw(g, mx, my, MOUTHS[mouth])
    if blush:
        for (x, y) in fm['blush']:
            draw(g, x, y, ['ppp'])
    if tears is not None:
        tl, tr, ty = fm['tears']
        for x0 in (tl, tr):
            for i, y in enumerate(range(ty, ty + 9)):
                if (i + tears) % 3 != 2:
                    xx = x0 + (-1 if x0 == tl and i > 4 else (1 if x0 == tr and i > 4 else 0))
                    draw(g, xx, y, ['C' if i % 2 else 'c'])
                    draw(g, xx + (1 if x0 == tl else -1), y, ['c' if i % 2 else 'C'])
    if sweat:
        draw(g, *fm['sweat'], [' C ', 'CCC', 'CcC', ' C '])

# lengan & kaki idle_1
ARM_L = (22, 48, 31, 67)      # x0, y0, x1, y1 (lengan + tangan kiri layar)
ARM_R = (49, 48, 58, 67)
LEG_L = (24, 66, 39, 82)
LEG_R = (39, 66, 56, 82)
WAIST = 62

def torso_edge(x, y):
    """Piksel yang tetap dipertahankan saat lengan dipindah (tepi badan)."""
    return 31 <= x <= 49

# ----------------------------------------------------------------------
# barang untuk transisi ambil/taruh
# ----------------------------------------------------------------------
BOOK = ['OOOOOOOOOO', 'ONNNNNNNNO', 'ONnNNNNNNO', 'ONNNNNNNNO', 'OWWWWWWWWO', 'OOOOOOOOOO']
LAPTOP = ['OOOOOOOOOOOOOO', 'OGGGGGGWGGGGGO', 'OggggggggggggO', 'OOOOOOOOOOOOOO']

def with_item(g, item, x=58):
    g = copy(g)
    draw(g, x, FH - len(item), item)
    return g

def is_skin(c):
    r, g_, b = c
    return r > 190 and 110 < g_ < 215 and 70 < b < 185 and r - b > 50

def tap(g, dx=0, dy=1, region=(24, 59, 48, 72)):
    """Tangan di depan laptop mengetuk: piksel tangan (kulit) bergeser dx,dy; kolom lengan di atasnya
       ikut turun agar tidak ada lubang. region = area pencarian tangan (x0, y0, x1, y1)."""
    out = copy(g)
    x0, y0, x1, y1 = region
    hand = [(x, y) for y in range(y0, y1) for x in range(x0, x1) if g[y][x] is not None and is_skin(g[y][x])]
    if not hand:
        return out
    cols = sorted({x for x, _ in hand})
    top = min(y for _, y in hand) - 2                # sedikit lengan di atas tangan ikut bergerak
    bot = max(y for _, y in hand)
    for x in cols:
        for y in range(top, bot + 1):
            out[y][x] = None if not (0 <= x - dx < FW) else out[y][x]
    for x in range(min(cols) - 1, max(cols) + 2):
        for y in range(top, bot + 1):
            sx, sy = x - dx, y - dy
            if x0 <= sx < x1 and top <= sy <= bot and g[sy][sx] is not None:
                out[y][x] = g[sy][sx]
            elif sy < top and g[top][sx if 0 <= sx < FW else x] is not None and dy > 0 and min(cols) <= x <= max(cols):
                out[y][x] = g[top][sx]                # lengan memanjang mengisi celah di atas tangan
    return out

def typing_loop(g, waist):
    """8 frame mengetik dari satu pose aset: ketukan kiri/kanan bergantian + anggukan kecil."""
    nod = shift_upper(g, 1, waist)
    return [g, tap(g, 0, 1), g, tap(g, -1, 1), g, tap(g, 1, 1), nod, tap(nod, 0, 1)]

NOD_WAIST = 56          # kepala & bahu (di atas laptop) yang mengangguk

def laptop_from(g):
    """Ambil piksel laptop tertutup di lantai (abu-abu + garis tepi gelap) dari frame aset."""
    pix = {}
    for y in range(FH - 10, FH):
        for x in range(38, FW):
            c = g[y][x]
            if c is None:
                continue
            gray = max(c) - min(c) < 22 and max(c) > 70
            if gray or max(c) < 60:
                pix[(x, y)] = c
    return pix

def item_from(g, x0, y0, x1, y1):
    """Salin barang di lantai dari frame aset (tanpa piksel kulit tangan yang menyentuhnya)."""
    return {(x, y): g[y][x] for y in range(y0, y1) for x in range(x0, x1)
            if g[y][x] is not None and not is_skin(g[y][x])}

def with_floor_laptop(g, laptop, dx=8):
    """Laptop di lantai di belakang kaki (karakter digambar di atasnya)."""
    out = [[None] * FW for _ in range(FH)]
    for (x, y), c in laptop.items():
        if 0 <= x + dx < FW:
            out[y][x + dx] = c
    for y in range(FH):
        for x in range(FW):
            if g[y][x] is not None:
                out[y][x] = g[y][x]
    return out

def squat(g, item=None):
    """Setengah jongkok: badan atas turun 4px, kaki tertekuk (tertutup badan)."""
    s = shift_upper(g, 4, WAIST)
    if item:
        draw(s, 58, FH - len(item), item)
    return s

# ----------------------------------------------------------------------
# susun animasi
# ----------------------------------------------------------------------
def build():
    F = {n[:-4]: load(n[:-4]) for n in os.listdir(FRAMES_DIR) if n.endswith('.png')}
    base = F['idle_1']
    anims = {}

    def add(name, g):
        anims.setdefault(name, []).append(g)

    # idle: 7 frame napas dari aset
    for i in range(1, 8):
        add('idle', F['idle_%d' % i])
    g = copy(base); face(g, eyes='closed'); add('blink', g)

    # bicara
    add('talk', base)
    g = copy(base); face(g, mouth='open'); add('talk', g)
    g = copy(base); face(g, mouth='o'); add('talk', g)

    # senang: mata tersenyum dari aset (idle_8) + mulut lebar
    g = copy(F['idle_8']); add('happy', g)
    add('happy', shift_all(F['idle_8'], 0, -1))

    # geli (emotions.png): tertawa memegang perut, bergoyang, menutup mulut, memantul
    for i in range(1, 5):
        add('tickle', F['emo_tickle_%d' % i])

    # jalan (menghadap kanan; JS mencerminkan seluruh sprite saat ke kiri): new-walk-frame.png,
    # 8 frame sesuai urutan aset (berpapasan di frame 1, 3, 6; melangkah di antaranya)
    for i in range(1, 9):
        add('walk', F['walk_%d' % i])

    # interaksi dari aset + variasi napas
    for state, src in (('wave', 'act_wave'), ('think', 'act_think'), ('surprised', 'act_surprised'),
                       ('read', 'act_read')):
        add(state, F[src])
    # melambai: telapak tangan (di luar rambut) berayun
    w0 = F['act_wave']
    for dx, dy in ((2, 1), (0, 0), (-1, 1)):
        g = copy(w0); move(g, 58, 14, 72, 34, dx, dy); add('wave', g)
    # berpikir / kopi / baca / ngoding / kaget: napas halus (badan atas turun 1px)
    for state, src, waist in (('think', 'act_think', 60),
                              ('read', 'act_read', 60), ('surprised', 'act_surprised', 60)):
        add(state, shift_upper(F[src], 1, waist))
    # tidur (new-sleep.png): rebahan -> tidur bernapas -> terbangun kaget, lempar bantal, berdiri malu-malu
    for i in range(2, 9):
        add('lie_down', F['slp_r1_%d' % i])
    for n in ['slp_r1_%d' % i for i in range(9, 15)] + ['slp_r2_%d' % i for i in range(1, 12)]:
        add('sleep', F[n])
    for n in ['slp_r3_%d' % i for i in (1, 2, 3, 4, 5, 6, 9)] + ['slp_r4_%d' % i for i in range(1, 12)]:
        add('wake_up', F[n])

    # marah (emotions.png): tangan di pinggang -> mengomel sambil mengentak kaki
    for i in (1, 2):
        add('angry', F['emo_angry_%d' % i])

    # diangkat -> dilepas & jatuh -> menghantam lantai -> tergeletak -> bangun (new-up-and-fall.png),
    # lalu menangis (di bawah)
    for i in range(1, 9):
        add('lift', F['lift_%d' % i])
    for n in ('drop_1', 'drop_2', 'drop_3', 'fall_1', 'fall_2'):
        add('fall', F[n])
    for n in ('land_1', 'land_2'):
        add('land', F[n])
    for i in range(1, 5):
        add('hurt', F['lie_%d' % i])
    # bangun: merangkak & berlutut dari aset, lalu berdiri memakai frame idle (setengah jongkok -> tegak)
    # supaya ukuran badan & warna baju sama persis dengan idle dan animasi menangis berikutnya
    for i in range(1, 7):
        add('getup', F['getup_%d' % i])
    add('getup', squat(base))
    add('getup', base)

    # menangis (emotions.png): meraung, mengucek mata, meraung, terisak menyeka air mata
    for i in range(1, 5):
        add('cry', F['emo_cry_%d' % i])

    # bingung (emotions.png): menggaruk kepala, kepala miring bergantian
    for i in (1, 2):
        add('confused', F['emo_confused_%d' % i])

    # transisi: lihat barang di lantai -> jongkok -> (pose aktivitas)
    add('squat', squat(base))
    # kopi (pick-up-coffe.png): ambil gelas -> minum -> mengobrol sambil memegang -> minum lagi -> taruh.
    # Berdiri kosong memakai frame idle; gelas di lantai disalin dari frame aset (cof_2).
    floor_cup = item_from(F['cof_2'], 47, 70, 57, FH)
    add('coffee_in', with_floor_laptop(base, floor_cup, dx=0))
    add('coffee_in', with_floor_laptop(squat(base), floor_cup, dx=0))
    for n in ('cof_2', 'cof_3'):
        add('coffee_in', F[n])
    for n in ('cof_4', 'cof_5', 'cof_5', 'cof_4', 'cof_6', 'cof_6',              # menyeruput
              'cof_7', 'cof_8', 'cof_9', 'cof_8', 'cof_10', 'cof_7',             # mengobrol
              'cof_11', 'cof_11', 'cof_12', 'cof_13', 'cof_12', 'cof_7',
              'cof_14', 'cof_15', 'cof_15', 'cof_14', 'cof_16', 'cof_16'):       # menyeruput lagi
        add('coffee', F[n])
    for n in ('cof_17', 'cof_18'):
        add('coffee_out', F[n])
    add('coffee_out', with_floor_laptop(squat(base), floor_cup, dx=0))
    add('coffee_out', with_floor_laptop(base, floor_cup, dx=0))
    add('read_in', with_item(base, BOOK)); add('read_in', squat(base, BOOK))
    # ngoding (action-pick-and-use-laptop.png): ambil laptop -> duduk mengetik -> tutup & taruh lagi.
    # Berdiri memakai frame idle (frame berdiri di aset lebih jangkung dari idle); laptop di lantai
    # disalin dari frame aset (lap_10) dan ditaruh di belakang kaki.
    floor_laptop = laptop_from(F['lap_10'])
    add('coding_in', with_floor_laptop(base, floor_laptop))
    add('coding_in', with_floor_laptop(squat(base), floor_laptop))
    add('coding_in', F['lap_2'])
    # mengetik mulus (~8 fps): tiap pose aset diputar beberapa siklus ketukan, ekspresi berganti perlahan
    for n, rep_ in (('lap_4', 3), ('lap_5', 2), ('lap_4', 2), ('lap_6', 2), ('lap_5', 2)):
        for _ in range(rep_):
            for g in typing_loop(F[n], NOD_WAIST):
                add('coding', g)
    # kesal: wajah kesal, ketukan cepat & kepala sedikit menggeleng
    mad = F['lap_7']
    for g in (mad, tap(mad, 0, 1), shift_all(mad, -1, 0), tap(shift_all(mad, -1, 0), 1, 1),
              mad, tap(mad, -1, 1), shift_all(mad, 1, 0), tap(shift_all(mad, 1, 0), 0, 1)):
        add('coding_mad', g)
    for n in ('lap_8', 'lap_9', 'lap_10'):
        add('coding_out', F[n])
    add('coding_out', with_floor_laptop(squat(base), floor_laptop))
    add('coding_out', with_floor_laptop(base, floor_laptop))
    # lompat (jump.png): 1 ancang-ancang, 2 menolak, 3 naik, 4 puncak, 5 turun, 6 mendarat.
    # JS memilih frame sesuai fase lompatan / kecepatan vertikal (lihat airPose di companion.js)
    for i in range(1, 7):
        add('jump', F['jump_%d' % i])
    # menunjuk (point.png): mengangkat tangan -> menunjuk sambil bicara / tersenyum (bergantian)
    add('point_in', F['point_1'])
    for n in ('point_2', 'point_3'):
        add('point', F[n])
    # berbalik (turn.png): 1 posisi 3/4 menghadap kanan, 2 menghadap depan (JS mencerminkan frame 1 untuk sisi kiri)
    for i in (1, 2):
        add('turn', F['turn_%d' % i])
    # jatuh kaget dari jalan (drop.png): 1 kehilangan pijakan, 2-3 melayang (bergantian), 4 mendarat jongkok, 5 lega
    for i in range(1, 6):
        add('slip', F['slip_%d' % i])
    return anims

SHEET_COLS = 40          # sheet disusun grid (lebar 40 x 80 = 3200px) - aman untuk batas ukuran gambar/browser

def main():
    anims = build()
    # frame identik disimpan sekali; animasi merujuk indeks frame unik
    order, seen, index = [], {}, {}
    for name, fs in anims.items():
        ids = []
        for g in fs:
            key = tuple(tuple(row) for row in g)
            if key not in seen:
                seen[key] = len(order)
                order.append(g)
            ids.append(seen[key])
        index[name] = ids
    cols = min(SHEET_COLS, len(order))
    rows = (len(order) + cols - 1) // cols
    W, H = FW * cols, FH * rows
    data = bytearray(W * H * 4)
    for i, g in enumerate(order):
        ox, oy = (i % cols) * FW, (i // cols) * FH
        for y in range(FH):
            for x in range(FW):
                c = g[y][x]
                if c is not None:
                    j = ((oy + y) * W + ox + x) * 4
                    data[j:j + 3] = bytes(c); data[j + 3] = 255
    os.makedirs(OUT_IMG, exist_ok=True)
    png = os.path.join(OUT_IMG, 'arsya-sheet.png')
    pam = png + '.pam'
    open(pam, 'wb').write(b'P7\nWIDTH %d\nHEIGHT %d\nDEPTH 4\nMAXVAL 255\nTUPLTYPE RGB_ALPHA\nENDHDR\n' % (W, H) + bytes(data))
    # tanpa metadata tanggal -> hasil build identik bila sumbernya sama
    subprocess.run(['convert', pam, '-define', 'png:exclude-chunks=date,time', png], check=True)
    os.remove(pam)
    meta = {'frameWidth': FW, 'frameHeight': FH, 'cols': cols, 'rows': rows, 'count': len(order), 'anims': index}
    open(OUT_JS, 'w').write('/* DIBUAT OTOMATIS oleh tools/sprite/build_sheet.py - jangan diedit manual */\n'
                            'window.ARSYA_FRAMES = ' + json.dumps(meta) + ';\n')
    print('frame unik:', len(order), '| grid:', cols, 'x', rows, '| sheet:', W, 'x', H)
    print(json.dumps({k: len(v) for k, v in index.items()}))

    if '--preview' in sys.argv:
        dst = sys.argv[sys.argv.index('--preview') + 1]
        tmp = dst + '.d'
        os.makedirs(tmp, exist_ok=True)
        tiles, done = [], set()
        for name, ids in index.items():
            for n, i in enumerate(ids):
                if (name, i) in done:
                    continue
                done.add((name, i))
                t = os.path.join(tmp, '%s_%03d.png' % (name, n))
                subprocess.run(['convert', png, '-crop', '%dx%d+%d+%d' % (FW, FH, (i % cols) * FW, (i // cols) * FH),
                                '+repage', '-background', '#dfe4ec', '-flatten', '-filter', 'point', '-resize', '200%',
                                '-gravity', 'south', '-background', '#ffffff', '-splice', '0x18',
                                '-pointsize', '13', '-annotate', '+0+2', '%s %d' % (name, n), t], check=True)
                tiles.append(t)
        subprocess.run(['montage'] + tiles + ['-tile', '12x', '-geometry', '+2+2', dst], check=True)
        subprocess.run(['rm', '-rf', tmp], check=True)
        print('preview:', dst)

if __name__ == '__main__':
    main()
