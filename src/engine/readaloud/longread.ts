/**
 * Lecture longue à voix haute : un texte entier, phrase par phrase. Ce qui a été entendu est aligné mot à mot sur le
 * texte (align.ts) ; on en tire les mots lus, déformés ou manqués, le débit (syllabes par minute de parole) et les
 * pauses au milieu des phrases.
 *
 * Ce qu'on peut promettre honnêtement : les mots manqués sont fiables, les mots déformés en partie seulement, débit et
 * pauses sont mesurés sur l'audio. Les tons dans la parole enchaînée ne sont pas jugés (la courbe d'une syllabe est
 * déformée par ses voisines) ; Azure, s'il est branché, donne une précision par mot.
 */
import { lev } from '../util';
import { normThai } from '../thai/script';
import { syllableCount } from '../thai/reading';
import { alignHeard } from './align';

export interface LrWord { thai: string; rom: string; gloss?: string }
export type LrVerdict = 'ok' | 'near' | 'missed' | 'none';
export interface LrWordResult { verdict: LrVerdict; heard?: string; accuracy?: number }

const sim = (a: string, b: string) => (!a || !b ? 0 : a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

/** Mots lus d'une phrase d'après le texte entendu (toutes les hypothèses concaténées dans l'ordre). */
export function judgeSentence(words: LrWord[], heard: string): LrWordResult[] {
  if (!normThai(heard)) return words.map(() => ({ verdict: 'none' }));
  const parts = alignHeard(words.map((w) => w.thai), heard);
  return words.map((w, i) => {
    const p = parts[i];
    if (!p) return { verdict: 'missed' };
    const s = sim(normThai(p), normThai(w.thai));
    return { verdict: s >= 0.999 ? 'ok' : s >= 0.5 ? 'near' : 'missed', heard: p };
  });
}

/** Part des mots reconnus : sert à passer tout seul à la phrase suivante quand elle est lue. */
export const coverage = (r: LrWordResult[]) => (r.length ? r.filter((x) => x.verdict === 'ok' || x.verdict === 'near').length / r.length : 0);

export interface Segment { start: number; end: number }
/** Débit et pauses d'une phrase à partir de ses segments de parole (secondes). */
export function paceOf(words: LrWord[], segs: Segment[]): { syllables: number; speech: number; perMin: number; pauses: number; longPauses: number } {
  const syllables = words.reduce((a, w) => a + Math.max(1, syllableCount(w.thai)), 0);
  const speech = segs.reduce((a, s) => a + Math.max(0, s.end - s.start), 0);
  let pauses = 0, longPauses = 0;
  for (let i = 1; i < segs.length; i++) { const gap = segs[i].start - segs[i - 1].end; if (gap > 0.5) pauses++; if (gap > 1.2) longPauses++; }
  return { syllables, speech, perMin: speech > 0.3 ? Math.round((syllables / speech) * 60) : 0, pauses, longPauses };
}

/** Bilan d'un texte : mots justes / déformés / manqués, débit moyen, pauses. */
export function summarizeText(sentences: { words: LrWord[]; results: LrWordResult[]; segs: Segment[] }[]) {
  let ok = 0, near = 0, missed = 0, none = 0, syl = 0, speech = 0, pauses = 0, longPauses = 0;
  const problems: { word: LrWord; verdict: LrVerdict; heard?: string }[] = [];
  for (const s of sentences) {
    s.results.forEach((r, i) => {
      if (r.verdict === 'ok') ok++; else if (r.verdict === 'near') near++; else if (r.verdict === 'missed') missed++; else none++;
      if ((r.verdict === 'near' || r.verdict === 'missed') && !problems.some((p) => p.word.thai === s.words[i].thai)) problems.push({ word: s.words[i], verdict: r.verdict, heard: r.heard });
    });
    const p = paceOf(s.words, s.segs);
    syl += p.syllables * (s.segs.length ? 1 : 0); speech += p.speech; pauses += p.pauses; longPauses += p.longPauses;
  }
  const judged = ok + near + missed;
  return { ok, near, missed, none, judged, score: judged ? Math.round((100 * (ok + 0.5 * near)) / judged) : 0, perMin: speech > 1 ? Math.round((syl / speech) * 60) : 0, pauses, longPauses, problems };
}
