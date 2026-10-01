// Quests (proyek). Teks kartu = summary; pop-up = objective / strategy / reward.
// type: client | own | institution | learning · classes: be | fe | fs | devops
export const projects = [
  {
    slug: 'marketplace',
    code: 'Q.01',
    type: 'client',
    classes: ['fs', 'devops'],
    tier: 'epic',
    icon: 'quests',
    title: { en: 'Company Profile & Marketplace Platform', id: 'Platform Company Profile & Marketplace' },
    meta: { en: 'Client project · Freelance', id: 'Proyek klien · Freelance' },
    summary: {
      en: 'A company profile blended with a semi-marketplace: visitors browse the catalog, order, and manage subscriptions from a client dashboard.',
      id: 'Company profile yang digabung dengan semi-marketplace: pengunjung menjelajah katalog, memesan, dan mengelola langganan dari client dashboard.'
    },
    objective: {
      en: 'The client needed more than a static company profile — customers had to be able to browse products, place orders, and manage their subscriptions in one place.',
      id: 'Klien butuh lebih dari company profile statis — pelanggan harus bisa melihat produk, memesan, dan mengelola langganan di satu tempat.'
    },
    strategy: {
      en: 'Built a Next.js/React front end with an integrated client dashboard, backed by a REST API with JWT authentication. Shipped through CI/CD (GitHub Actions + GHCR) onto Docker Compose with PostgreSQL.',
      id: 'Membangun front end Next.js/React dengan client dashboard terintegrasi, didukung REST API berautentikasi JWT. Dirilis lewat CI/CD (GitHub Actions + GHCR) ke Docker Compose dengan PostgreSQL.'
    },
    reward: {
      en: 'One platform for catalog, ordering, and subscriptions, with automated, repeatable deployments.',
      id: 'Satu platform untuk katalog, pemesanan, dan langganan, dengan deployment otomatis yang bisa diulang.'
    },
    stack: ['Next.js', 'React.js', 'REST API', 'JWT', 'Docker', 'PostgreSQL'],
    flow: ['Next.js UI', 'REST API · JWT', 'PostgreSQL'],
    links: { live: null, repo: null },
    internal: false
  },
  {
    slug: 'company-profile',
    code: 'Q.02',
    type: 'client',
    classes: ['fe', 'devops'],
    tier: 'rare',
    icon: 'stats',
    title: { en: 'High-Performance Company Profile', id: 'Company Profile Berperforma Tinggi' },
    meta: { en: 'Client project · Freelance', id: 'Proyek klien · Freelance' },
    summary: {
      en: 'A Next.js company profile tuned for load speed and SEO, with a separate admin dashboard on its own container.',
      id: 'Company profile Next.js yang dioptimalkan untuk kecepatan muat dan SEO, dengan admin dashboard terpisah di container sendiri.'
    },
    objective: {
      en: 'Deliver a fast, search-friendly public site while keeping content management isolated and safe to deploy.',
      id: 'Menghadirkan situs publik yang cepat dan ramah mesin pencari, sambil menjaga pengelolaan konten tetap terpisah dan aman di-deploy.'
    },
    strategy: {
      en: 'A decoupled multi-repo architecture (public site + admin dashboard), each in its own Docker container with PostgreSQL, linked over an internal Docker network. GitHub Actions builds images to GHCR; the server only pulls once a build succeeds.',
      id: 'Arsitektur multi-repo terpisah (situs publik + admin dashboard), masing-masing di container Docker dengan PostgreSQL, terhubung lewat internal Docker network. GitHub Actions membangun image ke GHCR; server hanya menarik image setelah build sukses.'
    },
    reward: {
      en: 'Fast pages, SEO-ready markup, and deployments that never ship a broken build.',
      id: 'Halaman cepat, markup siap SEO, dan deployment yang tidak pernah merilis build rusak.'
    },
    stack: ['Next.js', 'React.js', 'Docker', 'CI/CD', 'GHCR', 'SEO'],
    flow: ['GitHub Actions', 'GHCR image', 'Server pull'],
    links: { live: null, repo: null },
    internal: false
  },
  {
    slug: 'neofeeder',
    code: 'Q.03',
    type: 'institution',
    classes: ['be', 'fs'],
    tier: 'legendary',
    icon: 'skill-tree',
    title: { en: 'NeoFeeder Dikti Integrator', id: 'Integrator Sistem NeoFeeder Dikti' },
    meta: { en: 'Universitas PGRI Adi Buana Surabaya', id: 'Universitas PGRI Adi Buana Surabaya' },
    summary: {
      en: 'An information system that reports higher-education data to Dikti through mapped NeoFeeder API endpoints.',
      id: 'Sistem informasi untuk pelaporan data pendidikan tinggi ke Dikti lewat endpoint API NeoFeeder yang sudah dipetakan.'
    },
    objective: {
      en: 'Reporting academic data to Dikti was error-prone and deadline-sensitive.',
      id: 'Pelaporan data akademik ke Dikti rawan salah dan dikejar tenggat.'
    },
    strategy: {
      en: 'Mapped Dikti\'s API endpoints to menus and features. Admins open the relevant menu, filter local and NeoFeeder data side by side, and submit the report directly.',
      id: 'Memetakan endpoint API Dikti ke menu dan fitur. Admin cukup membuka menu terkait, menyaring data lokal dan NeoFeeder berdampingan, lalu mengirim laporan langsung.'
    },
    reward: {
      en: 'Fewer data errors and on-time submissions.',
      id: 'Kesalahan data berkurang dan laporan terkirim tepat waktu.'
    },
    stack: ['PHP', 'Laravel', 'API Integration'],
    flow: ['Campus DB', 'Integrator', 'NeoFeeder API'],
    links: { live: null, repo: null },
    internal: true
  },
  {
    slug: 'go-rest-api',
    code: 'Q.04',
    type: 'own',
    classes: ['be'],
    tier: 'epic',
    icon: 'commissions',
    building: true,
    title: { en: 'Go REST API — Clean Architecture', id: 'REST API Go — Clean Architecture' },
    meta: { en: 'Own product · Learning in public', id: 'Produk sendiri · Belajar terbuka' },
    summary: {
      en: 'A layered Go API (Handler → Service → Repository) applying Clean Architecture & DDD, with dual-token JWT auth.',
      id: 'API Go berlapis (Handler → Service → Repository) dengan Clean Architecture & DDD, dan autentikasi JWT dual-token.'
    },
    objective: {
      en: 'Grow from PHP into Go by building a production-shaped API from scratch.',
      id: 'Berkembang dari PHP ke Go dengan membangun API berstandar produksi dari nol.'
    },
    strategy: {
      en: 'Chi router, PostgreSQL via pgxpool, type-safe queries with sqlc, config and logging with Viper and Zerolog. Dual-token JWT (RS256) with a Redis denylist, containerized with Docker Compose and a structured Git Flow.',
      id: 'Chi router, PostgreSQL via pgxpool, query type-safe dengan sqlc, konfigurasi dan logging dengan Viper dan Zerolog. JWT dual-token (RS256) dengan Redis denylist, dikemas Docker Compose dan alur Git Flow.'
    },
    reward: {
      en: 'A clean, testable codebase that serves as my Go reference architecture.',
      id: 'Codebase rapi dan mudah diuji yang menjadi arsitektur acuan Go saya.'
    },
    stack: ['Go', 'Chi', 'pgx', 'sqlc', 'JWT', 'Redis', 'Docker'],
    flow: ['Handler', 'Service', 'Repository'],
    links: { live: null, repo: null },
    internal: false
  },
  {
    slug: 'spmi',
    code: 'Q.05',
    type: 'institution',
    classes: ['fs'],
    tier: 'rare',
    icon: 'achievements',
    title: { en: 'Internal Quality Assurance System (SPMI)', id: 'Sistem Penjaminan Mutu Internal (SPMI)' },
    meta: { en: 'Institutional system', id: 'Sistem institusi' },
    summary: {
      en: 'A Laravel platform for internal quality assurance: managing quality standards and scoring them through assigned reviewers.',
      id: 'Platform Laravel untuk penjaminan mutu internal: mengelola standar mutu dan menilainya lewat reviewer yang ditugaskan.'
    },
    objective: {
      en: 'Quality standards had to be managed in a structured way and assessed objectively.',
      id: 'Standar mutu perlu dikelola terstruktur dan dinilai secara objektif.'
    },
    strategy: {
      en: 'Two core modules — quality management and quality assessment. Each standard is scored by assigned reviewers, and every score is documented.',
      id: 'Dua modul inti — manajemen mutu dan penilaian mutu. Setiap standar dinilai reviewer yang ditugaskan, dan setiap nilai terdokumentasi.'
    },
    reward: {
      en: 'Accountable, documented assessments that feed continuous improvement.',
      id: 'Penilaian yang akuntabel dan terdokumentasi sebagai dasar perbaikan berkelanjutan.'
    },
    stack: ['PHP', 'Laravel', 'PostgreSQL'],
    flow: ['Standards', 'Reviewer scoring', 'Reports'],
    links: { live: null, repo: null },
    internal: true
  }
];
