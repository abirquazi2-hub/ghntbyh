import { loadConfig, createHandlers } from '../../server/handlers.mjs';

const api = createHandlers(loadConfig());

export default async (req, context) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ message: 'Method not allowed.' }), { status: 405, headers: { Allow: 'POST', 'Content-Type': 'application/json' } });
  const r = await api.consultation({ headers: Object.fromEntries(req.headers), ip: context.ip, raw: await req.text() });
  return new Response(r.body, { status: r.status, headers: r.headers });
};
