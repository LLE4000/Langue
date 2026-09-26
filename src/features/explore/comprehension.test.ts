import { describe, expect, it } from 'vitest';
import { th, DIALOG_BY_ID } from '@/content/th';
import { DIALOG_QUESTIONS } from '@/content/th/dialogQuestions';
import { buildComprehensionQuiz, replyQuestions, whoQuestions } from './comprehension';

describe('compréhension orale', () => {
  it('chaque dialogue a des questions rédigées cohérentes', () => {
    for (const d of th.DIALOGS) {
      const qs = DIALOG_QUESTIONS[d.id];
      expect(qs, d.id).toBeDefined();
      expect(qs.length, d.id).toBeGreaterThanOrEqual(2);
      for (const q of qs) {
        expect(q.choices.length).toBeGreaterThanOrEqual(2);
        expect(q.answer).toBeGreaterThanOrEqual(0);
        expect(q.answer).toBeLessThan(q.choices.length);
        expect(new Set(q.choices.map((c) => c.fr)).size, q.q.fr).toBe(q.choices.length);
      }
      expect(d.questions, d.id).toBe(qs); // rattachées au dialogue
    }
  });
  it('les questions générées ont une bonne réponse et des leurres distincts', () => {
    const d = DIALOG_BY_ID['d:market'];
    const rq = replyQuestions(d, 'Vendeuse');
    expect(rq.length).toBeGreaterThan(0);
    for (const q of rq) { expect(q.answer).toBe(0); expect(new Set(q.choices).size).toBe(q.choices.length); }
    const wq = whoQuestions(d, 'Vendeuse');
    expect(wq.every((q) => q.choices.length === 2)).toBe(true);
  });
  it('le questionnaire mélange les propositions et garde la bonne réponse ; reproductible avec la graine', () => {
    const d = DIALOG_BY_ID['d:cafe'];
    const a = buildComprehensionQuiz(d, 42), b = buildComprehensionQuiz(d, 42);
    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThanOrEqual(5);
    const first = a.find((q) => q.kind === 'authored' && q.q.startsWith('Que commande'))!;
    expect(first.choices[first.answer]).toBe('Un café glacé');
  });
});
