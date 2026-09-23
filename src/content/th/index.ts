/**
 * Pack de contenu THAÏ : assemble les données en un registre d'éléments d'apprentissage.
 * Chaque lettre, voyelle, mot, mot-ton, nombre, classificateur, règle ou point de grammaire devient un
 * `LearnItem` avec un identifiant stable — c'est sur ces identifiants que porte la maîtrise.
 */
import type { Classifier, Consonant, GrammarPoint, ItemKind, Localized, ToneId, ToneWord, VocabItem, Vowel } from '../types';
import { CONSONANTS, CONSONANT_ORDER } from './consonants';
import { VOWELS } from './vowels';
import { TONES, TONE_MARKS, TONE_WORDS, TONE_SETS } from './tones';
import { DIGITS, NUM_KEY, NUM_NOTES } from './numbers';
import { VOCAB_THEMES, THEME_ORDER, THEME_GROUPS } from './vocabulary';
import { GRAMMAR } from './grammar';
import { DIALOGS, DIALOG_FOR_THEME } from './dialogs';
import { READINGS } from './readings';
import { CLASSIFIERS, CLF_PATTERNS, CLF_QUIZ } from './classifiers';
import { GLOSS } from './gloss';
import { PHRASEBOOK, SOS_NUMBERS } from './phrasebook';
import { LOOKALIKES, NEAR_SOUNDS, LETTER_TIPS } from './alphabetExtras';
import { PHON_CONSONANTS, PHON_VOWELS } from './phonGuide';
import { thaiNumber } from '@/engine/thai/numbers';
import { toneOfWord, ruleKeyOf, ALL_RULE_KEYS, ruleLabel } from '@/engine/thai/toneRule';
import { buildLexicon, type Lexicon } from '@/engine/wbw';

export interface LearnItemBase {
  id: string;
  kind: ItemKind;
  thai: string; // forme affichée
  rom: string;
  meaning: Localized;
  say: string; // texte envoyé à la synthèse vocale
  targets: string[]; // formes acceptées par la reconnaissance vocale
}
export type LearnItem =
  | (LearnItemBase & { kind: 'cons'; ref: Consonant })
  | (LearnItemBase & { kind: 'vow'; ref: Vowel })
  | (LearnItemBase & { kind: 'word'; ref: VocabItem; sub?: boolean })
  | (LearnItemBase & { kind: 'tone'; ref: ToneWord; tone: ToneId; ruleKey: string })
  | (LearnItemBase & { kind: 'num'; value: number; digits: string })
  | (LearnItemBase & { kind: 'clf'; ref: Classifier })
  | (LearnItemBase & { kind: 'rule'; ruleKey: string })
  | (LearnItemBase & { kind: 'grammar'; ref: GrammarPoint });

export const ITEMS: Record<string, LearnItem> = {};
const put = <T extends LearnItem>(it: T): T => { ITEMS[it.id] = it; return it; };

/** Consonne de référence pour afficher une voyelle (◌ → ก). */
export const vowelDisplay = (form: string, ref = 'ก') => form.replace(/–/g, ref);

export const CONS_ITEMS = CONSONANTS.map((c) => put({
  id: c.id, kind: 'cons' as const, thai: c.char, rom: c.nameRom, meaning: c.nameMeaning, ref: c,
  say: c.audioBase + 'อ ' + c.nameWord,
  targets: [c.audioBase + 'อ' + c.nameWord, c.char + c.nameWord, c.char + 'อ' + c.nameWord],
}));
export const CONS_BY_CHAR: Record<string, Consonant> = Object.fromEntries(CONSONANTS.map((c) => [c.char, c]));
export const LIVE_CONSONANTS = CONSONANTS.filter((c) => !c.obsolete);

export const VOWEL_ITEMS = VOWELS.map((v) => put({
  id: v.id, kind: 'vow' as const, thai: vowelDisplay(v.form), rom: v.rom, ref: v,
  meaning: { fr: `voyelle ${v.length === 'S' ? 'courte' : 'longue'} « ${v.rom} »` },
  say: v.form.replace(/–/g, 'อ'), targets: [v.form.replace(/–/g, 'อ')],
}));
/** Voyelles enseignées (celles qui ont un mot d'exemple, hors formes brèves rarissimes). */
export const TAUGHT_VOWELS = VOWELS.filter((v) => v.example);

export const WORD_ITEMS: (LearnItemBase & { kind: 'word'; ref: VocabItem; sub?: boolean })[] = [];
export const WORD_BY_THAI: Record<string, LearnItem & { kind: 'word' }> = {};
const wordTargets = (t: string) => { const b = t.replace(/\{[PQ]\}$/, ''); return b !== t ? [t, b] : [t]; };
for (const theme of VOCAB_THEMES) {
  for (const w of theme.items) {
    const existing = ITEMS[w.id];
    if (existing && existing.kind === 'word') { if (!existing.ref.themes.includes(theme.id)) existing.ref.themes.push(theme.id); continue; }
    const it = put({ id: w.id, kind: 'word' as const, thai: w.thai, rom: w.rom, meaning: w.meaning, ref: w, say: w.thai, targets: wordTargets(w.thai) });
    WORD_ITEMS.push(it);
    WORD_BY_THAI[w.thai] = it;
    if (w.example && !ITEMS['w:' + w.example.thai]) {
      const ex: VocabItem = { id: 'w:' + w.example.thai, thai: w.example.thai, rom: w.example.rom, meaning: w.example.meaning, themes: [theme.id] };
      const sub = put({ id: ex.id, kind: 'word' as const, thai: ex.thai, rom: ex.rom, meaning: ex.meaning, ref: ex, say: ex.thai, targets: wordTargets(ex.thai), sub: true });
      WORD_ITEMS.push(sub);
      WORD_BY_THAI[ex.thai] = sub;
    }
  }
}
/** Répliques des dialogues, également apprenables (mais pas dans le vocabulaire principal). */
for (const d of DIALOGS) for (const l of d.lines) {
  const id = 'w:' + l.thai;
  if (!ITEMS[id]) {
    const ref: VocabItem = { id, thai: l.thai, rom: l.rom, meaning: l.tr, themes: [] };
    const it = put({ id, kind: 'word' as const, thai: l.thai, rom: l.rom, meaning: l.tr, ref, say: l.thai, targets: wordTargets(l.thai), sub: true });
    WORD_ITEMS.push(it);
    WORD_BY_THAI[l.thai] = it;
  }
}
/** Mots-outils du lexique, apprenables eux aussi (utile pour les premières lectures). */
for (const g of GLOSS) {
  const id = 'w:' + g.thai;
  if (!ITEMS[id] && !/\s/.test(g.thai)) {
    const ref: VocabItem = { id, thai: g.thai, rom: g.rom, meaning: g.meaning, themes: [] };
    const it = put({ id, kind: 'word' as const, thai: g.thai, rom: g.rom, meaning: g.meaning, ref, say: g.thai, targets: [g.thai], sub: true });
    WORD_ITEMS.push(it);
    WORD_BY_THAI[g.thai] = it;
  }
}
export const MAIN_WORDS = WORD_ITEMS.filter((w) => !w.sub);
export const THEME_BY_ID: Record<string, (typeof VOCAB_THEMES)[number]> = Object.fromEntries(VOCAB_THEMES.map((t) => [t.id, t]));

export const TONE_ITEMS = TONE_WORDS.map((w) => put({
  id: w.id, kind: 'tone' as const, thai: w.thai, rom: w.rom, meaning: w.meaning, ref: w, say: w.thai, targets: [w.thai],
  tone: toneOfWord(w), ruleKey: ruleKeyOf(w),
}));
export const TONE_BY_THAI: Record<string, LearnItem & { kind: 'tone' }> = Object.fromEntries(TONE_ITEMS.map((t) => [t.thai, t]));
export const TONE_BY_ID = Object.fromEntries(TONES.map((t) => [t.id, t])) as Record<ToneId, (typeof TONES)[number]>;

export const NUM_ITEMS = NUM_KEY.map((n) => {
  const t = thaiNumber(n);
  return put({ id: 'n:' + n, kind: 'num' as const, thai: t.thai, rom: t.rom, meaning: { fr: n.toLocaleString('fr-FR') }, value: n, digits: t.digits, say: t.thai, targets: [t.thai, String(n), t.digits] });
});

export const CLF_ITEMS = CLASSIFIERS.map((c) => put({ id: c.id, kind: 'clf' as const, thai: c.thai, rom: c.rom, meaning: { fr: 'classificateur : ' + c.use.fr }, ref: c, say: c.thai, targets: [c.thai] }));

/** Règles de lecture (tons, finales, ห นำ…) : des notions à maîtriser au même titre que les mots. */
const READING_RULES: { id: string; fr: string }[] = [
  { id: 'rule:final-live', fr: 'Consonnes finales vivantes (น ม ง ย ว)' },
  { id: 'rule:final-dead', fr: 'Consonnes finales bloquées (ก ด บ)' },
  { id: 'rule:final-irregular', fr: 'Finales irrégulières (ส จ ช ล ร… → t, n)' },
  { id: 'rule:live-dead', fr: 'Syllabe vivante ou morte' },
  { id: 'rule:hnam', fr: 'ห นำ : le ห muet' },
  { id: 'rule:onam', fr: 'อ นำ : อย่า อยู่ อย่าง อยาก' },
  { id: 'rule:cluster', fr: 'Groupes de consonnes (กร กล ปล…)' },
  { id: 'rule:implicit-o', fr: 'Voyelle « o » non écrite (คน, นก)' },
  { id: 'rule:implicit-a', fr: 'Voyelle « a » non écrite (สบาย)' },
  { id: 'rule:karan', fr: 'Lettre muette ◌์' },
  { id: 'rule:maiyamok', fr: 'Signe de répétition ๆ' },
  { id: 'rule:digits', fr: 'Chiffres thaïs ๐–๙' },
  { id: 'rule:paiyan', fr: 'Abréviation ฯ' },
  { id: 'rule:silent-r', fr: 'ร final muet (บัตร, จักร)' },
  { id: 'rule:ko', fr: 'Le mot ก็ (kɔ̂ɔ)' },
];
export const RULE_ITEMS = [
  ...ALL_RULE_KEYS.map((k) => put({ id: k, kind: 'rule' as const, thai: '', rom: '', meaning: ruleLabel(k), say: '', targets: [], ruleKey: k })),
  ...READING_RULES.map((r) => put({ id: r.id, kind: 'rule' as const, thai: '', rom: '', meaning: { fr: r.fr }, say: '', targets: [], ruleKey: r.id })),
];
export const GRAMMAR_ITEMS = GRAMMAR.map((g) => put({ id: g.id, kind: 'grammar' as const, thai: g.pattern, rom: '', meaning: g.title, ref: g, say: '', targets: [] }));
export const GRAMMAR_BY_ID = Object.fromEntries(GRAMMAR.map((g) => [g.id, g]));
export const DIALOG_BY_ID = Object.fromEntries(DIALOGS.map((d) => [d.id, d]));
export const READING_BY_ID = Object.fromEntries(READINGS.map((r) => [r.id, r]));

export const KIND_LABEL: Record<ItemKind, Localized> = {
  cons: { fr: 'Consonne' }, vow: { fr: 'Voyelle' }, word: { fr: 'Mot' }, tone: { fr: 'Ton' }, num: { fr: 'Nombre' }, clf: { fr: 'Classificateur' }, rule: { fr: 'Règle' }, grammar: { fr: 'Grammaire' },
};

export const item = (id: string): LearnItem | undefined => ITEMS[id];
export const itemsOf = (ids: readonly string[]): LearnItem[] => ids.map((id) => ITEMS[id]).filter((x): x is LearnItem => !!x);

/** Lexique du mot à mot (construit paresseusement). */
let LEX: Lexicon | null = null;
export function lexicon(): Lexicon {
  if (LEX) return LEX;
  const src: { thai: string; rom: string; fr: string; priority: number }[] = [];
  GLOSS.forEach((g) => src.push({ thai: g.thai, rom: g.rom, fr: g.meaning.fr, priority: 5 }));
  READINGS.forEach((r) => r.sentences.forEach((s) => s.tokens.forEach((t) => src.push({ thai: t.thai, rom: t.rom, fr: t.gloss.fr, priority: 4 }))));
  VOCAB_THEMES.forEach((t) => t.items.forEach((w) => src.push({ thai: w.thai, rom: w.rom, fr: w.meaning.fr, priority: 3 })));
  NUM_ITEMS.forEach((n) => src.push({ thai: n.thai, rom: n.rom, fr: n.meaning.fr, priority: 3 }));
  TONE_WORDS.forEach((w) => src.push({ thai: w.thai, rom: w.rom, fr: w.meaning.fr, priority: 2 }));
  CLASSIFIERS.forEach((c) => src.push({ thai: c.thai, rom: c.rom, fr: '(classificateur)', priority: 1 }));
  return (LEX = buildLexicon(src));
}

/** Texte thaï d'une phrase de lecture (niveau 1 : mots espacés pour aider). */
export const sentenceThai = (tokens: { thai: string }[], spaced = false) => tokens.map((t) => t.thai).join(spaced ? ' ' : '');
export const sentenceRom = (tokens: { rom: string }[]) => tokens.map((t) => t.rom).join(' ');

export const th = {
  CONSONANTS, CONSONANT_ORDER, VOWELS, TONES, TONE_MARKS, TONE_WORDS, TONE_SETS, DIGITS, NUM_KEY, NUM_NOTES,
  VOCAB_THEMES, THEME_ORDER, THEME_GROUPS, GRAMMAR, DIALOGS, DIALOG_FOR_THEME, READINGS, CLASSIFIERS, CLF_PATTERNS, CLF_QUIZ,
  GLOSS, PHRASEBOOK, SOS_NUMBERS, LOOKALIKES, NEAR_SOUNDS, LETTER_TIPS, PHON_CONSONANTS, PHON_VOWELS,
};
