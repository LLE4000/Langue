import { describe, expect, it } from 'vitest';
import { collectVoiceTexts, voiceCharacterCount } from './voiceTexts';
import { clipKey } from '@/engine/audio/clipKey';

describe('textes à synthétiser', () => {
  const texts = collectVoiceTexts();
  it('couvre le contenu, sans jeton restant, et reste dans le palier gratuit', () => {
    expect(texts.length).toBeGreaterThan(1500);
    expect(texts.some((t) => /\{[PQIN]\}|\{[^}]*\|/.test(t))).toBe(false);
    expect(texts).toContain('สวัสดีครับ');
    expect(texts).toContain('สวัสดีค่ะ');
    expect(texts).toContain('กอ ไก่');
    expect(texts).toContain('กอ');
    const chars = voiceCharacterCount(texts);
    expect(chars).toBeGreaterThan(20000);
    expect(chars).toBeLessThan(200000); // × 2 voix < 500 000 caractères par mois (palier gratuit Azure)
  });
  it('clé de clip stable et sans collision sur tout le corpus', () => {
    expect(clipKey('สวัสดีครับ')).toBe(clipKey('  สวัสดีครับ '));
    expect(clipKey('สวัสดีครับ')).not.toBe(clipKey('สวัสดีค่ะ'));
    expect(new Set(texts.map(clipKey)).size).toBe(texts.length);
  });
});
