/**
 * Construit une séance d'entraînement puis ouvre le lecteur de leçon en mode entraînement. La navigation remplace
 * cette page : le retour (et la fin de l'entraînement) ramène à la page d'où il a été lancé.
 */
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBack } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useKnown, useLevels } from '@/app/hooks';
import { recognizer, recorder } from '@/app/services/speech';
import { buildTraining, type TrainingMode } from './training';
import { useToast } from '@/components/ui';
import type { LessonNavState } from '@/features/lesson/LessonRunner';

export function TrainingStart() {
  const { mode = 'quiz' } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const loc = useLocation();
  const back = useBack((loc.state as LessonNavState | null)?.from ?? '/review');
  const done = useRef('');
  const known = useKnown();
  const levels = useLevels();
  const toast = useToast((s) => s.show);
  useEffect(() => {
    // une seule préparation (et un seul retour arrière) même si l'effet est rejoué
    if (done.current === loc.key) return;
    done.current = loc.key;
    const st = useStore.getState();
    const ctx = { known: known.concepts, srs: st.srs, levels, knownOrally: false, seen: st.seen, micAvailable: recorder.supported || recognizer.supported };
    const session = buildTraining(mode as TrainingMode, ctx, { theme: sp.get('theme') ?? undefined, set: sp.get('set') ?? undefined });
    if (!session) {
      const why: Partial<Record<TrainingMode, string>> = {
        pronunciation: 'Il faut quelques mots appris pour l’entraînement de prononciation. Faites d’abord une leçon de conversation.',
        speed: 'La lecture rapide demande des mots lisibles avec les lettres que vous avez apprises.',
        dictation: 'La dictée demande des mots lisibles avec les lettres que vous avez apprises.',
        tones: 'L’entraînement aux tons commence après la première leçon sur les tons.',
        weak: 'Pas encore de points faibles repérés (il en faut au moins 3).',
        review: 'Rien n’est à réviser pour l’instant.',
      };
      toast(why[mode as TrainingMode] ?? 'Pas encore assez d’éléments appris pour cet entraînement. Faites d’abord quelques leçons.');
      // on reste sur la page d'origine, où s'affiche le message
      back(); return;
    }
    st.startSession(session);
    const state: LessonNavState = { from: (loc.state as LessonNavState | null)?.from, again: sp.get('theme') || sp.get('set') ? loc.pathname + loc.search : undefined };
    nav('/lesson/training', { replace: true, state });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  return <div className="app"><div className="view ctr mut" style={{ paddingTop: 80 }}>Préparation…</div></div>;
}
