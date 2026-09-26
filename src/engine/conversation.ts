/**
 * Conversation guidée parlée : juger une réponse dite au micro dans un dialogue.
 *
 * Plusieurs réponses sont acceptées pour une même réplique (la réplique du dialogue et ses variantes, même sens).
 * On garde la plus proche de ce que la reconnaissance a entendu : juste, approximative (ton ou longueur de voyelle
 * seulement, ou presque tout), ou à reprendre. La particule de politesse finale est facultative.
 */
import { lev } from './util';
import { normThai } from './thai/script';
import { soundSkeleton } from './audio/pronunciation';

export interface Reply { thai: string; rom: string; fr?: string }
export type ReplyVerdict = 'ok' | 'near' | 'ko' | 'none';
export interface ReplyJudgement { verdict: ReplyVerdict; score: number; heard: string; match?: Reply; detail?: string }

const POLITE = /(ครับ|คับ|ค่ะ|คะ|ค่า|นะครับ|นะคะ)$/;
const forms = (s: string) => { const n = normThai(s), b = n.replace(POLITE, ''); return b && b !== n ? [n, b] : [n]; };
const sim = (a: string, b: string) => (!a || !b ? 0 : a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

/**
 * `accepted` : réponses acceptées, jetons de politesse déjà résolus pour l'apprenant.
 * Renvoie la meilleure correspondance, une note sur 10 et une raison lisible.
 */
export function judgeReply(alts: string[], accepted: Reply[]): ReplyJudgement {
  const heard = alts.find((a) => a.trim()) ?? '';
  if (!alts.some((a) => normThai(a))) return { verdict: 'none', score: 0, heard, detail: heard ? 'entendu, mais pas en thaï' : 'rien entendu' };
  let best = { s: 0, a: '', r: accepted[0] as Reply | undefined, fa: '', fr: '' };
  for (const a of alts.slice(0, 3)) for (const r of accepted) for (const fa of forms(a)) for (const fr of forms(r.thai)) {
    const s = sim(fa, fr);
    if (s > best.s) best = { s, a, r, fa, fr };
  }
  const toneOnly = best.s < 0.999 && soundSkeleton(best.fa) === soundSkeleton(best.fr);
  if (best.s >= 0.999) return { verdict: 'ok', score: 10, heard: best.a, match: best.r };
  if (toneOnly) return { verdict: 'near', score: 7, heard: best.a, match: best.r, detail: 'les sons sont justes, un ton est à revoir' };
  if (best.s >= 0.85) return { verdict: 'ok', score: 9, heard: best.a, match: best.r, detail: 'compris (un petit écart)' };
  if (best.s >= 0.65) return { verdict: 'near', score: Math.round(best.s * 10) - 1, heard: best.a, match: best.r, detail: 'presque : une partie de la phrase manque ou diffère' };
  return { verdict: 'ko', score: Math.max(0, Math.round(best.s * 10) - 2), heard: best.a, match: best.r, detail: 'la réponse entendue ne correspond pas' };
}

/** Amorce d'une réponse (aide intermédiaire) : ses premiers mots, pour se lancer. */
export function replyStarter(r: Reply): { thai: string; rom: string } {
  const romWords = r.rom.split(/\s+/).filter(Boolean);
  const n = Math.min(2, Math.max(1, Math.ceil(romWords.length / 4)));
  // on coupe le thaï au prorata de la phonétique (le thaï n'a pas d'espaces entre les mots)
  const cut = Math.max(1, Math.round((r.thai.replace(/\s/g, '').length * romWords.slice(0, n).join('').length) / Math.max(1, romWords.join('').length)));
  return { thai: r.thai.replace(/\s/g, '').slice(0, cut) + '…', rom: romWords.slice(0, n).join(' ') + '…' };
}
