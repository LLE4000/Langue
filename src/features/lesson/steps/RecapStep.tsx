/** Bilan de fin de leçon : score, XP, nouveautés, points à retravailler, leçon suivante. */
import { Link } from 'react-router-dom';
import type { LessonSession } from '@/app/store';
import type { LessonDef } from '@/curriculum/types';
import type { PathLesson } from '@/curriculum/path';
import { ITEMS } from '@/content/th';
import { L, T } from '@/i18n';
import { Thai, Rom, Fr, Icon } from '@/components/ui';

export function RecapStep({ session, lesson, next, onClose, onNext, onRetry }: { session: LessonSession; lesson: LessonDef | null; next: PathLesson | null; onClose: () => void; onNext: (id: string) => void; onRetry: () => void; startedAt: number }) {
  const t = T();
  const passed = session.training ? true : session.total === 0 || session.ok / session.total >= (lesson?.minScore ?? 0.6);
  const pct = session.total ? Math.round((session.ok / session.total) * 100) : 100;
  const wrong = session.wrong.map((id) => ITEMS[id]).filter(Boolean).slice(0, 10);
  const news = lesson ? lesson.newConcepts.map((id) => ITEMS[id]).filter((x) => x && x.kind !== 'rule' && x.kind !== 'grammar').slice(0, 12) : [];
  const nextIsDifferent = next && next.lesson.id !== session.lessonId;
  const minPct = Math.round((lesson?.minScore ?? 0.6) * 100);
  const medal = session.training ? 'target' : passed ? (pct >= 90 ? 'star' : 'check') : 'rotate';
  return (
    <>
      <div className={`recap ${passed ? 'ok' : 'ko'}`}>
        <div className="medal"><Icon name={medal} /></div>
        <div className="score">{session.total ? <>{session.ok}<small> / {session.total}</small></> : '✓'}</div>
        {session.total > 0 && <div className="xs mut mt-1">bonnes réponses du premier coup · {pct} %</div>}
        <div className="verdict-t">{session.training ? 'Entraînement terminé' : passed ? (pct >= 90 ? 'Excellent · ' + t.lesson.passed : t.lesson.passed) : `${t.lesson.failed} : il faut ${minPct} %`}</div>
        <div className="mut sm">{session.title} · +{session.xp} XP</div>
      </div>
      {news.length > 0 && passed && (
        <><div className="h2">{t.lesson.newItems}</div><div className="chips">{news.map((it) => <span key={it.id} className="chip"><Thai text={it.kind === 'num' ? it.digits : it.thai} className="th-s ink" /><span className="xs"><Fr text={it.kind === 'cons' ? it.ref.nameMeaning : it.meaning} /></span></span>)}</div></>
      )}
      {wrong.length > 0 && (
        <><div className="h2">{t.lesson.toReview}</div><div className="list">{wrong.map((it) => <div className="row" key={it.id}><span className="mid"><Thai text={it.thai} /><span className="s"><Rom text={it.rom} /> · <Fr text={it.meaning} /></span></span></div>)}</div><p className="foot-note">Ces éléments reviendront dans vos révisions.</p></>
      )}
      <div className="gap" />
      <div className="stack mt-3">
        {!session.training && passed && nextIsDifferent && <button className="btn" onClick={() => onNext(next!.lesson.id)}>{t.lesson.nextLesson} : {L(next!.lesson.title)} <Icon name="next" size={18} /></button>}
        {!session.training && !passed && <button className="btn" onClick={onRetry}>Refaire la leçon</button>}
        {session.training && <Link className="btn" to="/review" onClick={onClose}>Autre entraînement</Link>}
        <button className={`btn ${passed && nextIsDifferent && !session.training ? 'ghost' : 'soft'}`} onClick={onClose}>{session.training ? t.common.finish : t.lesson.backHome}</button>
      </div>
    </>
  );
}
