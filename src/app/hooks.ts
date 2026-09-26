/**
 * Hooks dérivés de l'état : parcours, notions connues, maîtrise, éléments à réviser.
 */
import { useEffect, useMemo } from 'react';
import { useStore } from './store';
import { curriculum } from '@/content/packs';
import { computePath, grantedLessons, knownConcepts, nextLesson, type PathLesson, type SkillLevels } from '@/curriculum/path';
import { ALL_GOALS, type Goals } from '@/curriculum/types';
import { ITEMS, CONS_ITEMS, TAUGHT_VOWELS, MAIN_WORDS, TONE_ITEMS, NUM_ITEMS, CLF_ITEMS, GRAMMAR_ITEMS, th, type LearnItem } from '@/content/th';
import { isDue, mastery, type SrsState } from '@/engine/srs';
import { scriptUnits } from '@/engine/thai/script';
import { computeProgress, type Progress, type ProgressContent } from '@/engine/progress';
import { todayKey } from '@/engine/util';

export const DEFAULT_LEVELS: SkillLevels = { listening: 0, speaking: 0, reading: 0, writing: 0 };

export function useLevels(): SkillLevels {
  return useStore((s) => s.profile?.levels) ?? DEFAULT_LEVELS;
}

export function useCompleted(): Set<string> {
  const lessons = useStore((s) => s.lessons);
  return useMemo(() => new Set(Object.keys(lessons).filter((id) => lessons[id].done)), [lessons]);
}

export function useGoals(): Goals {
  return useStore((s) => s.profile?.goals) ?? ALL_GOALS;
}

export function usePath(): PathLesson[] {
  const levels = useLevels();
  const completed = useCompleted();
  const goals = useGoals();
  return useMemo(() => computePath({ curriculum: curriculum(), levels, completed, goals }), [levels, completed, goals]);
}

export function useNextLesson(): PathLesson | null {
  const path = usePath();
  return useMemo(() => nextLesson(path), [path]);
}

export interface Known {
  /** notions introduites par les leçons faites ou acquises (lisibilité pédagogique) */
  concepts: Set<string>;
  /** notions dont la lecture est acquise : introduites ET maîtrisées (pour masquer la translittération) */
  readable: Set<string>;
  doneLessons: Set<string>;
}

export function useKnown(): Known {
  const levels = useLevels();
  const completed = useCompleted();
  const srs = useStore((s) => s.srs);
  return useMemo(() => {
    const cur = curriculum();
    const granted = grantedLessons(cur, levels);
    const done = new Set([...completed, ...granted]);
    const concepts = knownConcepts(cur, done);
    const readable = new Set<string>();
    for (const c of concepts) {
      if (c.startsWith('c:') || c.startsWith('v:')) { if (mastery(srs[c]) >= 0.5 || levels.reading >= 3) readable.add(c); }
      else readable.add(c); // règles, marques : acquises avec la leçon
    }
    return { concepts, readable, doneLessons: done };
  }, [levels, completed, srs]);
}

export const useMastery = (id: string) => useStore((s) => mastery(s.srs[id]));

export function useDueItems(): LearnItem[] {
  const srs = useStore((s) => s.srs);
  return useMemo(() => {
    const now = Date.now();
    return Object.keys(srs).filter((id) => ITEMS[id] && ITEMS[id].kind !== 'rule' && ITEMS[id].kind !== 'grammar' && isDue(srs[id], now))
      .sort((a, b) => srs[a].q - srs[b].q || srs[a].due - srs[b].due).map((id) => ITEMS[id]);
  }, [srs]);
}

/** Éléments déjà rencontrés (présents dans la répétition espacée), par type. */
export function useLearnedItems(): LearnItem[] {
  const srs = useStore((s) => s.srs);
  return useMemo(() => Object.keys(srs).filter((id) => ITEMS[id] && ITEMS[id].kind !== 'rule' && ITEMS[id].kind !== 'grammar').map((id) => ITEMS[id]), [srs]);
}

export interface Metrics {
  letters: { known: number; total: number; progress: number };
  vowels: { known: number; total: number; progress: number };
  words: { known: number; total: number; progress: number };
  tones: { progress: number };
  numbers: { progress: number };
  classifiers: { progress: number };
  skills: Record<'listening' | 'speaking' | 'reading' | 'writing', number>;
  lessonsDone: number;
  lessonsTotal: number;
}

const prog = (ids: string[], srs: Record<string, SrsState>) => (ids.length ? ids.reduce((a, id) => a + mastery(srs[id]), 0) / ids.length : 0);
const cnt = (ids: string[], srs: Record<string, SrsState>, th = 0.5) => ids.filter((id) => mastery(srs[id]) >= th).length;

export function useMetrics(): Metrics {
  const srs = useStore((s) => s.srs);
  const completed = useCompleted();
  const levels = useLevels();
  return useMemo(() => {
    const cons = CONS_ITEMS.filter((c) => !c.ref.obsolete).map((c) => c.id);
    const vows = TAUGHT_VOWELS.map((v) => v.id);
    const words = MAIN_WORDS.map((w) => w.id);
    const cur = curriculum();
    const granted = grantedLessons(cur, levels);
    const done = new Set([...completed, ...granted]);
    const byTrack = (t: string) => cur.lessons.filter((l) => l.track === t);
    const ratio = (t: string) => { const ls = byTrack(t); return ls.length ? ls.filter((l) => done.has(l.id)).length / ls.length : 0; };
    const reading = 0.5 * prog([...cons, ...vows], srs) + 0.5 * ratio('script');
    const talk = 0.6 * ratio('talk') + 0.4 * Math.min(1, cnt(words, srs) / 300);
    return {
      letters: { known: cnt(cons, srs), total: cons.length, progress: prog(cons, srs) },
      vowels: { known: cnt(vows, srs), total: vows.length, progress: prog(vows, srs) },
      words: { known: cnt(words, srs), total: words.length, progress: prog(words, srs) },
      tones: { progress: prog(TONE_ITEMS.map((t) => t.id), srs) },
      numbers: { progress: prog(NUM_ITEMS.map((n) => n.id), srs) },
      classifiers: { progress: prog(CLF_ITEMS.map((c) => c.id), srs) },
      skills: { listening: talk, speaking: talk * 0.9, reading, writing: reading * 0.8 },
      lessonsDone: cur.lessons.filter((l) => completed.has(l.id)).length,
      lessonsTotal: cur.lessons.length,
    };
  }, [srs, completed, levels]);
}

let contentCache: ProgressContent | null = null;
/** Le contenu vu par la progression (calculé une fois : les listes ne changent pas à l'exécution). */
export function progressContent(): ProgressContent {
  if (contentCache) return contentCache;
  const cur = curriculum();
  const lessons = cur.lessons;
  contentCache = {
    cons: CONS_ITEMS.filter((c) => !c.ref.obsolete).map((c) => c.id),
    vowels: TAUGHT_VOWELS.map((v) => v.id),
    words: MAIN_WORDS.map((w) => w.id),
    grammar: GRAMMAR_ITEMS.map((g) => g.id),
    toneItems: TONE_ITEMS.map((t) => t.id),
    scriptLessons: lessons.filter((l) => l.track === 'script' || l.track === 'tones').map((l) => l.id),
    talkLessons: lessons.filter((l) => l.track === 'talk' || l.track === 'numbers').map((l) => l.id),
    allLessons: lessons.map((l) => l.id),
    lessonMinutes: lessons.length ? lessons.reduce((a, l) => a + l.minutes, 0) / lessons.length : 10,
    dialogs: th.DIALOGS.map((d) => d.id),
    readings: th.READINGS.map((r) => r.id),
  };
  return contentCache;
}

/** Progression par compétences, palier et chemin restant (voir engine/progress.ts). */
export function useProgress(): Progress {
  const srs = useStore((s) => s.srs);
  const acquired = useStore((s) => s.acquired);
  const ruleStats = useStore((s) => s.ruleStats);
  const pron = useStore((s) => s.pron);
  const activities = useStore((s) => s.activities);
  const completed = useCompleted();
  const levels = useLevels();
  const goals = useGoals();
  return useMemo(() => {
    const cur = curriculum();
    const doneLessons = new Set([...completed, ...grantedLessons(cur, levels)]);
    return computeProgress({ content: progressContent(), srs, acquired, doneLessons, completedLessons: completed, ruleStats, pron, activities, levels, goals });
  }, [srs, acquired, ruleStats, pron, activities, completed, levels, goals]);
}

/** Garde une trace quotidienne de la progression (pour la courbe d'évolution). À monter une fois, dans la coque. */
export function useProgressLog() {
  const p = useProgress();
  const log = useStore((s) => s.logProgress);
  const hasProfile = useStore((s) => !!s.profile);
  useEffect(() => { if (hasProfile) log(todayKey(), [p.overall, ...p.skills.map((s) => s.value)]); }, [p, log, hasProfile]);
}

/** Les signes d'un mot sont-ils tous connus (concepts) ? */
export const unitsKnown = (thai: string, known: ReadonlySet<string>) => scriptUnits(thai).every((u) => (u.kind === 'cons' ? known.has('c:' + u.ch) : true));
