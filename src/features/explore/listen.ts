/**
 * Mode Écoute en boucle : construction de la file de lecture (pure, testable).
 * Une « entrée » = un élément (lettre, voyelle, mot) ; une entrée se lit en plusieurs « prises »
 * (son seul / nom entier, à vitesse normale, lente, très lente).
 */
import type { ListenPrefs } from '@/app/store';
import { CONS_ITEMS, ITEMS, TAUGHT_VOWELS, type LearnItem } from '@/content/th';
import type { SrsState } from '@/engine/srs';

export interface ListenTake { text: string; rate: number; label: string }
export interface ListenEntry { item: LearnItem; takes: ListenTake[] }

export const RATES = { normal: 0.95, slow: 0.6, verySlow: 0.4 } as const;

/** Ce qu'on dit pour un élément : le son seul (ปอ), le nom entier (ปอ ปลา) ou les deux. */
export function textsFor(it: LearnItem, what: ListenPrefs['what']): string[] {
  if (it.kind === 'cons') {
    const sound = it.ref.audioBase + 'อ';
    return what === 'sound' ? [sound] : what === 'name' ? [it.say] : [sound, it.say];
  }
  if (it.kind === 'vow') {
    // La voyelle se lit sur อ ; « nom entier » = สระ + voyelle, comme on l'épelle.
    const sound = it.say;
    const name = 'สระ' + it.say;
    return what === 'sound' ? [sound] : what === 'name' ? [name] : [sound, name];
  }
  return [it.say];
}

export function ratesFor(speeds: ListenPrefs['speeds']): { rate: number; label: string }[] {
  const all = [{ rate: RATES.normal, label: 'normal' }, { rate: RATES.slow, label: 'lent' }, { rate: RATES.verySlow, label: 'très lent' }];
  return all.slice(0, speeds);
}

/** Les éléments d'un ensemble, dans l'ordre classique. */
export function itemsForSet(prefs: Pick<ListenPrefs, 'set' | 'custom'>, srs: Record<string, SrsState>): LearnItem[] {
  switch (prefs.set) {
    case 'cons': return CONS_ITEMS;
    case 'vow': return TAUGHT_VOWELS.map((v) => ITEMS[v.id]).filter(Boolean);
    case 'words': return Object.keys(srs).map((id) => ITEMS[id]).filter((it): it is LearnItem => !!it && (it.kind === 'word' || it.kind === 'clf' || it.kind === 'tone' || it.kind === 'num') && !/…/.test(it.thai));
    case 'custom': return prefs.custom.map((id) => ITEMS[id]).filter(Boolean);
  }
}

function shuffle<T>(a: T[], seed: number): T[] {
  const out = [...a];
  let s = seed || 1;
  for (let i = out.length - 1; i > 0; i--) { s = (s * 1103515245 + 12345) & 0x7fffffff; const j = s % (i + 1); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

export function buildListenQueue(prefs: ListenPrefs, srs: Record<string, SrsState>, seed = Date.now()): ListenEntry[] {
  const items = itemsForSet(prefs, srs);
  const ordered = prefs.order === 'shuffle' ? shuffle(items, seed) : items;
  const rates = ratesFor(prefs.speeds);
  return ordered.map((item) => ({
    item,
    takes: textsFor(item, prefs.what).flatMap((text) => rates.map((r) => ({ text, rate: r.rate, label: r.label }))),
  }));
}
