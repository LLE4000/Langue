/**
 * Micro continu pour la lecture à voix haute : un flux ouvert pendant toute la série, ré-échantillonné à 16 kHz,
 * découpé en lectures par la détection de parole (vad.ts). Chaque lecture garde son audio : il sert à juger le ton
 * (courbe de hauteur), à l'évaluation Azure facultative, et à se réécouter dans le bilan.
 */
import { VadSegmenter, downsample, type VadEvent } from './vad';
import { classifyTone, detectPitchTrack, toneContour } from './pitch';
import type { ToneId } from '@/content/types';

export type MicListener = (e: VadEvent) => void;

export class MicStream {
  private ctx: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private node: ScriptProcessorNode | null = null;
  private src: MediaStreamAudioSourceNode | null = null;
  private vad: VadSegmenter | null = null;
  private listener: MicListener = () => {};
  /** tant que vrai, l'entrée est ignorée (lecture du modèle audio, pause) */
  muted = false;
  static get supported() { return typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof AudioContext !== 'undefined'; }
  get running() { return !!this.ctx; }

  async start(listener: MicListener, endSilenceMs: number) {
    this.listener = listener;
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true, channelCount: 1 } });
    const ctx = new AudioContext();
    this.ctx = ctx;
    if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
    this.vad = new VadSegmenter({ sampleRate: 16000, endSilenceMs });
    this.src = ctx.createMediaStreamSource(this.stream);
    // ScriptProcessor : déprécié mais disponible partout (iOS compris) ; 4096 échantillons ≈ 85 ms à 48 kHz
    this.node = ctx.createScriptProcessor(4096, 1, 1);
    const rate = ctx.sampleRate;
    this.node.onaudioprocess = (ev) => {
      if (!this.vad) return;
      if (this.muted) return;
      const x = downsample(ev.inputBuffer.getChannelData(0), rate, 16000);
      for (const e of this.vad.push(x)) this.listener(e);
    };
    this.src.connect(this.node);
    // un ScriptProcessor ne tourne que s'il est relié à la sortie : gain nul pour ne rien faire entendre
    const sink = ctx.createGain(); sink.gain.value = 0;
    this.node.connect(sink); sink.connect(ctx.destination);
  }

  setEndSilence(ms: number) { if (this.vad) this.vad.endSilenceMs = ms; }
  /** Coupe l'écoute (modèle audio en cours) ; la lecture en cours est oubliée. */
  mute(on: boolean) { this.muted = on; if (on) this.vad?.reset(); }

  stop() {
    try { this.node?.disconnect(); this.src?.disconnect(); } catch { /* déjà déconnecté */ }
    this.stream?.getTracks().forEach((t) => t.stop());
    this.ctx?.close().catch(() => {});
    this.ctx = null; this.stream = null; this.node = null; this.src = null; this.vad = null;
  }
}

/** Ton d'une lecture d'après la courbe de hauteur (syllabe seule), ou null si la voix n'est pas assez nette. */
export function toneOfSegment(samples: Float32Array, expected: ToneId): { predicted: ToneId; expected: ToneId; ok: boolean; similarity: number } | null {
  const contour = toneContour(detectPitchTrack(samples, 16000));
  if (!contour) return null;
  const c = classifyTone(contour.points, expected);
  return { predicted: c.predicted, expected, ok: c.ok, similarity: c.similarity };
}
