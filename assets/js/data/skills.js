// Skill Tree — cabang + item. Level per teknologi menyusul (docs/REDESIGN.md §8 #8).
export const skills = [
  { key: 'main', color: 'accent', label: { en: 'Main', id: 'Utama' }, note: { en: 'daily drivers', id: 'dipakai harian' }, items: ['Go', 'PHP', 'Laravel'] },
  { key: 'sub', color: 'violet', label: { en: 'Sub', id: 'Pendukung' }, note: { en: 'front end', id: 'front end' }, items: ['JavaScript', 'Next.js', 'React.js', 'Node.js'] },
  { key: 'tools', color: 'teal', label: { en: 'Tools', id: 'Tools' }, note: { en: 'ship & operate', id: 'rilis & operasi' }, items: ['Docker', 'Docker Compose', 'GitHub Actions', 'GHCR', 'Git'] },
  { key: 'db', color: 'gold', label: { en: 'Database', id: 'Database' }, note: { en: 'data layer', id: 'lapisan data' }, items: ['PostgreSQL', 'MySQL', 'SQL', 'Redis'] },
  { key: 'passive', color: 'ok', label: { en: 'Passive', id: 'Pasif' }, note: { en: 'how I work', id: 'cara kerja' },
    items: [
      { en: 'Full ownership', id: 'Full ownership' },
      { en: 'Adaptable', id: 'Adaptif' },
      { en: 'AI-assisted learning', id: 'Belajar dibantu AI' },
      { en: 'Security-minded', id: 'Peduli keamanan' }
    ] }
];
