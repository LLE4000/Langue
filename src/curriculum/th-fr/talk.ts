/**
 * Piste « Parler et comprendre » : vocabulaire par thème (ordre d'utilité), grammaire greffée sur les leçons,
 * conversations en fin de thème. Et la piste « Compter » : chiffres, nombres, classificateurs.
 *
 * Ces leçons ne demandent PAS de savoir lire : le thaï est toujours accompagné de l'audio et de la
 * transcription. Les exercices de lecture n'y sont proposés que sur les mots que l'apprenant sait lire.
 */
import type { ActivitySpec, LessonDef, UnitDef } from '../types';
import { th, NUM_ITEMS, CLF_ITEMS } from '@/content/th';

/** Niveau oral approximatif de chaque thème (0 débutant complet … 4). */
const THEME_ORAL: Record<string, number> = {
  sal: 0, pres: 0, small: 1, num: 1, price: 1, food: 1, drink: 1, resto: 1, market: 2, taxi: 2, dir: 2, time: 1, date: 1, hotel: 2, hosp: 3,
  health: 2, sos: 2, work: 3, eng: 4, trans: 2, grab: 3, airport: 3, travel: 2, weather: 2, color: 1, shop: 2, fam: 1, friends: 2, out: 3, feel: 2,
  verbs: 1, adj: 1, body: 2, clothes: 2, places: 2, animals: 2, home: 2,
};

/** Ordre pédagogique des points de grammaire, greffés un par un sur les leçons de vocabulaire. */
const GRAMMAR_ORDER = ['g:polite', 'g:order', 'g:noconj', 'g:pron', 'g:be', 'g:neg', 'g:qmai', 'g:mii', 'g:ask', 'g:soft', 'g:nums', 'g:clf', 'g:yaak', 'g:dai', 'g:tong', 'g:maak', 'g:qwords', 'g:past', 'g:future', 'g:prog', 'g:laeo', 'g:qtag', 'g:poss', 'g:comp', 'g:hai', 'g:link', 'g:thii', 'g:kan', 'g:loei', 'g:plural', 'g:levels'];

const CHUNK = 7;

export const TALK_UNITS: UnitDef[] = [
  { id: 'u-talk-1', track: 'talk', title: { fr: 'Premiers échanges' }, description: { fr: 'Saluer, se présenter, les petits mots qui font les phrases.' } },
  { id: 'u-talk-2', track: 'talk', title: { fr: 'Manger et acheter' }, description: { fr: 'Nourriture, boissons, restaurant, marché, prix.' } },
  { id: 'u-talk-3', track: 'talk', title: { fr: 'Se déplacer et se loger' }, description: { fr: 'Taxi, directions, heure, dates, hôtel.' } },
  { id: 'u-talk-4', track: 'talk', title: { fr: 'Santé, urgences, travail' }, description: { fr: 'Hôpital, santé, urgences, travail, chantier.' } },
  { id: 'u-talk-5', track: 'talk', title: { fr: 'Voyager et vivre sur place' }, description: { fr: 'Transports, aéroport, météo, couleurs, shopping, famille, amis.' } },
  { id: 'u-talk-6', track: 'talk', title: { fr: 'Élargir son vocabulaire' }, description: { fr: 'Verbes, adjectifs, corps, vêtements, lieux, animaux, maison.' } },
];
const THEME_UNIT: Record<string, string> = {
  sal: 'u-talk-1', pres: 'u-talk-1', small: 'u-talk-1', num: 'u-talk-1',
  price: 'u-talk-2', food: 'u-talk-2', drink: 'u-talk-2', resto: 'u-talk-2', market: 'u-talk-2',
  taxi: 'u-talk-3', dir: 'u-talk-3', time: 'u-talk-3', date: 'u-talk-3', hotel: 'u-talk-3',
  hosp: 'u-talk-4', health: 'u-talk-4', sos: 'u-talk-4', work: 'u-talk-4', eng: 'u-talk-4',
  trans: 'u-talk-5', grab: 'u-talk-5', airport: 'u-talk-5', travel: 'u-talk-5', weather: 'u-talk-5', color: 'u-talk-5', shop: 'u-talk-5', fam: 'u-talk-5', friends: 'u-talk-5', out: 'u-talk-5', feel: 'u-talk-5',
};

export function buildTalkTrack(): LessonDef[] {
  const lessons: LessonDef[] = [];
  const grammarQueue = [...GRAMMAR_ORDER];
  let prev: string | null = null;
  let lessonIndex = 0;
  for (const themeId of th.THEME_ORDER) {
    const theme = th.VOCAB_THEMES.find((t) => t.id === themeId);
    if (!theme) continue;
    const ids = theme.items.map((w) => w.id);
    const chunks: string[][] = [];
    for (let i = 0; i < ids.length; i += CHUNK) chunks.push(ids.slice(i, i + CHUNK));
    // évite un dernier morceau trop court
    if (chunks.length > 1 && chunks[chunks.length - 1].length < 4) { const last = chunks.pop()!; chunks[chunks.length - 1].push(...last); }
    const dialogId = th.DIALOG_FOR_THEME[themeId] ?? (th.DIALOGS.find((d) => d.id === 'd:' + themeId)?.id);
    chunks.forEach((chunk, k) => {
      const id = `talk-${themeId}-${k + 1}`;
      const grammar = lessonIndex % 2 === 0 && grammarQueue.length ? grammarQueue.shift()! : null;
      const isLast = k === chunks.length - 1;
      const acts: ActivitySpec[] = [
        { type: 'theory', blocks: [
          { kind: 'text', text: { fr: k === 0 ? `Thème « ${theme.name.fr} ». Écoutez chaque mot, répétez-le à voix haute, puis retenez la phrase d’exemple : on mémorise mieux un mot dans une phrase utilisable.` : `Suite du thème « ${theme.name.fr} ». Même méthode : écouter, répéter, retenir la phrase.` } },
          { kind: 'words', ids: chunk },
          ...(grammar ? [{ kind: 'grammar' as const, grammarId: grammar }] : []),
        ] },
        { type: 'flashcard', items: chunk },
        { type: 'listen', items: chunk, count: Math.min(8, chunk.length) },
        { type: 'multipleChoice', items: chunk, direction: 'thaiToMeaning', count: Math.min(7, chunk.length) },
        { type: 'multipleChoice', items: chunk, direction: 'meaningToThai', count: Math.min(7, chunk.length) },
        { type: 'match', items: chunk, by: 'meaning' },
        { type: 'repeat', items: chunk.slice(0, 3) },
        ...(isLast && dialogId ? [{ type: 'dialog' as const, id: dialogId }] : []),
        ...(lessonIndex > 0 ? [{ type: 'review' as const, count: 4 }] : []),
        { type: 'recap' },
      ];
      lessons.push({
        id, track: 'talk', unit: THEME_UNIT[themeId] ?? 'u-talk-6',
        title: { fr: chunks.length > 1 ? `${theme.name.fr} · ${k + 1}/${chunks.length}` : theme.name.fr },
        subtitle: { fr: `${chunk.length} mots et phrases` + (grammar ? ' · grammaire' : '') + (isLast && dialogId ? ' · conversation' : '') },
        skills: ['listening', 'speaking'], prerequisites: prev ? [prev] : [],
        newConcepts: [...chunk, ...(grammar ? [grammar] : [])], activities: acts, minutes: 9 + (isLast && dialogId ? 3 : 0),
        oralLevel: THEME_ORAL[themeId] ?? 2, minScore: 0.6,
      });
      prev = id;
      lessonIndex++;
    });
  }
  return lessons;
}

export const NUMBER_UNITS: UnitDef[] = [
  { id: 'u-num', track: 'numbers', title: { fr: 'Compter' }, description: { fr: 'Chiffres, nombres, prix, classificateurs.' } },
];

export function buildNumbersTrack(): LessonDef[] {
  const T = 'numbers' as const, S: LessonDef['skills'] = ['listening', 'speaking'];
  const n = (v: number) => 'n:' + v;
  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n);
  const tens = [11, 12, 20, 21, 25, 30, 50, 99].map(n);
  const big = [100, 101, 250, 1000, 2500, 10000, 100000, 1000000].map(n);
  const clf1 = CLF_ITEMS.slice(0, 7).map((c) => c.id), clf2 = CLF_ITEMS.slice(7, 14).map((c) => c.id), clf3 = CLF_ITEMS.slice(14).map((c) => c.id);
  const numActs = (ids: string[], intro: string, extraNotes: number[]): ActivitySpec[] => [
    { type: 'theory', blocks: [{ kind: 'text', text: { fr: intro } }, { kind: 'numbers', ids }, ...extraNotes.map((i) => ({ kind: 'note' as const, text: th.NUM_NOTES[i] }))] },
    { type: 'flashcard', items: ids },
    { type: 'listen', items: ids, count: 8 },
    { type: 'multipleChoice', items: ids, direction: 'meaningToThai', count: 6 },
    { type: 'multipleChoice', items: ids, direction: 'thaiToMeaning', count: 6 },
    { type: 'match', items: ids, by: 'meaning' },
    { type: 'review', count: 4 },
    { type: 'recap' },
  ];
  const clfActs = (ids: string[], intro: string): ActivitySpec[] => [
    { type: 'theory', blocks: [{ kind: 'text', text: { fr: intro } }, { kind: 'pattern', text: { fr: 'nom + nombre + classificateur' } }, { kind: 'classifiers', ids }] },
    { type: 'flashcard', items: ids },
    { type: 'listen', items: ids, count: 6 },
    { type: 'multipleChoice', items: ids, direction: 'thaiToMeaning', count: 6 },
    { type: 'match', items: ids, by: 'meaning' },
    { type: 'review', count: 4 },
    { type: 'recap' },
  ];
  return [
    { id: 'num-01', track: T, unit: 'u-num', title: { fr: 'Compter de 0 à 10' }, subtitle: { fr: 'et les chiffres thaïs ๐–๙' }, skills: S, prerequisites: [], oralLevel: 1, minScore: 0.6, minutes: 8,
      newConcepts: [...digits, 'rule:digits'], activities: numActs(digits, 'Les nombres de zéro à dix. Chaque nombre a aussi un chiffre thaï, que l’on voit sur les documents officiels, les billets et les prix d’entrée : ๑ ๒ ๓… Ils se lisent exactement comme nos chiffres.', [4]) },
    { id: 'num-02', track: T, unit: 'u-num', title: { fr: 'De 11 à 99' }, subtitle: { fr: 'สิบเอ็ด · ยี่สิบ · ห้าสิบ' }, skills: S, prerequisites: ['num-01'], oralLevel: 1, minScore: 0.6, minutes: 8,
      newConcepts: tens, activities: numActs(tens, 'Les dizaines se forment avec สิบ (dix) : สามสิบ = 3 × 10 = 30. Trois exceptions à retenir : 11 se dit สิบเอ็ด (pas สิบหนึ่ง), 20 se dit ยี่สิบ, et le 1 final se dit toujours เอ็ด (21 = ยี่สิบเอ็ด).', [0, 1, 2]) },
    { id: 'num-03', track: T, unit: 'u-num', title: { fr: 'Centaines, milliers, millions' }, subtitle: { fr: 'ร้อย · พัน · หมื่น · แสน · ล้าน' }, skills: S, prerequisites: ['num-02'], oralLevel: 2, minScore: 0.6, minutes: 8,
      newConcepts: big, activities: numActs(big, 'Le thaï a un mot pour 10 000 (หมื่น) et 100 000 (แสน) : 25 000 se dit « deux dix-mille cinq mille ». Pour les prix, on ajoute บาท : ร้อยบาท = 100 bahts.', [3]) },
    { id: 'clf-01', track: T, unit: 'u-num', title: { fr: 'Compter les choses : les classificateurs' }, subtitle: { fr: 'คน · ตัว · อัน · ใบ · แก้ว · ขวด · จาน' }, skills: S, prerequisites: ['num-02'], oralLevel: 2, minScore: 0.6, minutes: 8,
      newConcepts: [...clf1, 'g:clf'], activities: clfActs(clf1, 'On ne dit pas « deux cafés » mais « café deux verres » : chaque famille d’objets a son mot-mesure. Les sept premiers couvrent l’essentiel : personnes, animaux et vêtements, petits objets, contenants, verres, bouteilles, assiettes.') },
    { id: 'clf-02', track: T, unit: 'u-num', title: { fr: 'Classificateurs · suite' }, subtitle: { fr: 'ชาม · ชิ้น · หลัง · ห้อง · ต้น · เส้น · แผ่น' }, skills: S, prerequisites: ['clf-01'], oralLevel: 3, minScore: 0.6, minutes: 8,
      newConcepts: clf2, activities: clfActs(clf2, 'D’autres classificateurs courants : bols, morceaux, maisons, pièces, arbres et poteaux, objets longs et fins, objets plats.') },
    { id: 'clf-03', track: T, unit: 'u-num', title: { fr: 'Classificateurs · fin' }, subtitle: { fr: 'คู่ · เครื่อง · ฉบับ · ครั้ง…' }, skills: S, prerequisites: ['clf-02'], oralLevel: 3, minScore: 0.6, minutes: 8,
      newConcepts: clf3, activities: clfActs(clf3, 'Les derniers : paires, machines, documents, et ครั้ง pour compter les fois. En cas de doute, อัน dépanne pour les objets.') },
  ].map((l): LessonDef => ({ ...l, newConcepts: l.newConcepts.filter((id) => id.startsWith('rule:') || id.startsWith('g:') || NUM_ITEMS.some((n2) => n2.id === id) || CLF_ITEMS.some((c) => c.id === id)) }));
}
