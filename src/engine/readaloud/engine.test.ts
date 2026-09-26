import { describe, expect, it } from 'vitest';
import { syllable } from './compose';
import { alignHeard } from './align';
import { combine, judgeAzure, judgeHeard, judgePitch } from './judge';
import { initialQueue, scheduleRetry, summarize } from './queue';
import { raProgram } from './program';

const S = (c: string, v = '–า', f = '', m = 0) => syllable(c, v, f, m)!;

describe('jugement', () => {
  it('juste, voisin de ton, de longueur, de consonne', () => {
    expect(judgeHeard(S('ม'), ['มา']).verdict).toBe('ok');
    expect(judgeHeard(S('ม'), ['ม้า'])).toMatchObject({ verdict: 'near', kind: 'tone' });
    expect(judgeHeard(S('ม'), ['มะ'])).toMatchObject({ verdict: 'near', kind: 'length' });
    expect(judgeHeard(S('ม'), ['นา'])).toMatchObject({ verdict: 'ko', kind: 'consonant' });
    expect(judgeHeard(S('ค'), ['ขา'])).toMatchObject({ verdict: 'near', kind: 'tone' });
    expect(judgeHeard(S('ด'), ['ดาว'])).toMatchObject({ verdict: 'near' });
    expect(judgeHeard(S('ด'), ['hello']).verdict).toBe('none');
    expect(judgeHeard(S('ด'), []).verdict).toBe('none');
  });
  it('la courbe ne décide que faute de mieux, et signale un ton douteux', () => {
    const pitchKo = judgePitch(S('ข'), { predicted: 'M', expected: 'R', ok: false, similarity: 0.2 });
    expect(combine(null, pitchKo, null)).toMatchObject({ verdict: 'ko', source: 'pitch' });
    expect(combine(judgeHeard(S('ข'), ['ขา']), pitchKo, null)).toMatchObject({ verdict: 'near', kind: 'tone' });
    expect(combine(judgeHeard(S('ข'), ['คา']), null, judgeAzure(92, 'None')).verdict).toBe('ok');
    expect(judgeAzure(0, 'Omission').verdict).toBe('ko');
  });
});

describe('alignement de la reconnaissance continue', () => {
  it('répartit un morceau entendu entre plusieurs lectures', () => {
    expect(alignHeard(['ดา', 'มา', 'นา'], 'ดามานา')).toEqual(['ดา', 'มา', 'นา']);
    expect(alignHeard(['ดา', 'มา', 'นา'], 'ดา ม้า นา')).toEqual(['ดา', 'ม้า', 'นา']);
    expect(alignHeard(['ดา', 'มา', 'นา'], 'ดานา')).toEqual(['ดา', '', 'นา']);
    expect(alignHeard(['กา', 'ตา'], '')).toEqual(['', '']);
  });
});

describe('file de la série', () => {
  it('une erreur revient 8 puis 14 éléments plus loin, deux fois au plus', () => {
    const items = Array.from({ length: 30 }, (_, i) => S([...'กจดตบปอนมรลวยงคทพชซฟฮขฉถผฝสห'][i % 28]));
    let q = initialQueue(items);
    q = scheduleRetry(q, 2);
    expect(q[11].item.key).toBe(items[2].key);
    expect(q[11].retry).toBe(1);
    q = scheduleRetry(q, 2); // déjà reprogrammée : rien
    expect(q.length).toBe(31);
    q = scheduleRetry(q, 11);
    expect(q[26].retry).toBe(2);
    expect(scheduleRetry(q, 26).length).toBe(q.length);
  });
  it('bilan : verdicts, points faibles, maîtrise par étiquette', () => {
    const q = initialQueue([S('ม'), S('ข'), S('ม')]);
    q[0].result = { verdict: 'near', source: 'asr', detail: 'ton haut au lieu de moyen' };
    q[1].result = { verdict: 'ok', source: 'asr' };
    q[2].result = { verdict: 'ok', source: 'asr' };
    const s = summarize(q);
    expect(s).toMatchObject({ total: 3, ok: 2, near: 1 });
    expect(s.weak[0].item.thai).toBe('มา');
    expect(s.tags['c:ม']).toEqual({ ok: 1, n: 2 });
  });
});

describe('programme', () => {
  const p = raProgram();
  it('25 séances, des séries longues, les 28 consonnes courantes et les voyelles principales', () => {
    expect(p.length).toBe(25);
    expect(p.every((s) => s.items.length >= 24)).toBe(true);
    expect(p.slice(0, 21).every((s) => s.items.length >= 35)).toBe(true);
    const cons = new Set(p.flatMap((s) => s.items.flatMap((i) => i.tags.filter((t) => t.startsWith('c:')))));
    for (const c of 'กจดตบปอนมรลวยงคทพชซฟฮขฉถผฝสห') expect(cons.has('c:' + c), c).toBe(true);
    const vows = new Set(p.flatMap((s) => s.items.flatMap((i) => i.tags.filter((t) => t.startsWith('v:')))));
    for (const v of ['–า', '–ี', '–ู', '–ะ', '–ิ', '–ุ', 'เ–', 'แ–', 'โ–', '–อ', '–ือ', 'เ–อ', 'ไ–', 'เ–า', '–ำ', 'เ–ีย', 'เ–ือ', '–ัว']) expect(vows.has('v:' + v), v).toBe(true);
  });
  it('jamais deux fois la même lecture d’affilée', () => {
    for (const s of p) for (let i = 1; i < s.items.length; i++) expect(s.items[i].key === s.items[i - 1].key && s.pool > 1, `${s.id} ${i}`).toBe(false);
  });
});
