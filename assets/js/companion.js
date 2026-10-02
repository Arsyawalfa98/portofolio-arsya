/* Pixel companion "Arsya"
   Karakter pixel yang hidup di bawah layar. Frame & indeks animasi dibuat oleh
   tools/sprite/extract.py + build_sheet.py (assets/img/companion/arsya-sheet.png + assets/js/companion-frames.js).

   Perilaku:
   - aktivitas acak: jalan (menoleh sesuai arah), diam & bernapas, berpikir, bingung, peregangan,
     minum kopi, membaca, duduk, ngoding, melambai
   - section Quests / Skill Tree terlihat -> menunjuk ke arah konten sambil berkomentar
   - klik  -> tertawa kegelian (klik terus -> marah)
   - seret -> diangkat: marah & meronta; lepas -> jatuh, pusing, lalu menangis
   - tidak ada aktivitas 35 detik -> tidur berbaring; ada aktivitas -> bangun kaget & bingung
   - ganti arah jalan -> berbalik (3/4 -> depan -> 3/4 dicerminkan), tidak langsung dicerminkan
   - jalan hero muncul lagi saat scroll -> ancang-ancang & melompat ke jalan;
     jalan hilang -> terpeleset kaget, melayang, mendarat jongkok, lalu lega */
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
      projects: ['My projects are right here! 👇'],
      skills: ['This is my tech stack 🛠️'],
      contact: ['Let\'s work together! ✉️']
    },
    id: {
      greet: ['Halo! 👋 Makasih sudah berkunjung!'],
      tickle: ['Hehe, geli! 🤭', 'Ahaha udah dong!', 'Hihi, aku gelian!'],
      angry: ['Udah ah, jangan colek terus! 😤', 'Berhenti nyolek! 💢'],
      lift: ['Turunin aku! 😠', 'Heh! Lepasin aku!', 'Huaa, turunin!'],
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
      projects: ['Project-ku ada di sini! 👇'],
      skills: ['Ini tech stack aku 🛠️'],
      contact: ['Yuk kerja sama! ✉️']
    }
  };

  /* state: animasi, fps, durasi (ms, [min,max]), tanda di atas kepala.
     intro = urutan pembuka (mis. jongkok & ambil barang), outro = kebalikannya (taruh barang, berdiri) */
  const STATES = {
    idle:      { anim: 'idle', fps: 4 },
    walk:      { anim: 'walk', fps: 9 },
    wave:      { anim: 'wave', fps: 6, dur: [1800, 2200] },
    happy:     { anim: 'happy', fps: 3, dur: [1200, 1400] },
    tickle:    { anim: 'tickle', fps: 9, dur: [1500, 1700] },
    angry:     { anim: 'angry', fps: 2.5, dur: [2400, 2800], mark: '💢' },
    surprised: { anim: 'surprised', fps: 1, dur: [700, 800], mark: '❗' },
    think:     { anim: 'think', fps: 1.2, dur: [4000, 6000], mark: '💡' },
    confused:  { anim: 'confused', fps: 3, dur: [2500, 3200], mark: '❓' },
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
    cry:       { anim: 'cry', fps: 5, dur: [3200, 3600] }
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

  /* lantai = jalan pada latar hero (window.ARSYA_FLOOR dari main.js, posisi telapak kaki di viewport)
     selama jalan itu terlihat; selain itu dasar layar */
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
  const minX = () => -FW * S * 0.25;                                 // frame punya ruang kosong di sisi
  const maxX = () => Math.max(minX(), window.innerWidth - W - 56);    // sisakan ruang tombol "ke atas"
  function place() {
    root.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    root.classList.toggle('bubble-left', x + W / 2 > window.innerWidth / 2);
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
    dropping = slipping = false; crouchUntil = landUntil = 0; vy = 0;
    setPose(null);
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
    talkUntil = performance.now() + Math.min(1400, 180 + text.length * 45);
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
    if (state === 'drag' || state === 'fall') {
      floorY = surf.y;
    } else if (crouchUntil) {                         // ancang-ancang, lalu menolak ke jalan
      if (now >= crouchUntil) {
        crouchUntil = 0; dropping = true; launchAt = now;
        floorY = surf.y;
        vy = floorY < y ? -Math.sqrt(2 * 2600 * (y - floorY + 40)) : 0;   // puncak 40px di atas jalan
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
      floorY = surf.y;
      face(faceLeft, false);                          // batalkan berbalik yang sedang berjalan
      if (floorY < y) {                               // naik: ancang-ancang dulu
        crouchUntil = now + 150; landUntil = 0; slipping = false;
        setPose(JUMP[0]);
      } else {                                        // turun: kehilangan pijakan, jatuh
        dropping = slipping = true; vy = 0; launchAt = now; landUntil = 0;
      }
    } else if (y !== surf.y) {
      floorY = y = surf.y;
      place();
    }
    onRoad = surf.road;
    if (landUntil && now >= landUntil) { landUntil = 0; slipping = false; setPose(null); }
    else if (landUntil && slipping && now - landAt > 280) setPose(SLIP[4]);
    if (turnSteps) stepTurn(now);

    if (state === 'walk' && !crouchUntil && !landUntil) {
      const dir = Math.sign(targetX - x);
      if (dir) face(dir < 0);                        // frame jalan menghadap kanan, dicerminkan ke kiri
      if (!turnSteps) x += dir * WALK_SPEED * S * dt;   // sama dengan panjang langkah: kaki tidak meluncur
      if (dir === 0 || (dir > 0 && x >= targetX) || (dir < 0 && x <= targetX)) {
        x = targetX; setState('idle', rand(1200, 3000));
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
      stopJump();
      setState('drag'); say('lift', 2200);
    }
    if (press.moved) {
      const now = performance.now();
      const speed = Math.hypot(e.clientX - press.lx, e.clientY - press.ly) / Math.max(1, now - press.lt);
      press.lx = e.clientX; press.ly = e.clientY; press.lt = now;
      animFps = speed > 0.8 ? 16 : 10;               // makin diguncang, makin meronta
      x = Math.min(Math.max(minX(), e.clientX - press.ox), window.innerWidth - W * 0.8);
      y = Math.min(Math.max(-H * 0.2, e.clientY - press.oy), floorY);
      place();
    }
  });
  function release(e) {
    if (!press || e.pointerId !== press.id) return;
    const moved = press.moved;
    press = null;
    root.classList.remove('dragging');
    if (moved) {
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

  /* komentar saat section tertentu terlihat (sekali per section) */
  const SECTION_LINE = { quests: 'projects', skills: 'skills', party: 'contact' };
  if ('IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const id = en.target.id;
        if (!en.isIntersecting || seen.has(id) || !['idle', 'walk', 'think'].includes(state)) return;
        seen.add(id);
        setState(id === 'party' ? 'wave' : 'point');
        // frame menunjuk menghadap kanan: di separuh kanan layar dicerminkan agar menunjuk ke konten
        if (id !== 'party') face(x + W / 2 > window.innerWidth / 2);
        say(SECTION_LINE[id]);
      });
    }, { threshold: 0.35 });
    Object.keys(SECTION_LINE).forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
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
  setTimeout(() => {
    if (!root.hidden && state === 'idle') { setState('wave', 2400); say('greet', 3800); }
    else if (!root.hidden) say('greet', 3800);
  }, 1800);
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
