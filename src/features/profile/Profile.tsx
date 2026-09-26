/** Profil : niveau et XP, compétences, badges (obtenus et prochains), activité et application. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { useGoals, useProgress } from '@/app/hooks';
import { readRegistry } from '@/app/profiles';
import { T } from '@/i18n';
import { Icon } from '@/components/ui';
import { SkillBars, TierRing } from '@/components/Progress';
import { TIER_STORY, remainingLine, tierLine } from '@/engine/progress';
import { BADGES } from '@/features/lesson/badges';
import { GOAL_OPTIONS, goalKey } from '@/features/onboarding/Onboarding';

const plural = (n: number, s: string, p = s + 's') => `${n} ${n > 1 ? p : s}`;

export function Profile() {
  const t = T();
  usePage(t.profile.title);
  const profile = useStore((s) => s.profile)!;
  const xp = useStore((s) => s.xp);
  const days = useStore((s) => s.days);
  const badges = useStore((s) => s.badges);
  const p = useProgress();
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
      <Link to="/profile/progress" className="chead" style={{ textDecoration: 'none', color: 'inherit' }}>
        <TierRing p={p} />
        <div className="mid"><div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div><div className="sm" style={{ fontWeight: 650 }}>{TIER_STORY[p.tier].title} · {tierLine(p)}</div><div className="xs mut">{remainingLine(p)}</div><div className="row-flex" style={{ marginTop: 6, gap: 6, flexWrap: 'wrap' }}><span className="tag gold"><Icon name="flame" size={13} /> {plural(streak, 'jour')} de suite</span><span className="tag">{plural(nDays, 'jour')} d’étude</span><span className="tag">{xp} XP</span></div></div>
      </Link>
      <div className="h2">Mes compétences <span className="sp" /><Link to="/profile/progress">Tout voir ›</Link></div>
      <SkillBars p={p} compact limit={4} />
      <div className="kv" style={{ marginTop: 8 }}><span><b>{p.counts.wordsAcquired}</b> mots acquis</span><span><b>{p.counts.lessonsDone}</b> / {p.counts.lessonsTotal} leçons</span><span>{goalLabel}</span></div>
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
