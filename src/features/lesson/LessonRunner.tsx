/**
 * Déroule une leçon (ou une séance d'entraînement) étape par étape. La séance est persistée :
 * après un rechargement, on reprend exactement où on en était.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore, type LessonSession } from '@/app/store';
import { useKnown, useLevels, useNextLesson } from '@/app/hooks';
import { curriculum } from '@/content/packs';
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

export function LessonRunner() {
  const { id = '' } = useParams();
  const nav = useNavigate();
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
  const startedAt = useRef(Date.now());
  const isTraining = id === 'training';

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
    if (isTraining) { if (!session || !session.training) nav('/review', { replace: true }); return; }
    if (!lesson) return;
    if (session && session.lessonId === lesson.id && !session.training) return;
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

  const quit = () => { endSession(); nav(isTraining ? '/review' : '/', { replace: true }); };

  if (!isTraining && !lesson) return <FullScreen title="Leçon introuvable" onBack={() => nav('/')}><div className="empty">Cette leçon n’existe pas.</div></FullScreen>;
  if (conflict && lesson) {
    return (
      <FullScreen title={L(lesson.title)} onBack={() => nav(-1)}>
        <div className="recap mt-5"><div className="medal"><Icon name="pause" /></div><div className="title-xl">« {conflict.title} » est en pause</div><p className="mut sm mt-2">Étape {conflict.index + 1} sur {conflict.steps.length}. Commencer une autre leçon abandonne cette tentative.</p></div>
        <div className="stack mt-4">
          <button className="btn" onClick={() => nav(`/lesson/${conflict.lessonId}`, { replace: true })}>Reprendre « {conflict.title} »</button>
          <button className="btn ghost" onClick={() => { setConflict(null); endSession(); start(); }}>Abandonner et commencer « {L(lesson.title)} »</button>
        </div>
      </FullScreen>
    );
  }
  if (!session || !step) return <FullScreen title={lesson ? L(lesson.title) : ''} onBack={() => nav(-1)}><div className="ctr mut empty">{t.common.loading}</div></FullScreen>;

  const key = stepKey;
  const progress = lessonProgress(session.steps, session.index, sub.key === key ? sub.f : 0);
  // Sans théorie en tête, on rappelle discrètement le titre au premier écran (la barre n'en a pas)
  const showTitle = session.index === 0 && step.type !== 'theory' && step.type !== 'recap';
  const askQuit = () => (step.type === 'recap' ? quit() : setQuitAsk(true));

  return (
    <FullScreen title={session.title} onBack={askQuit} progress={progress} fit={step.type === 'questions' || step.type === 'flashcards'}>
      <StepProgressCtx.Provider value={reportSub}>
      {showTitle && <p className="eyebrow ctr mb-2">{session.title}</p>}
      {step.type === 'theory' && <TheoryStep key={key} step={step} onDone={() => finish()} title={lesson ? L(lesson.title) : session.title} subtitle={lesson ? L(lesson.subtitle) : ''} />}
      {step.type === 'flashcards' && <FlashcardsStep key={key} step={step} onDone={finish} />}
      {step.type === 'questions' && <QuestionsStep key={key} step={step} onDone={finish} timed={session.mode === 'timed'} />}
      {step.type === 'match' && <MatchStep key={key} step={step} onDone={finish} />}
      {step.type === 'build' && <BuildStep key={key} step={step} onDone={finish} />}
      {step.type === 'dialog' && <div key={key}><DialogView id={step.id} onDone={() => finish({ xp: 5 })} doneLabel={t.common.continue} /></div>}
      {step.type === 'reading' && <div key={key}><ReadingView id={step.id} onDone={() => finish({ xp: 5 })} doneLabel={t.common.continue} /></div>}
      {step.type === 'repeat' && <RepeatStep key={key} step={step} onDone={finish} />}
      {step.type === 'recap' && <RecapStep key={key} session={session} lesson={lesson} next={next} onClose={quit} onNext={(nid) => { endSession(); nav(`/lesson/${nid}`, { replace: true }); }} onRetry={() => { endSession(); nav(`/lesson/${session.lessonId}`, { replace: true }); }} startedAt={startedAt.current} />}
      </StepProgressCtx.Provider>
      <Sheet open={quitAsk} onClose={() => setQuitAsk(false)} title={t.common.quit} footer={null}>
        <p className="lead">{session.training ? 'Quitter l’entraînement ?' : t.lesson.quitConfirm}</p>
        <div className="stack">
          {!session.training && <button className="btn" onClick={() => nav('/')}>Mettre en pause · je reprendrai ici</button>}
          <button className="btn danger" onClick={quit}>{session.training ? 'Quitter' : 'Abandonner · cette tentative est perdue'}</button>
          <button className="btn ghost" onClick={() => setQuitAsk(false)}>{t.common.cancel}</button>
        </div>
      </Sheet>
    </FullScreen>
  );
}
