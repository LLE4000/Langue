/** Ajuster ses niveaux par compétence : le parcours se recalcule immédiatement. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useLevels } from '@/app/hooks';
import { LevelPicker } from '@/features/onboarding/Onboarding';
import { T } from '@/i18n';

export function LevelsScreen() {
  const t = T();
  usePage(t.profile.levels, { back: '/profile' });
  const current = useLevels();
  const setLevels = useStore((s) => s.setLevels);
  const nav = useNavigate();
  const [levels, set] = useState(current);
  return (
    <>
      <p className="lead">{t.onboarding.levelsIntro}</p>
      <LevelPicker levels={levels} onChange={set} />
      <div className="note sm" style={{ marginTop: 14 }}>Monter un niveau marque comme acquises les leçons de ce niveau ; le baisser les remet dans le parcours. Votre maîtrise déjà enregistrée n’est jamais effacée.</div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => { setLevels(levels); nav('/'); }}>Recalculer mon parcours</button>
    </>
  );
}
