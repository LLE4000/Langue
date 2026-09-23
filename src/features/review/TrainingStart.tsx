/** Construit une séance d'entraînement puis ouvre le lecteur de leçon en mode entraînement. */
import { useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useKnown, useLevels } from '@/app/hooks';
import { recognizer, recorder } from '@/app/services/speech';
import { buildTraining, type TrainingMode } from './training';
import { useToast } from '@/components/ui';

export function TrainingStart() {
  const { mode = 'quiz' } = useParams();
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const known = useKnown();
  const levels = useLevels();
  const toast = useToast((s) => s.show);
  useEffect(() => {
    const st = useStore.getState();
    const ctx = { known: known.concepts, srs: st.srs, levels, knownOrally: false, seen: st.seen, micAvailable: recorder.supported || recognizer.supported };
    const session = buildTraining(mode as TrainingMode, ctx, { theme: sp.get('theme') ?? undefined });
    if (!session) { toast('Pas encore assez d’éléments appris pour cet entraînement. Faites d’abord quelques leçons.'); nav('/review', { replace: true }); return; }
    st.startSession(session);
    nav('/lesson/training', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);
  return <div className="app"><div className="view ctr mut" style={{ paddingTop: 80 }}>Préparation…</div></div>;
}
