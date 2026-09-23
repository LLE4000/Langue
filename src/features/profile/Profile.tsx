/** Profil : progression par compétence, niveau et XP, badges, accès aux réglages, données et partage. */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, streakDays, levelFromXp } from '@/app/store';
import { useMetrics, useLevels } from '@/app/hooks';
import { T } from '@/i18n';
import { Bar, Icon } from '@/components/ui';
import { BADGES } from '@/features/lesson/badges';
import { SKILLS } from '@/curriculum/types';

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
  const Row = ({ to, ico, t: title, s }: { to: string; ico: string; t: string; s: string }) => <Link className="row" to={to}><span className="ico">{ico}</span><span className="mid"><span className="t">{title}</span><span className="s">{s}</span></span><span className="end"><span className="chev">›</span></span></Link>;
  return (
    <>
      <div className="chead">
        <div className="cring" style={{ ['--p' as string]: Math.round((lvl.into / lvl.next) * 100) }}><b>{lvl.level}</b><small>niveau</small></div>
        <div className="mid"><div style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</div><div className="xs mut">{xp} XP · {lvl.next - lvl.into} XP avant le niveau {lvl.level + 1}</div><div className="row-flex" style={{ marginTop: 6, gap: 6 }}><span className="tag gold">🔥 {streak} j</span><span className="tag">{nDays} jour{nDays > 1 ? 's' : ''} d’étude</span><span className="tag">{m.lessonsDone} leçons</span></div></div>
      </div>
      <div className="h2">Mes compétences <span className="sp" /><Link to="/profile/levels">Ajuster ›</Link></div>
      <div className="prog">
        {SKILLS.map((sk) => <div key={sk}><div className="k"><span>{t.skills[sk]}</span><b>{['0', 'A1', 'A2', 'B1', 'B2+'][levels[sk]]}</b></div><Bar p={m.skills[sk]} thin /></div>)}
      </div>
      <div className="prog" style={{ marginTop: 10 }}>
        <div><div className="k"><span>Lettres connues</span><b>{m.letters.known} / {m.letters.total}</b></div><Bar p={m.letters.progress} thin /></div>
        <div><div className="k"><span>Mots connus</span><b>{m.words.known}</b></div><Bar p={Math.min(1, m.words.known / 500)} thin /></div>
      </div>
      <div className="h2">{t.profile.badges} <span className="sp" /><span className="sm mut">{Object.keys(badges).length} / {BADGES.length}</span></div>
      <div className="badges">{BADGES.map((b) => <div key={b.id} className={`badge ${badges[b.id] ? 'on' : ''}`} title={b.desc}><span className="e">{b.icon}</span>{b.title}<span className="xs mut" style={{ fontWeight: 500 }}>{b.desc}</span></div>)}</div>
      <div className="h2">Mon compte</div>
      <div className="list">
        <Row to="/profile/share" ico="📤" t={t.profile.share} s="Une carte à envoyer à vos proches" />
        <Row to="/profile/stats" ico="📊" t={t.profile.stats} s="Activité des derniers jours, historique" />
        <Row to="/profile/levels" ico="🎚️" t={t.profile.levels} s="Refaire le point compétence par compétence" />
        <Row to="/profile/settings" ico="⚙️" t={t.profile.settings} s="Voix, translittération, apparence" />
        <Row to="/profile/data" ico="💾" t={t.profile.data} s="Exporter, importer, réinitialiser" />
      </div>
      <p className="xs mut ctr" style={{ marginTop: 16 }}><Icon name="lock" size={12} /> Tout reste sur cet appareil. Aucun compte, aucun serveur.</p>
    </>
  );
}
