/**
 * Lecture à voix haute — la file d'une série. Une lecture ratée revient quelques éléments plus loin (8 puis 14),
 * jusqu'à deux fois ; la séance apprend ainsi, en direct, ce qui pose problème. Le reste suit l'ordre prévu.
 */
import type { RaItem } from './compose';
import type { RaJudgement } from './judge';

export interface RaSlot { item: RaItem; retry: number; result?: RaJudgement }

export const RETRY_GAPS = [8, 14];

export function initialQueue(items: RaItem[]): RaSlot[] { return items.map((item) => ({ item, retry: 0 })); }

/**
 * Programme le retour d'une lecture ratée (ou approximative) placée en `pos`. Ne fait rien si elle est déjà
 * reprogrammée plus loin, ou si elle a épuisé ses reprises. Renvoie la nouvelle file.
 */
export function scheduleRetry(q: RaSlot[], pos: number): RaSlot[] {
  const s = q[pos];
  if (!s || s.retry >= RETRY_GAPS.length) return q;
  if (q.slice(pos + 1).some((x) => x.item.key === s.item.key && !x.result)) return q;
  const at = Math.min(q.length, pos + 1 + RETRY_GAPS[s.retry]);
  const next = q.slice();
  next.splice(at, 0, { item: s.item, retry: s.retry + 1 });
  return next;
}

export interface RaSummary {
  total: number; ok: number; near: number; ko: number; none: number;
  /** éléments à retravailler : raté au moins une fois, avec le dernier verdict */
  weak: { item: RaItem; tries: number; lastVerdict: string; details: string[] }[];
  /** maîtrise par étiquette (consonne, voyelle, règle de ton…) : lectures justes / lectures jugées */
  tags: Record<string, { ok: number; n: number }>;
}

export function summarize(q: RaSlot[]): RaSummary {
  const done = q.filter((s) => s.result);
  const count = (v: string) => done.filter((s) => s.result!.verdict === v).length;
  const byKey = new Map<string, RaSlot[]>();
  for (const s of done) byKey.set(s.item.key, [...(byKey.get(s.item.key) ?? []), s]);
  const weak: RaSummary['weak'] = [];
  for (const [, slots] of byKey) {
    const bad = slots.filter((s) => s.result!.verdict === 'ko' || s.result!.verdict === 'near');
    if (!bad.length) continue;
    weak.push({ item: slots[0].item, tries: slots.length, lastVerdict: slots[slots.length - 1].result!.verdict, details: [...new Set(bad.map((s) => s.result!.detail).filter((d): d is string => !!d))] });
  }
  weak.sort((a, b) => (a.lastVerdict === 'ok' ? 1 : 0) - (b.lastVerdict === 'ok' ? 1 : 0) || b.tries - a.tries);
  const tags: RaSummary['tags'] = {};
  for (const s of done) {
    if (s.result!.verdict === 'none') continue;
    for (const t of s.item.tags) { const r = (tags[t] ??= { ok: 0, n: 0 }); r.n++; if (s.result!.verdict === 'ok') r.ok++; }
  }
  return { total: done.length, ok: count('ok'), near: count('near'), ko: count('ko'), none: count('none'), weak, tags };
}
