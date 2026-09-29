/**
 * Lecture à voix haute : préférences locales, séries « Lectures à reprendre » et « Lecture chrono », séance conseillée,
 * et déblocage des séances par les leçons du parcours (jamais une lettre non enseignée).
 */
import { raProgram, series, type RaSession } from '@/engine/readaloud/program';
import type { RaItem } from '@/engine/readaloud/compose';
import { tonesOf } from '@/engine/thai/transcription';
import type { ToneId } from '@/content/types';
import type { ReadAloudState } from '@/app/store';
import type { RaMode, Tempo } from './run';

export interface RaPrefs { mode: Exclude<RaMode, 'chrono'>; tempo: Tempo; rom: boolean }
const KEY = 'langue.readaloud';
export function raPrefs(): RaPrefs {
  try { return { mode: 'listen', tempo: 'mid', rom: false, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return { mode: 'listen', tempo: 'mid', rom: false }; }
}
export function saveRaPrefs(p: Partial<RaPrefs>) { try { localStorage.setItem(KEY, JSON.stringify({ ...raPrefs(), ...p })); } catch { /* stockage indisponible */ } }

/** Une séance est « réussie » à 80 % de lectures justes. */
export const PASS = 80;

let index: Map<string, RaItem> | null = null;
const byKey = () => (index ??= new Map(raProgram().flatMap((s) => s.items.map((i) => [i.key, i] as const))));

let needs: Map<string, string[]> | null = null;
/**
 * Consonnes, voyelles et marques de ton qu'une séance fait lire, cumulées depuis la première séance : le programme est
 * progressif, une séance suppose les précédentes.
 */
export function sessionNeeds(id: string): string[] {
  if (!needs) {
    needs = new Map();
    const acc = new Set<string>();
    for (const s of raProgram()) {
      for (const it of s.items) for (const t of it.tags) if (/^(c|v|m):/.test(t)) acc.add(t);
      needs.set(s.id, [...acc]);
    }
  }
  return needs.get(id) ?? [];
}

/** Séance débloquée : toutes ses lettres ont été enseignées par une leçon faite (ou acquise d'après le profil). */
export const isUnlocked = (s: RaSession, known: ReadonlySet<string>) => sessionNeeds(s.id).every((c) => known.has(c));

/** La leçon qui débloque une séance : la dernière, dans l'ordre du parcours, qui enseigne une lettre encore inconnue. */
export function unlockLesson<L extends { id: string; newConcepts: string[] }>(s: RaSession, lessons: L[], known: ReadonlySet<string>): L | undefined {
  const missing = new Set(sessionNeeds(s.id).filter((c) => !known.has(c)));
  if (!missing.size) return undefined;
  let found: L | undefined;
  for (const l of lessons) if (l.newConcepts.some((c) => missing.has(c))) found = l;
  return found;
}

/**
 * Où ranger chaque séance dans un parcours : l'indice de la leçon après laquelle toutes ses lettres sont enseignées
 * (-1 si le parcours ne les enseigne jamais, par exemple avec l'objectif « parler » seul).
 */
export function unlockIndex<L extends { newConcepts: string[] }>(lessons: L[]): Map<string, number> {
  const at = new Map<string, number>();
  lessons.forEach((l, i) => l.newConcepts.forEach((c) => { if (!at.has(c)) at.set(c, i); }));
  return new Map(raProgram().map((s) => {
    const req = sessionNeeds(s.id);
    return [s.id, req.every((c) => at.has(c)) ? Math.max(-1, ...req.map((c) => at.get(c)!)) : -1];
  }));
}

const passed = (ra: ReadAloudState, s: RaSession) => (ra.sessions[s.id]?.best ?? 0) >= PASS;

/**
 * La séance conseillée : la première pas encore réussie parmi celles que les leçons ont débloquées (`known` : notions
 * enseignées) ; sinon la première pas encore réussie, qui attend sa leçon.
 */
export function nextSession(ra: ReadAloudState, known?: ReadonlySet<string>): RaSession {
  const p = raProgram();
  return p.find((s) => !passed(ra, s) && (!known || isUnlocked(s, known))) ?? p.find((s) => !passed(ra, s)) ?? p[p.length - 1];
}

/** Lectures à reprendre : ratées la dernière fois ou justes moins de 70 % du temps, les plus fragiles d'abord. */
export function weakItems(ra: ReadAloudState): RaItem[] {
  const idx = byKey();
  return Object.entries(ra.items)
    .filter(([, s]) => s.last !== 'ok' || s.ok / Math.max(1, s.n) < 0.7)
    .sort(([, a], [, b]) => a.ok / a.n - b.ok / b.n || b.t - a.t)
    // lectures du programme, ou mots manqués dans un texte (lecture longue) reconstitués depuis leur fiche
    .map(([k, s]) => idx.get(k) ?? (s.rom ? { key: k, thai: s.thai, rom: s.rom, tone: (tonesOf(s.rom)[0] ?? 'M') as ToneId, kind: 'word' as const, tags: [] } : undefined))
    .filter((x): x is RaItem => !!x)
    .slice(0, 40);
}

/** Série « Lectures à reprendre » : chaque lecture fragile deux ou trois fois, mélangée. */
export const errorsSeries = (ra: ReadAloudState, seed: string) => { const w = weakItems(ra); return w.length ? series(w, Math.min(80, Math.max(24, w.length * 2)), seed) : []; };

/** Série « Lecture chrono » : tout ce qui a été vu jusqu'à la séance conseillée, au hasard. */
export function chronoSeries(ra: ReadAloudState, seed: string, known?: ReadonlySet<string>): RaItem[] {
  const p = raProgram();
  const upto = Math.max(1, p.indexOf(nextSession(ra, known)) + 1);
  const pool = [...new Map(p.slice(0, upto).flatMap((s) => s.items.filter((i) => i.kind === 'syl').map((i) => [i.key, i] as const))).values()];
  return series(pool.length ? pool : p[0].items, 200, seed);
}
