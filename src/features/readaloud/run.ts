/**
 * Une série de lecture à voix haute, indépendante de l'interface (testable avec de faux micro et reconnaissance).
 *
 * Avancement : dès qu'une lecture se termine (la détection de parole voit le silence), on passe à la suivante —
 * le rythme ne dépend jamais de la reconnaissance. Les jugements arrivent ensuite, en arrière-plan :
 *   - reconnaissance continue de l'appareil : ses morceaux de texte sont répartis entre les lectures en attente ;
 *   - courbe de la voix (syllabes) : le ton, à titre indicatif ;
 *   - Azure (clé personnelle facultative) : par blocs de six lectures, évaluation contrainte par le texte attendu.
 * Une lecture approximative ou ratée revient quelques éléments plus loin (queue.ts).
 *
 * Modes : listen (le modèle natif, puis à vous), read (lecture directe), auto (défilement à tempo fixe),
 * chrono (une minute, le plus possible, juste). Sans micro : on avance d'un toucher (pas de jugement).
 * Si le micro direct est refusé mais la reconnaissance marche, on avance sur ses résultats.
 */
import type { RaItem } from '@/engine/readaloud/compose';
import { alignHeard } from '@/engine/readaloud/align';
import { combine, judgeAzure, judgeHeard, judgePitch, type PitchVerdict, type RaJudgement } from '@/engine/readaloud/judge';
import { initialQueue, scheduleRetry, type RaSlot } from '@/engine/readaloud/queue';
import type { VadEvent, VadSegment } from '@/engine/audio/vad';
import type { ContinuousResult } from '@/engine/audio/mic';
import type { AzureConfig, AzureWord } from '@/engine/audio/azure';
import { normThai } from '@/engine/thai/script';

export type RaMode = 'listen' | 'read' | 'auto' | 'chrono';
export type Tempo = 'slow' | 'mid' | 'fast';

export interface RunDeps {
  speak(text: string, onend: () => void): boolean;
  cancelSpeak(): void;
  mic: { start(l: (e: VadEvent) => void, endSilenceMs: number): Promise<void>; stop(): void; mute(on: boolean): void } | null;
  asr: { start(onResult: (r: ContinuousResult) => void, onFatal: (code: string) => void): void; stop(): void } | null;
  azure: AzureConfig | null;
  assess?: (cfg: AzureConfig, samples: Float32Array, ref: string) => Promise<AzureWord[]>;
  pitch?: (samples: Float32Array, it: RaItem) => PitchVerdict | null;
  now(): number;
  /** minuteries injectables (tests) */
  setTimeout?: (fn: () => void, ms: number) => unknown;
  clearTimeout?: (h: unknown) => void;
}

/** Ce qu'on garde de chaque lecture, en plus du verdict. */
export interface SlotAudio { seg?: VadSegment; asr?: RaJudgement; pitch?: RaJudgement; azure?: RaJudgement; heardAt?: number }

export interface RunState {
  phase: 'ready' | 'starting' | 'running' | 'paused' | 'done';
  mode: RaMode;
  pos: number;
  queue: RaSlot[];
  audio: SlotAudio[];
  /** l'apprenant est en train de parler (détection de parole) */
  voice: boolean;
  level: number;
  modelPlaying: boolean;
  /** micro direct actif / reconnaissance active / Azure actif */
  mic: boolean;
  asr: 'off' | 'waiting' | 'ok' | 'silent';
  azure: 'off' | 'on' | 'error';
  notice?: string;
  /** dernier jugement, pour l'indication discrète */
  flash?: { index: number; j: RaJudgement };
  startedAt: number;
  endedAt?: number;
  chronoEnd?: number;
}

const END_SILENCE = { syl: 230, word: 330, phrase: 650 };
const TEMPO_MS: Record<Tempo, number> = { slow: 2200, mid: 1600, fast: 1150 };
const AZURE_BLOCK = 6;

export class RaRun {
  state: RunState;
  private listeners = new Set<(s: RunState) => void>();
  private timers = new Set<unknown>();
  private pendingAsr: number[] = []; // lectures terminées attendant la reconnaissance
  private azureQueue: number[] = [];
  private asrResults = 0;
  private segmentsSeen = 0;
  private autoTimer: unknown = null;
  private waitingModel = false;
  private st: (fn: () => void, ms: number) => unknown;
  private ct: (h: unknown) => void;

  constructor(items: RaItem[], mode: RaMode, private deps: RunDeps, private opts: { tempo?: Tempo; chronoMs?: number } = {}) {
    const queue = initialQueue(items);
    this.state = { phase: 'ready', mode, pos: 0, queue, audio: queue.map(() => ({})), voice: false, level: 0, modelPlaying: false, mic: false, asr: 'off', azure: deps.azure && deps.assess ? 'on' : 'off', startedAt: 0 };
    this.st = deps.setTimeout ?? ((fn, ms) => setTimeout(fn, ms));
    this.ct = deps.clearTimeout ?? ((h) => clearTimeout(h as number));
  }

  subscribe(fn: (s: RunState) => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private set(p: Partial<RunState>) { this.state = { ...this.state, ...p }; this.listeners.forEach((l) => l(this.state)); }
  private later(fn: () => void, ms: number) { const h = this.st(() => { this.timers.delete(h); fn(); }, ms); this.timers.add(h); return h; }
  private get current(): RaItem | undefined { return this.state.queue[this.state.pos]?.item; }

  async start() {
    this.set({ phase: 'starting' });
    const kind = this.state.queue[0]?.item.kind ?? 'syl';
    let mic = false;
    if (this.deps.mic) {
      try { await this.deps.mic.start((e) => this.onVad(e), END_SILENCE[kind]); mic = true; } catch { this.set({ notice: 'Micro indisponible ou refusé : touchez l’écran pour avancer.' }); }
    }
    let asr: RunState['asr'] = 'off';
    if (this.deps.asr) {
      asr = 'waiting';
      this.deps.asr.start((r) => this.onAsr(r), (code) => this.set({ asr: 'off', notice: code === 'not-allowed' ? 'Reconnaissance vocale refusée : le ton sera jugé d’après la courbe de votre voix.' : 'Reconnaissance vocale indisponible sur cet appareil : le ton sera jugé d’après la courbe de votre voix.' }));
    }
    const now = this.deps.now();
    this.set({ phase: 'running', mic, asr, startedAt: now, chronoEnd: this.state.mode === 'chrono' ? now + (this.opts.chronoMs ?? 60000) : undefined });
    if (this.state.mode === 'chrono') this.later(() => this.finish(), this.opts.chronoMs ?? 60000);
    this.enter();
  }

  /** Arrivée sur une lecture : modèle audio (mode écoute), tempo (défilement). */
  private enter() {
    if (this.state.phase !== 'running') return;
    if (this.state.pos >= this.state.queue.length) return this.finish();
    const it = this.current!;
    if (this.state.mode === 'listen') {
      this.deps.mic?.mute(true);
      this.waitingModel = true;
      this.set({ modelPlaying: true });
      const done = () => { if (!this.waitingModel) return; this.waitingModel = false; this.later(() => { this.deps.mic?.mute(false); this.set({ modelPlaying: false }); }, 180); };
      if (!this.deps.speak(it.thai, done)) done();
      else this.later(done, 4000); // garde-fou si la fin de lecture n'est jamais signalée
    }
    if (this.state.mode === 'auto') {
      if (this.autoTimer) this.ct(this.autoTimer);
      const k = it.kind === 'phrase' ? 3 : it.kind === 'word' ? 1.5 : 1;
      this.autoTimer = this.later(() => { this.autoTimer = null; this.advance(); }, TEMPO_MS[this.opts.tempo ?? 'mid'] * k);
    }
  }

  private advance() {
    if (this.state.phase !== 'running') return;
    this.set({ pos: this.state.pos + 1, voice: false });
    this.enter();
  }

  // ---------- micro direct ----------
  private onVad(e: VadEvent) {
    if (this.state.phase !== 'running') return;
    if (e.type === 'level') { if (e.speaking !== this.state.voice) this.set({ voice: e.speaking }); return; }
    if (e.type === 'start') { this.set({ voice: true }); return; }
    const i = this.state.pos;
    if (i >= this.state.queue.length || this.state.modelPlaying) return;
    this.segmentsSeen++;
    this.attach(i, e.seg);
    if (this.state.mode !== 'auto') this.later(() => this.advance(), 60);
  }

  private attach(i: number, seg: VadSegment) {
    const audio = this.state.audio.slice();
    audio[i] = { ...audio[i], seg, heardAt: this.deps.now() };
    this.set({ audio });
    const it = this.state.queue[i].item;
    // ton d'après la courbe (syllabes), sans bloquer l'interface
    if (it.kind === 'syl' && this.deps.pitch) this.later(() => { const p = this.deps.pitch!(seg.samples, it); this.update(i, { pitch: judgePitch(it, p) }); }, 0);
    if (this.state.asr === 'waiting' || this.state.asr === 'ok') {
      this.pendingAsr.push(i);
      // sans résultat de la reconnaissance, on tranche quand même
      this.later(() => this.settle(i), 2600);
      if (this.state.asr === 'waiting' && this.segmentsSeen >= 6 && !this.asrResults) this.set({ asr: 'silent', notice: 'La reconnaissance vocale ne répond pas en même temps que le micro : le ton est jugé d’après la courbe de votre voix.' });
    } else this.later(() => this.settle(i), 250);
    if (this.state.azure === 'on') { this.azureQueue.push(i); if (this.azureQueue.length >= AZURE_BLOCK) this.flushAzure(); }
  }

  // ---------- reconnaissance continue ----------
  private onAsr(r: ContinuousResult) {
    if (this.state.phase !== 'running' && this.state.phase !== 'paused') return;
    this.asrResults++;
    if (this.state.asr !== 'ok') this.set({ asr: 'ok' });
    if (!this.state.mic) return this.onAsrOnly(r);
    // lectures terminées avant ce résultat, pas encore servies
    const waiting = this.pendingAsr.filter((i) => !this.state.audio[i].asr);
    this.pendingAsr = [];
    if (!waiting.length) return;
    if (waiting.length === 1) return this.update(waiting[0], { asr: judgeHeard(this.state.queue[waiting[0]].item, r.alts) }, true);
    const parts = alignHeard(waiting.map((i) => this.state.queue[i].item.thai), r.alts[0] ?? '');
    waiting.forEach((i, k) => this.update(i, { asr: judgeHeard(this.state.queue[i].item, parts[k] ? [parts[k]] : []) }, true));
  }

  /** Sans micro direct : la reconnaissance fait avancer (plusieurs lectures dites d'une traite comptent toutes). */
  private onAsrOnly(r: ContinuousResult) {
    const from = this.state.pos;
    const window = this.state.queue.slice(from, from + 6).map((s) => s.item.thai);
    if (!window.length) return;
    const parts = alignHeard(window, r.alts[0] ?? '');
    let n = 0;
    while (n < parts.length && parts[n]) n++;
    n = Math.max(1, n);
    for (let k = 0; k < n; k++) { const i = from + k; this.update(i, { asr: judgeHeard(this.state.queue[i].item, n === 1 ? r.alts : [parts[k]]), heardAt: this.deps.now() }, true); }
    this.set({ pos: from + n });
    this.enter();
  }

  // ---------- Azure ----------
  private flushAzure() {
    const block = this.azureQueue.splice(0, this.azureQueue.length);
    const cfg = this.deps.azure, assess = this.deps.assess;
    if (!block.length || !cfg || !assess || this.state.azure !== 'on') return;
    const gap = new Float32Array(3200); // 200 ms de silence entre deux lectures
    const parts: Float32Array[] = [];
    for (const i of block) { const s = this.state.audio[i].seg; if (s) parts.push(s.samples, gap); }
    const total = parts.reduce((a, p) => a + p.length, 0);
    const samples = new Float32Array(total);
    let o = 0; for (const p of parts) { samples.set(p, o); o += p.length; }
    const items = block.map((i) => this.state.queue[i].item);
    assess(cfg, samples, items.map((it) => it.thai).join(' ')).then((words) => {
      const ws = words.filter((w) => w.errorType !== 'Insertion');
      block.forEach((i, k) => {
        const target = normThai(items[k].thai);
        const w = ws.length === block.length ? ws[k] : ws.find((x) => normThai(x.word) === target) ?? ws[k];
        if (w) this.update(i, { azure: judgeAzure(w.accuracy, w.errorType, w.word) }, true);
      });
    }).catch((e: Error) => this.set({ azure: 'error', notice: `Azure : ${e.message}`.slice(0, 140) }));
  }

  // ---------- verdicts ----------
  private update(i: number, p: Partial<SlotAudio>, settleNow = false) {
    if (!this.state.queue[i]) return;
    const audio = this.state.audio.slice();
    audio[i] = { ...audio[i], ...p };
    this.state = { ...this.state, audio };
    const slot = this.state.queue[i];
    if (slot.result || settleNow) this.settle(i, true);
    else this.set({});
  }

  /** Fixe (ou révise) le verdict d'une lecture ; une lecture ratée est reprogrammée. */
  private settle(i: number, revise = false) {
    const slot = this.state.queue[i];
    if (!slot || (slot.result && !revise)) return;
    const a = this.state.audio[i];
    if (!a.seg && !a.asr && !a.azure) return;
    const j = combine(a.asr ?? null, a.pitch ?? null, a.azure ?? null);
    let queue = this.state.queue.slice();
    queue[i] = { ...slot, result: j };
    let audio = this.state.audio;
    if ((j.verdict === 'ko' || j.verdict === 'near') && this.state.phase !== 'done') {
      const before = queue.length;
      queue = scheduleRetry(queue, i);
      if (queue.length > before) { const at = queue.findIndex((s, k) => k > i && s.item.key === slot.item.key && !s.result); audio = [...audio.slice(0, at), {}, ...audio.slice(at)]; }
    }
    this.set({ queue, audio, flash: { index: i, j } });
  }

  // ---------- commandes ----------
  /** Toucher l'écran : passer à la suivante (sans micro : « j'ai lu »). */
  skip() {
    if (this.state.phase !== 'running') return;
    const i = this.state.pos;
    if (!this.state.audio[i]?.seg && !this.state.queue[i]?.result) {
      const queue = this.state.queue.slice();
      if (queue[i]) queue[i] = { ...queue[i], result: { verdict: 'none', source: 'self', detail: 'passée' } };
      this.set({ queue });
    }
    this.waitingModel = false;
    this.deps.cancelSpeak();
    this.deps.mic?.mute(false);
    this.set({ modelPlaying: false });
    this.advance();
  }
  replay() {
    const it = this.current;
    if (!it) return;
    this.deps.mic?.mute(true);
    this.set({ modelPlaying: true });
    const done = () => this.later(() => { this.deps.mic?.mute(false); this.set({ modelPlaying: false }); }, 180);
    if (!this.deps.speak(it.thai, done)) done();
  }
  pause() { if (this.state.phase !== 'running') return; if (this.autoTimer) { this.ct(this.autoTimer); this.autoTimer = null; } this.deps.cancelSpeak(); this.deps.mic?.mute(true); this.set({ phase: 'paused', modelPlaying: false }); }
  resume() { if (this.state.phase !== 'paused') return; this.deps.mic?.mute(false); this.set({ phase: 'running' }); this.enter(); }

  finish() {
    if (this.state.phase === 'done') return;
    if (this.autoTimer) { this.ct(this.autoTimer); this.autoTimer = null; }
    this.deps.mic?.stop();
    this.deps.cancelSpeak();
    this.flushAzure();
    // seules les lectures atteintes comptent ; la reconnaissance a encore un instant pour rendre les dernières
    const n = Math.min(this.state.pos, this.state.queue.length);
    this.set({ phase: 'done', endedAt: this.deps.now(), queue: this.state.queue.slice(0, n), audio: this.state.audio.slice(0, n), modelPlaying: false, voice: false });
    this.later(() => { this.deps.asr?.stop(); this.state.queue.forEach((_, i) => this.settle(i)); }, 1600);
  }

  /** Sortie de l'écran : coupe tout, oublie les minuteries. */
  release() {
    this.deps.mic?.stop();
    this.deps.asr?.stop();
    this.deps.cancelSpeak();
    this.timers.forEach((h) => this.ct(h));
    this.timers.clear();
  }
}
