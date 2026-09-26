/** Profil : niveau et XP, compétences, badges (obtenus et prochains), activité et application. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, streakDays, levelFromXp } from '@/app/store';
import { useMetrics, useLevels, useGoals } from '@/app/hooks';
import { readRegistry } from '@/app/profiles';
import { T } from '@/i18n';
import { Bar, Icon } from '@/components/ui';
import { BADGES } from '@/features/lesson/badges';
import { goalSkills } from '@/curriculum/types';
import { GOAL_OPTIONS, goalKey } from '@/features/onboarding/Onboarding';

const plural = (n: number, s: string, p = s + 's') => `${n} ${n > 1 ? p : s}`;

export function Profile() {
  const t = T();
  usePage(t.profile.title);
  const profile = useStore((s) => s.profile)!;
  const xp = useStore((s) => s.xp);
  const days = useStore((s) => s.days);
  const badges = useStore((s) => s.badges);
  const m = useMetrics();
  const levels = useLevels();
  const lvl = levelFromXp(xp);
  const streak = streakDays(days);
  const nDays = Object.keys(days).length;
  const goals = useGoals();
  const goalLabel = GOAL_OPTIONS.find((o) => o.key === goalKey(goals))?.title ?? '';
  const people = readRegistry().list.length;
  const [allBadges, setAllBadges] = useState(false);
  const earned = BADGES.filter((b) => badges[b.id]);
  const nextBadges = BADGES.filter((b) => !badges[b.id]).slice(0, 3);
  const shown = allBadges ? BADGES : [...earned, ...nextBadges];
  const Row = ({ to, ico, t: title, s }: { to: string; ico: string; t: string; s: string }) => <Link className="row" to={to}><span className="ico">{ico}</span><span className="mid"><span className="t">{title}</span><span className="s">{s}</span></span><span className="end"><span className="chev">›</span></span></Link>;
  return (
    <>
      <div className="chead">
        <div className="cring" style={{ ['--p' as string]: Math.round((lvl.into / lvl.next) * 100) }}><b>{lvl.level}</b><small>niveau</small></div>
        <div className="mid"><div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div><div className="xs mut">{xp} XP · {lvl.next - lvl.into} XP avant le niveau {lvl.level + 1}</div><div className="row-flex" style={{ marginTop: 6, gap: 6, flexWrap: 'wrap' }}><span className="tag gold">🔥 {plural(streak, 'jour')} de suite</span><span className="tag">{plural(nDays, 'jour')} d’étude</span><span className="tag">{plural(m.lessonsDone, 'leçon')}</span></div></div>
      </div>
      <div className="h2">Mes compétences <span className="sp" /><span className="sm mut">{goalLabel}</span></div>
      <div className="prog">
        {goalSkills(goals).map((sk) => <div key={sk}><div className="k"><span>{t.skills[sk]}</span><b>{['0', 'A1', 'A2', 'B1', 'B2+'][levels[sk]]}</b></div><Bar p={m.skills[sk]} thin /></div>)}
      </div>
      <div className="prog" style={{ marginTop: 10 }}>
        {goals.read && <div><div className="k"><span>Lettres connues</span><b>{m.letters.known} / {m.letters.total}</b></div><Bar p={m.letters.progress} thin /></div>}
        <div><div className="k"><span>Mots connus</span><b>{m.words.known}</b></div><Bar p={Math.min(1, m.words.known / 300)} thin /></div>
      </div>
      <div className="h2">{t.profile.badges} <span className="sp" /><span className="sm mut">{earned.length} / {BADGES.length}</span></div>
      <div className="badges">{shown.map((b) => <div key={b.id} className={`badge ${badges[b.id] ? 'on' : ''}`} title={b.desc}><span className="e">{b.icon}</span>{b.title}<span className="xs mut" style={{ fontWeight: 500 }}>{b.desc}</span></div>)}</div>
      {BADGES.length > shown.length || allBadges ? <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setAllBadges(!allBadges)}>{allBadges ? 'Voir moins' : `Voir tous les badges (${BADGES.length})`}</button> : null}
      <div className="h2">Activité</div>
      <div className="list">
        <Row to="/profile/stats" ico="📊" t={t.profile.stats} s="Activité des derniers jours, historique" />
        <Row to="/profile/share" ico="📤" t={t.profile.share} s="Une carte à envoyer à vos proches" />
      </div>
      <div className="h2">Application</div>
      <div className="list">
        <Row to="/profile/settings" ico="⚙️" t={t.profile.settings} s="Profil, voix, exercices, affichage" />
        <Row to="/profile/levels" ico="🎚️" t="Objectif et niveaux" s={`${goalLabel} · niveau par compétence`} />
        <Row to="/profile/people" ico="👥" t="Personnes sur cet appareil" s={people > 1 ? `${people} profils · changer ou ajouter` : 'Ajouter un profil pour quelqu’un d’autre'} />
        <Row to="/profile/data" ico="💾" t={t.profile.data} s="Sauvegarder, restaurer, réinitialiser" />
      </div>
      <p className="xs mut ctr" style={{ marginTop: 16 }}><Icon name="lock" size={12} /> Tout reste sur cet appareil. Aucun compte, aucun serveur.</p>
    </>
  );
}
