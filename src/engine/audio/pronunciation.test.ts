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
  it('sévérité : indulgente prend la meilleure hypothèse, normale la première, stricte plafonne à 7 sans exactitude', () => {
    const alts = ['สวัสดีกิน', 'สวัสดีครับ'];
    expect(scorePronunciation(alts, ['สวัสดีครับ'], words, 'lenient').score).toBe(10);
    expect(scorePronunciation(alts, ['สวัสดีครับ'], words, 'normal').score).toBeLessThan(10);
    const strict = scorePronunciation(alts, ['สวัสดีครับ'], words, 'strict');
    expect(strict.score).toBeLessThanOrEqual(7);
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'strict').score).toBe(10);
  });
  it('une erreur de ton seule ne vaut jamais « presque » : plafond 5 (4 en strict), libre en indulgent', () => {
    // ผมอยากไปตลาด avec un ton faux sur ตลาด : 92 % de ressemblance caractère par caractère, mais un autre mot
    const t = 'ผมอยากไปตลาด', h = 'ผมอยากไปตล่าด';
    expect(scorePronunciation([h], [t]).score).toBeLessThanOrEqual(5);
    expect(scorePronunciation([h], [t], [], 'strict').score).toBeLessThanOrEqual(4);
    expect(scorePronunciation([h], [t], [], 'lenient').score).toBeGreaterThanOrEqual(7);
    expect(scorePronunciation([h], [t]).hints[0]).toMatch(/ton/);
    // longueur de voyelle seule : même plafond
    expect(scorePronunciation(['กิน'], ['กีน']).score).toBeLessThanOrEqual(5);
  });
  it('la certitude du moteur plafonne la note', () => {
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'normal', 0.95).score).toBe(10);
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'normal', 0.6).score).toBe(8);
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'normal', 0.3).score).toBe(6);
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'strict', 0.8).score).toBe(8);
    expect(scorePronunciation(['สวัสดีครับ'], ['สวัสดีครับ'], words, 'lenient', 0.3).score).toBe(10);
  });
  it('rien entendu : 0', () => {
    expect(scorePronunciation([], ['ขอบคุณ']).score).toBe(0);
    expect(scorePronunciation(['ไปไหน'], ['ขอบคุณ']).score).toBeLessThanOrEqual(3);
  });
});
