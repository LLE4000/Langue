import { describe, expect, it } from 'vitest';
import { classifyTone, detectPitchTrack, synthesizeTone, toneContour } from './pitch';
import type { ToneId } from '@/content/types';

const TONES: ToneId[] = ['M', 'L', 'F', 'H', 'R'];

describe('analyse de la hauteur de la voix', () => {
  it('retrouve la fréquence d’une voyelle synthétique', () => {
    const track = detectPitchTrack(synthesizeTone('M', 16000, 150), 16000);
    const voiced = track.filter((f) => f.f0 > 0 && f.clarity > 0.8 && f.rms > 0.05);
    expect(voiced.length).toBeGreaterThan(20);
    const mid = voiced[Math.floor(voiced.length / 2)];
    expect(Math.abs(mid.f0 - 150)).toBeLessThan(6);
  });
  it('reconnaît chacun des cinq tons, voix grave ou aiguë, à 16 kHz et 48 kHz', () => {
    for (const sr of [16000, 48000]) for (const base of [110, 220]) for (const tone of TONES) {
      const track = detectPitchTrack(synthesizeTone(tone, sr, base), sr);
      const c = toneContour(track);
      expect(c, `${tone} ${sr} ${base}`).not.toBeNull();
      const r = classifyTone(c!.points, tone);
      expect(r.predicted, `${tone} ${sr} ${base}`).toBe(tone);
      expect(r.similarity).toBeGreaterThan(0.7);
    }
  });
  it('signale un ton différent de celui attendu', () => {
    const track = detectPitchTrack(synthesizeTone('R'), 16000);
    const r = classifyTone(toneContour(track)!.points, 'F');
    expect(r.ok).toBe(false);
    expect(r.predicted).toBe('R');
  });
  it('ne conclut rien sur du silence', () => {
    expect(toneContour(detectPitchTrack(new Float32Array(16000), 16000))).toBeNull();
  });
});
