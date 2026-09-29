/**
 * Séances d'entraînement (onglet Réviser). Neuf modes, tous construits sur le moteur de leçon,
 * et qui n'utilisent que ce que l'apprenant a déjà rencontré (ou peut lire).
 * Lancées depuis une fiche de la bibliothèque, elles se limitent à son contenu : un thème (?theme=), les nombres
 * (?set=num), les classificateurs (?set=clf) ou mes favoris (?set=favs).
 */
import type { LessonSession } from '@/app/store';
import type { Ctx, Question, RuntimeStep } from '@/features/lesson/engine';
import { qDictation, qForItem, qListen, qMeaning, qRead, qTone, qTonePair, qSyllable } from '@/features/lesson/engine';
import { ITEMS, CONS_ITEMS, TAUGHT_VOWELS, TONE_ITEMS, WORD_ITEMS, NUM_ITEMS, CLF_ITEMS, CONS_BY_CHAR, th, type LearnItem } from '@/content/th';
import { useStore } from '@/app/store';
import { isReadable } from '@/engine/thai/reading';
import { isDue } from '@/engine/srs';
import { shuffle, sample } from '@/engine/util';
import { toneRule } from '@/engine/thai/toneRule';
import { markTone } from '@/engine/thai/transcription';

export type TrainingMode = 'flashcards' | 'listening' | 'speed' | 'match' | 'dictation' | 'tones' | 'quiz' | 'timed' | 'pronunciation' | 'review' | 'weak';

/** Éléments rencontrés (dans la répétition espacée), hors règles. */
const learned = (ctx: Ctx): LearnItem[] => Object.keys(ctx.srs).map((id) => ITEMS[id]).filter((x): x is LearnItem => !!x && x.kind !== 'rule' && x.kind !== 'grammar');
const readableWords = (ctx: Ctx) => WORD_ITEMS.filter((w) => !/[\s…{]/.test(w.thai) && (ctx.srs[w.id] || w.ref.themes.length) && isReadable(w.thai, ctx.known));
const knownLetters = (ctx: Ctx) => CONS_ITEMS.filter((c) => ctx.known.has(c.id) || ctx.srs[c.id]);
const knownVowels = (ctx: Ctx) => TAUGHT_VOWELS.map((v) => ITEMS[v.id]).filter((v) => ctx.known.has(v.id) || ctx.srs[v.id]);
const readableTones = (ctx: Ctx) => TONE_ITEMS.filter((t) => isReadable(t.thai, ctx.known));

const Q = (label: string, questions: Question[], graded = true): RuntimeStep => ({ type: 'questions', label: { fr: label }, questions, graded });

function syllables(ctx: Ctx): { thai: string; rom: string }[] {
  const cons = knownLetters(ctx).filter((c) => !c.ref.obsolete).map((c) => c.thai);
  const vows = knownVowels(ctx).map((v) => v.kind === 'vow' ? v.ref : null).filter((v) => v && v.form.split('–').length === 2 && v.form.includes('–') && !/ๅ/.test(v.form)) as { form: string; rom: string; length: 'S' | 'L' }[];
  const out: { thai: string; rom: string }[] = [];
  for (const v of shuffle(vows).slice(0, 8)) for (const c of shuffle(cons).slice(0, 4)) {
    const cc = CONS_BY_CHAR[c];
    const live = v.length === 'L' || /^(ไ–|ใ–|เ–า|–ำ)$/.test(v.form);
    const tone = toneRule(cc.cls, live, v.length === 'L', 0) ?? 'M';
    out.push({ thai: v.form.replace('–', c), rom: markTone((cc.initial === '(muet)' ? '' : cc.initial) + v.rom, tone) });
  }
  return out;
}

/** Contenu ciblé d'une fiche de la bibliothèque (?set=) : nombres, classificateurs, favoris. */
export type TrainingSet = 'num' | 'clf' | 'favs';
const SET_TITLE: Record<TrainingSet, string> = { num: 'Nombres', clf: 'Classificateurs', favs: 'Mes favoris' };
export const isTrainingSet = (s: string | null | undefined): s is TrainingSet => s === 'num' || s === 'clf' || s === 'favs';

/** Les favoris qui se révisent en cartes (les fiches de grammaire se relisent, elles ne se tirent pas en cartes). */
export function favoriteItems(favorites: Record<string, number>): LearnItem[] {
  return Object.keys(favorites).sort((a, b) => favorites[b] - favorites[a]).map((id) => ITEMS[id]).filter((x): x is LearnItem => !!x && x.kind !== 'rule' && x.kind !== 'grammar');
}

function setItems(set: TrainingSet | undefined, favorites?: Record<string, number>): LearnItem[] | null {
  if (set === 'num') return NUM_ITEMS;
  if (set === 'clf') return CLF_ITEMS;
  if (set === 'favs') return favoriteItems(favorites ?? useStore.getState().favorites);
  return null;
}

export function buildTraining(mode: TrainingMode, ctx: Ctx, opts: { theme?: string; set?: string; favorites?: Record<string, number> } = {}): LessonSession | null {
  const now = Date.now();
  const pool = learned(ctx);
  const title: Record<TrainingMode, string> = { flashcards: 'Cartes', listening: 'Écoute', speed: 'Lecture rapide', match: 'Associer', dictation: 'Dictée', tones: 'Tons', quiz: 'Quiz', timed: 'Contre la montre', pronunciation: 'Prononciation', review: 'Révision', weak: 'Points faibles' };
  let steps: RuntimeStep[] = [];
  const set = isTrainingSet(opts.set) ? opts.set : undefined;
  // vivier ciblé : un thème de vocabulaire, ou un ensemble de la bibliothèque (nombres, classificateurs, favoris)
  const themeWords: LearnItem[] | null = opts.theme ? WORD_ITEMS.filter((w) => w.ref.themes.includes(opts.theme!)) : setItems(set, opts.favorites);
  switch (mode) {
    case 'review': {
      const due = pool.filter((it) => isDue(ctx.srs[it.id], now)).sort((a, b) => ctx.srs[a.id].q - ctx.srs[b.id].q || ctx.srs[a.id].due - ctx.srs[b.id].due).slice(0, 20);
      const qs = due.map((it) => qForItem(it, ctx)).filter((q): q is Question => !!q);
      if (!qs.length) return null;
      steps = [Q('Révision', qs)];
      break;
    }
    case 'weak': {
      const weak = pool.filter((it) => ctx.srs[it.id].q <= 1 || ctx.srs[it.id].lapses >= 2).slice(0, 15);
      if (weak.length < 3) return null;
      steps = [{ type: 'flashcards', items: weak.map((w) => w.id) }, Q('Points faibles', weak.map((it) => qForItem(it, ctx)).filter((q): q is Question => !!q))];
      break;
    }
    case 'flashcards': {
      const src = themeWords ?? pool;
      const picks = shuffle(src).sort((a, b) => (ctx.srs[a.id]?.due ?? 0) - (ctx.srs[b.id]?.due ?? 0)).slice(0, 15);
      if (picks.length < 3) return null;
      steps = [{ type: 'flashcards', items: picks.map((p) => p.id) }];
      break;
    }
    case 'listening': {
      const letters = set ? [] : sample(knownLetters(ctx).filter((c) => !c.ref.obsolete), 4);
      const words = sample(themeWords ?? pool.filter((p) => p.kind === 'word' || p.kind === 'num'), themeWords ? 10 : 6);
      const qs = [...letters.map((l) => qListen(l, ctx)), ...words.map((w) => qListen(w, ctx, themeWords?.map((x) => x.id)))];
      if (qs.length < 4) return null;
      steps = [Q('Écoute', shuffle(qs))];
      break;
    }
    case 'speed': {
      const words = sample(readableWords(ctx), 10);
      const syl = syllables(ctx);
      const qs = [...sample(syl, 4).map((s) => qSyllable(s, syl)), ...words.map((w) => qRead(w, 'rom', ctx))];
      if (qs.length < 4) return null;
      steps = [Q('Lecture rapide', shuffle(qs))];
      break;
    }
    case 'match': {
      const src = (themeWords ?? pool).filter((p) => p.kind !== 'cons' && p.kind !== 'vow');
      if (src.length < 4) return null;
      steps = [1, 2, 3].map(() => ({ type: 'match' as const, by: 'meaning' as const, pairs: sample(src, 6).map((i) => ({ id: i.id, thai: i.thai, rom: i.rom, text: i.meaning.fr })) }));
      break;
    }
    case 'dictation': {
      const words = sample(readableWords(ctx), 10);
      if (words.length < 4) return null;
      steps = [Q('Dictée', words.map((w) => qDictation(w, ctx)))];
      break;
    }
    case 'tones': {
      const rt = readableTones(ctx);
      const qs: Question[] = [];
      qs.push(...sample(rt, 5).map((t) => qTone(t, 'rule')));
      qs.push(...sample(TONE_ITEMS, 3).map((t) => qTone(t, 'ear')));
      qs.push(...sample(th.TONE_SETS, 3).map(qTonePair).filter((q): q is Question => !!q));
      if (rt.length >= 3) qs.push(...sample(rt, 3).map((t) => qTone(t, 'livedead')));
      if (qs.length < 4) return null;
      steps = [Q('Tons', shuffle(qs))];
      break;
    }
    case 'quiz': {
      const picks = sample(pool, 12);
      const qs = picks.map((it) => qForItem(it, ctx)).filter((q): q is Question => !!q);
      if (qs.length < 4) return null;
      steps = [Q('Quiz', qs)];
      break;
    }
    case 'pronunciation': {
      if (!ctx.micAvailable) return null;
      // mots et phrases courtes déjà rencontrés, les moins bien prononcés d'abord
      const src = (themeWords ?? pool.filter((p) => p.kind === 'word' || p.kind === 'num')).filter((p) => !/…/.test(p.thai) && p.thai.replace(/\{[^}]*\}/g, '').length <= 14);
      if (src.length < 3) return null;
      const items = shuffle(src).slice(0, 8);
      steps = [{ type: 'repeat', items: items.map((p) => p.id), graded: true }];
      break;
    }
    case 'timed': {
      const picks = sample(pool, 25);
      const qs = picks.map((it) => (it.kind === 'word' ? qMeaning(it, 'thaiToMeaning', ctx) : qForItem(it, ctx))).filter((q): q is Question => !!q);
      if (qs.length < 6) return null;
      steps = [Q('Contre la montre', qs)];
      break;
    }
  }
  steps.push({ type: 'recap' });
  return { lessonId: 'training', title: set ? `${SET_TITLE[set]} · ${title[mode]}` : title[mode], steps, index: 0, ok: 0, total: 0, xp: 0, wrong: [], startedAt: now, training: true, mode };
}
