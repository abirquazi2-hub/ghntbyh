/* Site behaviour. No tracking, no cookies, no storage, no network requests. */
(function () {
  'use strict';
  const doc = document.documentElement;
  doc.classList.remove('no-js'); doc.classList.add('js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  document.addEventListener('DOMContentLoaded', () => {
    $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
    initNav();
    initReveal();
    initBeforeAfter();
    initLightbox();
    initHours();
    initQuoteForm();
    initEstimator();
    initPaint();
    initMagnetic();
    // If the 3D script never finishes (blocked, very old browser), show the photo fallbacks.
    setTimeout(() => { if (!doc.classList.contains('has-3d')) doc.classList.add('no-3d'); }, 30000);
  });

  /* ---------- mobile navigation ---------- */
  function initNav() {
    const btn = $('#nav-toggle'), nav = $('#site-nav');
    if (!btn || !nav) return;
    const set = open => {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
      $('.i-open', btn).classList.toggle('hidden', open);
      $('.i-close', btn).classList.toggle('hidden', !open);
    };
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
    nav.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.reveal');
    if (reduceMotion() || !('IntersectionObserver' in window)) { els.forEach(el => el.classList.add('in')); return; }
    const io = new IntersectionObserver(entries => entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
    // Never leave content hidden when someone tabs into it before it scrolls into view.
    document.addEventListener('focusin', e => { const r = e.target.closest('.reveal'); if (r) r.classList.add('in'); });
  }

  /* ---------- before / after sliders (native range input = keyboard + screen reader support) ---------- */
  function initBeforeAfter() {
    $$('.ba').forEach(box => {
      const input = $('input[type="range"]', box);
      const update = () => {
        box.style.setProperty('--pos', input.value + '%');
        input.setAttribute('aria-valuetext', `${input.value}% prep, ${100 - input.value}% finished`);
      };
      input.addEventListener('input', update);
      update();
    });
  }

  /* ---------- gallery lightbox (native <dialog>: focus trap, Esc, focus return) ---------- */
  function initLightbox() {
    const dlg = $('#lightbox'), img = $('#lightbox-img'), cap = $('#lightbox-cap');
    if (!dlg || typeof dlg.showModal !== 'function') return;
    $$('#gallery button[data-full]').forEach(b => b.addEventListener('click', () => {
      const thumb = $('img', b);
      img.src = b.dataset.full; img.alt = thumb.alt; cap.textContent = thumb.alt;
      dlg.showModal();
    }));
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }

  /* ---------- opening hours (Ottawa time) ---------- */
  function initHours() {
    const el = $('#open-state');
    if (!el) return;
    let now;
    try { now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Toronto' })); } catch { return; }
    const d = now.getDay(), m = now.getHours() * 60 + now.getMinutes();
    const key = d === 0 ? '0' : d === 6 ? '6' : '1';
    $$(`#hours [data-d="${key}"]`).forEach(x => x.classList.add('text-volt', 'font-semibold'));
    const open = d >= 1 && d <= 5 && m >= 600 && m < 1170;
    el.innerHTML = `<span class="size-2 rounded-full ${open ? 'bg-lime' : 'bg-mist'}" aria-hidden="true"></span>` +
      (open ? 'Open now, until 7:30 pm' : d === 6 ? 'Saturday: by appointment' : 'Closed now. Call to book.') +
      ' <span class="sr-only">(Ottawa time)</span>';
    el.classList.remove('hidden');
  }

  /* ---------- quote form -> pre-filled email (nothing is sent to or stored by the website) ---------- */
  function initQuoteForm() {
    const form = $('#quote-form');
    if (!form) return;
    const summary = $('#form-errors'), status = $('#form-status');
    const rules = [
      { id: 'f-name', label: 'Your name', test: v => v.trim().length > 0, msg: 'Enter your name.' },
      { id: 'f-phone', label: 'Phone number', test: v => !v.trim() || v.replace(/\D/g, '').length >= 10, msg: 'Enter a phone number with at least 10 digits, or leave it blank.' },
      { id: 'f-msg', label: 'Tell us about the damage', test: v => v.trim().length > 0, msg: 'Describe the damage, even briefly (for example "dent in rear driver-side door").' },
    ];

    function validateField(r) {
      const input = $('#' + r.id), err = $('#' + r.id + '-err'), ok = r.test(input.value);
      input.setAttribute('aria-invalid', String(!ok));
      err.textContent = ok ? '' : r.msg;
      return ok;
    }
    // After a first submit attempt, re-check fields as the person types, so a fixed error clears straight away.
    // (Not on blur: clearing a message on blur shifts the layout under the pointer and swallows the Submit click.)
    let tried = false;
    rules.forEach(r => $('#' + r.id).addEventListener('input', () => { if (tried) validateField(r); }));

    form.addEventListener('submit', e => {
      e.preventDefault();
      tried = true;
      status.textContent = '';
      const failed = rules.filter(r => !validateField(r));
      const list = $('ul', summary);
      if (failed.length) {
        list.innerHTML = failed.map(r => `<li><a class="text-volt underline" href="#${r.id}">${esc(r.label)}: ${esc(r.msg)}</a></li>`).join('');
        summary.classList.remove('hidden');
        summary.focus();
        return;
      }
      summary.classList.add('hidden'); list.innerHTML = '';
      const v = n => form.elements[n].value.trim();
      const subject = `Estimate request: ${v('service')}${v('vehicle') ? ' – ' + v('vehicle') : ''}`;
      const body = `Name: ${v('name')}\nPhone: ${v('phone') || '(not provided)'}\nVehicle: ${v('vehicle') || '(not provided)'}\nService: ${v('service')}\n\n${v('message')}\n\n(I'll attach photos of the damage to this email.)`;
      location.href = `mailto:yasir@artsautobody.ca?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      status.innerHTML = 'Your email app should now open with the message ready to send. If nothing happened, email <a class="text-volt underline" href="mailto:yasir@artsautobody.ca">yasir@artsautobody.ca</a> or call <a class="text-volt underline" href="tel:+16132372102">613-237-2102</a>.';
    });
    summary.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]'); if (!a) return;
      e.preventDefault(); const t = $(a.getAttribute('href')); t.focus(); t.scrollIntoView({ block: 'center', behavior: reduceMotion() ? 'auto' : 'smooth' });
    });
  }

  /* ---------- damage estimator ---------- */
  // "Left" is the driver's side on Canadian cars.
  const ZONES = [
    ['front-bumper', 'Front bumper'], ['hood', 'Hood'],
    ['fender-l', 'Front fender, driver side'], ['fender-r', 'Front fender, passenger side'],
    ['door-l', 'Doors, driver side'], ['door-r', 'Doors, passenger side'],
    ['quarter-l', 'Rear quarter, driver side'], ['quarter-r', 'Rear quarter, passenger side'],
    ['roof', 'Roof'], ['trunk', 'Trunk or hatch'], ['rear-bumper', 'Rear bumper'], ['wheels', 'Around a wheel'],
  ];
  const TYPES = [
    ['dent', 'Dent or ding'], ['scratch', 'Scratch or scuff'],
    ['paint', 'Chipped, faded or peeling paint'], ['collision', 'Crack, crush or collision damage'],
  ];
  const STEPS = {
    dent: [
      'We look at the dent under shop lighting to see how far the metal has stretched and whether the paint has cracked.',
      'If the paint is intact, the panel can often be reshaped back to its original body line without repainting.',
      'If the paint is damaged, we repair the metal first, then prime, colour-match and blend the refinish into the surrounding area.',
    ],
    scratch: [
      'We check how deep it goes. Scuffs in the clear coat can often be polished out; scratches through to primer or metal need refinishing.',
      'Deeper scratches are sanded, primed and repainted in a digitally matched colour.',
      'The new paint is blended into the neighbouring area and clear-coated so the repair disappears.',
    ],
    paint: [
      'Loose or failing paint is taken back to a sound edge, so the problem doesn\'t come back.',
      'The area is primed and sealed, then your colour is matched digitally, including any fade.',
      'Base coat and clear coat are sprayed in the booth and blended into adjacent panels for an even finish.',
    ],
    collision: [
      'We do a full damage inspection, including checking for hidden damage behind the panel.',
      'Parts are repaired where that makes sense, or replaced when repair isn\'t the right call.',
      'The area is refinished in colour-matched paint, and panel gaps and alignment are checked before pickup.',
    ],
  };
  const ZONE_NOTES = {
    bumper: 'Bumper covers are usually plastic. Many scuffs, dents and small tears can be repaired and refinished. If a cover is cracked through or its mounting tabs are broken, replacing it may be the better option.',
    flat: 'Large horizontal panels show every ripple under light, so we check the finish from several angles before the car goes back to you.',
    side: 'On side panels the paint is often blended into the neighbouring panel so the colour reads as one piece.',
    quarter: 'Rear quarter panels aren\'t bolt-on parts, so repairing the existing panel is usually preferred over replacing it.',
  };
  const noteFor = z => /bumper/.test(z) ? ZONE_NOTES.bumper : /hood|roof|trunk/.test(z) ? ZONE_NOTES.flat : /quarter/.test(z) ? ZONE_NOTES.quarter : ZONE_NOTES.side;
  const zoneLabel = id => (ZONES.find(z => z[0] === id) || [, id])[1];
  const typeLabel = id => (TYPES.find(t => t[0] === id) || [, id])[1];

  function initEstimator() {
    const zoneList = $('#zone-list'), typeList = $('#type-list'), body = $('#est-result-body');
    if (!zoneList) return;
    const opt = (name, [v, l]) => `<label class="opt"><input type="radio" name="${name}" value="${v}"><span>${esc(l)}</span></label>`;
    zoneList.innerHTML = ZONES.map(z => opt('zone', z)).join('');
    typeList.innerHTML = TYPES.map(t => opt('dtype', t)).join('');

    // Short, separate live region so screen readers hear a summary, not the whole panel.
    const live = document.createElement('p');
    live.className = 'sr-only'; live.setAttribute('role', 'status');
    $('#est-result').after(live);

    const report = [];
    const current = () => ({ zone: $('input[name="zone"]:checked', zoneList)?.value, type: $('input[name="dtype"]:checked', typeList)?.value });

    function render() {
      const { zone, type } = current();
      if (!zone || !type) {
        body.innerHTML = `<p>${zone ? `<strong class="text-text">${esc(zoneLabel(zone))}</strong> selected. Now choose the type of damage.` : type ? 'Now choose where the damage is, on the 3D car or from the list.' : 'Choose an area and a damage type to see the typical repair approach.'}</p>`;
        return;
      }
      const steps = zone === 'wheels'
        ? ['Damage around a wheel can hide suspension or alignment issues, so tell us what happened.', 'We\'ll take a look during your free consultation and give you an honest answer on what\'s involved, and whether it\'s work we should do or refer.']
        : STEPS[type];
      const tips = ['One photo from about 3 m away showing the whole side of the car', 'A close-up of the damage, taken straight on', 'A low-angle shot along the panel (it shows dents best)'];
      if (type === 'scratch' || type === 'paint') tips.push('Your paint code, if you can find it (it\'s often on a label in the driver\'s door jamb)');
      body.innerHTML = `
        <p class="text-text"><strong>${esc(zoneLabel(zone))}</strong> · ${esc(typeLabel(type))}</p>
        <h4 class="mt-4 font-semibold text-text">Our usual approach</h4>
        <ol class="mt-2 list-decimal space-y-2 pl-5">${steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>
        ${zone !== 'wheels' ? `<p class="mt-3 rounded-xl bg-white/[0.04] p-3 text-[0.9375rem]">${esc(noteFor(zone))}</p>` : ''}
        <h4 class="mt-5 font-semibold text-text">Photos that help us most</h4>
        <ul class="mt-2 list-disc space-y-1 pl-5">${tips.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
        <button type="button" id="report-add" class="btn btn-ghost btn-sm mt-5">Add to damage report</button>`;
      $('#report-add').addEventListener('click', () => addItem(zone, type));
    }

    function addItem(zone, type) {
      if (!report.some(r => r.zone === zone && r.type === type)) report.push({ zone, type });
      renderReport();
      live.textContent = `Added ${zoneLabel(zone)}, ${typeLabel(type)} to your damage report. ${report.length} item${report.length > 1 ? 's' : ''} in total.`;
    }

    function renderReport() {
      const ul = $('#report-list');
      $('#report-count').textContent = `(${report.length})`;
      $('#report-send').disabled = !report.length;
      ul.innerHTML = report.length ? report.map((r, i) => `<li class="flex items-center justify-between gap-3 rounded-xl border border-white/10 px-3 py-2">
          <span>${esc(zoneLabel(r.zone))} · <span class="text-mist">${esc(typeLabel(r.type))}</span></span>
          <button type="button" class="grid size-11 shrink-0 place-items-center rounded-lg text-mist hover:bg-white/10 hover:text-text" data-remove="${i}" aria-label="Remove ${esc(zoneLabel(r.zone))}, ${esc(typeLabel(r.type))}">✕</button></li>`).join('')
        : '<li class="text-mist">Nothing added yet.</li>';
    }
    $('#report-list').addEventListener('click', e => {
      const b = e.target.closest('[data-remove]'); if (!b) return;
      const [r] = report.splice(+b.dataset.remove, 1);
      renderReport();
      live.textContent = `Removed ${zoneLabel(r.zone)}, ${typeLabel(r.type)}.`;
      // Keep keyboard focus somewhere sensible after the button disappears.
      const next = $('#report-list [data-remove]');
      if (next) next.focus(); else { const h = $('#report h3'); h.setAttribute('tabindex', '-1'); h.focus(); }
    });

    $('#report-send').addEventListener('click', () => {
      const msg = $('#f-msg'), svc = $('#f-svc');
      const lines = report.map(r => `- ${zoneLabel(r.zone)}: ${typeLabel(r.type)}`).join('\n');
      msg.value = `Damage report from the website estimator:\n${lines}\n\n${msg.value.replace(/^Damage report from the website estimator:[\s\S]*?\n\n/, '')}`.trim() + '\n';
      const types = new Set(report.map(r => r.type));
      svc.value = types.has('collision') ? 'Collision repair' : types.size === 1 && types.has('dent') ? 'Dent removal' : [...types].every(t => t === 'scratch' || t === 'paint') ? 'Auto body paint' : 'Not sure yet';
      $('#contact').scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth' });
      msg.focus({ preventScroll: true });
      $('#form-status').textContent = 'Your damage report has been added to the message below. Add any details, then open the pre-filled email.';
    });

    let fromCar = false;
    zoneList.addEventListener('change', () => {
      if (!fromCar) dispatchEvent(new CustomEvent('car:focus-zone', { detail: { zone: current().zone } }));
      render();
    });
    typeList.addEventListener('change', render);

    addEventListener('car:zone-picked', e => {
      const input = $(`input[name="zone"][value="${e.detail.zone}"]`, zoneList);
      if (!input) return;
      fromCar = true; input.checked = true; input.dispatchEvent(new Event('change', { bubbles: true })); fromCar = false;
      live.textContent = `Selected ${zoneLabel(e.detail.zone)} from the 3D car.${current().type ? '' : ' Now choose the type of damage.'}`;
    });

    $$('[data-rotate]').forEach(b => b.addEventListener('click', () => dispatchEvent(new CustomEvent('car:rotate', { detail: { dir: +b.dataset.rotate } }))));
    render();
  }

  function initPaint() {
    $$('#paint-swatches input').forEach(i => i.addEventListener('change', () => dispatchEvent(new CustomEvent('car:paint', { detail: { variant: +i.value } }))));
  }

  /* ---------- subtle magnetic buttons (fine pointers only, off with reduced motion) ---------- */
  function initMagnetic() {
    if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.magnetic').forEach(el => {
      el.addEventListener('pointermove', e => {
        if (reduceMotion()) return;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) / r.width, y = (e.clientY - r.top - r.height / 2) / r.height;
        el.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }
})();
