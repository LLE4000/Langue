/**
 * Accueil « Apprendre » : une seule question — quelle est ma prochaine leçon ?
 * En haut, le prénom (qui ouvre le profil) et la progression ; puis la prochaine leçon, l'essentiel du jour,
 * où j'en suis et la suite du parcours. Jouer et réviser ont leurs onglets.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ProfileChip, usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useDueItems, useNextLesson, usePath, useGoals, useProgress, progressContent } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { T, L } from '@/i18n';
import { Bar, Icon, Ico, VoiceStatusNote } from '@/components/ui';
import { ProgressPill, TierRing } from '@/components/Progress';
import { remainingLine, tierLine } from '@/engine/progress';
import { todayKey } from '@/engine/util';

const TRACK_ICON: Record<string, ReactNode> = { script: 'ก', talk: <Icon name="chat" />, numbers: '๑', tones: <Icon name="music" /> };

export function Home() {
  const t = T();
  // Un seul en-tête : le prénom et la progression remplacent la barre du haut
  usePage(t.nav.learn, { hidden: true });
  const profile = useStore((s) => s.profile)!;
  const session = useStore((s) => s.session);
  const days = useStore((s) => s.days);
  const next = useNextLesson();
  const path = usePath();
  const due = useDueItems();
  const prog = useProgress();
  const goals = useGoals();
  const today = days[todayKey()];
  const cur = curriculum();
  const unit = next ? cur.units.find((u) => u.id === next.lesson.unit) : null;
  const active = path.filter((p) => p.status !== 'granted');
  const doneCount = active.filter((p) => p.status === 'done').length;
  const lessonNo = active.findIndex((p) => p.lesson.id === next?.lesson.id) + 1;
  // Une séance arrêtée sur le bilan est terminée : on propose la leçon suivante, pas une « reprise ».
  const resumable = session && !session.training && session.steps[session.index]?.type !== 'recap' ? session : null;
  const goalMin = profile.dailyGoalMinutes || 15;
  const minutes = today?.minutes ?? 0;
  const upcoming = path.filter((p) => p.status !== 'done' && p.status !== 'granted').slice(next ? 1 : 0, 4);

  return (
    <>
      <header className="home-head">
        <ProfileChip withName greeting={profile.gender === 'f' ? 'สวัสดีค่ะ' : 'สวัสดีครับ'} />
        <ProgressPill />
      </header>

      {resumable ? (
        <Link className="cta" to={`/lesson/${resumable.lessonId}`}>
          <span className="n"><Icon name="play" /></span>
          <span><span className="k">{t.home.resume}</span><span className="t">{resumable.title}</span><span className="s">Étape {resumable.index + 1} sur {resumable.steps.length}</span></span>
          <span className="go">{t.common.continue} <Icon name="next" /></span>
        </Link>
      ) : next ? (
        <Link className="cta" to={`/lesson/${next.lesson.id}`}>
          <span className="n">{TRACK_ICON[next.lesson.track]}</span>
          <span><span className="k">{t.home.nextLesson}{next.status === 'locked' ? ' · à débloquer' : ''}</span><span className="t">{L(next.lesson.title)}</span><span className="s">{lessonNo > 0 ? `${t.home.lesson} ${lessonNo} · ` : ''}{unit ? L(unit.title) + ' · ' : ''}{next.lesson.minutes} {t.common.minutes}{next.knownOrally ? ' · à lire' : ''}</span></span>
          <span className="go">{t.common.start} <Icon name="next" /></span>
        </Link>
      ) : (
        <div className="card"><div className="row-flex"><Ico name="sparkles" tone="acc" /><b>Parcours terminé</b></div><p className="mut sm mt-2">{t.home.allDone}</p></div>
      )}
      {next?.knownOrally && !resumable && <div className="note info sm">{t.home.knownOrally}</div>}
      <VoiceStatusNote />

      {/* L'essentiel du jour : ce qui attend en révision, les minutes faites */}
      <div className="today" aria-label="Aujourd’hui">
        <Link to="/review" className={`tk ${due.length ? 'due' : ''}`}><Icon name="repeat" size={18} /><span><b>{due.length}</b> à réviser</span></Link>
        <Link to="/profile/stats" className="tk"><Icon name="bolt" size={18} /><span><b>{minutes}</b> / {goalMin} min aujourd’hui</span><Bar p={minutes / goalMin} thin /></Link>
      </div>

      {/* Où j'en suis : toujours visible, chaque nombre avec son total */}
      <Link to="/profile/progress" className="prog-card" aria-label={`Ma progression : ${tierLine(prog)}`}>
        <TierRing p={prog} size={56} />
        <span className="mid">
          <span className="t">{tierLine(prog)}</span>
          <span className="s">{remainingLine(prog)}</span>
          <span className="statline">
            <span><b>{prog.counts.wordsAcquired}</b> mots</span>
            {goals.read && <span><b>{prog.counts.consAcquired}</b> / {progressContent().cons.length} lettres</span>}
            <span><b>{doneCount}</b> / {active.length} leçons</span>
          </span>
        </span>
        <span className="chev">›</span>
      </Link>

      {/* La suite du parcours : « Apprendre », ce sont les leçons, dans l'ordre */}
      {upcoming.length > 0 && (
        <>
          <div className="h2">Ensuite <span className="sp" /><Link to="/path" aria-label="Mon parcours complet">Tout le parcours ›</Link></div>
          <div className="list upnext">
            {upcoming.map((p) => (
              <Link key={p.lesson.id} to={`/lesson/${p.lesson.id}`} className={`row lrow ${p.status === 'locked' ? 'todo' : 'avail'}`}>
                <span className="ico">{p.status === 'locked' ? <Icon name="lock" size={18} /> : TRACK_ICON[p.lesson.track]}</span>
                <span className="mid"><span className="t">{L(p.lesson.title)}</span><span className="s">{L(p.lesson.subtitle) || ''}{p.lesson.minutes ? ` · ${p.lesson.minutes} min` : ''}</span></span>
                <span className="end"><span className="chev">›</span></span>
              </Link>
            ))}
          </div>
        </>
      )}
    </>
  );
}
