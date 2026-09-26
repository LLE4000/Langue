/**
 * Lecture longue à voix haute : un texte entier, phrase par phrase, micro ouvert.
 *
 * On passe tout seul à la phrase suivante quand la reconnaissance a couvert la phrase (85 % des mots), ou sur une pause :
 * 0,7 s si l'on a déjà parlé à peu près le temps de la phrase, 1,8 s sinon. Un résultat de reconnaissance qui arrive juste après ce passage
 * est rendu à la phrase précédente. Azure (facultatif) évalue chaque phrase terminée par rapport au texte.
 */
import type { VadEvent, VadSegment } from '@/engine/audio/vad';
import type { ContinuousResult } from '@/engine/audio/mic';
import type { AzureConfig, AzureWord } from '@/engine/audio/azure';
import { coverage, judgeSentence, type LrWord, type LrWordResult, type Segment } from '@/engine/readaloud/longread';
import { normThai } from '@/engine/thai/script';
import { syllableCount } from '@/engine/thai/reading';

export interface LrDeps {
  speak(text: string, onend: () => void): boolean;
  cancelSpeak(): void;
  mic: { start(l: (e: VadEvent) => void, endSilenceMs: number): Promise<void>; stop(): void; mute(on: boolean): void } | null;
  asr: { start(onResult: (r: ContinuousResult) => void, onFatal: (code: string) => void): void; stop(): void } | null;
  azure: AzureConfig | null;
  assess?: (cfg: AzureConfig, samples: Float32Array, ref: string) => Promise<AzureWord[]>;
  now(): number;
}

export interface LrSentence { words: LrWord[]; heard: string; results: LrWordResult[]; segs: Segment[]; audio: Float32Array[]; azure?: boolean }
export interface LrState {
  phase: 'ready' | 'starting' | 'running' | 'paused' | 'done';
  si: number;
  sentences: LrSentence[];
  voice: boolean;
  modelPlaying: boolean;
  mic: boolean;
  asr: 'off' | 'waiting' | 'ok' | 'silent';
  azure: 'off' | 'on' | 'error';
  notice?: string;
  startedAt: number;
  endedAt?: number;
}

const COVER = 0.85, PAUSE_MS = 1800, SHORT_PAUSE_MS = 700, END_SILENCE = 500;

export class LongRun {
  state: LrState;
  private listeners = new Set<(s: LrState) => void>();
  private pauseTimer: ReturnType<typeof setTimeout> | null = null;
  private advancedAt = 0;
  private segsSeen = 0;
  private asrN = 0;

  constructor(sentences: LrWord[][], private deps: LrDeps) {
    this.state = { phase: 'ready', si: 0, sentences: sentences.map((words) => ({ words, heard: '', results: words.map(() => ({ verdict: 'none' as const })), segs: [], audio: [] })), voice: false, modelPlaying: false, mic: false, asr: 'off', azure: deps.azure && deps.assess ? 'on' : 'off', startedAt: 0 };
  }
  subscribe(fn: (s: LrState) => void) { this.listeners.add(fn); return () => { this.listeners.delete(fn); }; }
  private set(p: Partial<LrState>) { this.state = { ...this.state, ...p }; this.listeners.forEach((l) => l(this.state)); }
  private patch(i: number, p: Partial<LrSentence>) { const s = this.state.sentences.slice(); s[i] = { ...s[i], ...p }; this.set({ sentences: s }); }

  async start() {
    this.set({ phase: 'starting' });
    let mic = false;
    if (this.deps.mic) { try { await this.deps.mic.start((e) => this.onVad(e), END_SILENCE); mic = true; } catch { this.set({ notice: 'Micro indisponible ou refusé : passez d’une phrase à l’autre avec le bouton.' }); } }
    let asr: LrState['asr'] = 'off';
    if (this.deps.asr) { asr = 'waiting'; this.deps.asr.start((r) => this.onAsr(r), () => this.set({ asr: 'off', notice: 'Reconnaissance vocale indisponible : seuls le débit et les pauses seront mesurés.' })); }
    this.set({ phase: 'running', mic, asr, startedAt: this.deps.now() });
  }

  private onVad(e: VadEvent) {
    if (this.state.phase !== 'running') return;
    if (e.type === 'level') { if (e.speaking !== this.state.voice) this.set({ voice: e.speaking }); return; }
    if (e.type === 'start') { this.set({ voice: true }); if (this.pauseTimer) clearTimeout(this.pauseTimer); return; }
    this.addSegment(e.seg);
  }

  private addSegment(seg: VadSegment) {
    const i = this.state.si, s = this.state.sentences[i];
    if (!s || this.state.modelPlaying) return;
    this.segsSeen++;
    this.patch(i, { segs: [...s.segs, { start: seg.start, end: seg.end }], audio: [...s.audio, seg.samples] });
    if (this.state.asr === 'waiting' && this.segsSeen >= 4 && !this.asrN) this.set({ asr: 'silent', notice: 'La reconnaissance vocale ne répond pas en même temps que le micro : débit et pauses seulement.' });
    // pause après avoir parlé : courte (0,7 s) si l'on a parlé à peu près le temps de la phrase, sinon une vraie pause
    const cur = this.state.sentences[i];
    const spoken = cur.segs.reduce((a, g) => a + g.end - g.start, 0);
    const expected = cur.words.reduce((a, w) => a + Math.max(1, syllableCount(w.thai)), 0) * 0.15;
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    this.pauseTimer = setTimeout(() => { if (this.state.si === i && !this.state.voice) this.next(); }, spoken >= expected ? SHORT_PAUSE_MS : PAUSE_MS);
  }

  private onAsr(r: ContinuousResult) {
    if (this.state.phase !== 'running' && this.state.phase !== 'paused' && this.state.phase !== 'done') return;
    this.asrN++;
    if (this.state.asr !== 'ok') this.set({ asr: 'ok' });
    let i = this.state.si;
    // arrivé juste après le passage à la phrase suivante, sans parole depuis : c'est la fin de la précédente
    if (i > 0 && (this.state.phase === 'done' || (!this.state.sentences[i]?.segs.length && this.deps.now() - this.advancedAt < 2500))) i -= 1;
    const s = this.state.sentences[i];
    if (!s) return;
    const heard = (s.heard + ' ' + (r.alts[0] ?? '')).trim();
    const results = s.azure ? s.results : judgeSentence(s.words, heard);
    this.patch(i, { heard, results });
    if (i === this.state.si && this.state.phase === 'running' && coverage(results) >= COVER) setTimeout(() => { if (this.state.si === i && !this.state.voice) this.next(); }, 250);
  }

  private assess(i: number) {
    const s = this.state.sentences[i], cfg = this.deps.azure, assess = this.deps.assess;
    if (!s || !s.audio.length || !cfg || !assess || this.state.azure !== 'on') return;
    const gap = new Float32Array(2400);
    const total = s.audio.reduce((a, x) => a + x.length + gap.length, 0);
    const samples = new Float32Array(total);
    let o = 0; for (const x of s.audio) { samples.set(x, o); o += x.length + gap.length; }
    assess(cfg, samples, s.words.map((w) => w.thai).join(' ')).then((ws) => {
      const words = ws.filter((w) => w.errorType !== 'Insertion');
      const results = s.words.map((w, k): LrWordResult => {
        const a = words.length === s.words.length ? words[k] : words.find((x) => normThai(x.word) === normThai(w.thai));
        if (!a) return this.state.sentences[i].results[k];
        if (a.errorType === 'Omission') return { verdict: 'missed', accuracy: 0 };
        return { verdict: a.accuracy >= 80 && a.errorType !== 'Mispronunciation' ? 'ok' : a.accuracy >= 50 ? 'near' : 'missed', accuracy: a.accuracy, heard: a.word };
      });
      this.patch(i, { results, azure: true });
    }).catch((e: Error) => this.set({ azure: 'error', notice: `Azure : ${e.message}`.slice(0, 140) }));
  }

  // ---------- commandes ----------
  next() {
    if (this.state.phase !== 'running' && this.state.phase !== 'paused') return;
    if (this.pauseTimer) { clearTimeout(this.pauseTimer); this.pauseTimer = null; }
    const i = this.state.si;
    this.assess(i);
    this.advancedAt = this.deps.now();
    if (i + 1 >= this.state.sentences.length) return this.finish();
    this.set({ si: i + 1, voice: false });
  }
  /** Relire la phrase en cours depuis le début. */
  again() { const i = this.state.si, s = this.state.sentences[i]; if (s) this.patch(i, { heard: '', results: s.words.map(() => ({ verdict: 'none' as const })), segs: [], audio: [] }); }
  listen() {
    const s = this.state.sentences[this.state.si];
    if (!s) return;
    this.deps.mic?.mute(true);
    this.set({ modelPlaying: true });
    const done = () => setTimeout(() => { this.deps.mic?.mute(false); this.set({ modelPlaying: false }); }, 200);
    if (!this.deps.speak(s.words.map((w) => w.thai).join(''), done)) done();
  }
  pause() { if (this.state.phase === 'running') { this.deps.mic?.mute(true); this.deps.cancelSpeak(); this.set({ phase: 'paused', modelPlaying: false }); } }
  resume() { if (this.state.phase === 'paused') { this.deps.mic?.mute(false); this.set({ phase: 'running' }); } }
  finish() {
    if (this.state.phase === 'done') return;
    if (this.pauseTimer) clearTimeout(this.pauseTimer);
    this.deps.mic?.stop();
    this.deps.cancelSpeak();
    this.set({ phase: 'done', endedAt: this.deps.now(), voice: false, modelPlaying: false });
    setTimeout(() => this.deps.asr?.stop(), 1500);
  }
  release() { if (this.pauseTimer) clearTimeout(this.pauseTimer); this.deps.mic?.stop(); this.deps.asr?.stop(); this.deps.cancelSpeak(); }
}
