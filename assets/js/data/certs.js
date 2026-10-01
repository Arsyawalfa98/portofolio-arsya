// Achievements · tier: legendary | epic | rare | common
export const certs = [
  { title: 'HackerRank Go (Basic)', issuer: 'HackerRank', date: { en: 'Jul 2026', id: 'Jul 2026' }, tier: 'rare', url: 'https://www.hackerrank.com/certificates/ff333a0bbe60' },
  { title: 'HackerRank SQL (Intermediate)', issuer: 'HackerRank', date: { en: 'Jul 2026', id: 'Jul 2026' }, tier: 'epic', url: 'https://www.hackerrank.com/certificates/f0166dba2e8c' },
  { title: 'HackerRank SQL (Basic)', issuer: 'HackerRank', date: { en: 'Jul 2026', id: 'Jul 2026' }, tier: 'common', url: 'https://www.hackerrank.com/certificates/9d91fc181515' },
  { title: { en: 'LSP STIKI — Web Developer Competency', id: 'LSP STIKI — Kompetensi Web Developer' }, issuer: 'STIKI Malang', date: { en: 'Sep 2020', id: 'Sep 2020' }, tier: 'epic', url: null },
  { title: 'EC-Council Certified Security Specialist', issuer: 'Ethical Hacking Fundamentals · EC-Council', date: { en: 'Jan 2019', id: 'Jan 2019' }, tier: 'epic', url: null }
];

export const education = {
  degree: { en: 'Bachelor of Information Technology (S.Kom)', id: 'Sarjana Teknologi Informasi (S.Kom)' },
  school: 'STIKI Malang',
  full: 'Sekolah Tinggi Informatika dan Komputer Indonesia',
  years: '2016 — 2020'
};

// HAKI — Surat Pencatatan Ciptaan (Kemenkum, Ditjen Kekayaan Intelektual). Gambar baru tampil lewat tombol View.
export const copyrights = [
  {
    slug: 'sispami',
    title: 'SISPAMI Adi Buana',
    desc: {
      en: 'Internal Quality Assurance (SPMI) & Internal Quality Audit (AMI) Management Information System',
      id: 'Sistem Informasi Pengelolaan Sistem Penjaminan Mutu Internal (SPMI) dan Audit Mutu Internal (AMI)'
    },
    kind: { en: 'Computer program', id: 'Program komputer' },
    number: '000911970',
    date: { en: '5 May 2025', id: '5 Mei 2025' },
    img: 'assets/img/haki/sispami.webp',
    quest: 'spmi'
  },
  {
    slug: 'rpl',
    title: 'RPL Adi Buana',
    desc: {
      en: 'Recognition of Prior Learning (RPL) Information System',
      id: 'Sistem Informasi Rekognisi Pembelajaran Lampau (RPL)'
    },
    kind: { en: 'Computer program', id: 'Program komputer' },
    number: '000828297',
    date: { en: '2 Dec 2024', id: '2 Des 2024' },
    img: 'assets/img/haki/rpl.webp',
    quest: null
  }
];
