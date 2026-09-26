import { describe, expect, it } from 'vitest';
import { VadSegmenter, downsample, wavBlob } from './vad';

const SR = 16000;
const tone = (ms: number, amp = 0.2, f = 180) => Float32Array.from({ length: (SR * ms) / 1000 }, (_, i) => amp * Math.sin((2 * Math.PI * f * i) / SR));
const noise = (ms: number, amp = 0.002) => Float32Array.from({ length: (SR * ms) / 1000 }, (_, i) => amp * Math.sin(i * 12.9898) * Math.cos(i * 78.233));
const cat = (...xs: Float32Array[]) => { const out = new Float32Array(xs.reduce((a, x) => a + x.length, 0)); let o = 0; for (const x of xs) { out.set(x, o); o += x.length; } return out; };

describe('détection de parole', () => {
  it('découpe une suite de syllabes lues sans toucher l’écran', () => {
    const v = new VadSegmenter({ sampleRate: SR, endSilenceMs: 240 });
    const audio = cat(noise(500), tone(350), noise(400), tone(300, 0.15, 220), noise(400), tone(420, 0.3, 160), noise(600));
    const segs: { start: number; end: number }[] = [];
    let starts = 0;
    for (let i = 0; i < audio.length; i += 2048) for (const e of v.push(audio.subarray(i, i + 2048))) { if (e.type === 'segment') segs.push(e.seg); if (e.type === 'start') starts++; }
    expect(segs.length).toBe(3);
    expect(starts).toBe(3);
    expect(segs[0].start).toBeGreaterThan(0.35);
    expect(segs[0].start).toBeLessThan(0.52);
    expect(segs[0].end - segs[0].start).toBeGreaterThan(0.3);
    expect(segs[0].end - segs[0].start).toBeLessThan(0.6);
  });
  it('ignore un claquement bref et coupe une lecture trop longue', () => {
    const v = new VadSegmenter({ sampleRate: SR, maxSegmentMs: 1000 });
    const ev = v.push(cat(noise(300), tone(40, 0.5), noise(400), tone(2500), noise(400)));
    const segs = ev.filter((e) => e.type === 'segment');
    expect(segs.length).toBe(3); // 1 s + 1 s + reste ; le claquement de 40 ms n'en est pas une
  });
  it('ré-échantillonne et produit un WAV valide', () => {
    expect(downsample(new Float32Array(48000), 48000).length).toBe(16000);
    expect(wavBlob(new Float32Array(1600)).size).toBe(44 + 3200);
  });
});
