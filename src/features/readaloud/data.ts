/** Lecture à voix haute : préférences locales, séries « Mes erreurs » et « Chrono », séance conseillée. */
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

/** La séance conseillée : la première pas encore réussie. */
export function nextSession(ra: ReadAloudState): RaSession {
  const p = raProgram();
  return p.find((s) => (ra.sessions[s.id]?.best ?? 0) < PASS) ?? p[p.length - 1];
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

/** Série « Mes erreurs » : chaque lecture fragile deux ou trois fois, mélangée. */
export const errorsSeries = (ra: ReadAloudState, seed: string) => { const w = weakItems(ra); return w.length ? series(w, Math.min(80, Math.max(24, w.length * 2)), seed) : []; };

/** Série « Chrono » : tout ce qui a été vu jusqu'à la séance conseillée, au hasard. */
export function chronoSeries(ra: ReadAloudState, seed: string): RaItem[] {
  const p = raProgram();
  const upto = Math.max(1, p.indexOf(nextSession(ra)) + 1);
  const pool = [...new Map(p.slice(0, upto).flatMap((s) => s.items.filter((i) => i.kind === 'syl').map((i) => [i.key, i] as const))).values()];
  return series(pool.length ? pool : p[0].items, 200, seed);
}
