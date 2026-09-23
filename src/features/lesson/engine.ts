/**
 * Moteur de leçon : transforme les activités déclaratives d'une leçon (curriculum) en étapes concrètes,
 * sérialisables (pour reprendre après un rechargement), avec des questions tirées au sort.
 *
 * Aucun code d'interface ici : l'UI (LessonRunner) ne fait qu'afficher les étapes et enregistrer les réponses.
 */
import type { ActivitySpec, LessonDef, TheoryBlock } from '@/curriculum/types';
import type { SkillLevels } from '@/curriculum/path';
import { ITEMS, CONS_ITEMS, VOWEL_ITEMS, TONE_ITEMS, NUM_ITEMS, CLF_ITEMS, WORD_ITEMS, TAUGHT_VOWELS, TONE_BY_ID, READING_BY_ID, sentenceThai, sentenceRom, th, type LearnItem } from '@/content/th';
import { TONES } from '@/content/th/tones';
import { isReadable } from '@/engine/thai/reading';
import { scriptUnits } from '@/engine/thai/script';
import { explainTone, toneNameFr } from '@/engine/thai/toneRule';
import { plainRom, parseSyl, isLiveSyllable } from '@/engine/thai/transcription';
import { isDue, type SrsState } from '@/engine/srs';
import { shuffle, sample, withDistractors, rnd, uniq } from '@/engine/util';
import type { Localized } from '@/content/types';

export interface Ctx {
  known: ReadonlySet<string>; // notions connues (lisibilité)
  srs: Record<string, SrsState>;
  levels: SkillLevels;
  knownOrally: boolean; // le contenu oral de la leçon est déjà connu
  seen: Record<string, number>;
  micAvailable: boolean;
}

/** Une proposition de réponse. */
export interface Choice { thai?: string; rom?: string; text?: string; tone?: string; ok: boolean }

export interface Question {
  id: string; // unique dans la séance
  itemId?: string; // élément dont on met à jour la maîtrise
  ruleKey?: string;
  kind: 'listen' | 'read' | 'meaning' | 'toThai' | 'dictation' | 'syllable' | 'tone' | 'toneEar' | 'livedead' | 'spell';
  prompt: Localized;
  /** ce qu'on montre avant la réponse */
  stage: { thai?: string; rom?: string; text?: string; ear?: boolean; big?: boolean; showRom?: boolean };
  say?: string; // audio joué automatiquement (question d'écoute)
  sayAfter?: string; // audio joué après la réponse
  choices: Choice[];
  /** épellation : signes à assembler (dans l'ordre) */
  spell?: { target: string; tiles: string[] };
  /** ce qu'on révèle après la réponse */
  reveal?: { thai?: string; rom?: string; text?: string; explain?: Localized[] };
  meaningHint?: Localized; // pour « tu connais déjà ce mot à l'oral »
}

export type RuntimeStep =
  | { type: 'theory'; title?: Localized; blocks: TheoryBlock[] }
  | { type: 'flashcards'; items: string[]; note?: Localized; knownOrally?: boolean }
  | { type: 'questions'; label: Localized; questions: Question[]; graded: boolean }
  | { type: 'match'; pairs: { id: string; thai: string; rom: string; text: string }[]; by: 'meaning' | 'rom' }
  | { type: 'build'; items: { readingId: string; index: number }[] }
  | { type: 'dialog'; id: string }
  | { type: 'reading'; id: string }
  | { type: 'repeat'; items: string[] }
  | { type: 'recap' };

const L = (fr: string): Localized => ({ fr });
const items = (ids: readonly string[]) => ids.map((id) => ITEMS[id]).filter((x): x is LearnItem => !!x);
let qn = 0;
const qid = () => 'q' + (++qn) + '-' + Math.random().toString(36).slice(2, 6);

const mk = (right: Choice, wrongs: Choice[]): Choice[] => shuffle([right, ...wrongs]);
const meaningOf = (it: LearnItem) => it.kind === 'cons' ? it.ref.nameMeaning.fr : it.meaning.fr;
const readableWords = (ctx: Ctx, ids: readonly string[]) => items(ids).filter((it) => it.kind === 'cons' || it.kind === 'vow' || isReadable(it.thai, ctx.known));

/** Pool de distracteurs cohérents avec le type d'élément et ce que l'apprenant connaît. */
function distractorPool(it: LearnItem, ctx: Ctx, extra: readonly string[] = []): LearnItem[] {
  const knownIds = new Set([...extra, ...Object.keys(ctx.srs)]);
  const same = (x: LearnItem) => x.kind === it.kind && x.id !== it.id;
  let pool: LearnItem[] = [];
  if (it.kind === 'cons') pool = CONS_ITEMS.filter((c) => same(c) && (knownIds.has(c.id) || ctx.known.has(c.id) || extra.includes(c.id)));
  else if (it.kind === 'vow') pool = VOWEL_ITEMS.filter((v) => same(v) && v.ref.example && (knownIds.has(v.id) || ctx.known.has(v.id) || extra.includes(v.id)));
  else if (it.kind === 'num') pool = NUM_ITEMS.filter(same);
  else if (it.kind === 'clf') pool = CLF_ITEMS.filter(same);
  else if (it.kind === 'tone') pool = TONE_ITEMS.filter(same);
  else pool = WORD_ITEMS.filter((w) => same(w) && (knownIds.has(w.id) || extra.includes(w.id)) && !/…/.test(w.thai));
  if (pool.length < 3) {
    // Dernier recours (très rare) : lettres de l'ordre d'apprentissage les plus proches, voyelles enseignées, mots courants
    const fallback = it.kind === 'cons' ? [...th.CONSONANT_ORDER].map((c) => ITEMS['c:' + c]).filter((c): c is LearnItem => !!c && c.kind === 'cons' && !c.ref.obsolete) : it.kind === 'vow' ? VOWEL_ITEMS.filter((v) => v.ref.example) : it.kind === 'word' ? WORD_ITEMS.filter((w) => !w.sub && !/…/.test(w.thai)) : pool;
    pool = uniq([...pool, ...fallback.filter(same)]);
  }
  return pool;
}

const sizeSimilar = (it: LearnItem, pool: LearnItem[]) => pool.slice().sort((a, b) => Math.abs(a.thai.length - it.thai.length) - Math.abs(b.thai.length - it.thai.length)).slice(0, Math.max(12, Math.ceil(pool.length / 2)));

// ------------------------------------------------------------------------------------------------
// Générateurs de questions
// ------------------------------------------------------------------------------------------------

export function qListen(it: LearnItem, ctx: Ctx, extra: readonly string[] = []): Question {
  const pool = distractorPool(it, ctx, extra);
  if (it.kind === 'cons') {
    return { id: qid(), itemId: it.id, kind: 'listen', prompt: L('Quelle lettre entendez-vous ?'), stage: { ear: true }, say: it.say,
      choices: mk({ thai: it.thai, ok: true }, withDistractors(pool, it, 3, (x) => x.thai).map((x) => ({ thai: x.thai, ok: false }))),
      reveal: { thai: it.thai + ' ' + it.ref.nameWord, rom: it.rom, text: meaningOf(it) } };
  }
  if (it.kind === 'num') {
    return { id: qid(), itemId: it.id, kind: 'listen', prompt: L('Quel nombre entendez-vous ?'), stage: { ear: true }, say: it.say,
      choices: mk({ text: it.meaning.fr, ok: true }, withDistractors(pool, it, 3, (x) => x.thai).map((x) => ({ text: x.meaning.fr, ok: false }))), reveal: { thai: it.thai, rom: it.rom } };
  }
  // mots, classificateurs, mots-tons : entendre → sens
  return { id: qid(), itemId: it.id, kind: 'listen', prompt: L('Que veut dire ce que vous entendez ?'), stage: { ear: true }, say: it.say,
    choices: mk({ text: meaningOf(it), ok: true }, withDistractors(sizeSimilar(it, pool), it, 3, (x) => meaningOf(x)).map((x) => ({ text: meaningOf(x), ok: false }))),
    reveal: { thai: it.thai, rom: it.rom, text: meaningOf(it) } };
}

export function qRead(it: LearnItem, answer: 'rom' | 'meaning' | 'sound', ctx: Ctx, extra: readonly string[] = []): Question {
  const pool = distractorPool(it, ctx, extra);
  if (it.kind === 'cons') {
    const snd = pool.filter((x) => x.kind === 'cons' && x.ref.initial !== '(muet)');
    return { id: qid(), itemId: it.id, kind: 'read', prompt: L('Quel est le son de cette lettre ?'), stage: { thai: it.thai, big: true },
      choices: mk({ rom: it.ref.initial, ok: true }, withDistractors(snd, it, 3, (x) => (x as LearnItem & { kind: 'cons' }).ref.initial).map((x) => ({ rom: (x as LearnItem & { kind: 'cons' }).ref.initial, ok: false }))),
      sayAfter: it.say, reveal: { thai: it.thai + ' ' + it.ref.nameWord, rom: it.rom, text: `classe ${it.ref.cls === 'M' ? 'moyenne' : it.ref.cls === 'H' ? 'haute' : 'basse'} · ${meaningOf(it)}` } };
  }
  if (it.kind === 'vow') {
    const lab = (v: LearnItem) => v.kind === 'vow' ? `${v.rom} · ${v.ref.length === 'S' ? 'courte' : 'longue'}` : v.rom;
    return { id: qid(), itemId: it.id, kind: 'read', prompt: L('Quelle est cette voyelle ?'), stage: { thai: it.thai, big: true },
      choices: mk({ rom: lab(it), ok: true }, withDistractors(pool, it, 3, lab).map((x) => ({ rom: lab(x), ok: false }))),
      sayAfter: it.ref.example?.thai ?? it.say, reveal: it.ref.example ? { thai: it.ref.example.thai, rom: it.ref.example.rom, text: it.ref.example.meaning.fr } : undefined };
  }
  if (answer === 'rom') {
    return { id: qid(), itemId: it.id, kind: 'read', prompt: L('Comment se lit ce mot ?'), stage: { thai: it.thai, big: true },
      choices: mk({ rom: it.rom, ok: true }, withDistractors(sizeSimilar(it, pool), it, 3, (x) => x.rom).map((x) => ({ rom: x.rom, ok: false }))), sayAfter: it.say, reveal: { rom: it.rom, text: meaningOf(it) } };
  }
  return { id: qid(), itemId: it.id, kind: 'meaning', prompt: L('Que veut dire ce mot ?'), stage: { thai: it.thai, big: true, showRom: false },
    choices: mk({ text: meaningOf(it), ok: true }, withDistractors(sizeSimilar(it, pool), it, 3, (x) => meaningOf(x)).map((x) => ({ text: meaningOf(x), ok: false }))), sayAfter: it.say,
    reveal: { rom: it.rom }, meaningHint: ctx.knownOrally ? L('Vous connaissez déjà ce mot à l’oral : ici, on apprend à le lire.') : undefined };
}

export function qMeaning(it: LearnItem, direction: 'thaiToMeaning' | 'meaningToThai', ctx: Ctx, extra: readonly string[] = []): Question {
  const pool = sizeSimilar(it, distractorPool(it, ctx, extra));
  if (direction === 'thaiToMeaning') {
    return { id: qid(), itemId: it.id, kind: 'meaning', prompt: L('Que veut dire…'), stage: { thai: it.thai, rom: it.rom, big: true, showRom: true }, say: it.say,
      choices: mk({ text: meaningOf(it), ok: true }, withDistractors(pool, it, 3, meaningOf).map((x) => ({ text: meaningOf(x), ok: false }))) };
  }
  return { id: qid(), itemId: it.id, kind: 'toThai', prompt: L('Comment dit-on…'), stage: { text: meaningOf(it) },
    choices: mk({ thai: it.thai, rom: it.rom, ok: true }, withDistractors(pool, it, 3, (x) => x.thai).map((x) => ({ thai: x.thai, rom: x.rom, ok: false }))), sayAfter: it.say, reveal: { thai: it.thai, rom: it.rom } };
}

export function qDictation(it: LearnItem, ctx: Ctx, extra: readonly string[] = []): Question {
  const pool = sizeSimilar(it, distractorPool(it, ctx, extra).filter((x) => x.kind !== 'cons' && x.kind !== 'vow' && isReadable(x.thai, ctx.known)));
  return { id: qid(), itemId: it.id, kind: 'dictation', prompt: L('Quel mot entendez-vous ?'), stage: { ear: true }, say: it.say,
    choices: mk({ thai: it.thai, ok: true }, withDistractors(pool, it, 3, (x) => x.thai).map((x) => ({ thai: x.thai, ok: false }))), reveal: { rom: it.rom, text: meaningOf(it) } };
}

/** Épeler : assembler le mot à partir de ses signes (dans l'ordre d'écriture) + quelques intrus. */
export function qSpell(it: LearnItem, ctx: Ctx): Question | null {
  const target = it.thai.replace(/\{[^}]*\}/g, '').replace(/\s/g, '');
  if (!target || target.length > 9 || target.length < 2) return null;
  const chars = [...target];
  const knownUnits = [...ctx.known].filter((k) => k.startsWith('c:')).map((k) => k.slice(2));
  const present = new Set(chars);
  const intruders = shuffle(knownUnits.filter((c) => !present.has(c))).slice(0, Math.min(3, Math.max(1, 8 - chars.length)));
  return { id: qid(), itemId: it.id, kind: 'spell', prompt: L('Écrivez le mot avec les signes proposés'), stage: { text: meaningOf(it), rom: it.rom }, say: it.say,
    choices: [], spell: { target, tiles: shuffle([...chars, ...intruders]) }, reveal: { thai: it.thai, rom: it.rom } };
}

export function qSyllable(s: { thai: string; rom: string }, all: { thai: string; rom: string }[]): Question {
  const wrong = withDistractors(all.filter((x) => x.rom !== s.rom), s, 3, (x) => x.rom);
  return { id: qid(), kind: 'syllable', prompt: L('Comment se lit cette syllabe ?'), stage: { thai: s.thai, big: true },
    choices: mk({ rom: s.rom, ok: true }, wrong.map((x) => ({ rom: x.rom, ok: false }))), sayAfter: s.thai };
}

const toneChoices = (right: string): Choice[] => TONES.map((t) => ({ tone: t.id, text: toneNameFr(t.id), ok: t.id === right }));

export function qTone(it: LearnItem & { kind: 'tone' }, mode: 'rule' | 'ear' | 'livedead'): Question {
  const explain = explainTone(it.ref).map((s) => s.text);
  if (mode === 'ear') return { id: qid(), itemId: it.id, ruleKey: it.ruleKey, kind: 'toneEar', prompt: L('Quel ton entendez-vous ?'), stage: { thai: it.thai, rom: plainRom(it.rom), text: it.meaning.fr, big: true }, say: it.say, choices: toneChoices(it.tone), reveal: { rom: it.rom, explain } };
  if (mode === 'livedead') {
    const p = parseSyl(it.rom.split(/[\s-]/)[0]);
    const live = p ? isLiveSyllable(p) : it.ref.live;
    const why = p && /^[ktp]$/.test(p.coda) ? `finit par le son bloqué « ${p.coda} »` : p && (p.coda || p.glide) ? `finit par le son « ${p.coda || (p.glide === 'j' ? 'i' : 'o')} », qui se prolonge` : it.ref.long ? 'finit par une voyelle longue' : 'finit par une voyelle courte, coupée net';
    return { id: qid(), itemId: it.id, kind: 'livedead', prompt: L('Cette syllabe est-elle vivante ou morte ?'), stage: { thai: it.thai, text: it.meaning.fr, big: true }, choices: [{ text: 'Vivante', ok: live }, { text: 'Morte', ok: !live }], sayAfter: it.say, reveal: { rom: it.rom, explain: [L(`${it.thai} (${it.rom}) : syllabe ${live ? 'vivante' : 'morte'}, elle ${why}.`)] } };
  }
  return { id: qid(), itemId: it.id, ruleKey: it.ruleKey, kind: 'tone', prompt: L('Quel est le ton de ce mot ?'), stage: { thai: it.thai, text: it.meaning.fr, big: true }, choices: toneChoices(it.tone), sayAfter: it.say, reveal: { rom: it.rom, explain } };
}

/** Paires de tons : même syllabe, tons différents — lequel entend-on ? */
export function qTonePair(set: { words: string[] }): Question | null {
  const ws = set.words.map((w) => TONE_ITEMS.find((t) => t.thai === w)).filter((x): x is LearnItem & { kind: 'tone' } => !!x);
  const byTone = new Map<string, LearnItem & { kind: 'tone' }>();
  shuffle(ws).forEach((w) => { if (!byTone.has(w.tone)) byTone.set(w.tone, w); });
  const opts = [...byTone.values()];
  if (opts.length < 2) return null;
  const w = opts[rnd(opts.length)];
  return { id: qid(), itemId: w.id, kind: 'listen', prompt: L('Lequel de ces mots entendez-vous ?'), stage: { ear: true }, say: w.say,
    choices: shuffle(opts.map((o) => ({ thai: o.thai, rom: o.rom, ok: o === w }))), reveal: { thai: w.thai, rom: w.rom, text: `${w.meaning.fr} · ton ${toneNameFr(w.tone)}` } };
}

/** Question adaptée au type d'un élément (révision espacée). */
export function qForItem(it: LearnItem, ctx: Ctx): Question | null {
  switch (it.kind) {
    case 'cons': return rnd(2) ? qListen(it, ctx) : qRead(it, 'sound', ctx);
    case 'vow': return qRead(it, 'rom', ctx);
    case 'tone': return qTone(it, rnd(2) ? 'rule' : 'ear');
    case 'num': return rnd(2) ? qListen(it, ctx) : qMeaning(it, 'meaningToThai', ctx);
    case 'clf': return qMeaning(it, 'thaiToMeaning', ctx);
    case 'word': {
      const readable = isReadable(it.thai, ctx.known);
      const m = rnd(readable ? 4 : 3);
      if (m === 0) return qListen(it, ctx);
      if (m === 1) return qMeaning(it, 'thaiToMeaning', ctx);
      if (m === 2) return qMeaning(it, 'meaningToThai', ctx);
      return qRead(it, 'meaning', ctx);
    }
    default: return null;
  }
}

// ------------------------------------------------------------------------------------------------
// Planification d'une leçon
// ------------------------------------------------------------------------------------------------

const take = <T>(arr: T[], n?: number) => (n ? arr.slice(0, n) : arr);

export function planActivity(a: ActivitySpec, ctx: Ctx, lesson?: LessonDef): RuntimeStep | null {
  switch (a.type) {
    case 'theory': return { type: 'theory', title: a.title, blocks: a.blocks };
    case 'flashcard': {
      const its = items(a.items);
      if (!its.length) return null;
      return { type: 'flashcards', items: its.map((i) => i.id), note: a.note, knownOrally: ctx.knownOrally && its.some((i) => i.kind === 'word') };
    }
    case 'listen': {
      const its = shuffle(items(a.items));
      const qs = take(its, a.count).map((it) => qListen(it, ctx, a.pool ?? a.items));
      return qs.length ? { type: 'questions', label: L('Écoute'), questions: qs, graded: true } : null;
    }
    case 'read': {
      const its = shuffle(readableWords(ctx, a.items));
      const qs = take(its, a.count).map((it) => qRead(it, a.answer, ctx, a.pool ?? a.items));
      return qs.length ? { type: 'questions', label: L('Lecture'), questions: qs, graded: true } : null;
    }
    case 'multipleChoice': {
      const its = shuffle(items(a.items));
      const qs = take(its, a.count).map((it) => qMeaning(it, a.direction, ctx, a.pool ?? a.items));
      return qs.length ? { type: 'questions', label: L(a.direction === 'thaiToMeaning' ? 'Comprendre' : 'Dire'), questions: qs, graded: true } : null;
    }
    case 'dictation': {
      const its = shuffle(readableWords(ctx, a.items));
      const qs = take(its, a.count).map((it) => qDictation(it, ctx, a.pool ?? a.items));
      return qs.length ? { type: 'questions', label: L('Dictée'), questions: qs, graded: true } : null;
    }
    case 'spell': {
      const its = shuffle(readableWords(ctx, a.items).filter((i) => i.kind === 'word' || i.kind === 'tone'));
      const qs = take(its, a.count).map((it) => qSpell(it, ctx)).filter((q): q is Question => !!q);
      return qs.length ? { type: 'questions', label: L('Écrire'), questions: qs, graded: true } : null;
    }
    case 'syllables': {
      const all = a.syllables;
      const qs = take(shuffle(all), a.count).map((s) => qSyllable(s, all));
      return qs.length ? { type: 'questions', label: L('Syllabes'), questions: qs, graded: true } : null;
    }
    case 'toneExercise': {
      if (a.mode === 'pair') {
        const qs = take(shuffle(th.TONE_SETS), a.count ?? 8).map(qTonePair).filter((q): q is Question => !!q);
        return qs.length ? { type: 'questions', label: L('Tons'), questions: qs, graded: true } : null;
      }
      const its = shuffle(items(a.items).filter((i): i is LearnItem & { kind: 'tone' } => i.kind === 'tone' && (a.mode === 'ear' || isReadable(i.thai, ctx.known))));
      const qs = take(its, a.count).map((it) => qTone(it, a.mode as 'rule' | 'ear' | 'livedead'));
      return qs.length ? { type: 'questions', label: L('Tons'), questions: qs, graded: true } : null;
    }
    case 'match': {
      const its = items(a.items).filter((i) => i.kind !== 'cons' && i.kind !== 'vow');
      if (its.length < 3) return null;
      return { type: 'match', by: a.by, pairs: shuffle(its).slice(0, 6).map((i) => ({ id: i.id, thai: i.thai, rom: i.rom, text: meaningOf(i) })) };
    }
    case 'build': return { type: 'build', items: a.sentences.filter((s) => READING_BY_ID[s.readingId]) };
    case 'dialog': return { type: 'dialog', id: a.id };
    case 'reading': return { type: 'reading', id: a.id };
    case 'repeat': return ctx.micAvailable ? { type: 'repeat', items: a.items } : null;
    case 'review': {
      const now = Date.now();
      const exclude = new Set(lesson?.newConcepts ?? []);
      const due = Object.keys(ctx.srs).filter((id) => ITEMS[id] && !exclude.has(id) && isDue(ctx.srs[id], now) && ITEMS[id].kind !== 'rule' && ITEMS[id].kind !== 'grammar')
        .sort((x, y) => ctx.srs[x].q - ctx.srs[y].q || ctx.srs[x].due - ctx.srs[y].due);
      const qs = due.slice(0, a.count).map((id) => qForItem(ITEMS[id], ctx)).filter((q): q is Question => !!q);
      return qs.length ? { type: 'questions', label: L('Révision'), questions: qs, graded: false } : null;
    }
    case 'recap': return { type: 'recap' };
  }
}

export function planLesson(lesson: LessonDef, baseCtx: Ctx): RuntimeStep[] {
  // Les notions introduites par la leçon sont « connues » le temps de la leçon : on peut les lire et s'en servir
  // comme distracteurs (sans cela, la première leçon n'aurait aucune lettre connue pour proposer des choix).
  const ctx: Ctx = { ...baseCtx, known: new Set([...baseCtx.known, ...lesson.newConcepts]) };
  const steps: RuntimeStep[] = [];
  for (const a of lesson.activities) {
    const s = planActivity(a, ctx, lesson);
    if (s) steps.push(s);
  }
  if (steps[steps.length - 1]?.type !== 'recap') steps.push({ type: 'recap' });
  return steps;
}

/** Points d'expérience d'une question réussie selon son type. */
export const xpFor = (q: Question, first: boolean) => (first ? (q.kind === 'spell' ? 4 : q.kind === 'tone' || q.kind === 'toneEar' ? 3 : 2) : 1);

/** Estimation de la durée (min) d'un plan. */
export const planMinutes = (steps: RuntimeStep[]) => Math.max(3, Math.round(steps.reduce((a, s) => a + (s.type === 'questions' ? s.questions.length * 0.35 : s.type === 'flashcards' ? s.items.length * 0.3 : s.type === 'theory' ? 1.5 : s.type === 'reading' || s.type === 'dialog' ? 2.5 : s.type === 'match' ? 1.2 : 1), 0)));

/** Données auxiliaires exportées pour l'UI. */
export { TAUGHT_VOWELS, TONE_BY_ID, sentenceThai, sentenceRom, scriptUnits, sample };
