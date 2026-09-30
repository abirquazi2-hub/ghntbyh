// Runtime-agnostic request handlers shared by the Node server and the Netlify Functions.
// A request is { headers, ip, raw } where raw is the body string; a result is { status, body, headers }.
import { randomBytes } from 'node:crypto';
import { validate, rateLimiter, csrf, fingerprint, sendEmail, verifyTurnstile } from './lib.mjs';

export function loadConfig(env = process.env) {
  const prod = env.NODE_ENV === 'production' || !!env.NETLIFY;
  const origins = (env.ALLOWED_ORIGINS || 'https://www.westdalefinancial.com,https://westdalefinancial.com').split(',').map((s) => s.trim());
  for (const k of ['URL', 'DEPLOY_PRIME_URL', 'DEPLOY_URL']) if (env[k]) origins.push(env[k]); // Netlify-provided site URLs
  const cfg = {
    prod, origins: origins.filter(Boolean),
    emailTo: env.EMAIL_TO || 'steve@westdalefinancial.com', emailFrom: env.EMAIL_FROM || '', resendKey: env.RESEND_API_KEY || '',
    turnstileSecret: env.TURNSTILE_SECRET || '', turnstileSiteKey: env.TURNSTILE_SITE_KEY || '',
    secret: env.CSRF_SECRET || '',
  };
  if (!cfg.secret) {
    if (prod) throw new Error('CSRF_SECRET is required in production.');
    cfg.secret = randomBytes(32).toString('hex');
    console.warn('CSRF_SECRET not set; using a random per-process secret (development only).');
  }
  cfg.emailReady = !!(cfg.resendKey && cfg.emailFrom);
  if (!cfg.emailReady) console.warn('Email is NOT configured (RESEND_API_KEY / EMAIL_FROM). Submissions will be refused with 503.');
  return cfg;
}

const res = (status, obj, headers = {}) => ({ status, body: JSON.stringify(obj), headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers } });
const cookies = (h) => Object.fromEntries(String(h.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]));

export function createHandlers(cfg) {
  const tokens = csrf(cfg.secret);
  const limitSubmit = rateLimiter(8, 10 * 60e3), limitConfig = rateLimiter(60, 10 * 60e3), limitGlobal = rateLimiter(200, 3600e3);
  const recent = new Map();
  const originOk = (h) => { const o = h.origin; return !!o && (cfg.origins.includes(o) || (!cfg.prod && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o))); };

  return {
    config(req) {
      if (!limitConfig(req.ip)) return res(429, { message: 'Too many requests.' });
      const t = tokens.issue();
      return res(200, { csrf: t.token, turnstileSiteKey: cfg.turnstileSiteKey || null }, { 'Set-Cookie': `wd_csrf=${t.nonce}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=7200${cfg.prod ? '; Secure' : ''}` });
    },
    async consultation(req) {
      const h = req.headers;
      if (!limitGlobal('all') || !limitSubmit(req.ip)) return res(429, { message: 'Too many requests. Please try again later or email steve@westdalefinancial.com.' });
      if (!originOk(h)) return res(403, { message: 'Request not allowed.' });
      if (!String(h['content-type'] || '').startsWith('application/json')) return res(415, { message: 'Unsupported request.' });
      if (req.raw.length > 8192) return res(413, { message: 'Invalid request.' });
      let b; try { b = JSON.parse(req.raw); } catch { return res(400, { message: 'Invalid request.' }); }
      if (!b || typeof b !== 'object') return res(400, { message: 'Invalid request.' });
      const c = tokens.check(h['x-csrf-token'], cookies(h).wd_csrf);
      if (c === 'too-fast') return res(429, { message: 'Please take a moment, then submit again.' });
      if (c !== 'ok') return res(403, { message: 'Your session expired. Please reload the page and try again.' });
      if (typeof b.website === 'string' && b.website.trim()) return res(200, { ok: true }); // honeypot: pretend success
      if (cfg.turnstileSecret) { let ok = false; try { ok = await verifyTurnstile(cfg.turnstileSecret, String(b.turnstile || ''), req.ip); } catch {} if (!ok) return res(400, { message: 'Please complete the security check and try again.' }); }
      const v = validate(b);
      if (!v.ok) return res(422, { errors: v.errors, message: 'Please check the highlighted fields.' });
      const fp = fingerprint(v.value), now = Date.now();
      for (const [k, t] of recent) if (now - t > 10 * 60e3) recent.delete(k);
      if (recent.has(fp)) return res(200, { ok: true }); // duplicate: acknowledge, don't resend
      if (!cfg.emailReady) { console.error('Consultation refused: email not configured.'); return res(503, { message: 'Online requests are temporarily unavailable. Please email steve@westdalefinancial.com.' }); }
      try { await sendEmail(cfg, v.value); } catch (e) { console.error('Email send failed:', e.message); return res(502, { message: 'We couldn\u2019t send your request. Please email steve@westdalefinancial.com.' }); }
      recent.set(fp, now);
      return res(200, { ok: true });
    },
  };
}
