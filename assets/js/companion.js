/* Pixel companion "Arsya"
   Karakter pixel yang hidup di bawah layar. Frame & indeks animasi dibuat oleh
   tools/sprite/extract.py + build_sheet.py (assets/img/companion/arsya-sheet.png + assets/js/companion-frames.js).

   Perilaku:
   - aktivitas acak: jalan (menoleh sesuai arah), diam & bernapas, berpikir, bingung, peregangan,
     minum kopi, membaca, duduk, ngoding, melambai
   - baru dibuka (setelah layar boot) -> melambai & memperkenalkan diri (beberapa kalimat berurutan)
   - scroll -> menjelaskan singkat section yang sedang di tengah layar (sambil terbang pun tetap bicara)
   - klik  -> tertawa kegelian (klik terus -> marah)
   - seret -> diangkat: marah & meronta; lepas -> jatuh, pusing, lalu menangis
   - saat terbang ber-jetpack: klik -> tertawa sambil tetap melayang; seret -> bergoyang tergantung di gagang
     jetpack; lepas -> jatuh sebentar, jetpack menyala lagi, oleng, lalu melayang lagi (tidak jatuh & menangis)
   - tidak ada aktivitas 35 detik -> tidur berbaring; ada aktivitas -> bangun kaget & bingung
   - ganti arah jalan -> berbalik (3/4 -> depan -> 3/4 dicerminkan), tidak langsung dicerminkan
   - lantai hero hilang saat scroll -> pasang jetpack & melayang di tengah layar;
     lantai footer / hero muncul -> mendarat & lepas jetpack (ke hero: lalu melompat kecil) */
(() => {
  const root = document.getElementById('buddy');
  const DATA = window.ARSYA_FRAMES;
  if (!root || !DATA) return;
  const sprite = document.getElementById('buddySprite');
  const bubble = document.getElementById('buddyBubble');
  const mark = document.getElementById('buddyMark');
  const hideBtn = document.getElementById('buddyHide');
  const showBtn = document.getElementById('buddyShow');

  const FW = DATA.frameWidth, FH = DATA.frameHeight, ANIMS = DATA.anims;
  const COLS = DATA.cols || DATA.count, ROWS = DATA.rows || 1;   // sheet berbentuk grid
  const WALK_SPEED = 50;          // piksel sprite / detik ~ 3 langkah x 15px per siklus 8 frame @ 9fps

  const LINES = {
    en: {
      greet: ['Hi! 👋 Thanks for dropping by!'],
      tickle: ['Hehe, that tickles! 🤭', 'Ahaha stop it!', 'Hihi, I\'m ticklish!'],
      angry: ['Hey, enough already! 😤', 'Stop poking me! 💢'],
      lift: ['Put me down! 😠', 'Hey! Let go of me!', 'Nooo, put me down!'],
      jetLift: ['Whoa, careful with the handle! 😳', 'Where are you taking me? 😅', 'Hey, I can fly on my own!'],
      jetDrop: ['Whoa— jetpack on! 🚀', 'Phew, caught myself! 😮‍💨'],
      fall: ['Aaaah! 😱'],
      cry: ['Waaah… that hurt 😭', 'Huhuu… my back 😭'],
      sniff: ['*sniff* I\'m okay now…', 'I\'ll be fine… 🥲'],
      wake: ['Huh?! I wasn\'t sleeping! 😳', 'W-what? Oh, you\'re back!'],
      think: ['Hmm… 🤔', 'Let me think…', 'How should I build this…'],
      confused: ['Wait, what? 😅', 'Huh? Where was I…'],
      coding: ['Coding away… 💻', 'Fixing one last bug…'],
      codingMad: ['What\'s missing in this code? 😤', 'Why won\'t this work?! 😤'],
      coffee: ['Coffee break ☕'],
      coffeeTalk: ['My whole portfolio is right here 😄', 'Feel free to look around my projects ☕',
                   'Everything I\'ve built is on this page 😄'],
      read: ['Reading docs 📖'],
      wave: ['Hello there! 👋'],
      intro: ['Hi! 👋 I\'m Arsya — Muhammad Imam Arsyawalfa.',
              'A Software Engineer & Fullstack Web Developer with 6+ years of building web apps.',
              'Scroll down — I\'ll walk you through each section! 👇'],
      sec: {
        home: 'Back to the top — my quick intro & profile 🙂',
        stats: '6+ years of work and 10+ systems built 📊',
        about: 'About: a short story of who I am and how I work 🙂',
        skills: 'Skills: the tech stack I use every day 🛠️',
        quests: 'Projects I\'ve built. Click one for the details 👇',
        commissions: 'The kinds of apps I can build for you 💼',
        journey: 'Experience: my work journey from 2018 until now 🗺️',
        achievements: 'My certifications, IP rights & education 🏆',
        party: 'Want to work together? Details are here 🤝',
        contact: 'Send me a message or reach me through these channels ✉️'
      }
    },
    id: {
      greet: ['Halo! 👋 Makasih sudah berkunjung!'],
      tickle: ['Hehe, geli! 🤭', 'Ahaha udah dong!', 'Hihi, aku gelian!'],
      angry: ['Udah ah, jangan colek terus! 😤', 'Berhenti nyolek! 💢'],
      lift: ['Turunin aku! 😠', 'Heh! Lepasin aku!', 'Huaa, turunin!'],
      jetLift: ['Eh, pegang gagangnya pelan-pelan! 😳', 'Mau dibawa ke mana aku? 😅', 'Heh, aku bisa terbang sendiri!'],
      jetDrop: ['Waa— nyalakan jetpack! 🚀', 'Fiuh, hampir jatuh! 😮‍💨'],
      fall: ['Aaaaa! 😱'],
      cry: ['Huwaaa… sakit 😭', 'Huhuu… punggungku 😭'],
      sniff: ['*hiks* udah gapapa kok…', 'Aku baik-baik aja… 🥲'],
      wake: ['Eh?! Aku gak tidur kok! 😳', 'H-hah? Oh, kamu balik!'],
      think: ['Hmm… 🤔', 'Bentar, aku mikir dulu…', 'Enaknya dibangun gimana ya…'],
      confused: ['Lho, kok? 😅', 'Eh? Tadi aku ngapain ya…'],
      coding: ['Ngoding dulu… 💻', 'Benerin bug terakhir…'],
      codingMad: ['Ini kurang apa ya di code? 😤', 'Kok error terus sih?! 😤'],
      coffee: ['Ngopi dulu ☕'],
      coffeeTalk: ['Portofolio saya semuanya ada di sini 😄', 'Silakan lihat-lihat proyek saya ☕',
                   'Semua yang saya bangun ada di halaman ini 😄'],
      read: ['Baca dokumentasi dulu 📖'],
      wave: ['Haii! 👋'],
      intro: ['Halo! 👋 Aku Arsya — Muhammad Imam Arsyawalfa.',
              'Aku Software Engineer & Fullstack Web Developer, 6+ tahun membangun aplikasi web.',
              'Scroll ke bawah, nanti aku jelasin tiap bagiannya! 👇'],
      sec: {
        home: 'Balik ke atas — perkenalan & profil singkatku 🙂',
        stats: '6+ tahun berkarya & 10+ sistem dibangun 📊',
        about: 'Tentang: cerita singkat siapa aku & cara kerjaku 🙂',
        skills: 'Keahlian: tech stack yang aku pakai sehari-hari 🛠️',
        quests: 'Proyek yang pernah aku bangun. Klik untuk detailnya 👇',
        commissions: 'Jenis aplikasi yang bisa aku buatkan untukmu 💼',
        journey: 'Pengalaman: perjalanan kerjaku dari 2018 sampai sekarang 🗺️',
        achievements: 'Sertifikasi, HAKI & pendidikanku 🏆',
        party: 'Mau kerja bareng? Detailnya ada di sini 🤝',
        contact: 'Kirim pesan atau hubungi aku lewat kanal ini ya ✉️'
      }
    }
  };

  /* state: animasi, fps, durasi (ms, [min,max]), tanda di atas kepala.
     intro = urutan pembuka (mis. jongkok & ambil barang), outro = kebalikannya (taruh barang, berdiri) */
  const STATES = {
    idle:      { anim: 'idle', fps: 4 },
    walk:      { anim: 'walk', fps: 9 },
    wave:      { anim: 'wave', fps: 6, dur: [1800, 2200] },
    happy:     { anim: 'happy', fps: 3, dur: [1200, 1400] },
    tickle:    { anim: 'tickle', fps: 6, dur: [1500, 1700] },
    angry:     { anim: 'angry', fps: 2.5, dur: [2400, 2800], mark: '💢' },
    surprised: { anim: 'surprised', fps: 1, dur: [700, 800], mark: '❗' },
    think:     { anim: 'think', fps: 1.2, dur: [4000, 6000], mark: '💡' },
    confused:  { anim: 'confused', fps: 1.5, dur: [2500, 3200], mark: '❓' },
    point:     { anim: 'point', fps: 2.5, dur: [3000, 3400], intro: ['point_in'], introFps: 4, outro: true },
    coffee:    { anim: 'coffee', fps: 4, dur: [6000, 9000], intro: ['coffee_in'], introFps: 4, outro: ['coffee_out'],
                 cue: { frame: 6, say: 'coffeeTalk', ms: 3000 } },   // frame 6 = mulai mengobrol
    read:      { anim: 'read', fps: 0.8, dur: [6000, 9000], intro: ['read_in'], introFps: 3, outro: true },
    coding:    { anim: 'coding', fps: 8, dur: [9000, 14000], intro: ['coding_in'], introFps: 3, outro: ['coding_out'],
                 beat: { anim: 'coding_mad', fps: 9, every: [4000, 7000], dur: 2200, say: 'codingMad' } },
    sleep:     { anim: 'sleep', fps: 3, intro: ['lie_down'], introFps: 5 },
    // bangun: terduduk kaget, lempar bantal, berdiri; kalimat "aku gak tidur" saat menggaruk kepala (frame 8)
    wake:      { anim: 'wake_up', fps: 6, dur: [3000, 3050], loop: false, cue: { frame: 8, say: 'wake', ms: 2600 } },
    drag:      { anim: 'lift', fps: 10 },
    fall:      { anim: 'fall', fps: 10, loop: false },
    land:      { anim: 'land', fps: 6, dur: [330, 360], loop: false },
    hurt:      { anim: 'hurt', fps: 2.5, dur: [1600, 1700], loop: false },
    getup:     { anim: 'getup', fps: 7, dur: [1400, 1450], loop: false },
    cry:       { anim: 'cry', fps: 3, dur: [3200, 3600] }
  };

  /* aktivitas acak saat tidak diganggu (bobot) */
  const ACTIVITIES = [
    ['walk', 32], ['idle', 14], ['think', 9], ['confused', 4], ['coffee', 10],
    ['read', 10], ['coding', 13], ['wave', 5]
  ];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const lang = () => (document.documentElement.lang === 'en' ? 'en' : 'id');
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------- ukuran & posisi ---------- */
  let S = 2, W = FW * S, H = FH * S;
  let x = 24, y = 0, floorY = 0;
  let onRoad, dropping = false;                                       // lantai: jalan di gambar hero atau dasar layar
  let crouchUntil = 0, landUntil = 0, launchAt = 0, landAt = 0;      // ancang-ancang / mendarat (frame lompat)
  let slipping = false;                                               // jatuh kaget dari jalan (frame slip)
  let jet = null;                                                     // terbang ber-jetpack: { phase: 'on'|'fly'|'off', at, hop }

  /* lantai = lantai piksel hero / footer (window.ARSYA_FLOOR dari main.js, posisi telapak kaki di viewport)
     selama lantai itu terlihat; selain itu dasar layar (di sana Arsya melayang dengan jetpack) */
  const baseFloor = () => window.innerHeight - H - 2;
  function surface() {
    const feet = typeof window.ARSYA_FLOOR === 'function' ? window.ARSYA_FLOOR() : null;
    const c = feet == null ? null : feet - H;
    return c != null && c >= 8 && c <= baseFloor() ? { y: c, road: true } : { y: baseFloor(), road: false };
  }

  function measure() {
    S = window.matchMedia('(max-width:1024px)').matches ? 1.5 : 2;
    W = FW * S; H = FH * S;
    root.style.setProperty('--bs', S);
    floorY = surface().y;
    x = Math.min(Math.max(minX(), x), maxX());
    if (state !== 'drag' && state !== 'fall') y = floorY;
    place();
  }
  const minX = () => -FW * S * 0.25;                                  // frame punya ruang kosong di sisi
  const maxX = () => Math.max(minX(), window.innerWidth - W - 56);   // sisakan ruang tombol "ke atas"
  function place() {
    root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    const left = x + W / 2 > window.innerWidth / 2;
    root.classList.toggle('bubble-left', left);
    // gelembung tetap di dalam layar walau karakter sebagian di luar (mis. saat masuk dari tepi)
    const nudge = left ? Math.min(0, window.innerWidth - 8 - (x + W - 22 * S)) : Math.max(0, 8 - (x + 22 * S));
    bubble.style.translate = nudge ? `${Math.round(nudge)}px 0` : '';
  }

  /* ---------- pemutar animasi ---------- */
  let list = ANIMS.idle, animFps = 1, frameI = 0, frameT = 0, loop = true, override = null, overrideI = 0;
  let pose = null;                                 // frame lompat / berbalik yang menimpa animasi state
  const seq = (names, reverse) => {
    const l = [].concat(...names.map((n) => ANIMS[n]));
    return reverse ? l.reverse() : l;
  };
  function playList(frames, fps, looping = true) {
    list = frames; animFps = fps; loop = looping; frameI = 0; frameT = 0;
    render();
  }
  function render() {
    let f;
    if (pose != null) {
      f = pose;
    } else if (override) {
      const o = ANIMS[override];
      f = o[overrideI % o.length];
    } else {
      f = list[loop ? frameI % list.length : Math.min(frameI, list.length - 1)];
    }
    sprite.style.backgroundPosition = `${-(f % COLS) * W}px ${-Math.floor(f / COLS) * H}px`;
  }
  function setPose(f) {
    if (f === pose) return;
    pose = f; render();
  }
  /* frame lompat (jump: 1 ancang-ancang, 2 menolak, 3 naik, 4 puncak, 5 turun, 6 mendarat) dari kecepatan vertikal */
  const JUMP = ANIMS.jump, SLIP = ANIMS.slip;
  /* jatuh kaget: slip = [kehilangan pijakan, melayang, melayang, mendarat jongkok, lega] */
  function airPose(now) {
    const t = now - launchAt;
    if (slipping) return t < 150 ? SLIP[0] : SLIP[1 + (Math.floor(t / 110) % 2)];
    return t < 110 ? JUMP[1] : vy < -300 ? JUMP[2] : vy < 250 ? JUMP[3] : JUMP[4];
  }
  function stopJump() {
    dropping = slipping = false; crouchUntil = landUntil = 0; vy = 0; jet = null;
    setPose(null);
  }

  /* jetpack: lantai hero hilang (scroll turun) -> pasang jetpack, terbang turun, melayang di dasar layar;
     lantai footer / hero muncul -> terbang ke sana, mendarat, lepas jetpack (dari bawah ke hero: lalu melompat).
     jet_on = [kencangkan tali, nyalakan, lepas landas], jet_hover/jet_up = 2 frame api berkedip */
  const JET_ON = ANIMS.jet_on, JET_HOVER = ANIMS.jet_hover, JET_DOWN = ANIMS.jet_down, JET_UP = ANIMS.jet_up, JET_OFF = ANIMS.jet_off;
  const JET_TALK = ANIMS.jet_talk;                      // melayang sambil bicara (mulut buka / bulat / tutup)
  /* diganggu saat terbang (jet.act): tickle = dicolek, tertawa (frame 5-6 diulang); recover = dilepas setelah
     diseret: frame 1-2 jatuh (api padam), 3-8 jetpack menyala lagi, oleng, stabil. jet_lift = diseret (loop) */
  const JET_TICKLE = ANIMS.jet_tickle, JET_LIFT = ANIMS.jet_lift, JET_RECOVER = ANIMS.jet_recover;
  const JET_ACTS = { tickle: [JET_TICKLE, [0, 1, 2, 3, 4, 5, 4, 5, 3, 6, 7]], recover: [JET_RECOVER, [0, 1, 2, 3, 4, 5, 4, 5, 6, 7]] };
  const JET_ACT_STEP = 140;
  const flying = () => jet && jet.phase !== 'off';
  const JET_ON_STEP = 140, JET_OFF_STEP = 210, JET_SPEED = 1100;
  const hoverY = (now) =>                               // melayang di tengah layar, naik-turun pelan
    Math.min(baseFloor(), Math.max(8, Math.round(window.innerHeight / 2 - H / 2 + Math.sin(now / 450) * 2 * S)));
  function startJet(now, wearing) {
    if (!['idle', 'walk'].includes(state)) setState('idle', rand(1500, 2500));
    stopJump();
    jet = { phase: wearing ? 'fly' : 'on', at: now, hop: false };
  }
  function stepJet(now, dt, surf) {
    const t = now - jet.at;
    if (jet.phase === 'on') {                           // memasang jetpack di tempat (tetap di dalam layar)
      y = Math.min(Math.max(y, 8), baseFloor());
      setPose(JET_ON[Math.min(JET_ON.length - 1, Math.floor(t / JET_ON_STEP))]);
      if (t >= JET_ON.length * JET_ON_STEP) { jet.phase = 'fly'; jet.at = now; }
    } else if (jet.phase === 'fly') {
      const act = jet.act, ta = act ? now - act.at : 0;
      if (act && act.kind === 'recover' && ta < 2 * JET_ACT_STEP) {   // baru dilepas: jatuh sebentar, api padam
        act.vy = (act.vy || 0) + 1800 * S * dt;
        y = Math.min(y + act.vy * dt, baseFloor());
        setPose(JET_RECOVER[Math.floor(ta / JET_ACT_STEP)]);
        floorY = y; place();
        return;
      }
      const goal = surf.road ? surf.y : hoverY(now);
      const d = goal - y;
      if (surf.road && Math.abs(d) < 3) {               // mendarat di lantai: lepas jetpack
        y = goal;
        jet.phase = 'off'; jet.at = now; jet.act = null;
        setPose(JET_OFF[0]);
      } else {
        const v = Math.sign(d) * Math.min(JET_SPEED, Math.max(140, Math.abs(d) * 5));
        y += Math.abs(v * dt) > Math.abs(d) ? d : v * dt;
        const flick = Math.floor(t / 90) % 2;
        if (d < -6 * S) jet.hop = surf.road;                 // terbang naik ke lantai: setelah lepas jetpack melompat
        const hover = now < talkUntil ? JET_TALK[Math.floor(t / 90) % JET_TALK.length] : JET_HOVER[flick];
        let f = d > 6 * S ? JET_DOWN[0] : d < -6 * S ? JET_UP[flick] : hover;
        if (act) {                                      // dicolek / baru pulih: animasinya menimpa pose terbang
          const [frames, order] = JET_ACTS[act.kind], i = Math.floor(ta / JET_ACT_STEP);
          if (i < order.length) f = frames[order[i]]; else jet.act = null;
        }
        setPose(f);
      }
    } else {                                            // 'off': berdiri di lantai, jetpack dilepas
      if (!surf.road) { jet.phase = 'fly'; jet.at = now; return; }   // lantai hilang lagi: terbang lagi
      y = surf.y;
      const i = Math.floor(t / JET_OFF_STEP);
      if (i < JET_OFF.length) setPose(JET_OFF[i]);
      else {
        const hop = jet.hop;
        jet = null; setPose(null);
        if (hop) { crouchUntil = now + 150; setPose(JUMP[0]); }   // lompat kecil lega setelah sampai di hero
      }
    }
    floorY = y;
    place();
  }

  /* berbalik arah: turn = [3/4 menghadap kanan, depan]; sisi kiri memakai frame 3/4 yang dicerminkan */
  const TURN = ANIMS.turn, TURN_STEP = 85;
  let faceLeft = false, turnSteps = null, turnAt = 0;
  const showFace = (left) => root.classList.toggle('face-left', left);
  function face(left, animate = true) {
    if (left === faceLeft && (animate || !turnSteps)) return;
    faceLeft = left;
    if (!animate || turnSteps || pose != null || dropping || crouchUntil || landUntil || root.hidden) {
      if (turnSteps) { turnSteps = null; setPose(null); }
      showFace(left);
      return;
    }
    turnSteps = [[TURN[0], !left], [TURN[1], false], [TURN[0], left]];
    turnAt = performance.now();
    stepTurn(turnAt);
  }
  function stepTurn(now) {
    const i = Math.floor((now - turnAt) / TURN_STEP);
    if (i >= turnSteps.length) { turnSteps = null; setPose(null); showFace(faceLeft); return; }
    showFace(turnSteps[i][1]);
    setPose(turnSteps[i][0]);
  }

  /* tampilkan frame lain sebentar (kedip / bicara) tanpa mengganggu animasi utama */
  let overrideTimer = null;
  function flash(name, ms) {
    override = name; overrideI++; render();
    clearTimeout(overrideTimer);
    overrideTimer = setTimeout(() => { override = null; render(); }, ms);
  }

  /* ---------- balon dialog & tanda ---------- */
  let bubbleTimer = null, talkUntil = 0;
  function say(key, ms = 3000) {
    const text = LINES.en[key] ? pick(LINES[lang()][key]) : key;
    bubble.textContent = text;
    bubble.classList.add('show');
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(() => bubble.classList.remove('show'), ms);
    talkUntil = performance.now() + Math.min(3200, 180 + text.length * 40);
  }
  /* beberapa kalimat berurutan (perkenalan); dibatalkan bila ada kalimat lain (mis. narasi section) */
  let chain = [];
  function stopChain() { chain.forEach(clearTimeout); chain = []; }
  function sayChain(texts, gap) {
    stopChain();
    texts.forEach((txt, i) => chain.push(setTimeout(() => {
      holdUntil = Math.max(holdUntil, performance.now() + gap);
      say(txt, i === texts.length - 1 ? gap + 1200 : gap + 200);
    }, i * gap)));
  }
  function setMark(m) {
    mark.textContent = m || '';
    mark.classList.toggle('show', !!m);
  }

  /* ---------- mesin perilaku ---------- */
  let state = 'idle', stateEnd = 0, targetX = 0, vy = 0, nextBlink = 0;
  let phase = 'main', phaseEnd = 0, pendingDur = 0;
  let beatAt = 0, beatEnd = 0;                       // momen sisipan selama aktivitas (mis. kesal saat ngoding)
  let lastInput = performance.now();
  let holdUntil = 0;                                 // sedang menjelaskan: diam di tempat (tanpa aktivitas acak)
  const SLEEP_AFTER = 35000;

  function setState(s, ms) {
    const cfg = STATES[s];
    state = s;
    const dur = ms != null ? ms : (cfg.dur ? rand(cfg.dur[0], cfg.dur[1]) : 0);
    root.classList.remove('sleeping');
    if (s !== 'walk') face(false, !['drag', 'fall', 'land', 'hurt', 'getup', 'cry', 'sleep'].includes(s));
    override = null;
    setMark(null);
    stateEnd = 0;
    beatAt = beatEnd = 0;
    if (cfg.intro) {                                   // urutan pembuka dulu
      const frames = seq(cfg.intro);
      const fps = cfg.introFps || 4;
      phase = 'intro';
      pendingDur = dur;
      phaseEnd = performance.now() + frames.length / fps * 1000;
      playList(frames, fps, false);
    } else startMain(dur);
  }
  function startMain(dur) {
    const cfg = STATES[state];
    phase = 'main';
    stateEnd = dur ? performance.now() + dur : 0;
    root.classList.toggle('sleeping', state === 'sleep');
    setMark(cfg.mark);
    playList(ANIMS[cfg.anim], cfg.fps, cfg.loop !== false);
    beatEnd = 0;
    beatAt = cfg.beat ? performance.now() + rand(cfg.beat.every[0], cfg.beat.every[1]) : 0;
  }
  function updateBeat(now) {
    const cfg = STATES[state];
    if (!cfg.beat || phase !== 'main') return;
    if (beatEnd && now > beatEnd) {                  // kembali ke animasi utama
      beatEnd = 0;
      beatAt = now + rand(cfg.beat.every[0], cfg.beat.every[1]);
      playList(ANIMS[cfg.anim], cfg.fps);
    } else if (!beatEnd && beatAt && now > beatAt && (!stateEnd || stateEnd - now > cfg.beat.dur + 500)) {
      beatEnd = now + cfg.beat.dur;
      playList(ANIMS[cfg.beat.anim], cfg.beat.fps);
      if (cfg.beat.say) say(cfg.beat.say, cfg.beat.dur + 400);
    }
  }
  function finishState() {
    const cfg = STATES[state];
    if (phase === 'main' && cfg.outro && cfg.intro) {   // taruh barang / berdiri
      // outro: daftar animasi sendiri, atau (outro: true) kebalikan dari intro
      const frames = Array.isArray(cfg.outro) ? seq(cfg.outro) : seq(cfg.intro, true);
      const fps = cfg.introFps || 4;
      phase = 'outro';
      stateEnd = 0;
      setMark(null);
      phaseEnd = performance.now() + frames.length / fps * 1000;
      playList(frames, fps, false);
      return;
    }
    afterState();
  }

  function nextActivity() {
    const now = performance.now();
    if (now < holdUntil) { setState('idle', holdUntil - now); return; }   // biarkan selesai bicara
    if (jet) {                                          // terbang: melayang pindah di sisi kiri / kanan layar (konten di tengah)
      if (Math.random() < 0.5) {
        const side = Math.min(W * 0.7, (maxX() - minX()) / 2);
        targetX = Math.random() < 0.5 ? rand(minX(), minX() + side) : rand(maxX() - side, maxX());
        setState('walk');
      } else setState('idle', rand(2000, 4000));
      return;
    }
    const total = ACTIVITIES.reduce((n, a) => n + a[1], 0);
    let r = Math.random() * total, next = 'idle';
    for (const [name, w] of ACTIVITIES) { if ((r -= w) < 0) { next = name; break; } }
    if (next === 'walk') {
      targetX = rand(minX(), maxX());
      if (Math.abs(targetX - x) < 80) targetX = x > (minX() + maxX()) / 2 ? minX() + rand(0, 60) : maxX() - rand(0, 60);
      setState('walk');
      return;
    }
    if (next === 'idle') { setState('idle', rand(2500, 5000)); return; }
    setState(next);
    if (LINES.en[next] && Math.random() < 0.45) say(next);
  }

  /* apa yang terjadi setelah state berdurasi selesai */
  function afterState() {
    switch (state) {
      case 'land': setState('hurt'); break;
      case 'hurt': setState('getup'); break;
      case 'getup': setState('cry'); say('cry', 3200); break;
      case 'cry': setState('idle', 2500); say('sniff'); break;
      case 'surprised': setState('confused', 2200); break;
      case 'wake': setState('idle', 1500); break;
      case 'tickle': case 'angry': case 'happy': setState('idle', rand(1500, 2500)); break;
      default: nextActivity();
    }
  }

  let last = performance.now();
  function tick(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    frameT += dt;
    if (animFps > 0 && frameT >= 1 / animFps) {
      frameT = 0; frameI++;
      if (!override) render();
      const cue = STATES[state].cue;                    // kalimat yang muncul pas di frame tertentu
      if (cue && phase === 'main' && !beatEnd && frameI % list.length === cue.frame) say(cue.say, cue.ms);
    }

    // diam: bicara saat balon muncul, sesekali berkedip
    if (state === 'idle' && phase === 'main' && !override) {
      if (now < talkUntil) flash('talk', 90 + Math.random() * 80);
      else if (now > nextBlink) { flash('blink', 140); nextBlink = now + rand(2200, 5200); }
    }

    // ikuti lantai: menempel saat jalan bergeser karena scroll, jatuh/melompat saat lantai berganti
    const surf = surface();
    if (state === 'drag' && flying()) {               // diseret saat terbang: bergoyang di gagang jetpack
      setPose(JET_LIFT[Math.floor(now / (animFps > 12 ? 80 : 125)) % JET_LIFT.length]);
    } else if (state === 'drag' || state === 'fall') {
      if (jet) { jet = null; setPose(null); }
      floorY = surf.y;
    } else if (jet) {
      stepJet(now, dt, surf);
    } else if (crouchUntil) {                         // ancang-ancang, lalu menolak ke jalan
      if (now >= crouchUntil) {
        crouchUntil = 0; dropping = true; launchAt = now;
        floorY = surf.y;
        vy = -Math.sqrt(2 * 2600 * (Math.max(0, y - floorY) + 40));   // puncak 40px di atas lantai
      }
    } else if (dropping) {
      floorY = surf.y;
      vy += 2600 * dt;
      y += vy * dt;
      setPose(airPose(now));
      if (vy > 0 && y >= floorY) {                    // mendarat jongkok sebentar (jatuh kaget: lalu lega)
        y = floorY; vy = 0; dropping = false; landAt = now;
        landUntil = now + (slipping ? 1000 : 180);
        setPose(slipping ? SLIP[3] : JUMP[5]);
      }
      place();
    } else if (onRoad !== undefined && surf.road !== onRoad && !root.hidden) {
      face(faceLeft, false);                          // batalkan berbalik yang sedang berjalan
      startJet(now, false);                           // lantai berganti: pasang jetpack lalu terbang
    } else if (y !== surf.y) {
      floorY = y = surf.y;
      place();
    }
    onRoad = surf.road;
    if (landUntil && now >= landUntil) { landUntil = 0; slipping = false; setPose(null); }
    else if (landUntil && slipping && now - landAt > 280) setPose(SLIP[4]);
    if (turnSteps) stepTurn(now);

    if (state === 'walk' && !crouchUntil && !landUntil && (!jet || jet.phase === 'fly')) {
      const dir = Math.sign(targetX - x);
      if (dir) face(dir < 0);                        // frame jalan menghadap kanan, dicerminkan ke kiri
      if (!turnSteps) x += dir * WALK_SPEED * S * dt;   // sama dengan panjang langkah: kaki tidak meluncur
      if (dir === 0 || (dir > 0 && x >= targetX) || (dir < 0 && x <= targetX)) {
        x = targetX;
        setState('idle', rand(1200, 3000));
      }
      place();
    } else if (state === 'fall') {
      vy += 2600 * dt;
      y += vy * dt;
      if (y >= floorY) {
        y = floorY; vy = 0;
        root.classList.remove('land'); void root.offsetWidth; root.classList.add('land');
        setState('land');
      }
      place();
    }

    updateBeat(now);
    if (phase === 'intro' && now >= phaseEnd) startMain(pendingDur);
    else if (phase === 'outro' && now >= phaseEnd) afterState();
    else if (phase === 'main' && stateEnd && now > stateEnd) finishState();
    else if (phase === 'main' && state === 'idle' && !stateEnd) nextActivity();

    if (now - lastInput > SLEEP_AFTER && !['sleep', 'drag', 'fall', 'land', 'hurt', 'getup', 'cry'].includes(state)) {
      setState('sleep'); bubble.classList.remove('show');
    }
    requestAnimationFrame(tick);
  }

  /* ---------- input pengunjung ---------- */
  function onActivity() {
    lastInput = performance.now();
    if (state === 'sleep') setState('wake');
  }
  ['pointermove', 'keydown', 'scroll', 'touchstart'].forEach((ev) =>
    window.addEventListener(ev, onActivity, { passive: true }));

  /* klik = geli; tahan & geser = diangkat; lepas = jatuh */
  let press = null, pokes = [];
  sprite.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    lastInput = performance.now();
    press = { id: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - x, oy: e.clientY - y,
              moved: false, lx: e.clientX, ly: e.clientY, lt: performance.now() };
    sprite.setPointerCapture(e.pointerId);
  });
  sprite.addEventListener('pointermove', (e) => {
    if (!press || e.pointerId !== press.id) return;
    if (!press.moved && Math.hypot(e.clientX - press.sx, e.clientY - press.sy) > 6) {
      press.moved = true;
      root.classList.add('dragging');
      const keep = flying() ? jet : null;             // terbang: jetpack tetap terpasang
      stopJump();
      if (keep) { jet = keep; jet.phase = 'fly'; jet.act = null; }
      setState('drag'); say(keep ? 'jetLift' : 'lift', 2200);
      if (keep) setPose(JET_LIFT[0]);                 // langsung frame tergantung, tanpa sekilas frame meronta
    }
    if (press.moved) {
      const now = performance.now();
      const speed = Math.hypot(e.clientX - press.lx, e.clientY - press.ly) / Math.max(1, now - press.lt);
      press.lx = e.clientX; press.ly = e.clientY; press.lt = now;
      animFps = speed > 0.8 ? 16 : 10;               // makin diguncang, makin meronta
      x = Math.min(Math.max(minX(), e.clientX - press.ox), window.innerWidth - W * 0.8);
      y = Math.min(Math.max(-H * 0.2, e.clientY - press.oy), jet ? baseFloor() : floorY);
      place();
    }
  });
  function release(e) {
    if (!press || e.pointerId !== press.id) return;
    const moved = press.moved;
    press = null;
    root.classList.remove('dragging');
    if (moved && jet) {                              // dilepas saat terbang: jetpack menyala lagi, melayang
      jet.act = { kind: 'recover', at: performance.now() };
      jet.at = performance.now();
      setState('idle', rand(2000, 3000)); say('jetDrop', 2000);
    } else if (moved) {
      vy = 0;
      if (floorY - y < 12) { setState('land'); }    // dilepas dekat lantai: langsung mendarat
      else { setState('fall'); say('fall', 1200); }
    } else poke();
  }
  sprite.addEventListener('pointerup', release);
  sprite.addEventListener('pointercancel', release);
  sprite.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(); }
  });

  function poke() {
    if (state === 'sleep') { onActivity(); return; }
    if (['drag', 'fall', 'land', 'hurt', 'getup', 'cry'].includes(state)) return;
    const now = performance.now();
    if (flying()) {                                   // terbang: tertawa sambil tetap melayang
      if (jet.phase === 'on') { jet.phase = 'fly'; jet.at = now; }
      jet.act = { kind: 'tickle', at: now };
      setState('idle', 1800); say('tickle', 2000);
      return;
    }
    pokes = pokes.filter((t) => now - t < 3500);
    pokes.push(now);
    if (pokes.length >= 4) {                          // dicolek terus -> marah
      pokes = [];
      setState('angry'); say('angry');
      return;
    }
    setState('tickle'); say('tickle', 2200);
    root.classList.remove('jump'); void root.offsetWidth; root.classList.add('jump');
  }
  sprite.addEventListener('animationend', (e) => {
    if (e.animationName === 'buddyJump') root.classList.remove('jump');
    if (e.animationName === 'buddyLand') root.classList.remove('land');
  });

  /* narasi: section yang melintasi tengah layar dijelaskan singkat (saat terbang pakai frame bicara jetpack).
     Dicek berkala selama scroll; jeda minimal antarkalimat agar balon sempat terbaca.
     Panel bersebelahan (desktop) dijelaskan bergantian: yang baru saja dijelaskan dilewati */
  const SECTIONS = ['home', 'stats', 'about', 'skills', 'quests', 'commissions', 'journey', 'achievements', 'party', 'contact'];
  const NARRATE_GAP = 1600, NARRATE_MS = 4200;
  const quiet = ['sleep', 'wake', 'drag', 'fall', 'land', 'hurt', 'getup', 'cry', 'angry'];
  let spoken = null, recent = [], narrAt = 0, narrTimer = 0;
  function sectionAtCenter() {
    const h = window.innerHeight;                      // pita tengah layar (20%–60% tinggi)
    return SECTIONS.find((id) => {
      const el = document.getElementById(id);
      if (!el || recent.includes(id)) return false;
      const r = el.getBoundingClientRect();
      return r.top <= h * 0.6 && r.bottom >= h * 0.2;
    }) || null;
  }
  function narrate() {
    narrTimer = 0;
    if (root.hidden || quiet.includes(state)) return;
    const id = sectionAtCenter();
    if (!id) return;
    const now = performance.now(), wait = narrAt + NARRATE_GAP - now;
    if (wait > 0) { narrTimer = setTimeout(narrate, wait); return; }
    spoken = id; narrAt = now;
    recent = [id, ...recent].slice(0, 2);
    narrTimer = setTimeout(narrate, NARRATE_MS);       // panel sebelahnya (bila ada) setelah kalimat ini selesai
    stopChain();
    holdUntil = now + NARRATE_MS;
    if (!jet && state === 'walk') setState('idle', NARRATE_MS);   // berhenti dulu supaya terlihat bicara
    say(LINES[lang()].sec[id], NARRATE_MS);
  }
  window.addEventListener('scroll', () => {
    if (!narrTimer) narrTimer = setTimeout(narrate, 450);
  }, { passive: true });

  /* perkenalan saat halaman baru dibuka */
  function intro() {
    if (root.hidden) return;
    if (spoken && spoken !== 'home') return;          // sudah scroll jauh: narasi section yang jalan
    spoken = 'home'; recent = ['home'];
    if (!jet && ['idle', 'walk'].includes(state)) setState('wave', 2400);
    sayChain(LINES[lang()].intro, 3600);
  }

  /* sembunyikan / munculkan */
  function setHidden(h) {
    root.hidden = h;
    showBtn.hidden = !h;
    store.set('buddyHidden', h ? '1' : '0');
  }
  hideBtn.addEventListener('click', () => setHidden(true));
  showBtn.addEventListener('click', () => { setHidden(false); setState('wave'); say('greet'); });

  /* ---------- mulai ---------- */
  root.style.setProperty('--bc', COLS);
  root.style.setProperty('--br', ROWS);
  root.style.setProperty('--fw', FW);
  root.style.setProperty('--fh', FH);
  window.addEventListener('resize', measure);
  measure();
  x = -W;                                           // masuk berjalan dari kiri layar
  y = floorY;
  place();
  if (store.get('buddyHidden') === '1') setHidden(true);
  setState('walk');
  targetX = Math.min(40, maxX());
  setTimeout(intro, 1800);
  requestAnimationFrame((t) => { last = t; requestAnimationFrame(tick); });

  /* alat uji pengembang: ?buddy=<state> memaksa state tertentu (mis. ?buddy=cry) */
  const param = new URLSearchParams(location.search).get('buddy');
  const force = param === 'walkleft' ? 'walk' : param;          // walkleft = uji jalan ke kiri
  if (force && STATES[force]) {
    setTimeout(() => {
      x = param === 'walkleft' ? maxX() : 120; y = force === 'fall' ? 40 : floorY; place();
      setState(force, force === 'walk' || force === 'fall' ? undefined : 600000);
      if (force === 'walk') targetX = param === 'walkleft' ? minX() : maxX();
      if (LINES.en[force]) say(force, 600000);
    }, 2600);
  }
})();
