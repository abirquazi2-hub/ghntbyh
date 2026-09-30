import { initTools } from './tools.js';
import { initForm } from './form.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// Loader: short, dismissible by finishing; never blocks longer than ~1.5s.
const loader = $('#loader');
function hideLoader() {
  if (!loader) return;
  loader.classList.add('done');
  try { sessionStorage.setItem('wd-intro', '1'); } catch (e) {}
  setTimeout(() => loader.remove(), 700);
}
if (document.documentElement.classList.contains('no-loader')) loader?.remove();
else setTimeout(hideLoader, 1500);

// Nav
const nav = $('#nav');
const burger = $('#burger'), drawer = $('#drawer');
const bar = $('#progress');
const onScroll = () => {
  if (bar) bar.style.transform = `scaleX(${Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight))})`;
  nav.classList.toggle('scrolled', scrollY > 30);
  $('.mobile-cta')?.classList.toggle('show', scrollY > innerHeight * 0.7 && !document.querySelector('#consultation')?.matches(':hover') && !inView($('#consultation')));
};
function inView(el) { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight * 0.6 && r.bottom > 0; }
addEventListener('scroll', onScroll, { passive: true }); onScroll();
function setMenu(open) {
  burger.setAttribute('aria-expanded', open);
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  drawer.hidden = !open;
  document.body.style.overflow = open ? 'hidden' : '';
  if (open) $('a', drawer).focus();
}
burger?.addEventListener('click', () => setMenu(drawer.hidden));
$$('a', drawer).forEach((a) => a.addEventListener('click', () => setMenu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !drawer.hidden) { setMenu(false); burger.focus(); } });

// Reveal on scroll
const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: 0.12 });
$$('.reveal').forEach((el) => io.observe(el));

// Count-up: end value is always present in the markup, so nothing depends on animation
const cio = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
  if (reduced || end > 1900) return; // the founding year should not "count up"
  const t0 = performance.now();
  const step = (t) => { const p = Math.min((t - t0) / 1200, 1); el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : ''); if (p < 1) requestAnimationFrame(step); else el.textContent = end + suf; };
  requestAnimationFrame(step);
}), { threshold: 0.6 });
$$('[data-count]').forEach((el) => cio.observe(el));

// Magnetic buttons and card tilt (fine pointers only)
if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
  $$('[data-magnetic]').forEach((b) => {
    b.addEventListener('pointermove', (e) => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.12}px,${(e.clientY - r.top - r.height / 2) * 0.2 - 2}px)`; });
    b.addEventListener('pointerleave', () => { b.style.transform = ''; });
  });
  $$('.scard').forEach((c) => c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }));
  $$('.tilt').forEach((c) => {
    const max = c.classList.contains('tilt--photo') ? 8 : 3;
    c.addEventListener('pointermove', (e) => { const r = c.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5; c.style.transform = `rotateY(${x * max}deg) rotateX(${-y * max}deg)`; });
    c.addEventListener('pointerleave', () => { c.style.transform = ''; });
  });
}

// Topic links prefill the consultation form
try { const t = new URLSearchParams(location.search).get('topic'); const sel = $('#f-topic'); if (t && sel && [...sel.options].some((o) => o.value === t)) sel.value = t; } catch (e) {}

// 3D hero (lazy; falls back to CSS backdrop without WebGL)
const canvas = $('#hero-canvas');
try {
  const gl = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
  if (gl && canvas) import('./hero3d.js').then((m) => m.startHero(canvas, { reduced, scene: canvas.dataset.scene })).catch(() => {});
} catch (e) {}

initTools({ reduced });
initForm();
