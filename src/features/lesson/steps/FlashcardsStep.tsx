/** Découverte : cartes recto/verso avec auto-évaluation (confiance déclarée). */
import { useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { ITEMS } from '@/content/th';
import { useStore } from '@/app/store';
import { useAutoSpeak } from '@/app/services/speech';
import { T } from '@/i18n';
import { AudioPair, Icon } from '@/components/ui';
import { StepFooter, ContinueButton, useDigitKeys } from '@/components/StepFooter';
import { ItemBack, ItemFront } from '@/components/ItemCard';
import { MicPanel } from '@/components/MicPanel';

export function FlashcardsStep({ step, onDone }: { step: RuntimeStep & { type: 'flashcards' }; onDone: (r: StepResult) => void }) {
  const t = T();
  const [queue, setQueue] = useState(step.items.filter((id) => ITEMS[id]));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [mic, setMic] = useState(false);
  const [again, setAgain] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ n: 0, easy: 0 });
  const rateItem = useStore((s) => s.rateItem);
  const it = ITEMS[queue[i]];
  useAutoSpeak(shown && it ? it.say : null, [i]);
  const rate = (q: 0 | 1 | 2 | 3) => {
    if (!it) return;
    rateItem(it.id, q);
    const n = stats.n + 1, easy = stats.easy + (q >= 2 ? 1 : 0);
    setStats({ n, easy });
    let nq = queue;
    if (q <= 1 && (again[it.id] ?? 0) < 1) { setAgain({ ...again, [it.id]: 1 }); nq = [...queue.slice(0, Math.min(queue.length, i + 3)), it.id, ...queue.slice(Math.min(queue.length, i + 3))]; setQueue(nq); }
    if (i + 1 >= nq.length) { onDone({ xp: Math.round(step.items.length * 1.5) }); return; }
    setI(i + 1); setShown(false);
  };
  useDigitKeys(shown ? 4 : 0, (k) => rate(k as 0 | 1 | 2 | 3));
  if (!it) return null;
  const counter = <span className="b" style={{ fontVariantNumeric: 'tabular-nums' }}>{i + 1} / {queue.length}</span>;
  return (
    <>
      <p className="qprompt">{step.note ? step.note.fr : shown ? t.lesson.howWell : 'Vous vous en souvenez ?'}</p>
      {step.knownOrally && !shown && <div className="note info sm" style={{ marginTop: 0 }}>Vous connaissez ce mot à l’oral : essayez de le LIRE avant de retourner la carte.</div>}
      <div className={`stage ${shown ? 'compact' : ''}`} onClick={() => !shown && setShown(true)} role={shown ? undefined : 'button'} style={{ cursor: shown ? 'default' : 'pointer' }}>
        {!useStore.getState().srs[it.id] && <span className="tag gold" style={{ left: '50%', transform: 'translateX(-50%)' }}>{t.common.new}</span>}
        <ItemFront it={it} hideClass={!shown} modern={shown} />
        {!shown && <span className="hint">Touchez la carte pour la retourner</span>}
      </div>
      <div className="audio"><AudioPair text={it.say} big /><button className="ib big" onClick={() => setMic(true)} aria-label="M'enregistrer"><Icon name="mic" /></button></div>
      {shown ? (
        <>
          <div className="ans"><ItemBack it={it} /></div>
          <div className="sp" />
          <StepFooter meta={<><span>{t.lesson.howWell}</span>{counter}</>}>
            <div className="rate" style={{ marginTop: 0 }}>
              {t.lesson.rate.map((lab, q) => <button key={q} data-q={q} onClick={() => rate(q as 0 | 1 | 2 | 3)}><i aria-hidden="true" />{lab}</button>)}
            </div>
          </StepFooter>
        </>
      ) : (
        <>
          <div className="sp" />
          <StepFooter meta={<><span>Lisez, écoutez, essayez de vous rappeler</span>{counter}</>}>
            <ContinueButton onClick={() => setShown(true)} label={t.common.reveal} icon={false} />
          </StepFooter>
        </>
      )}
      {mic && <MicPanel item={it} onClose={() => setMic(false)} />}
    </>
  );
}
