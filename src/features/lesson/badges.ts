/** Badges : sobres, liés à de vraies étapes d'apprentissage. */
import type { PersistedState } from '@/app/store';
import { streakDays } from '@/app/store';
import { CONS_ITEMS, MAIN_WORDS, TAUGHT_VOWELS, TONE_ITEMS } from '@/content/th';
import { mastery } from '@/engine/srs';

/** `icon` : un nom du jeu d'icônes (ui.tsx), ou un glyphe thaï (ก, า) — à afficher avec GlyphIcon. */
export interface BadgeDef { id: string; icon: string; title: string; desc: string; test: (s: PersistedState) => boolean }

const known = (s: PersistedState, ids: string[], th = 0.5) => ids.filter((id) => mastery(s.srs[id]) >= th).length;
const lessonsDone = (s: PersistedState) => Object.values(s.lessons).filter((l) => l.done).length;

export const BADGES: BadgeDef[] = [
  { id: 'first-lesson', icon: 'sparkles', title: 'Premier pas', desc: 'Première leçon validée', test: (s) => lessonsDone(s) >= 1 },
  { id: 'ten-lessons', icon: 'trend', title: 'En route', desc: '10 leçons validées', test: (s) => lessonsDone(s) >= 10 },
  { id: 'fifty-lessons', icon: 'bolt', title: 'Rythme trouvé', desc: '50 leçons validées', test: (s) => lessonsDone(s) >= 50 },
  { id: 'letters-10', icon: 'ก', title: 'Dix lettres', desc: '10 consonnes connues', test: (s) => known(s, CONS_ITEMS.map((c) => c.id)) >= 10 },
  { id: 'letters-all', icon: 'type', title: 'Tout l’alphabet', desc: 'Les 42 consonnes en usage connues', test: (s) => known(s, CONS_ITEMS.filter((c) => !c.ref.obsolete).map((c) => c.id)) >= 42 },
  { id: 'vowels-all', icon: 'า', title: 'Voyelles', desc: 'Toutes les voyelles connues', test: (s) => known(s, TAUGHT_VOWELS.map((v) => v.id)) >= TAUGHT_VOWELS.length },
  { id: 'words-50', icon: 'chat', title: '50 mots', desc: '50 mots connus', test: (s) => known(s, MAIN_WORDS.map((w) => w.id)) >= 50 },
  { id: 'words-200', icon: 'book', title: '200 mots', desc: '200 mots connus', test: (s) => known(s, MAIN_WORDS.map((w) => w.id)) >= 200 },
  { id: 'words-500', icon: 'layers', title: '500 mots', desc: '500 mots connus', test: (s) => known(s, MAIN_WORDS.map((w) => w.id)) >= 500 },
  { id: 'tones-20', icon: 'tone', title: 'Oreille tonale', desc: '20 mots-tons maîtrisés', test: (s) => known(s, TONE_ITEMS.map((t) => t.id), 0.8) >= 20 },
  { id: 'streak-7', icon: 'flame', title: 'Une semaine', desc: '7 jours d’affilée', test: (s) => streakDays(s.days) >= 7 },
  { id: 'streak-30', icon: 'trophy', title: 'Un mois', desc: '30 jours d’affilée', test: (s) => streakDays(s.days) >= 30 },
  { id: 'xp-1000', icon: 'star', title: '1 000 XP', desc: 'Mille points d’expérience', test: (s) => s.xp >= 1000 },
  { id: 'perfect', icon: 'checkCircle', title: 'Sans faute', desc: 'Une leçon à 100 %', test: (s) => Object.values(s.lessons).some((l) => l.total && l.score === l.total && l.total >= 8) },
  { id: 'reader', icon: 'bookOpen', title: 'Lecteur', desc: 'Toute la piste d’écriture validée', test: (s) => Object.keys(s.lessons).filter((id) => id.startsWith('read-') && s.lessons[id].done).length >= 21 },
];

/** Renvoie les badges nouvellement obtenus. */
export function checkBadges(s: PersistedState): BadgeDef[] {
  return BADGES.filter((b) => !s.badges[b.id] && b.test(s));
}
