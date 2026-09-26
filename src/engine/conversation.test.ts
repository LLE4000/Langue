import { describe, expect, it } from 'vitest';
import { judgeReply, replyStarter } from './conversation';

const ok = [{ thai: 'เอาสองกิโลครับ', rom: 'ao sɔ̌ɔng kì-loo khráp' }, { thai: 'ขอสองกิโลครับ', rom: 'khɔ̌ɔ sɔ̌ɔng kì-loo khráp' }];

describe('conversation parlée : juger une réponse', () => {
  it('une variante acceptée compte comme juste, la particule est facultative', () => {
    expect(judgeReply(['ขอสองกิโล'], ok)).toMatchObject({ verdict: 'ok', score: 10, match: ok[1] });
    expect(judgeReply(['เอาสองกิโลครับ'], ok)).toMatchObject({ verdict: 'ok', match: ok[0] });
  });
  it('un ton faux est approximatif, une autre phrase est à reprendre', () => {
    expect(judgeReply(['เอาสองกิโลคับ'.replace('สอง', 'ส่อง')], ok).verdict).toBe('near');
    expect(judgeReply(['ไปตลาด'], ok).verdict).toBe('ko');
    expect(judgeReply([], ok).verdict).toBe('none');
  });
  it('amorce : les premiers mots', () => {
    expect(replyStarter(ok[0]).rom).toBe('ao…');
  });
});
