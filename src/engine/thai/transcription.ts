/**
 * Transcription pédagogique → API et RTGS.
 *
 * Système de romanisation de l'application (proche de l'API, une seule convention partout) :
 *   p t k    = occlusives SANS souffle (comme en français)
 *   ph th kh = occlusives AVEC souffle (jamais « f » ni le « th » anglais)
 *   j = จ [tɕ]   ch = ช [tɕʰ]   ng = ง [ŋ]   y = ย [j]
 *   voyelles : a i ʉ u e ɛ o ɔ ə — doublées quand elles sont longues
 *   tons : a (moyen)  à (bas)  â (descendant)  á (haut)  ǎ (montant)
 * L'API et le RTGS affichés sont DÉRIVÉS de cette transcription par des règles fixes.
 */
import type { ToneId } from '@/content/types';

const TONE_COMB: Record<string, ToneId> = { '̀': 'L', '̂': 'F', '́': 'H', '̌': 'R' };
export const TONE_MARK_COMB: Record<ToneId, string> = { M: '', L: '̀', F: '̂', H: '́', R: '̌' };
const IPA_ON: Record<string, string> = { kh: 'kʰ', ph: 'pʰ', th: 'tʰ', ch: 'tɕʰ', j: 'tɕ', ng: 'ŋ', y: 'j' };
const IPA_V: Record<string, string> = { a: 'a', aa: 'aː', i: 'i', ii: 'iː', ʉ: 'ɯ', ʉʉ: 'ɯː', u: 'u', uu: 'uː', e: 'e', ee: 'eː', ɛ: 'ɛ', ɛɛ: 'ɛː', o: 'o', oo: 'oː', ɔ: 'ɔ', ɔɔ: 'ɔː', ə: 'ɤ', əə: 'ɤː', ia: 'ia', ʉa: 'ɯa', ua: 'ua' };
const RTGS_V: Record<string, string> = { a: 'a', aa: 'a', i: 'i', ii: 'i', ʉ: 'ue', ʉʉ: 'ue', u: 'u', uu: 'u', e: 'e', ee: 'e', ɛ: 'ae', ɛɛ: 'ae', o: 'o', oo: 'o', ɔ: 'o', ɔɔ: 'o', ə: 'oe', əə: 'oe', ia: 'ia', ʉa: 'uea', ua: 'ua' };
const IPA_CODA: Record<string, string> = { k: 'k̚', t: 't̚', p: 'p̚', ng: 'ŋ' };
const TONE_LETTER: Record<ToneId, string> = { M: '˧', L: '˨˩', F: '˥˩', H: '˦˥', R: '˩˩˦' };

export interface Syllable {
  on: string; // consonne initiale
  cl: string; // deuxième consonne d'un groupe (r, l, w)
  core: string; // voyelle
  glide: string; // j ou w final vocalique
  coda: string; // consonne finale
  tone: ToneId;
}

/** Analyse une syllabe transcrite (ex. « khâao »). Renvoie null si elle ne suit pas la convention. */
export function parseSyl(syl: string): Syllable | null {
  let tone: ToneId = 'M';
  const s = syl.normalize('NFD').replace(/[̀́̂̌]/g, (m) => {
    tone = TONE_COMB[m];
    return '';
  });
  const m = s.match(/^(kh|ph|th|ch|ng|[kptjbdfshmnrlwy])?([rlw])?([aiʉueɛoɔə]+)(ng|[ktpnm])?$/);
  if (!m) return null;
  const V = m[3];
  let core = V, glide = '';
  if (V.length > 1 && V.endsWith('i') && !/^i+$/.test(V)) {
    core = V.slice(0, -1);
    glide = 'j';
  } else if (V.length > 1 && V.endsWith('o') && /^(a|aa|e|ee|ɛ|ɛɛ|ia)$/.test(V.slice(0, -1))) {
    core = V.slice(0, -1);
    glide = 'w';
  } else if (V === 'iu') {
    core = 'i';
    glide = 'w';
  }
  if (!(core in IPA_V)) return null;
  return { on: m[1] || '', cl: m[2] || '', core, glide, coda: m[4] || '', tone };
}

/** La voyelle est-elle longue ? */
export const isLongVowel = (core: string) => core.length > 1 && !/^(ia|ʉa|ua)$/.test(core) ? true : /^(ia|ʉa|ua)$/.test(core);

/** La syllabe est-elle vivante (son prolongeable) ? */
export function isLiveSyllable(p: Syllable): boolean {
  if (/^[ktp]$/.test(p.coda)) return false;
  if (p.coda || p.glide) return true;
  return isLongVowel(p.core);
}

function romMap(rom: string, fn: (p: Syllable) => string, hy: string): string {
  return String(rom)
    .split(/([\s-]+)/)
    .map((part, i) => {
      if (i % 2) return /\s/.test(part) ? ' ' : hy;
      const p = parseSyl(part);
      return p ? fn(p) : part;
    })
    .join('');
}

export const romToIPA = (rom: string) =>
  romMap(rom, (p) => (p.on ? IPA_ON[p.on] || p.on : 'ʔ') + p.cl + IPA_V[p.core] + p.glide + (p.coda ? IPA_CODA[p.coda] || p.coda : '') + TONE_LETTER[p.tone], '.');

export const romToRTGS = (rom: string) =>
  romMap(rom, (p) => (p.on === 'j' ? 'ch' : p.on) + p.cl + RTGS_V[p.core] + (p.glide === 'j' ? 'i' : p.glide === 'w' ? 'o' : '') + p.coda, '');

/** Tons d'une transcription, syllabe par syllabe. */
export const tonesOf = (rom: string): ToneId[] =>
  String(rom).split(/[\s-]+/).map(parseSyl).filter((p): p is Syllable => !!p).map((p) => p.tone);

/** Syllabes d'une transcription. */
export const sylsOf = (rom: string) =>
  String(rom).normalize('NFC').replace(/\.\.\.|…/g, ' … ').split(/[\s-]+/).filter(Boolean);

/** Transcription SANS les marques de ton (mǎa → maa). */
export const plainRom = (rom: string) => rom.normalize('NFD').replace(/[̀́̂̌]/g, '').normalize('NFC');

/** Ajoute une marque de ton sur la première voyelle d'une syllabe transcrite. */
export function markTone(rom: string, tone: ToneId): string {
  const m = TONE_MARK_COMB[tone];
  if (!m) return rom;
  const i = rom.search(/[aiʉueɛoɔə]/);
  if (i < 0) return rom;
  return (rom.slice(0, i + 1) + m + rom.slice(i + 1)).normalize('NFC');
}
