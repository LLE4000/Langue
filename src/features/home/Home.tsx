/**
 * Accueil « Apprendre » : une seule question — quelle est ma prochaine leçon ?
 * Une grande action, l'essentiel du jour en une ligne, le reste replié sous « Plus ».
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, streakDays } from '@/app/store';
import { useDueItems, useNextLesson, usePath, useLearnedItems, useGoals, useProgress, progressContent } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { T, L } from '@/i18n';
import { Bar, Icon, Thai, VoiceStatusNote } from '@/components/ui';
import { TierRing } from '@/components/Progress';
import { remainingLine, tierLine } from '@/engine/progress';
import { todayKey } from '@/engine/util';
import { item } from '@/content/th';

const TRACK_ICON: Record<string, string> = { script: 'ก', talk: '💬', numbers: '๑', tones: '♪' };
const MORE_KEY = 'langue-home-more';

export function Home() {
  const t = T();
  usePage(t.nav.learn);
  const profile = useStore((s) => s.profile)!;
  const session = useStore((s) => s.session);
  const days = useStore((s) => s.days);
  const next = useNextLesson();
  const path = usePath();
  const due = useDueItems();
  const prog = useProgress();
  const learned = useLearnedItems();
  const streak = streakDays(days);
  const today = days[todayKey()];
  const cur = curriculum();
  const unit = next ? cur.units.find((u) => u.id === next.lesson.unit) : null;
  const active = path.filter((p) => p.status !== 'granted');
  const doneCount = path.filter((p) => p.status === 'done').length;
  const lessonNo = active.findIndex((p) => p.lesson.id === next?.lesson.id) + 1;
  const recent = learned.slice().sort((a, b) => (useStore.getState().srs[b.id]?.first ?? 0) - (useStore.getState().srs[a.id]?.first ?? 0)).slice(0, 8);
  // Une séance arrêtée sur le bilan est terminée : on propose la leçon suivante, pas une « reprise ».
  const resumable = session && !session.training && session.steps[session.index]?.type !== 'recap' ? session : null;
  const goals = useGoals();
  const pendingChallenges = useStore((s) => s.challenges.filter((c) => c.dir === 'sent' && !c.theirs).length);
  const goalMin = profile.dailyGoalMinutes || 15;
  const minutes = today?.minutes ?? 0;
  const [more, setMore] = useState(() => { try { return localStorage.getItem(MORE_KEY) === '1'; } catch { return false; } });
  const toggleMore = () => { setMore(!more); try { localStorage.setItem(MORE_KEY, !more ? '1' : '0'); } catch { /* ignore */ } };
  const upcoming = path.filter((p) => p.status !== 'done' && p.status !== 'granted').slice(next ? 1 : 0, 4);

  return (
    <>
      <div className="hello">
        <div><Thai text={profile.gender === 'f' ? 'สวัสดีค่ะ' : 'สวัสดีครับ'} /><h2>{profile.name}</h2></div>
        {!streak && <span className="streak">Premier jour</span>}
      </div>

      {resumable ? (
        <Link className="cta" to={`/lesson/${resumable.lessonId}`}>
          <span className="n"><Icon name="play" /></span>
          <span><span className="k">{t.home.resume}</span><span className="t">{resumable.title}</span><span className="s">Étape {resumable.index + 1} sur {resumable.steps.length}</span></span>
          <span className="go">{t.common.continue}</span>
        </Link>
      ) : next ? (
        <Link className="cta" to={`/lesson/${next.lesson.id}`}>
          <span className="n">{TRACK_ICON[next.lesson.track]}</span>
          <span><span className="k">{t.home.nextLesson}{next.status === 'locked' ? ' · à débloquer' : ''}</span><span className="t">{lessonNo > 0 ? `${t.home.lesson} ${lessonNo} — ` : ''}{L(next.lesson.title)}</span><span className="s">{unit ? L(unit.title) + ' · ' : ''}{next.lesson.minutes} {t.common.minutes}{next.knownOrally ? ' · à lire' : ''}</span></span>
          <span className="go">{t.common.start}</span>
        </Link>
      ) : (
        <div className="card"><b>🎉 Parcours terminé</b><p className="mut sm">{t.home.allDone}</p></div>
      )}
      {next?.knownOrally && !resumable && <div className="note info sm" style={{ marginTop: 10 }}>{t.home.knownOrally}</div>}
      <VoiceStatusNote />

      {/* L'essentiel du jour, en une ligne : révision due, minutes faites */}
      <div className="today" aria-label="Aujourd’hui">
        <Link to="/review" className={`tk ${due.length ? 'due' : ''}`}><Icon name="repeat" size={18} /><span><b>{due.length}</b> à réviser</span></Link>
        <Link to="/profile/stats" className="tk"><Icon name="bolt" size={18} /><span><b>{minutes}</b> / {goalMin} min</span><Bar p={minutes / goalMin} thin /></Link>
        <Link to="/path" className="tk" aria-label={`${t.home.path} : ${doneCount} leçons sur ${active.length}`}><Icon name="flag" size={18} /><span><b>{doneCount}</b> / {active.length} <span className="lbl">{t.home.path}</span></span><Bar p={doneCount / Math.max(1, active.length)} thin /></Link>
      </div>

      {/* Où j'en suis : toujours visible, chaque nombre avec son total */}
      <Link to="/profile/progress" className="prog-card" aria-label={`Ma progression : ${tierLine(prog)}`}>
        <TierRing p={prog} size={60} />
        <span className="mid">
          <span className="t">{tierLine(prog)}</span>
          <span className="s">{remainingLine(prog)}</span>
          <span className="kv" style={{ marginTop: 6 }}>
            <span><b>{prog.counts.wordsAcquired}</b> mots</span>
            {goals.read && <span><b>{prog.counts.consAcquired}</b> / {progressContent().cons.length} lettres</span>}
            {prog.counts.toReview > 0 && <span><b>{prog.counts.toReview}</b> à réviser</span>}
          </span>
        </span>
        <span className="chev">›</span>
      </Link>

      <div className="list" style={{ marginTop: 12 }}>
        <Link className="row" to="/play"><span className="ico" style={{ background: 'var(--acc-soft)' }}>⚔️</span><span className="mid"><span className="t">Jouer à plusieurs</span><span className="s">Duel, prononciation, tour à tour, défi à distance{pendingChallenges ? ` · ${pendingChallenges} défi${pendingChallenges > 1 ? 's' : ''} en attente` : ''}</span></span><span className="end"><span className="chev">›</span></span></Link>
      </div>

      <button className="more" onClick={toggleMore} aria-expanded={more}>{more ? 'Moins' : 'Plus'} <span className="mut">· appris récemment, la suite du parcours</span><Icon name="next" size={16} style={{ transform: more ? 'rotate(-90deg)' : 'rotate(90deg)' }} /></button>

      {more && (
        <div className="more-body">
          {recent.length > 0 && (
            <>
              <div className="h2">{t.home.recentlyLearned}</div>
              <div className="chips" style={{ paddingBottom: 4 }}>
                {recent.map((it) => <Link key={it.id} to={`/explore/search?q=${encodeURIComponent(it.thai)}`} className="chip" style={{ textDecoration: 'none' }}><Thai text={it.thai} style={{ fontSize: 17, color: 'var(--ink)' }} /><span className="xs">{it.kind === 'cons' ? item(it.id)?.rom.split(' ')[0] : L(it.meaning).split(/[;,]/)[0]}</span></Link>)}
              </div>
            </>
          )}

          {upcoming.length > 0 && (
            <>
              <div className="h2">Et après ?</div>
              <div className="list">
                {upcoming.map((p) => (
                  <Link key={p.lesson.id} to={`/lesson/${p.lesson.id}`} className={`row lrow ${p.status === 'locked' ? 'todo' : 'cur'}`}>
                    <span className="ico">{p.status === 'locked' ? <Icon name="lock" size={18} /> : TRACK_ICON[p.lesson.track]}</span>
                    <span className="mid"><span className="t">{L(p.lesson.title)}</span><span className="s">{L(p.lesson.subtitle) || ''}{p.lesson.minutes ? ` · ${p.lesson.minutes} min` : ''}</span></span>
                    <span className="end"><span className="chev">›</span></span>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
