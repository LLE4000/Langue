/** Statistiques : le temps seulement — calendrier des 14 derniers jours, temps total, réponses, historique des séances. Palier, mots et leçons sont dans Ma progression. */
import { usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { dayKey, todayKey } from '@/engine/util';
import { T } from '@/i18n';
import { Empty, Ico } from '@/components/ui';

export function StatsScreen() {
  const t = T();
  usePage(t.profile.stats, { back: '/profile' });
  const days = useStore((s) => s.days);
  const history = useStore((s) => s.history);
  const goal = useStore((s) => s.profile?.dailyGoalMinutes ?? 15);
  const now = new Date(), tk = todayKey();
  const cells = Array.from({ length: 14 }, (_, k) => { const d = new Date(now); d.setDate(now.getDate() - (13 - k)); const key = dayKey(d); const s = days[key]; return { key, d, s, ok: !!s && s.minutes >= goal, some: !!s && (s.answers > 0 || s.lessons > 0) }; });
  const nDays = Object.keys(days).length;
  // la série de jours (la flamme de l'accueil et du parcours mène ici)
  const streak = streakDays(days);
  const tot = Object.values(days).reduce((a, d) => ({ minutes: a.minutes + d.minutes, answers: a.answers + d.answers, correct: a.correct + d.correct, lessons: a.lessons + d.lessons }), { minutes: 0, answers: 0, correct: 0, lessons: 0 });
  const icon: Record<string, string> = { lesson: 'book', training: 'target', dialog: 'chat', reading: 'bookOpen', comprehension: 'headphones', turns: 'users', voice: 'mic', duel: 'swords' };
  return (
    <>
      <div className="h2">Les 14 derniers jours</div>
      <div className="cal">{cells.map((c) => <div key={c.key} className={`cd ${c.ok ? 'ok' : c.some ? 'some' : ''} ${c.key === tk ? 'now' : ''}`} title={`${c.d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}${c.s?.minutes ? ` · ${c.s.minutes} min` : ''}`}><small>{'DLMMJVS'[c.d.getDay()]}</small><b>{c.d.getDate()}</b><em>{c.s?.minutes ? `${c.s.minutes}\u00a0min` : ''}</em></div>)}</div>
      <p className="foot-note cal-leg"><span>Minutes d’étude par jour</span><span><i className="dot ok" aria-hidden="true" /> objectif atteint ({goal}&nbsp;min)</span><span><i className="dot some" aria-hidden="true" /> un peu d’activité</span></p>
      <div className="prog mt-4">
        <div className="wide"><div className="k"><span>Série</span><b>{streak}&nbsp;j</b></div><div className="xs mut">{streak ? `${streak} jour${streak > 1 ? 's' : ''} de suite` : 'Étudiez aujourd’hui pour lancer une série'}</div></div>
        <div><div className="k"><span>Temps total</span><b>{tot.minutes}&nbsp;min</b></div><div className="xs mut">sur {nDays} jour{nDays > 1 ? 's' : ''} d’étude</div></div>
        <div><div className="k"><span>Réponses</span><b>{tot.answers}</b></div><div className="xs mut">{tot.answers ? Math.round((tot.correct / tot.answers) * 100) : 0}&nbsp;% justes</div></div>
      </div>
      <div className="h2">Historique</div>
      {!history.length ? <Empty icon="clock">Vos séances apparaîtront ici.</Empty> : <div className="list">{history.slice(0, 60).map((h, i) => <div key={i} className="row"><Ico name={icon[h.kind] ?? 'check'} /><span className="mid"><span className="t">{h.label}</span><span className="s">{new Date(h.t).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></span><span className="end b">{h.total ? `${h.score}/${h.total}` : '✓'}</span></div>)}</div>}
    </>
  );
}
