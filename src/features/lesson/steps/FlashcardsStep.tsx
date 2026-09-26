/**
 * Découverte : cartes recto/verso avec auto-évaluation (confiance déclarée).
 * Au verso, on peut aussi balayer la carte : vers la droite = « Bien », vers la gauche = « Encore ».
 */
import { useEffect, useRef, useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { ITEMS } from '@/content/th';
import { useStore } from '@/app/store';
import { useAutoSpeak } from '@/app/services/speech';
import { T } from '@/i18n';
import { AudioPair, Icon, useOral } from '@/components/ui';
import { StepFooter, ContinueButton, useDigitKeys } from '@/components/StepFooter';
import { ItemBack, ItemFront } from '@/components/ItemCard';
import { MicPanel } from '@/components/MicPanel';
import { useStepProgress } from '../progress';

const SWIPE_PX = 80;

export function FlashcardsStep({ step, onDone }: { step: RuntimeStep & { type: 'flashcards' }; onDone: (r: StepResult) => void }) {
  const t = T();
  const [queue, setQueue] = useState(step.items.filter((id) => ITEMS[id]));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [mic, setMic] = useState(false);
  const [again, setAgain] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ n: 0, easy: 0 });
  const [dx, setDx] = useState(0);
  const drag = useRef<{ x: number; id: number } | null>(null);
  const rateItem = useStore((s) => s.rateItem);
  const it = ITEMS[queue[i]];
  // Pas encore lisible : la carte se présente à l'oral (phonétique + audio dès le recto)
  const oral = useOral(it?.thai);
  useAutoSpeak(it && (shown || oral) ? it.say : null, [i, oral ? 0 : shown]);
  const inLesson = useStepProgress((i + (shown ? 0.5 : 0)) / Math.max(1, queue.length));
  useEffect(() => { if (!queue.length) onDone({}); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const rate = (q: 0 | 1 | 2 | 3) => {
    if (!it) return;
    rateItem(it.id, q);
    const n = stats.n + 1, easy = stats.easy + (q >= 2 ? 1 : 0);
    setStats({ n, easy });
    let nq = queue;
    if (q <= 1 && (again[it.id] ?? 0) < 1) { setAgain({ ...again, [it.id]: 1 }); nq = [...queue.slice(0, Math.min(queue.length, i + 3)), it.id, ...queue.slice(Math.min(queue.length, i + 3))]; setQueue(nq); }
    if (i + 1 >= nq.length) { onDone({ xp: Math.round(step.items.length * 1.5) }); return; }
    setI(i + 1); setShown(false); setDx(0);
  };
  useDigitKeys(shown ? 4 : 0, (k) => rate(k as 0 | 1 | 2 | 3));
  // Balayage : au recto, glisser retourne la carte (comme la toucher) ; au verso, droite = « Bien », gauche = « Encore »
  const onDown = (e: React.PointerEvent) => { drag.current = { x: e.clientX, id: e.pointerId }; };
  const onMove = (e: React.PointerEvent) => { if (!drag.current || drag.current.id !== e.pointerId) return; setDx(e.clientX - drag.current.x); };
  const onUp = (e: React.PointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return;
    const d = e.clientX - drag.current.x; drag.current = null;
    if (!shown) { setDx(0); if (Math.abs(d) > SWIPE_PX) setShown(true); return; }
    if (d > SWIPE_PX) rate(2); else if (d < -SWIPE_PX) rate(0); else setDx(0);
  };
  if (!it) return null;
  // La barre du haut compte déjà les cartes dans une leçon
  const counter = inLesson ? null : <span className="b num">{i + 1} / {queue.length}</span>;
  const swipeCls = dx > SWIPE_PX / 2 ? 'sw-right' : dx < -SWIPE_PX / 2 ? 'sw-left' : '';
  return (
    <>
      <p className="qprompt">{step.note ? step.note.fr : shown ? t.lesson.howWell : 'Vous vous en souvenez ?'}</p>
      {step.knownOrally && !shown && <div className="note info sm mt-0">Vous connaissez ce mot à l’oral : essayez de le LIRE avant de retourner la carte.</div>}
      <div className={`stage fcard ${shown ? 'compact' : ''} ${swipeCls}`} onClick={() => !shown && setShown(true)} role={shown ? undefined : 'button'} style={{ cursor: shown ? 'grab' : 'pointer', transform: dx ? `translateX(${dx}px) rotate(${dx / 30}deg)` : undefined, transition: dx ? 'none' : 'transform .2s' }}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={() => { drag.current = null; setDx(0); }}>
        {!useStore.getState().srs[it.id] && <span className="tag gold center">{t.common.new}</span>}
        {shown && <><span className="sw-hint left">✗ Encore</span><span className="sw-hint right">✓ Bien</span></>}
        <ItemFront it={it} hideClass={!shown} modern={shown} oral={oral && !shown} />
        {!shown && <span className="hint">Touchez ou faites glisser la carte pour la retourner</span>}
      </div>
      <div className="audio"><AudioPair text={it.say} big /><button className="ib big" onClick={() => setMic(true)} aria-label="Vérifier ma prononciation" title="Vérifier ma prononciation"><Icon name="mic" /></button></div>
      {shown ? (
        <>
          <div className="ans"><ItemBack it={it} /></div>
          <div className="sp" />
          <StepFooter meta={<><span>Glissez : à droite « Bien », à gauche « Encore »</span>{counter}</>}>
            <div className="rate mt-0">
              {t.lesson.rate.map((lab, q) => <button key={q} data-q={q} onClick={() => rate(q as 0 | 1 | 2 | 3)}><i aria-hidden="true" /><span className="k" aria-hidden="true">{q + 1}</span>{lab}</button>)}
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
