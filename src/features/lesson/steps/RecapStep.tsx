/**
 * Bilan de fin de leçon : score, XP, nouveautés, points à retravailler. Les actions sont dans une barre fixée en bas
 * (comme à l'étape « À retenir ») : la leçon suivante d'abord, puis le retour vers la page d'origine, nommée.
 */
import type { ReactNode } from 'react';
import type { LessonSession } from '@/app/store';
import type { LessonDef } from '@/curriculum/types';
import type { PathLesson } from '@/curriculum/path';
import { ITEMS } from '@/content/th';
import { T } from '@/i18n';
import { Thai, Rom, Fr, Icon, AudioButton } from '@/components/ui';
import { InitialSound } from '@/components/ItemCard';
import { CardTitle } from '@/components/LessonCard';
import { StepFooter } from '@/components/StepFooter';
import { lessonCard } from '@/curriculum/card';

interface Props {
  session: LessonSession; lesson: LessonDef | null; next: PathLesson | null;
  /** Libellé du retour à la page d'origine (« Retour au parcours », « Retour au thème Salutations »…). */
  backLabel: string;
  onClose: () => void; onNext: (id: string) => void; onRetry: () => void;
  /** Entraînement : choisir un autre entraînement (Réviser), relancer le même sur d'autres mots. */
  onOther?: () => void; onAgain?: () => void;
  /** Leçon d'alphabet ou de voyelles réussie : lire à voix haute la séance que ses lettres ouvrent. */
  onRead?: () => void; readLabel?: string;
}

export function RecapStep({ session, lesson, next, backLabel, onClose, onNext, onRetry, onOther, onAgain, onRead, readLabel }: Props) {
  const t = T();
  const passed = session.training ? true : session.total === 0 || session.ok / session.total >= (lesson?.minScore ?? 0.6);
  const pct = session.total ? Math.round((session.ok / session.total) * 100) : 100;
  const missed = new Set(session.wrong);
  const news = lesson && passed ? lesson.newConcepts.map((id) => ITEMS[id]).filter((x) => x && x.kind !== 'rule' && x.kind !== 'grammar').slice(0, 12) : [];
  // Les nouveautés ratées sont marquées dans « Nouveautés » ; « À retravailler » ne garde que les éléments des leçons précédentes
  const shownNew = new Set(news.map((it) => it.id));
  const wrong = session.wrong.filter((id) => !shownNew.has(id)).map((id) => ITEMS[id]).filter(Boolean).slice(0, 10);
  const missedNew = news.some((it) => missed.has(it.id));
  const nextIsDifferent = next && next.lesson.id !== session.lessonId;
  const nextCard = nextIsDifferent ? lessonCard(next!.lesson) : null;
  const minPct = Math.round((lesson?.minScore ?? 0.6) * 100);
  const medal = session.training ? 'target' : passed ? (pct >= 90 ? 'star' : 'check') : 'rotate';

  // Actions : la première est l'action principale, les autres secondaires (côte à côte)
  let primary: ReactNode;
  const others: ReactNode[] = [];
  if (session.training) {
    // retour vers Réviser (pas d'« Autre entraînement » à part) ou origine inconnue : « Terminer »
    const finish = onOther && backLabel !== 'Retour' ? backLabel : t.common.finish;
    const back = <button key="back" className="btn soft" onClick={onClose}>{finish}</button>;
    const other = onOther ? <button key="other" className="btn soft" onClick={onOther}>Autre entraînement</button> : null;
    if (onAgain) { primary = <button className="btn" onClick={onAgain}><Icon name="rotate" size={18} /> Refaire avec d’autres mots</button>; others.push(back); if (other) others.push(other); }
    else { primary = <button className="btn" onClick={onClose}>{finish}</button>; if (other) others.push(other); }
  } else {
    const back = <button key="back" className="btn soft" onClick={onClose}>{backLabel}</button>;
    if (passed && nextCard) { primary = <button className="btn" onClick={() => onNext(next!.lesson.id)}><span className="btn-2l"><b>{t.lesson.nextLesson}</b><small><CardTitle card={nextCard} /></small></span><Icon name="next" size={18} /></button>; others.push(back); }
    else if (!passed) { primary = <button className="btn" onClick={onRetry}><Icon name="rotate" size={18} /> Refaire la leçon</button>; others.push(back); }
    else { primary = <button className="btn" onClick={onClose}>{backLabel}</button>; }
    if (passed && onRead) others.push(<button key="read" className="btn soft" onClick={onRead}><Icon name="mic" size={18} /> {readLabel ?? 'Lire à voix haute'}</button>);
  }

  return (
    <>
      <div className={`recap ${passed ? 'ok' : 'ko'}`}>
        <div className="medal"><Icon name={medal} /></div>
        <div className="score">{session.total ? <>{session.ok}<small> / {session.total}</small></> : '✓'}</div>
        {session.total > 0 && <div className="xs mut mt-1">bonnes réponses du premier coup · {pct} %</div>}
        <div className="verdict-t">{session.training ? 'Entraînement terminé' : passed ? (pct >= 90 ? 'Excellent · ' + t.lesson.passed : t.lesson.passed) : `${t.lesson.failed} : il faut ${minPct} %`}</div>
        <div className="mut sm">{session.title} · +{session.xp} XP</div>
      </div>
      {news.length > 0 && (
        // Toutes les nouveautés visibles d'un coup (pastilles sur plusieurs lignes, pas de rangée coupée au bord)
        <>
          <div className="h2">{t.lesson.newItems}</div>
          <div className="chips wrap recap-new">
            {news.map((it) => (
              <span key={it.id} className={`chip ${missed.has(it.id) ? 'missed' : ''}`}>
                <Thai text={it.kind === 'num' ? it.digits : it.thai} className="th-s ink" />
                {it.kind === 'cons' && <InitialSound s={it.ref.initial} />}
                <span className="xs"><Fr text={it.kind === 'cons' ? it.ref.nameMeaning : it.meaning} /></span>
                {missed.has(it.id) && <span className="tag ko rv-tag">à revoir</span>}
              </span>
            ))}
          </div>
          {missedNew && <p className="foot-note">{'Les éléments marqués «\u00a0à revoir\u00a0» reviendront dans vos révisions.'}</p>}
        </>
      )}
      {wrong.length > 0 && (
        <><div className="h2">{t.lesson.toReview}</div><div className="list">{wrong.map((it) => <div className="row" key={it.id}><span className="mid"><Thai text={it.thai} /><span className="s"><Rom text={it.rom} className="block" /><span className="block"><Fr text={it.kind === 'cons' ? it.ref.nameMeaning : it.meaning} /></span></span></span><span className="end"><AudioButton text={it.say} className="sm" /></span></div>)}</div><p className="foot-note">Ces éléments reviendront dans vos révisions.</p></>
      )}
      <div className="gap" />
      <StepFooter>
        <div className="recap-bar">
          {primary}
          {others.length > 0 && <div className="recap-alt">{others}</div>}
        </div>
      </StepFooter>
    </>
  );
}
