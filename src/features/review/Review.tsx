/**
 * Réviser : ce qui est à revoir aujourd'hui (répétition espacée), mes points faibles, puis deux familles d'exercices :
 * « Séances rapides » (neuf modes courts, faits uniquement de ce qu'on a appris ; grisés tant qu'il n'y a pas assez
 * d'éléments, avec la leçon qui les ouvrira) et « À l'oral » (reprendre mes lectures ratées, conversation parlée,
 * compréhension orale), qui ont leur propre contenu. En bas, ce qui a été appris récemment : chaque élément ouvre sa
 * fiche sur place, et l'ensemble s'écoute en boucle.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useDueItems, useLearnedItems, useGoals, useKnown, useLevels } from '@/app/hooks';
import { useStore, emptyReadAloud } from '@/app/store';
import { T } from '@/i18n';
import { Icon, Ico, Thai } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import { curriculum } from '@/content/packs';
import { lessonKind } from '@/curriculum/card';
import { L } from '@/i18n';
import { recognizer, recorder } from '@/app/services/speech';
import { buildTraining, type TrainingMode } from './training';
import { weakItems } from '@/features/readaloud/data';

/** Les séances rapides, dans l'ordre d'usage ; `until` : ce qui les ouvre quand il manque des éléments. */
const MODES: { id: TrainingMode; icon: string; needsReading?: boolean; needsMic?: boolean; until: string }[] = [
  { id: 'flashcards', icon: 'cards', until: 'après 1 leçon' }, { id: 'listening', icon: 'ear', until: 'après 1 leçon' }, { id: 'quiz', icon: 'shuffle', until: 'après 1 leçon' },
  { id: 'match', icon: 'link', until: 'après 1 leçon de vocabulaire' }, { id: 'pronunciation', icon: 'mic', needsMic: true, until: 'après 1 leçon de conversation' },
  { id: 'speed', icon: 'eye', needsReading: true, until: 'après les premières lettres' }, { id: 'dictation', icon: 'pen', needsReading: true, until: 'après les premières lettres' },
  { id: 'tones', icon: 'music', needsReading: true, until: 'après la leçon sur les tons' }, { id: 'timed', icon: 'clock', until: 'après 2 leçons' },
];

export function Review() {
  const t = T();
  usePage(t.review.title, { avatar: true, thai: { th: 'ทบทวน', rom: 'thóp-thuan' } });
  const due = useDueItems();
  const learned = useLearnedItems();
  const goals = useGoals();
  const known = useKnown();
  const levels = useLevels();
  const srs = useStore((s) => s.srs);
  const seen = useStore((s) => s.seen);
  // Même critère que l'entraînement « Points faibles » (training.ts), qui exige au moins 3 éléments
  const weak = Object.values(srs).filter((s) => s.q <= 1 || s.lapses >= 2).length;
  const nothingLearned = learned.length < 4;
  const modes = MODES.filter((m) => (goals.read || !m.needsReading) && (!m.needsMic || recognizer.supported));
  // Une séance rapide est ouverte si elle peut se construire avec ce qui a été appris (même calcul qu'au lancement)
  const ready = useMemo(() => {
    const ctx = { known: known.concepts, srs, levels, knownOrally: false, seen, micAvailable: recorder.supported || recognizer.supported };
    // les tons s'entraînent après la première leçon de la piste « tons » (l'exercice existerait sans, mais hors sol)
    const tonesDone = curriculum().lessons.some((l) => lessonKind(l) === 'tones' && known.doneLessons.has(l.id));
    return new Set(MODES.filter((m) => (m.id !== 'tones' || tonesDone) && buildTraining(m.id, ctx)).map((m) => m.id));
  }, [known.concepts, known.doneLessons, srs, levels, seen]);
  const dueToday = Math.min(20, due.length);
  const raWeak = weakItems(useStore((s) => s.readAloud) ?? emptyReadAloud()).length;
  // Appris récemment (déplacé de l'accueil) : les derniers éléments entrés dans la mémoire de révision
  const recent = learned.slice().sort((a, b) => (srs[b.id]?.first ?? 0) - (srs[a.id]?.first ?? 0)).slice(0, 10);
  const recentIds = recent.map((it) => it.id);
  const [detail, setDetail] = useState<number | null>(null);
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

      {/* 2. Mes points faibles (les mots ; les lectures ratées sont « À l'oral ») */}
      <div className="h2">{t.review.weak}</div>
      <div className="list">
        {weak >= 3 ? (
          <Link className="row" to="/train/weak"><Ico name="target" tone="ko" /><span className="mid"><span className="t">{weak} élément{weak > 1 ? 's' : ''} souvent raté{weak > 1 ? 's' : ''}</span><span className="s">Une série courte, rien que sur eux</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
        ) : (
          <div className="row muted"><Ico name="checkCircle" tone="ok" /><span className="mid"><span className="t">Aucun point faible pour l’instant</span><span className="s">Ce que vous ratez plusieurs fois apparaîtra ici.</span></span></div>
        )}
      </div>

      {/* 3. Séances rapides : uniquement ce qui a été appris */}
      <div className="h2">Séances rapides</div>
      <p className="note-under">{t.review.onlyLearned}</p>
      <div className="modes">
        {modes.map((m) => {
          const label = t.review.modes[m.id as keyof typeof t.review.modes];
          const inner = <><span className="ico"><Icon name={m.icon} /></span><span className="grow"><span className="t">{label}</span><span className="s">{ready.has(m.id) ? t.review.modesDesc[m.id as keyof typeof t.review.modesDesc] : m.until}</span></span></>;
          return ready.has(m.id)
            ? <Link key={m.id} to={`/train/${m.id}`} className="mode">{inner}</Link>
            : <div key={m.id} className="mode off" aria-disabled="true">{inner}</div>;
        })}
      </div>

      {/* 4. À l'oral : des activités qui ont leur propre contenu */}
      <div className="h2">À l’oral</div>
      <div className="list">
        {raWeak > 0 && <Link className="row tall" to="/read/errors?mode=read"><Ico name="mic" tone="ko" /><span className="mid"><span className="t">Reprendre mes lectures</span><span className="s">{raWeak} lecture{raWeak > 1 ? 's' : ''} ratée{raWeak > 1 ? 's' : ''} au tapis de lecture, à relire à voix haute</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>}
        <Link className="row tall" to="/talk"><Ico name="chat" tone="jade" /><span className="mid"><span className="t">Conversation parlée</span><span className="s">Jouer son rôle au micro, plusieurs réponses acceptées</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
        <Link className="row tall" to="/explore/comprehension"><Ico name="headphones" tone="indigo" /><span className="mid"><span className="t">Compréhension orale</span><span className="s">Écouter une conversation, puis répondre</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
      </div>

      {recent.length > 0 && (
        <>
          <div className="h2">Appris récemment <span className="sp" /><Link to={`/explore/listen?ids=${encodeURIComponent(recentIds.join(','))}`} className="sm">Écouter ces mots en boucle ›</Link></div>
          <div className="chips">
            {recent.map((it, i) => (
              <button key={it.id} type="button" className="chip" onClick={() => setDetail(i)} aria-label={`Ouvrir la fiche : ${it.thai}`}>
                <Thai text={it.thai} className="th-s ink" />
                {it.kind === 'cons' ? <span className="xs thi" lang="th">{it.ref.nameWord}</span> : <span className="xs">{L(it.meaning).split(/[;,]/)[0]}</span>}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="xs mut ctr mt-4">{learned.length} élément{learned.length > 1 ? 's' : ''} dans votre mémoire de révision.</p>
      {detail != null && <ItemDetailSheet ids={recentIds} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
