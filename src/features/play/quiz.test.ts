import { describe, expect, it } from 'vitest';
import { buildPlayQuestions, decodeChallenge, encodeChallenge, poolFor, toQuestion, CHALLENGE_IDS } from './quiz';
import { ITEMS } from '@/content/th';

describe('jeux à plusieurs', () => {
  it('construit des questions à quatre choix distincts, la bonne réponse incluse', () => {
    const pool = poolFor({ kind: 'theme', theme: 'sal' }, {});
    const qs = buildPlayQuestions(pool, 10);
    expect(qs.length).toBe(10);
    for (const q of qs) {
      expect(q.choiceIds.length).toBe(4);
      expect(new Set(q.choiceIds).size).toBe(4);
      expect(q.choiceIds).toContain(q.itemId);
      const labels = q.choiceIds.map((id) => (q.kind === 'meaning' ? ITEMS[id].meaning.fr : ITEMS[id].thai));
      expect(new Set(labels).size).toBe(4);
      const question = toQuestion(q, 0);
      expect(question.choices.filter((c) => c.ok).length).toBe(1);
    }
  });
  it('les nombres sont jouables même sans rien avoir appris', () => {
    expect(buildPlayQuestions(poolFor({ kind: 'numbers' }, {}), 10).length).toBe(10);
    expect(buildPlayQuestions(poolFor({ kind: 'known' }, {}), 10).length).toBe(0);
  });
  it('un défi se code dans un lien et se relit à l’identique, avec les résultats', () => {
    const qs = buildPlayQuestions(poolFor({ kind: 'theme', theme: 'food' }, {}), 12);
    const from = { name: 'Lucien Élie', score: 9, total: 12, secs: 41.6 };
    const code = encodeChallenge(qs, from, null);
    expect(code.length).toBeLessThan(400);
    expect(code).not.toMatch(/[\s#?&]/);
    const d = decodeChallenge(code);
    if ('error' in d) throw new Error(d.error);
    expect(d.questions).toEqual(qs);
    expect(d.from).toEqual({ ...from, secs: 42 });
    expect(d.to).toBeNull();
    const back = encodeChallenge(d.questions, d.from, { name: 'Marie', score: 10, total: 12, secs: 38 });
    const d2 = decodeChallenge(back);
    if ('error' in d2) throw new Error(d2.error);
    expect(d2.id).toBe(d.id);
    expect(d2.to?.name).toBe('Marie');
  });
  it('refuse les codes d’une autre version ou abîmés', () => {
    expect('error' in decodeChallenge('2zz~m0:1,2,3,4')).toBe(true);
    expect('error' in decodeChallenge('n’importe quoi')).toBe(true);
    expect('error' in decodeChallenge(`1${CHALLENGE_IDS.length.toString(36)}~m9:1,2,3,4`)).toBe(true);
  });
});
