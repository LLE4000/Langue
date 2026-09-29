import { describe, expect, it } from 'vitest';
import { advisedSection, withWhom } from '@/components/DialogList';
import { buildTraining, favoriteItems } from '@/features/review/training';
import { NUM_ITEMS, CLF_ITEMS } from '@/content/th';
import type { Ctx } from '@/features/lesson/engine';

const d = (fr: string, other = 'ค่ะ') => ({ other: { fr }, lines: [{ who: 'other' as const, thai: other, rom: '', tr: { fr: '' } }] });
const ctx: Ctx = { known: new Set<string>(), srs: {}, levels: { listening: 0, speaking: 0, reading: 0, writing: 0 }, knownOrally: false, seen: {}, micAvailable: false };

describe('listes de conversations', () => {
  it('nomme l’interlocuteur avec son article', () => {
    expect(withWhom(d('Serveuse'))).toBe('avec la serveuse');
    expect(withWhom(d('Chauffeur de taxi', 'ครับ'))).toBe('avec le chauffeur de taxi');
    expect(withWhom(d('Vendeur', 'ครับ'))).toBe('avec le vendeur');
    expect(withWhom(d('Ami', 'ครับ'))).toBe('avec un ami');
    expect(withWhom(d('Amie thaïe'))).toBe('avec une amie thaïe');
    expect(withWhom(d('Architecte'))).toBe('avec l’architecte');
    expect(withWhom(d('Collègue'))).toBe('avec une collègue');
    expect(withWhom(d('Collègue', 'ครับ'))).toBe('avec un collègue');
    expect(withWhom(d('Réception'))).toBe('avec la réception');
  });
  it('conseille la section du niveau de l’apprenant', () => {
    expect(advisedSection(0)).toBe('short');
    expect(advisedSection(1)).toBe('A1');
    expect(advisedSection(4)).toBe('B1');
  });
});

describe('entraînements ciblés de la bibliothèque', () => {
  it('?set=num tire dans les nombres, même sans rien avoir appris', () => {
    const s = buildTraining('flashcards', ctx, { set: 'num' })!;
    expect(s.title).toBe('Nombres · Cartes');
    const step = s.steps[0] as { type: string; items: string[] };
    expect(step.items.every((id) => NUM_ITEMS.some((n) => n.id === id))).toBe(true);
  });
  it('?set=clf tire dans les classificateurs', () => {
    const s = buildTraining('match', ctx, { set: 'clf' })!;
    expect(s.title).toBe('Classificateurs · Associer');
    const step = s.steps[0] as { type: string; pairs: { id: string }[] };
    expect(step.pairs.every((p) => CLF_ITEMS.some((c) => c.id === p.id))).toBe(true);
  });
  it('?set=favs révise les favoris (sans les fiches de grammaire)', () => {
    const favorites = { 'n:1': 3, 'n:2': 2, 'n:3': 1, 'g:neg': 4 };
    expect(favoriteItems(favorites).map((x) => x.id)).toEqual(['n:1', 'n:2', 'n:3']);
    const s = buildTraining('flashcards', ctx, { set: 'favs', favorites })!;
    expect(s.title).toBe('Mes favoris · Cartes');
    expect(buildTraining('flashcards', ctx, { set: 'favs', favorites: { 'n:1': 1 } })).toBeNull();
  });
});
