import { TONE_BY_ID } from '@/content/th';
import type { ToneId } from '@/content/types';

/** Courbe d'un ton (SVG). */
export function ToneCurve({ tone, className = 'tsvg' }: { tone: ToneId; className?: string }) {
  const t = TONE_BY_ID[tone];
  return <svg className={className} viewBox="0 0 100 64" aria-hidden="true"><path d={t.path} stroke={t.color} /></svg>;
}
