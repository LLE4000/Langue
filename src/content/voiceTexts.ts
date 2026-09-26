/**
 * Tous les textes thaïs que l'application fait lire : c'est la liste à synthétiser une fois pour toutes
 * avec des voix natives (scripts/gen-voices.ts). Les jetons de politesse sont résolus pour un homme ET pour
 * une femme (deux variantes), les textes avec un prénom {N} sont laissés à la voix de l'appareil.
 */
import { ITEMS, th, sentenceThai } from './th';
import { TONES } from './th/tones';
import { speakable, hasTokens } from '@/engine/tokens';
import { normalizeClipText } from '@/engine/audio/clipKey';

export const SAMPLE_SENTENCE = 'สวัสดี{P} ยินดีที่ได้รู้จัก';
export const TONE_TONGUE_TWISTER = 'ไม้ใหม่ไม่ไหม้ไหม';

export function collectVoiceTexts(): string[] {
  const raw = new Set<string>();
  const add = (s?: string) => { if (s && /[฀-๿]/.test(s)) raw.add(s); };
  for (const it of Object.values(ITEMS)) {
    add(it.say);
    if (it.kind === 'cons') add(it.ref.audioBase + 'อ');
    if (it.kind === 'vow') { add('สระ' + it.say); add(it.ref.example?.thai); }
    if (it.kind === 'word') add(it.ref.example?.thai);
    if (it.kind === 'clf') add(it.ref.example.thai);
  }
  for (const d of th.DIALOGS) for (const l of d.lines) add(l.thai);
  for (const r of th.READINGS) for (const s of r.sentences) { add(sentenceThai(s.tokens)); for (const t of s.tokens) add(t.thai); }
  for (const g of th.GRAMMAR) for (const e of g.examples) add(e.thai);
  for (const t of TONES) add(t.example.thai);
  for (const p of th.CLF_PATTERNS) add(p.thai);
  add(SAMPLE_SENTENCE); add(TONE_TONGUE_TWISTER);
  const out = new Set<string>();
  for (const s of raw) {
    if (/\{N\}/.test(s)) continue; // dépend du prénom : voix de l'appareil
    if (hasTokens(s) || /\{[^{}|]*\|[^{}|]*\}/.test(s)) { out.add(normalizeClipText(speakable(s, { gender: 'm', name: '' }))); out.add(normalizeClipText(speakable(s, { gender: 'f', name: '' }))); }
    else out.add(normalizeClipText(s));
  }
  return [...out].filter(Boolean).sort();
}

export const voiceCharacterCount = (texts: string[]) => texts.reduce((a, t) => a + t.length, 0);
