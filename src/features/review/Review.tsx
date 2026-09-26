/**
 * Réviser, en trois blocs : ce qui est à revoir aujourd'hui (répétition espacée), mes points faibles,
 * s'entraîner (modes courts). Les défis à plusieurs sont à un toucher en bas.
 */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useDueItems, useLearnedItems, useGoals } from '@/app/hooks';
import { useStore } from '@/app/store';
import { T } from '@/i18n';
import { Icon, Ico, Thai } from '@/components/ui';
import { item } from '@/content/th';
import { L } from '@/i18n';
import { recognizer } from '@/app/services/speech';
import type { TrainingMode } from './training';

const MODES: { id: TrainingMode; icon: string; needsReading?: boolean; needsMic?: boolean }[] = [
  { id: 'flashcards', icon: 'cards' }, { id: 'listening', icon: 'ear' }, { id: 'pronunciation', icon: 'mic', needsMic: true }, { id: 'quiz', icon: 'shuffle' },
  { id: 'match', icon: 'link' }, { id: 'speed', icon: 'eye', needsReading: true }, { id: 'dictation', icon: 'pen', needsReading: true }, { id: 'tones', icon: 'music', needsReading: true }, { id: 'timed', icon: 'clock' },
];

export function Review() {
  const t = T();
  usePage(t.review.title, { avatar: true, thai: { th: 'ทบทวน', rom: 'thóp-thuan' } });
  const due = useDueItems();
  const learned = useLearnedItems();
  const goals = useGoals();
  const srs = useStore((s) => s.srs);
  // Même critère que l'entraînement « Points faibles » (training.ts), qui exige au moins 3 éléments
  const weak = Object.values(srs).filter((s) => s.q <= 1 || s.lapses >= 2).length;
  const nothingLearned = learned.length < 4;
  const modes = MODES.filter((m) => (goals.read || !m.needsReading) && (!m.needsMic || recognizer.supported));
  const dueToday = Math.min(20, due.length);
  // Appris récemment (déplacé de l'accueil) : les derniers éléments entrés dans la mémoire de révision
  const recent = learned.slice().sort((a, b) => (srs[b.id]?.first ?? 0) - (srs[a.id]?.first ?? 0)).slice(0, 10);
  return (
    <>
      {/* 1. À revoir aujourd'hui */}
      <section className="revhero" aria-label="À revoir aujourd’hui">
        <span className="eyebrow">Répétition espacée</span>
        {nothingLearned ? (
          <>
            <div className="t">{t.review.nothingDue}</div>
            <div className="s">Les révisions s’alimentent de ce que vous apprenez : commencez par une leçon.</div>
            <Link className="btn" to="/">Aller à ma leçon <Icon name="next" /></Link>
          </>
        ) : due.length ? (
          <>
            <div className="top"><span className="big-n">{dueToday}</span><span><span className="t block">{dueToday > 1 ? 'éléments' : 'élément'} à revoir aujourd’hui</span><span className="s block">{due.length > dueToday ? `${due.length} en attente au total · ` : ''}la mémoire est sur le point de les oublier</span></span></div>
            <Link className="btn" to="/train/review">{t.review.startReview} <Icon name="next" /></Link>
          </>
        ) : (
          <>
            <div className="top"><Ico name="checkCircle" tone="ok" /><span><span className="t block">Tout est à jour</span><span className="s block">Rien à revoir aujourd’hui : un quiz libre entretient la mémoire.</span></span></div>
            <Link className="btn soft" to="/train/quiz">Un quiz libre <Icon name="next" /></Link>
          </>
        )}
      </section>

      {/* 2. Mes points faibles */}
      <div className="h2">{t.review.weak}</div>
      <div className="list">
        {weak >= 3 ? (
          <Link className="row" to="/train/weak"><Ico name="target" tone="ko" /><span className="mid"><span className="t">{weak} élément{weak > 1 ? 's' : ''} souvent raté{weak > 1 ? 's' : ''}</span><span className="s">Une série courte, rien que sur eux</span></span><span className="end"><span className="chev">›</span></span></Link>
        ) : (
          <div className="row muted"><Ico name="checkCircle" tone="ok" /><span className="mid"><span className="t">Aucun point faible pour l’instant</span><span className="s">Ce que vous ratez plusieurs fois apparaîtra ici.</span></span></div>
        )}
      </div>

      {/* 3. S'entraîner */}
      <div className="h2">{t.review.train}</div>
      <p className="note-under">{t.review.onlyLearned}</p>
      <div className="modes">
        {modes.map((m) => (
          <Link key={m.id} to={`/train/${m.id}`} className="mode">
            <span className="ico"><Icon name={m.icon} /></span>
            <span className="grow"><span className="t">{t.review.modes[m.id as keyof typeof t.review.modes]}</span><span className="s">{t.review.modesDesc[m.id as keyof typeof t.review.modesDesc]}</span></span>
          </Link>
        ))}
        <Link to="/explore/comprehension" className="mode"><span className="ico"><Icon name="headphones" /></span><span className="grow"><span className="t">Compréhension orale</span><span className="s">Écouter une conversation, répondre</span></span></Link>
        <Link to="/explore/listen" className="mode"><span className="ico"><Icon name="repeat" /></span><span className="grow"><span className="t">Écoute en boucle</span><span className="s">Sans les mains, en voiture</span></span></Link>
      </div>

      {recent.length > 0 && (
        <>
          <div className="h2">Appris récemment</div>
          <div className="chips">
            {recent.map((it) => <Link key={it.id} to={`/explore/search?q=${encodeURIComponent(it.thai)}`} className="chip"><Thai text={it.thai} className="th-s ink" /><span className="xs">{it.kind === 'cons' ? item(it.id)?.rom.split(' ')[0] : L(it.meaning).split(/[;,]/)[0]}</span></Link>)}
          </div>
        </>
      )}
      <p className="xs mut ctr mt-4">{learned.length} élément{learned.length > 1 ? 's' : ''} dans votre mémoire de révision.</p>
    </>
  );
}
