/**
 * Curriculum français → thaï : assemble les pistes et greffe les textes de lecture
 * sur la première leçon d'écriture après laquelle ils deviennent entièrement lisibles.
 */
import type { Curriculum, LessonDef } from '../types';
import { buildScriptTrack, readingPracticeLesson, SCRIPT_UNITS } from './script';
import { buildTalkTrack, buildNumbersTrack, TALK_UNITS, NUMBER_UNITS } from './talk';
import { th } from '@/content/th';
import { readingRequirements } from '@/engine/thai/reading';

function attachReadings(script: LessonDef[]) {
  const known = new Set<string>();
  const placed = new Set<string>();
  for (const lesson of script) {
    lesson.newConcepts.forEach((c) => known.add(c));
    for (const r of th.READINGS) {
      if (placed.has(r.id)) continue;
      const words = r.sentences.flatMap((s) => s.tokens.map((t) => t.thai)).filter((w) => !/\{/.test(w));
      if (words.every((w) => [...readingRequirements(w)].every((x) => known.has(x)))) {
        placed.add(r.id);
        // le texte s'insère avant la révision finale
        const i = lesson.activities.findIndex((a) => a.type === 'review' || a.type === 'recap');
        lesson.activities.splice(i < 0 ? lesson.activities.length : i, 0, { type: 'reading', id: r.id });
        if (r.sentences.some((s) => s.tokens.length >= 3 && s.tokens.length <= 7 && !s.tokens.some((t) => /\{/.test(t.thai)))) {
          const idx = r.sentences.findIndex((s) => s.tokens.length >= 3 && s.tokens.length <= 7 && !s.tokens.some((t) => /\{/.test(t.thai)));
          lesson.activities.splice(i < 0 ? lesson.activities.length : i + 1, 0, { type: 'build', sentences: [{ readingId: r.id, index: idx }] });
        }
        lesson.minutes += 2; // la carte de la leçon l'annonce (« 1 texte ») d'après ses activités
        break; // un texte par leçon au plus
      }
    }
  }
  // Les textes restants (mots longs, tournures complexes) : leçons de lecture après l'alphabet
  const rest = th.READINGS.filter((r) => !placed.has(r.id)).sort((a, b) => a.level - b.level).map((r) => r.id);
  let prev = script[script.length - 1].id, n = 1;
  for (let i = 0; i < rest.length; i += 2) {
    const l = readingPracticeLesson(n++, prev, rest.slice(i, i + 2));
    script.push(l);
    prev = l.id;
  }
}

let cache: Curriculum | null = null;
export function buildCurriculum(): Curriculum {
  if (cache) return cache;
  const script = buildScriptTrack();
  attachReadings(script);
  const lessons = [...script, ...buildTalkTrack(), ...buildNumbersTrack()];
  return (cache = { units: [...SCRIPT_UNITS, ...TALK_UNITS, ...NUMBER_UNITS], lessons });
}
