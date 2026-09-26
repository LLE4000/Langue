/**
 * La carte d'une leçon : ce qu'on en voit avant de l'ouvrir, identique partout (accueil, parcours, bilan).
 *   - un TYPE reconnaissable d'un coup d'œil : couleur, badge (le signe étudié ou une icône) et libellé ;
 *   - un titre court (une ligne), un sous-titre en français, un indicateur de contenu (« 5 consonnes + 1 voyelle »).
 * Tout se déduit des données de la leçon ; le curriculum peut préciser le type, le badge et l'indicateur.
 */
import type { LessonDef, LessonKind } from './types';
import { GRAMMAR_BY_ID, ITEMS } from '@/content/th';

export const KIND_META: Record<LessonKind, { label: string; icon?: string }> = {
  letters: { label: 'Alphabet' },
  vowels: { label: 'Voyelles' },
  tones: { label: 'Tons', icon: 'tone' },
  rules: { label: 'Règles de lecture' },
  reading: { label: 'Lecture', icon: 'bookOpen' },
  vocab: { label: 'Vocabulaire', icon: 'word' },
  dialog: { label: 'Conversation', icon: 'dialog' },
  numbers: { label: 'Nombres' },
  classifiers: { label: 'Classificateurs', icon: 'cube' },
};

export interface LessonCard {
  kind: LessonKind;
  label: string;
  title: string;
  /** partie d'une série (« 1/2 »), affichée à côté du titre */
  part?: string;
  sub: string;
  /** indicateur principal du contenu */
  count: string;
  /** compléments : mots à lire, texte, grammaire… */
  extras: string[];
  badge: { glyph?: string; icon?: string };
}

const THAI = /[\u0E00-\u0E7F]/;
const plural = (n: number, one: string, many = one + 's') => `${n} ${n > 1 ? many : one}`;
const concepts = (l: LessonDef, prefix: string) => l.newConcepts.filter((c) => c.startsWith(prefix));
/** Une voyelle se montre sur sa consonne support อ, comme dans les dictionnaires thaïs (–า → อา). */
export const vowelGlyph = (id: string) => id.replace(/^v:/, '').replace('–', 'อ');

export function lessonKind(l: LessonDef): LessonKind {
  if (l.kind) return l.kind;
  if (l.track === 'talk') return l.activities.some((a) => a.type === 'dialog') ? 'dialog' : 'vocab';
  if (l.track === 'numbers') return l.id.startsWith('clf') ? 'classifiers' : 'numbers';
  if (l.track === 'tones') return 'tones';
  const c = concepts(l, 'c:').length, v = concepts(l, 'v:').length;
  if (c || v) return c >= v ? 'letters' : 'vowels';
  return l.activities.some((a) => a.type === 'reading') ? 'reading' : 'rules';
}

export function lessonCard(l: LessonDef): LessonCard {
  const kind = lessonKind(l);
  const meta = KIND_META[kind];
  const m = /^(.*?)\s*·\s*(\d+(?:\/\d+)?)$/.exec(l.title.fr);
  const cons = concepts(l, 'c:'), vows = concepts(l, 'v:'), marks = concepts(l, 'm:');
  const words = l.newConcepts.filter((c) => c.startsWith('w:') || c.startsWith('t:'));
  const texts = l.activities.filter((a) => a.type === 'reading').length;
  const grammar = l.newConcepts.find((c) => c.startsWith('g:'));
  const items = l.newConcepts.filter((c) => !/^(rule|g):/.test(c));

  // Indicateur principal : ce qu'on apprend, compté
  let count = l.count?.fr ?? '';
  if (!count) {
    if (kind === 'letters' || kind === 'vowels') {
      const parts = [cons.length ? plural(cons.length, 'consonne') : '', vows.length ? plural(vows.length, 'voyelle') : '', marks.length ? plural(marks.length, 'marque') : ''].filter(Boolean);
      if (kind === 'vowels') parts.sort((a, b) => Number(b.includes('voyelle')) - Number(a.includes('voyelle')));
      count = parts.join(' + ');
    } else if (kind === 'reading') count = plural(texts, 'texte');
    else if (kind === 'vocab' || kind === 'dialog') count = plural(items.length, 'expression');
    else if (kind === 'numbers') count = plural(items.length, 'nombre');
    else if (kind === 'classifiers') count = plural(items.length, 'classificateur');
    else count = plural(words.length, 'mot');
  }

  const extras: string[] = [];
  if (l.track === 'script' && kind !== 'reading' && words.length) extras.push(`${plural(words.length, 'mot')} à lire`);
  if (texts && kind !== 'reading') extras.push(plural(texts, 'texte'));
  if (grammar) {
    // la partie française du titre de la fiche (« la négation : ไม่ » → « la négation »)
    const fr = (GRAMMAR_BY_ID[grammar]?.title.fr ?? '').split(/\s:\s/).filter((p) => !THAI.test(p)).join(' : ');
    extras.push(fr ? `grammaire : ${fr.charAt(0).toLowerCase()}${fr.slice(1)}` : 'grammaire');
  }

  const badge = l.badge ? { glyph: l.badge }
    : kind === 'letters' && cons[0] ? { glyph: cons[0].slice(2) }
      : kind === 'vowels' && vows[0] ? { glyph: vowelGlyph(vows[0]) }
        : kind === 'numbers' ? { glyph: ITEMS[items[0]]?.thai ?? '๑' }
          : { icon: meta.icon ?? 'book' };

  return { kind, label: meta.label, title: m ? m[1] : l.title.fr, part: m?.[2], sub: l.subtitle?.fr ?? '', count, extras, badge };
}
