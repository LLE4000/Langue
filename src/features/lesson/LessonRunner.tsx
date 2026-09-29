/**
 * Déroule une leçon (ou une séance d'entraînement) étape par étape. La séance est persistée :
 * après un rechargement, on reprend exactement où on en était.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore, emptyReadAloud, type LessonSession } from '@/app/store';
import { useKnown, useLevels, useNextLesson } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { THEME_BY_ID } from '@/content/th';
import { lessonKind } from '@/curriculum/card';
import { isUnlocked, nextSession } from '@/features/readaloud/data';
import { recognizer, recorder } from '@/app/services/speech';
import { planLesson } from './engine';
import { StepProgressCtx, lessonProgress } from './progress';
import { isKnownOrally } from '@/curriculum/path';
import { L, T } from '@/i18n';
import { Icon, Sheet } from '@/components/ui';
import { TheoryStep } from './steps/TheoryStep';
import { FlashcardsStep } from './steps/FlashcardsStep';
import { QuestionsStep } from './steps/QuestionsStep';
import { MatchStep } from './steps/MatchStep';
import { BuildStep } from './steps/BuildStep';
import { RepeatStep } from './steps/RepeatStep';
import { RecapStep } from './steps/RecapStep';
import { DialogView } from '@/components/DialogView';
import { ReadingView } from '@/components/ReadingView';
import { checkBadges } from './badges';

export interface StepResult { ok?: number; total?: number; wrong?: string[]; xp?: number }

/** Étapes dont la barre d'action se cale en bas de l'écran (colonne flexible + espaceur `.sp`). */
const FIT_STEPS = new Set(['questions', 'flashcards', 'match', 'build', 'repeat']);

/** État de navigation d'une leçon : `from` (page d'origine, posé par le lien d'entrée), `again` (relancer le même entraînement). */
export interface LessonNavState { from?: string; again?: string }
interface NavEntry { url: string | null; index: number }
interface NavigationApi { currentEntry: NavEntry | null; entries(): NavEntry[] }

/**
 * Page d'où l'on a ouvert la leçon ou l'entraînement : `state.from` si le lien l'a posé, sinon l'entrée d'historique
 * précédente (API Navigation, quand le navigateur l'offre), sinon inconnue. Les entrées de même adresse (feuille du bas
 * ouverte) sont sautées.
 */
function originPath(state: LessonNavState | null): string | null {
  if (typeof state?.from === 'string' && state.from.startsWith('/')) return state.from;
  try {
    const n = (window as unknown as { navigation?: NavigationApi }).navigation;
    const cur = n?.currentEntry;
    if (!n || !cur?.url) return null;
    const list = n.entries();
    for (let i = cur.index - 1; i >= 0; i--) {
      const u = list[i]?.url;
      if (!u) return null;
      if (u === cur.url) continue;
      return new URL(u).hash.replace(/^#/, '') || '/';
    }
  } catch { /* navigateur sans API Navigation */ }
  return null;
}

/** Libellé du bouton de retour du bilan, d'après la page d'origine (null : page inconnue). */
function originLabel(path: string | null): string | null {
  if (path == null) return null;
  const p = path.split('?')[0].replace(/\/+$/, '') || '/';
  const theme = /^\/explore\/vocab\/([^/]+)$/.exec(p);
  if (theme) { const c = THEME_BY_ID[decodeURIComponent(theme[1])]; return c ? `Retour au thème ${L(c.name)}` : 'Retour au vocabulaire'; }
  const table: [RegExp, string][] = [
    [/^\/$/, 'Retour à l’accueil'], [/^\/path$/, 'Retour au parcours'], [/^\/read/, 'Retour à la lecture à voix haute'],
    [/^\/(review|talk)/, 'Retour aux révisions'], [/^\/explore\/vocab$/, 'Retour au vocabulaire'], [/^\/explore\/tones/, 'Retour aux tons'],
    [/^\/explore\/numbers/, 'Retour aux nombres'], [/^\/explore\/classifiers/, 'Retour aux classificateurs'], [/^\/explore\/grammar/, 'Retour à la grammaire'],
    [/^\/explore\/alphabet/, 'Retour à l’alphabet'], [/^\/explore\/vowels/, 'Retour aux voyelles'], [/^\/explore\/comprehension/, 'Retour à la compréhension orale'],
    [/^\/explore\/search/, 'Retour à la recherche'], [/^\/explore/, 'Retour à la bibliothèque'], [/^\/profile/, 'Retour au profil'], [/^\/play/, 'Retour aux défis'],
  ];
  return table.find(([re]) => re.test(p))?.[1] ?? null;
}

export function LessonRunner() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const t = T();
  const session = useStore((s) => s.session);
  const startSession = useStore((s) => s.startSession);
  const updateSession = useStore((s) => s.updateSession);
  const endSession = useStore((s) => s.endSession);
  const known = useKnown();
  const levels = useLevels();
  const srs = useStore((s) => s.srs);
  const seen = useStore((s) => s.seen);
  const next = useNextLesson();
  const lesson = useMemo(() => curriculum().lessons.find((l) => l.id === id) ?? null, [id]);
  const [quitAsk, setQuitAsk] = useState(false);
  const isTraining = id === 'training';

  // Sortie : retour à la page d'origine (historique), repli sur l'origine connue, sinon Réviser / l'Accueil.
  const navState = (loc.state as LessonNavState | null) ?? null;
  const again = navState?.again;
  const [origin] = useState(() => originPath(navState));
  const hasHistory = loc.key !== 'default' && window.history.length > 1;
  const fallback = navState?.from ?? (isTraining ? '/review' : '/');
  const backLabel = hasHistory ? (originLabel(origin) ?? 'Retour') : (originLabel(fallback) ?? 'Retour');
  const leaving = useRef(false);
  const leave = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    // Feuille « Quitter » ouverte : son entrée d'historique est dépilée avec celle de la leçon. On retire d'abord sa
    // marque, sinon la feuille, démontée par la fin de séance, ferait elle aussi un retour arrière.
    const hs = window.history.state as { sheet?: boolean } | null;
    const sheet = !!hs?.sheet;
    if (sheet) { try { window.history.replaceState({ ...hs, sheet: false }, ''); } catch { /* ignore */ } }
    if (hasHistory) nav(sheet ? -2 : -1);
    else nav(fallback, { replace: true });
  }, [hasHistory, fallback, nav]);
  // Bilan d'une leçon d'alphabet ou de voyelles : lire tout de suite à voix haute la séance que ces lettres ouvrent
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const kind = lesson ? lessonKind(lesson) : null;
  const raSess = kind === 'letters' || kind === 'vowels' ? nextSession(ra, known.concepts) : null;
  const readTo = raSess && isUnlocked(raSess, known.concepts) ? `/read/${raSess.id}` : null;
  /** Navigation qui remplace la leçon courante en gardant l'origine (leçon suivante, nouvelle tentative, autre entraînement). */
  const replaceTo = (to: string) => nav(to, { replace: true, state: { from: navState?.from, again } satisfies LessonNavState });

  // Une autre leçon est en pause : on demande avant de l'écraser
  const [conflict, setConflict] = useState<LessonSession | null>(null);
  const start = useCallback(() => {
    if (!lesson) return;
    const ctx = { known: known.concepts, srs, levels, knownOrally: isKnownOrally(lesson, levels), seen, micAvailable: recorder.supported || recognizer.supported };
    const steps = planLesson(lesson, ctx);
    const s: LessonSession = { lessonId: lesson.id, title: L(lesson.title), steps, index: 0, ok: 0, total: 0, xp: 0, wrong: [], startedAt: Date.now() };
    startSession(s);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);
  // Démarre (ou reprend) la séance
  useEffect(() => {
    if (isTraining) { if (!session || !session.training) leave(); return; }
    if (!lesson) return;
    // même leçon en cours : on reprend ; déjà terminée (bilan affiché puis quitté) : on recommence une tentative
    if (session && session.lessonId === lesson.id && !session.training && session.steps[session.index]?.type !== 'recap') return;
    const paused = session && !session.training && session.steps[session.index]?.type !== 'recap' && session.index > 0 ? session : null;
    if (paused) { setConflict(paused); return; }
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id, isTraining]);

  const finish = useCallback((res?: StepResult) => {
    const s = useStore.getState().session;
    if (!s) return;
    const ok = s.ok + (res?.ok ?? 0), total = s.total + (res?.total ?? 0), xp = s.xp + (res?.xp ?? 0);
    const wrong = [...new Set([...s.wrong, ...(res?.wrong ?? [])])];
    if (res?.xp) useStore.getState().addXp(res.xp);
    updateSession({ ok, total, xp, wrong, index: s.index + 1 });
    window.scrollTo(0, 0);
  }, [updateSession]);

  // Barre unique : avancement dans l'étape en cours (jamais en arrière), remis à zéro à chaque étape
  const step = session?.steps[session.index];
  const stepKey = session ? `${session.lessonId}-${session.startedAt}-${session.index}` : '';
  const [sub, setSub] = useState({ key: '', f: 0 });
  const reportSub = useCallback((f: number) => setSub((s) => (s.key === stepKey && s.f >= f ? s : { key: stepKey, f: s.key === stepKey ? Math.max(s.f, f) : f })), [stepKey]);

  // Fin de leçon : validation, XP bonus, badges, minutes
  const completedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!session || step?.type !== 'recap' || completedRef.current === session.lessonId + session.startedAt) return;
    completedRef.current = session.lessonId + session.startedAt;
    const st = useStore.getState();
    const minutes = Math.max(1, Math.round((Date.now() - session.startedAt) / 60000));
    st.addMinutes(minutes);
    if (!session.training && lesson) {
      const passed = st.completeLesson(lesson.id, session.ok, session.total, lesson.minScore);
      const bonus = passed ? 15 + (session.total && session.ok === session.total ? 10 : 0) : 5;
      st.addXp(bonus);
      updateSession({ xp: session.xp + bonus });
      st.logHistory('lesson', L(lesson.title), session.ok, session.total);
    } else if (session.training) {
      st.logHistory('training', session.title, session.ok, session.total);
    }
    checkBadges(useStore.getState()).forEach((b) => useStore.getState().awardBadge(b.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step?.type, session?.index]);

  const quit = () => { endSession(); leave(); };

  if (!isTraining && !lesson) return <FullScreen title="Leçon introuvable" onBack={leave}><div className="empty">Cette leçon n’existe pas.</div></FullScreen>;
  if (conflict && lesson) {
    return (
      <FullScreen title={L(lesson.title)} onBack={leave}>
        <div className="recap mt-5"><div className="medal"><Icon name="pause" /></div><div className="title-xl">« {conflict.title} » est en pause</div><p className="mut sm mt-2">Étape {conflict.index + 1} sur {conflict.steps.length}. Commencer une autre leçon abandonne cette tentative.</p></div>
        <div className="stack mt-4">
          <button className="btn" onClick={() => replaceTo(`/lesson/${conflict.lessonId}`)}>Reprendre « {conflict.title} »</button>
          <button className="btn ghost" onClick={() => { setConflict(null); endSession(); start(); }}>Abandonner et commencer « {L(lesson.title)} »</button>
        </div>
      </FullScreen>
    );
  }
  if (!session || !step) return <FullScreen title={lesson ? L(lesson.title) : ''} onBack={leave}><div className="ctr mut empty">{t.common.loading}</div></FullScreen>;

  const key = stepKey;
  const progress = lessonProgress(session.steps, session.index, sub.key === key ? sub.f : 0);
  // Sans théorie en tête, on rappelle discrètement le titre au premier écran (la barre n'en a pas)
  const showTitle = session.index === 0 && step.type !== 'theory' && step.type !== 'recap';
  const askQuit = () => (step.type === 'recap' ? quit() : setQuitAsk(true));

  return (
    <FullScreen title={session.title} onBack={askQuit} progress={progress} fit={FIT_STEPS.has(step.type)}>
      <StepProgressCtx.Provider value={reportSub}>
      {showTitle && <p className="eyebrow ctr mb-2">{session.title}</p>}
      {step.type === 'theory' && <TheoryStep key={key} step={step} onDone={() => finish()} title={lesson ? L(lesson.title) : session.title} subtitle={lesson ? L(lesson.subtitle) : ''} lesson={lesson ?? undefined} />}
      {step.type === 'flashcards' && <FlashcardsStep key={key} step={step} onDone={finish} />}
      {step.type === 'questions' && <QuestionsStep key={key} step={step} onDone={finish} timed={session.mode === 'timed'} />}
      {step.type === 'match' && <MatchStep key={key} step={step} onDone={finish} />}
      {step.type === 'build' && <BuildStep key={key} step={step} onDone={finish} />}
      {step.type === 'dialog' && <div key={key}><DialogView id={step.id} onDone={() => finish({ xp: 5 })} doneLabel={t.common.continue} /></div>}
      {step.type === 'reading' && <div key={key}><ReadingView id={step.id} onDone={() => finish({ xp: 5 })} doneLabel={t.common.continue} /></div>}
      {step.type === 'repeat' && <RepeatStep key={key} step={step} onDone={finish} />}
      {step.type === 'recap' && <RecapStep key={key} session={session} lesson={lesson} next={next} backLabel={backLabel} onClose={quit}
        onNext={(nid) => { endSession(); replaceTo(`/lesson/${nid}`); }} onRetry={() => { endSession(); replaceTo(`/lesson/${session.lessonId}`); }}
        onOther={isTraining && !(origin && /^\/review(\?|$)/.test(origin)) ? () => { endSession(); nav('/review', { replace: true }); } : undefined}
        onAgain={isTraining && again ? () => { endSession(); replaceTo(again); } : undefined}
        onRead={readTo ? () => { endSession(); replaceTo(readTo); } : undefined} readLabel={kind === 'vowels' ? 'Lire ces voyelles à voix haute' : 'Lire ces lettres à voix haute'} />}
      </StepProgressCtx.Provider>
      <Sheet open={quitAsk} onClose={() => setQuitAsk(false)} title={t.common.quit} footer={null}>
        <p className="lead">{session.training ? 'Quitter l’entraînement ?' : t.lesson.quitConfirm}</p>
        <div className="stack">
          {!session.training && <button className="btn" onClick={leave}>Mettre en pause · je reprendrai ici</button>}
          <button className="btn danger" onClick={quit}>{session.training ? 'Quitter' : 'Abandonner · cette tentative est perdue'}</button>
          <button className="btn ghost" onClick={() => setQuitAsk(false)}>{t.common.cancel}</button>
        </div>
      </Sheet>
    </FullScreen>
  );
}
