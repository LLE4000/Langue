/**
 * Lecture à voix haute — répartir ce que la reconnaissance a entendu entre les syllabes lues.
 *
 * La reconnaissance continue rend des morceaux de texte (« ดามานา », « ตา วา ») qui couvrent plusieurs lectures.
 * On cherche le découpage qui ressemble le plus à la suite attendue (programmation dynamique) : chaque élément
 * reçoit sa part (éventuellement vide = non entendu), les caractères parasites peuvent être ignorés.
 */
import { lev } from '../util';
import { normThai } from '../thai/script';

const sim = (a: string, b: string) => (!a || !b ? 0 : a === b ? 1 : 1 - lev(a, b) / Math.max(a.length, b.length));

export function alignHeard(expected: string[], heard: string): string[] {
  const exp = expected.map((e) => normThai(e));
  const h = normThai(heard);
  const k = exp.length, n = h.length;
  if (!k) return [];
  if (!n) return exp.map(() => '');
  const NEG = -1e9;
  // dp[i][j] : meilleur score en ayant traité i éléments et j caractères
  const dp: number[][] = Array.from({ length: k + 1 }, () => new Array(n + 1).fill(NEG));
  const from: [number, number, number][][] = Array.from({ length: k + 1 }, () => new Array(n + 1).fill([0, 0, 0]));
  dp[0][0] = 0;
  for (let i = 0; i <= k; i++) for (let j = 0; j <= n; j++) {
    const cur = dp[i][j];
    if (cur <= NEG) continue;
    // ignorer un caractère parasite (petite pénalité)
    if (j < n && cur - 0.15 > dp[i][j + 1]) { dp[i][j + 1] = cur - 0.15; from[i][j + 1] = [i, j, 0]; }
    if (i === k) continue;
    const maxLen = Math.min(n - j, exp[i].length + 3);
    for (let len = 0; len <= maxLen; len++) {
      const part = h.slice(j, j + len);
      const q = len ? sim(part, exp[i]) : 0;
      const sc = cur + q * q; // au carré : une part entière vaut mieux que deux moitiés
      if (sc > dp[i + 1][j + len]) { dp[i + 1][j + len] = sc; from[i + 1][j + len] = [i, j, 1]; }
    }
  }
  const out = exp.map(() => '');
  let i = k, j = n;
  while (i > 0 || j > 0) {
    const [pi, pj, took] = from[i][j];
    if (took) out[pi] = h.slice(pj, j);
    if (pi === i && pj === j) break;
    i = pi; j = pj;
  }
  return out;
}
