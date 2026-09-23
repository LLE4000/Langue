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
import { rate as srsRate, qualityFromAnswer, type SrsState, type Quality } from '@/engine/srs';
import type { Gender } from '@/engine/tokens';
import { todayKey } from '@/engine/util';
import type { RuntimeStep } from '@/features/lesson/engine';

export const STORE_VERSION = 1;
export const STORE_KEY = 'langue-v1';

export interface Profile {
  name: string;
  gender: Gender;
  source: SourceLang;
  target: TargetLang;
  levels: SkillLevels;
  createdAt: number;
  dailyGoalMinutes: number;
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
}

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
}

export const DEFAULT_SETTINGS: Settings = {
  translit: 'learning', theme: 'auto', thaiSize: 1.15, autoAudio: true, slowRate: 0.6, voiceId: '', forceTTS: false, showModern: true, hapticsOff: false,
};

export const initialState = (): PersistedState => ({
  version: STORE_VERSION, profile: null, settings: { ...DEFAULT_SETTINGS }, srs: {}, lessons: {}, errors: {}, ruleStats: {}, seen: {}, days: {}, xp: 0,
  badges: {}, favorites: {}, history: [], session: null, lastVisit: Date.now(),
});

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
}

export type Store = PersistedState & Actions;

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      ...initialState(),
      setProfile: (profile) => set({ profile }),
      setLevels: (levels) => set((s) => (s.profile ? { profile: { ...s.profile, levels } } : {})),
      updateProfile: (patch) => set((s) => (s.profile ? { profile: { ...s.profile, ...patch } } : {})),
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
        set({ srs: { ...s.srs, [itemId]: srsRate(prev, q) }, days: { ...s.days, [todayKey()]: day }, errors, ruleStats });
      },
      rateItem: (itemId, q) => {
        const s = get();
        const day = { ...(s.days[todayKey()] ?? emptyDay()) };
        day.reviews++;
        const errors = { ...s.errors };
        if (q <= 1) errors[itemId] = { n: (errors[itemId]?.n ?? 0) + 1, ok: 0, t: Date.now() };
        else if (q >= 3 && errors[itemId]) delete errors[itemId];
        set({ srs: { ...s.srs, [itemId]: srsRate(s.srs[itemId], q) }, days: { ...s.days, [todayKey()]: day }, errors });
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
      importState: (incoming) => set({ ...initialState(), ...incoming, version: STORE_VERSION, session: null }),
      resetAll: () => set({ ...initialState() }),
      touch: () => set({ lastVisit: Date.now() }),
    }),
    {
      name: STORE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => {
        const { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session, lastVisit, version } = s;
        return { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session, lastVisit, version } as Store;
      },
    },
  ),
);

/** Sélection sérialisable de l'état pour l'export. */
export function exportState(): PersistedState {
  const s = useStore.getState();
  const { profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, lastVisit } = s;
  return { version: STORE_VERSION, profile, settings, srs, lessons, errors, ruleStats, seen, days, xp, badges, favorites, history, session: null, lastVisit };
}

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
