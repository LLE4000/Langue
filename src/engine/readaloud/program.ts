/**
 * Lecture à voix haute — le programme : 25 séances de quelques minutes, de « ka, ta, pa » jusqu'aux phrases.
 *
 *   1. Premières syllabes  : les 28 consonnes courantes, par classe, sur la voyelle « aa »
 *   2. Voyelles longues    : ii uu, ee ɛɛ oo, ɔɔ ʉʉ əə, puis tout mélangé
 *   3. Court ou long       : a/aa, i/ii, u/uu, ʉ/ʉʉ, e/ee, ɛ/ɛɛ, o/oo en paires
 *   4. Changer de consonne : aspirée ou non (k/kh, t/th, p/ph, j/ch), tout l'alphabet en désordre
 *   5. Voyelles composées  : ai ao am, puis ia ʉa ua
 *   6. Les tons            : marques par classe (moyenne, basse, haute), même son / autre ton
 *   7. Les finales         : vivantes (n m ng i o), mortes (k t p), mélangées
 *   8. Mots                : d'une puis de deux syllabes, choisis parmi le vocabulaire de l'application
 *   9. Groupes et phrases  : expressions courtes, phrases des lectures
 *
 * Chaque séance a un « vivier » de syllabes distinctes et une longueur : la série parcourt le vivier en plusieurs
 * passages mélangés (jamais deux fois la même d'affilée), pour lire vite et beaucoup. Tout est déterministe.
 */
import { ITEMS, WORD_ITEMS, th, sentenceThai } from '@/content/th';
import { syllableCount } from '@/engine/thai/reading';
import { consonantsOf } from '@/engine/thai/script';
import { tonesOf } from '@/engine/thai/transcription';
import type { ToneId } from '@/content/types';
import { syllable, type RaItem } from './compose';

export interface RaSession {
  id: string;
  n: number;
  stage: string;
  title: string;
  sub: string;
  /** ce qu'on travaille, en une ligne */
  focus: string;
  items: RaItem[];
  /** syllabes (ou mots) distincts */
  pool: number;
  minutes: number;
  /** consonnes et voyelles rencontrées pour la première fois dans le programme */
  fresh: string[];
}

export const MID = [...'กจดตบปอ'];
export const LOW_SON = [...'นมรลวยง'];
export const LOW_ASP = [...'คทพชซฟฮ'];
export const HIGH = [...'ขฉถผฝสห'];
export const ALL = [...MID, ...LOW_SON, ...LOW_ASP, ...HIGH];
const LONG1 = ['–ี', '–ู'], LONG2 = ['เ–', 'แ–', 'โ–'], LONG3 = ['–อ', '–ือ', 'เ–อ'];
const SIMPLE_LONG = ['–า', ...LONG1, ...LONG2, ...LONG3];

/** Générateur pseudo-aléatoire déterministe (mulberry32). */
export function rng(seed: string) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) { h = Math.imul(h ^ seed.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  let a = h >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/** Série de `length` éléments : passages mélangés du vivier, sans répétition immédiate. */
export function series(pool: RaItem[], length: number, seed: string): RaItem[] {
  if (!pool.length) return [];
  const rand = rng(seed);
  const out: RaItem[] = [];
  while (out.length < length) {
    let pass = shuffle(pool, rand);
    if (out.length && pass[0].key === out[out.length - 1].key && pass.length > 1) pass = [...pass.slice(1), pass[0]];
    out.push(...pass);
  }
  return out.slice(0, length);
}

/** Paires alternées (a, b, a, b…) mélangées par blocs : pour entendre la différence en la produisant. */
function pairs(list: [RaItem | null, RaItem | null][], length: number, seed: string): RaItem[] {
  const ok = list.filter((p): p is [RaItem, RaItem] => !!p[0] && !!p[1]);
  const rand = rng(seed);
  const out: RaItem[] = [];
  while (out.length < length && ok.length) for (const [a, b] of shuffle(ok, rand)) { if (rand() < 0.5) out.push(a, b); else out.push(b, a); }
  return out.slice(0, length);
}

const grid = (cons: string[], vowels: string[], finals = [''], marks = [0]) => {
  const out: RaItem[] = [];
  for (const c of cons) for (const v of vowels) for (const f of finals) for (const m of marks) { const s = syllable(c, v, f, m); if (s) out.push(s); }
  return out;
};
const uniq = (xs: RaItem[]) => { const seen = new Set<string>(); return xs.filter((x) => !seen.has(x.key) && !!seen.add(x.key)); };

/** Un mot du vocabulaire comme élément de lecture (le thaï pur, sans jeton ni espace). */
function wordItem(id: string): RaItem | null {
  const it = ITEMS[id];
  if (!it || /[{}\s…?.]/.test(it.thai) || !it.rom) return null;
  const tones = tonesOf(it.rom);
  const tags = [id, ...consonantsOf(it.thai).map((c) => 'c:' + c), ...tones.map((t) => 'tone:' + t)];
  return { key: it.thai, thai: it.thai, rom: it.rom, tone: (tones[0] ?? 'M') as ToneId, kind: 'word', tags, meaning: it.meaning.fr.split(';')[0].trim() };
}

function words(sylls: number, max: number): RaItem[] {
  const out: RaItem[] = [];
  const seen = new Set<string>();
  for (const w of WORD_ITEMS) {
    if (w.sub || seen.has(w.thai)) continue;
    const n = syllableCount(w.thai);
    if (n !== sylls) continue;
    const it = wordItem(w.id);
    if (it) { seen.add(it.thai); out.push(it); }
    if (out.length >= max) break;
  }
  return out;
}

function phrases(minTok: number, maxTok: number, max: number): RaItem[] {
  const out: RaItem[] = [];
  const seen = new Set<string>();
  for (const r of th.READINGS) for (const s of r.sentences) {
    if (s.tokens.length < minTok || s.tokens.length > maxTok || s.tokens.some((t) => /[{]/.test(t.thai))) continue;
    const thai = sentenceThai(s.tokens);
    if (seen.has(thai)) continue;
    seen.add(thai);
    const rom = s.tokens.map((t) => t.rom).join(' ');
    out.push({ key: thai, thai, rom, tone: (tonesOf(rom)[0] ?? 'M') as ToneId, kind: 'phrase', tags: ['reading:' + r.id], meaning: s.tr?.fr });
    if (out.length >= max) return out;
  }
  return out;
}

interface Def { id: string; stage: string; title: string; sub: string; focus: string; build: (seed: string) => { items: RaItem[]; pool: number } }
const simple = (pool: RaItem[], length: number) => (seed: string) => ({ items: series(uniq(pool), length, seed), pool: uniq(pool).length });

const DEFS: Def[] = [
  { id: 'ra-01', stage: 'Premières syllabes', title: 'Consonnes moyennes', sub: 'ka, ja, da, ta, ba, pa, a', focus: 'Sept consonnes de classe moyenne sur la voyelle « aa » : le ton reste moyen.', build: simple(grid(MID, ['–า']), 35) },
  { id: 'ra-02', stage: 'Premières syllabes', title: 'Consonnes sonores', sub: 'na, ma, ra, la, wa, ya, nga', focus: 'Les sonores de classe basse, mêlées aux premières.', build: simple([...grid(LOW_SON, ['–า']), ...grid(MID, ['–า'])], 45) },
  { id: 'ra-03', stage: 'Premières syllabes', title: 'Consonnes aspirées', sub: 'kha, tha, pha, cha, sa, fa, ha', focus: 'Le souffle après k, t, p, ch : comparez avec les moyennes sans souffle.', build: simple([...grid(LOW_ASP, ['–า']), ...grid(MID.slice(0, 6), ['–า'])], 45) },
  { id: 'ra-04', stage: 'Premières syllabes', title: 'Consonnes hautes', sub: 'khǎa, sǎa, hǎa… le ton montant', focus: 'Même son qu’une aspirée, mais ton montant : ขา khǎa / คา khaa.', build: simple([...grid(HIGH, ['–า']), ...grid(LOW_ASP, ['–า'])], 50) },
  { id: 'ra-05', stage: 'Voyelles longues', title: 'Les voyelles « ii » et « uu »', sub: 'dii, mii, duu, nuu…', focus: 'Voyelles au-dessus et en dessous : elles se lisent après la consonne.', build: simple(grid(ALL, LONG1), 50) },
  { id: 'ra-06', stage: 'Voyelles longues', title: 'Voyelles écrites avant', sub: 'ee, ɛɛ, oo : เก แก โก', focus: 'Écrites devant la consonne, dites après : lisez d’abord la consonne.', build: simple(grid(ALL, LONG2), 55) },
  { id: 'ra-07', stage: 'Voyelles longues', title: 'Voyelles « ɔɔ », « ʉʉ », « əə »', sub: 'kɔɔ, mʉʉ, jəə…', focus: 'Trois sons absents du français : lèvres arrondies, étirées, puis neutres.', build: simple(grid(ALL, LONG3), 55) },
  { id: 'ra-08', stage: 'Voyelles longues', title: 'Toutes les voyelles longues', sub: 'Huit voyelles, 28 consonnes', focus: 'Tout ce qui précède, mélangé : la vitesse vient ici.', build: simple(grid(ALL, SIMPLE_LONG), 60) },
  { id: 'ra-09', stage: 'Court ou long', title: 'a/aa, i/ii, u/uu, ʉ/ʉʉ', sub: 'จะ / จา, ดิ / ดี…', focus: 'La longueur change le mot : tenez la longue deux fois plus longtemps.', build: (seed) => { const cs = [...MID, ...LOW_SON]; const p: [RaItem | null, RaItem | null][] = []; for (const c of cs) for (const [s, l] of [['–ะ', '–า'], ['–ิ', '–ี'], ['–ุ', '–ู'], ['–ึ', '–ือ']]) p.push([syllable(c, s), syllable(c, l)]); return { items: pairs(p, 56, seed), pool: p.length * 2 }; } },
  { id: 'ra-10', stage: 'Court ou long', title: 'e/ee, ɛ/ɛɛ, o/oo', sub: 'เตะ / เต, แกะ / แก…', focus: 'Les voyelles courtes écrites avec ะ, face à leurs longues.', build: (seed) => { const p: [RaItem | null, RaItem | null][] = []; for (const c of [...MID, ...LOW_SON, ...LOW_ASP]) for (const [s, l] of [['เ–ะ', 'เ–'], ['แ–ะ', 'แ–'], ['โ–ะ', 'โ–']]) p.push([syllable(c, s), syllable(c, l)]); return { items: pairs(p, 54, seed), pool: p.length * 2 }; } },
  { id: 'ra-11', stage: 'Changer de consonne', title: 'Avec ou sans souffle', sub: 'ka/kha, ta/tha, pa/pha, ja/cha', focus: 'Paires minimales : la main devant la bouche sent le souffle.', build: (seed) => { const p: [RaItem | null, RaItem | null][] = []; for (const [a, b] of [['ก', 'ค'], ['ต', 'ท'], ['ป', 'พ'], ['จ', 'ช'], ['บ', 'ป'], ['ด', 'ต']]) for (const v of ['–า', '–ี', '–ู', 'เ–', 'โ–', '–อ']) p.push([syllable(a, v), syllable(b, v)]); return { items: pairs(p, 60, seed), pool: p.length * 2 }; } },
  { id: 'ra-12', stage: 'Changer de consonne', title: 'Tout l’alphabet en désordre', sub: '28 consonnes, voyelles simples', focus: 'Lecture rapide au hasard : l’œil reconnaît, la bouche suit.', build: simple(grid(ALL, [...SIMPLE_LONG, '–ะ', '–ิ', '–ุ']), 70) },
  { id: 'ra-13', stage: 'Voyelles composées', title: 'Les voyelles « ai », « ao », « am »', sub: 'ไป, ใจ, เรา, ทำ…', focus: 'ไ et ใ se disent pareil (ใ ne sert que dans une vingtaine de mots) ; เ–า entoure la consonne ; ำ se lit « am ».', build: simple([...grid(ALL, ['ไ–', 'เ–า', '–ำ']), ...grid([...'จนสชตบดฝย'], ['ใ–'])], 50) },
  { id: 'ra-14', stage: 'Voyelles composées', title: 'Les diphtongues', sub: 'ia, ʉa, ua : เมีย เรือ ตัว', focus: 'On glisse d’un son à l’autre sans couper.', build: simple(grid(ALL, ['เ–ีย', 'เ–ือ', '–ัว']), 50) },
  { id: 'ra-15', stage: 'Les tons', title: 'Tons de la classe moyenne', sub: 'กา ก่า ก้า ก๊า ก๋า', focus: 'Les cinq tons dans l’ordre, puis mélangés : exagérez la courbe.', build: (seed) => { const series5 = MID.slice(0, 6).flatMap((c) => [0, 1, 2, 3, 4].map((m) => syllable(c, '–า', '', m)).filter((x): x is RaItem => !!x)); const mixed = series(uniq(grid(MID, ['–า', '–ี', 'โ–', '–อ'], [''], [0, 1, 2])), 30, seed); return { items: [...series5, ...mixed], pool: uniq([...series5, ...mixed]).length }; } },
  { id: 'ra-16', stage: 'Les tons', title: 'Tons de la classe basse', sub: 'คา ค่า ค้า · มา ม่า ม้า', focus: 'Classe basse : ่ donne le descendant, ้ le haut.', build: simple(grid([...LOW_SON, ...LOW_ASP], ['–า', '–ี', 'แ–', '–อ'], [''], [0, 1, 2]), 60) },
  { id: 'ra-17', stage: 'Les tons', title: 'Tons de la classe haute', sub: 'ขา ข่า ข้า · สี สี่ สี้', focus: 'Classe haute : montant sans marque, bas avec ่, descendant avec ้.', build: simple(grid(HIGH, ['–า', '–ี', 'เ–', '–ู'], [''], [0, 1, 2]), 60) },
  { id: 'ra-18', stage: 'Les tons', title: 'Même son, autre ton', sub: 'คา / ขา · ค่า / ข่า', focus: 'Deux lettres, un seul son : c’est la classe qui donne le ton.', build: (seed) => { const p: [RaItem | null, RaItem | null][] = []; for (const [lo, hi] of [['ค', 'ข'], ['ท', 'ถ'], ['พ', 'ผ'], ['ช', 'ฉ'], ['ซ', 'ส'], ['ฟ', 'ฝ'], ['ฮ', 'ห']]) for (const v of ['–า', '–ี', 'เ–']) for (const m of [0, 1, 2]) p.push([syllable(lo, v, '', m), syllable(hi, v, '', m)]); return { items: pairs(p, 64, seed), pool: p.length * 2 }; } },
  { id: 'ra-19', stage: 'Les finales', title: 'Finales vivantes', sub: 'n, m, ng, i, o : กาน กาม กาง', focus: 'Le son se prolonge : la syllabe est vivante, le ton suit la classe.', build: simple(grid([...MID, ...LOW_SON, ...HIGH.slice(0, 4)], ['–า', '–ะ', '–ี', 'เ–', 'โ–ะ'], ['น', 'ม', 'ง', 'ย', 'ว']), 60) },
  { id: 'ra-20', stage: 'Les finales', title: 'Finales mortes', sub: 'k, t, p : มาก รัก เด็ก', focus: 'Finale bloquée, syllabe morte : ton bas, ou haut / descendant en classe basse.', build: simple(grid([...MID, ...LOW_SON, ...LOW_ASP.slice(0, 4), ...HIGH.slice(0, 4)], ['–า', '–ะ', '–ิ', '–ุ', 'เ–ะ', 'โ–ะ'], ['ก', 'ด', 'บ']), 60) },
  { id: 'ra-21', stage: 'Les finales', title: 'Vivantes ou mortes', sub: 'Tout mélangé, avec les marques', focus: 'Décidez vite : vivante ou morte, puis la classe, puis la marque.', build: simple(grid(ALL, ['–า', '–ะ', '–ี', '–ุ', 'เ–', 'โ–ะ', '–อ'], ['น', 'ง', 'ม', 'ก', 'ด', 'บ'], [0, 1, 2]), 70) },
  { id: 'ra-22', stage: 'Mots', title: 'Mots d’une syllabe', sub: 'มา, ไป, กิน, น้ำ…', focus: 'De vrais mots, parmi les plus utiles : leur sens s’affiche à la fin.', build: (seed) => { const w = words(1, 70); return { items: series(w, 60, seed), pool: w.length }; } },
  { id: 'ra-23', stage: 'Mots', title: 'Mots de deux syllabes', sub: 'สบาย, อาหาร, ตลาด…', focus: 'Deux syllabes, deux tons : lisez-les d’un seul souffle.', build: (seed) => { const w = words(2, 60); return { items: series(w, 50, seed), pool: w.length }; } },
  { id: 'ra-24', stage: 'Groupes et phrases', title: 'Groupes de mots', sub: 'Expressions de trois ou quatre mots', focus: 'Des morceaux de phrases : gardez le rythme d’un mot à l’autre.', build: (seed) => { const w = phrases(2, 4, 40); return { items: series(w, 36, seed), pool: w.length }; } },
  { id: 'ra-25', stage: 'Groupes et phrases', title: 'Phrases courtes', sub: 'Les phrases des lectures', focus: 'Lire une phrase entière, naturellement, comme on la dirait.', build: (seed) => { const w = phrases(5, 8, 30); return { items: series(w, 24, seed), pool: w.length }; } },
];

/** Guillemets et deux-points insécables : jamais « seul en fin de ligne. */
const nb = (s: string) => s.replace(/« /g, '«\u00a0').replace(/ »/g, '\u00a0»').replace(/ :/g, '\u00a0:');

let cache: RaSession[] | null = null;
/** Les séances du programme, construites une fois. */
export function raProgram(): RaSession[] {
  if (cache) return cache;
  const seen = new Set<string>();
  cache = DEFS.map((d, i) => {
    const { items, pool } = d.build(d.id);
    const fresh: string[] = [];
    for (const it of items) for (const t of it.tags) if ((t.startsWith('c:') || t.startsWith('v:')) && !seen.has(t)) { seen.add(t); fresh.push(t); }
    const perItem = items[0]?.kind === 'phrase' ? 7 : items[0]?.kind === 'word' ? 3 : 2.2; // secondes, modèle écouté compris
    return { id: d.id, n: i + 1, stage: d.stage, title: nb(d.title), sub: nb(d.sub), focus: nb(d.focus), items, pool, minutes: Math.max(2, Math.round((items.length * perItem) / 60 + 1)), fresh };
  });
  return cache;
}
export const raSession = (id: string) => raProgram().find((s) => s.id === id);

/** Tous les textes du programme (pour la synthèse des voix natives). */
export const raVoiceTexts = () => [...new Set(raProgram().flatMap((s) => s.items.map((i) => i.thai)))];
