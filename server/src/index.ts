/**
 * Serveur de Langue (Cloudflare Worker). Trois services, rien d'autre : aucun compte, aucune donnée d'apprentissage.
 *
 *   GET  /                    état du service : { ok, azure, rooms }
 *   GET  /azure-token         jeton Azure Speech de 10 minutes { token, region, expiresAt } — la clé reste ici
 *   POST /rooms               crée une salle et renvoie { code }
 *   GET  /rooms/:code         { code, phase, players, full } ou 404
 *   GET  /rooms/:code/ws      WebSocket de la salle (protocole : protocol.ts)
 *
 * Seules les origines listées dans ALLOWED_ORIGINS (le site de l'application) sont servies.
 */
import { CODE_LENGTH, CODE_LETTERS, isRoomCode, type AzureToken } from './protocol';
import { originAllowed, randomCode, RateLimiter } from './limits';
import type { Env } from './env';
import type { Quota } from './quota';

export { Room } from './room';
export { Quota } from './quota';

const tokenLimiter = new RateLimiter(20, 3600_000); // un appareil garde son jeton ~9 min : 20/h laisse de la marge
const roomLimiter = new RateLimiter(30, 3600_000);
const TOKEN_TTL_MS = 9 * 60_000; // jeton Azure valable 10 min ; on le partage 8 min, l'appareil le garde jusqu'à 9
let cached: { token: string; region: string; fetchedAt: number } | null = null;

function cors(origin: string | null, env: Env): Record<string, string> {
  return originAllowed(origin, env.ALLOWED_ORIGINS)
    ? { 'Access-Control-Allow-Origin': origin!, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }
    : { Vary: 'Origin' };
}

const json = (body: unknown, status: number, headers: Record<string, string>) => Response.json(body, { status, headers: { ...headers, 'Cache-Control': 'no-store' } });

async function azureToken(env: Env, now: number): Promise<AzureToken | null> {
  const key = env.AZURE_SPEECH_KEY, region = (env.AZURE_SPEECH_REGION || '').trim().toLowerCase();
  if (!key || !region) return null;
  if (!cached || now - cached.fetchedAt > 8 * 60_000 || cached.region !== region) {
    const r = await fetch(`https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, { method: 'POST', headers: { 'Ocp-Apim-Subscription-Key': key, 'Content-Length': '0' } });
    if (!r.ok) throw new Error(`Azure a refusé la clé (${r.status})`);
    cached = { token: await r.text(), region, fetchedAt: now };
  }
  return { token: cached.token, region: cached.region, expiresAt: cached.fetchedAt + TOKEN_TTL_MS };
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const origin = req.headers.get('Origin');
    const h = cors(origin, env);
    const now = Date.now();
    const ip = req.headers.get('CF-Connecting-IP') ?? 'inconnu';
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (req.method === 'OPTIONS') return new Response(null, { status: originAllowed(origin, env.ALLOWED_ORIGINS) ? 204 : 403, headers: h });
    if (path === '/' && req.method === 'GET') return json({ ok: true, azure: !!(env.AZURE_SPEECH_KEY && env.AZURE_SPEECH_REGION), rooms: true }, 200, h);
    if (!originAllowed(origin, env.ALLOWED_ORIGINS)) return json({ error: 'origine non autorisée' }, 403, h);

    if (path === '/azure-token' && req.method === 'GET') {
      if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) return json({ error: 'Azure non configuré' }, 503, h);
      if (!tokenLimiter.allow(ip, now)) return json({ error: 'trop de demandes' }, 429, h);
      const quota = env.QUOTA.get(env.QUOTA.idFromName('global')) as unknown as DurableObjectStub<Quota>;
      const q = await quota.take(Number(env.AZURE_TOKENS_PER_DAY) || 600);
      if (!q.ok) return json({ error: 'plafond du jour atteint' }, 429, h);
      try {
        const t = await azureToken(env, now);
        return t ? json(t, 200, h) : json({ error: 'Azure non configuré' }, 503, h);
      } catch (e) {
        return json({ error: (e as Error).message }, 502, h);
      }
    }

    if (path === '/rooms' && req.method === 'POST') {
      if (!roomLimiter.allow(ip, now)) return json({ error: 'trop de salles créées, réessayez plus tard' }, 429, h);
      for (let attempt = 0; attempt < 6; attempt++) {
        const code = randomCode(CODE_LETTERS, CODE_LENGTH);
        const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
        const r = await stub.fetch(`https://room/init?code=${code}`, { method: 'POST' });
        if (r.status === 201) return json({ code }, 201, h);
      }
      return json({ error: 'aucun code libre, réessayez' }, 503, h);
    }

    const m = /^\/rooms\/([A-Za-z]+)(\/ws)?$/.exec(path);
    if (m) {
      const code = m[1].toUpperCase();
      if (!isRoomCode(code)) return json({ error: 'code invalide' }, 400, h);
      const stub = env.ROOMS.get(env.ROOMS.idFromName(code));
      if (m[2]) return stub.fetch(`https://room/ws?code=${code}`, { headers: req.headers }); // 101 : pas d'en-têtes CORS pour un WebSocket
      const r = await stub.fetch(`https://room/info?code=${code}`);
      return json(await r.json(), r.status, h);
    }

    return json({ error: 'introuvable' }, 404, h);
  },
} satisfies ExportedHandler<Env>;
