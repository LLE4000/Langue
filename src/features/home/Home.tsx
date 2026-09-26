/**
 * Accueil « Leçons » : une seule question — quelle est ma prochaine leçon ?
 * En haut, le prénom (qui ouvre le profil) et la progression ; puis la prochaine leçon, l'essentiel du jour,
 * où j'en suis et la suite du parcours. Réviser et Défis ont leurs onglets.
 */
import { Link } from 'react-router-dom';
import { ProfileChip, usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useDueItems, useNextLesson, usePath, useGoals, useProgress, progressContent } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { T } from '@/i18n';
import { Bar, Icon, Ico, VoiceStatusNote } from '@/components/ui';
import { ProgressPill, TierRing } from '@/components/Progress';
import { CardTitle, LessonBadge, LessonRow, kindClass } from '@/components/LessonCard';
import { lessonCard } from '@/curriculum/card';
import { nextSession, weakItems } from '@/features/readaloud/data';
import { emptyReadAloud } from '@/app/store';
import { remainingLine, tierLine } from '@/engine/progress';
import { todayKey } from '@/engine/util';

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
  const active = path.filter((p) => p.status !== 'granted');
  const doneCount = active.filter((p) => p.status === 'done').length;
  const lessonNo = active.findIndex((p) => p.lesson.id === next?.lesson.id) + 1;
  // Une séance arrêtée sur le bilan est terminée : on propose la leçon suivante, pas une « reprise ».
  const resumable = session && !session.training && session.steps[session.index]?.type !== 'recap' ? session : null;
  const resumeLesson = resumable ? cur.lessons.find((l) => l.id === resumable.lessonId) : undefined;
  const card = next ? lessonCard(next.lesson) : null;
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const raNext = nextSession(ra);
  const raWeak = weakItems(ra).length;
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
          {resumeLesson ? <LessonBadge card={lessonCard(resumeLesson)} size="lg" /> : <span className="lbadge lg"><Icon name="play" /></span>}
          <span className="body">
            <span className="k">{t.home.resume}</span>
            <span className={`t ${resumable.title.length > 22 ? 'long' : ''}`}>{resumable.title}</span>
            <span className="s">Étape {resumable.index + 1} sur {resumable.steps.length}</span>
          </span>
          <span className="foot"><span className="go">{t.common.continue} <Icon name="next" /></span></span>
        </Link>
      ) : next && card ? (
        <Link className={`cta ${kindClass(card)}`} to={`/lesson/${next.lesson.id}`}>
          <LessonBadge card={card} size="lg" />
          <span className="body">
            <span className="k">{t.home.nextLesson}{lessonNo > 0 ? ` · n° ${lessonNo}` : ''}{next.status === 'locked' ? ' · à débloquer' : ''}</span>
            <span className={`t ${card.title.length > 19 ? 'long' : ''}`}><CardTitle card={card} /></span>
            <span className="s">{card.sub}</span>
            <span className="pills"><span className="kl">{card.label}</span><span>{card.count}</span>{card.extras.map((x) => <span key={x}>{x}</span>)}<span>{next.lesson.minutes} {t.common.minutes}</span>{next.knownOrally && <span>à lire</span>}</span>
          </span>
          <span className="foot"><span className="go">{t.common.start} <Icon name="next" /></span></span>
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

      {/* Lire à voix haute : l'entraînement intensif de lecture, avec son propre programme */}
      {goals.read && (
        <Link to="/read" className="ra-home" aria-label="Lire à voix haute">
          <span className="ic"><Icon name="mic" /></span>
          <span className="mid"><span className="k">Lire à voix haute</span><span className="t">Séance {raNext.n} · {raNext.title}</span><span className="s">{raNext.items.length} lectures · ≈ {raNext.minutes} min{raWeak ? ` · ${raWeak} à reprendre` : ''}</span></span>
          <span className="chev">›</span>
        </Link>
      )}

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

      {/* La suite du parcours : les leçons suivantes, dans l'ordre */}
      {upcoming.length > 0 && (
        <>
          <div className="h2">Ensuite <span className="sp" /><Link to="/path" aria-label="Mon parcours complet">Tout le parcours ›</Link></div>
          <div className="list upnext">
            {upcoming.map((p) => <LessonRow key={p.lesson.id} lesson={p.lesson} state={p.status === 'locked' ? 'lock' : undefined} />)}
          </div>
        </>
      )}
    </>
  );
}
