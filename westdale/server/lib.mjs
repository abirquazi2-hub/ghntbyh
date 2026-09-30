import { createHmac, randomBytes, timingSafeEqual, createHash } from 'node:crypto';

export const TOPICS = ['Retirement planning', 'Investment planning', 'Tax planning', 'Insurance', 'Pension / severance', 'Estate / wealth transfer', 'Young family planning', 'Other'];
export const METHODS = ['Email', 'Phone'];

// Remove control characters and collapse whitespace; never trust lengths from the client.
export const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max);
export const oneLine = (v, max) => clean(v, max).replace(/[\r\n\u2028\u2029]+/g, ' ');

export function validate(b) {
  const errors = {};
  const out = {
    name: oneLine(b.name, 100), email: oneLine(b.email, 200).toLowerCase(), phone: oneLine(b.phone, 30),
    topic: oneLine(b.topic, 60), contactMethod: oneLine(b.contactMethod, 10) || 'Email', message: clean(b.message, 1500),
  };
  if (!out.name) errors.name = 'Please enter your name.';
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(out.email)) errors.email = 'Please enter a valid email address.';
  if (out.phone && !/^[\d\s()+\-.extEXT]{7,30}$/.test(out.phone)) errors.phone = 'Please check the phone number.';
  if (!TOPICS.includes(out.topic)) errors.topic = 'Please choose a topic.';
  if (!METHODS.includes(out.contactMethod)) errors.contactMethod = 'Please choose a contact method.';
  if (b.consent !== true) errors.consent = 'Please confirm to continue.';
  return { ok: !Object.keys(errors).length, errors, value: out };
}

// Sliding-window limiter, in memory. For multiple instances, back with a shared store.
export function rateLimiter(limit, windowMs, now = () => Date.now()) {
  const hits = new Map();
  return (key) => {
    const t = now(), arr = (hits.get(key) || []).filter((x) => t - x < windowMs);
    if (arr.length >= limit) { hits.set(key, arr); return false; }
    arr.push(t); hits.set(key, arr);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k);
    return true;
  };
}

// Double-submit CSRF token: HttpOnly cookie holds a nonce, the page holds nonce.ts.hmac.
export function csrf(secret, now = () => Date.now()) {
  const sign = (s) => createHmac('sha256', secret).update(s).digest('base64url');
  return {
    issue() { const nonce = randomBytes(18).toString('base64url'), ts = now(); const p = `${nonce}.${ts}`; return { nonce, token: `${p}.${sign(p)}` }; },
    check(token, cookieNonce, minAgeMs = 2500, maxAgeMs = 2 * 3600e3) {
      const [nonce, ts, mac] = String(token || '').split('.');
      if (!nonce || !ts || !mac || !cookieNonce) return 'invalid';
      const a = Buffer.from(mac), b = Buffer.from(sign(`${nonce}.${ts}`));
      if (a.length !== b.length || !timingSafeEqual(a, b)) return 'invalid';
      if (nonce !== cookieNonce) return 'invalid';
      const age = now() - Number(ts);
      if (age < minAgeMs) return 'too-fast';
      if (age > maxAgeMs) return 'expired';
      return 'ok';
    },
  };
}

export const fingerprint = (v) => createHash('sha256').update([v.email, v.topic, v.message].join('|')).digest('hex');

export function emailBody(v, meta) {
  return [
    'New consultation request from westdalefinancial.com', '',
    `Name: ${v.name}`, `Email: ${v.email}`, `Phone: ${v.phone || '(not provided)'}`,
    `Topic: ${v.topic}`, `Preferred contact: ${v.contactMethod}`, '', 'Message:', v.message || '(none)', '',
    `Received: ${meta.at}`, 'Consent to be contacted was given on the form.',
  ].join('\n');
}

export async function sendEmail(cfg, v, fetchImpl = fetch) {
  const r = await fetchImpl('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${cfg.resendKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: cfg.emailFrom, to: [cfg.emailTo], reply_to: v.email, subject: `Consultation request: ${v.topic}`, text: emailBody(v, { at: new Date().toISOString() }) }),
    signal: AbortSignal.timeout(10000),
  });
  if (!r.ok) throw new Error(`email provider ${r.status}`);
}

export async function verifyTurnstile(secret, token, ip, fetchImpl = fetch) {
  if (!token) return false;
  const r = await fetchImpl('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip || '' }), signal: AbortSignal.timeout(8000),
  });
  return r.ok && (await r.json()).success === true;
}
