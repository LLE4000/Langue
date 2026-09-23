import { describe, expect, it } from 'vitest';
import { planLesson, type Ctx } from './engine';
import { buildCurriculum } from '@/curriculum/th-fr';
import { knownConcepts } from '@/curriculum/path';
import { readingRequirements } from '@/engine/thai/reading';
import { ITEMS } from '@/content/th';

const cur = buildCurriculum();
const ctxFor = (done: string[], extra: Partial<Ctx> = {}): Ctx => ({
  known: knownConcepts(cur, new Set(done)), srs: {}, levels: { listening: 0, speaking: 0, reading: 0, writing: 0 }, knownOrally: false, seen: {}, micAvailable: false, ...extra,
});

describe('moteur de leçon', () => {
  it('planifie la première leçon d’écriture avec des questions valides', () => {
    const lesson = cur.lessons.find((l) => l.id === 'read-01')!;
    const steps = planLesson(lesson, ctxFor(['read-01']));
    expect(steps[0].type).toBe('theory');
    expect(steps[steps.length - 1].type).toBe('recap');
    const qs = steps.flatMap((s) => (s.type === 'questions' ? s.questions : []));
    expect(qs.length).toBeGreaterThan(8);
    for (const q of qs) {
      if (q.kind === 'spell') { expect(q.spell?.tiles.length).toBeGreaterThan(1); continue; }
      expect(q.choices.filter((c) => c.ok).length, q.kind).toBe(1);
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      const labels = q.choices.map((c) => c.thai ?? c.rom ?? c.text ?? c.tone);
      expect(new Set(labels).size, `doublons ${labels.join('|')}`).toBe(labels.length);
    }
  });
  it('les questions de lecture n’utilisent que des mots lisibles', () => {
    for (const id of ['read-05', 'read-12', 'read-18']) {
      const lesson = cur.lessons.find((l) => l.id === id)!;
      const idx = cur.lessons.filter((l) => l.track === 'script').findIndex((l) => l.id === id);
      const done = cur.lessons.filter((l) => l.track === 'script').slice(0, idx + 1).map((l) => l.id);
      const ctx = ctxFor(done);
      const steps = planLesson(lesson, ctx);
      for (const s of steps) if (s.type === 'questions') for (const q of s.questions) {
        if (q.kind === 'read' || q.kind === 'meaning' || q.kind === 'dictation' || q.kind === 'spell') {
          const it = q.itemId ? ITEMS[q.itemId] : null;
          if (it && it.kind === 'word') expect([...readingRequirements(it.thai)].filter((r) => !ctx.known.has(r)), `${id} ${it.thai}`).toEqual([]);
          for (const c of q.choices) if (c.thai && q.kind === 'dictation') expect([...readingRequirements(c.thai)].filter((r) => !ctx.known.has(r)), `${id} distracteur ${c.thai}`).toEqual([]);
        }
      }
    }
  });
  it('planifie une leçon de conversation sans micro', () => {
    const lesson = cur.lessons.find((l) => l.id === 'talk-sal-1')!;
    const steps = planLesson(lesson, ctxFor([]));
    expect(steps.some((s) => s.type === 'repeat')).toBe(false);
    expect(steps.some((s) => s.type === 'match')).toBe(true);
    expect(steps.some((s) => s.type === 'flashcards')).toBe(true);
  });
  it('toutes les leçons se planifient sans erreur', () => {
    const all = cur.lessons.map((l) => l.id);
    const ctx = ctxFor(all);
    for (const l of cur.lessons) {
      const steps = planLesson(l, ctx);
      expect(steps.length, l.id).toBeGreaterThan(1);
    }
  });
});

describe('distracteurs de la première leçon', () => {
  it('ne propose que des lettres de la leçon (aucune lettre non enseignée)', () => {
    const lesson = cur.lessons.find((l) => l.id === 'read-01')!;
    const steps = planLesson(lesson, ctxFor([]));
    const taught = new Set(lesson.newConcepts.filter((c) => c.startsWith('c:')).map((c) => c.slice(2)));
    for (const s of steps) if (s.type === 'questions') for (const q of s.questions) if (q.kind === 'listen' && q.itemId?.startsWith('c:')) {
      for (const c of q.choices) expect(taught.has(c.thai!), `${c.thai} non enseignée`).toBe(true);
    }
    // les mots de la leçon sont bien proposés à la lecture
    expect(steps.some((s) => s.type === 'questions' && s.questions.some((q) => q.kind === 'meaning'))).toBe(true);
  });
});
