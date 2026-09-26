/**
 * Types du curriculum : un parcours = des leçons décrites en DONNÉES (aucun code d'interface).
 * Le moteur de leçon (features/lesson) transforme ces descriptions en activités concrètes.
 */
import type { Localized } from '@/content/types';

export type Skill = 'listening' | 'speaking' | 'reading' | 'writing';
export const SKILLS: Skill[] = ['listening', 'speaking', 'reading', 'writing'];

/** Niveau déclaré par compétence : 0 débutant complet … 4 avancé (≈ B2+). */
export type Level = 0 | 1 | 2 | 3 | 4;

/** Objectifs de l'apprenant : parler et comprendre, lire et écrire, ou les deux. */
export interface Goals { speak: boolean; read: boolean }
export const ALL_GOALS: Goals = { speak: true, read: true };
/** Compétences concernées par des objectifs. */
export const goalSkills = (g: Goals): Skill[] => [...(g.speak ? (['listening', 'speaking'] as Skill[]) : []), ...(g.read ? (['reading', 'writing'] as Skill[]) : [])];
/** Une piste du curriculum sert-elle ces objectifs ? */
export const trackAllowed = (t: Track, g: Goals) => (!g.speak && !g.read ? true : t === 'script' || t === 'tones' ? g.read : g.speak);

export type Track = 'script' | 'talk' | 'tones' | 'numbers';

export interface TheoryBlock {
  kind: 'text' | 'note' | 'tip' | 'letters' | 'vowels' | 'words' | 'syllables' | 'toneRule' | 'grammar' | 'pattern' | 'tones' | 'toneMarks' | 'classifiers' | 'numbers' | 'compare';
  text?: Localized; // text / note / tip / pattern
  ids?: string[]; // letters / vowels / words / classifiers / numbers / tones (identifiants d'éléments)
  syllables?: { thai: string; rom: string }[];
  ruleKey?: string; // toneRule
  grammarId?: string;
  words?: string[]; // compare : mots thaïs (séries de tons)
}

export type ActivitySpec =
  | { type: 'theory'; title?: Localized; blocks: TheoryBlock[] }
  | { type: 'flashcard'; items: string[]; note?: Localized } // découverte : recto/verso + auto-évaluation
  | { type: 'listen'; items: string[]; pool?: string[]; count?: number } // entendre → choisir
  | { type: 'read'; items: string[]; answer: 'rom' | 'meaning' | 'sound'; pool?: string[]; count?: number } // voir → choisir
  | { type: 'multipleChoice'; items: string[]; direction: 'thaiToMeaning' | 'meaningToThai'; pool?: string[]; count?: number }
  | { type: 'match'; items: string[]; by: 'meaning' | 'rom' } // paires
  | { type: 'dictation'; items: string[]; pool?: string[]; count?: number } // entendre → choisir l'écrit
  | { type: 'spell'; items: string[]; count?: number } // écrire : assembler le mot à partir de ses signes
  | { type: 'syllables'; syllables: { thai: string; rom: string }[]; count?: number } // lire des syllabes
  | { type: 'toneExercise'; items: string[]; mode: 'rule' | 'ear' | 'livedead' | 'pair'; count?: number }
  | { type: 'build'; sentences: { readingId: string; index: number }[] } // remettre les mots dans l'ordre
  | { type: 'dialog'; id: string }
  | { type: 'reading'; id: string }
  | { type: 'repeat'; items: string[] } // écouter, répéter au micro (facultatif selon l'appareil)
  | { type: 'review'; count: number } // révision espacée intercalée
  | { type: 'recap' };

/** Type de leçon, pour sa carte : chaque type a sa couleur, son badge et son libellé (voir curriculum/card). */
export type LessonKind = 'letters' | 'vowels' | 'tones' | 'rules' | 'reading' | 'vocab' | 'dialog' | 'numbers' | 'classifiers';

export interface LessonDef {
  id: string;
  track: Track;
  unit: string; // identifiant d'unité (regroupe les leçons dans le parcours)
  title: Localized; // court : tient sur une ligne ; « · 1/2 » final = partie d'une série
  subtitle?: Localized; // en français, sans suite de signes thaïs
  /** Présentation de la carte : type, glyphe du badge, indicateur de contenu. Déduits s'ils manquent. */
  kind?: LessonKind;
  badge?: string;
  count?: Localized;
  skills: Skill[];
  prerequisites: string[]; // identifiants de leçons
  newConcepts: string[]; // identifiants d'éléments introduits (lettres, voyelles, mots, règles, m:1…)
  reviewConcepts?: string[];
  activities: ActivitySpec[];
  minutes: number;
  /** Niveau oral approximatif du contenu (0–4) : un apprenant qui parle déjà mieux « connaît » ces mots à l'oral. */
  oralLevel?: number;
  /** Niveau de lecture approximatif (0–4) : un lecteur confirmé n'a pas besoin de cette leçon. */
  readLevel?: number;
  /** Critère de validation : proportion de bonnes réponses aux activités notées. */
  minScore: number;
}

export interface UnitDef {
  id: string;
  track: Track;
  title: Localized;
  description?: Localized;
}

export interface Curriculum {
  units: UnitDef[];
  lessons: LessonDef[];
}
