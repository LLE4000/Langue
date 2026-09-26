import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { syllable } from '@/engine/readaloud/compose';
import type { VadEvent } from '@/engine/audio/vad';
import type { ContinuousResult } from '@/engine/audio/mic';
import { RaRun, type RunDeps } from './run';

const items = ['ด', 'ม', 'น', 'ต', 'ว', 'ส', 'ก', 'จ', 'บ', 'ป', 'อ', 'ร'].map((c) => syllable(c, '–า')!);
const seg = () => ({ type: 'segment' as const, seg: { start: 0, end: 0.3, samples: new Float32Array(4800), peak: 0.2 } });

function harness(opts: { mic?: boolean; asr?: boolean } = {}) {
  let vad: ((e: VadEvent) => void) | null = null, asr: ((r: ContinuousResult) => void) | null = null;
  const spoken: string[] = [];
  const deps: RunDeps = {
    speak: (t, onend) => { spoken.push(t); setTimeout(onend, 300); return true; },
    cancelSpeak: () => {},
    mic: opts.mic === false ? null : { start: async (l) => { vad = l; }, stop: () => {}, mute: () => {} },
    asr: opts.asr === false ? null : { start: (r) => { asr = r; }, stop: () => {} },
    azure: null,
    pitch: () => null,
    now: () => Date.now(),
  };
  return { deps, spoken, say: () => vad!(seg()), hear: (t: string) => asr!({ alts: [t], t: Date.now() }) };
}

describe('série de lecture à voix haute', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('lecture directe : chaque lecture fait avancer, la reconnaissance juge ensuite, une erreur revient 8 plus loin', async () => {
    const h = harness();
    const run = new RaRun(items, 'read', h.deps);
    await run.start();
    h.say(); await vi.advanceTimersByTimeAsync(100);
    h.say(); await vi.advanceTimersByTimeAsync(100);
    expect(run.state.pos).toBe(2);
    h.hear('ดา ม้า'); // la 2e : ton faux
    await vi.advanceTimersByTimeAsync(10);
    expect(run.state.queue[0].result?.verdict).toBe('ok');
    expect(run.state.queue[1].result).toMatchObject({ verdict: 'near', kind: 'tone' });
    expect(run.state.queue[10].item.thai).toBe('มา'); // revient 8 lectures plus loin
    expect(run.state.queue.length).toBe(items.length + 1);
  });

  it('écouter puis lire : le modèle joue d’abord, le micro n’écoute qu’après', async () => {
    const h = harness();
    const run = new RaRun(items, 'listen', h.deps);
    await run.start();
    expect(h.spoken).toEqual(['ดา']);
    expect(run.state.modelPlaying).toBe(true);
    h.say(); await vi.advanceTimersByTimeAsync(100); // pendant le modèle : ignoré
    expect(run.state.pos).toBe(0);
    await vi.advanceTimersByTimeAsync(600);
    h.say(); await vi.advanceTimersByTimeAsync(100);
    expect(run.state.pos).toBe(1);
    expect(h.spoken).toEqual(['ดา', 'มา']);
  });

  it('sans reconnaissance : verdict d’après la courbe, puis fin de série et bilan', async () => {
    const h = harness({ asr: false });
    h.deps.pitch = (_s, it) => ({ predicted: it.tone, expected: it.tone, ok: true, similarity: 1 });
    const run = new RaRun(items.slice(0, 3), 'read', h.deps);
    await run.start();
    for (let k = 0; k < 3; k++) { h.say(); await vi.advanceTimersByTimeAsync(400); }
    expect(run.state.phase).toBe('done');
    expect(run.state.queue.every((s) => s.result?.verdict === 'ok' && s.result.source === 'pitch')).toBe(true);
  });

  it('micro direct refusé : la reconnaissance fait avancer, plusieurs lectures d’une traite', async () => {
    const h = harness();
    h.deps.mic = { start: async () => { throw new Error('denied'); }, stop: () => {}, mute: () => {} };
    const run = new RaRun(items, 'read', h.deps);
    await run.start();
    h.hear('ดามานา');
    expect(run.state.pos).toBe(3);
    expect(run.state.queue.slice(0, 3).every((s) => s.result?.verdict === 'ok')).toBe(true);
  });

  it('chrono : la série s’arrête au bout du temps, seules les lectures atteintes comptent', async () => {
    const h = harness({ asr: false });
    const run = new RaRun(items, 'chrono', h.deps, { chronoMs: 1000 });
    await run.start();
    h.say(); await vi.advanceTimersByTimeAsync(300);
    h.say(); await vi.advanceTimersByTimeAsync(800);
    expect(run.state.phase).toBe('done');
    expect(run.state.queue.length).toBe(2);
  });
});
