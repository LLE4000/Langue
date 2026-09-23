import { describe, expect, it } from 'vitest';
import { scorePronunciation } from './pronunciation';

const words = [{ t: 'สวัสดี', r: 'sà-wàt-dii' }, { t: 'ครับ', r: 'khráp' }];

describe('contrôle de prononciation', () => {
  it('reconnu exactement : 10/10', () => {
    const r = scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words);
    expect(r.score).toBe(10);
    expect(r.verdict).toBe('ok');
    expect(r.words.every((w) => w.ok)).toBe(true);
  });
  it('la particule de politesse finale est facultative', () => {
    expect(scorePronunciation(['สวัสดี'], ['สวัสดีครับ'], words).score).toBe(10);
  });
  it('un mot sur deux reconnu : note intermédiaire et mot fautif signalé', () => {
    const r = scorePronunciation(['สวัสดีกิน'], ['สวัสดีครับ'], words);
    expect(r.score).toBeGreaterThanOrEqual(5);
    expect(r.score).toBeLessThan(10);
    expect(r.words[0].ok).toBe(true);
    expect(r.words[1].ok).toBe(false);
  });
  it('seul le ton diffère : indice sur le ton', () => {
    const r = scorePronunciation(['ม้า'], ['หมา']); // même sons, autre écriture ? non : ห นำ diffère → pas ton seul
    expect(r.verdict).not.toBe('ok');
    const r2 = scorePronunciation(['มา'], ['ม้า']);
    expect(r2.hints[0]).toMatch(/ton/);
  });
  it('longueur de voyelle', () => {
    const r = scorePronunciation(['กิน'], ['กีน']);
    expect(r.hints[0]).toMatch(/longueur/);
  });
  it('rien entendu : 0', () => {
    expect(scorePronunciation([], ['ขอบคุณ']).score).toBe(0);
    expect(scorePronunciation(['ไปไหน'], ['ขอบคุณ']).score).toBeLessThanOrEqual(3);
  });
});
