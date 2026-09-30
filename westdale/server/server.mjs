// Dependency-free server: serves the static site with security headers and handles the
// consultation form. All secrets come from environment variables (see .env.example).
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig, createHandlers } from './handlers.mjs';

const ROOT = resolve(fileURLToPath(new URL('../dist', import.meta.url))); // run `npm run build` first
const env = process.env, prod = env.NODE_ENV === 'production';
const cfg = loadConfig(env);
const port = Number(env.PORT) || 3000, trustProxy = env.TRUST_PROXY === '1';
const api = createHandlers(cfg);

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json' };

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

async function readBody(req, max = 8192) {
  let size = 0; const chunks = [];
  for await (const c of req) { size += c.length; if (size > max) return null; chunks.push(c); }
  return Buffer.concat(chunks).toString('utf8');
}
const ipOf = (req) => (trustProxy && String(req.headers['x-forwarded-for'] || '').split(',').pop().trim()) || req.socket.remoteAddress || 'unknown';
const relay = (res, r) => { res.writeHead(r.status, headers(r.headers)); res.end(r.body); };

async function serveStatic(req, res, url) {
  let p = decodeURIComponent(url.pathname);
  if (!p.endsWith('/') && !extname(p)) { res.writeHead(301, headers({ Location: p + '/' + url.search })); return res.end(); }
  if (p.endsWith('/')) p += 'index.html';
  p = normalize(p);
  if (p.includes('\0') || p.split(sep).some((seg) => seg.startsWith('.'))) return notFound(res);
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
      return relay(res, api.config({ headers: req.headers, ip: ipOf(req) }));
    }
    if (url.pathname === '/api/consultation') { if (req.method !== 'POST') return json(res, 405, { message: 'Method not allowed.' }, { Allow: 'POST' }); const raw = await readBody(req); return raw === null ? json(res, 413, { message: 'Invalid request.' }) : relay(res, await api.consultation({ headers: req.headers, ip: ipOf(req), raw })); }
    if (url.pathname.startsWith('/api/')) return json(res, 404, { message: 'Not found.' });
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'Method not allowed', { Allow: 'GET, HEAD' });
    return await serveStatic(req, res, url);
  } catch (e) { console.error('Unhandled error:', e.message); json(res, 500, { message: 'Something went wrong.' }); }
});
server.requestTimeout = 15000; server.headersTimeout = 10000;
if (import.meta.url === `file://${process.argv[1]}`) server.listen(port, () => console.log(`Westdale site on http://localhost:${port}`));
