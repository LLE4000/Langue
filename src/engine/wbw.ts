/**
 * Mot à mot : découper une phrase thaïe (écrite sans espaces) en mots.
 * Le découpage s'appuie sur un lexique ET sur la transcription de la phrase : un mot n'est retenu que si
 * ses syllabes transcrites sont exactement celles de la phrase à cet endroit. Ce que le lexique ne connaît
 * pas reste groupé, sans traduction inventée.
 */
import { sylsOf } from './thai/transcription';

export interface LexEntry { k: string; syl: string[]; fr: string; pr: number }
export type Lexicon = Map<string, LexEntry[]>;

export function buildLexicon(sources: { thai: string; rom: string; fr: string; priority: number }[]): Lexicon {
  const L: Lexicon = new Map();
  for (const s of sources) {
    const t = String(s.thai).normalize('NFC');
    if (!t || /[\s{.…]/.test(t) || /[{]/.test(s.rom)) continue;
    const syl = sylsOf(s.rom);
    if (!syl.length) continue;
    const k = syl.join(' ');
    let a = L.get(t);
    if (!a) L.set(t, (a = []));
    const ex = a.find((x) => x.k === k);
    if (ex) { if (s.priority > ex.pr) { ex.fr = s.fr; ex.pr = s.priority; } }
    else a.push({ k, syl, fr: s.fr, pr: s.priority });
  }
  return L;
}

export interface Segment { t: string; r: string; fr: string | null }

/** Renvoie les segments (mot thaï, transcription, sens ou null si inconnu), ou null si impossible. */
export function wbwSplit(thaiResolved: string, romResolved: string, L: Lexicon): Segment[] | null {
  const T = thaiResolved.normalize('NFC').replace(/\.\.\./g, '…').replace(/\s+/g, ''), R = sylsOf(romResolved), n = T.length, m = R.length;
  if (!n || !m || n > 90) return null;
  const NEG = -1e9;
  const best = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(NEG));
  const from = Array.from({ length: n + 1 }, () => new Array<{ i: number; j: number; fr: string | null } | null>(m + 1).fill(null));
  const okCut = (i: number) => i >= n || (!/[ะ-ฺๅ็-๎]/.test(T[i]) && !/[เแโใไ]/.test(T[i - 1] || ''));
  const eq = (j: number, syl: string[]) => { for (let k = 0; k < syl.length; k++) if (R[j + k] !== syl[k]) return false; return true; };
  const relax = (i: number, j: number, i2: number, j2: number, sc: number, fr: string | null) => { if (best[i][j] + sc > best[i2][j2]) { best[i2][j2] = best[i][j] + sc; from[i2][j2] = { i, j, fr }; } };
  best[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    if (best[i][j] === NEG || (i === n && j === m)) continue;
    if (i < n && j < m) {
      if (T[i] === '…' && R[j] === '…') relax(i, j, i + 1, j + 1, 5, '…');
      if (T[i] === 'ๆ') for (let k = 1; k <= 3; k++) if (j - k >= 0 && j + k <= m && eq(j, R.slice(j - k, j))) relax(i, j, i + 1, j + k, 8, '(répété)');
      for (let len = 1; len <= Math.min(n - i, 26); len++) {
        const c = L.get(T.substr(i, len));
        if (!c) continue;
        for (const w of c) if (j + w.syl.length <= m && eq(j, w.syl)) relax(i, j, i + len, j + w.syl.length, 10 * len - 1, w.fr);
      }
      for (let i2 = i + 1; i2 <= n; i2++) {
        if (!okCut(i2)) continue;
        for (let j2 = j + 1; j2 <= m; j2++) { const c = i2 - i, s = j2 - j; if (c < s || c > 9 * s) continue; relax(i, j, i2, j2, -6 - c, null); }
      }
    }
  }
  if (best[n][m] === NEG) return null;
  const out: Segment[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) { const f = from[i][j]; if (!f) return null; out.unshift({ t: T.slice(f.i, i), r: R.slice(f.j, j).join('-'), fr: f.fr }); i = f.i; j = f.j; }
  // Prudence : un mot connu d'une seule syllabe collé à un fragment inconnu très court signale presque
  // toujours un mot plus long absent du lexique → on regroupe le tout, sans traduction.
  const one = (s?: Segment) => !!s && s.fr != null && !/-/.test(s.r) && s.fr !== '…', unk = (s?: Segment) => !!s && s.fr == null, tiny = (s?: Segment) => unk(s) && s!.t.length <= 2;
  for (let k = 0; k < out.length; k++) if (one(out[k]) && ((unk(out[k - 1]) && unk(out[k + 1])) || tiny(out[k - 1]) || tiny(out[k + 1]))) out[k].fr = null;
  const res: Segment[] = [];
  for (const s of out) { const p = res[res.length - 1]; if (p && p.fr == null && s.fr == null) { p.t += s.t; p.r += '-' + s.r; } else res.push({ ...s }); }
  return res;
}
