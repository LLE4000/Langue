/**
 * Répétition espacée et niveau de maîtrise.
 *
 * Chaque élément (lettre, voyelle, mot, mot-ton, nombre, classificateur, règle) possède un état :
 *   - ivl   intervalle courant en jours
 *   - ease  facilité (1.3 – 2.8)
 *   - due   prochaine échéance (ms)
 *   - reps / lapses / streak (bonnes réponses d'affilée)
 *   - q     dernière note 0–4 (0 inconnu · 1 difficile · 2 presque · 3 connu · 4 maîtrisé)
 *   - hist  bits des 8 dernières réponses (1 = juste)
 *
 * La MAÎTRISE (0–1) combine : la note atteinte, la régularité des réponses récentes,
 * le nombre de répétitions et l'oubli estimé depuis la dernière révision.
 */
import { DAY, clamp } from './util';

export interface SrsState {
  ivl: number;
  ease: number;
  due: number;
  reps: number;
  lapses: number;
  streak: number;
  q: number;
  first: number;
  last: number;
  hist: number; // bitfield
}

export type Quality = 0 | 1 | 2 | 3 | 4;

export const MASTERY_BASE = [0, 0.25, 0.5, 0.8, 1];

export function freshSrs(now = Date.now()): SrsState {
  return { ivl: 0, ease: 2.3, due: 0, reps: 0, lapses: 0, streak: 0, q: -1, first: now, last: 0, hist: 0 };
}

/** Applique une note et renvoie le nouvel état (immutable). */
export function rate(prev: SrsState | undefined, q: Quality, now = Date.now()): SrsState {
  const st: SrsState = { ...(prev ?? freshSrs(now)) };
  let ivl = st.ivl;
  if (q === 0) { ivl = 0; st.lapses++; st.ease -= 0.2; st.streak = 0; }
  else if (q === 1) { ivl = 0.5; st.ease -= 0.15; st.streak = 0; }
  else if (q === 2) { ivl = Math.max(1, ivl * 1.3); st.ease -= 0.05; st.streak++; }
  else if (q === 3) { ivl = ivl < 1 ? 3 : ivl * st.ease; st.streak++; }
  else { ivl = Math.max(10, ivl * st.ease * 1.4); st.ease += 0.1; st.streak++; }
  st.ease = clamp(st.ease, 1.3, 2.8);
  st.ivl = Math.min(90, ivl);
  st.q = q;
  st.reps++;
  st.last = now;
  st.hist = ((st.hist << 1) | (q >= 2 ? 1 : 0)) & 0xff;
  st.due = now + (q === 0 ? 60_000 : st.ivl * DAY);
  return st;
}

/** Convertit un résultat d'exercice en note : juste/faux, rapidité, élément déjà connu. */
export function qualityFromAnswer(ok: boolean, prev: SrsState | undefined, seconds?: number): Quality {
  if (!ok) return prev && prev.q >= 3 ? 1 : 0;
  const fast = seconds != null && seconds < 4;
  if (!prev || prev.q < 0) return 3;
  if (prev.streak >= 2 && fast) return 4;
  return 3;
}

const bits = (h: number) => {
  let n = 0, t = 0;
  for (let i = 0; i < 8; i++) if (h & (1 << i)) n++;
  for (let i = 0; i < 8; i++) if (h >> i) t++;
  return { ok: n, total: Math.min(8, t) };
};

/** Estimation d'oubli : 1 juste après révision, décroît au-delà de l'intervalle prévu. */
export function retention(st: SrsState, now = Date.now()): number {
  if (!st.last || st.ivl <= 0) return st.q >= 2 ? 0.6 : 0.3;
  const elapsed = (now - st.last) / DAY;
  const ratio = elapsed / st.ivl; // 1 = à l'échéance
  return clamp(Math.pow(0.9, ratio), 0.2, 1);
}

/** Maîtrise 0–1 d'un élément. */
export function mastery(st: SrsState | undefined, now = Date.now()): number {
  if (!st || st.q < 0) return 0;
  const base = MASTERY_BASE[st.q];
  const { ok, total } = bits(st.hist);
  const regularity = total ? 0.5 + 0.5 * (ok / total) : 0.75;
  const exposure = clamp(0.4 + 0.15 * st.reps, 0.4, 1);
  return clamp(base * regularity * exposure * (0.35 + 0.65 * retention(st, now)), 0, 1);
}

export const isDue = (st: SrsState | undefined, now = Date.now()) => !!st && st.q >= 0 && st.due <= now;
export const isKnown = (st: SrsState | undefined) => !!st && st.q >= 3;
export const isMastered = (st: SrsState | undefined, now = Date.now()) => mastery(st, now) >= 0.8;

/** Niveau de maîtrise lisible : 0 inconnu · 1 en cours · 2 connu · 3 maîtrisé. */
export function masteryTier(m: number): 0 | 1 | 2 | 3 {
  return m >= 0.8 ? 3 : m >= 0.5 ? 2 : m > 0 ? 1 : 0;
}
