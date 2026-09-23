/**
 * Déroule une leçon (ou une séance d'entraînement) étape par étape. La séance est persistée :
 * après un rechargement, on reprend exactement où on en était.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore, type LessonSession } from '@/app/store';
import { useKnown, useLevels, useNextLesson, usePath } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { recognizer, recorder } from '@/app/services/speech';
import { planLesson, planMinutes, type RuntimeStep } from './engine';
import { isKnownOrally } from '@/curriculum/path';
import { L, T } from '@/i18n';
import { Bar, Icon, Sheet } from '@/components/ui';
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

const STEP_LABEL: Record<RuntimeStep['type'], string> = { theory: 'À retenir', flashcards: 'Découvrir', questions: 'S’entraîner', match: 'Associer', build: 'Construire', dialog: 'Conversation', reading: 'Lecture', repeat: 'Prononcer', recap: 'Bilan' };

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
  const path = usePath();
  const next = useNextLesson();
  const lesson = useMemo(() => curriculum().lessons.find((l) => l.id === id) ?? null, [id]);
  const [quitAsk, setQuitAsk] = useState(false);
  const startedAt = useRef(Date.now());
  const isTraining = id === 'training';

  // Démarre (ou reprend) la séance
  useEffect(() => {
    if (isTraining) { if (!session || !session.training) nav('/review', { replace: true }); return; }
    if (!lesson) return;
    if (session && session.lessonId === lesson.id && !session.training) return;
    const ctx = { known: known.concepts, srs, levels, knownOrally: isKnownOrally(lesson, levels), seen, micAvailable: recorder.supported || recognizer.supported };
    const steps = planLesson(lesson, ctx);
    const s: LessonSession = { lessonId: lesson.id, title: L(lesson.title), steps, index: 0, ok: 0, total: 0, xp: 0, wrong: [], startedAt: Date.now() };
    startSession(s);
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

  // Fin de leçon : validation, XP bonus, badges, minutes
  const completedRef = useRef<string | null>(null);
  const step = session?.steps[session.index];
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
  if (!session || !step) return <FullScreen title={lesson ? L(lesson.title) : ''} onBack={() => nav(-1)}><div className="ctr mut" style={{ padding: 40 }}>{t.common.loading}</div></FullScreen>;

  const total = session.steps.length;
  const progress = session.index / Math.max(1, total - 1);
  const minutesLeft = planMinutes(session.steps.slice(session.index));
  const lessonNo = lesson ? path.filter((p) => p.status !== 'granted').findIndex((p) => p.lesson.id === lesson.id) + 1 : 0;
  const key = `${session.lessonId}-${session.startedAt}-${session.index}`;

  return (
    <FullScreen title={session.training ? session.title : `${lessonNo ? `Leçon ${lessonNo}` : 'Leçon'} · ${STEP_LABEL[step.type]}`} onBack={() => setQuitAsk(true)}
      right={<button className="tb" aria-label="Quitter" onClick={() => setQuitAsk(true)}><Icon name="close" /></button>} fit={step.type === 'questions' || step.type === 'flashcards'}>
      <div className="sess"><Bar p={progress} thin /><span className="n">{session.index + 1} / {total}{step.type !== 'recap' ? ` · ≈ ${minutesLeft} min` : ''}</span></div>
      {step.type === 'theory' && <TheoryStep key={key} step={step} onDone={() => finish()} title={lesson ? L(lesson.title) : session.title} subtitle={lesson ? L(lesson.subtitle) : ''} />}
      {step.type === 'flashcards' && <FlashcardsStep key={key} step={step} onDone={finish} />}
      {step.type === 'questions' && <QuestionsStep key={key} step={step} onDone={finish} timed={session.mode === 'timed'} />}
      {step.type === 'match' && <MatchStep key={key} step={step} onDone={finish} />}
      {step.type === 'build' && <BuildStep key={key} step={step} onDone={finish} />}
      {step.type === 'dialog' && <div key={key}><DialogView id={step.id} onDone={() => finish({ xp: 5 })} /></div>}
      {step.type === 'reading' && <div key={key}><ReadingView id={step.id} onDone={() => finish({ xp: 5 })} /></div>}
      {step.type === 'repeat' && <RepeatStep key={key} step={step} onDone={finish} />}
      {step.type === 'recap' && <RecapStep key={key} session={session} lesson={lesson} next={next} onClose={quit} onNext={(nid) => { endSession(); nav(`/lesson/${nid}`, { replace: true }); }} onRetry={() => { endSession(); nav(`/lesson/${session.lessonId}`, { replace: true }); }} startedAt={startedAt.current} />}
      <Sheet open={quitAsk} onClose={() => setQuitAsk(false)} title={t.common.quit}>
        <p className="lead">{session.training ? 'Quitter l’entraînement ?' : t.lesson.quitConfirm}</p>
        <div className="stack">
          {!session.training && <button className="btn" onClick={() => nav('/')}>Mettre en pause et revenir plus tard</button>}
          <button className="btn danger" onClick={quit}>{session.training ? 'Quitter' : 'Abandonner cette tentative'}</button>
          <button className="btn ghost" onClick={() => setQuitAsk(false)}>{t.common.cancel}</button>
        </div>
      </Sheet>
    </FullScreen>
  );
}
