import { describe, expect, it } from 'vitest';
import { LONG_DIALOGS } from './th/longDialogs';

const RAW_POLITE = /(ครับ|ค่ะ|คะ|ผม|ดิฉัน|ฉัน)/;
const LINES: Record<string, [number, number]> = { A1: [14, 20], A2: [18, 26], B1: [22, 30] };

describe('écoute longue : contenu', () => {
  it('chaque conversation est complète et cohérente', () => {
    const ids = new Set<string>();
    for (const d of LONG_DIALOGS) {
      expect(ids.has(d.id), d.id).toBe(false); ids.add(d.id);
      expect(d.level, d.id).toBeDefined();
      const [lo, hi] = LINES[d.level!];
      expect(d.lines.length, `${d.id} : ${d.lines.length} répliques`).toBeGreaterThanOrEqual(lo);
      expect(d.lines.length, `${d.id} : ${d.lines.length} répliques`).toBeLessThanOrEqual(hi);
      for (const l of d.lines) {
        expect(l.thai && l.rom && l.tr.fr, `${d.id} : réplique incomplète`).toBeTruthy();
        // l'apprenant : jetons de politesse, jamais de particule ou de pronom en dur
        if (l.who === 'me') expect(RAW_POLITE.test(l.thai.replace(/\{[^}]*\}/g, '')), `${d.id} : ${l.thai}`).toBe(false);
        expect(/[{]/.test(l.thai) === /[{]/.test(l.rom) || l.who === 'other', `${d.id} : jetons thaï/phonétique`).toBe(true);
      }
      expect(d.questions?.length ?? 0, d.id).toBeGreaterThanOrEqual(5);
      for (const q of d.questions ?? []) {
        expect(q.choices.length, `${d.id} : ${q.q.fr}`).toBe(4);
        expect(q.answer).toBeGreaterThanOrEqual(0); expect(q.answer).toBeLessThan(4);
        if (q.lang === 'mixed' || q.lang === 'th') expect(q.choicesTh?.length, `${d.id} : ${q.q.fr}`).toBe(4);
        if (q.lang === 'th') expect(q.qTh, `${d.id} : ${q.q.fr}`).toBeTruthy();
      }
    }
  });
});
