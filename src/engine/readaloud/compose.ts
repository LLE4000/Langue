/**
 * Lecture à voix haute — composition des syllabes : à partir d'une consonne, d'une voyelle, d'une finale et
 * d'une marque de ton, l'écriture thaïe exacte, la transcription avec son ton, et les étiquettes de maîtrise
 * (consonne, voyelle, finale, règle de ton) que les résultats alimentent.
 *
 * On ne compose que des formes régulières et fréquentes : les formes fermées des voyelles (–ะ → ◌ั◌, –ือ → ◌ื◌,
 * เ–ะ → เ◌็◌, โ–ะ → o invisible, เ–อ → เ◌ิ◌…) sont appliquées ; une combinaison qui n'existe pas renvoie null.
 */
import type { ConsonantClass, ToneId } from '@/content/types';
import { CONS_BY_CHAR, th } from '@/content/th';
import { toneRule, ruleKeyOf } from '@/engine/thai/toneRule';
import { markTone } from '@/engine/thai/transcription';

export interface RaItem {
  /** identifiant stable (le texte thaï) */
  key: string;
  thai: string;
  rom: string;
  tone: ToneId;
  kind: 'syl' | 'word' | 'phrase';
  /** étiquettes de maîtrise : c:ก v:–า f:น rule:M|live tone:M cls:M */
  tags: string[];
  meaning?: string;
  /** pour une syllabe composée : ses éléments (servent à reconnaître le type d'erreur) */
  parts?: { cons: string; vowel: string; final: string; mark: number };
}

export const MARK_CHARS = ['', '่', '้', '๊', '๋'];
const LIVE_FINALS: Record<string, string> = { น: 'n', ม: 'm', ง: 'ng', ย: 'i', ว: 'o' };
const DEAD_FINALS: Record<string, string> = { ก: 'k', ด: 't', บ: 'p' };
export const FINAL_ROM: Record<string, string> = { ...LIVE_FINALS, ...DEAD_FINALS };
const SPECIAL_LIVE = new Set(['ไ–', 'ใ–', 'เ–า', '–ำ']);
const FINAL_Y = new Set(['–า', '–ะ', '–อ', 'โ–', '–ุ', 'เ–ือ', '–ัว']);
const FINAL_W = new Set(['–า', 'เ–', 'แ–', 'เ–ีย', '–ิ']);
const COMBINING = /^[ัิีึืุู็]+/;

/** Forme fermée (devant une finale) de chaque voyelle composable, sous la forme « avant–après ». */
const CLOSED: Record<string, string> = {
  '–า': '–า', '–ี': '–ี', '–ู': '–ู', '–ิ': '–ิ', '–ุ': '–ุ', '–ึ': '–ึ', '–ือ': '–ื', '–ะ': '–ั',
  'เ–': 'เ–', 'แ–': 'แ–', 'โ–': 'โ–', '–อ': '–อ', 'เ–ีย': 'เ–ีย', 'เ–ือ': 'เ–ือ', '–ัว': '–ว',
  'เ–ะ': 'เ–็', 'แ–ะ': 'แ–็', 'โ–ะ': '–', 'เ–อ': 'เ–ิ',
};

const vowelOf = (form: string) => th.VOWELS.find((v) => v.form === form);

/** Écrit une syllabe : la marque de ton se place après la consonne et les voyelles hautes ou basses qui la suivent. */
function write(cons: string, form: string, mark: number): string {
  const [pre, post] = form.split('–');
  const m = COMBINING.exec(post)?.[0] ?? '';
  const markCh = MARK_CHARS[mark] ?? '';
  // le signe ็ disparaît quand une marque de ton est présente (เด็ก, mais เต้น)
  const comb = markCh ? m.replace('็', '') : m;
  return pre + cons + comb + markCh + post.slice(m.length);
}

/** Transcription de la voyelle, fusionnée avec la finale (aa + i → aai, a + o → ao). */
function romOf(cons: string, form: string, final: string): string {
  const c = CONS_BY_CHAR[cons];
  const v = vowelOf(form);
  if (!c || !v) return '';
  const on = c.initial === '(muet)' ? '' : c.initial;
  const vr = form === 'โ–ะ' && final ? 'o' : v.rom;
  const fr = final === 'ว' && form === '–ิ' ? 'u' : final ? FINAL_ROM[final] ?? '' : ''; // ◌ิว : hǐu
  return on + vr + fr;
}

/**
 * Compose une syllabe. `final` : '' ou une finale parmi น ม ง ย ว (vivantes) et ก ด บ (mortes) ;
 * `mark` : 0 à 4. Renvoie null si la combinaison n'existe pas (๊ ๋ hors classe moyenne, voyelle sans forme fermée…).
 */
export function syllable(cons: string, form: string, final = '', mark = 0): RaItem | null {
  const c = CONS_BY_CHAR[cons];
  const v = vowelOf(form);
  if (!c || !v) return null;
  if (final && !(final in FINAL_ROM)) return null;
  if (final && SPECIAL_LIVE.has(form)) return null;
  if (final && !(form in CLOSED)) return null;
  // ย et ว en finale : seulement les combinaisons qui existent (–าย ◌ัย –อย โ–ย ◌ุย เ–ือย ◌วย ; –าว เ–ว แ–ว เ–ียว ◌ิว)
  if (final === 'ย' && !FINAL_Y.has(form)) return null;
  if (final === 'ว' && !FINAL_W.has(form)) return null;
  const long = v.length === 'L';
  const live = SPECIAL_LIVE.has(form) || (final ? final in LIVE_FINALS : long);
  const cls: ConsonantClass = c.cls;
  const tone = toneRule(cls, live, long, mark);
  if (!tone) return null;
  const thai = final ? write(cons, CLOSED[form], mark) + final : write(cons, form, mark);
  const rom = markTone(romOf(cons, form, final), tone);
  const rule = ruleKeyOf({ cls, live, long, mark });
  const tags = ['c:' + cons, 'v:' + form, rule, 'tone:' + tone, 'cls:' + cls, live ? 'syl:live' : 'syl:dead'];
  if (final) tags.push('f:' + final);
  if (mark) tags.push('m:' + mark);
  return { key: thai, thai, rom, tone, kind: 'syl', tags, parts: { cons, vowel: form, final, mark } };
}

/** Consonnes de même son à l'aspiration près (ou proches à l'oreille d'un francophone). */
export const CONFUSABLE: Record<string, string[]> = {
  ก: ['ค', 'ข'], ค: ['ก', 'ข'], ข: ['ค', 'ก'], ต: ['ท', 'ด', 'ถ'], ท: ['ต', 'ถ', 'ด'], ถ: ['ท', 'ต'], ด: ['ต', 'บ'],
  ป: ['พ', 'บ', 'ผ'], พ: ['ป', 'ผ', 'ฟ'], ผ: ['พ', 'ป'], บ: ['ป', 'ด'], จ: ['ช', 'ฉ'], ช: ['จ', 'ซ', 'ฉ'], ฉ: ['ช', 'จ'],
  ซ: ['ส', 'ช'], ส: ['ซ'], ฟ: ['พ', 'ฝ'], ฝ: ['ฟ', 'ผ'], น: ['ล', 'ม'], ล: ['น', 'ร'], ร: ['ล'], ม: ['น'], ง: ['น'], ย: ['ว'], ว: ['ย'], ห: ['ฮ'], ฮ: ['ห'], อ: [],
};
/** Voyelle de même timbre, de longueur opposée. */
export const LENGTH_PAIR: Record<string, string> = {
  '–ะ': '–า', '–า': '–ะ', '–ิ': '–ี', '–ี': '–ิ', '–ึ': '–ือ', '–ือ': '–ึ', '–ุ': '–ู', '–ู': '–ุ',
  'เ–ะ': 'เ–', 'เ–': 'เ–ะ', 'แ–ะ': 'แ–', 'แ–': 'แ–ะ', 'โ–ะ': 'โ–', 'โ–': 'โ–ะ', 'เ–าะ': '–อ', '–อ': 'เ–าะ', 'เ–อะ': 'เ–อ', 'เ–อ': 'เ–อะ',
};

export type ErrorKind = 'tone' | 'length' | 'consonant' | 'vowel' | 'final';
export interface Variant { thai: string; rom: string; kind: ErrorKind; detail: string }

const TONE_FR: Record<ToneId, string> = { M: 'moyen', L: 'bas', F: 'descendant', H: 'haut', R: 'montant' };
export const toneFr = (t: ToneId) => TONE_FR[t];

/**
 * Les « voisins » d'une syllabe : même syllabe avec un autre ton (y compris par une consonne de même son d'une autre
 * classe), une autre longueur de voyelle, une consonne ou une finale proche. Si la reconnaissance entend l'un d'eux,
 * on sait exactement ce qui a changé.
 */
export function variantsOf(it: RaItem): Variant[] {
  const p = it.parts;
  if (!p) return [];
  const out: Variant[] = [];
  const seen = new Set([it.thai]);
  const push = (s: RaItem | null, kind: ErrorKind, detail: (s: RaItem) => string) => { if (s && !seen.has(s.thai)) { seen.add(s.thai); out.push({ thai: s.thai, rom: s.rom, kind, detail: detail(s) }); } };
  for (let m = 0; m <= 4; m++) push(syllable(p.cons, p.vowel, p.final, m), 'tone', (s) => `ton ${toneFr(s.tone)} au lieu de ${toneFr(it.tone)}`);
  for (const alt of CONFUSABLE[p.cons] ?? []) for (let m = 0; m <= 2; m++) {
    const s = syllable(alt, p.vowel, p.final, m);
    if (!s) continue;
    const sameSound = CONS_BY_CHAR[alt]?.initial === CONS_BY_CHAR[p.cons]?.initial;
    if (sameSound) push(s, 'tone', (x) => `ton ${toneFr(x.tone)} au lieu de ${toneFr(it.tone)}`);
    else if (m === p.mark) push(s, 'consonant', (x) => `« ${CONS_BY_CHAR[alt].initial} » au lieu de « ${CONS_BY_CHAR[p.cons].initial} » (${x.rom})`);
  }
  const lp = LENGTH_PAIR[p.vowel];
  if (lp) for (let m = 0; m <= 2; m++) push(syllable(p.cons, lp, p.final, m), 'length', () => `voyelle ${vowelOf(lp)?.length === 'L' ? 'longue' : 'courte'} au lieu de ${vowelOf(p.vowel)?.length === 'L' ? 'longue' : 'courte'}`);
  if (p.final) for (const f of Object.keys(FINAL_ROM)) if (f !== p.final) push(syllable(p.cons, p.vowel, f, p.mark), 'final', () => `finale « ${FINAL_ROM[f]} » au lieu de « ${FINAL_ROM[p.final]} »`);
  if (p.final) push(syllable(p.cons, p.vowel, '', p.mark), 'final', () => `finale « ${FINAL_ROM[p.final]} » non entendue`);
  return out;
}
