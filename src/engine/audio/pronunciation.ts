/**
 * Contrôle de prononciation par la reconnaissance vocale.
 *
 * Principe honnête : le moteur th-TH de l'appareil transcrit ce qu'il entend. Si la transcription correspond
 * au mot visé, la prononciation est compréhensible ; sinon on montre ce qui a été compris, mot par mot, et
 * on tente d'expliquer l'écart (ton, longueur de voyelle, mot manquant). Ce n'est pas une mesure phonétique
 * de l'accent, mais c'est exactement le test qu'un Thaï ferait : est-ce que je comprends ?
 */
import { lev } from '../util';
import { normThai } from '../thai/script';

export interface TargetWord { t: string; r: string }
export interface WordCheck extends TargetWord { ok: boolean; near: boolean }
export interface PronResult {
  score: number; // 0–10
  sim: number; // 0–1
  heard: string; // meilleure alternative
  alts: string[];
  words: WordCheck[];
  verdict: 'ok' | 'near' | 'ko';
  hints: string[];
  confidence?: number;
}

const POLITE_END = /(ครับ|คับ|ค่ะ|คะ|ค่า)$/;
const TONE_MARKS = /[่-๋]/g; // ่ ้ ๊ ๋
const norm = (s: string) => normThai(s).replace(/\s+/g, '');
const forms = (x: string) => { const n = norm(x), b = n.replace(POLITE_END, ''); return b && b !== n ? [n, b] : [n]; };
const similarity = (a: string, b: string) => (!a || !b ? 0 : a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));
/** Voyelles longues ramenées à leur forme courte, pour repérer une erreur de longueur seule. */
const shorten = (s: string) => s.replace(/า/g, 'ะ').replace(/ี/g, 'ิ').replace(/ื/g, 'ึ').replace(/ู/g, 'ุ').replace(/แ/g, 'เ').replace(/ๆ/g, '');

/** Meilleure ressemblance entre un mot et n'importe quelle fenêtre du texte entendu. */
function bestWindow(word: string, heard: string): number {
  if (!word || !heard) return 0;
  if (heard.includes(word)) return 1;
  let best = 0;
  for (const len of [word.length - 1, word.length, word.length + 1]) {
    if (len <= 0) continue;
    for (let i = 0; i + len <= heard.length; i++) best = Math.max(best, similarity(word, heard.slice(i, i + len)));
  }
  return best;
}

/**
 * Sévérité : indulgente = la meilleure des hypothèses du moteur compte (il « devine » pour vous) ;
 * normale = seule sa première hypothèse compte ; stricte = idem, et rien d'approximatif n'est accepté
 * (au mieux 7/10 sans correspondance exacte).
 */
export type Strictness = 'lenient' | 'normal' | 'strict';

/**
 * Note 0–10. `confidence` (0–1) est la certitude du moteur sur sa première hypothèse quand le navigateur la donne :
 * un mot « compris » avec peu de certitude ne vaut pas 10. En modes normal et strict, une erreur qui ne porte que sur
 * un ton ou une longueur de voyelle plafonne la note : en thaï, c'est un autre mot, même si l'écriture n'en diffère
 * que d'un signe (une comparaison caractère par caractère ne le verrait presque pas).
 */
export function scorePronunciation(alts: string[], targets: string[], words: TargetWord[] = [], strictness: Strictness = 'normal', confidence?: number): PronResult {
  const cands = strictness === 'lenient' ? alts : alts.slice(0, 1);
  let sim = 0, heard = alts[0] ?? '', bestTarget = targets[0] ?? '';
  for (const a of cands) for (const t of targets) for (const na of forms(a)) for (const nt of forms(t)) {
    const s = similarity(na, nt);
    if (s > sim) { sim = s; heard = a; bestTarget = t; }
  }
  const heardN = norm(heard);
  const nearMin = strictness === 'strict' ? 0.85 : 0.7;
  const ws: WordCheck[] = (words.length ? words : [{ t: bestTarget, r: '' }]).filter((w) => w.t && !/[{…]/.test(w.t)).map((w) => {
    const wn = norm(w.t);
    const optional = POLITE_END.test(wn) && wn.replace(POLITE_END, '') === '';
    const s = optional && !heardN ? 1 : bestWindow(wn, heardN);
    return { ...w, ok: s >= 0.999 || (optional && s < 0.5 && sim >= 0.999), near: s >= nearMin && s < 0.999 };
  });
  const okWords = ws.filter((w) => w.ok).length;
  const nearWeight = strictness === 'strict' ? 0.25 : 0.5;
  const wordScore = ws.length ? (okWords + nearWeight * ws.filter((w) => w.near).length) / ws.length : sim;
  let raw = sim >= 0.999 ? 10 : strictness === 'strict' ? Math.min(7, Math.round(8 * (0.5 * sim + 0.5 * wordScore))) : Math.round(10 * (0.6 * sim + 0.4 * wordScore));

  const tN = forms(bestTarget)[forms(bestTarget).length - 1] ?? '';
  const hN = heardN.replace(POLITE_END, '');
  const toneOnly = !!hN && sim < 0.999 && hN.replace(TONE_MARKS, '') === tN.replace(TONE_MARKS, '');
  const lengthOnly = !toneOnly && !!hN && sim < 0.999 && shorten(hN.replace(TONE_MARKS, '')) === shorten(tN.replace(TONE_MARKS, ''));
  const hints: string[] = [];
  if (strictness !== 'lenient') {
    // Un ton ou une longueur de voyelle faux = un autre mot : jamais « presque compris » à 8.
    if (toneOnly || lengthOnly) raw = Math.min(raw, strictness === 'strict' ? 4 : 5);
    // Le moteur lui-même n'était pas sûr : on ne valide pas sur un doute.
    if (typeof confidence === 'number') {
      if (confidence < 0.5) { raw = Math.min(raw, 6); hints.push('Le moteur a hésité pour comprendre : articulez davantage, plus près du micro.'); }
      else if (confidence < (strictness === 'strict' ? 0.85 : 0.75)) { raw = Math.min(raw, 8); hints.push('Compris, mais sans certitude : le moteur n’était pas sûr de ce qu’il entendait.'); }
    }
  }
  const score = Math.max(0, Math.min(10, alts.length ? raw : 0));
  const verdict: PronResult['verdict'] = score >= 9 ? 'ok' : score >= 6 ? 'near' : 'ko';

  if (verdict !== 'ok' && hN) {
    if (toneOnly) hints.unshift('Les sons sont justes, mais le ton entendu est un autre : en thaï c’est un autre mot. Réécoutez le modèle et exagérez la courbe du ton.');
    else if (lengthOnly) hints.unshift('Le moteur a entendu une autre longueur de voyelle : en thaï, une voyelle longue se tient vraiment deux fois plus longtemps.');
    else if (ws.length > 1 && okWords > 0 && okWords < ws.length) hints.push(`${ws.length - okWords} mot${ws.length - okWords > 1 ? 's' : ''} sur ${ws.length} n’${ws.length - okWords > 1 ? 'ont' : 'a'} pas été reconnu${ws.length - okWords > 1 ? 's' : ''} : reprenez-les un par un, puis la phrase entière.`);
    else if (sim < 0.4) hints.push('Le moteur a compris tout autre chose. Parlez plus près du micro, un peu plus lentement, en séparant les syllabes.');
  }
  if (verdict === 'near' && !hints.length) hints.push('Presque : le moteur hésite. Répétez en articulant les consonnes finales.');
  return { score, sim, heard, alts, words: ws, verdict, hints, confidence };
}

/** Note lissée sur les dernières tentatives (pour l'affichage « meilleur / dernier »). */
export interface PronStat { best: number; last: number; n: number; t: number }
export const updatePronStat = (prev: PronStat | undefined, score: number): PronStat => ({ best: Math.max(prev?.best ?? 0, score), last: score, n: (prev?.n ?? 0) + 1, t: Date.now() });
