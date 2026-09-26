/**
 * Lecture à voix haute — jugement d'une lecture, à partir de ce que la reconnaissance a entendu (appareil ou Azure)
 * et, pour le ton d'une syllabe, de la courbe de la voix. Trois verdicts visibles : juste, approximatif, à revoir ;
 * « none » quand rien de comparable n'a été reçu (on ne compte alors ni juste ni faux).
 *
 * Honnêteté : la reconnaissance juge si un Thaï COMPRENDRAIT la syllabe ; si elle entend un voisin exact (même syllabe
 * avec un autre ton, une autre longueur, une consonne ou une finale proche), on sait précisément ce qui a changé.
 * La courbe de hauteur est une indication (« d'après la courbe de votre voix »), jamais présentée comme une mesure sûre.
 */
import type { ToneId } from '@/content/types';
import { lev } from '../util';
import { normThai } from '../thai/script';
import { soundSkeleton } from '../audio/pronunciation';
import { toneFr, variantsOf, type ErrorKind, type RaItem } from './compose';

export type RaVerdict = 'ok' | 'near' | 'ko' | 'none';
export type RaSource = 'asr' | 'azure' | 'pitch' | 'self';
export interface RaJudgement {
  verdict: RaVerdict;
  source: RaSource;
  heard?: string;
  heardRom?: string;
  kind?: ErrorKind | 'other' | 'missing';
  detail?: string;
  /** score Azure 0–100 (précision de la prononciation), quand il existe */
  accuracy?: number;
}
export interface PitchVerdict { predicted: ToneId; expected: ToneId; ok: boolean; similarity: number }

const POLITE = /(ครับ|คับ|ค่ะ|คะ)$/;
const norm = (s: string) => normThai(s).replace(POLITE, '');
const sim = (a: string, b: string) => (!a || !b ? 0 : a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
const shorten = (s: string) => s.replace(/า/g, 'ะ').replace(/ี/g, 'ิ').replace(/ื/g, 'ึ').replace(/ู/g, 'ุ');

/** Jugement d'après la reconnaissance vocale (texte entendu, éventuellement plusieurs hypothèses). */
export function judgeHeard(it: RaItem, alts: string[]): RaJudgement {
  const heardAny = alts.find((a) => a.trim()) ?? '';
  const cands = alts.map(norm).filter(Boolean);
  if (!cands.length) return { verdict: 'none', source: 'asr', heard: heardAny || undefined, detail: heardAny ? 'entendu, mais pas en thaï' : undefined };
  const target = norm(it.thai);
  if (cands.includes(target)) return { verdict: 'ok', source: 'asr', heard: it.thai, heardRom: it.rom };
  const h = cands[0];
  // un voisin exact : on sait ce qui a changé
  const variants = variantsOf(it);
  for (const c of cands.slice(0, 2)) {
    const v = variants.find((x) => norm(x.thai) === c);
    if (v) return { verdict: v.kind === 'tone' || v.kind === 'length' ? 'near' : 'ko', source: 'asr', heard: v.thai, heardRom: v.rom, kind: v.kind, detail: v.detail };
  }
  // mot plus long (« ดาว » pour « ดา ») : la syllabe visée y est, suivie d'autre chose
  if (h.startsWith(target) && h.length <= target.length + 2) return { verdict: 'near', source: 'asr', heard: alts[0], kind: 'other', detail: 'un son de plus à la fin' };
  if (soundSkeleton(h) === soundSkeleton(target)) return { verdict: 'near', source: 'asr', heard: alts[0], kind: 'tone', detail: 'les sons sont justes, le ton entendu est un autre' };
  if (shorten(soundSkeleton(h)) === shorten(soundSkeleton(target))) return { verdict: 'near', source: 'asr', heard: alts[0], kind: 'length', detail: 'autre longueur de voyelle' };
  const s = Math.max(...cands.map((c) => sim(c, target)));
  return s >= 0.66 ? { verdict: 'near', source: 'asr', heard: alts[0], kind: 'other', detail: 'proche, mais pas tout à fait' } : { verdict: 'ko', source: 'asr', heard: alts[0], kind: 'other', detail: 'compris autre chose' };
}

/** Jugement du ton seul d'après la courbe de la voix (syllabes), quand la reconnaissance n'a rien donné. */
export function judgePitch(it: RaItem, p: PitchVerdict | null): RaJudgement {
  if (!p) return { verdict: 'none', source: 'pitch' };
  if (p.ok) return { verdict: 'ok', source: 'pitch', detail: `ton ${toneFr(it.tone)} d’après la courbe de votre voix` };
  return { verdict: p.similarity >= 0.6 ? 'near' : 'ko', source: 'pitch', kind: 'tone', detail: `courbe plutôt ${toneFr(p.predicted)} (attendu : ${toneFr(it.tone)})` };
}

/** Résultat Azure d'un mot (évaluation de prononciation) → verdict. */
export function judgeAzure(accuracy: number, errorType: string, recognized?: string): RaJudgement {
  if (errorType === 'Omission') return { verdict: 'ko', source: 'azure', kind: 'missing', detail: 'non entendu', accuracy: 0 };
  const verdict: RaVerdict = accuracy >= 80 && errorType !== 'Mispronunciation' ? 'ok' : accuracy >= 55 ? 'near' : 'ko';
  return { verdict, source: 'azure', accuracy, heard: recognized, detail: verdict === 'ok' ? undefined : `prononciation à ${Math.round(accuracy)} / 100` };
}

/**
 * Combine les sources : Azure prime (évaluation contrainte par le texte attendu), puis la reconnaissance de
 * l'appareil ; la courbe ne décide que si rien d'autre n'a été reçu, et peut signaler un ton douteux sur un « juste ».
 */
export function combine(asr: RaJudgement | null, pitch: RaJudgement | null, azure: RaJudgement | null): RaJudgement {
  const main = azure && azure.verdict !== 'none' ? azure : asr && asr.verdict !== 'none' ? asr : pitch && pitch.verdict !== 'none' ? pitch : asr ?? pitch ?? { verdict: 'none', source: 'asr' };
  if (main.verdict === 'ok' && main.source !== 'pitch' && pitch && pitch.verdict === 'ko') return { ...main, verdict: 'near', kind: 'tone', detail: `compris, mais ${pitch.detail}` };
  return main;
}
