// Dependency-free server: serves the static site with security headers and handles the
// consultation form. All secrets come from environment variables (see .env.example).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validate, rateLimiter, csrf, fingerprint, sendEmail, verifyTurnstile } from './lib.mjs';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const env = process.env, prod = env.NODE_ENV === 'production';
const cfg = {
  port: Number(env.PORT) || 3000,
  emailTo: env.EMAIL_TO || 'steve@westdalefinancial.com',
  emailFrom: env.EMAIL_FROM || '',
  resendKey: env.RESEND_API_KEY || '',
  turnstileSecret: env.TURNSTILE_SECRET || '',
  turnstileSiteKey: env.TURNSTILE_SITE_KEY || '',
  origins: (env.ALLOWED_ORIGINS || 'https://www.westdalefinancial.com,https://westdalefinancial.com').split(',').map((s) => s.trim()).filter(Boolean),
  trustProxy: env.TRUST_PROXY === '1',
};
if (!env.CSRF_SECRET && prod) { console.error('CSRF_SECRET is required in production.'); process.exit(1); }
const secret = env.CSRF_SECRET || randomBytes(32).toString('hex');
if (!env.CSRF_SECRET) console.warn('CSRF_SECRET not set; using a random per-process secret (development only).');
const emailReady = !!(cfg.resendKey && cfg.emailFrom);
if (!emailReady) console.warn('Email is NOT configured (RESEND_API_KEY / EMAIL_FROM). Submissions will be refused with 503.');

const tokens = csrf(secret);
const limitSubmit = rateLimiter(8, 10 * 60e3), limitConfig = rateLimiter(60, 10 * 60e3), limitGlobal = rateLimiter(200, 3600e3);
const recent = new Map();

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };
const PUBLIC = [/^\/index\.html$/, /^\/(privacy|terms|disclosures)\.html$/, /^\/client-planner\/index\.html$/, /^\/assets\/.+/, /^\/robots\.txt$/, /^\/sitemap\.xml$/, /^\/404\.html$/];

function headers(extra = {}) {
  const ts = cfg.turnstileSiteKey ? ' https://challenges.cloudflare.com' : '';
  return {
    'Content-Security-Policy': `default-src 'self'; script-src 'self'${ts}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src${ts || " 'none'"}; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'${prod ? '; upgrade-insecure-requests' : ''}`,
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin', 'X-Frame-Options': 'DENY',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), interest-cohort=()',
    'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Resource-Policy': 'same-origin',
    ...(prod ? { 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' } : {}), ...extra,
  };
}
const send = (res, code, body, extra = {}) => { res.writeHead(code, headers(extra)); res.end(body); };
const json = (res, code, obj, extra = {}) => send(res, code, JSON.stringify(obj), { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra });
const ipOf = (req) => (cfg.trustProxy && String(req.headers['x-forwarded-for'] || '').split(',').pop().trim()) || req.socket.remoteAddress || 'unknown';
const cookies = (req) => Object.fromEntries(String(req.headers.cookie || '').split(';').map((c) => c.trim().split('=')).filter((p) => p[0]));
const originOk = (req) => { const o = req.headers.origin; if (!o) return false; return cfg.origins.includes(o) || (!prod && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(o)); };

async function readBody(req, max = 8192) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > max) throw Object.assign(new Error('too large'), { code: 413 }); chunks.push(c); }
  return Buffer.concat(chunks).toString('utf8');
}

async function consultation(req, res) {
  const ip = ipOf(req);
  if (!limitGlobal('all') || !limitSubmit(ip)) return json(res, 429, { message: 'Too many requests. Please try again later or email steve@westdalefinancial.com.' });
  if (!originOk(req)) return json(res, 403, { message: 'Request not allowed.' });
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) return json(res, 415, { message: 'Unsupported request.' });
  let b;
  try { b = JSON.parse(await readBody(req)); } catch (e) { return json(res, e.code === 413 ? 413 : 400, { message: 'Invalid request.' }); }
  if (!b || typeof b !== 'object') return json(res, 400, { message: 'Invalid request.' });
  const c = tokens.check(req.headers['x-csrf-token'], cookies(req).wd_csrf);
  if (c === 'too-fast') return json(res, 429, { message: 'Please take a moment, then submit again.' });
  if (c !== 'ok') return json(res, 403, { message: 'Your session expired. Please reload the page and try again.' });
  if (typeof b.website === 'string' && b.website.trim()) return json(res, 200, { ok: true }); // honeypot: pretend success
  if (cfg.turnstileSecret) { let ok = false; try { ok = await verifyTurnstile(cfg.turnstileSecret, String(b.turnstile || ''), ip); } catch {} if (!ok) return json(res, 400, { message: 'Please complete the security check and try again.' }); }
  const v = validate(b);
  if (!v.ok) return json(res, 422, { errors: v.errors, message: 'Please check the highlighted fields.' });
  const fp = fingerprint(v.value), now = Date.now();
  for (const [k, t] of recent) if (now - t > 10 * 60e3) recent.delete(k);
  if (recent.has(fp)) return json(res, 200, { ok: true }); // duplicate: acknowledge, don't resend
  if (!emailReady) { console.error('Consultation refused: email not configured.'); return json(res, 503, { message: 'Online requests are temporarily unavailable. Please email steve@westdalefinancial.com.' }); }
  try { await sendEmail(cfg, v.value); } catch (e) { console.error('Email send failed:', e.message); return json(res, 502, { message: 'We couldn’t send your request. Please email steve@westdalefinancial.com.' }); }
  recent.set(fp, now);
  return json(res, 200, { ok: true });
}

async function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  if (p === '/') p = '/index.html';
  p = normalize(p);
  if (p.includes('\0') || !PUBLIC.some((r) => r.test(p))) return notFound(res);
  const file = join(ROOT, p);
  if (!file.startsWith(ROOT + sep)) return notFound(res);
  try {
    const st = await stat(file); if (!st.isFile()) return notFound(res);
    const body = await readFile(file);
    const long = p.startsWith('/assets/') && !p.endsWith('.html');
    send(res, 200, req.method === 'HEAD' ? undefined : body, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': long ? 'public, max-age=86400' : 'no-cache' });
  } catch { notFound(res); }
}
async function notFound(res) {
  try { send(res, 404, await readFile(join(ROOT, '404.html')), { 'Content-Type': TYPES['.html'] }); } catch { send(res, 404, 'Not found', { 'Content-Type': 'text/plain' }); }
}

export const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://x');
    if (url.pathname === '/api/config' && req.method === 'GET') {
      if (!limitConfig(ipOf(req))) return json(res, 429, { message: 'Too many requests.' });
      const t = tokens.issue();
      return json(res, 200, { csrf: t.token, turnstileSiteKey: cfg.turnstileSiteKey || null }, { 'Set-Cookie': `wd_csrf=${t.nonce}; Path=/api; HttpOnly; SameSite=Strict; Max-Age=7200${prod ? '; Secure' : ''}` });
    }
    if (url.pathname === '/api/consultation') return req.method === 'POST' ? await consultation(req, res) : json(res, 405, { message: 'Method not allowed.' }, { Allow: 'POST' });
    if (url.pathname.startsWith('/api/')) return json(res, 404, { message: 'Not found.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return await serveStatic(req, res, url);
  } catch (e) { console.error('Unhandled error:', e.message); json(res, 500, { message: 'Something went wrong.' }); }
});
server.requestTimeout = 15000; server.headersTimeout = 10000;
if (import.meta.url === `file://${process.argv[1]}`) server.listen(cfg.port, () => console.log(`Westdale site on http://localhost:${cfg.port}`));
