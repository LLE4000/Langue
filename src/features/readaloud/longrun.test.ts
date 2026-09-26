import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { VadEvent } from '@/engine/audio/vad';
import type { ContinuousResult } from '@/engine/audio/mic';
import { LongRun, type LrDeps } from './longrun';

const W = (thai: string) => ({ thai, rom: '' });
const text = [[W('แม่'), W('ไป'), W('ตลาด')], [W('ซื้อ'), W('ผัก'), W('และ'), W('ผลไม้')], [W('แล้ว'), W('กลับ'), W('บ้าน')]];
function harness() {
  let vad: ((e: VadEvent) => void) | null = null, asr: ((r: ContinuousResult) => void) | null = null;
  let t = 0;
  const deps: LrDeps = { speak: (_t, e) => { setTimeout(e, 100); return true; }, cancelSpeak: () => {}, mic: { start: async (l) => { vad = l; }, stop: () => {}, mute: () => {} }, asr: { start: (r) => { asr = r; }, stop: () => {} }, azure: null, now: () => t };
  const seg = (a: number, b: number) => vad!({ type: 'segment', seg: { start: a, end: b, samples: new Float32Array(1600), peak: 0.2 } });
  return { deps, seg, hear: (s: string) => asr!({ alts: [s], t: 0 }), tick: (ms: number) => { t += ms; } };
}

describe('lecture longue : déroulé', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());
  it('passe à la phrase suivante quand elle est lue, puis sur une pause, et termine', async () => {
    const h = harness();
    const run = new LongRun(text, h.deps);
    await run.start();
    h.seg(0, 1.2); h.hear('แม่ไปตลาด');
    await vi.advanceTimersByTimeAsync(300);
    expect(run.state.si).toBe(1);
    expect(run.state.sentences[0].results.every((r) => r.verdict === 'ok')).toBe(true);
    h.seg(2, 3); // pas de reconnaissance : la pause fait avancer
    await vi.advanceTimersByTimeAsync(1900);
    expect(run.state.si).toBe(2);
    h.tick(500); h.hear('ซื้อผักผลไม้'); // arrive en retard : rendu à la phrase 2
    expect(run.state.sentences[1].results.map((r) => r.verdict)).toEqual(['ok', 'ok', 'missed', 'ok']);
    run.next();
    expect(run.state.phase).toBe('done');
  });
});
