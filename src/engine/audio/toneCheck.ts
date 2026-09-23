/** Vérification du ton à partir d'un enregistrement (décodage audio du navigateur + analyse de hauteur). */
import type { ToneId } from '@/content/types';
import { classifyTone, detectPitchTrack, toneContour, type ToneCheck } from './pitch';

export interface ToneCheckResult extends ToneCheck { points: number[]; durationMs: number }

export async function analyzeToneFromBlob(blob: Blob, expected: ToneId): Promise<ToneCheckResult | { error: string }> {
  const Ctor = (globalThis as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext ?? (globalThis as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return { error: 'L’analyse audio n’est pas disponible sur ce navigateur.' };
  const ac = new Ctor();
  try {
    const buf = await ac.decodeAudioData(await blob.arrayBuffer());
    const track = detectPitchTrack(buf.getChannelData(0), buf.sampleRate);
    const contour = toneContour(track);
    if (!contour) return { error: 'Pas assez de voix nette : dites la syllabe seule, un peu plus longuement, dans un endroit calme.' };
    return { ...classifyTone(contour.points, expected), points: contour.points, durationMs: contour.durationMs };
  } catch {
    return { error: 'Enregistrement illisible, réessayez.' };
  } finally {
    try { await ac.close(); } catch { /* déjà fermé */ }
  }
}
