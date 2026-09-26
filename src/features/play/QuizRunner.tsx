/** Série de questions chronométrée, sans repêchage : la même pour tous les joueurs d'une partie. */
import { useMemo, useRef } from 'react';
import { QuestionsStep } from '@/features/lesson/steps/QuestionsStep';
import { toQuestion, type PlayQuestion } from './quiz';

export function QuizRunner({ questions, label, onDone }: { questions: PlayQuestion[]; label: string; onDone: (r: { score: number; total: number; secs: number }) => void }) {
  const step = useMemo(() => ({ type: 'questions' as const, label: { fr: label }, questions: questions.map(toQuestion), graded: true }), [questions, label]);
  const t0 = useRef(performance.now());
  // record={false} : les réponses des joueurs ne touchent pas la mémoire de révision du profil
  return <QuestionsStep step={step} noRetry timed record={false} onDone={(r) => onDone({ score: r.ok ?? 0, total: r.total ?? questions.length, secs: (performance.now() - t0.current) / 1000 })} />;
}
