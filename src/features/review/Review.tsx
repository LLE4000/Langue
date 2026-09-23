/** Réviser : répétition espacée en tête, puis les huit modes d'entraînement. */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useDueItems, useLearnedItems } from '@/app/hooks';
import { useStore } from '@/app/store';
import { T } from '@/i18n';
import { Icon } from '@/components/ui';
import type { TrainingMode } from './training';

const MODES: { id: TrainingMode; icon: string }[] = [
  { id: 'flashcards', icon: '🗂️' }, { id: 'listening', icon: '🎧' }, { id: 'speed', icon: '⏱️' }, { id: 'match', icon: '🔗' },
  { id: 'dictation', icon: '✏️' }, { id: 'tones', icon: '🎵' }, { id: 'quiz', icon: '🎲' }, { id: 'timed', icon: '⚡' },
];

export function Review() {
  const t = T();
  usePage(t.review.title);
  const due = useDueItems();
  const learned = useLearnedItems();
  const errors = useStore((s) => s.errors);
  const weak = Object.keys(errors).length;
  const nothingLearned = learned.length < 4;
  return (
    <>
      <Link className="cta" to={due.length ? '/train/review' : '/train/quiz'} aria-disabled={nothingLearned} onClick={(e) => { if (nothingLearned) e.preventDefault(); }}>
        <span className="n"><Icon name="repeat" /></span>
        <span><span className="k">Répétition espacée</span><span className="t">{due.length ? `${due.length} ${due.length > 1 ? 'éléments' : 'élément'} ${t.review.due}` : t.review.nothingDue}</span><span className="s">{nothingLearned ? 'Faites d’abord une leçon : les révisions s’alimentent de ce que vous apprenez.' : due.length ? 'Lettres, mots et tons que la mémoire est sur le point d’oublier' : 'Tout est à jour · un quiz libre pour entretenir'}</span></span>
        {!nothingLearned && <span className="go">{due.length ? t.review.startReview : 'Quiz'}</span>}
      </Link>
      {weak > 0 && <div className="list" style={{ marginTop: 12 }}><Link className="row" to="/train/weak"><span className="ico">🎯</span><span className="mid"><span className="t">{t.review.weak}</span><span className="s">{weak} élément{weak > 1 ? 's' : ''} souvent raté{weak > 1 ? 's' : ''} · à retravailler en priorité</span></span><span className="end"><span className="chev">›</span></span></Link></div>}
      <div className="h2">{t.review.train}</div>
      <p className="lead" style={{ marginTop: -4 }}>{t.review.onlyLearned}</p>
      <div className="tiles">
        {MODES.map((m, i) => (
          <Link key={m.id} to={`/train/${m.id}`} className={`tile ${['', 'gold', 'red', 'indigo', 'plum', 'orange'][i % 6]}`}>
            <span className="e">{m.icon}</span><span className="t">{t.review.modes[m.id as keyof typeof t.review.modes]}</span><span className="s">{t.review.modesDesc[m.id as keyof typeof t.review.modesDesc]}</span>
          </Link>
        ))}
      </div>
      <p className="xs mut ctr" style={{ marginTop: 16 }}>{learned.length} élément{learned.length > 1 ? 's' : ''} dans votre mémoire de révision.</p>
    </>
  );
}
