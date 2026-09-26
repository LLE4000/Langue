/**
 * Compréhension orale : construction du questionnaire d'un dialogue.
 *  - questions rédigées (content/th/dialogQuestions.ts), propositions mélangées ;
 *  - complétées par des questions générées depuis les répliques : « que répond X à … ? », « qui dit … ? ».
 */
import type { Dialog, DialogLine } from '@/content/types';
import { L } from '@/i18n';

export interface CQuestion {
  q: string; choices: string[]; answer: number; kind: 'authored' | 'reply' | 'who';
  /** écoute longue : langue de la question, version thaïe de la question et des propositions */
  lang?: 'fr' | 'mixed' | 'th'; qTh?: string; choicesTh?: string[];
}

function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }
function shuffle<T>(a: T[], r: () => number): T[] { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; }
const clean = (s: string) => s.replace(/\s*\(.*?\)\s*/g, ' ').replace(/\{n\}/g, '…').replace(/\s+/g, ' ').trim();

/** Mélange les propositions d'une question en gardant l'index de la bonne réponse. */
export function shuffleChoices(q: CQuestion, r: () => number): CQuestion {
  const idx = shuffle(q.choices.map((_, k) => k), r);
  return { ...q, choices: idx.map((k) => q.choices[k]), choicesTh: q.choicesTh ? idx.map((k) => q.choicesTh![k]) : undefined, answer: idx.indexOf(q.answer) };
}

/** Questions « que répond … ? » : la bonne réponse est la réplique suivante, les leurres d'autres répliques du même locuteur. */
export function replyQuestions(d: Dialog, other: string): CQuestion[] {
  const out: CQuestion[] = [];
  const byWho = (w: DialogLine['who']) => d.lines.filter((l) => l.who === w);
  for (let i = 0; i + 1 < d.lines.length; i++) {
    const a = d.lines[i], b = d.lines[i + 1];
    if (a.who === b.who) continue;
    const pool = byWho(b.who).map((l) => clean(L(l.tr))).filter((t) => t && t !== clean(L(b.tr)));
    const distinct = [...new Set(pool)];
    if (distinct.length < 2) continue;
    const speaker = b.who === 'me' ? 'Vous' : other;
    const asker = a.who === 'me' ? 'vous' : other.toLowerCase();
    out.push({ q: `Que répond ${speaker} quand ${asker} ${a.who === 'me' ? 'dites' : 'dit'} : « ${clean(L(a.tr))} » ?`, choices: [clean(L(b.tr)), ...distinct.slice(0, 3)], answer: 0, kind: 'reply' });
  }
  return out;
}

/** Question « qui dit … ? » sur une réplique bien identifiable. */
export function whoQuestions(d: Dialog, other: string): CQuestion[] {
  return d.lines.filter((l) => clean(L(l.tr)).length >= 18).map((l) => ({ q: `Qui dit : « ${clean(L(l.tr))} » ?`, choices: ['Vous', other], answer: l.who === 'me' ? 0 : 1, kind: 'who' as const }));
}

/** Le questionnaire : toutes les questions rédigées, puis des questions générées jusqu'à `total`. */
export function buildComprehensionQuiz(d: Dialog, seed = Date.now(), total = 5): CQuestion[] {
  const r = rng(seed);
  const other = L(d.other);
  const authored: CQuestion[] = (d.questions ?? []).map((q) => ({ q: L(q.q), choices: q.choices.map((c) => L(c)), answer: q.answer, kind: 'authored' as const, lang: q.lang, qTh: q.qTh, choicesTh: q.choicesTh }));
  // écoute longue : seulement les questions rédigées, dans l'ordre de la conversation
  if (d.level) return authored.map((q) => shuffleChoices(q, r));
  const generated = shuffle([...shuffle(replyQuestions(d, other), r).slice(0, 2), ...shuffle(whoQuestions(d, other), r).slice(0, 1)], r);
  const picked = [...authored, ...generated].slice(0, Math.max(total, authored.length));
  return picked.map((q) => shuffleChoices(q, r));
}

/** Durée approximative d'écoute (pour l'affichage), à ~4 caractères thaïs par seconde plus une pause par réplique. */
export const dialogSeconds = (d: Dialog) => Math.round(d.lines.reduce((a, l) => a + l.thai.replace(/\{[^}]*\}/g, 'xx').length / 4 + 0.6, 0));
