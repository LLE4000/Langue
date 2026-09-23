/**
 * Registre des couples de langues. Un pack réunit : la langue cible (contenu), la langue maternelle
 * (traductions/interface), les paramètres de synthèse vocale et le curriculum.
 * Pour ajouter un couple : créer le contenu et le curriculum, puis l'enregistrer ici.
 */
import type { SourceLang, TargetLang } from './types';
import type { Curriculum } from '@/curriculum/types';

export interface LanguagePack {
  id: string; // "fr-th"
  source: SourceLang;
  target: TargetLang;
  label: { fr: string; en?: string };
  flag: string;
  speechLang: string; // BCP-47 pour la synthèse et la reconnaissance vocale
  langBase: string; // préfixe de langue des voix ("th")
  voiceNameRe: RegExp; // reconnaît une voix cible dont la langue n'est pas renseignée
  fontFamily: string; // pile de polices traditionnelle
  modernFontFamily: string; // pile de polices moderne (sans boucles)
  loadCurriculum: () => Curriculum;
}

import { buildCurriculum as buildFrTh } from '@/curriculum/th-fr';

export const PACKS: LanguagePack[] = [
  {
    id: 'fr-th', source: 'fr', target: 'th', label: { fr: 'Français → Thaï' }, flag: '🇹🇭',
    speechLang: 'th-TH', langBase: 'th', voiceNameRe: /thai|thaï|ไทย/i,
    fontFamily: '"Sarabun","Noto Sans Thai Looped","Noto Serif Thai","Leelawadee UI",Thonburi,sans-serif',
    modernFontFamily: '"Kanit","Prompt","IBM Plex Sans Thai",sans-serif',
    loadCurriculum: buildFrTh,
  },
];

let active = PACKS[0];
export const activePack = () => active;
export function selectPack(id: string) {
  const p = PACKS.find((x) => x.id === id);
  if (p) active = p;
  return active;
}
export const curriculum = () => active.loadCurriculum();
