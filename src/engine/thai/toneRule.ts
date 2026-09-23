/**
 * Règle de ton du thaï : la seule fonction qui décide du ton d'une syllabe.
 */
import type { ConsonantClass, ToneId, ToneWord } from '@/content/types';

/**
 * @param cls classe effective de la consonne initiale (ห นำ → H, อ นำ → M)
 * @param live syllabe vivante ?
 * @param long voyelle longue ?
 * @param mark marque de ton : 0 aucune, 1 ไม้เอก, 2 ไม้โท, 3 ไม้ตรี, 4 ไม้จัตวา
 * @returns le ton, ou null si la combinaison n'existe pas
 */
export function toneRule(cls: ConsonantClass, live: boolean, long: boolean, mark: number): ToneId | null {
  if (mark === 1) return cls === 'L' ? 'F' : 'L';
  if (mark === 2) return cls === 'L' ? 'H' : 'F';
  if (mark === 3) return cls === 'M' ? 'H' : null;
  if (mark === 4) return cls === 'M' ? 'R' : null;
  if (live) return cls === 'H' ? 'R' : 'M';
  if (cls === 'L') return long ? 'F' : 'H';
  return 'L';
}

export const toneOfWord = (w: ToneWord): ToneId => toneRule(w.cls, w.live, w.long, w.mark) ?? 'M';

/**
 * Identifiant de la règle appliquée (sert à suivre la maîtrise des règles, pas seulement des mots).
 *   "rule:M|live"  "rule:L|dead-short"  "rule:H|m1" …
 */
export function ruleKeyOf(w: { cls: ConsonantClass; live: boolean; long: boolean; mark: number }): string {
  if (w.mark) return `rule:${w.cls}|m${w.mark}`;
  if (w.live) return `rule:${w.cls}|live`;
  if (w.cls === 'L') return `rule:L|${w.long ? 'dead-long' : 'dead-short'}`;
  return `rule:${w.cls}|dead`;
}

/** Toutes les règles de ton existantes, dans l'ordre pédagogique. */
export const ALL_RULE_KEYS = [
  'rule:M|live', 'rule:L|live', 'rule:H|live',
  'rule:M|dead', 'rule:H|dead', 'rule:L|dead-short', 'rule:L|dead-long',
  'rule:M|m1', 'rule:H|m1', 'rule:L|m1', 'rule:M|m2', 'rule:H|m2', 'rule:L|m2', 'rule:M|m3', 'rule:M|m4',
];

export interface ToneStep {
  kind: 'class' | 'mark' | 'live' | 'length' | 'result' | 'note';
  text: { fr: string };
}

const CLS_FR: Record<ConsonantClass, string> = { M: 'moyenne', H: 'haute', L: 'basse' };
const TONE_FR: Record<ToneId, string> = { M: 'moyen', L: 'bas', F: 'descendant', H: 'haut', R: 'montant' };
const MARK_NAMES = ['', 'ไม้เอก (่)', 'ไม้โท (้)', 'ไม้ตรี (๊)', 'ไม้จัตวา (๋)'];

/** Étapes de raisonnement qui mènent au ton d'un mot analysé. */
export function explainTone(w: ToneWord): ToneStep[] {
  const tone = toneOfWord(w);
  const steps: ToneStep[] = [];
  const nam = w.note?.fr && /นำ/.test(w.note.fr) ? ` (${w.note.fr.replace(/[.\s]+$/, '')})` : '';
  steps.push({ kind: 'class', text: { fr: `Consonne initiale de classe ${CLS_FR[w.cls]}${nam}.` } });
  if (w.mark) steps.push({ kind: 'mark', text: { fr: `Marque de ton ${MARK_NAMES[w.mark]} : elle décide seule, avec la classe.` } });
  else {
    steps.push({ kind: 'live', text: { fr: `Pas de marque de ton. Syllabe ${w.live ? 'vivante' : 'morte'}.` } });
    if (!w.live && w.cls === 'L') steps.push({ kind: 'length', text: { fr: `Classe basse + syllabe morte : la durée compte. Voyelle ${w.long ? 'longue' : 'courte'}.` } });
  }
  steps.push({ kind: 'result', text: { fr: `Résultat : ton ${TONE_FR[tone]}.` } });
  if (w.note?.fr && !/นำ/.test(w.note.fr)) steps.push({ kind: 'note', text: { fr: w.note.fr } });
  return steps;
}

export function ruleLabel(key: string): { fr: string } {
  const [c, k] = key.replace(/^rule:/, '').split('|');
  const cls = 'classe ' + CLS_FR[c as ConsonantClass];
  if (k[0] === 'm') return { fr: cls + ' + ' + MARK_NAMES[+k[1]] };
  const rest: Record<string, string> = { live: 'syllabe vivante', dead: 'syllabe morte', 'dead-long': 'syllabe morte, voyelle longue', 'dead-short': 'syllabe morte, voyelle courte' };
  return { fr: cls + ', ' + rest[k] };
}

export const toneNameFr = (t: ToneId) => TONE_FR[t];
export const classNameFr = (c: ConsonantClass) => CLS_FR[c];
