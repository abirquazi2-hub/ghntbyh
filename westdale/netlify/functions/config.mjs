import { loadConfig, createHandlers } from '../../server/handlers.mjs';

const api = createHandlers(loadConfig());

export default async (req, context) => {
  if (req.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const r = api.config({ headers: Object.fromEntries(req.headers), ip: context.ip });
  return new Response(r.body, { status: r.status, headers: r.headers });
};
