/** À vous : écouter, répéter, s'enregistrer (facultatif, jamais bloquant). */
import { useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { ITEMS } from '@/content/th';
import { T } from '@/i18n';
import { MicPanel } from '@/components/MicPanel';
import { StepFooter, ContinueButton } from '@/components/StepFooter';

export function RepeatStep({ step, onDone }: { step: RuntimeStep & { type: 'repeat' }; onDone: (r: StepResult) => void }) {
  const t = T();
  const items = step.items.map((id) => ITEMS[id]).filter(Boolean);
  const [i, setI] = useState(0);
  const it = items[i];
  if (!it) { onDone({}); return null; }
  return (
    <>
      <p className="qprompt">{t.lesson.repeat}</p>
      <p className="sm mut ctr" style={{ marginTop: -6 }}>{t.lesson.repeatHint}</p>
      <MicPanel key={it.id} item={it} inline />
      <div className="sp" />
      <StepFooter meta={<><span>Facultatif : l’enregistrement n’est jamais noté.</span><span className="b">{i + 1} / {items.length}</span></>}>
        <div className="btns">
          <button className="btn ghost" onClick={() => onDone({ xp: i + 1 })}>{t.common.skip}</button>
          <ContinueButton onClick={() => (i + 1 < items.length ? setI(i + 1) : onDone({ xp: items.length * 2 }))} label={t.common.continue} />
        </div>
      </StepFooter>
    </>
  );
}
