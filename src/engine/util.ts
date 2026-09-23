/** Utilitaires génériques (sans dépendance au DOM). */

export const rnd = (n: number) => Math.floor(Math.random() * n);

export function shuffle<T>(a: readonly T[]): T[] {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export const pick = <T>(a: readonly T[]): T => a[rnd(a.length)];

/** Tire n éléments distincts, en servant d'abord ceux jamais vus puis les plus anciens (clé `seen`). */
export function sample<T>(a: readonly T[], n: number, seen?: Record<string, number>, key?: (x: T) => string): T[] {
  const sh = shuffle(a);
  if (!seen || !key || a.length <= n) return sh.slice(0, n);
  return sh.sort((x, y) => (seen[key(x)] || 0) - (seen[key(y)] || 0)).slice(0, n);
}

export const uniq = <T>(a: readonly T[]): T[] => [...new Set(a)];

export const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
export const pct = (x: number) => Math.round(clamp(x || 0, 0, 1) * 100);

export const DAY = 86_400_000;
export const dayKey = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
export const todayKey = () => dayKey(new Date());
export const daysAgoKey = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dayKey(d);
};

export const stripAccents = (s: string) =>
  String(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

/** Forme « clavier simple » d'une transcription : sans tons, sans tirets, voyelles non doublées (sawatdi, khopkhun…). */
export const asciiRom = (s: string) =>
  stripAccents(s)
    .replace(/ɔ/g, 'o')
    .replace(/ɛ/g, 'e')
    .replace(/ə/g, 'e')
    .replace(/ʉ/g, 'u')
    .replace(/[^a-z]/g, '')
    .replace(/(.)\1+/g, '$1');

/** Distance de Levenshtein. */
export function lev(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[n];
}

/** Choisit n distracteurs distincts de `right` selon une clé d'unicité. */
export function withDistractors<T>(pool: readonly T[], right: T, n: number, key: (x: T) => string): T[] {
  const seen = new Set([key(right)]);
  const out: T[] = [];
  for (const x of shuffle(pool)) {
    if (out.length >= n) break;
    const k = key(x);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(x);
    }
  }
  return out;
}

export const plural = (n: number, s: string, p = s + 's') => `${n} ${n > 1 ? p : s}`;
