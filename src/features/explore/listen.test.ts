import { describe, expect, it } from 'vitest';
import { DEFAULT_LISTEN } from '@/app/store';
import { CONS_ITEMS, ITEMS } from '@/content/th';
import { buildListenQueue, itemsForSet, textsFor } from './listen';

describe('mode Écoute en boucle', () => {
  it('les 44 consonnes dans l’ordre classique, nom entier, normal puis lent', () => {
    const q = buildListenQueue(DEFAULT_LISTEN, {}, 1);
    expect(q.length).toBe(44);
    expect(q[0].item.thai).toBe('ก');
    expect(q[43].item.thai).toBe('ฮ');
    expect(q[0].takes.map((t) => t.rate)).toEqual([0.95, 0.6]);
    expect(q[0].takes[0].text).toBe('กอ ไก่');
  });
  it('« son seul » ne dit que la syllabe de la lettre (ปอ, pas ปอ ปลา)', () => {
    const p = ITEMS['c:ป'];
    expect(textsFor(p, 'sound')).toEqual(['ปอ']);
    expect(textsFor(p, 'name')).toEqual(['ปอ ปลา']);
    expect(textsFor(p, 'both')).toEqual(['ปอ', 'ปอ ปลา']);
    // une lettre obsolète se lit avec la lettre courante de même son
    expect(textsFor(ITEMS['c:ฃ'], 'sound')).toEqual(['ขอ']);
  });
  it('trois vitesses et sélection personnalisée', () => {
    const q = buildListenQueue({ ...DEFAULT_LISTEN, set: 'custom', custom: ['c:ป', 'c:พ'], what: 'sound', speeds: 3 }, {}, 1);
    expect(q.map((e) => e.item.thai)).toEqual(['ป', 'พ']);
    expect(q[0].takes.map((t) => t.rate)).toEqual([0.95, 0.6, 0.4]);
  });
  it('mélange reproductible, mêmes éléments', () => {
    const a = buildListenQueue({ ...DEFAULT_LISTEN, order: 'shuffle' }, {}, 7).map((e) => e.item.id);
    const b = buildListenQueue({ ...DEFAULT_LISTEN, order: 'shuffle' }, {}, 7).map((e) => e.item.id);
    expect(a).toEqual(b);
    expect([...a].sort()).toEqual(CONS_ITEMS.map((c) => c.id).sort());
    expect(a).not.toEqual(CONS_ITEMS.map((c) => c.id));
  });
  it('voyelles : lues sur อ, nom = สระ + voyelle ; mes mots : seulement les éléments appris', () => {
    const v = itemsForSet({ set: 'vow', custom: [] }, {});
    expect(v.length).toBeGreaterThan(10);
    expect(textsFor(v[0], 'both')[1].startsWith('สระ')).toBe(true);
    const w = itemsForSet({ set: 'words', custom: [] }, { 'w:สวัสดี{P}': { reps: 1 } as never, 'c:ก': { reps: 1 } as never });
    expect(w.map((x) => x.id)).toEqual(['w:สวัสดี{P}']);
  });
});
