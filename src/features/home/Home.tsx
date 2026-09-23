/**
 * Accueil « Apprendre » : une seule question — quelle est ma prochaine leçon ?
 */
import { Link, useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, streakDays, levelFromXp } from '@/app/store';
import { useDueItems, useMetrics, useNextLesson, usePath, useLearnedItems } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { T, L } from '@/i18n';
import { Bar, Icon, Thai, VoiceStatusNote } from '@/components/ui';
import { todayKey } from '@/engine/util';
import { item } from '@/content/th';

const TRACK_ICON: Record<string, string> = { script: 'ก', talk: '💬', numbers: '๑', tones: '♪' };

export function Home() {
  const t = T();
  usePage(t.nav.learn);
  const nav = useNavigate();
  const profile = useStore((s) => s.profile)!;
  const session = useStore((s) => s.session);
  const days = useStore((s) => s.days);
  const xp = useStore((s) => s.xp);
  const next = useNextLesson();
  const path = usePath();
  const due = useDueItems();
  const m = useMetrics();
  const learned = useLearnedItems();
  const streak = streakDays(days);
  const today = days[todayKey()];
  const lvl = levelFromXp(xp);
  const cur = curriculum();
  const unit = next ? cur.units.find((u) => u.id === next.lesson.unit) : null;
  const doneCount = path.filter((p) => p.status === 'done').length;
  const lessonNo = path.filter((p) => p.status !== 'granted').findIndex((p) => p.lesson.id === next?.lesson.id) + 1;
  const recent = learned.slice().sort((a, b) => (useStore.getState().srs[b.id]?.first ?? 0) - (useStore.getState().srs[a.id]?.first ?? 0)).slice(0, 8);
  const resumable = session && !session.training ? session : null;
  const goalMin = profile.dailyGoalMinutes || 15;

  return (
    <>
      <div className="hello">
        <div><Thai text={profile.gender === 'f' ? 'สวัสดีค่ะ' : 'สวัสดีครับ'} /><h2>{profile.name}</h2></div>
        <span className="streak">{streak ? `🔥 ${streak} ${streak > 1 ? t.home.days : t.home.day}` : '✨ Premier jour'}</span>
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

      <div className="prog" style={{ marginTop: 14 }}>
        <button onClick={() => nav('/review')}><div className="k"><span>{t.home.review}</span><b>{due.length} {t.home.cards}</b></div><Bar p={due.length ? Math.min(1, 10 / Math.max(10, due.length)) : 1} thin /></button>
        <Link to="/path"><div className="k"><span>{t.home.progress}</span><b>{Math.round((doneCount / Math.max(1, path.filter((p) => p.status !== 'granted').length)) * 100)} %</b></div><Bar p={doneCount / Math.max(1, path.filter((p) => p.status !== 'granted').length)} thin /></Link>
        <Link to="/profile"><div className="k"><span>{t.home.level} {lvl.level}</span><b>{xp} XP</b></div><Bar p={lvl.into / lvl.next} thin /></Link>
        <Link to="/profile/stats"><div className="k"><span>{t.home.today}</span><b>{today?.minutes ?? 0} / {goalMin} min</b></div><Bar p={(today?.minutes ?? 0) / goalMin} thin /></Link>
      </div>

      <div className="h2">Où j’en suis <span className="sp" /><Link to="/path">{t.home.path} ›</Link></div>
      <div className="prog">
        <Link to="/explore/alphabet"><div className="k"><span>Lettres</span><b>{m.letters.known} / {m.letters.total}</b></div><Bar p={m.letters.progress} thin /></Link>
        <Link to="/explore/vowels"><div className="k"><span>Voyelles</span><b>{m.vowels.known} / {m.vowels.total}</b></div><Bar p={m.vowels.progress} thin /></Link>
        <Link to="/explore/vocab"><div className="k"><span>Mots</span><b>{m.words.known}</b></div><Bar p={Math.min(1, m.words.known / 300)} thin /></Link>
        <Link to="/explore/tones"><div className="k"><span>Tons</span><b>{Math.round(m.tones.progress * 100)} %</b></div><Bar p={m.tones.progress} thin /></Link>
      </div>

      {recent.length > 0 && (
        <>
          <div className="h2">{t.home.recentlyLearned}</div>
          <div className="chips" style={{ paddingBottom: 4 }}>
            {recent.map((it) => <Link key={it.id} to={`/explore/search?q=${encodeURIComponent(it.thai)}`} className="chip" style={{ textDecoration: 'none' }}><Thai text={it.kind === 'vow' ? it.thai : it.thai} style={{ fontSize: 17, color: 'var(--ink)' }} /><span className="xs">{it.kind === 'cons' ? item(it.id)?.rom.split(' ')[0] : L(it.meaning).split(/[;,]/)[0]}</span></Link>)}
          </div>
        </>
      )}

      <div className="h2">Et après ?</div>
      <div className="list">
        {path.filter((p) => p.status !== 'done' && p.status !== 'granted').slice(next ? 1 : 0, 4).map((p, i) => (
          <Link key={p.lesson.id} to={`/lesson/${p.lesson.id}`} className={`row lrow ${p.status === 'locked' ? 'todo' : 'cur'}`}>
            <span className="ico">{p.status === 'locked' ? <Icon name="lock" size={18} /> : TRACK_ICON[p.lesson.track]}</span>
            <span className="mid"><span className="t">{L(p.lesson.title)}</span><span className="s">{L(p.lesson.subtitle) || ''}{p.lesson.minutes ? ` · ${p.lesson.minutes} min` : ''}</span></span>
            <span className="end"><span className="chev">›</span></span>
            {i === 99 ? null : null}
          </Link>
        ))}
      </div>
    </>
  );
}
