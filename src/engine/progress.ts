/**
 * Progression par compétences.
 *
 * Neuf compétences notées de 0 à 100, chacune calculée à partir d'une mesure brute (lettres acquises, mots acquis,
 * taux de tons justes, notes de prononciation…) et de trois jalons : A1 = 40, A2 = 70, B1 = 100. Le palier global
 * (A0 → B1, B2 « à venir ») est atteint quand TOUTES les compétences concernées par l'objectif dépassent le jalon.
 *
 * « Acquis » ne baisse jamais : un mot compte dès qu'il a été su une fois. L'oubli s'affiche à part (« à réviser »).
 * Le niveau déclaré à l'inscription sert de plancher : quelqu'un qui dit lire des phrases part avec les lettres acquises.
 *
 * Fonctions pures, sans React ni store : testables et réutilisables (carte de partage, défis…).
 */
import type { SrsState } from './srs';
import { isDue, mastery } from './srs';
import type { PronStat } from './audio/pronunciation';
import type { SkillLevels } from '@/curriculum/path';
import type { Goals } from '@/curriculum/types';

export type SkillId = 'cons' | 'vowels' | 'reading' | 'vocab' | 'grammar' | 'tones' | 'listening' | 'speaking' | 'conversation';
export const SKILL_IDS: SkillId[] = ['cons', 'vowels', 'reading', 'vocab', 'grammar', 'tones', 'listening', 'speaking', 'conversation'];

export type TierId = 'A0' | 'A1' | 'A2' | 'B1' | 'B2';
export const TIERS: TierId[] = ['A0', 'A1', 'A2', 'B1', 'B2'];
/** Valeur de compétence (0–100) qui marque l'entrée dans chaque palier. */
export const TIER_MARK: Record<TierId, number> = { A0: 0, A1: 40, A2: 70, B1: 100, B2: 101 };

export interface SkillMeta { id: SkillId; label: string; short: string; unit: string; goal: 'read' | 'speak' | 'both' }
export const SKILL_META: SkillMeta[] = [
  { id: 'cons', label: 'Consonnes', short: 'Cons.', unit: 'consonnes', goal: 'read' },
  { id: 'vowels', label: 'Voyelles', short: 'Voy.', unit: 'voyelles', goal: 'read' },
  { id: 'reading', label: 'Lecture', short: 'Lire', unit: '', goal: 'read' },
  { id: 'vocab', label: 'Vocabulaire', short: 'Mots', unit: 'mots', goal: 'both' },
  { id: 'grammar', label: 'Grammaire', short: 'Gram.', unit: 'points', goal: 'both' },
  { id: 'tones', label: 'Tons', short: 'Tons', unit: '', goal: 'both' },
  { id: 'listening', label: 'Compréhension orale', short: 'Écoute', unit: '', goal: 'speak' },
  { id: 'speaking', label: 'Prononciation', short: 'Parler', unit: '', goal: 'speak' },
  { id: 'conversation', label: 'Conversation', short: 'Conv.', unit: '', goal: 'speak' },
];

/** Ce que raconte chaque palier, en une phrase : le fil « je ne lisais rien → je comprends une conversation ». */
export const TIER_STORY: Record<TierId, { title: string; text: string }> = {
  A0: { title: 'Premiers pas', text: 'Je découvre les sons et les premières lettres, je sais saluer et me présenter.' },
  A1: { title: 'Je lis et je me débrouille', text: 'Je lis les mots courants, je commande, je demande un prix, je comprends des phrases lentes.' },
  A2: { title: 'Je tiens une conversation simple', text: 'Je raconte ma journée, je comprends un dialogue de la vie quotidienne, mes tons sont le plus souvent justes.' },
  B1: { title: 'Autonome', text: 'Je lis un texte de 300 mots, je suis une conversation naturelle, je m’exprime avec des tons corrects.' },
  B2: { title: 'À l’aise avec les natifs', text: 'Je comprends des Thaïlandais qui parlent entre eux à vitesse normale. Ce palier arrivera avec les contenus avancés.' },
};

/** Jalons d'une compétence : mesure brute → valeur 0–100 (interpolation linéaire entre points). */
type Anchors = [number, number][];

export interface ActivityRecord { n: number; t: number; best?: number; total?: number }

export interface ProgressContent {
  cons: string[]; // identifiants des 44 consonnes vivantes
  vowels: string[]; // voyelles enseignées
  words: string[]; // mots principaux
  grammar: string[]; // points de grammaire
  toneItems: string[]; // mots d'entraînement aux tons
  scriptLessons: string[]; // leçons de la piste écriture
  talkLessons: string[]; // leçons des pistes orales (conversation, nombres)
  allLessons: string[];
  lessonMinutes: number; // durée moyenne d'une leçon
  dialogs: string[];
  readings: string[];
}

export interface ProgressInput {
  content: ProgressContent;
  srs: Record<string, SrsState>;
  acquired: Record<string, number>;
  doneLessons: ReadonlySet<string>; // faites ou acquises d'office
  completedLessons: ReadonlySet<string>; // réellement faites
  ruleStats: Record<string, { ok: number; ko: number }>;
  pron: Record<string, PronStat>;
  activities: Record<string, ActivityRecord>; // clés « comp:<dialogue> », « dialog:<id> », « reading:<id> »
  levels: SkillLevels;
  goals: Goals;
  now?: number;
}

export interface SkillProgress {
  id: SkillId;
  value: number; // 0–100
  raw: number; // mesure brute (nombre ou taux)
  /** libellé de la mesure : « 38 / 44 », « 312 mots », « 62 % » */
  detail: string;
  /** éléments acquis dont la mémoire faiblit (à réviser) */
  toReview: number;
  /** mesure brute exigée par le prochain palier (pour « ce qu'il reste »), et libellé */
  need: number;
  needLabel: string;
  ok: boolean; // le jalon du prochain palier est atteint pour cette compétence
}

export interface Progress {
  skills: SkillProgress[];
  relevant: SkillId[];
  tier: TierId;
  next: TierId | null;
  /** avancement 0–1 vers le prochain palier (moyenne des compétences concernées) */
  toNext: number;
  overall: number; // 0–100
  remaining: { lessons: number; hours: number; words: number };
  counts: { lessonsDone: number; lessonsTotal: number; wordsAcquired: number; consAcquired: number; vowelsAcquired: number; toReview: number };
}

const interp = (anchors: Anchors, x: number): number => {
  if (x <= anchors[0][0]) return anchors[0][1];
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
    if (x <= x1) return y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return anchors[anchors.length - 1][1];
};
/** Mesure brute nécessaire pour atteindre une valeur donnée (inverse de interp). */
const needFor = (anchors: Anchors, value: number): number => {
  for (let i = 1; i < anchors.length; i++) {
    const [x0, y0] = anchors[i - 1], [x1, y1] = anchors[i];
    if (value <= y1) return x0 + ((value - y0) / (y1 - y0)) * (x1 - x0);
  }
  return anchors[anchors.length - 1][0];
};

const pct = (x: number) => `${Math.round(x * 100)} %`;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** Un élément est acquis s'il l'a été un jour (enregistré) ou si sa dernière note est « connu ». */
export const isAcquired = (id: string, srs: Record<string, SrsState>, acquired: Record<string, number>) => !!acquired[id] || (srs[id]?.q ?? -1) >= 3;

export function computeProgress(input: ProgressInput): Progress {
  const { content: c, srs, acquired, doneLessons, completedLessons, ruleStats, pron, activities, levels, goals } = input;
  const now = input.now ?? Date.now();
  const acq = (ids: string[]) => ids.filter((id) => isAcquired(id, srs, acquired));
  const weak = (ids: string[]) => ids.filter((id) => isAcquired(id, srs, acquired) && (isDue(srs[id], now) || mastery(srs[id], now) < 0.5)).length;
  const ratio = (ids: string[], set: ReadonlySet<string>) => (ids.length ? ids.filter((id) => set.has(id)).length / ids.length : 0);
  const oral = Math.min(levels.speaking, levels.listening);

  // --- mesures brutes ---
  const consA = acq(c.cons).length, vowA = acq(c.vowels).length, wordsA = acq(c.words).length, gramA = acq(c.grammar).length;
  // tons : exercices de règles (ruleStats) et mots de tons acquis
  const rs = Object.values(ruleStats).reduce((a, r) => ({ ok: a.ok + r.ok, ko: a.ko + r.ko }), { ok: 0, ko: 0 });
  const toneAnswers = rs.ok + rs.ko;
  const toneAcc = toneAnswers >= 8 ? rs.ok / toneAnswers : 0;
  const toneItems = c.toneItems.length ? acq(c.toneItems).length / c.toneItems.length : 0;
  const tonesRaw = toneAnswers >= 8 ? 0.7 * toneAcc + 0.3 * toneItems : toneItems * 0.6;
  // lecture : leçons d'écriture faites + lectures terminées
  const readingsDone = c.readings.filter((id) => activities['reading:' + id]?.n).length;
  const readingRaw = 0.6 * ratio(c.scriptLessons, doneLessons) + 0.4 * Math.min(1, readingsDone / 10);
  // compréhension orale : leçons orales + compréhensions (score moyen × couverture)
  const comps = c.dialogs.map((id) => activities['comp:' + id]).filter((a): a is ActivityRecord => !!a && !!a.total);
  const compMean = comps.length ? comps.reduce((a, x) => a + (x.best ?? 0) / (x.total ?? 1), 0) / comps.length : 0;
  const listeningRaw = 0.5 * ratio(c.talkLessons, doneLessons) + 0.5 * compMean * Math.min(1, comps.length / 8);
  // prononciation : meilleure note par mot, pondérée par le nombre de mots essayés
  const prons = Object.values(pron);
  const pronMean = prons.length ? prons.reduce((a, p) => a + p.best, 0) / prons.length / 10 : 0;
  const speakingRaw = pronMean * Math.min(1, prons.length / 40);
  // conversation : dialogues travaillés + prononciation
  const dialogsDone = c.dialogs.filter((id) => activities['dialog:' + id]?.n || activities['comp:' + id]?.n).length;
  const conversationRaw = 0.6 * Math.min(1, dialogsDone / 20) + 0.4 * speakingRaw;

  // --- planchers issus du niveau déclaré ---
  const floorRead = [0, 0.15, 0.55, 0.85, 1][levels.reading];
  const floors: Record<SkillId, number> = {
    cons: Math.round(c.cons.length * [0, 0.25, 0.7, 1, 1][levels.reading]),
    vowels: Math.round(c.vowels.length * [0, 0.2, 0.6, 1, 1][levels.reading]),
    reading: floorRead,
    vocab: [0, 120, 500, 1200, 2500][oral],
    grammar: [0, 4, 12, 25, 34][oral],
    tones: [0, 0.2, 0.5, 0.75, 0.85][Math.max(levels.reading, oral)],
    listening: [0, 0.2, 0.45, 0.7, 0.9][levels.listening],
    speaking: [0, 0.2, 0.4, 0.6, 0.85][levels.speaking],
    conversation: [0, 0.15, 0.4, 0.6, 0.9][oral],
  };

  const anchors: Record<SkillId, Anchors> = {
    cons: [[0, 0], [c.cons.length, 100]],
    vowels: [[0, 0], [Math.min(30, c.vowels.length), 80], [c.vowels.length, 100]],
    reading: [[0, 0], [0.35, 40], [0.7, 70], [1, 100]],
    vocab: [[0, 0], [500, 40], [1200, 70], [2500, 100]],
    grammar: [[0, 0], [12, 40], [25, 70], [Math.max(34, c.grammar.length), 100]],
    tones: [[0, 0], [0.6, 40], [0.75, 70], [0.85, 100]],
    listening: [[0, 0], [0.35, 40], [0.7, 70], [1, 100]],
    speaking: [[0, 0], [0.3, 40], [0.6, 70], [0.85, 100]],
    conversation: [[0, 0], [0.3, 40], [0.6, 70], [0.9, 100]],
  };
  const raws: Record<SkillId, number> = {
    cons: Math.max(consA, floors.cons), vowels: Math.max(vowA, floors.vowels), reading: Math.max(readingRaw, floors.reading),
    vocab: Math.max(wordsA, floors.vocab), grammar: Math.max(gramA, floors.grammar), tones: Math.max(tonesRaw, floors.tones),
    listening: Math.max(listeningRaw, floors.listening), speaking: Math.max(speakingRaw, floors.speaking), conversation: Math.max(conversationRaw, floors.conversation),
  };
  const relevant = SKILL_META.filter((m) => m.goal === 'both' || (m.goal === 'read' ? goals.read : goals.speak)).map((m) => m.id);
  const values = Object.fromEntries(SKILL_IDS.map((id) => [id, Math.round(Math.min(100, interp(anchors[id], raws[id])))])) as Record<SkillId, number>;

  // --- palier ---
  let tier: TierId = 'A0';
  for (const t of ['A1', 'A2', 'B1'] as TierId[]) if (relevant.every((id) => values[id] >= TIER_MARK[t])) tier = t; else break;
  const next: TierId | null = tier === 'B1' ? 'B2' : (TIERS[TIERS.indexOf(tier) + 1] as TierId);
  const mark = next && next !== 'B2' ? TIER_MARK[next] : 100;
  const prevMark = TIER_MARK[tier];
  const toNext = next === 'B2' ? 1 : relevant.reduce((a, id) => a + Math.min(1, Math.max(0, (values[id] - prevMark) / (mark - prevMark))), 0) / Math.max(1, relevant.length);
  const overall = Math.round(relevant.reduce((a, id) => a + values[id], 0) / Math.max(1, relevant.length));

  const detailOf = (id: SkillId): string => {
    switch (id) {
      case 'cons': return `${Math.round(raws.cons)} / ${c.cons.length}`;
      case 'vowels': return `${Math.round(raws.vowels)} / ${c.vowels.length}`;
      case 'vocab': return `${Math.round(raws.vocab)} mots`;
      case 'grammar': return `${Math.round(raws.grammar)} / ${c.grammar.length} points`;
      case 'tones': return toneAnswers >= 8 || floors.tones > 0 ? `${pct(raws.tones)} de tons justes` : 'pas encore mesuré';
      case 'reading': return `${c.scriptLessons.filter((id) => doneLessons.has(id)).length} / ${c.scriptLessons.length} leçons · ${readingsDone} lecture${readingsDone > 1 ? 's' : ''}`;
      case 'listening': return comps.length ? `${pct(compMean)} compris · ${comps.length} conversation${comps.length > 1 ? 's' : ''}` : 'écoutez une conversation';
      case 'speaking': return prons.length ? `${r1(pronMean * 10)} / 10 sur ${prons.length} mot${prons.length > 1 ? 's' : ''}` : 'dites un mot au micro';
      case 'conversation': return `${dialogsDone} / ${c.dialogs.length} dialogues`;
    }
  };
  const needLabelOf = (id: SkillId, need: number): string => {
    switch (id) {
      case 'cons': return `${Math.ceil(need)} consonnes`;
      case 'vowels': return `${Math.ceil(need)} voyelles`;
      case 'vocab': return `${Math.ceil(need)} mots`;
      case 'grammar': return `${Math.ceil(need)} points de grammaire`;
      case 'tones': return `${pct(need)} de tons justes`;
      case 'reading': return `${Math.round(need * 100)} % du parcours d’écriture`;
      case 'listening': return `${Math.round(need * 100)} % d’écoute`;
      case 'speaking': return `${r1(need * 10)} / 10 au micro`;
      case 'conversation': return `${Math.round(need * 100)} % de conversation`;
    }
  };
  const groups: Partial<Record<SkillId, string[]>> = { cons: c.cons, vowels: c.vowels, vocab: c.words, grammar: c.grammar, tones: c.toneItems };
  const skills: SkillProgress[] = SKILL_IDS.map((id) => {
    const need = needFor(anchors[id], mark);
    return { id, value: values[id], raw: raws[id], detail: detailOf(id), toReview: groups[id] ? weak(groups[id]!) : 0, need, needLabel: needLabelOf(id, need), ok: values[id] >= mark };
  });

  // --- chemin restant ---
  const wordsNeed = Math.max(0, Math.ceil(needFor(anchors.vocab, mark) - raws.vocab));
  const consNeed = goals.read ? Math.max(0, Math.ceil(needFor(anchors.cons, mark) - raws.cons)) : 0;
  const lessonsLeft = c.allLessons.filter((id) => !doneLessons.has(id)).length;
  const lessons = Math.min(lessonsLeft, Math.max(next === 'B2' ? 0 : 1, Math.ceil(wordsNeed / 7 + consNeed / 4)));
  const hours = r1((lessons * c.lessonMinutes * 1.5) / 60);
  const toReview = skills.reduce((a, s) => a + s.toReview, 0);

  return {
    skills, relevant, tier, next, toNext, overall,
    remaining: { lessons, hours, words: wordsNeed },
    // les compteurs affichés suivent la même règle que les compétences : le niveau déclaré sert de plancher
    counts: { lessonsDone: c.allLessons.filter((id) => completedLessons.has(id)).length, lessonsTotal: c.allLessons.length, wordsAcquired: Math.round(raws.vocab), consAcquired: Math.round(raws.cons), vowelsAcquired: Math.round(raws.vowels), toReview },
  };
}

/** Phrase courte : « A1 · 62 % du chemin vers A2 ». */
export function tierLine(p: Progress): string {
  if (!p.next || p.next === 'B2') return `${p.tier} · palier atteint`;
  return `${p.tier} · ${Math.round(p.toNext * 100)} % du chemin vers ${p.next}`;
}

/** Phrase du chemin restant : « ≈ 27 leçons, soit 6 h, avant A2 ». */
export function remainingLine(p: Progress): string {
  if (!p.next || p.next === 'B2') return 'Le palier B2 arrivera avec les contenus avancés.';
  const { lessons, hours } = p.remaining;
  if (!lessons) return `Encore quelques révisions avant ${p.next}.`;
  const h = hours < 1 ? `${Math.max(10, Math.round(hours * 60))} min` : hours >= 10 ? `${Math.round(hours)} h` : `${String(hours).replace('.', ',')} h`;
  return `≈ ${lessons} leçon${lessons > 1 ? 's' : ''}, soit ${h}, avant ${p.next}`;
}
