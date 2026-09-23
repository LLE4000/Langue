/**
 * Analyse de l'écriture thaïe : de quels signes un mot a-t-il besoin pour être lu ?
 * Sert à garantir qu'on ne demande jamais de lire un caractère non enseigné.
 */

const CONSONANT_RE = /[ก-ฮ]/;
const TONE_MARK_RE = /[่-๋]/;
// Signes vocaliques et diacritiques : ะ ั า ำ ิ ี ึ ื ุ ู ฺ (0E30–0E3A), ฤ ฦ ๅ (0E24/0E26/0E45), เ แ โ ใ ไ (0E40–0E44), ็ (0E47), ์ (0E4C), ํ (0E4D)
const VOWEL_SIGN_RE = /[ะ-ฺเ-ๅ็์ํ]/;
const IGNORED_RE = /[\sๆฯ๚๛๎0-9.,!?;:'"()…\-{}A-Za-z]/; // ๆ ฯ ๚ ๛ ๎, ponctuation, jetons {P}
const THAI_DIGIT_RE = /[๐-๙]/;

export type ScriptUnitKind = 'cons' | 'vowel' | 'tone' | 'digit';

export interface ScriptUnit {
  ch: string;
  kind: ScriptUnitKind;
}

/** Signes distincts nécessaires pour lire un mot (consonnes, signes vocaliques, marques de ton, chiffres). */
export function scriptUnits(thai: string): ScriptUnit[] {
  const out = new Map<string, ScriptUnit>();
  for (const ch of thai.normalize('NFC')) {
    if (IGNORED_RE.test(ch)) continue;
    let kind: ScriptUnitKind | null = null;
    if (CONSONANT_RE.test(ch)) kind = 'cons';
    else if (TONE_MARK_RE.test(ch)) kind = 'tone';
    else if (VOWEL_SIGN_RE.test(ch)) kind = 'vowel';
    else if (THAI_DIGIT_RE.test(ch)) kind = 'digit';
    if (kind && !out.has(ch)) out.set(ch, { ch, kind });
  }
  return [...out.values()];
}

export const consonantsOf = (thai: string) => scriptUnits(thai).filter((u) => u.kind === 'cons').map((u) => u.ch);

/** Le mot est-il lisible avec un ensemble de signes connus ? */
export function readableWith(thai: string, known: ReadonlySet<string>): boolean {
  return scriptUnits(thai).every((u) => known.has(u.ch));
}

/** Signes du mot qui manquent dans l'ensemble connu. */
export const missingUnits = (thai: string, known: ReadonlySet<string>) => scriptUnits(thai).filter((u) => !known.has(u.ch));

export const isThaiText = (s: string) => /[฀-๿]/.test(s);

/** Ne garde que les caractères thaïs et chiffres (pour comparer une reconnaissance vocale). */
export const normThai = (s: string) => String(s).replace(/[^฀-๿0-9]/g, '');

/** Nombre de caractères « pleins » (hors diacritiques), pour choisir une taille d'affichage. */
export function visualLength(thai: string): number {
  return thai.replace(/[ัิ-ฺ็-๎\s]/g, '').length;
}
