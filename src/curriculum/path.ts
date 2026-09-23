/**
 * Moteur de parcours : à partir du profil (niveau par compétence) et du curriculum, produit
 *   - les leçons « acquises » d'office (ce que l'apprenant sait déjà),
 *   - l'ordre personnalisé des leçons (les pistes s'entrelacent selon les besoins),
 *   - la prochaine leçon à faire.
 */
import { trackAllowed, type Curriculum, type Goals, type LessonDef, type Level, type Skill, type Track } from './types';

export interface SkillLevels { listening: Level; speaking: Level; reading: Level; writing: Level }

export interface PathInput {
  curriculum: Curriculum;
  levels: SkillLevels;
  completed: ReadonlySet<string>; // leçons validées par l'apprenant
  /** objectifs : sans « lire et écrire », la piste d'écriture disparaît du parcours (elle reste dans Explorer) */
  goals?: Goals;
}

export interface PathLesson {
  lesson: LessonDef;
  status: 'done' | 'granted' | 'available' | 'locked';
  /** vrai si le contenu oral de cette leçon est déjà connu (on y apprend surtout à lire) */
  knownOrally: boolean;
}

/** Leçons considérées acquises d'après le profil, sans les avoir faites. */
export function grantedLessons(cur: Curriculum, levels: SkillLevels): Set<string> {
  const g = new Set<string>();
  for (const l of cur.lessons) {
    if (l.track === 'script' && l.readLevel != null && (levels.reading >= 4 || levels.reading > l.readLevel)) g.add(l.id);
    if ((l.track === 'talk' || l.track === 'numbers') && l.oralLevel != null && Math.min(levels.speaking, levels.listening) > l.oralLevel) g.add(l.id);
  }
  return g;
}

/** Le contenu oral d'une leçon est-il déjà connu ? (mots que l'apprenant sait dire mais pas lire) */
export const isKnownOrally = (l: LessonDef, levels: SkillLevels) =>
  (l.track === 'talk' || l.track === 'numbers') && l.oralLevel != null && Math.min(levels.speaking, levels.listening) > l.oralLevel;

/** Poids de chaque piste selon l'écart entre compétences. */
function trackWeights(levels: SkillLevels): Record<Track, number> {
  const oral = Math.min(levels.speaking, levels.listening), read = levels.reading;
  if (read >= 4 && oral >= 4) return { script: 1, talk: 1, numbers: 1, tones: 1 };
  if (read < oral) return { script: 3, talk: 1, numbers: 1, tones: 2 }; // parle mieux qu'il ne lit → priorité à l'écriture
  if (oral < read) return { script: 1, talk: 3, numbers: 2, tones: 1 };
  return { script: 2, talk: 2, numbers: 1, tones: 1 }; // débutant équilibré : alterner
}

/** Ordre personnalisé de toutes les leçons (entrelacement déterministe des pistes). */
export function orderedPath(cur: Curriculum, levels: SkillLevels, granted: ReadonlySet<string>): LessonDef[] {
  const byTrack: Record<string, LessonDef[]> = {};
  for (const l of cur.lessons) (byTrack[l.track] ??= []).push(l);
  const w = trackWeights(levels);
  const tracks = (Object.keys(byTrack) as Track[]).filter((t) => byTrack[t].length);
  // Un débutant complet commence par dire bonjour (motivation), puis alterne ; un non-lecteur qui parle commence par lire.
  const first: Track = levels.reading < Math.min(levels.speaking, levels.listening) ? 'script' : 'talk';
  const order = [first, ...tracks.filter((t) => t !== first)];
  const idx: Record<string, number> = Object.fromEntries(tracks.map((t) => [t, 0]));
  const out: LessonDef[] = [];
  const placed = new Set<string>();
  // les leçons acquises sont placées en tête (elles ne coûtent rien)
  for (const l of cur.lessons) if (granted.has(l.id)) { out.push(l); placed.add(l.id); }
  const credit: Record<string, number> = Object.fromEntries(tracks.map((t) => [t, 0]));
  const remaining = () => tracks.some((t) => idx[t] < byTrack[t].length);
  let guard = 0;
  while (remaining() && guard++ < 5000) {
    for (const t of order) credit[t] += w[t] ?? 1;
    // piste au plus grand crédit dont la prochaine leçon est disponible
    const candidatesT = order.filter((t) => idx[t] < byTrack[t].length).sort((a, b) => credit[b] - credit[a]);
    let took = false;
    for (const t of candidatesT) {
      const l = byTrack[t][idx[t]];
      if (placed.has(l.id)) { idx[t]++; took = true; break; }
      if (l.prerequisites.every((p) => placed.has(p))) { out.push(l); placed.add(l.id); idx[t]++; credit[t] -= tracks.length; took = true; break; }
    }
    if (!took) { // prérequis croisés non satisfaits : on force la piste la plus en retard
      const t = candidatesT[0];
      const l = byTrack[t][idx[t]];
      out.push(l); placed.add(l.id); idx[t]++;
    }
  }
  return out;
}

export function computePath(input: PathInput): PathLesson[] {
  const { levels, completed, goals } = input;
  const curriculum: Curriculum = goals ? { ...input.curriculum, lessons: input.curriculum.lessons.filter((l) => trackAllowed(l.track, goals)) } : input.curriculum;
  const granted = grantedLessons(curriculum, levels);
  const order = orderedPath(curriculum, levels, granted);
  const done = new Set([...completed, ...granted]);
  return order.map((lesson) => ({
    lesson,
    status: completed.has(lesson.id) ? 'done' : granted.has(lesson.id) ? 'granted' : lesson.prerequisites.every((p) => done.has(p)) ? 'available' : 'locked',
    knownOrally: isKnownOrally(lesson, levels),
  }));
}

/** Prochaine leçon : la première du parcours ni faite ni acquise. */
export function nextLesson(path: PathLesson[]): PathLesson | null {
  return path.find((p) => p.status === 'available') ?? path.find((p) => p.status === 'locked') ?? null;
}

/** Notions connues (pour la lisibilité) d'après les leçons faites ou acquises. */
export function knownConcepts(cur: Curriculum, doneLessons: ReadonlySet<string>): Set<string> {
  const k = new Set<string>();
  for (const l of cur.lessons) if (doneLessons.has(l.id)) l.newConcepts.forEach((c) => k.add(c));
  return k;
}

export const skillsOf = (l: LessonDef): Skill[] => l.skills;
