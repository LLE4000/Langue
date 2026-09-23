import { describe, expect, it } from 'vitest';
import { parseSyl, romToIPA, romToRTGS, tonesOf, markTone, isLiveSyllable } from './transcription';
import { toneRule, toneOfWord, ruleKeyOf } from './toneRule';
import { thaiNumber } from './numbers';
import { TONE_WORDS } from '@/content/th/tones';
import { CONSONANTS } from '@/content/th/consonants';
import { VOCAB_THEMES } from '@/content/th/vocabulary';
import { rate, mastery, qualityFromAnswer, isDue } from '../srs';
import { resolveTokens } from '../tokens';
import { judgeSpeech } from '../audio/mic';

describe('transcription', () => {
  it('analyse les syllabes', () => {
    expect(parseSyl('khâao')).toMatchObject({ on: 'kh', core: 'aa', glide: 'w', tone: 'F' });
    expect(parseSyl('kin')).toMatchObject({ on: 'k', core: 'i', coda: 'n', tone: 'M' });
    expect(parseSyl('sǔai')).toMatchObject({ on: 's', core: 'ua', glide: 'j', tone: 'R' });
    expect(parseSyl('xyz')).toBeNull();
  });
  it('dérive API et RTGS', () => {
    expect(romToIPA('khâao')).toBe('kʰaːw˥˩');
    expect(romToRTGS('khɔ̀ɔp-khun')).toBe('khopkhun');
    expect(romToRTGS('jaan')).toBe('chan');
    expect(tonesOf('sà-wàt-dii')).toEqual(['L', 'L', 'M']);
    expect(markTone('maa', 'R')).toBe('mǎa');
  });
  it('vivante / morte', () => {
    expect(isLiveSyllable(parseSyl('maa')!)).toBe(true);
    expect(isLiveSyllable(parseSyl('jà')!)).toBe(false);
    expect(isLiveSyllable(parseSyl('rák')!)).toBe(false);
    expect(isLiveSyllable(parseSyl('pai')!)).toBe(true);
  });
});

describe('règle de ton', () => {
  it('table de base', () => {
    expect(toneRule('M', true, true, 0)).toBe('M');
    expect(toneRule('H', true, true, 0)).toBe('R');
    expect(toneRule('L', false, false, 0)).toBe('H');
    expect(toneRule('L', false, true, 0)).toBe('F');
    expect(toneRule('M', false, false, 0)).toBe('L');
    expect(toneRule('L', true, true, 1)).toBe('F');
    expect(toneRule('L', true, true, 2)).toBe('H');
    expect(toneRule('H', true, true, 3)).toBeNull();
  });
  it('les mots analysés sont cohérents avec leur transcription', () => {
    for (const w of TONE_WORDS) {
      const fromRule = toneOfWord(w), fromRom = tonesOf(w.rom)[0];
      expect(fromRule, `${w.thai} (${w.rom})`).toBe(fromRom);
      expect(ruleKeyOf(w)).toMatch(/^rule:[MHL]\|/);
    }
  });
});

describe('nombres', () => {
  it('compose les nombres', () => {
    expect(thaiNumber(0).thai).toBe('ศูนย์');
    expect(thaiNumber(11).thai).toBe('สิบเอ็ด');
    expect(thaiNumber(20).thai).toBe('ยี่สิบ');
    expect(thaiNumber(21).thai).toBe('ยี่สิบเอ็ด');
    expect(thaiNumber(101).thai).toBe('หนึ่งร้อยเอ็ด');
    expect(thaiNumber(25000).thai).toBe('สองหมื่นห้าพัน');
    expect(thaiNumber(1000000).thai).toBe('หนึ่งล้าน');
    expect(thaiNumber(357).digits).toBe('๓๕๗');
  });
});

describe('SRS et maîtrise', () => {
  it('progresse avec les bonnes réponses', () => {
    const t0 = 1_700_000_000_000;
    let st = rate(undefined, 3, t0);
    expect(st.ivl).toBe(3);
    expect(mastery(st, t0)).toBeGreaterThan(0.4);
    st = rate(st, 4, t0 + 3 * 86_400_000);
    expect(mastery(st, t0 + 3 * 86_400_000)).toBeGreaterThan(mastery(rate(undefined, 3, t0), t0));
    expect(isDue(st, t0 + 4 * 86_400_000)).toBe(false);
    expect(isDue(st, t0 + 100 * 86_400_000)).toBe(true);
  });
  it('retombe après une erreur', () => {
    const t0 = 1_700_000_000_000;
    const good = rate(rate(undefined, 3, t0), 4, t0 + 1);
    const bad = rate(good, 0, t0 + 2);
    expect(mastery(bad, t0 + 2)).toBeLessThan(mastery(good, t0 + 2));
    expect(bad.lapses).toBe(1);
  });
  it('convertit une réponse en note', () => {
    expect(qualityFromAnswer(true, undefined)).toBe(3);
    expect(qualityFromAnswer(false, undefined)).toBe(0);
    expect(qualityFromAnswer(false, rate(undefined, 3))).toBe(1);
  });
});

describe('jetons de politesse', () => {
  it('résout selon le profil', () => {
    expect(resolveTokens('สวัสดี{P}', { gender: 'm', name: 'Luc' })).toBe('สวัสดีครับ');
    expect(resolveTokens('{I}ชื่อ {N}', { gender: 'f', name: 'Anna' })).toBe('ฉันชื่อ Anna');
    expect(resolveTokens('ไหม{Q}', { gender: 'f', name: '' })).toBe('ไหมคะ');
  });
});

describe('reconnaissance vocale', () => {
  it('tolère la particule de politesse', () => {
    expect(judgeSpeech(['สวัสดีครับ'], ['สวัสดี']).verdict).toBe('ok');
    expect(judgeSpeech(['สวัสดี'], ['ขอบคุณ']).verdict).toBe('ko');
  });
});

describe('cohérence du contenu', () => {
  it('44 consonnes, identifiants uniques', () => {
    expect(CONSONANTS.length).toBe(44);
    expect(new Set(CONSONANTS.map((c) => c.id)).size).toBe(44);
  });
  it('les transcriptions du vocabulaire suivent la convention', () => {
    let bad = 0;
    for (const t of VOCAB_THEMES) for (const w of t.items) {
      const syls = w.rom.replace(/\{[a-z]\}/g, '').replace(/\.\.\./g, ' ').split(/[\s-]+/).filter(Boolean);
      for (const s of syls) if (!parseSyl(s)) bad++;
    }
    expect(bad).toBeLessThan(12); // quelques mots empruntés (frii, waai-faai…) sortent du système
  });
});
