/** Statistiques : calendrier des 14 derniers jours, totaux, historique des séances. */
import { usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { useMetrics } from '@/app/hooks';
import { dayKey, todayKey } from '@/engine/util';
import { T } from '@/i18n';

export function StatsScreen() {
  const t = T();
  usePage(t.profile.stats, { back: '/profile' });
  const days = useStore((s) => s.days);
  const history = useStore((s) => s.history);
  const xp = useStore((s) => s.xp);
  const m = useMetrics();
  const goal = useStore((s) => s.profile?.dailyGoalMinutes ?? 15);
  const now = new Date(), tk = todayKey();
  const cells = Array.from({ length: 14 }, (_, k) => { const d = new Date(now); d.setDate(now.getDate() - (13 - k)); const key = dayKey(d); const s = days[key]; return { key, d, s, ok: !!s && s.minutes >= goal, some: !!s && (s.answers > 0 || s.lessons > 0) }; });
  const tot = Object.values(days).reduce((a, d) => ({ minutes: a.minutes + d.minutes, answers: a.answers + d.answers, correct: a.correct + d.correct, lessons: a.lessons + d.lessons }), { minutes: 0, answers: 0, correct: 0, lessons: 0 });
  const icon: Record<string, string> = { lesson: '📚', training: '🎯', dialog: '💬', reading: '📖' };
  return (
    <>
      <div className="h2">Les 14 derniers jours</div>
      <div className="cal">{cells.map((c) => <div key={c.key} className={`cd ${c.ok ? 'ok' : c.some ? 'some' : ''} ${c.key === tk ? 'now' : ''}`} title={c.key} style={c.some && !c.ok ? { background: 'var(--gold-soft)', borderColor: 'transparent' } : undefined}><small>{'DLMMJVS'[c.d.getDay()]}</small><b>{c.s ? c.s.minutes : c.d.getDate()}</b></div>)}</div>
      <p className="xs mut" style={{ margin: '6px 2px 0' }}>Minutes d’étude par jour · vert : objectif atteint ({goal} min) · or : un peu d’activité.</p>
      <div className="prog" style={{ marginTop: 16 }}>
        <div><div className="k"><span>Série</span><b>{streakDays(days)} j</b></div></div>
        <div><div className="k"><span>Temps total</span><b>{tot.minutes} min</b></div></div>
        <div><div className="k"><span>Réponses</span><b>{tot.answers}</b></div><div className="xs mut">{tot.answers ? Math.round((tot.correct / tot.answers) * 100) : 0} % justes</div></div>
        <div><div className="k"><span>XP</span><b>{xp}</b></div></div>
        <div><div className="k"><span>Leçons validées</span><b>{m.lessonsDone} / {m.lessonsTotal}</b></div></div>
        <div><div className="k"><span>Mots connus</span><b>{m.words.known}</b></div></div>
      </div>
      <div className="h2">Historique</div>
      {!history.length ? <div className="empty">Vos séances apparaîtront ici.</div> : <div className="list">{history.slice(0, 60).map((h, i) => <div key={i} className="row"><span className="ico">{icon[h.kind] ?? '•'}</span><span className="mid"><span className="t">{h.label}</span><span className="s">{new Date(h.t).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></span><span className="end b">{h.total ? `${h.score}/${h.total}` : '✓'}</span></div>)}</div>}
    </>
  );
}
