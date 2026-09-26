import { describe, expect, it } from 'vitest';
import { computeProgress, tierLine, type ProgressContent, type ProgressInput } from './progress';
import { rate, type SrsState } from './srs';

const ids = (p: string, n: number) => Array.from({ length: n }, (_, i) => `${p}${i}`);
const content: ProgressContent = {
  cons: ids('c:', 44), vowels: ids('v:', 42), words: ids('w:', 900), grammar: ids('g:', 34), toneItems: ids('t:', 124),
  scriptLessons: ids('read-', 28), talkLessons: ids('talk-', 133), allLessons: [...ids('read-', 28), ...ids('talk-', 133)], lessonMinutes: 10.5,
  dialogs: ids('d:', 30), readings: ids('r:', 19),
};
const known = (): SrsState => rate(rate(undefined, 3), 3);
const base = (over: Partial<ProgressInput> = {}): ProgressInput => ({
  content, srs: {}, acquired: {}, doneLessons: new Set(), completedLessons: new Set(), ruleStats: {}, pron: {}, activities: {},
  levels: { listening: 0, speaking: 0, reading: 0, writing: 0 }, goals: { speak: true, read: true }, ...over,
});

describe('progression par compétences', () => {
  it('débutant complet : A0, tout à zéro, chemin restant non nul', () => {
    const p = computeProgress(base());
    expect(p.tier).toBe('A0');
    expect(p.next).toBe('A1');
    expect(p.overall).toBe(0);
    expect(p.remaining.lessons).toBeGreaterThan(0);
    expect(tierLine(p)).toBe('A0 · 0 % du chemin vers A1');
  });

  it('les acquis ne baissent pas avec l’oubli, mais comptent « à réviser »', () => {
    const srs: Record<string, SrsState> = {};
    const acquired: Record<string, number> = {};
    for (const id of content.cons.slice(0, 20)) { srs[id] = known(); acquired[id] = 1; }
    // un élément raté ensuite : sa note retombe, il reste acquis
    srs['c:0'] = rate(srs['c:0'], 0);
    const p = computeProgress(base({ srs, acquired }));
    const cons = p.skills.find((s) => s.id === 'cons')!;
    expect(cons.raw).toBe(20);
    expect(cons.value).toBe(Math.round((20 / 44) * 100));
    expect(cons.toReview).toBeGreaterThanOrEqual(1);
    expect(cons.detail).toBe('20 / 44');
  });

  it('le niveau déclaré sert de plancher : un lecteur confirmé a ses consonnes', () => {
    const p = computeProgress(base({ levels: { listening: 0, speaking: 0, reading: 3, writing: 3 } }));
    expect(p.skills.find((s) => s.id === 'cons')!.value).toBe(100);
    expect(p.skills.find((s) => s.id === 'vocab')!.value).toBe(0);
  });

  it('A1 est atteint quand toutes les compétences concernées passent 40', () => {
    const p = computeProgress(base({ levels: { listening: 2, speaking: 2, reading: 2, writing: 2 } }));
    // planchers de niveau 2 : consonnes 31/44 (70 %), voyelles 25 (≈ 67), mots 500 (40), grammaire 12 (40), tons 0,5 (33) → bloqué par les tons
    expect(p.skills.find((s) => s.id === 'vocab')!.value).toBe(40);
    expect(p.tier).toBe('A0');
    const p2 = computeProgress(base({ levels: { listening: 3, speaking: 3, reading: 3, writing: 3 } }));
    expect(p2.tier).toBe('A2');
    expect(p2.next).toBe('B1');
    expect(p2.toNext).toBeGreaterThan(0);
  });

  it('objectif « parler » seul : les compétences d’écriture ne comptent pas dans le palier', () => {
    const p = computeProgress(base({ goals: { speak: true, read: false }, levels: { listening: 3, speaking: 3, reading: 0, writing: 0 } }));
    expect(p.relevant).not.toContain('cons');
    expect(p.relevant).toContain('vocab');
    expect(p.tier).toBe('A2');
  });

  it('la compréhension orale et la prononciation viennent des activités et des notes', () => {
    const activities = Object.fromEntries(content.dialogs.slice(0, 8).map((d) => ['comp:' + d, { n: 1, t: 1, best: 4, total: 5 }]));
    const pron = Object.fromEntries(content.words.slice(0, 40).map((w) => [w, { best: 8, last: 8, n: 1, t: 1 }]));
    const p = computeProgress(base({ activities, pron, doneLessons: new Set(content.talkLessons) }));
    const l = p.skills.find((s) => s.id === 'listening')!;
    const s = p.skills.find((s) => s.id === 'speaking')!;
    expect(l.raw).toBeCloseTo(0.5 + 0.5 * 0.8, 5);
    expect(l.detail).toBe('80 % compris · 8 conversations');
    expect(s.raw).toBeCloseTo(0.8, 5);
    expect(s.value).toBe(94); // 0,6 → 70 et 0,85 → 100 : 0,8 est à 94
  });

  it('le chemin restant diminue quand on apprend des mots', () => {
    const a = computeProgress(base());
    const acquired = Object.fromEntries(content.words.slice(0, 300).map((w) => [w, 1]));
    const b = computeProgress(base({ acquired }));
    expect(b.remaining.words).toBe(200);
    expect(b.remaining.lessons).toBeLessThan(a.remaining.lessons);
    expect(b.counts.wordsAcquired).toBe(300);
    // le niveau déclaré sert aussi de plancher aux compteurs (cohérence entre les écrans)
    expect(computeProgress(base({ levels: { listening: 1, speaking: 1, reading: 0, writing: 0 } })).counts.wordsAcquired).toBe(120);
  });
});

describe('progression : lecture à voix haute et validation des paliers', () => {
  it('la lecture à voix haute fait monter lecture, tons et prononciation', () => {
    const p0 = computeProgress(base());
    const tags: Record<string, { ok: number; n: number }> = {};
    for (let i = 0; i < 30; i++) tags['c:' + i] = { ok: 9, n: 10 };
    tags['tone:M'] = { ok: 40, n: 50 };
    const withRa = computeProgress(base({ readAloud: tags }));
    const v = (p: typeof p0, id: string) => p.skills.find((s) => s.id === id)!.value;
    expect(v(withRa, 'reading')).toBeGreaterThan(v(p0, 'reading'));
    expect(v(withRa, 'tones')).toBeGreaterThan(v(p0, 'tones'));
    expect(v(withRa, 'speaking')).toBeGreaterThan(v(p0, 'speaking'));
  });
  it('un palier non validé reste « prêt pour » quand la validation est exigée', () => {
    const strong = base({ levels: { listening: 3, speaking: 3, reading: 3, writing: 3 } });
    const free = computeProgress(strong);
    expect(free.tier).not.toBe('A0');
    const gated = computeProgress({ ...strong, validated: [] });
    expect(gated.tier).toBe('A0');
    expect(gated.readyFor).toBe('A1');
    expect(free.readyFor).toBeNull();
  });
});
