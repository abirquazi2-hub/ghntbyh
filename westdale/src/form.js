const $ = (s, r = document) => r.querySelector(s);

export function initForm() {
  const form = $('#cform'); if (!form) return;
  const status = $('#c-status'), btn = $('#c-submit');
  let csrf = null, tsToken = '';

  async function prepare() {
    try {
      const r = await fetch('/api/config', { credentials: 'same-origin', headers: { Accept: 'application/json' } });
      if (!r.ok) return;
      const c = await r.json(); csrf = c.csrf;
      if (c.turnstileSiteKey) {
        const s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true;
        s.onload = () => window.turnstile.render('#turnstile', { sitekey: c.turnstileSiteKey, callback: (t) => { tsToken = t; } });
        document.head.append(s);
      }
    } catch (e) { /* form still shows; submit will report */ }
  }
  // Load the token when the visitor gets near the form, so it isn't requested for everyone.
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); prepare(); } }, { rootMargin: '400px' }).observe(form);

  const show = (errs) => {
    form.querySelectorAll('.err').forEach((e) => { e.textContent = ''; });
    form.querySelectorAll('[aria-invalid]').forEach((e) => e.removeAttribute('aria-invalid'));
    let first;
    Object.entries(errs).forEach(([k, m]) => { const e = form.querySelector(`.err[data-for=${k}]`); const f = form.elements[k]; if (e) e.textContent = m; if (f) { f.setAttribute('aria-invalid', 'true'); first ||= f; } });
    first?.focus();
  };
  const validate = (d) => {
    const e = {};
    if (!d.name.trim()) e.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) e.email = 'Please enter a valid email address.';
    if (d.phone && !/^[\d\s()+\-.ext]{7,30}$/i.test(d.phone)) e.phone = 'Please check the phone number.';
    if (!d.topic) e.topic = 'Please choose a topic.';
    if (!d.consent) e.consent = 'Please confirm to continue.';
    return e;
  };
  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const fd = new FormData(form);
    const d = Object.fromEntries(fd); d.consent = form.elements.consent.checked;
    const errs = validate(d); show(errs); if (Object.keys(errs).length) return;
    status.className = 'form__status'; status.textContent = 'Sending…'; btn.disabled = true;
    try {
      if (!csrf) await prepare();
      const r = await fetch('/api/consultation', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf || '' },
        body: JSON.stringify({ ...d, turnstile: tsToken }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { form.reset(); status.className = 'form__status ok'; status.textContent = 'Thank you. Your request has been sent and Steve will be in touch.'; }
      else { if (j.errors) show(j.errors); status.className = 'form__status bad'; status.textContent = j.message || 'Something went wrong. Please email steve@westdalefinancial.com instead.'; if (r.status === 403) csrf = null; }
    } catch (e) {
      status.className = 'form__status bad'; status.textContent = 'We couldn’t send your request. Please email steve@westdalefinancial.com instead.';
    } finally { btn.disabled = false; }
  });
}
