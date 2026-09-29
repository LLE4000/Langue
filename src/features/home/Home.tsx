/**
 * Accueil « Leçons » : une seule question — que faire ensuite ?
 * En haut, le prénom (qui ouvre le profil) et la série de jours ; puis, dans l'ordre : la prochaine leçon, la suite
 * du parcours (trois leçons et « Tout le parcours »), l'essentiel du jour, où j'en suis, et « Lire à voix haute »
 * quand une séance est débloquée par les leçons. La pastille de progression complète reste sur les autres onglets :
 * ici, la carte « Progression » dit déjà la même chose.
 */
import { Link } from 'react-router-dom';
import { ProfileChip, usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { useDueItems, useNextLesson, usePath, useGoals, useProgress, useKnown } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { CONS_ITEMS } from '@/content/th';
import { T } from '@/i18n';
import { Bar, Icon, Ico, VoiceStatusNote, ThInl } from '@/components/ui';
import { TierRing } from '@/components/Progress';
import { CardTitle, LessonBadge, LessonRow, kindClass } from '@/components/LessonCard';
import { lessonCard } from '@/curriculum/card';
import { isUnlocked, nextSession, weakItems } from '@/features/readaloud/data';
import { emptyReadAloud } from '@/app/store';
import { TIER_STORY, tierLine } from '@/engine/progress';
import { todayKey } from '@/engine/util';

/** La série de jours seule (flamme), en haut à droite de l'accueil et du parcours : le palier y est déjà affiché en grand. */
export function StreakChip() {
  const n = streakDays(useStore((s) => s.days));
  return (
    <Link to="/profile/stats" className={`streak-chip ${n ? '' : 'zero'}`} aria-label={n ? `Série : ${n} jour${n > 1 ? 's' : ''} de suite` : 'Série : aucun jour pour l’instant'} data-testid="streak-chip">
      <Icon name="flame" size={16} /><b>{n}</b>
    </Link>
  );
}

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
  const known = useKnown().concepts;
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const raNext = nextSession(ra, known);
  const raOpen = goals.read && isUnlocked(raNext, known);
  const raWeak = weakItems(ra).length;
  const goalMin = profile.dailyGoalMinutes || 15;
  const minutes = today?.minutes ?? 0;
  const upcoming = path.filter((p) => p.status !== 'done' && p.status !== 'granted').slice(next ? 1 : 0, 4);

  return (
    <>
      <header className="home-head">
        <ProfileChip withName greeting={profile.gender === 'f' ? 'สวัสดีค่ะ' : 'สวัสดีครับ'} />
        <StreakChip />
      </header>

      {resumable ? (
        <Link className="cta" to={`/lesson/${resumable.lessonId}`} state={{ from: '/' }}>
          {resumeLesson ? <LessonBadge card={lessonCard(resumeLesson)} size="lg" /> : <span className="lbadge lg"><Icon name="play" /></span>}
          <span className="body">
            <span className="k">{t.home.resume}</span>
            <span className={`t ${resumable.title.length > 22 ? 'long' : ''}`}>{resumable.title}</span>
            <span className="s">Étape {resumable.index + 1} sur {resumable.steps.length}</span>
          </span>
          <span className="foot"><span className="go">{t.common.continue} <Icon name="next" /></span></span>
        </Link>
      ) : next && card ? (
        <Link className={`cta ${kindClass(card)}`} to={`/lesson/${next.lesson.id}`} state={{ from: '/' }}>
          <LessonBadge card={card} size="lg" />
          <span className="body">
            <span className="k">{t.home.nextLesson}{lessonNo > 0 ? ` · n° ${lessonNo}` : ''}{next.status === 'locked' ? ' · à débloquer' : ''}</span>
            <span className={`t ${card.title.length > 19 ? 'long' : ''}`}><CardTitle card={card} /></span>
            <span className="s"><ThInl text={card.sub} /></span>
            <span className="pills"><span className="kl">{card.label}</span><span>{card.count}</span>{card.extras.map((x) => <span key={x}>{x}</span>)}{next.knownOrally && <span>à lire</span>}</span>
          </span>
          <span className="foot"><span className="go">{t.common.start} <Icon name="next" /></span><span className="dur"><Icon name="clock" size={16} />{next.lesson.minutes} {t.common.minutes}</span></span>
        </Link>
      ) : (
        <div className="card"><div className="row-flex"><Ico name="sparkles" tone="acc" /><b>Parcours terminé</b></div><p className="mut sm mt-2">{t.home.allDone}</p></div>
      )}
      {next?.knownOrally && !resumable && <div className="note info sm">{t.home.knownOrally}</div>}
      <VoiceStatusNote />

      {/* La suite du parcours : les leçons suivantes, dans l'ordre */}
      {upcoming.length > 0 && (
        <>
          <div className="h2">Ensuite <span className="sp" /><Link to="/path" aria-label="Mon parcours complet">Tout le parcours ›</Link></div>
          <div className="list upnext">
            {upcoming.map((p) => <LessonRow key={p.lesson.id} lesson={p.lesson} state={p.status === 'locked' ? 'lock' : undefined} />)}
          </div>
        </>
      )}

      {/* L'essentiel du jour : ce qui attend en révision, les minutes faites */}
      <div className="today" aria-label="Aujourd’hui">
        <Link to="/review" className={`tk ${due.length ? 'due' : ''}`}><Icon name="repeat" size={18} /><b>{due.length}</b><span className="lab">à réviser</span></Link>
        <Link to="/profile/stats" className="tk"><Icon name="bolt" size={18} /><b>{minutes}<small> / {goalMin} min</small></b><span className="lab">aujourd’hui</span><Bar p={minutes / goalMin} thin /></Link>
      </div>

      {/* Où j'en suis : toujours visible, chaque nombre avec son total */}
      <Link to="/profile/progress" className="prog-card" aria-label={`Ma progression : ${tierLine(prog)}`}>
        <TierRing p={prog} size={56} />
        <span className="mid">
          <span className="t">{tierLine(prog)}</span>
          <span className="s">{prog.next && prog.next !== 'B2' ? `Prochain palier : ${TIER_STORY[prog.next].title.toLowerCase()}` : TIER_STORY[prog.tier].title}</span>
          <span className="statline">
            <span><b>{prog.counts.wordsAcquired}</b> mots</span>
            {goals.read && <span><b>{prog.counts.consAcquired}</b> / {CONS_ITEMS.length} consonnes</span>}
            <span><b>{doneCount}</b> leçon{doneCount > 1 ? 's' : ''} faite{doneCount > 1 ? 's' : ''}</span>
          </span>
        </span>
        <span className="chev"><Icon name="next" size={18} /></span>
      </Link>

      {/* Lire à voix haute : l'entraînement intensif de lecture, seulement quand les leçons ont enseigné ses lettres */}
      {raOpen && (
        <Link to="/read" className="ra-home" aria-label="Lire à voix haute">
          <span className="ic"><Icon name="mic" /></span>
          <span className="mid"><span className="k">Lire à voix haute</span><span className="t">Séance {raNext.n} · <ThInl text={raNext.title} /></span><span className="s">{raNext.items.length} lectures · ≈ {raNext.minutes} min{raWeak ? ` · ${raWeak} à reprendre` : ''}</span></span>
          <span className="chev"><Icon name="next" size={18} /></span>
        </Link>
      )}
    </>
  );
}
