/** Objectifs et niveaux : le parcours se recalcule immédiatement, la maîtrise acquise est conservée. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, goalsOf } from '@/app/store';
import { useLevels } from '@/app/hooks';
import { GoalPicker, LevelPicker } from '@/features/onboarding/Onboarding';
import { goalSkills, type Goals } from '@/curriculum/types';
import { T } from '@/i18n';

export function LevelsScreen() {
  const t = T();
  usePage('Objectifs et niveaux', { back: '/profile' });
  const current = useLevels();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const updateSettings = useStore((s) => s.updateSettings);
  const nav = useNavigate();
  const [levels, set] = useState(current);
  const [goals, setGoals] = useState<Goals>(goalsOf(profile));
  return (
    <>
      <div className="h2">Mon objectif</div>
      <GoalPicker value={goals} onChange={setGoals} />
      <div className="h2">Mes niveaux</div>
      <p className="lead">{t.onboarding.levelsIntro}</p>
      <LevelPicker levels={levels} onChange={set} skills={goalSkills(goals)} />
      <div className="note sm" style={{ marginTop: 14 }}>Monter un niveau marque comme acquises les leçons de ce niveau ; le baisser les remet dans le parcours. Retirer « lire et écrire » enlève les leçons d’écriture du parcours (Explorer reste complet). Votre maîtrise déjà enregistrée n’est jamais effacée.</div>
      <button className="btn" style={{ marginTop: 12 }} onClick={() => { updateProfile({ levels, goals }); if (!goals.read) updateSettings({ translit: 'always' }); nav('/'); }}>Recalculer mon parcours</button>
    </>
  );
}
