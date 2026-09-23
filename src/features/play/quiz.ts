/**
 * Questions des jeux à plusieurs (Duel, Tour à tour, Défi à distance) et codage d'un défi dans un lien.
 *
 * Un défi tient dans l'URL : pas de serveur, pas de compte. Chaque élément jouable a un numéro stable
 * (rang dans la liste triée des identifiants) ; le code porte une signature de contenu pour détecter une
 * autre version de l'application.
 */
import { ITEMS, NUM_ITEMS, THEME_BY_ID, type LearnItem } from '@/content/th';
import type { Question } from '@/features/lesson/engine';
import { shuffle, withDistractors } from '@/engine/util';
import type { SrsState } from '@/engine/srs';

export type PlayKind = 'meaning' | 'toThai';
export interface PlayQuestion { kind: PlayKind; itemId: string; choiceIds: string[] } // choiceIds dans l'ordre d'affichage (contient itemId)
export type SourceKind = 'known' | 'theme' | 'numbers';
export interface PlaySource { kind: SourceKind; theme?: string }
export interface PlayResult { name: string; score: number; total: number; secs: number }

const playable = (it: LearnItem | undefined): it is LearnItem => !!it && (it.kind === 'word' || it.kind === 'num' || it.kind === 'clf' || it.kind === 'tone') && !/…/.test(it.thai) && !!it.meaning.fr;
export const meaningOf = (it: LearnItem) => it.meaning.fr;

/** Éléments disponibles pour une source donnée. */
export function poolFor(src: PlaySource, srs: Record<string, SrsState>): LearnItem[] {
  if (src.kind === 'numbers') return NUM_ITEMS;
  if (src.kind === 'theme') { const t = src.theme ? THEME_BY_ID[src.theme] : null; return t ? t.items.map((w) => ITEMS[w.id]).filter(playable) : []; }
  return Object.keys(srs).map((id) => ITEMS[id]).filter(playable);
}

/** Source par défaut : ce que je connais si c'est assez fourni, sinon le thème Salutations. */
export const defaultSource = (srs: Record<string, SrsState>): PlaySource => (poolFor({ kind: 'known' }, srs).length >= 8 ? { kind: 'known' } : { kind: 'theme', theme: 'sal' });

export function sourceLabel(src: PlaySource, srs: Record<string, SrsState>): string {
  if (src.kind === 'numbers') return 'Les nombres';
  if (src.kind === 'theme') return THEME_BY_ID[src.theme ?? '']?.name.fr ?? 'Thème';
  return `Ce que je connais (${poolFor(src, srs).length})`;
}

/** Tire n questions (sens ↔ thaï en alternance) dans un pool d'au moins 4 éléments. */
export function buildPlayQuestions(pool: LearnItem[], n: number): PlayQuestion[] {
  const items = pool.filter(playable);
  if (items.length < 4) return [];
  const picks = shuffle(items);
  const out: PlayQuestion[] = [];
  for (let k = 0; out.length < n && k < n * 3; k++) {
    const it = picks[k % picks.length];
    const kind: PlayKind = Math.floor(k / picks.length) % 2 === 0 ? (k % 2 ? 'toThai' : 'meaning') : (k % 2 ? 'meaning' : 'toThai');
    const same = items.filter((x) => x.id !== it.id && x.kind === it.kind);
    const wrongs = withDistractors(same.length >= 3 ? same : items.filter((x) => x.id !== it.id), it, 3, (x) => (kind === 'meaning' ? meaningOf(x) : x.thai));
    if (wrongs.length < 3) continue;
    out.push({ kind, itemId: it.id, choiceIds: shuffle([it.id, ...wrongs.map((w) => w.id)]) });
  }
  return out;
}

/** Question du moteur de leçon (affichable par QuestionsStep) à partir d'une question de jeu. */
export function toQuestion(q: PlayQuestion, i: number): Question {
  const it = ITEMS[q.itemId];
  const choices = q.choiceIds.map((id) => { const c = ITEMS[id]; return q.kind === 'meaning' ? { text: meaningOf(c), ok: id === q.itemId } : { thai: c.thai, rom: c.rom, ok: id === q.itemId }; });
  if (q.kind === 'meaning') return { id: 'play' + i, itemId: it.id, kind: 'meaning', prompt: { fr: 'Que veut dire…' }, stage: { thai: it.thai, rom: it.rom, big: true, showRom: true }, say: it.say, choices };
  return { id: 'play' + i, itemId: it.id, kind: 'toThai', prompt: { fr: 'Comment dit-on…' }, stage: { text: meaningOf(it) }, choices, sayAfter: it.say, reveal: { thai: it.thai, rom: it.rom } };
}

// ------------------------------------------------------------------------------------------------
// Défi à distance : codage dans un lien
// ------------------------------------------------------------------------------------------------

export const CHALLENGE_IDS: string[] = Object.keys(ITEMS).filter((id) => playable(ITEMS[id])).sort();
const INDEX = new Map(CHALLENGE_IDS.map((id, i) => [id, i]));
const SIGNATURE = CHALLENGE_IDS.length.toString(36);
const VERSION = '1';

export interface Challenge { id: string; questions: PlayQuestion[]; from: PlayResult | null; to: PlayResult | null }

const hash = (s: string) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };
const encRes = (r: PlayResult | null) => (r ? [encodeURIComponent(r.name), r.score, r.total, Math.round(r.secs)].join('|') : '');
const decRes = (s: string): PlayResult | null => {
  if (!s) return null;
  const [name, score, total, secs] = s.split('|');
  const n = (x: string) => Number(x);
  if (!name || !Number.isFinite(n(score)) || !Number.isFinite(n(total)) || !Number.isFinite(n(secs))) return null;
  return { name: decodeURIComponent(name), score: n(score), total: n(total), secs: n(secs) };
};

export function encodeChallenge(questions: PlayQuestion[], from: PlayResult | null, to: PlayResult | null): string {
  const body = questions.map((q) => (q.kind === 'meaning' ? 'm' : 't') + q.choiceIds.indexOf(q.itemId) + ':' + q.choiceIds.map((id) => INDEX.get(id)!.toString(36)).join(',')).join(';');
  return [VERSION + SIGNATURE, body, encRes(from), encRes(to)].join('~');
}

export function decodeChallenge(code: string): Challenge | { error: string } {
  const parts = code.split('~');
  if (parts.length < 2) return { error: 'Ce code n’est pas un défi.' };
  const [head, body, fromS = '', toS = ''] = parts;
  if (head[0] !== VERSION) return { error: 'Ce défi vient d’une autre version de l’application.' };
  if (head.slice(1) !== SIGNATURE) return { error: 'Ce défi a été créé avec une autre version du contenu : mettez l’application à jour des deux côtés.' };
  const questions: PlayQuestion[] = [];
  for (const q of body.split(';')) {
    const m = /^([mt])(\d):([0-9a-z,]+)$/.exec(q);
    if (!m) return { error: 'Code de défi illisible.' };
    const ids = m[3].split(',').map((x) => CHALLENGE_IDS[parseInt(x, 36)]);
    const ok = +m[2];
    if (ids.length < 2 || ids.some((x) => !x) || !ids[ok]) return { error: 'Code de défi illisible.' };
    questions.push({ kind: m[1] === 'm' ? 'meaning' : 'toThai', itemId: ids[ok], choiceIds: ids });
  }
  if (!questions.length) return { error: 'Ce défi ne contient aucune question.' };
  return { id: hash(body), questions, from: decRes(fromS), to: decRes(toS) };
}

export const challengeUrl = (code: string) => `${location.origin}${location.pathname}#/play/defi/${code}`;

export const fmtSecs = (s: number) => `${Math.round(s)} s`;

/** Partage natif, sinon copie dans le presse-papiers. Renvoie « copié » si on est passé par le presse-papiers. */
export async function shareText(text: string, url?: string): Promise<'shared' | 'copied' | 'failed'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) { try { await nav.share(url ? { text, url } : { text }); return 'shared'; } catch { /* annulé : on tente la copie */ } }
  try { await navigator.clipboard.writeText(url ? `${text}\n${url}` : text); return 'copied'; } catch { return 'failed'; }
}
