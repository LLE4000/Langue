import { describe, expect, it } from 'vitest';
import { buildCurriculum } from './th-fr';
import { computePath, grantedLessons, knownConcepts, nextLesson } from './path';
import { ITEMS, DIALOG_BY_ID, READING_BY_ID } from '@/content/th';
import { readingRequirements } from '@/engine/thai/reading';

const cur = buildCurriculum();
const byId = Object.fromEntries(cur.lessons.map((l) => [l.id, l]));

describe('curriculum', () => {
  it('identifiants uniques, prérequis existants, unités connues', () => {
    expect(new Set(cur.lessons.map((l) => l.id)).size).toBe(cur.lessons.length);
    const units = new Set(cur.units.map((u) => u.id));
    for (const l of cur.lessons) {
      for (const p of l.prerequisites) expect(byId[p], `${l.id} → ${p}`).toBeDefined();
      expect(units.has(l.unit), `${l.id} unité ${l.unit}`).toBe(true);
      expect(l.activities.length).toBeGreaterThan(2);
      expect(l.activities[l.activities.length - 1].type).toBe('recap');
    }
  });
  it('aucun cycle de prérequis', () => {
    const seen = new Set<string>();
    const visit = (id: string, stack: string[]) => {
      if (stack.includes(id)) throw new Error('cycle ' + stack.join('>') + '>' + id);
      if (seen.has(id)) return;
      byId[id].prerequisites.forEach((p) => visit(p, [...stack, id]));
      seen.add(id);
    };
    cur.lessons.forEach((l) => visit(l.id, []));
  });
  it('tous les éléments référencés existent', () => {
    for (const l of cur.lessons) {
      for (const c of l.newConcepts) if (!/^(m:|rule:|v:|c:)/.test(c)) expect(ITEMS[c], `${l.id} concept ${c}`).toBeDefined();
      for (const a of l.activities) {
        if ('items' in a && a.items) for (const id of a.items) expect(ITEMS[id], `${l.id} ${a.type} ${id}`).toBeDefined();
        if (a.type === 'dialog') expect(DIALOG_BY_ID[a.id], a.id).toBeDefined();
        if (a.type === 'reading') expect(READING_BY_ID[a.id], a.id).toBeDefined();
      }
    }
  });
  it('la piste écriture ne fait jamais lire un signe non enseigné', () => {
    const known = new Set<string>();
    for (const l of cur.lessons.filter((x) => x.track === 'script')) {
      l.newConcepts.forEach((c) => known.add(c));
      for (const a of l.activities) {
        const ids = a.type === 'read' || a.type === 'dictation' || a.type === 'spell' ? [...a.items, ...(('pool' in a && a.pool) || [])] : a.type === 'toneExercise' && a.mode !== 'ear' ? a.items : [];
        for (const id of ids) {
          const it = ITEMS[id];
          if (!it || it.kind === 'cons' || it.kind === 'vow') continue;
          const missing = [...readingRequirements(it.thai)].filter((r) => !known.has(r));
          expect(missing, `${l.id} ${a.type} ${it.thai}`).toEqual([]);
        }
        if (a.type === 'reading') {
          const r = READING_BY_ID[a.id];
          for (const s of r.sentences) for (const t of s.tokens) if (!/\{/.test(t.thai)) expect([...readingRequirements(t.thai)].filter((x) => !known.has(x)), `${l.id} lecture ${t.thai}`).toEqual([]);
        }
        if (a.type === 'syllables') for (const s of a.syllables) expect([...readingRequirements(s.thai)].filter((x) => !known.has(x)), `${l.id} syllabe ${s.thai}`).toEqual([]);
      }
    }
  });
  it('chaque leçon d’écriture apporte de vrais mots', () => {
    const script = cur.lessons.filter((x) => x.track === 'script');
    expect(script.length).toBeGreaterThanOrEqual(20);
    for (const l of script.filter((x) => /^read-\d+$/.test(x.id))) expect(l.activities.filter((a) => a.type === 'read' && a.answer === 'meaning').length, l.id).toBeGreaterThanOrEqual(1);
    // les 16 textes de lecture sont tous placés
    const placed = script.flatMap((l) => l.activities.filter((a) => a.type === 'reading'));
    expect(placed.length).toBe(16);
  });
  it('taille raisonnable du parcours', () => {
    expect(cur.lessons.length).toBeGreaterThan(80);
    expect(cur.lessons.length).toBeLessThan(200);
  });
});

describe('parcours personnalisé', () => {
  it('débutant complet : commence par parler, puis alterne', () => {
    const path = computePath({ curriculum: cur, levels: { listening: 0, speaking: 0, reading: 0, writing: 0 }, completed: new Set() });
    expect(path.length).toBe(cur.lessons.length);
    expect(path[0].lesson.track).toBe('talk');
    expect(path.slice(0, 6).map((p) => p.lesson.track)).toContain('script');
    expect(nextLesson(path)?.lesson.id).toBe(path[0].lesson.id);
    // les prérequis précèdent toujours
    const pos = new Map(path.map((p, i) => [p.lesson.id, i]));
    for (const p of path) for (const pre of p.lesson.prerequisites) expect(pos.get(pre)!).toBeLessThan(pos.get(p.lesson.id)!);
  });
  it('parle B2 mais ne lit pas : les thèmes de base sont acquis, on commence par lire', () => {
    const levels = { listening: 4, speaking: 4, reading: 0, writing: 0 } as const;
    const granted = grantedLessons(cur, levels);
    expect(granted.has('talk-sal-1')).toBe(true);
    expect(granted.has('read-01')).toBe(false);
    const path = computePath({ curriculum: cur, levels, completed: new Set() });
    expect(nextLesson(path)?.lesson.id).toBe('read-01');
    const next10 = path.filter((p) => p.status === 'available' || p.status === 'locked').slice(0, 10);
    expect(next10.filter((p) => p.lesson.track === 'script').length).toBeGreaterThanOrEqual(6);
  });
  it('lit couramment mais ne parle pas : l’écriture est acquise', () => {
    const path = computePath({ curriculum: cur, levels: { listening: 0, speaking: 0, reading: 4, writing: 4 }, completed: new Set() });
    expect(path.filter((p) => p.lesson.track === 'script' && p.status !== 'granted').length).toBeLessThanOrEqual(1);
    expect(nextLesson(path)?.lesson.track).toBe('talk');
  });
  it('déblocage : terminer une leçon rend la suivante disponible', () => {
    const levels = { listening: 0, speaking: 0, reading: 0, writing: 0 } as const;
    const p1 = computePath({ curriculum: cur, levels, completed: new Set() });
    const first = nextLesson(p1)!.lesson.id;
    const p2 = computePath({ curriculum: cur, levels, completed: new Set([first]) });
    expect(p2.find((p) => p.lesson.id === first)?.status).toBe('done');
    expect(nextLesson(p2)?.lesson.id).not.toBe(first);
    const known = knownConcepts(cur, new Set(['read-01', 'read-02']));
    expect(known.has('c:ก')).toBe(true);
    expect(known.has('v:–ี')).toBe(true);
  });
});
