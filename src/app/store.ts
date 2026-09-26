/**
 * État de l'application (zustand) persisté dans IndexedDB (idb-keyval).
 * Tout reste sur l'appareil. L'export/import JSON permet de ne jamais perdre sa progression.
 * Un futur backend de synchronisation n'aurait qu'à lire/écrire ce même objet `PersistedState`.
 */
import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import type { SourceLang, TargetLang } from '@/content/types';
import type { SkillLevels } from '@/curriculum/path';
import type { Goals } from '@/curriculum/types';
import { activeProfileId, storageKeyFor, syncActiveName } from './profiles';
import { updatePronStat, type PronStat, type Strictness } from '@/engine/audio/pronunciation';
import type { VoiceGender } from '@/engine/audio/tts';
import { rate as srsRate, qualityFromAnswer, type SrsState, type Quality } from '@/engine/srs';
import type { Gender } from '@/engine/tokens';
import { todayKey } from '@/engine/util';
import type { RuntimeStep } from '@/features/lesson/engine';
import type { ActivityRecord } from '@/engine/progress';

export const STORE_VERSION = 2;
/** Clé de stockage du profil actif (voir profiles.ts). */
export const STORE_KEY = storageKeyFor(activeProfileId());

export interface Profile {
  name: string;
  gender: Gender;
  source: SourceLang;
  target: TargetLang;
  levels: SkillLevels;
  createdAt: number;
  dailyGoalMinutes: number;
  /** objectifs (absent chez les anciens profils = les deux) */
  goals?: Goals;
}

/** Un défi à distance envoyé ou reçu (voir features/play). */
export interface ChallengeRecord {
  id: string; // partie « questions » du code : identifie le défi des deux côtés
  code: string; // dernier code connu (avec les résultats)
  dir: 'sent' | 'received';
  from: string; // prénom de l'auteur du défi
  createdAt: number;
  mine?: { score: number; total: number; secs: number };
  theirs?: { name: string; score: number; total: number; secs: number };
}

export type TranslitMode = 'always' | 'learning' | 'hidden';

export interface Settings {
  translit: TranslitMode;
  theme: 'auto' | 'light' | 'dark';
  thaiSize: number; // 1 · 1.15 · 1.3
  autoAudio: boolean;
  slowRate: number; // 0.4–0.85
  voiceId: string;
  forceTTS: boolean;
  showModern: boolean; // afficher aussi la forme moderne (sans boucles)
  hapticsOff: boolean;
  autoAdvance: boolean; // après une bonne réponse, passer seul à la question suivante
  pronStrictness: Strictness; // sévérité du contrôle de prononciation
  /** Voix souhaitée : comme mon profil, homme ou femme. */
  voiceGender: 'auto' | VoiceGender;
  /** Genre attribué à la main à des voix que l'application ne sait pas classer (id → genre). */
  voiceGenders: Record<string, VoiceGender>;
  /** Sans voix du genre voulu : approcher en rendant la voix plus grave / plus aiguë. */
  voiceApprox: boolean;
  /** Préférences du mode Écoute en boucle. */
  listen: ListenPrefs;
}

export interface ListenPrefs {
  set: 'cons' | 'vow' | 'words' | 'custom';
  custom: string[]; // identifiants d'éléments
  what: 'sound' | 'name' | 'both';
  speeds: 1 | 2 | 3; // normal · + lent · + très lent
  order: 'order' | 'shuffle';
  guess: boolean; // deviner d'abord (le caractère apparaît après la première lecture)
}
export const DEFAULT_LISTEN: ListenPrefs = { set: 'cons', custom: [], what: 'name', speeds: 2, order: 'order', guess: false };

export interface LessonRecord { done: boolean; best: number; tries: number; last: number; score?: number; total?: number }
export interface DayStats { minutes: number; answers: number; correct: number; lessons: number; xp: number; reviews: number }
export interface ErrorRecord { n: number; ok: number; t: number }

export interface LessonSession {
  lessonId: string;
  title: string;
  steps: RuntimeStep[];
  index: number;
  ok: number;
  total: number;
  xp: number;
  wrong: string[]; // identifiants d'éléments ratés
  startedAt: number;
  training?: boolean; // séance d'entraînement (ne valide pas de leçon)
  mode?: string; // mode d'entraînement
}

export interface PersistedState {
  version: number;
  profile: Profile | null;
  settings: Settings;
  srs: Record<string, SrsState>;
  lessons: Record<string, LessonRecord>;
  errors: Record<string, ErrorRecord>;
  ruleStats: Record<string, { ok: number; ko: number }>;
  seen: Record<string, number>;
  days: Record<string, DayStats>;
  xp: number;
  badges: Record<string, number>;
  favorites: Record<string, number>;
  history: { t: number; kind: string; label: string; score?: number; total?: number }[];
  session: LessonSession | null;
  lastVisit: number;
  challenges: ChallengeRecord[];
  /** notes de prononciation (reconnaissance vocale) par élément */
  pron: Record<string, PronStat>;
  /** date à laquelle chaque élément a été su pour la première fois (ne baisse jamais, base de la progression) */
  acquired: Record<string, number>;
  /** activités de contenu : « comp:<dialogue> » (meilleur score), « dialog:<id> », « reading:<id> » */
  activities: Record<string, ActivityRecord>;
  /** instantané quotidien de la progression : jour → [global, ...compétences] */
  progressLog: Record<string, number[]>;
  /** lecture à voix haute : séances, maîtrise par consonne / voyelle / règle de ton, lectures ratées à reprendre */
  readAloud: ReadAloudState;
}

export interface RaStat { ok: number; n: number; t: number }
export interface RaItemStat extends RaStat { thai: string; rom: string; last: string; detail?: string }
export interface ReadAloudState {
  sessions: Record<string, { runs: number; best: number; last: number; total: number; t: number }>;
  /** pondéré vers le récent : chaque séance compte davantage que les anciennes */
  tags: Record<string, RaStat>;
  items: Record<string, RaItemStat>;
}
export const emptyReadAloud = (): ReadAloudState => ({ sessions: {}, tags: {}, items: {} });
export interface ReadAloudRunResult {
  sessionId?: string; label: string; minutes: number;
  ok: number; total: number;
  tags: Record<string, { ok: number; n: number }>;
  items: { key: string; thai: string; rom: string; verdict: string; detail?: string }[];
}

export const DEFAULT_SETTINGS: Settings = {
  translit: 'learning', theme: 'auto', thaiSize: 1.15, autoAudio: true, slowRate: 0.6, voiceId: '', forceTTS: false, showModern: true, hapticsOff: false, autoAdvance: true, pronStrictness: 'normal',
  voiceGender: 'auto', voiceGenders: {}, voiceApprox: true, listen: DEFAULT_LISTEN,
};

export const initialState = (): PersistedState => ({
  version: STORE_VERSION, profile: null, settings: { ...DEFAULT_SETTINGS }, srs: {}, lessons: {}, errors: {}, ruleStats: {}, seen: {}, days: {}, xp: 0,
  badges: {}, favorites: {}, history: [], session: null, lastVisit: Date.now(), challenges: [], pron: {}, acquired: {}, activities: {}, progressLog: {}, readAloud: emptyReadAloud(),
});

/** Marque comme acquis les éléments dont la nouvelle note vaut « connu » (3) ou plus. */
const acquire = (acquired: Record<string, number>, id: string, st: SrsState) => (st.q >= 3 && !acquired[id] ? { ...acquired, [id]: Date.now() } : acquired);

const idbStorage: StateStorage = {
  getItem: async (name) => (await idbGet<string>(name)) ?? null,
  setItem: async (name, value) => { await idbSet(name, value); },
  removeItem: async (name) => { await idbDel(name); },
};

const emptyDay = (): DayStats => ({ minutes: 0, answers: 0, correct: 0, lessons: 0, xp: 0, reviews: 0 });

export interface Actions {
  setProfile(p: Profile): void;
  setLevels(levels: SkillLevels): void;
  updateProfile(patch: Partial<Profile>): void;
  updateSettings(patch: Partial<Settings>): void;
  /** Enregistre une réponse d'exercice et met à jour la répétition espacée. */
  answer(itemId: string, ok: boolean, seconds?: number, ruleKey?: string): void;
  /** Note explicite d'une flashcard (0–4). */
  rateItem(itemId: string, q: Quality): void;
  markSeen(key: string): void;
  addXp(n: number): void;
  addMinutes(n: number): void;
  toggleFavorite(id: string): void;
  startSession(s: LessonSession): void;
  updateSession(patch: Partial<LessonSession>): void;
  endSession(): void;
  completeLesson(lessonId: string, ok: number, total: number, minScore: number): boolean;
  logHistory(kind: string, label: string, score?: number, total?: number): void;
  awardBadge(id: string): void;
  importState(s: PersistedState): void;
  resetAll(): void;
  touch(): void;
  /** Enregistre ou met à jour un défi (par identifiant). */
  saveChallenge(c: ChallengeRecord): void;
  removeChallenge(id: string): void;
  /** Note de prononciation 0–10 pour un élément (une bonne note compte aussi comme une réponse juste). */
  recordPronunciation(itemId: string, score: number): void;
  /** Activité de contenu terminée (compréhension, dialogue, lecture) : garde le meilleur score. */
  recordActivity(key: string, score?: number, total?: number): void;
  /** Instantané du jour de la progression (n'écrit que si les valeurs changent). */
  logProgress(day: string, values: number[]): void;
  /** Fin d'une série de lecture à voix haute : maîtrise par étiquette, lectures à reprendre, répétition espacée. */
  recordReadAloud(r: ReadAloudRunResult): void;
}

export type Store = PersistedState & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setProfile: (profile) => { syncActiveName(profile.name); set({ profile }); },
      setLevels: (levels) => set((s) => (s.profile ? { profile: { ...s.profile, levels } } : {})),
      updateProfile: (patch) => set((s) => { if (!s.profile) return {}; const profile = { ...s.profile, ...patch }; syncActiveName(profile.name); return { profile }; }),
      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      answer: (itemId, ok, seconds, ruleKey) => {
        const s = get();
        const prev = s.srs[itemId];
        const q = qualityFromAnswer(ok, prev, seconds);
        const day = { ...(s.days[todayKey()] ?? emptyDay()) };
        day.answers++;
        if (ok) day.correct++;
        const errors = { ...s.errors };
        if (!ok) errors[itemId] = { n: (errors[itemId]?.n ?? 0) + 1, ok: 0, t: Date.now() };
        else if (errors[itemId]) { const e = { ...errors[itemId], ok: errors[itemId].ok + 1 }; if (e.ok >= 2) delete errors[itemId]; else errors[itemId] = e; }
        const ruleStats = { ...s.ruleStats };
        if (ruleKey) { const r = ruleStats[ruleKey] ?? { ok: 0, ko: 0 }; ruleStats[ruleKey] = ok ? { ...r, ok: r.ok + 1 } : { ...r, ko: r.ko + 1 }; }
        const next = srsRate(prev, q);
        set({ srs: { ...s.srs, [itemId]: next }, days: { ...s.days, [todayKey()]: day }, errors, ruleStats, acquired: acquire(s.acquired, itemId, next) });
      },
      rateItem: (itemId, q) => {
        const s = get();
        const day = { ...(s.days[todayKey()] ?? emptyDay()) };
        day.reviews++;
        const errors = { ...s.errors };
        if (q <= 1) errors[itemId] = { n: (errors[itemId]?.n ?? 0) + 1, ok: 0, t: Date.now() };
        else if (q >= 3 && errors[itemId]) delete errors[itemId];
        const next = srsRate(s.srs[itemId], q);
        set({ srs: { ...s.srs, [itemId]: next }, days: { ...s.days, [todayKey()]: day }, errors, acquired: acquire(s.acquired, itemId, next) });
      },
      markSeen: (key) => set((s) => ({ seen: { ...s.seen, [key]: Date.now() } })),
      addXp: (n) => set((s) => { const day = { ...(s.days[todayKey()] ?? emptyDay()) }; day.xp += n; return { xp: s.xp + n, days: { ...s.days, [todayKey()]: day } }; }),
      addMinutes: (n) => set((s) => { const day = { ...(s.days[todayKey()] ?? emptyDay()) }; day.minutes += n; return { days: { ...s.days, [todayKey()]: day } }; }),
      toggleFavorite: (id) => set((s) => { const f = { ...s.favorites }; if (f[id]) delete f[id]; else f[id] = Date.now(); return { favorites: f }; }),
      startSession: (session) => set({ session }),
      updateSession: (patch) => set((s) => (s.session ? { session: { ...s.session, ...patch } } : {})),
      endSession: () => set({ session: null }),
      completeLesson: (lessonId, ok, total, minScore) => {
        const s = get();
        const passed = total === 0 ? true : ok / total >= minScore;
        const prev = s.lessons[lessonId];
        const rec: LessonRecord = { done: (prev?.done ?? false) || passed, best: Math.max(prev?.best ?? 0, total ? ok / total : 1), tries: (prev?.tries ?? 0) + 1, last: Date.now(), score: ok, total };
        const day = { ...(s.days[todayKey()] ?? emptyDay()) };
        if (passed) day.lessons++;
        set({ lessons: { ...s.lessons, [lessonId]: rec }, days: { ...s.days, [todayKey()]: day } });
        return passed;
      },
      logHistory: (kind, label, score, total) => set((s) => ({ history: [{ t: Date.now(), kind, label, score, total }, ...s.history].slice(0, 200) })),
      awardBadge: (id) => set((s) => (s.badges[id] ? {} : { badges: { ...s.badges, [id]: Date.now() } })),
      importState: (incoming) => { if (incoming.profile) syncActiveName(incoming.profile.name); set({ ...initialState(), ...incoming, version: STORE_VERSION, session: null, challenges: incoming.challenges ?? [], pron: incoming.pron ?? {}, acquired: incoming.acquired ?? {}, activities: incoming.activities ?? {}, progressLog: incoming.progressLog ?? {}, readAloud: incoming.readAloud ?? emptyReadAloud() }); },
      resetAll: () => { syncActiveName(''); set({ ...initialState() }); },
      touch: () => set({ lastVisit: Date.now() }),
      saveChallenge: (c) => set((s) => ({ challenges: [c, ...s.challenges.filter((x) => x.id !== c.id)].slice(0, 50) })),
      removeChallenge: (id) => set((s) => ({ challenges: s.challenges.filter((x) => x.id !== id) })),
      recordPronunciation: (itemId, score) => {
        set((s) => ({ pron: { ...s.pron, [itemId]: updatePronStat(s.pron[itemId], score) } }));
        if (score >= 9) get().answer(itemId, true);
        get().addXp(score >= 9 ? 3 : score >= 6 ? 1 : 0);
      },
      recordActivity: (key, score, total) => set((s) => {
        const prev = s.activities[key];
        const rec: ActivityRecord = { n: (prev?.n ?? 0) + 1, t: Date.now(), total: total ?? prev?.total, best: score == null ? prev?.best : Math.max(prev?.best ?? 0, score) };
        return { activities: { ...s.activities, [key]: rec } };
      }),
      recordReadAloud: (r) => {
        const now = Date.now();
        set((s) => {
          const ra = s.readAloud ?? emptyReadAloud();
          const tags = { ...ra.tags };
          for (const [k, v] of Object.entries(r.tags)) { const p = tags[k]; tags[k] = { ok: (p?.ok ?? 0) * 0.8 + v.ok, n: (p?.n ?? 0) * 0.8 + v.n, t: now }; }
          const items = { ...ra.items };
          for (const it of r.items) {
            if (it.verdict === 'none') continue;
            const p = items[it.key];
            items[it.key] = { thai: it.thai, rom: it.rom, ok: (p?.ok ?? 0) + (it.verdict === 'ok' ? 1 : 0), n: (p?.n ?? 0) + 1, t: now, last: it.verdict, detail: it.verdict === 'ok' ? undefined : it.detail };
          }
          // on garde les 900 lectures les plus récentes
          const keys = Object.keys(items);
          if (keys.length > 900) for (const k of keys.sort((a, b) => items[a].t - items[b].t).slice(0, keys.length - 900)) delete items[k];
          const sessions = { ...ra.sessions };
          if (r.sessionId) { const p = sessions[r.sessionId]; const pct = r.total ? Math.round((100 * r.ok) / r.total) : 0; sessions[r.sessionId] = { runs: (p?.runs ?? 0) + 1, best: Math.max(p?.best ?? 0, pct), last: pct, total: r.total, t: now }; }
          return { readAloud: { sessions, tags, items } };
        });
        // Répétition espacée : une réponse par consonne / voyelle / règle travaillée au moins trois fois (l’appelant ne transmet que des éléments connus)
        for (const [k, v] of Object.entries(r.tags)) if (v.n >= 3 && /^(c|v|rule):/.test(k)) get().answer(k, v.ok / v.n >= 0.8);
        if (r.minutes > 0) get().addMinutes(r.minutes);
        get().addXp(Math.round(r.ok / 3));
        get().logHistory('readaloud', r.label, r.ok, r.total);
        if (r.sessionId) get().recordActivity('read:' + r.sessionId, r.ok, r.total);
      },
      logProgress: (day, values) => set((s) => {
        const prev = s.progressLog[day];
        if (prev && prev.length === values.length && prev.every((v, i) => v === values[i])) return {};
        const keys = Object.keys(s.progressLog).sort();
        const log = { ...s.progressLog, [day]: values };
        for (const k of keys.slice(0, Math.max(0, keys.length - 180))) delete log[k]; // 180 jours d'historique
        return { progressLog: log };
      }),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => idbStorage),
      // Les réglages ajoutés dans une nouvelle version prennent leur valeur par défaut chez les anciens utilisateurs.
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<PersistedState>;
        return { ...current, ...p, version: STORE_VERSION, settings: { ...DEFAULT_SETTINGS, ...(p.settings ?? {}) }, challenges: p.challenges ?? [], pron: p.pron ?? {}, acquired: p.acquired ?? {}, activities: p.activities ?? {}, progressLog: p.progressLog ?? {}, readAloud: p.readAloud ?? emptyReadAloud() };
      },
      // zustand ne rappelle `migrate` qu'en cas de changement de version : les nouvelles clés ont déjà leur défaut via `merge`.
      migrate: (persisted) => persisted as Store,
      partialize: (s) => {
        const { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session, lastVisit, version, challenges, pron, acquired, activities, progressLog, readAloud } = s;
        return { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session, lastVisit, version, challenges, pron, acquired, activities, progressLog, readAloud } as Store;
      },
    },
  ),
);

/** Sélection sérialisable de l'état pour l'export. */
export function exportState(): PersistedState {
  const s = useStore.getState();
  const { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, lastVisit, challenges, pron, acquired, activities, progressLog, readAloud } = s;
  return { version: STORE_VERSION, profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session: null, lastVisit, challenges, pron, acquired, activities, progressLog, readAloud };
}

/** Objectifs effectifs d'un profil (les anciens profils n'en ont pas : les deux). */
export const goalsOf = (p: Profile | null | undefined): Goals => p?.goals ?? { speak: true, read: true };

export function isValidExport(o: unknown): o is PersistedState {
  return !!o && typeof o === 'object' && 'srs' in o && 'settings' in o && 'lessons' in o;
}

/** Série de jours consécutifs avec activité (aujourd'hui ou hier inclus). */
export function streakDays(days: Record<string, DayStats>): number {
  const active = (k: string) => { const d = days[k]; return !!d && (d.answers > 0 || d.lessons > 0 || d.reviews > 0); };
  let n = 0;
  const d = new Date();
  const key = (x: Date) => x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0');
  if (!active(key(d))) d.setDate(d.getDate() - 1);
  while (active(key(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/** Niveau de gamification à partir des XP (progression douce). */
export function levelFromXp(xp: number): { level: number; into: number; next: number } {
  let level = 1, need = 100, acc = 0;
  while (xp >= acc + need) { acc += need; level++; need = Math.round(need * 1.25); }
  return { level, into: xp - acc, next: need };
}
