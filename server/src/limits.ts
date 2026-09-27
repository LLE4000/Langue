/**
 * Limites simples par adresse IP, en mémoire de l'instance du Worker (au mieux : chaque instance compte de son côté).
 * Suffisant pour freiner un script maladroit ; le vrai plafond de dépense est le compteur global (quota.ts).
 */
export class RateLimiter {
  private hits = new Map<string, { n: number; reset: number }>();
  constructor(private readonly max: number, private readonly windowMs: number) {}

  allow(key: string, now: number): boolean {
    if (this.hits.size > 5000) for (const [k, v] of this.hits) if (v.reset <= now) this.hits.delete(k);
    const cur = this.hits.get(key);
    if (!cur || cur.reset <= now) { this.hits.set(key, { n: 1, reset: now + this.windowMs }); return true; }
    if (cur.n >= this.max) return false;
    cur.n++;
    return true;
  }
}

/** Origine autorisée ? (liste séparée par des virgules ; « * » accepte tout, à réserver aux essais). */
export function originAllowed(origin: string | null, list: string): boolean {
  if (!origin) return false;
  const allowed = list.split(',').map((s) => s.trim().replace(/\/+$/, '')).filter(Boolean);
  return allowed.includes('*') || allowed.includes(origin.replace(/\/+$/, ''));
}

/** Code de salle aléatoire (lettres sans I ni O). */
export function randomCode(letters: string, length: number): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => letters[b % letters.length]).join('');
}
