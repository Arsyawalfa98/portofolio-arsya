// Keahlian — kelompok + item (kartu Skills di section About).
export const skills = [
  { key: 'main', color: 'accent', label: { en: 'Core', id: 'Inti' }, note: { en: 'daily drivers', id: 'dipakai harian' }, items: ['Go', 'PHP', 'Laravel'] },
  { key: 'sub', color: 'violet', label: { en: 'Frontend', id: 'Frontend' }, note: { en: 'interfaces', id: 'antarmuka' }, items: ['JavaScript', 'Next.js', 'React.js', 'Node.js', 'HTML', 'CSS'] },
  { key: 'tools', color: 'teal', label: { en: 'Tools & DevOps', id: 'Tools & DevOps' }, note: { en: 'ship & operate', id: 'rilis & operasi' }, items: ['Docker', 'Docker Compose', 'GitHub Actions', 'GHCR', 'Git'] },
  { key: 'db', color: 'gold', label: { en: 'Database', id: 'Database' }, note: { en: 'data layer', id: 'lapisan data' }, items: ['PostgreSQL', 'MySQL', 'SQL', 'Redis'] },
  { key: 'passive', color: 'ok', label: { en: 'Ways of working', id: 'Cara kerja' }, note: { en: 'soft skills', id: 'soft skill' },
    items: [
      { en: 'Full ownership', id: 'Full ownership' },
      { en: 'Adaptable', id: 'Adaptif' },
      { en: 'AI-assisted learning', id: 'Belajar dibantu AI' },
      { en: 'Security-minded', id: 'Peduli keamanan' }
    ] }
];
