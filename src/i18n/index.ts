import { fr, type Dict } from './fr';
import type { Localized, SourceLang } from '@/content/types';

const DICTS: Record<SourceLang, Dict> = { fr, en: fr };

let current: SourceLang = 'fr';
export const setUiLang = (l: SourceLang) => { current = DICTS[l] ? l : 'fr'; };
export const uiLang = () => current;

/** Dictionnaire de l'interface. */
export const T = () => DICTS[current];

/** Texte localisé d'un contenu : la langue de l'interface, sinon le français. */
export const L = (x: Localized | undefined): string => (x ? x[current] ?? x.fr : '');
