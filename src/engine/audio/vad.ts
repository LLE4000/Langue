/**
 * Détection de parole (VAD) pour la lecture à voix haute : découpe un flux audio continu en « lectures »
 * (une syllabe, un mot, une phrase), sans rien envoyer nulle part. C'est elle qui fait avancer le tapis dès que
 * l'on s'arrête de parler : le rythme ne dépend pas de la latence de la reconnaissance.
 *
 * Énergie par trames de 20 ms, plancher de bruit adaptatif (le bruit ambiant relève les seuils), hystérésis
 * début / fin, petite marge avant la parole (pré-roulement) pour ne pas couper l'attaque de la consonne.
 */
export interface VadOptions {
  sampleRate: number;
  /** durée minimale d'une lecture (ms) : en dessous, c'est un bruit */
  minSpeechMs?: number;
  /** silence qui clôt une lecture (ms) : court pour des syllabes, plus long pour des phrases */
  endSilenceMs?: number;
  /** durée maximale d'une lecture (ms) : au-delà, on coupe */
  maxSegmentMs?: number;
  /** marge conservée avant le début détecté (ms) */
  padMs?: number;
}
export interface VadSegment { start: number; end: number; samples: Float32Array; peak: number }
export type VadEvent = { type: 'start'; t: number } | { type: 'segment'; seg: VadSegment } | { type: 'level'; rms: number; speaking: boolean };

export class VadSegmenter {
  readonly frame: number;
  private o: Required<VadOptions>;
  private noise = 0.004;
  private speaking = false;
  private voiced = 0; // trames voisées consécutives
  private silent = 0;
  private buf: Float32Array[] = [];
  private pre: Float32Array[] = [];
  private startT = 0;
  private t = 0; // temps écoulé (s)
  private pending = new Float32Array(0);
  private peak = 0;

  constructor(opts: VadOptions) {
    this.o = { minSpeechMs: 90, endSilenceMs: 260, maxSegmentMs: 4000, padMs: 100, ...opts };
    this.frame = Math.round(this.o.sampleRate * 0.02);
  }
  set endSilenceMs(ms: number) { this.o.endSilenceMs = ms; }
  get isSpeaking() { return this.speaking; }

  /** Oublie ce qui est en cours (pendant la lecture du modèle, on n'écoute pas). */
  reset() { this.speaking = false; this.voiced = 0; this.silent = 0; this.buf = []; this.pre = []; this.pending = new Float32Array(0); this.peak = 0; }

  /** Ajoute des échantillons ; renvoie les événements produits. */
  push(input: Float32Array): VadEvent[] {
    const ev: VadEvent[] = [];
    const all = new Float32Array(this.pending.length + input.length);
    all.set(this.pending); all.set(input, this.pending.length);
    let i = 0;
    for (; i + this.frame <= all.length; i += this.frame) this.step(all.subarray(i, i + this.frame), ev);
    this.pending = all.slice(i);
    return ev;
  }

  private step(f: Float32Array, ev: VadEvent[]) {
    let e = 0;
    for (let k = 0; k < f.length; k++) e += f[k] * f[k];
    const rms = Math.sqrt(e / f.length);
    const on = Math.max(0.012, this.noise * 3.2), off = Math.max(0.008, this.noise * 2);
    const copy = f.slice();
    this.t += 0.02;
    if (!this.speaking) {
      // plancher de bruit : suit lentement le niveau des trames calmes
      if (rms < on) this.noise = this.noise * 0.97 + rms * 0.03;
      this.pre.push(copy);
      const keep = Math.ceil(this.o.padMs / 20) + 6;
      if (this.pre.length > keep) this.pre.shift();
      if (rms >= on) {
        this.voiced++;
        if (this.voiced * 20 >= this.o.minSpeechMs) {
          this.speaking = true; this.silent = 0; this.peak = rms;
          const padFrames = Math.ceil(this.o.padMs / 20) + this.voiced;
          this.buf = this.pre.slice(-padFrames);
          this.startT = this.t - this.buf.length * 0.02;
          ev.push({ type: 'start', t: this.startT });
        }
      } else this.voiced = 0;
    } else {
      this.buf.push(copy);
      this.peak = Math.max(this.peak, rms);
      this.silent = rms < off ? this.silent + 1 : 0;
      const len = this.buf.length * 20;
      if (this.silent * 20 >= this.o.endSilenceMs || len >= this.o.maxSegmentMs) {
        // on retire la queue silencieuse, sauf une petite marge
        const tail = Math.max(0, this.silent - 4);
        const frames = this.buf.slice(0, this.buf.length - tail);
        const samples = new Float32Array(frames.length * this.frame);
        frames.forEach((fr, k) => samples.set(fr, k * this.frame));
        ev.push({ type: 'segment', seg: { start: this.startT, end: this.t - tail * 0.02, samples, peak: this.peak } });
        this.speaking = false; this.voiced = 0; this.silent = 0; this.buf = []; this.pre = [];
      }
    }
    ev.push({ type: 'level', rms, speaking: this.speaking });
  }
}

/** Ré-échantillonnage simple (moyenne par blocs, puis interpolation) vers 16 kHz. */
export function downsample(input: Float32Array, from: number, to = 16000): Float32Array {
  if (from === to) return input.slice();
  const ratio = from / to;
  const n = Math.floor(input.length / ratio);
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.floor(i * ratio), b = Math.min(input.length, Math.floor((i + 1) * ratio));
    let s = 0; for (let k = a; k < b; k++) s += input[k];
    out[i] = b > a ? s / (b - a) : input[a] ?? 0;
  }
  return out;
}

/** PCM 16 bits little-endian (pour Azure) et fichier WAV (pour se réécouter). */
export function toPcm16(x: Float32Array): Int16Array {
  const out = new Int16Array(x.length);
  for (let i = 0; i < x.length; i++) { const v = Math.max(-1, Math.min(1, x[i])); out[i] = v < 0 ? v * 0x8000 : v * 0x7fff; }
  return out;
}
export function wavBlob(x: Float32Array, sampleRate = 16000): Blob {
  const pcm = toPcm16(x);
  const buf = new ArrayBuffer(44 + pcm.length * 2);
  const v = new DataView(buf);
  const w = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  w(0, 'RIFF'); v.setUint32(4, 36 + pcm.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, pcm.length * 2, true);
  new Int16Array(buf, 44).set(pcm);
  return new Blob([buf], { type: 'audio/wav' });
}
