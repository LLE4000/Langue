import { describe, expect, it } from 'vitest';
import { buildGrid, CONS_SETS, GRID_DEFAULT, gridItems, gridQuery, gridVoiceTexts, parseGridQuery, vowelHead } from './grid';

describe('grille de lecture', () => {
  it('consonnes en lignes, voyelles en colonnes, chaque case = consonne de sa ligne + voyelle de sa colonne', () => {
    const g = buildGrid({ ...GRID_DEFAULT, cons: 'high', size: 5 }, 'x');
    expect(g.rows).toHaveLength(5);
    expect(g.cols).toHaveLength(5);
    g.rows.forEach((c) => expect(CONS_SETS.high).toContain(c));
    g.cells.forEach((row, r) => row.forEach((cell, k) => { expect(cell).not.toBeNull(); expect(cell!.parts).toMatchObject({ cons: g.rows[r], vowel: g.cols[k] }); }));
    // classe haute, voyelle longue, sans marque : ton montant partout
    expect(g.cells.flat().every((c) => c!.tone === 'R')).toBe(true);
  });
  it('même graine, même grille ; autre graine, autre tirage', () => {
    const a = buildGrid(GRID_DEFAULT, 'a'), b = buildGrid(GRID_DEFAULT, 'a'), c = buildGrid({ ...GRID_DEFAULT, cons: 'all' }, 'b');
    expect(gridItems(a).map((i) => i.thai)).toEqual(gridItems(b).map((i) => i.thai));
    expect(gridItems(c).map((i) => i.thai)).not.toEqual(gridItems(a).map((i) => i.thai));
  });
  it('ordre au hasard : les mêmes cases, dans un autre ordre', () => {
    const rows = buildGrid({ ...GRID_DEFAULT, order: 'rows' }, 's'), rnd = buildGrid({ ...GRID_DEFAULT, order: 'random' }, 's');
    expect([...gridItems(rnd).map((i) => i.thai)].sort()).toEqual([...gridItems(rows).map((i) => i.thai)].sort());
    expect(gridItems(rnd).map((i) => i.thai)).not.toEqual(gridItems(rows).map((i) => i.thai));
  });
  it('paires courte / longue côte à côte ; finales mortes ; marques', () => {
    const p = buildGrid({ ...GRID_DEFAULT, vowels: 'pairs', size: 4 }, 'p');
    expect(p.cols).toHaveLength(4);
    const d = buildGrid({ ...GRID_DEFAULT, finals: 'dead', cons: 'low' }, 'd');
    expect(d.cells.flat().filter(Boolean).every((c) => ['ก', 'ด', 'บ', ''].includes(c!.parts!.final))).toBe(true);
    expect(d.cells.flat().some((c) => c!.parts!.final)).toBe(true);
    const m = buildGrid({ ...GRID_DEFAULT, marks: true, size: 6 }, 'm');
    expect(m.cells.flat().some((c) => c!.parts!.mark > 0)).toBe(true);
  });
  it('réglages dans l’URL, aller-retour', () => {
    const cfg = { ...GRID_DEFAULT, cons: 'low' as const, marks: true, size: 6 as const, order: 'random' as const };
    expect(parseGridQuery(new URLSearchParams(gridQuery(cfg, 'z')))).toEqual({ cfg, seed: 'z' });
    expect(parseGridQuery(new URLSearchParams('c=bad&n=9')).cfg).toEqual(GRID_DEFAULT);
  });
  it('en-tête de colonne sur son support, textes des voix', () => {
    expect(vowelHead('เ–ะ')).toBe('เ◌ะ');
    const t = gridVoiceTexts();
    expect(t).toContain('กา');
    expect(t.length).toBeGreaterThan(1000);
    expect(t.length).toBeLessThan(5000);
  });
});
