import { describe, expect, it } from 'vitest';
import { buildCurriculum } from './th-fr';
import { lessonCard, vowelGlyph } from './card';

const THAI = /[฀-๿]/;

describe('cartes de leçon', () => {
  const cards = buildCurriculum().lessons.map((l) => ({ id: l.id, c: lessonCard(l) }));

  it('titre court, sous-titre et indicateur pour chaque leçon', () => {
    for (const { id, c } of cards) {
      expect(c.title.length, id).toBeGreaterThan(2);
      expect(c.title.length, `${id} : « ${c.title} » tient sur une ligne`).toBeLessThanOrEqual(30);
      expect(c.sub, id).not.toBe('');
      expect(c.count, id).toMatch(/^\d/);
    }
  });

  it('aucune suite de signes thaïs dans les textes de la carte (le thaï vit dans le badge)', () => {
    for (const { id, c } of cards) for (const text of [c.title, c.sub, c.count, ...c.extras]) expect(THAI.test(text), `${id} : ${text}`).toBe(false);
  });

  it('un badge par leçon : un glyphe court ou une icône', () => {
    for (const { id, c } of cards) {
      expect(!!(c.badge.glyph || c.badge.icon), id).toBe(true);
      if (c.badge.glyph) expect([...c.badge.glyph].length, id).toBeLessThanOrEqual(4);
    }
  });

  it('types attendus sur les premières leçons', () => {
    const kind = (id: string) => cards.find((x) => x.id === id)!.c;
    expect(kind('read-01')).toMatchObject({ kind: 'letters', label: 'Alphabet', count: '5 consonnes + 1 voyelle', badge: { glyph: 'ก' } });
    expect(kind('read-02')).toMatchObject({ kind: 'vowels', count: '3 voyelles + 3 consonnes' });
    expect(kind('talk-sal-1')).toMatchObject({ kind: 'vocab', title: 'Salutations', part: '1/2' });
    expect(kind('talk-pres-2').kind).toBe('dialog');
    expect(kind('num-01')).toMatchObject({ kind: 'numbers', count: '11 nombres' });
    expect(vowelGlyph('v:เ–ีย')).toBe('เอีย');
  });
});
