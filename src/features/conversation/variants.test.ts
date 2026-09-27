import { describe, expect, it } from 'vitest';
import { DIALOG_BY_ID, th } from '@/content/th';
import { resolveTokens } from '@/engine/tokens';
import { judgeReply } from '@/engine/conversation';
import { REPLY_VARIANTS } from './variants';
import { acceptedReplies } from './Talk';

const tok = { gender: 'm' as const, name: '' };

describe('conversation parlée : variantes acceptées', () => {
  it('chaque variante vise une réplique « Vous » existante, en thaï, avec sa phonétique', () => {
    for (const [id, byLine] of Object.entries(REPLY_VARIANTS)) {
      const d = DIALOG_BY_ID[id];
      expect(d, id).toBeDefined();
      for (const [i, reps] of Object.entries(byLine)) {
        expect(d.lines[+i]?.who, `${id} #${i}`).toBe('me');
        for (const r of reps) {
          expect(/[฀-๿]/.test(r.thai), r.thai).toBe(true);
          expect(r.rom.trim().length, r.thai).toBeGreaterThan(0);
          expect(/[฀-๿]/.test(r.rom), r.rom).toBe(false);
          // les jetons de politesse vont par paires : {P} en thaï ↔ {p} en phonétique
          expect((r.thai.match(/\{[PQI]\}/g) ?? []).length, r.thai).toBe((r.rom.match(/\{[pqi]\}/g) ?? []).length);
        }
      }
    }
  });
  it('presque toutes les répliques « Vous » ont au moins une autre formulation', () => {
    let mine = 0, covered = 0;
    for (const d of th.DIALOGS) d.lines.forEach((l, i) => { if (l.who === 'me') { mine++; if (REPLY_VARIANTS[d.id]?.[i]?.length) covered++; } });
    expect(covered / mine).toBeGreaterThan(0.8);
  });
  it('une variante dite telle quelle est comprise', () => {
    const d = DIALOG_BY_ID['d:market'];
    const acc = acceptedReplies(d, 0, tok);
    expect(acc.length).toBeGreaterThan(1);
    expect(judgeReply([resolveTokens(REPLY_VARIANTS['d:market'][0][1].thai, tok)], acc).verdict).toBe('ok');
  });
});
