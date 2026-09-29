/**
 * Objectif, rythme et niveaux : l'objectif (parler / lire…) et les niveaux recalculent le parcours quand on valide
 * (la maîtrise acquise est conservée) ; le rythme (minutes par jour) s'enregistre aussitôt, sans toucher au parcours.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, goalsOf } from '@/app/store';
import { useLevels } from '@/app/hooks';
import { GoalPicker, LevelPicker } from '@/features/onboarding/Onboarding';
import { goalSkills, SKILLS, type Goals } from '@/curriculum/types';
import { Segmented, useToast } from '@/components/ui';

export function LevelsScreen() {
  usePage('Objectif, rythme et niveaux', { back: '/profile' });
  const current = useLevels();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const updateSettings = useStore((s) => s.updateSettings);
  const toast = useToast((s) => s.show);
  const nav = useNavigate();
  const [levels, set] = useState(current);
  const [goals, setGoals] = useState<Goals>(goalsOf(profile));
  const g0 = goalsOf(profile);
  const changed = goals.speak !== g0.speak || goals.read !== g0.read || SKILLS.some((sk) => levels[sk] !== current[sk]);
  const apply = () => { updateProfile({ levels, goals }); if (!goals.read) updateSettings({ translit: 'always' }); toast('Parcours recalculé.'); nav('/'); };
  return (
    <>
      <div className="h2 mt-0">Mon objectif</div>
      <GoalPicker value={goals} onChange={setGoals} />
      <div className="h2">Mon rythme</div>
      <p className="note-under">Minutes d’étude par jour, pour le compteur de l’accueil et le calendrier des Statistiques. Enregistré aussitôt, sans changer le parcours.</p>
      <Segmented value={profile?.dailyGoalMinutes ?? 15} options={[5, 10, 15, 30].map((g) => ({ v: g, label: `${g} min` }))} onChange={(g) => updateProfile({ dailyGoalMinutes: g })} />
      <div className="h2">Mes niveaux</div>
      <p className="note-under">Soyez précis : le parcours saute ce que vous savez déjà.</p>
      <LevelPicker levels={levels} onChange={set} skills={goalSkills(goals)} />
      <div className="note plain sm">Monter un niveau marque comme acquises les leçons de ce niveau&#8239;; le baisser les remet dans le parcours. Retirer « lire et écrire » enlève les leçons d’écriture du parcours (la bibliothèque reste complète). Votre maîtrise déjà enregistrée n’est jamais effacée.</div>
      <div className="qfoot">
        <div className="meta"><span>{changed ? 'Des changements sont en attente.' : 'Aucun changement pour l’instant.'}</span></div>
        <button className="btn" disabled={!changed} onClick={apply}>Recalculer mon parcours</button>
      </div>
    </>
  );
}
