"""Logo/favicon "A" tema Bento: kotak gelap bersudut bulat, huruf A geometris putih, palang oranye (aksen tema).
Jalankan: python3 tools/make_logo.py
  -> favicon.svg (vektor), favicon.png (32), assets/img/ui/logo.png (256), assets/img/ui/apple-touch-icon.png (180)
PNG digambar ImageMagick pada kanvas 1024 lalu diperkecil (tepi halus). Butuh ImageMagick (convert)."""
import os, subprocess

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
INK, WHITE, ACCENT = '#1c1b19', '#fbfaf7', '#ec6a2c'   # = --ink, --card (sedikit hangat), --accent-fill

S = 1024                     # kanvas acuan
RADIUS = 236                 # sudut kotak (± 23%, senada kartu bento)
LEG = [(300, 790), (512, 246), (724, 790)]   # kaki kiri - puncak - kaki kanan (garis tengah goresan)
STROKE = 124
BAR = ((404, 612), (620, 612))               # palang oranye di antara kedua kaki
BAR_W = 104

def svg():
    pts = ' '.join('%d,%d' % p for p in LEG)
    (x1, y1), (x2, y2) = BAR
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}">'
            f'<rect width="{S}" height="{S}" rx="{RADIUS}" fill="{INK}"/>'
            f'<polyline points="{pts}" fill="none" stroke="{WHITE}" stroke-width="{STROKE}" '
            f'stroke-linecap="round" stroke-linejoin="round"/>'
            f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{ACCENT}" stroke-width="{BAR_W}" stroke-linecap="round"/>'
            '</svg>\n')

def render(dst, size, radius=RADIUS):
    (x1, y1), (x2, y2) = BAR
    a, b, c = LEG
    subprocess.run([
        'convert', '-size', f'{S}x{S}', 'xc:none',
        '-fill', INK, '-draw', f'roundrectangle 0,0 {S - 1},{S - 1} {radius},{radius}',
        '-fill', 'none', '-stroke', WHITE, '-strokewidth', str(STROKE),
        '-draw', f'stroke-linecap round stroke-linejoin round polyline {a[0]},{a[1]} {b[0]},{b[1]} {c[0]},{c[1]}',
        '-stroke', ACCENT, '-strokewidth', str(BAR_W),
        '-draw', f'stroke-linecap round line {x1},{y1} {x2},{y2}',
        '-filter', 'Triangle', '-resize', f'{size}x{size}',
        '-define', 'png:exclude-chunks=date,time', dst], check=True)

if __name__ == '__main__':
    open(os.path.join(ROOT, 'favicon.svg'), 'w').write(svg())
    render(os.path.join(ROOT, 'favicon.png'), 32)
    render(os.path.join(ROOT, 'assets', 'img', 'ui', 'logo.png'), 256)
    # iOS memotong sudut ikon sendiri: kotak penuh agar sudut tidak tampil hitam
    render(os.path.join(ROOT, 'assets', 'img', 'ui', 'apple-touch-icon.png'), 180, radius=0)
    print('ok: favicon.svg, favicon.png, logo.png, apple-touch-icon.png')
