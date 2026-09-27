/*
 * Page choreography: smooth scroll, intro, finish selector + colour flood, scroll-driven
 * "anatomy of a repair", kinetic type and the horizontal work gallery.
 * Built with esbuild into assets/js/app.js (classic script, so the site also works from file://).
 *
 * Everything here is an enhancement: content, links and forms work without it, and
 * prefers-reduced-motion switches off smoothing, pinning and autonomous motion.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { FINISHES, initShowroom, initEstimator, loadModel, webglAvailable } from './car3d.js';

gsap.registerPlugin(ScrollTrigger);

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

let showroom = null;

/* ---------- smooth scroll ---------- */
let lenis = null;
function initScroll() {
  if (reduce) return;
  lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(t => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  // In-page links glide instead of jumping; focus still moves to the target for keyboard users.
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href').length < 2) return;
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis.scrollTo(t, { offset: -72, onComplete: () => { if (!t.hasAttribute('tabindex')) t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); } });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}

/* ---------- intro ---------- */
function intro(ready) {
  const el = $('#intro');
  if (!el) return Promise.resolve();
  const done = () => { el.remove(); root.classList.add('intro-done'); };
  if (reduce) { done(); return Promise.resolve(); }
  const num = $('#intro-count', el);
  const state = { v: 0 };
  // Counts to 90 on its own, then waits (max 4 s) for the 3D car before finishing.
  const count = gsap.to(state, { v: 90, duration: 1.6, ease: 'power2.out', onUpdate: () => { num.textContent = String(Math.round(state.v)).padStart(3, '0'); } });
  const timeout = new Promise(r => setTimeout(r, 4000));
  return Promise.race([ready, timeout]).then(() => new Promise(res => {
    count.kill();
    gsap.timeline({ onComplete: () => { done(); res(); } })
      .to(state, { v: 100, duration: 0.35, ease: 'power1.out', onUpdate: () => { num.textContent = String(Math.round(state.v)).padStart(3, '0'); } })
      .to('#intro .intro-line', { yPercent: -110, duration: 0.6, stagger: 0.06, ease: 'power3.in' }, '+=0.1')
      .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 0.8, ease: 'power4.inOut' }, '-=0.2');
  }));
}

function heroIn() {
  if (reduce) return;
  gsap.from('.hero-rise', { yPercent: 110, duration: 1.1, stagger: 0.07, ease: 'power4.out' });
  gsap.from('.hero-fade', { opacity: 0, y: 20, duration: 1, stagger: 0.08, delay: 0.35, ease: 'power3.out' });
}

/* ---------- finish selector + colour flood ---------- */
function initFinishes() {
  const group = $('#finishes');
  if (!group) return;
  const name = $('#finish-name'), idx = $('#finish-index'), wipe = $('#flood-wipe');
  const apply = (i, fromEl) => {
    const f = FINISHES[i];
    showroom?.setFinish(i);
    idx.textContent = String(i + 1).padStart(2, '0');
    const swapName = () => { name.textContent = f.name; };
    if (reduce || !fromEl) { root.style.setProperty('--flood', f.flood); swapName(); return; }
    // Circular colour wipe from the swatch that was picked.
    const r = fromEl.getBoundingClientRect();
    wipe.style.setProperty('--x', `${r.left + r.width / 2}px`);
    wipe.style.setProperty('--y', `${r.top + r.height / 2}px`);
    wipe.style.setProperty('--wipe', f.flood);
    gsap.timeline()
      .fromTo(wipe, { '--r': '0%', opacity: 0.55 }, { '--r': '150%', duration: 0.9, ease: 'power3.inOut' })
      .add(() => root.style.setProperty('--flood', f.flood), 0.45)
      .to(wipe, { opacity: 0, duration: 0.5 }, 0.7);
    gsap.timeline()
      .to(name, { yPercent: -100, opacity: 0, duration: 0.35, ease: 'power2.in', onComplete: swapName })
      .fromTo(name, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: 'power3.out' });
  };
  group.addEventListener('change', e => { const i = +e.target.value; apply(i, e.target.closest('label')); });
  apply(0);
}

/* ---------- anatomy of a repair (pinned, scrubbed) ---------- */
function initAnatomy() {
  const sec = $('#anatomy');
  if (!sec) return;
  const steps = $$('#anatomy [data-step]');
  const callouts = $$('#anatomy [data-callout]');
  // Which callouts show during which part of the story.
  const window_ = { 'wheels': [0.16, 0.8], 'door-l': [0.22, 0.8], 'hood': [0.3, 0.8], 'front-bumper': [0.34, 0.8], 'rear-bumper': [0.38, 0.8] };
  ScrollTrigger.create({
    trigger: sec, start: 'top top', end: 'bottom bottom', scrub: true,
    onUpdate: self => {
      const p = self.progress;
      showroom?.setProgress(p);
      const active = p < 0.18 ? 0 : p < 0.45 ? 1 : p < 0.78 ? 2 : 3;
      steps.forEach((s, i) => s.classList.toggle('is-active', i === active));
      callouts.forEach(c => { const [a, b] = window_[c.dataset.callout] || [2, 2]; c.classList.toggle('is-on', p > a && p < b); });
    },
  });
  // The 3D stage fades out as the story ends; it stops rendering when hidden.
  const stageEl = $('#stage');
  ScrollTrigger.create({
    trigger: sec, start: 'bottom 110%', end: 'bottom 20%', scrub: true,
    onUpdate: self => { stageEl.style.opacity = String(1 - self.progress); stageEl.dataset.paused = self.progress > 0.99 ? '1' : '0'; $('#stage-canvas').dataset.paused = stageEl.dataset.paused; },
  });
}

/* ---------- kinetic type ---------- */
function initKinetic() {
  if (reduce) return;
  $$('[data-marquee]').forEach(row => {
    const dir = +row.dataset.marquee || 1;
    gsap.fromTo(row, { xPercent: dir > 0 ? 0 : -35 }, { xPercent: dir > 0 ? -35 : 0, ease: 'none', scrollTrigger: { trigger: row.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  // Headline lines rise into place as they enter.
  $$('.rise-lines').forEach(h => {
    gsap.from(h.querySelectorAll('.rl > span'), { yPercent: 105, duration: 1, ease: 'power4.out', stagger: 0.08, scrollTrigger: { trigger: h, start: 'top 85%' } });
  });
  // Counters
  $$('[data-count]').forEach(el => {
    const to = +el.dataset.count, dec = (el.dataset.count.split('.')[1] || '').length, o = { v: 0 };
    gsap.to(o, { v: to, duration: 1.6, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 90%' }, onUpdate: () => { el.textContent = o.v.toFixed(dec); } });
  });
}

/* ---------- horizontal work gallery (desktop pins; touch uses native swipe) ---------- */
function initWork() {
  const track = $('#work-track');
  if (!track || reduce) return;
  const mm = gsap.matchMedia();
  mm.add('(min-width: 1024px)', () => {
    const dist = () => track.scrollWidth - innerWidth + 64;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '#work', start: 'top top', end: () => '+=' + dist(), pin: true, scrub: 0.6, invalidateOnRefresh: true } });
  });
}

/* ---------- service rows: floating preview image follows the pointer (decorative) ---------- */
function initServiceHover() {
  const float = $('#svc-float');
  if (!float || !fine || reduce) return;
  const img = $('img', float);
  const xTo = gsap.quickTo(float, 'x', { duration: 0.5, ease: 'power3' }), yTo = gsap.quickTo(float, 'y', { duration: 0.5, ease: 'power3' });
  $$('#services [data-img]').forEach(row => {
    row.addEventListener('pointerleave', () => gsap.to(float, { opacity: 0, scale: 0.9, duration: 0.3 }));
    row.addEventListener('pointermove', e => {
      if (img.getAttribute('src') !== row.dataset.img) img.src = row.dataset.img;
      if (+gsap.getProperty(float, 'opacity') === 0) { gsap.set(float, { x: e.clientX - 160, y: e.clientY - 110 }); }
      gsap.to(float, { opacity: 1, scale: 1, duration: 0.35, overwrite: 'auto' });
      xTo(e.clientX - 160); yTo(e.clientY - 110);
    });
  });
}

/* ---------- boot ---------- */
function boot() {
  initScroll();
  initKinetic();
  initWork();
  initServiceHover();

  let ready = Promise.resolve();
  if (webglAvailable()) {
    ready = loadModel().then(gltf => {
      showroom = initShowroom(gltf, $('#stage-canvas'), $$('#anatomy [data-callout]'));
      initEstimator(gltf);
      root.classList.add('has-3d');
      dispatchEvent(new Event('car:ready'));
    }).catch(err => {
      console.warn('3D model failed to load; showing photo fallbacks instead.', err);
      root.classList.add('no-3d');
    });
  } else {
    root.classList.add('no-3d');
  }
  initFinishes();
  initAnatomy();
  intro(ready).then(() => { heroIn(); ScrollTrigger.refresh(); });
  ready.then(() => { const i = $('#finishes input:checked'); if (i && showroom) showroom.setFinish(+i.value, true); ScrollTrigger.refresh(); });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
