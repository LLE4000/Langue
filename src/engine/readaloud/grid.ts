/**
 * Grille de lecture : comme au tableau avec un professeur — des consonnes en lignes, des voyelles en colonnes,
 * tirées au sort, et l'on lit chaque case (กา กี กู เก…). Réglages : quelles consonnes (une classe, toutes, celles
 * que je connais), quelles voyelles, avec ou sans marques de ton, avec ou sans finale, taille de la grille, et
 * l'ordre de lecture (ligne par ligne, ou une case au hasard pour ne pas lire « par cœur »).
 *
 * La composition (écriture, transcription, ton) vient de compose.ts : une combinaison qui n'existe pas n'est jamais
 * proposée. Tout est déterministe à partir d'une graine, pour pouvoir redessiner la même grille.
 */
import { syllable, type RaItem } from './compose';
import { HIGH, LOW_ASP, LOW_SON, MID, rng, shuffle } from './program';

export type GridCons = 'mid' | 'high' | 'low' | 'all' | 'known';
export type GridVowels = 'long' | 'short' | 'pairs' | 'compound' | 'all';
export type GridFinals = 'none' | 'live' | 'dead';
export type GridOrder = 'rows' | 'random';
export interface GridConfig { cons: GridCons; vowels: GridVowels; marks: boolean; finals: GridFinals; size: 4 | 5 | 6; order: GridOrder }
export interface Grid { rows: string[]; cols: string[]; cells: (RaItem | null)[][]; /** ordre de lecture : indices [ligne, colonne] */ path: [number, number][] }

export const GRID_DEFAULT: GridConfig = { cons: 'mid', vowels: 'long', marks: false, finals: 'none', size: 5, order: 'rows' };

export const CONS_SETS: Record<Exclude<GridCons, 'known'>, string[]> = { mid: MID, high: HIGH, low: [...LOW_SON, ...LOW_ASP], all: [...MID, ...HIGH, ...LOW_SON, ...LOW_ASP] };
const LONG = ['–า', '–ี', '–ู', '–ือ', 'เ–', 'แ–', 'โ–', '–อ', 'เ–อ'];
const SHORT = ['–ะ', '–ิ', '–ุ', '–ึ', 'เ–ะ', 'แ–ะ', 'โ–ะ'];
const COMPOUND = ['ไ–', 'เ–า', '–ำ', 'เ–ีย', 'เ–ือ', '–ัว'];
export const VOWEL_SETS: Record<GridVowels, string[]> = { long: LONG, short: SHORT, pairs: [], compound: COMPOUND, all: [...LONG, ...SHORT, ...COMPOUND] };
/** Paires courte / longue, côte à côte dans la grille. */
const PAIRS: [string, string][] = [['–ะ', '–า'], ['–ิ', '–ี'], ['–ุ', '–ู'], ['–ึ', '–ือ'], ['เ–ะ', 'เ–'], ['แ–ะ', 'แ–'], ['โ–ะ', 'โ–']];
const LIVE = ['น', 'ม', 'ง'];
const DEAD = ['ก', 'ด', 'บ'];

/** Libellés des réglages (français ; les lettres thaïes elles-mêmes servent d'exemple). */
export const CONS_LABEL: Record<GridCons, string> = { mid: 'Moyennes · ก จ ด', high: 'Hautes · ข ส ห', low: 'Basses · ค น ม', all: 'Toutes', known: 'Celles que je connais' };
export const VOWEL_LABEL: Record<GridVowels, string> = { long: 'Longues · ◌า ◌ี ◌ู', short: 'Courtes · ◌ะ ◌ิ ◌ุ', pairs: 'Courte / longue', compound: 'Composées · ไ◌ เ◌า ◌ำ', all: 'Toutes' };

/** Dessine une grille. `known` : consonnes que l'apprenant sait lire (pour le réglage « Celles que je connais »). */
export function buildGrid(cfg: GridConfig, seed: string, known: string[] = []): Grid {
  const rand = rng(seed);
  const consPool = cfg.cons === 'known' ? (known.length >= 3 ? known : MID) : CONS_SETS[cfg.cons];
  const rows = shuffle([...consPool], rand).slice(0, Math.min(cfg.size, consPool.length));
  let cols: string[];
  if (cfg.vowels === 'pairs') {
    const n = Math.max(1, Math.floor(cfg.size / 2));
    cols = shuffle(PAIRS, rand).slice(0, n).flat();
    if (cols.length < cfg.size) cols.push(shuffle(LONG.filter((v) => !cols.includes(v)), rand)[0]);
  } else {
    // finales : seulement les voyelles qui ont une forme fermée (pas ไ เา ำ)
    const pool = VOWEL_SETS[cfg.vowels].filter((v) => cfg.finals === 'none' || !['ไ–', 'เ–า', '–ำ'].includes(v));
    cols = shuffle([...pool], rand).slice(0, Math.min(cfg.size, pool.length));
  }
  const finals = cfg.finals === 'live' ? LIVE : cfg.finals === 'dead' ? DEAD : [''];
  const cells = rows.map((c) => cols.map((v) => {
    // une finale et une marque au hasard par case ; on retombe sur la forme simple si la combinaison n'existe pas
    const tries: [string, number][] = [];
    const f = finals[Math.floor(rand() * finals.length)];
    const m = cfg.marks ? Math.floor(rand() * 3) : 0;
    tries.push([f, m], [f, 0], ['', m], ['', 0]);
    for (const [ff, mm] of tries) { const s = syllable(c, v, ff, mm); if (s) return s; }
    return null;
  }));
  const path: [number, number][] = [];
  cells.forEach((row, r) => row.forEach((cell, k) => { if (cell) path.push([r, k]); }));
  return { rows, cols, cells, path: cfg.order === 'random' ? shuffle(path, rand) : path };
}

/** Les syllabes de la grille dans l'ordre de lecture (pour le tapis). */
export const gridItems = (g: Grid): RaItem[] => g.path.map(([r, k]) => g.cells[r][k]!).filter(Boolean);

/** Voyelle affichée en en-tête de colonne, sur son support ◌ (เ◌ะ, ◌ี). */
export const vowelHead = (form: string) => form.replace('–', '◌');

/** Réglages dans l'URL (partageables, relançables) et retour. */
export function gridQuery(cfg: GridConfig, seed: string): string {
  return new URLSearchParams({ c: cfg.cons, v: cfg.vowels, m: cfg.marks ? '1' : '0', f: cfg.finals, n: String(cfg.size), o: cfg.order, s: seed }).toString();
}
export function parseGridQuery(q: URLSearchParams): { cfg: GridConfig; seed: string } {
  const pick = <T extends string>(v: string | null, ok: readonly T[], d: T): T => (v && (ok as readonly string[]).includes(v) ? (v as T) : d);
  const n = Number(q.get('n'));
  return {
    cfg: {
      cons: pick(q.get('c'), ['mid', 'high', 'low', 'all', 'known'] as const, GRID_DEFAULT.cons),
      vowels: pick(q.get('v'), ['long', 'short', 'pairs', 'compound', 'all'] as const, GRID_DEFAULT.vowels),
      marks: q.get('m') === '1',
      finals: pick(q.get('f'), ['none', 'live', 'dead'] as const, GRID_DEFAULT.finals),
      size: n === 4 || n === 6 ? n : 5,
      order: pick(q.get('o'), ['rows', 'random'] as const, GRID_DEFAULT.order),
    },
    seed: q.get('s') || 'grille',
  };
}

/**
 * Toutes les syllabes qu'une grille peut contenir, pour les voix natives pré-générées : consonnes courantes ×
 * voyelles, sans finale (marques 0 à 2), et avec les finales น ม ง ก ด บ sur les voyelles simples, sans marque.
 */
export function gridVoiceTexts(): string[] {
  const out = new Set<string>();
  for (const c of CONS_SETS.all) {
    for (const v of VOWEL_SETS.all) for (const m of [0, 1, 2]) { const s = syllable(c, v, '', m); if (s) out.add(s.thai); }
    for (const v of [...LONG, ...SHORT]) for (const f of [...LIVE, ...DEAD]) { const s = syllable(c, v, f, 0); if (s) out.add(s.thai); }
  }
  return [...out];
}
