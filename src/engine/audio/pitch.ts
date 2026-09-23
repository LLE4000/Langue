/**
 * Analyse de la hauteur de la voix (F0) dans le navigateur, sans serveur : la seule façon honnête de
 * juger un TON, là où la reconnaissance vocale ne juge que la compréhensibilité.
 *
 *  1. detectPitchTrack : F0 image par image (fenêtres de 40 ms, pas de 10 ms) par autocorrélation
 *     normalisée (NSDF, méthode de McLeod simplifiée), après sous-échantillonnage vers ~16 kHz.
 *  2. toneContour : garde la plus longue portion voisée (la syllabe), convertit en demi-tons autour de la
 *     moyenne (indépendant de la voix grave ou aiguë), lisse, ré-échantillonne en 12 points.
 *  3. classifyTone : compare la forme obtenue aux cinq gabarits de tons thaïs (ajustement d'amplitude
 *     libre, niveau centré) et dit quel ton on a entendu, avec la ressemblance au ton attendu.
 */
import type { ToneId } from '@/content/types';

export interface PitchFrame { t: number; f0: number; clarity: number; rms: number }

export function detectPitchTrack(input: Float32Array, sampleRate: number): PitchFrame[] {
  const factor = Math.max(1, Math.floor(sampleRate / 16000));
  const fs = sampleRate / factor;
  let x = input;
  if (factor > 1) {
    const n = Math.floor(input.length / factor);
    x = new Float32Array(n);
    for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < factor; k++) s += input[i * factor + k]; x[i] = s / factor; }
  }
  const win = Math.round(0.04 * fs), hop = Math.round(0.01 * fs);
  const lagMin = Math.floor(fs / 400), lagMax = Math.ceil(fs / 70);
  const frames: PitchFrame[] = [];
  const nsdf = new Float32Array(lagMax + 2);
  for (let start = 0; start + win + lagMax < x.length; start += hop) {
    let e = 0;
    for (let i = 0; i < win; i++) e += x[start + i] * x[start + i];
    const rms = Math.sqrt(e / win);
    let gmax = 0;
    for (let tau = lagMin; tau <= lagMax; tau++) {
      let acf = 0, m = 0;
      for (let i = 0; i < win; i++) { const a = x[start + i], b = x[start + i + tau]; acf += a * b; m += a * a + b * b; }
      nsdf[tau] = m ? (2 * acf) / m : 0;
      if (nsdf[tau] > gmax) gmax = nsdf[tau];
    }
    // premier pic proche du maximum : évite les erreurs d'octave vers le grave
    let bestLag = 0, best = 0;
    for (let tau = lagMin + 1; tau < lagMax; tau++) {
      if (nsdf[tau] > nsdf[tau - 1] && nsdf[tau] >= nsdf[tau + 1] && nsdf[tau] >= 0.85 * gmax) { bestLag = tau; best = nsdf[tau]; break; }
    }
    let lag = bestLag;
    if (bestLag > lagMin && bestLag < lagMax) {
      const y0 = nsdf[bestLag - 1], y1 = nsdf[bestLag], y2 = nsdf[bestLag + 1];
      const den = 2 * (y0 - 2 * y1 + y2);
      if (den !== 0) { const d = (y0 - y2) / den; if (Number.isFinite(d) && Math.abs(d) < 1) lag = bestLag + d; }
    }
    frames.push({ t: (start + win / 2) / fs, f0: bestLag ? fs / lag : 0, clarity: best, rms });
  }
  return frames;
}

export interface Contour { points: number[]; durationMs: number; meanHz: number }

/** Contour du ton en demi-tons (12 points, niveau moyen à 0) sur la plus longue portion voisée. */
export function toneContour(frames: PitchFrame[], opts: { minClarity?: number; points?: number } = {}): Contour | null {
  const minClarity = opts.minClarity ?? 0.8, N = opts.points ?? 12;
  if (!frames.length) return null;
  const maxRms = Math.max(...frames.map((f) => f.rms), 1e-9);
  const voiced = frames.map((f) => f.f0 > 0 && f.clarity >= minClarity && f.rms >= 0.12 * maxRms);
  // plus longue suite voisée (trous ≤ 2 images tolérés)
  let bs = -1, be = -1, s = -1, e = -1, gap = 0;
  const commit = () => { if (s >= 0 && e - s > be - bs) { bs = s; be = e; } s = -1; e = -1; gap = 0; };
  for (let i = 0; i < frames.length; i++) {
    if (voiced[i]) { if (s < 0) s = i; e = i; gap = 0; }
    else if (s >= 0 && ++gap > 2) commit();
  }
  commit();
  if (bs < 0 || be - bs + 1 < 8) return null;
  const f0 = frames.slice(bs, be + 1).filter((_, k) => voiced[bs + k]).map((f) => f.f0);
  // filtre médian (3) contre les sauts isolés
  const med = f0.map((v, i) => { const w = [f0[i - 1] ?? v, v, f0[i + 1] ?? v].sort((a, b) => a - b); return w[1]; });
  const meanHz = med.reduce((a, b) => a + b, 0) / med.length;
  const st = med.map((v) => 12 * Math.log2(v / meanHz));
  const points: number[] = [];
  for (let k = 0; k < N; k++) {
    const pos = (k / (N - 1)) * (st.length - 1), i = Math.floor(pos), f = pos - i;
    points.push(i + 1 < st.length ? st[i] * (1 - f) + st[i + 1] * f : st[i]);
  }
  return { points, durationMs: (be - bs + 1) * 10, meanHz };
}

/** Gabarits (demi-tons, 12 points) des cinq tons en prononciation isolée. */
export const TONE_PROTOTYPES: Record<ToneId, number[]> = {
  M: [0, 0, 0, 0, 0, -0.1, -0.2, -0.4, -0.6, -0.8, -1.0, -1.2],
  L: [0, -0.3, -0.7, -1.1, -1.5, -1.9, -2.3, -2.7, -3.1, -3.5, -3.9, -4.3],
  F: [0, 0.8, 1.4, 1.8, 1.8, 1.4, 0.6, -0.6, -2.0, -3.6, -5.2, -6.5],
  H: [0, 0.2, 0.4, 0.7, 1.0, 1.4, 1.9, 2.5, 3.2, 4.0, 4.8, 5.5],
  R: [0, -0.6, -1.2, -1.8, -2.4, -2.8, -2.8, -2.2, -1.0, 0.6, 2.4, 4.2],
};
const TONE_IDS: ToneId[] = ['M', 'L', 'F', 'H', 'R'];

const center = (a: number[]) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return a.map((v) => v - m); };

/** Distance d'une forme à un gabarit, l'amplitude du gabarit étant libre (voix plus ou moins expressive). */
function fitDistance(p: number[], proto: number[]): number {
  const a = center(p), q = center(proto);
  let dot = 0, qq = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * q[i]; qq += q[i] * q[i]; }
  const k = Math.max(0.4, Math.min(2.5, qq ? dot / qq : 1));
  let se = 0;
  for (let i = 0; i < a.length; i++) se += (a[i] - k * q[i]) ** 2;
  return Math.sqrt(se / a.length);
}

export interface ToneCheck { predicted: ToneId; expected: ToneId; ok: boolean; similarity: number; distances: Record<ToneId, number>; confidence: number }

export function classifyTone(points: number[], expected: ToneId): ToneCheck {
  const distances = Object.fromEntries(TONE_IDS.map((t) => [t, fitDistance(points, TONE_PROTOTYPES[t])])) as Record<ToneId, number>;
  const sorted = [...TONE_IDS].sort((a, b) => distances[a] - distances[b]);
  const predicted = sorted[0];
  const d = distances[expected];
  const similarity = Math.max(0, Math.min(1, 1 - d / 3));
  const confidence = (distances[sorted[1]] - distances[sorted[0]]) / (distances[sorted[1]] + 1e-6);
  return { predicted, expected, ok: predicted === expected, similarity, distances, confidence };
}

/** Signal de test : une voyelle synthétique dont la hauteur suit un gabarit de ton (pour les tests). */
export function synthesizeTone(tone: ToneId, sampleRate = 16000, baseHz = 130, durationS = 0.45): Float32Array {
  const proto = TONE_PROTOTYPES[tone];
  const pad = Math.round(0.12 * sampleRate), n = Math.round(durationS * sampleRate);
  const out = new Float32Array(pad * 2 + n);
  let phase = 0;
  for (let i = 0; i < n; i++) {
    const pos = (i / (n - 1)) * (proto.length - 1), k = Math.floor(pos), f = pos - k;
    const st = k + 1 < proto.length ? proto[k] * (1 - f) + proto[k + 1] * f : proto[k];
    const hz = baseHz * Math.pow(2, st / 12);
    phase += (2 * Math.PI * hz) / sampleRate;
    const env = Math.min(1, i / (0.03 * sampleRate), (n - i) / (0.05 * sampleRate));
    out[pad + i] = env * (0.6 * Math.sin(phase) + 0.25 * Math.sin(2 * phase) + 0.1 * Math.sin(3 * phase));
  }
  return out;
}
