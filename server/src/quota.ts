/**
 * Compteur global (un seul objet, « global ») : combien de jetons Azure ont été délivrés aujourd'hui.
 * Garde-fou de facturation : au-delà du plafond, le service répond 429 jusqu'au lendemain (UTC) et l'application
 * continue sans Azure (reconnaissance du navigateur + courbe de la voix).
 */
import { DurableObject } from 'cloudflare:workers';
import type { Env } from './env';

export class Quota extends DurableObject<Env> {
  async take(limit: number): Promise<{ ok: boolean; used: number }> {
    const day = new Date().toISOString().slice(0, 10);
    const cur = (await this.ctx.storage.get<{ day: string; n: number }>('count')) ?? { day, n: 0 };
    const n = cur.day === day ? cur.n : 0;
    if (n >= limit) return { ok: false, used: n };
    await this.ctx.storage.put('count', { day, n: n + 1 });
    return { ok: true, used: n + 1 };
  }
}
