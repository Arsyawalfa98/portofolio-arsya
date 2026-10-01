# Rencana Redesign Portofolio — Pixel Quest

> Status: **v3 diimplementasikan (fase 1–8)** · 1 Okt 2026
> Pemilik: Muhammad Imam Arsyawalfa
> Inspirasi elemen: [renalazy.github.io/portofren](https://renalazy.github.io/portofren/). Hanya **jenis elemennya** yang diambil. Penempatan, visual, dan teks dibuat sendiri.
> Perubahan dari v2: tema cyberpunk/Call of Duty diganti **pixel game × futuristik** agar senada dengan karakter pixel. **Seluruh aset gambar dibuat lewat Canva** (§12).

---

## 1. Ringkasan

Portofolio dirombak menjadi **website bergaya game pixel 16-bit dengan sentuhan futuristik (sci-fi)**. Karakter pixel Arsya (companion, sudah jadi) menjadi "pemain" yang menemani pengunjung. **Warna terang default**, mode gelap sebagai pilihan.

**Keputusan yang sudah ditetapkan**

| Topik | Keputusan |
|---|---|
| Tema | **Game pixel 16-bit × futuristik** (menu RPG + panel sci-fi) |
| Motif | **Tanpa motif batik** di website. Batik hanya ada di baju karakter |
| Warna | Mengikuti warna karakter (oranye, cokelat, kulit, hitam rambut) + pelengkap yang tidak bertabrakan (§2.2) |
| Mode | **Terang (default)** + toggle **gelap** |
| Kartu | **Setiap kartu wajib punya title bar (judul kartu)** seperti jendela game |
| Aset gambar | **Semua dibuat di Canva** lewat Canva MCP, tidak digambar manual (§12) |
| Bahasa | **EN (default)** + toggle **ID** |
| Harga layanan | **Tidak ditampilkan** ("hubungi untuk penawaran") |
| Hero diagonal lama | **Dibuang** |
| Penempatan | Disusun sendiri, tidak meniru urutan renalazy |

**Dua pembaca utama**

| Pembaca | Yang dicari | Harus ketemu dalam |
|---|---|---|
| Recruiter / HR | Siapa, berapa tahun, stack, bukti hasil, CV | ≤ 10 detik (hero + player card) |
| Klien proyek | Bisa bikin apa, contoh hasil, cara order | ≤ 30 detik (quests + commissions + request) |

**Prinsip**

1. **Tema tidak mengalahkan keterbacaan.** Setiap label game ditemani label biasa, contoh: `QUESTS · Projects`. Font pixel hanya untuk judul; paragraf memakai font biasa.
2. **Data-driven.** Konten ditulis sekali di file data JS lalu dirender otomatis.
3. **Vanilla JS, tanpa framework / library.** Situs statis untuk GitHub Pages.
4. **Bilingual EN/ID** dari satu sumber.
5. **Gambar dari Canva, struktur dari CSS.** Bingkai jendela, tombol, dan meter dibuat dengan CSS agar responsif; ilustrasi, ikon, latar, dan badge dibuat di Canva.

---

## 2. Konsep Visual

### 2.1 Rasa yang dituju

- **Pixel game (16-bit):** jendela dialog berbingkai piksel, menu dengan kursor `▶`, teks dialog yang diketik huruf per huruf, bar XP/HP, ikon item, "PRESS START".
- **Futuristik:** panel HUD tipis, garis grid halus, cahaya lembut (glow) pada aksen, latar kota/teknologi pixel, label kode kecil (`LV.05`, `ID:01`).
- **Mode terang** = level siang hari (langit cerah, panel krem/putih). **Mode gelap** = level malam (langit navy, lampu neon kota).
- **Tidak ada:** motif batik, hazard stripe militer, nuansa perang/senjata.

### 2.2 Palet warna (token)

Diambil dari karakter (oranye baju, cokelat, warna kulit, hitam rambut) dan dilengkapi warna pelengkap (teal, ungu) agar tidak bertabrakan. Didefinisikan di `:root` (terang) dan `[data-theme="dark"]` (gelap). Pilihan tema tersimpan di `localStorage`, default **terang**.

| Token | Terang (default) | Gelap | Dipakai untuk | Asal |
|---|---|---|---|---|
| `--bg` | `#f4f1ea` | `#121428` | latar halaman | krem netral / navy malam |
| `--bg-grid` | `rgba(27,31,59,.05)` | `rgba(94,214,224,.06)` | grid latar | — |
| `--panel` | `#fffdf8` | `#1b1e38` | isi kartu | — |
| `--panel-2` | `#f1ebe0` | `#252948` | chip, input | — |
| `--titlebar` | `#1b1f3b` | `#2a2f55` | **title bar kartu** (gelap di kedua tema) | senada hitam rambut |
| `--titlebar-ink` | `#fff4e6` | `#fff4e6` | teks title bar | — |
| `--frame` | `#1b1f3b` | `#4a5290` | bingkai piksel kartu | — |
| `--ink` | `#1b1a24` | `#f2eee8` | teks utama | — |
| `--ink-soft` | `#4a4656` | `#b9b6c9` | paragraf | — |
| `--ink-faint` | `#6b6578` | `#9a95b5` | meta | — |
| `--accent` | `#b04a1c` | `#ff8a4c` | **aksen teks**: link aktif, judul kecil | oranye baju karakter (digelapkan agar terbaca) |
| `--accent-fill` | `#d9622b` | `#ff8a4c` | isi tombol CTA, garis, ikon (bukan teks kecil) | oranye baju karakter |
| `--accent-2` | `#9e5134` | `#e0956b` | hover/shadow tombol oranye | cokelat baju |
| `--teal` | `#0f6f7c` | `#5ed6e0` | aksen futuristik: fokus, angka, meter | pelengkap oranye |
| `--violet` | `#5b45c9` | `#a594ff` | highlight, tier epic (senada zZ karakter) | — |
| `--gold` | `#e0a526` | `#ffd45e` | koin, bintang, tier legendary (isi, bukan teks) | — |
| `--ok` | `#177a45` | `#5be39a` | status online / open to work | — |
| `--danger` | `#cc3344` | `#ff6b7a` | error form | — |
| `--skin` | `#fcbc93` | `#fcbc93` | aksen kecil (avatar bg, badge) | kulit karakter |

- Kontras teks memenuhi WCAG AA (≥ 4.5:1), sudah dihitung: `--accent` 4,9:1, `--teal` 5,2:1, `--ink-faint` 5,0:1, `--ok` ≥ 4,5:1 di atas `--bg` terang; di mode gelap semua ≥ 4,5:1.
- `--accent-fill` (oranye karakter asli) hanya untuk isi tombol dan dekorasi. Teks di atasnya memakai navy `--titlebar` dengan ukuran ≥ 19px tebal (rasio 4,4:1, lolos AA teks besar).
- Tier sertifikat: `legendary` (gold) · `epic` (violet) · `rare` (teal) · `common` (abu).
- Warna yang sama dipakai di prompt Canva (§12.2) agar aset dan CSS senada.

### 2.3 Tipografi (Google Fonts)

| Peran | Font | Catatan |
|---|---|---|
| Display (h1, h2, title bar, tombol menu) | **Tiny5** 400 (fallback Pixelify Sans) | diganti dari Pixelify Sans: di Pixelify huruf `C` mirip `O` dan angka `5` mirip `S` |
| Body | **Inter** 400/500/600 | paragraf tetap nyaman |
| Label HUD, angka, kode | **JetBrains Mono** 500/700 | `LV.05`, metrik (termasuk angka Player Stats), tag |

Token: `--font-display`, `--font-body`, `--font-mono` (dengan fallback). Font pixel tidak dipakai untuk paragraf panjang.

### 2.4 Komponen inti: jendela game berjudul (`.win`)

Semua konten berada di dalam jendela ini. **Title bar wajib ada.**

```
▛▀▀ ◆ PLAYER CARD · Profil ··········· LV.05 ···· ● ONLINE  [_][×] ▀▀▜   ← title bar gelap
▌                                                                    ▐     kiri: ikon (Canva) + judul
▌   isi kartu                                                        ▐     kanan: kode kecil, LED, tombol dekor
▌                                                                    ▐
▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟   ← bingkai piksel + bayangan 4px
```

- Bingkai piksel dibuat dengan CSS (`box-shadow` bertingkat atau `border-image` dari aset Canva 9-slice), sudut "bertangga" khas pixel.
- Title bar: latar `--titlebar`, ikon section 16×16 (aset Canva), judul **EN uppercase** + label biasa, kode kecil mono, LED status.
- Bayangan keras (tanpa blur) 4px ke kanan-bawah, seperti UI game retro.
- Kartu yang bisa diklik: hover menggeser kartu 2px ke atas-kiri dan bayangan memanjang (efek "tombol ditekan").
- Varian warna garis atas: `--accent` (default), `--teal` (info), `--violet` (highlight), `--gold` (CTA).

### 2.5 Komponen lain

| Komponen | Bentuk |
|---|---|
| `.btn` | tombol pixel: blok warna + bayangan keras, saat ditekan turun 2px |
| `.menu-list` | daftar menu game dengan kursor `▶` yang berkedip di item aktif |
| `.meter` | bar XP bersegmen (kotak-kotak), terisi bertahap dengan `steps()` |
| `.chip` | tag teknologi berbentuk "item slot" kecil |
| `.badge` | badge tier (gambar dari Canva + label teks) |
| `.dialog-box` | kotak dialog RPG untuk system log / sapaan (teks diketik) |

### 2.6 Efek

| Efek | Di mana | Batasan |
|---|---|---|
| Latar pixel (aset Canva) | hero | **tanpa parallax**: latar ikut scroll bersama halaman agar jalan di gambar tetap sinkron dengan pijakan companion |
| Grid halus + glow lembut | seluruh halaman | CSS statis |
| Teks diketik ala dialog RPG | role line hero, system log | ≤ 900ms per baris |
| "PRESS START" berkedip | boot screen | — |
| Glitch tipis (futuristik) | nama di hero, sekali saat load | ≤ 400ms |
| Meter terisi bertahap | player card & skill tree saat terlihat | IntersectionObserver |
| Reveal on scroll (muncul bertahap gaya pixel) | tiap section | konten tetap tampil jika JS gagal |
| Partikel koin/bintang kecil | hover CTA utama | ringan, maks. 6 partikel |

Semua efek **mati** saat `prefers-reduced-motion: reduce`.

---

## 3. Peta Halaman

Halaman dibagi menjadi **5 zona** seperti alur game: *Start → Profile → Quests → Journey → Party*.

| Zona | # | Section (id) | Judul kartu (EN) | Label biasa | Isi | Data |
|---|---|---|---|---|---|---|
| — | 0 | `nav` | — | Navigasi | logo pixel, link zona, toggle **EN/ID**, toggle **☀/☾**, menu mobile | HTML |
| **START** | 1 | `#home` | `MAIN MENU` | Hero | latar parallax pixel, nama (glitch tipis), role (diketik), 2 kalimat ringkasan, **menu game**: ▶ View Quests · ▶ Download CV · ▶ Contact Me | HTML + i18n |
| | 2 | (di hero) | `PLAYER CARD` | Kartu profil | foto/portrait, nama, class (Software Engineer), **status Open to work**, lokasi, mode kerja, bar Availability/Focus/EXP, 3 stat | `profile.js` |
| | 3 | `#stats` | `PLAYER STATS` | Dampak dalam angka | strip 4–5 metrik | `profile.js` |
| **PROFILE** | 4 | `#about` | `PLAYER PROFILE` | Tentang saya | cerita singkat, daftar dampak, info grid | `profile.js` |
| | 5 | `#skills` | `SKILL TREE` | Keahlian | **Main** (Go, PHP/Laravel) · **Sub** (JS, Next.js, React) · **Tools** (Docker, CI/CD, Git) · **Database** (PostgreSQL, MySQL) · **Passive** (soft skill) | `skills.js` |
| **QUESTS** | 6 | `#quests` | `QUESTS` | Proyek | filter + grid kartu → **pop-up detail** | `projects.js` |
| | 7 | `#commissions` | `COMMISSIONS` | Layanan | jenis pekerjaan + alur kerja (tanpa harga) | `services.js` |
| **JOURNEY** | 8 | `#journey` | `ADVENTURE LOG` | Pengalaman | tab **Work** / **Internship**, timeline | `experience.js`, `internships.js` |
| | 9 | `#achievements` | `ACHIEVEMENTS` | Sertifikasi & pendidikan | badge sertifikat bertingkat + kartu pendidikan | `certs.js`, `profile.js` |
| **PARTY** | 10 | `#party` | `PARTY INVITE` | Ajakan kerja sama | kartu Hire / Commission + 3 tombol | `profile.js` |
| | 11 | (di party) | `SEND MESSAGE` | Kontak | daftar kontak + form email | `profile.js` |
| | 12 | (di party) | `CHAT LOG` | — | kotak dialog sistem | i18n |
| — | 13 | `footer` | — | Footer | copyright, tahun otomatis, "Thanks for playing" | HTML |

Nav: **Profile · Quests · Journey · Party** (+ logo ke Start).

### 3.1 Wireframe desktop (≥ 1024px)

```
┌─ NAV ─ [AR] ARSYAWALFA   Profile  Quests  Journey  Party      [EN|ID] [☀] ┐
╞═══════════════════════════ ZONA: START ════════════════════════════════════╡
│  (latar parallax pixel: langit · kota futuristik · tanah — aset Canva)     │
│ ▛ MAIN MENU ──────────────────────────▜ ▛ PLAYER CARD ─── ● ONLINE ▜      │
│ ▌ MUHAMMAD IMAM                        ▐ ▌ [portrait] ARSYAWALFA      ▐      │
│ ▌ ARSYAWALFA                           ▐ ▌   Class: Software Engineer ▐      │
│ ▌ > Software Engineer_                 ▐ ▌ ● OPEN TO WORK · Surabaya  ▐      │
│ ▌ 2 kalimat ringkasan                  ▐ ▌ AVAIL ■■■■■■■■■■           ▐      │
│ ▌                                      ▐ ▌ FOCUS ■■■■■■■■□□ Go        ▐      │
│ ▌ ▶ VIEW QUESTS                        ▐ ▌ EXP   ■■■■■■■□□□ 5+ yrs    ▐      │
│ ▌   DOWNLOAD CV  ▾                     ▐ ▌ 5+ YRS │ 10+ SYS │ 5 CERT  ▐      │
│ ▌   CONTACT ME                         ▐ ▌ in  gh  ig  jobstreet      ▐      │
│ ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟ ▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟      │
│ ▛ PLAYER STATS ────────────────────────────────────────────────────────▜ │
│ ▌  5+ yrs  │  10+ systems │  xx users │  xx% faster │  5 certs         ▐ │
╞═══════════════════════════ ZONA: PROFILE ══════════════════════════════════╡
│ ▛ PLAYER PROFILE ─────────────▜ ▛ SKILL TREE ──────────────────────────▜ │
│ ▌ cerita + daftar dampak      ▐ ▌ MAIN      Go ■■■  Laravel ■■■        ▐ │
│ ▌ info grid                   ▐ ▌ SUB       Next.js  React  JS         ▐ │
│ ▌                             ▐ ▌ TOOLS     Docker  CI/CD  Git         ▐ │
│ ▌                             ▐ ▌ DATABASE  PostgreSQL  MySQL          ▐ │
╞═══════════════════════════ ZONA: QUESTS ═══════════════════════════════════╡
│ ▛ QUESTS · filter: [All][Client][Own][Institution]  [BE][FE][FS] ──────▜ │
│ ▌ ▛Q.01▜ ▛Q.02▜ ▛Q.03▜   klik → pop-up QUEST DETAILS                    ▐ │
│ ▛ COMMISSIONS · What I can build ──────────────────────────────────────▜ │
│ ▌ [Company profile] [Web store] [Info system] [REST API] [Dashboard]  ▐ │
│ ▌ BRIEF ▶ PROPOSAL ▶ BUILD ▶ LAUNCH ▶ SUPPORT                          ▐ │
╞═══════════════════════════ ZONA: JOURNEY ══════════════════════════════════╡
│ ▛ ADVENTURE LOG [Work][Internship] ─▜ ▛ ACHIEVEMENTS ─────────────────▜  │
│ ▌ 2020–now  Head of MIS · UNIPA      ▐ ▌ 🏅 HackerRank Go              ▐  │
│ ▌ 2018–now  Software Dev · Strugg    ▐ ▌ 🏅 SQL Intermediate  …        ▐  │
│ ▌                                    ▐ ▌ ── ACADEMY ── S.Kom · STIKI   ▐  │
╞═══════════════════════════ ZONA: PARTY ════════════════════════════════════╡
│ ▛ PARTY INVITE ────────────────────────────────────────────────────────▜ │
│ ▌ [Arsyawalfa] wants to join your party!                               ▐ │
│ ▌              READY TO TEAM UP?                                       ▐ │
│ ▌ ▛ HIRE ME ──────────────▜ ▛ COMMISSION ─────────────────▜            ▐ │
│ ▌ ▌ Full-time / contract  ▐ ▌ Build a website or app      ▐            ▐ │
│ ▌ [▶ ACCEPT · EMAIL ME]  [REQUEST A BUILD]  [DOWNLOAD CV]              ▐ │
│ ▛ SEND MESSAGE · Contact ──────────────────────────────────────────────▜ │
│ ▌ ✉ arsyawalfa@gmail.com    │ Name [      ] Email [      ]             ▐ │
│ ▌ ⌖ Surabaya, Indonesia     │ Message [                  ]             ▐ │
│ ▌ gh / in / ig / jobstreet  │ [ ▶ SEND · via email ]                   ▐ │
│ ▛ CHAT LOG ────────────────────────────────────────────────────────────▜ │
│ ▌ [SYS] Arsyawalfa joined the server. Status: open to work.            ▐ │
│ ▌ [ARSYA] Thanks for playing! Ping me anytime.                         ▐ │
╞══════════════════ FOOTER · tanah pixel tempat companion berjalan ═══════════╡
```

**Tablet (768–1023px):** Main Menu dan Player Card bertumpuk, grid quest 2 kolom, Journey 1 kolom.
**Mobile (< 768px):** semua 1 kolom; latar parallax jadi 1 lapis; filter quest bisa di-scroll horizontal; kontak di atas form.

---

## 4. Komponen Interaktif

### 4.1 Pop-up detail proyek (`QUEST DETAILS`)

```
▛ QUEST DETAILS · Q.03 ────────────────────────────────────── [×] ▜
▌ [galeri screenshot / diagram alur]           ◀ 1/4 ▶           ▐
▌ NeoFeeder Dikti Integrator         [LEGENDARY] [INSTITUTION]   ▐
▌ Universitas PGRI Adi Buana · 2021–now · Role: Lead dev         ▐
▌ ── OBJECTIVE ── masalah yang diselesaikan                      ▐
▌ ── STRATEGY ──  apa yang dibangun, keputusan teknis            ▐
▌ ── REWARD ──    dampak terukur                                 ▐
▌ ── EQUIPMENT ── [PHP] [Laravel] [REST API]                     ▐
▌ [Live ↗] [Source ↗]                ◀ Prev quest | Next quest ▶ ▐
▙▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▟
```

- Memakai **`<dialog>`** native (`showModal()`): Esc, focus trap, dan backdrop sudah tersedia.
- URL bisa dibagikan: `#quest/neofeeder`; tombol back browser menutupnya.
- Proyek internal tanpa screenshot memakai **thumbnail ilustrasi Canva** + diagram alur dan catatan "sistem internal".
- Prev/next antar quest, ← → untuk galeri, scroll body dikunci, fokus kembali ke kartu asal saat ditutup.

### 4.2 Filter quest

- **Tipe:** All · Client · Own product · Institution · Learning
- **Kelas:** All · Backend · Frontend · Fullstack · DevOps
- Kartu yang tidak cocok diredupkan, tata letak tidak meloncat.
- Filter tersimpan di URL (`?type=client&class=be`), tombol memakai `aria-pressed`.

### 4.3 Dropdown Download CV

- Berisi CV EN dan CV ID (jika keduanya ada).
- Satu komponen, dipanggil dari Main Menu, Player Card, dan Party Invite.
- Tertutup saat klik di luar atau Esc, dengan `aria-expanded`.

### 4.4 `SEND MESSAGE` — kirim email

- Kiri: daftar kontak (email, lokasi, GitHub, LinkedIn, Instagram, Jobstreet).
- Kanan: form **Name · Email · Message** → tombol **▶ SEND · via email**.
- Tanpa backend: `mailto:arsyawalfa@gmail.com` dengan subjek dan isi terisi otomatis; catatan kecil bahwa tidak ada data disimpan di server.
- Validasi native, pesan error diumumkan lewat `aria-live`.
- **Upgrade opsional:** Web3Forms / Formspree (gratis), mailto tetap jadi fallback.

### 4.5 `PARTY INVITE` + pop-up Request a build

- Sapaan "Arsyawalfa wants to join your party!", judul **READY TO TEAM UP?**, subjudul waktu respons.
- Dua kartu: **HIRE ME** (full-time / kontrak · Backend · Fullstack · Go · PHP · remote/hybrid) dan **COMMISSION** (company profile, toko online, sistem informasi, REST API, dashboard).
- Tiga tombol: **▶ Accept · Email me** (CTA oranye + partikel koin), **Request a build**, **Download CV**.
- **Pop-up Request a build** (`<dialog>`), via mailto: Name, Email, Company (opsional), Project type, Target date, Description. **Tanpa kolom budget/harga.**

### 4.6 `CHAT LOG`

Kotak dialog RPG; baris muncul satu per satu (diketik) saat section terlihat:

```
[SYS] Arsyawalfa joined the server. Status: open to work.
[SYS] Average response time: < 24h.
[ARSYA] Thanks for playing! Ping me anytime — arsyawalfa@gmail.com
```

### 4.7 Toggle bahasa & tema

- `EN | ID`: segmented button dengan `aria-pressed`, default **EN**, tersimpan di `localStorage`.
- `☀ / ☾`: default **terang**, tersimpan di `localStorage`. `data-theme` dipasang lewat script kecil di `<head>` agar tidak berkedip. Mode gelap juga mengganti latar hero ke versi malam (aset Canva).

---

## 5. Section yang Ditambahkan agar Menarik untuk Direkrut

| Prioritas | Tambahan | Alasan |
|---|---|---|
| **Wajib** | **Status Open to work** + lokasi + mode kerja di Player Card | recruiter langsung tahu Anda tersedia |
| **Wajib** | **Player Stats** (angka nyata) | angka lebih meyakinkan daripada daftar tugas |
| **Wajib** | **Studi kasus di pop-up** (objective → strategy → reward) | menunjukkan cara berpikir |
| **Wajib** | **Download CV** di 3 tempat | CV sudah ada di repo tetapi belum di-link |
| **Wajib** | **Internship** (tab di Adventure Log) | data menyusul, tab disembunyikan selama data kosong |
| Disarankan | **Commissions**: jenis layanan + alur kerja, tanpa harga | klien paham cara order |
| Disarankan | Link bukti per proyek (live / GitHub / diagram) | recruiter teknis ingin melihat kode |
| Disarankan | Badge "Currently building" di proyek Go | menunjukkan terus belajar |
| Opsional | Testimoni klien / atasan | social proof |
| Opsional | FAQ klien (durasi, revisi, maintenance) | mengurangi pertanyaan berulang |

---

## 6. Arsitektur Kode

### 6.1 Struktur folder

```
portofolio-arsya/
├── index.html
├── favicon.png                     ← Canva
├── docs/REDESIGN.md
├── assets/
│   ├── css/
│   │   ├── tokens.css              warna (terang + gelap), font, spacing, z-index
│   │   ├── base.css                reset, tipografi, latar grid, utilitas
│   │   ├── components.css          .win, .btn, .menu-list, .chip, .meter, .badge, dialog, form, dropdown, tabs
│   │   ├── sections.css            layout per zona + breakpoint
│   │   └── companion.css           pixel companion (dipindah dari style.css)
│   ├── js/
│   │   ├── main.js                 entry (ES module): render, nav, filter, modal, tabs, forms, tema, efek, boot
│   │   ├── i18n.js                 kamus UI {en:{}, id:{}} + t() / tx() / applyStatic()
│   │   ├── data/                   profile, projects, experience, internships, certs, skills, services
│   │   ├── companion.js            sudah ada
│   │   └── companion-frames.js     sudah ada (auto-generated)
│   └── img/
│       ├── companion/arsya-sheet.png   sudah ada (bukan dari Canva, lihat §11)
│       ├── bg/                     ← Canva: latar parallax hero (siang & malam), tanah footer
│       ├── icons/                  ← Canva: ikon section & kontak (pixel)
│       ├── badges/                 ← Canva: badge tier & medali
│       ├── quests/<slug>/          ← screenshot proyek / thumbnail ilustrasi Canva
│       ├── ui/                     ← Canva: logo pixel, bingkai 9-slice (opsional), boot screen
│       ├── profile.webp            foto profil (dikompres)
│       └── og-cover.png            ← Canva, 1200×630
├── pdf/                            CV
└── tools/sprite/                   generator sprite companion (lihat §11)
```

- Memakai **ES modules** (`<script type="module">`); di lokal dijalankan lewat server (`python3 -m http.server 8000`).
- **Tanpa library.** Ikon brand (GitHub, LinkedIn, dll.) memakai SVG resmi; ikon lain dari Canva.

### 6.2 Contoh skema data

```js
// assets/js/data/projects.js
export const projects = [
  {
    slug: 'neofeeder',
    code: 'Q.03',
    type: 'institution',               // client | own | institution | learning
    classes: ['be', 'fs'],             // be | fe | fs | devops
    tier: 'legendary',                 // legendary | epic | rare | common
    title:     { en: 'NeoFeeder Dikti Integrator', id: 'Integrator NeoFeeder Dikti' },
    meta:      { en: 'Universitas PGRI Adi Buana · 2021–now', id: '…' },
    summary:   { en: '…', id: '…' },   // teks kartu (≤ 2 kalimat)
    objective: { en: '…', id: '…' },   // pop-up
    strategy:  { en: '…', id: '…' },
    reward:    { en: '…', id: '…' },
    metric: { value: '90%', label: { en: 'less manual entry', id: 'input manual berkurang' } },
    stack: ['PHP', 'Laravel', 'REST API'],
    thumb: 'assets/img/quests/neofeeder/thumb.webp',   // ilustrasi Canva bila tanpa screenshot
    media: [],
    flow: ['SIAKAD DB', 'Integrator', 'NeoFeeder API'],
    links: { live: null, repo: null },
    internal: true
  }
];

// assets/js/data/internships.js — data menyusul; array kosong = tab tidak tampil
export const internships = [];
```

### 6.3 i18n

- **Teks UI** di `i18n.js`; elemen HTML diberi `data-i18n="nav.quests"`, teks EN ditulis langsung di HTML sebagai default.
- **Teks konten** di data sebagai `{ en, id }`.
- Saat bahasa diganti, event `langchange` dikirim dan bagian dari data dirender ulang; balon companion ikut berganti bahasa.
- Judul kartu (MAIN MENU, SKILL TREE, dst.) **tetap EN** di kedua bahasa (gaya game); label pendampingnya diterjemahkan, misalnya `SKILL TREE · Keahlian`.

---

## 7. Aksesibilitas, Performa, SEO

**Aksesibilitas**
- Skip link, landmark, satu `h1`, urutan heading rapi.
- Tombol ikon memiliki `aria-label`; menu, dropdown, filter, tab memakai `aria-expanded` / `aria-pressed` / `role="tablist"`.
- `:focus-visible` jelas di kedua tema. Kontras WCAG AA di terang **dan** gelap. Target sentuh ≥ 44px.
- Gambar dekoratif dari Canva memakai `alt=""`; gambar bermakna diberi alt deskriptif.
- `prefers-reduced-motion` mematikan semua efek gerak.

**Performa** (target Lighthouse ≥ 90)
- Aset Canva diekspor PNG lalu dikonversi ke **WebP** (ilustrasi) atau PNG terindeks (pixel art kecil), dengan `width`/`height` dan lazy load (kecuali latar hero).
- Pixel art ditampilkan dengan `image-rendering: pixelated` pada skala bulat.
- Total gambar halaman pertama ≤ 400 KB; tiap latar parallax ≤ 120 KB.
- 3 keluarga font dengan weight seperlunya, `display=swap`. Tanpa library; total JS < 40 KB (termasuk companion).

**SEO**
- `title`, `description`, `canonical`, Open Graph + Twitter card dengan **URL gambar absolut** (OG cover dari Canva).
- Favicon + apple-touch-icon dari Canva. JSON-LD `Person`.
- Konten inti (hero, profil) ditulis di HTML; hanya daftar berulang yang dirender JS.

---

## 8. Checklist Data yang Perlu Disiapkan

| # | Data | Status |
|---|---|---|
| 1 | Foto profil resolusi tinggi | ada, perlu dikompres |
| 2 | CV ATS **EN** (default) dan ID | ✅ `pdf/CV_ATS_ENGLISH_M_IMAM_ARSYAWALFA.pdf`, `pdf/CV_ATS_M_IMAM_ARSYAWALFA_INDONESIA.pdf`; tombol Download CV otomatis mengikuti bahasa aktif |
| 3 | 4–5 **metrik dampak** berupa angka | ☐ |
| 4 | Screenshot per proyek non-internal (desktop + mobile) | ☐ |
| 5 | Studi kasus per proyek: masalah, peran, solusi, hasil | ☐ (draf bisa dibuat dari deskripsi yang ada) |
| 6 | Link live demo / repo GitHub per proyek | ☐ |
| 7 | **Data magang** | ☐ menyusul |
| 8 | Level skill per teknologi (tahun / tingkat) | ☐ |
| 9 | Daftar jenis layanan (tanpa harga) | ☐ (draf bisa dibuat) |
| 10 | Status kerja: open to work? remote / hybrid / onsite? | ☐ |
| 11 | Nama panggilan pemain untuk Player Card (mis. "ARSYA") | ☐ |
| 12 | Testimoni (opsional) | ☐ |
| 13 | Sprite companion | ✅ selesai (§11) |
| 14 | Aset gambar website (§12.3) | prioritas 1 ✅ · prioritas 2–3 ☐ (menunggu kuota Canva) |

---

## 9. Rencana Pengerjaan

| Fase | Pekerjaan | Hasil | Status |
|---|---|---|---|
| 0 | Bersih-bersih repo: `.gitignore`, hapus aset tak terpakai, rapikan sumber sprite | repo bersih | ✅ (tinggal commit) |
| 0b | Pixel companion (§11) | karakter hidup di halaman | ✅ |
| 1 | **Aset Canva tahap 1**: logo, ikon section, latar hero siang/malam, tanah footer (§12.3 prioritas 1) | aset inti siap | ✅ |
| 2 | `tokens.css`, `base.css`, komponen `.win` + title bar, `.btn`, `.menu-list`, `.meter` | kit komponen | ✅ |
| 3 | Kerangka `index.html` 5 zona (statis) + responsif | struktur halaman | ✅ |
| 4 | File data + `render.js` | konten dari data | ✅ |
| 5 | Pop-up Quest Details + filter + URL; **aset Canva tahap 2** (thumbnail quest, badge tier) | detail proyek | ✅ kode · ☐ aset tahap 2 (kuota Canva habis; tier sementara memakai label CSS) |
| 6 | Send Message, Party Invite, Request a build, dropdown CV, tab Internship | semua jalur kontak | ✅ |
| 7 | i18n EN/ID + toggle tema (termasuk latar malam) | dwibahasa & dua tema | ✅ |
| 8 | Efek (boot screen, ketik, glitch, reveal, meter, chat log, partikel) + reduced-motion; **aset Canva tahap 3** (OG cover, favicon, boot screen) | tema hidup | ✅ efek · favicon dari logo Canva · ☐ OG cover |
| 9 | Audit a11y + Lighthouse + uji Chrome/Safari/Firefox, iOS & Android | siap rilis | ☐ |
| 10 | Deploy GitHub Pages | live | ☐ |

---

## 10. Keputusan Tambahan (sudah ditetapkan)

1. **Boot screen: dipakai.** Layar pembuka ±1 detik, **sekali per kunjungan** (`sessionStorage`), bisa dilewati dengan klik/Esc/tombol apa pun, tidak tampil saat `prefers-reduced-motion`:
   ```
   [ logo pixel ARSYAWALFA — aset Canva ]
   > LOADING PLAYER DATA........ OK
   > LOADING QUESTS............. OK
   ■■■■■■■■■■■■■■■■■■ 100%
            ▶ PRESS START ◀        (klik / tombol apa pun)
   ```
   Konten halaman tetap ada di HTML di belakangnya, sehingga SEO dan pengunjung tanpa JS tidak terpengaruh.
2. **Magang: riwayat magang pemilik sendiri** sebagai tab **Internship** di Adventure Log (`internships.js` kosong; tab muncul otomatis begitu diisi).
3. **Karakter pixel art: dipakai dan sudah jadi** (§11).
4. **Tanpa motif batik** pada UI dan aset website.
5. **Canva untuk semua aset gambar website** (§12). Sprite companion tetap dari pipeline sprite (§11).

---

## 11. Pixel Companion — Karakter Pixel Art (selesai)

Karakter chibi Arsya hidup di bagian bawah layar: berjalan kiri/kanan, ngoding dengan laptop (kesal sesekali), minum kopi sambil berbicara, membaca, berpikir, melambai, tidur dengan bantal setelah 35 detik tanpa aktivitas lalu bangun kaget, bisa diangkat (meronta), jatuh, tergeletak, bangun, dan menangis.

**File**

| File | Isi |
|---|---|
| `assets/img/companion/arsya-sheet.png` | sprite sheet grid 40 kolom, frame 80×82, 160 frame unik (±144 KB) |
| `assets/js/companion-frames.js` | indeks frame per animasi (**auto-generated**, jangan diedit manual) |
| `assets/js/companion.js` | mesin status (idle, walk, coding, coffee, sleep, wake, drag, fall, cry, …), balon dialog EN/ID |
| `tools/sprite/source/*.png` | 7 lembar aset karakter asli (tidak ikut ke website) |
| `tools/sprite/extract.py`, `build_sheet.py` | pipeline: potong frame → samakan ukuran & palet ke idle → sheet |

**Membangun ulang sprite:** `python3 tools/sprite/extract.py && python3 tools/sprite/build_sheet.py --preview tools/sprite/preview.png`

**Aturan aset karakter baru:** ukuran badan dan warna setiap frame wajib senada dengan idle (tinggi berdiri ±77 px, palet dikunci ke palet idle). Uji cepat di browser dengan `?buddy=<state>`, misalnya `?buddy=sleep`, `?buddy=wake`, `?buddy=coding`.

**Integrasi dengan redesign**
- **Pijakan di jalan hero:** selama trotoar pada latar hero terlihat, companion berdiri dan berjalan di atasnya (`window.ARSYA_FLOOR` di `main.js` menghitung posisi trotoar dari ukuran `background-size: cover`; baris piksel trotoar di gambar 1776×896: siang **818**, malam **802**). Saat trotoar keluar layar, companion jatuh ke dasar layar; saat kembali, ia melompat naik ke jalan. Hero diberi ruang kosong bawah (`--stage`: 290px desktop, 250px mobile) agar karakter tidak menutupi jendela.
- Jika latar hero diganti, perbarui angka baris trotoar di `HERO_IMG` (`assets/js/main.js`).
- Tanah footer (`ground-{day,night}.webp`) dipotong dari latar hero, warna ikut tema.
- Balon dialog memakai gaya `.dialog-box` yang sama dengan Chat Log.
- Pemicu scroll: masuk **Quests** → berpikir ("My projects are right here!"), **Skill Tree** → ngoding, **Party** → melambai, form terkirim → senang.
- CSS companion dipindah ke `companion.css`; teks balon pindah ke `i18n.js`.

---

## 12. Aset Website dari Canva

### 12.1 Aturan

1. **Semua gambar website dibuat di Canva** lewat Canva MCP (`generate-image`, `create-design`, `remove-background`, `separate-image-layers`, `export-design`). Claude tidak menggambar aset secara manual.
2. **Yang tetap dibuat dengan CSS/kode** (bukan gambar): bingkai jendela, tombol, meter, chip, grid latar, glow, layout. Alasannya: harus responsif dan berganti warna mengikuti tema.
3. **Pengecualian:** sprite companion (dari aset karakter Anda, §11) dan ikon brand resmi (GitHub, LinkedIn, Instagram, Jobstreet) memakai SVG resmi.
4. Setiap aset **ditinjau dulu oleh pemilik** sebelum dipakai. Desain disimpan di folder Canva **"Portfolio Arsya v2"**.
5. Akun Canva belum memiliki Brand Kit, jadi palet §2.2 dan gaya §12.2 dicantumkan di setiap prompt.

### 12.2 Gaya prompt (wajib di setiap aset)

```
16-bit pixel art, clean pixels, no anti-aliasing, futuristic sci-fi game UI style,
friendly and bright, color palette: #d9622b orange, #9e5134 brown, #fcbc93 skin,
#1b1f3b dark navy, #0f6f7c teal, #5b45c9 violet, #e0a526 gold, #f4f1ea cream.
No batik pattern, no military / weapon elements, no text unless specified.
```

- Versi malam: ganti latar ke navy `#121428` dengan lampu neon teal/violet.
- Aset yang harus transparan (ikon, badge, logo): minta latar polos lalu `remove-background`, ekspor PNG `transparent_background: true`.
- Skala pixel harus bulat: ikon dibuat besar (mis. 512 px) lalu diperkecil dengan *nearest neighbor* ke 16/32/64 px saat diproses.

### 12.3 Daftar aset

| Prioritas | Aset | Tool Canva | Ukuran ekspor | Tujuan di repo | Catatan |
|---|---|---|---|---|---|
| 1 | Logo pixel "AR" / ARSYAWALFA | generate-image + remove-background | 512×512 PNG transparan | `assets/img/ui/logo.png` | dipakai nav & boot screen |
| 1 | Ikon section (Main Menu, Player Card, Stats, Profile, Skill Tree, Quests, Commissions, Adventure Log, Achievements, Party, Message, Chat) | generate-image (satu set) + remove-background | 512×512 per ikon → 32 px | `assets/img/icons/*.png` | gaya seragam, 1 warna aksen per ikon |
| 1 | Latar hero **siang** (langit · kota futuristik · tanah) | generate-image 2:1 + separate-image-layers | 1920×960 → WebP | `assets/img/bg/hero-day-{sky,city,ground}.webp` | 3 lapis untuk parallax |
| 1 | Latar hero **malam** (versi neon) | generate-image (referensi versi siang) | 1920×960 → WebP | `assets/img/bg/hero-night-*.webp` | komposisi sama dengan siang |
| 1 | Tanah/lantai pixel yang bisa diulang (tileable) | generate-image | 512×64 PNG | `assets/img/bg/ground-{day,night}.png` | tempat companion berjalan |
| 2 | Badge tier (legendary, epic, rare, common) | generate-image + remove-background | 256×256 → 48 px | `assets/img/badges/tier-*.png` | sertifikat & quest |
| 2 | Medali achievement / ikon sertifikat | generate-image | 256×256 | `assets/img/badges/medal-*.png` | |
| 2 | Thumbnail quest untuk proyek internal (tanpa screenshot) | generate-image 16:9 per proyek | 800×450 → WebP | `assets/img/quests/<slug>/thumb.webp` | ilustrasi tema proyek, tanpa teks |
| 2 | Ikon kontak non-brand (email, lokasi, telepon) | generate-image + remove-background | 256×256 → 24 px | `assets/img/icons/contact-*.png` | |
| 2 | Ikon layanan (company profile, web store, info system, REST API, dashboard) | generate-image | 256×256 → 32 px | `assets/img/icons/svc-*.png` | |
| 3 | OG cover (link preview) | create-design (1200×630) | 1200×630 PNG | `assets/img/og-cover.png` | boleh berisi nama & role |
| 3 | Favicon + apple-touch-icon | dari logo, export-design | 32, 180, 512 PNG | `favicon.png`, `assets/img/ui/apple-touch-icon.png` | |
| 3 | Ilustrasi boot screen / "PRESS START" | generate-image | 1200×600 → WebP | `assets/img/ui/boot.webp` | opsional |
| 3 | Bingkai jendela 9-slice | generate-image | 96×96 PNG | `assets/img/ui/frame-9slice.png` | opsional; default tetap CSS |
| 3 | Kursor pixel | generate-image | 32×32 PNG | `assets/img/ui/cursor.png` | opsional |

### 12.4 Alur kerja per aset

1. Claude membuat aset di Canva (prompt §12.2) dan menunjukkan kandidat.
2. Pemilik memilih / meminta revisi.
3. Ekspor dari Canva (`export-design`, PNG, transparan bila perlu) → unduh ke `assets/img/...`.
4. Proses lokal: perkecil *nearest neighbor* untuk pixel art, konversi WebP untuk ilustrasi, cek ukuran file (§7).
5. Catat di tabel §12.5.

### 12.5 Catatan desain Canva

Diisi setiap kali aset disetujui, agar mudah direvisi nanti.

Semua hasil `generate-image` ditempatkan di satu desain wadah **"Portfolio Arsya v2 - Asset Export"** (`DAHWwPd3-pA`, satu halaman per aset, ukuran = ukuran asli gambar) lalu diekspor PNG lossless. Pratinjau `generate-image` hanya 200 px, jadi ekspor lewat desain wadah ini wajib untuk resolusi penuh.

| Aset | Media ID Canva | Halaman di `DAHWwPd3-pA` | Tanggal | File di repo | Status |
|---|---|---|---|---|---|
| Latar hero siang (1776×896) | `MAHWwAxMJr8` | 2 | 1 Okt 2026 | `assets/img/bg/hero-day.webp` (76 KB) | dipakai |
| Latar hero malam (1776×896) | `MAHWwBIyifE` | 3 | 1 Okt 2026 | `assets/img/bg/hero-night.webp` (34 KB) | dipakai |
| Logo "AR" (1264×1264) | `MAHWwD9hEFI` | 4 | 1 Okt 2026 | `assets/img/ui/logo.png` (256 px, latar dihapus lokal), `favicon.png`, `assets/img/ui/apple-touch-icon.png` | dipakai |
| Set 12 ikon section (1456×1088, grid 4×3) | `MAHWwD9XnaE` | 5 | 1 Okt 2026 | `assets/img/icons/*.png` (96 px per ikon) | dipakai |
| Tanah siang / malam | dipotong dari latar hero (baris bawah) | 2, 3 | 1 Okt 2026 | `assets/img/bg/ground-{day,night}.webp` | dipakai; versi tileable khusus menyusul |

**Catatan implementasi**
- Kuota kredit Canva habis setelah 4 gambar. Aset tanah dipotong dari latar hero alih-alih dibuat terpisah. Aset prioritas 2–3 (badge tier, thumbnail quest, ikon layanan/kontak, OG cover) dibuat saat kuota tersedia.
- Latar hero dipakai sebagai **1 lapis** parallax (bukan 3 lapis): `separate-image-layers` juga memakai kredit.
- Latar putih logo dan ikon dihapus lokal dengan *floodfill* ImageMagick (bukan `remove-background`) untuk menghemat kredit; hasilnya bersih karena latar polos.
- Ikon ditampilkan tanpa `pixelated` karena hasil Canva bukan grid piksel bulat; dikecilkan dengan resampling biasa.
