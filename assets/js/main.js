// Entry: render konten dari data + interaksi. ES module, tanpa library.
import { t, tx, getLang, applyStatic } from './i18n.js?v=5';
import { profile } from './data/profile.js?v=5';
import { projects } from './data/projects.js?v=5';
import { experience } from './data/experience.js?v=5';
import { internships } from './data/internships.js?v=5';
import { certs, education, copyrights } from './data/certs.js?v=5';
import { skills } from './data/skills.js?v=5';
import { services, steps } from './data/services.js?v=5';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
};
const svg = (id) => `<svg class="bi" aria-hidden="true"><use href="#i-${id}"/></svg>`;
const icon = (name, size = 32) => `<img class="pix-ico" src="assets/img/icons/${name}.png" alt="" width="${size}" height="${size}" loading="lazy">`;

/* ================= render ================= */

function renderLinks() {
  $('#pcLinks').innerHTML = profile.links.map((l) =>
    `<li><a href="${l.url}" target="_blank" rel="noopener" aria-label="${l.label}">${svg(l.key)}</a></li>`).join('');
  $('#contactList').innerHTML =
    `<li><a href="mailto:${profile.email}">${icon('message', 28)}<span><b>Email</b>${profile.email}</span></a></li>` +
    `<li><span class="cl-static"><span class="cl-pin" aria-hidden="true">⌖</span><span><b>${esc(t('about.loc'))}</b>Surabaya, Indonesia</span></span></li>` +
    profile.links.map((l) =>
      `<li><a href="${l.url}" target="_blank" rel="noopener">${svg(l.key)}<span><b>${l.label}</b>${esc(tx(l.handle))}</span></a></li>`).join('');
}

/* tombol Download CV mengikuti bahasa aktif */
function renderCV() {
  $$('[data-cv]').forEach((a) => { a.href = tx(profile.cv); });
  $$('.cv-lang').forEach((el) => { el.textContent = 'PDF · ' + getLang().toUpperCase(); });
}

function renderStats() {
  $('#statsList').innerHTML = profile.stats.map((s) =>
    `<li><b class="stat-v">${s.value}</b><span>${esc(tx(s.label))}</span></li>`).join('');
}

function renderSkills() {
  $('#skillTree').innerHTML = skills.map((b) => `
    <li class="branch branch--${b.color}">
      <p class="branch-h"><b>${esc(tx(b.label)).toUpperCase()}</b><span>${esc(tx(b.note))}</span></p>
      <div class="chips">${b.items.map((i) => `<span class="chip">${esc(tx(i))}</span>`).join('')}</div>
    </li>`).join('');
}

/* ---------- quests + filter ---------- */
const TYPES = ['all', 'client', 'own', 'institution'];
const CLASSES = ['all', 'be', 'fe', 'fs', 'devops'];
const filter = { type: 'all', class: 'all' };

function readFilterFromURL() {
  const p = new URLSearchParams(location.search);
  if (TYPES.includes(p.get('type'))) filter.type = p.get('type');
  if (CLASSES.includes(p.get('class'))) filter.class = p.get('class');
}
function writeFilterToURL() {
  const p = new URLSearchParams(location.search);
  ['type', 'class'].forEach((k) => (filter[k] === 'all' ? p.delete(k) : p.set(k, filter[k])));
  const q = p.toString();
  history.replaceState(null, '', location.pathname + (q ? '?' + q : '') + location.hash);
}

function renderFilters() {
  const btns = (list, key) => list.map((v) =>
    `<button type="button" class="seg-btn" data-f="${key}" data-v="${v}" aria-pressed="${filter[key] === v}">${esc(t('q.' + v))}</button>`).join('');
  $('#filterType').innerHTML = btns(TYPES, 'type');
  $('#filterClass').innerHTML = btns(CLASSES, 'class');
}

function renderQuests() {
  $('#questGrid').innerHTML = projects.map((p) => `
    <li class="quest" data-slug="${p.slug}">
      <div class="quest-top">
        ${icon(p.icon, 40)}
        <span class="quest-code mono">${p.code}</span>
        <span class="tier tier--${p.tier}">${p.tier}</span>
      </div>
      <h3 class="quest-h">${esc(tx(p.title))}</h3>
      <p class="quest-meta mono">${esc(tx(p.meta))}</p>
      <p class="quest-sum">${esc(tx(p.summary))}</p>
      ${p.building ? `<p class="quest-flag mono">● ${esc(t('q.building'))}</p>` : ''}
      <div class="chips">${p.stack.slice(0, 4).map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
      <a class="quest-open" href="#quest/${p.slug}">${esc(t('q.open'))} <span aria-hidden="true">▶</span><span class="sr-only">: ${esc(tx(p.title))}</span></a>
    </li>`).join('');
  applyFilter();
}

function applyFilter() {
  let shown = 0;
  $$('.quest').forEach((el) => {
    const p = projects.find((x) => x.slug === el.dataset.slug);
    const ok = (filter.type === 'all' || p.type === filter.type) && (filter.class === 'all' || p.classes.includes(filter.class));
    el.classList.toggle('is-dim', !ok);
    el.setAttribute('aria-hidden', String(!ok));
    el.querySelector('.quest-open').tabIndex = ok ? 0 : -1;
    if (ok) shown++;
  });
  $('#questCount').textContent = `${shown}/${projects.length}`;
}

document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-f]');
  if (!b) return;
  filter[b.dataset.f] = b.dataset.v;
  $$(`[data-f="${b.dataset.f}"]`).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
  applyFilter();
  writeFilterToURL();
});

/* ---------- quest details (dialog) ---------- */
const qModal = $('#questModal');
let lastFocus = null;

function questHTML(p) {
  const i = projects.indexOf(p);
  const prev = projects[(i - 1 + projects.length) % projects.length];
  const next = projects[(i + 1) % projects.length];
  const flow = p.flow.map((f) => `<span class="flow-node">${esc(f)}</span>`).join('<span class="flow-arrow" aria-hidden="true">▶</span>');
  const links = [p.links.live && `<a class="btn btn--sm" href="${p.links.live}" target="_blank" rel="noopener">${t('q.live')}</a>`,
    p.links.repo && `<a class="btn btn--sm btn--ghost" href="${p.links.repo}" target="_blank" rel="noopener">${t('q.repo')}</a>`].filter(Boolean).join('');
  return `
    ${p.haki ? `<p class="qd-haki"><span class="tier tier--legendary">HAKI</span> ${esc(t('q.hakiTag'))} · <button type="button" class="link-btn" data-haki="${p.haki}">${esc(t('q.haki'))} ▶</button></p>` : ''}
    <div class="qd-flow">${p.internal ? `<p class="mono">${esc(t('q.internal'))}</p>` : ''}<div class="flow">${flow}</div></div>
    <div class="qd-head">
      <h2 id="qmTitle" class="qd-title">${esc(tx(p.title))}</h2>
      <span class="tier tier--${p.tier}">${p.tier}</span><span class="tag">${esc(t('q.' + p.type))}</span>
    </div>
    <p class="quest-meta mono">${esc(tx(p.meta))}</p>
    <h3 class="mini-h">— ${esc(t('q.objective'))} —</h3><p>${esc(tx(p.objective))}</p>
    <h3 class="mini-h">— ${esc(t('q.strategy'))} —</h3><p>${esc(tx(p.strategy))}</p>
    <h3 class="mini-h">— ${esc(t('q.reward'))} —</h3><p>${esc(tx(p.reward))}</p>
    <h3 class="mini-h">— ${esc(t('q.equipment'))} —</h3>
    <div class="chips">${p.stack.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
    <div class="qd-foot">
      <div class="qd-links">${links}</div>
      <nav class="qd-nav" aria-label="Quests">
        <a class="seg-btn" href="#quest/${prev.slug}">${esc(t('q.prev'))}</a>
        <a class="seg-btn" href="#quest/${next.slug}">${esc(t('q.next'))}</a>
      </nav>
    </div>`;
}

function openQuest(slug) {
  const p = projects.find((x) => x.slug === slug);
  if (!p) return closeQuest();
  $('#qmCode').textContent = p.code;
  $('#qmBody').innerHTML = questHTML(p);
  $('#qmBody').scrollTop = 0;
  if (!qModal.open) {
    lastFocus = document.activeElement;
    qModal.showModal();
    document.body.classList.add('modal-open');
  }
  $('.modal-close', qModal).focus();
}
function closeQuest() {
  if (qModal.open) qModal.close();
}
qModal.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (location.hash.startsWith('#quest/')) history.replaceState(null, '', location.pathname + location.search + '#quests');
  const slug = lastFocus?.closest?.('.quest')?.dataset.slug;
  const back = slug ? $(`.quest[data-slug="${slug}"] .quest-open`) : lastFocus;
  back?.focus?.({ preventScroll: true });
});
function routeHash() {
  const m = location.hash.match(/^#quest\/([\w-]+)$/);
  if (m) openQuest(m[1]); else closeQuest();
}
window.addEventListener('hashchange', routeHash);
qModal.addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea')) return;
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
    const a = $$('.qd-nav a', qModal)[e.key === 'ArrowRight' ? 1 : 0];
    if (a) { e.preventDefault(); location.hash = a.getAttribute('href'); }
  }
});
$$('.modal').forEach((m) => {
  m.addEventListener('click', (e) => {
    if (e.target === m || e.target.closest('[data-close]')) m.close();
  });
});

/* ---------- HAKI viewer: gambar baru dimuat saat tombol View diklik ---------- */
const hModal = $('#hakiModal');
let hakiReturn = null;
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-haki]');
  if (!b) return;
  const c = copyrights.find((x) => x.slug === b.dataset.haki);
  if (!c) return;
  hakiReturn = b;
  $('#hmCode').textContent = c.title;
  const img = $('#hmImg');
  img.alt = `${t('haki.alt')} ${c.title}`;
  img.src = c.img;
  hModal.showModal();
  document.body.classList.add('modal-open');
  $('.modal-close', hModal).focus();
});
hModal.addEventListener('close', () => {
  if (!qModal.open) document.body.classList.remove('modal-open');
  const sel = hakiReturn && hakiReturn.isConnected ? hakiReturn : $(`[data-haki="${hakiReturn?.dataset.haki}"]`);
  sel?.focus?.({ preventScroll: true });
});

/* ---------- commissions ---------- */
function renderServices() {
  $('#svcList').innerHTML = services.map((s) => `
    <li class="svc-item">${icon(s.icon, 36)}<div><h3>${esc(tx(s.title))}</h3><p>${esc(tx(s.desc))}</p></div></li>`).join('');
  $('#stepList').innerHTML = steps.map((s, i) => `<li><span class="mono">0${i + 1}</span>${esc(tx(s))}</li>`).join('');
  $('#bType').innerHTML = services.map((s) => `<option>${esc(tx(s.title))}</option>`).join('') +
    `<option>${getLang() === 'id' ? 'Lainnya' : 'Other'}</option>`;
}

/* ---------- adventure log ---------- */
function timeline(list) {
  return list.map((x) => `
    <li class="tl">
      <p class="tl-date mono">${esc(tx(x.start))} — ${x.end ? esc(tx(x.end)) : esc(t('log.now'))}</p>
      <h3 class="tl-role">${esc(tx(x.role))}</h3>
      <p class="tl-org">${esc(x.org)} <span>· ${esc(tx(x.kind))}</span></p>
      <ul class="tl-list">${x.points.map((p) => `<li>${esc(tx(p))}</li>`).join('')}</ul>
      <div class="chips">${x.tags.map((s) => `<span class="chip">${esc(s)}</span>`).join('')}</div>
    </li>`).join('');
}
function renderJourney() {
  $('#panel-work').innerHTML = timeline(experience);
  $('#panel-intern').innerHTML = timeline(internships);
  $('#tab-intern').hidden = internships.length === 0;
}
$('#logTabs').addEventListener('click', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (!tab) return;
  $$('[role="tab"]', $('#logTabs')).forEach((x) => {
    const on = x === tab;
    x.setAttribute('aria-selected', String(on));
    x.tabIndex = on ? 0 : -1;
    $('#' + x.getAttribute('aria-controls')).hidden = !on;
  });
});

/* ---------- achievements ---------- */
function renderCerts() {
  $('#certList').innerHTML = certs.map((c) => {
    const inner = `<span class="cert-tier tier tier--${c.tier}">${c.tier}</span>
      <span class="cert-t">${esc(tx(c.title))}${c.url ? ' <span aria-hidden="true">↗</span>' : ''}</span>
      <span class="cert-m mono">${esc(c.issuer)} · ${esc(tx(c.date))}</span>`;
    return `<li>${c.url ? `<a class="cert" href="${c.url}" target="_blank" rel="noopener" title="${esc(t('cert.view'))}">${inner}</a>` : `<div class="cert">${inner}</div>`}</li>`;
  }).join('');
  $('#hakiList').innerHTML = copyrights.map((c) => `
    <li><div class="cert">
      <span class="cert-tier tier tier--legendary">HAKI</span>
      <span class="cert-t">${esc(c.title)} <span class="cert-d">— ${esc(tx(c.desc))}</span></span>
      <span class="cert-m mono">${esc(tx(c.kind))} · ${esc(t('haki.no'))} ${c.number} · ${esc(tx(c.date))}</span>
      <button type="button" class="btn btn--sm btn--ghost cert-view" data-haki="${c.slug}">${esc(t('haki.view'))}<span class="sr-only">: ${esc(c.title)}</span></button>
    </div></li>`).join('');
  $('#edu').innerHTML = `<p class="edu-deg">${esc(tx(education.degree))}</p>
    <p class="edu-school">${esc(education.school)} · <span class="mono">${education.years}</span></p>
    <p class="edu-full">${esc(education.full)}</p>`;
}

/* ---------- chat log (diketik saat terlihat) ---------- */
const chatLines = [['SYS', 'chat.1'], ['SYS', 'chat.2'], ['ARSYA', 'chat.3']];
let chatPlayed = false;
function renderChat(animate) {
  const box = $('#chatLog');
  box.innerHTML = chatLines.map(([who, k]) =>
    `<p><span class="who ${who === 'SYS' ? 'who--sys' : 'who--me'}">[${who}]</span><span class="say">${animate ? '' : esc(t(k))}</span></p>`).join('');
  if (!animate) return;
  const spans = $$('.say', box);
  let li = 0;
  const next = () => {
    if (li >= spans.length) return;
    const full = t(chatLines[li][1]);
    const el = spans[li];
    el.classList.add('caret');
    let ci = 0;
    const step = Math.max(8, 900 / full.length);
    const tick = () => {
      el.textContent = full.slice(0, ++ci);
      if (ci < full.length) setTimeout(tick, step);
      else { el.classList.remove('caret'); li++; setTimeout(next, 250); }
    };
    tick();
  };
  next();
}

/* ================= bahasa & tema ================= */
function renderAll() {
  applyStatic();
  renderLinks(); renderCV(); renderStats(); renderSkills(); renderFilters(); renderQuests();
  renderServices(); renderJourney(); renderCerts();
  renderChat(false);
  if (qModal.open) routeHash();
  $('#themeBtn').setAttribute('aria-label', t('theme.dark'));
  $('#burger').setAttribute('aria-label', t('menu'));
}

function setLang(l) {
  document.documentElement.lang = l;
  store.set('lang', l);
  $$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === l)));
  renderAll();
  typeRole(true);
  document.dispatchEvent(new CustomEvent('langchange', { detail: l }));
}
$$('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));

function setTheme(th) {
  document.documentElement.dataset.theme = th;
  store.set('theme', th);
  $('#themeBtn').setAttribute('aria-pressed', String(th === 'dark'));
  $('meta[name="theme-color"]').content = th === 'dark' ? '#121428' : '#1b1f3b';
}
$('#themeBtn').addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

/* ================= nav ================= */
const burger = $('#burger'), links = $('#navLinks');
burger.addEventListener('click', () => {
  const open = burger.getAttribute('aria-expanded') !== 'true';
  burger.setAttribute('aria-expanded', String(open));
  links.classList.toggle('open', open);
});
links.addEventListener('click', (e) => {
  if (e.target.closest('a')) { burger.setAttribute('aria-expanded', 'false'); links.classList.remove('open'); }
});

const nav = $('#nav'), toTop = $('#toTop'), heroBg = $('.hero-bg');
const navTargets = $$('.nav-links a').map((a) => [a, $(a.getAttribute('href'))]);
let ticking = false;
function onScroll() {
  const y = scrollY;
  nav.classList.toggle('scrolled', y > 10);
  toTop.classList.toggle('show', y > 640);
  let cur = null;
  navTargets.forEach(([a, el]) => { if (el && el.getBoundingClientRect().top < innerHeight * 0.4) cur = a; });
  navTargets.forEach(([a]) => a.classList.toggle('active', a === cur));
  ticking = false;
}
addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });

/* jalan (trotoar) pada latar hero untuk pijakan companion.
   Baris piksel trotoar di gambar Canva 1776×896: siang 818, malam 802. */
const HERO_IMG = { w: 1776, h: 896, road: { light: 818, dark: 802 } };
window.ARSYA_FLOOR = () => {
  const r = heroBg.getBoundingClientRect();
  if (r.bottom <= 0 || r.top >= innerHeight) return null;
  const scale = Math.max(r.width / HERO_IMG.w, r.height / HERO_IMG.h);   // background-size: cover, rata bawah
  const road = HERO_IMG.road[document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'];
  return r.bottom - (HERO_IMG.h - road) * scale;
};

/* ================= efek ================= */
const roles = ['Software Engineer', 'Go & Laravel Developer', 'Building scalable web apps'];
let typeTimer = null;
function typeRole(reset) {
  const el = $('#typed');
  clearTimeout(typeTimer);
  if (reduced) { el.textContent = roles[0]; return; }
  let ri = 0, ci = reset ? 0 : el.textContent.length, del = false;
  const loop = () => {
    const w = roles[ri];
    ci += del ? -1 : 1;
    el.textContent = w.slice(0, ci);
    let d = del ? 35 : 70;
    if (!del && ci === w.length) { d = 1800; del = true; }
    else if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; d = 300; }
    typeTimer = setTimeout(loop, d);
  };
  el.textContent = '';
  loop();
}

function observe() {
  const els = $$('.reveal, .meter-bar');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach((e) => io.observe(e));

  const chatIO = new IntersectionObserver((es) => {
    if (es[0].isIntersecting && !chatPlayed) { chatPlayed = true; renderChat(!reduced); chatIO.disconnect(); }
  }, { threshold: 0.5 });
  chatIO.observe($('#chatLog'));
}

/* partikel koin di CTA utama */
function coins(btn) {
  if (reduced) return;
  btn.addEventListener('pointerenter', () => {
    for (let i = 0; i < 6; i++) {
      const c = document.createElement('span');
      c.className = 'coin';
      c.style.left = 10 + Math.random() * 80 + '%';
      c.style.setProperty('--dx', (Math.random() * 40 - 20).toFixed(0) + 'px');
      c.style.animationDelay = i * 40 + 'ms';
      btn.appendChild(c);
      setTimeout(() => c.remove(), 900);
    }
  });
}

/* ================= form → mailto ================= */
function mailForm(form, statusEl, build) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let bad = false;
    $$('input,textarea,select', form).forEach((f) => {
      const invalid = !f.checkValidity();
      f.setAttribute('aria-invalid', String(invalid));
      if (invalid && !bad) { bad = true; f.focus(); }
    });
    statusEl.classList.toggle('is-error', bad);
    if (bad) { statusEl.textContent = t('form.invalid'); return; }
    const d = Object.fromEntries(new FormData(form));
    const { subject, body } = build(d);
    location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    statusEl.textContent = t('form.ok');
    document.dispatchEvent(new CustomEvent('formsent'));
  });
  form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));
}
mailForm($('#msgForm'), $('#msgStatus'), (d) => ({
  subject: `Portfolio message from ${d.name}`,
  body: `${d.message}\n\n— ${d.name} <${d.email}>`
}));
mailForm($('#buildForm'), $('#buildStatus'), (d) => ({
  subject: `Build request: ${d.type} — ${d.name}`,
  body: `Name: ${d.name}\nEmail: ${d.email}\nCompany: ${d.company || '-'}\nProject type: ${d.type}\nTarget date: ${d.date || '-'}\n\n${d.desc}`
}));
const bModal = $('#buildModal');
$('#buildBtn').addEventListener('click', () => { bModal.showModal(); document.body.classList.add('modal-open'); });
bModal.addEventListener('close', () => { document.body.classList.remove('modal-open'); $('#buildBtn').focus(); });

/* ================= boot screen ================= */
function boot() {
  const el = $('#boot');
  let seen = null;
  try { seen = sessionStorage.getItem('booted'); } catch (e) {}
  if (seen || reduced) return;
  try { sessionStorage.setItem('booted', '1'); } catch (e) {}
  el.hidden = false;
  document.body.classList.add('modal-open');
  const log = $('#bootLog'), bar = $('#bootBar');
  log.textContent = '';
  [t('boot.1'), t('boot.2')].forEach((line, i) => setTimeout(() => { log.textContent += line + '\n'; }, 180 + i * 260));
  requestAnimationFrame(() => { bar.style.width = '100%'; });
  const done = () => {
    if (el.hidden) return;
    el.classList.add('out');
    document.body.classList.remove('modal-open');
    setTimeout(() => { el.hidden = true; }, 260);
    removeEventListener('keydown', done);
  };
  el.addEventListener('click', done);
  addEventListener('keydown', done);
  setTimeout(() => $('#bootStart').focus({ preventScroll: true }), 50);
  setTimeout(done, 2600);
}

/* ================= init ================= */
readFilterFromURL();
setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
$$('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === getLang())));
renderAll();
$('#year').textContent = new Date().getFullYear();
typeRole(true);
if (!reduced) $('.glitch').classList.add('go');
observe();
coins($('#acceptBtn'));
onScroll();
boot();
routeHash();
window.__appReady = true;
