import { fr, type Dict } from './fr';
import type { Localized, SourceLang } from '@/content/types';

/**
 * Typographie française, appliquée à l'affichage (jamais aux données) :
 * - apostrophe typographique ’ après une lettre (l’eau, aujourd’hui) ;
 * - espace fine insécable avant ? ! ; et insécable avant : (le signe ne part jamais seul à la ligne) ;
 * - insécables à l'intérieur des guillemets « … » ;
 * (Les traits d'union restent des traits d'union : l'affichage React les protège, voir `Fr` et `Rom` dans ui.tsx.)
 */
export const frTypo = (s: string): string =>
  !s ? s : s
    .replace(/(?<=\p{L})'/gu, '\u2019')
    .replace(/[ \u00a0\u202f]+([?!;])/g, '\u202f$1')
    .replace(/[ \u00a0\u202f]+:/g, '\u00a0:')
    .replace(/«[ \u00a0\u202f]*/g, '«\u00a0')
    .replace(/[ \u00a0\u202f]*»/g, '\u00a0»');

/** Applique frTypo à toutes les chaînes d'un dictionnaire (tableaux et objets imbriqués). */
function typoDeep<T>(x: T): T {
  if (typeof x === 'string') return frTypo(x) as T;
  if (Array.isArray(x)) return x.map(typoDeep) as T;
  if (x && typeof x === 'object') return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, typoDeep(v)])) as T;
  return x;
}

const DICTS: Record<SourceLang, Dict> = { fr: typoDeep(fr), en: typoDeep(fr) };

let current: SourceLang = 'fr';
export const setUiLang = (l: SourceLang) => { current = DICTS[l] ? l : 'fr'; };
export const uiLang = () => current;

/** Dictionnaire de l'interface. */
export const T = () => DICTS[current];

/** Texte localisé d'un contenu : la langue de l'interface, sinon le français (avec la typographie française). */
export const L = (x: Localized | undefined): string => {
  if (!x) return '';
  const own = x[current];
  return own != null && current !== 'fr' ? own : frTypo(own ?? x.fr);
};
