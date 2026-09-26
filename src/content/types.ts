/**
 * Types du contenu pédagogique.
 *
 * Principe : un « pack » de contenu décrit une LANGUE CIBLE (ex. thaï). Tout ce qui est propre à la langue
 * (écriture, transcription, classes de consonnes, tons…) est porté par les objets eux-mêmes ; tout ce qui
 * dépend de la langue MATERNELLE de l'apprenant (sens, explications) est porté par des champs `Localized`
 * : { fr: "…", en: "…" }. Ajouter une langue maternelle = ajouter une clé dans ces objets.
 */

export type SourceLang = 'fr' | 'en';
export type TargetLang = 'th';
export type Localized = { fr: string; en?: string };

/** Classe d'une consonne thaïe : moyenne, haute, basse. */
export type ConsonantClass = 'M' | 'H' | 'L';
/** Les cinq tons : moyen, bas, descendant, haut, montant. */
export type ToneId = 'M' | 'L' | 'F' | 'H' | 'R';
export type VowelLength = 'S' | 'L';
export type VowelGroup = 'simple' | 'diph' | 'special' | 'combo';

export interface Consonant {
  id: string; // "c:ก"
  char: string;
  nameWord: string; // ไก่
  nameRom: string; // kɔɔ kài
  nameMeaning: Localized; // poulet
  cls: ConsonantClass;
  initial: string; // son initial (transcription) — "(muet)" pour อ
  initialIPA: string;
  final: string; // son final, "" si jamais en finale
  audioBase: string; // lettre courante de même son utilisée pour l'audio
  note?: Localized;
  obsolete?: boolean;
  rare?: boolean;
}

export interface Vowel {
  id: string; // "v:–า"
  form: string; // avec – pour la consonne
  rom: string;
  ipa: string;
  length: VowelLength;
  group: VowelGroup;
  positions: string; // L (avant) T (dessus) R (après) B (dessous)
  closedForm?: string; // forme en syllabe fermée, en clair
  example?: { thai: string; rom: string; meaning: Localized };
  note?: Localized;
  /** Caractères Unicode que cette voyelle ajoute autour de la consonne (pour la lisibilité progressive). */
  chars: string[];
}

export interface Tone {
  id: ToneId;
  name: Localized;
  thaiName: string;
  rom: string;
  mark: string; // exemple de voyelle marquée : a à â á ǎ
  color: string; // variable CSS
  path: string; // courbe SVG
  desc: Localized;
  example: { thai: string; rom: string; meaning: Localized };
}

export interface ToneMark {
  n: 1 | 2 | 3 | 4;
  char: string;
  name: string;
  rom: string;
}

export interface ToneWord {
  id: string; // "t:มา"
  thai: string;
  rom: string;
  meaning: Localized;
  cls: ConsonantClass; // classe effective (ห นำ → H, อ นำ → M)
  live: boolean;
  long: boolean;
  mark: 0 | 1 | 2 | 3 | 4;
  note?: Localized;
}

export interface ToneSet {
  words: string[]; // thaï, renvoie aux ToneWord
  note?: Localized;
}

export interface VocabItem {
  id: string; // "w:สวัสดี{P}"
  thai: string;
  rom: string;
  meaning: Localized;
  example?: { thai: string; rom: string; meaning: Localized };
  themes: string[];
}

export interface VocabTheme {
  id: string;
  name: Localized;
  icon: string;
  items: VocabItem[];
}

export interface GrammarPoint {
  id: string; // "g:order"
  icon: string;
  title: Localized;
  rule: Localized;
  pattern: string;
  examples: { thai: string; rom: string; meaning: Localized }[];
  tip?: Localized;
}

export interface DialogLine {
  who: 'me' | 'other';
  thai: string;
  rom: string;
  tr: Localized;
}

/**
 * Question de compréhension orale sur un dialogue, après écoute sans texte. `lang` (écoute longue) : « fr » tout en
 * français, « mixed » question en français et propositions en thaï, « th » tout en thaï (les traductions `q` et
 * `choices` s'affichent après la réponse).
 */
export interface DialogQuestion {
  q: Localized;
  choices: Localized[];
  answer: number; // index de la bonne réponse dans `choices`
  lang?: 'fr' | 'mixed' | 'th';
  qTh?: string;
  choicesTh?: string[];
}

export interface Dialog {
  id: string; // "d:market"
  title: Localized;
  icon: string;
  other: Localized; // rôle de l'interlocuteur
  /** Genre de l'interlocuteur (voix) ; sinon déduit de ses particules de politesse puis du rôle. */
  otherGender?: 'm' | 'f';
  lines: DialogLine[];
  /** Questions rédigées (complétées par des questions générées à partir des répliques). */
  questions?: DialogQuestion[];
  /** Écoute longue (1 à 2 minutes) : niveau, et icône du jeu d'icônes de l'application (au lieu d'un émoji). */
  level?: 'A1' | 'A2' | 'B1';
}

export interface ReadingToken {
  thai: string;
  rom: string;
  gloss: Localized;
}

export interface Reading {
  id: string; // "r:r1"
  level: number;
  title: Localized;
  sentences: { tr: Localized; tokens: ReadingToken[] }[];
}

export interface Classifier {
  id: string; // "k:คน"
  thai: string;
  rom: string;
  use: Localized;
  example: { thai: string; rom: string; meaning: Localized };
}

export interface GlossEntry {
  thai: string;
  rom: string;
  meaning: Localized;
}

export interface PhraseBookSection {
  id: string;
  title: Localized;
  icon: string;
  keys: string[]; // thaï des entrées de vocabulaire
}

/** Élément d'apprentissage générique (tout ce qui possède une maîtrise). */
export type ItemKind = 'cons' | 'vow' | 'word' | 'tone' | 'num' | 'clf' | 'rule' | 'grammar';
