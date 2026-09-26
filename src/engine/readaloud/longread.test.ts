import { describe, expect, it } from 'vitest';
import { coverage, judgeSentence, paceOf, summarizeText } from './longread';

const W = (thai: string, rom = '') => ({ thai, rom });
const sentence = [W('แม่', 'mɛ̂ɛ'), W('ไป', 'pai'), W('ตลาด', 'tà-làat'), W('ทุก', 'thúk'), W('วัน', 'wan')];

describe('lecture longue : mots lus, déformés, manqués', () => {
  it('tout lu', () => {
    const r = judgeSentence(sentence, 'แม่ไปตลาดทุกวัน');
    expect(r.every((x) => x.verdict === 'ok')).toBe(true);
    expect(coverage(r)).toBe(1);
  });
  it('un mot sauté, un mot déformé', () => {
    const r = judgeSentence(sentence, 'แม่ ตะหลาด ทุกวัน');
    expect(r[1].verdict).toBe('missed');
    expect(r[2].verdict).toBe('near');
    expect(r[0].verdict).toBe('ok');
  });
  it('rien entendu : non jugé, pas faux', () => {
    expect(judgeSentence(sentence, '').every((x) => x.verdict === 'none')).toBe(true);
  });
  it('débit et pauses', () => {
    const p = paceOf(sentence, [{ start: 0, end: 1 }, { start: 1.8, end: 2.6 }, { start: 4.2, end: 4.8 }]);
    expect(p.syllables).toBe(6);
    expect(p.pauses).toBe(2);
    expect(p.longPauses).toBe(1);
    expect(p.perMin).toBe(150);
  });
  it('bilan du texte', () => {
    const s = summarizeText([{ words: sentence, results: judgeSentence(sentence, 'แม่ ตะหลาด ทุกวัน'), segs: [{ start: 0, end: 2 }] }]);
    expect(s).toMatchObject({ ok: 3, near: 1, missed: 1 });
    expect(s.problems.map((p) => p.word.thai)).toEqual(['ไป', 'ตลาด']);
  });
});
