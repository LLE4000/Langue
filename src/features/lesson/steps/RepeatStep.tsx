/** À vous : écouter, dire, vérifier que le moteur comprend (jamais bloquant ; noté seulement en entraînement Prononciation). */
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
  const [scores, setScores] = useState<Record<string, number>>({});
  const it = items[i];
  if (!it) { onDone({}); return null; }
  const finish = () => {
    const done = Object.values(scores);
    const good = done.filter((s) => s >= 8).length;
    if (step.graded) onDone({ ok: good, total: items.length, xp: good * 3 + done.length, wrong: items.filter((x) => scores[x.id] != null && scores[x.id] < 6).map((x) => x.id) });
    else onDone({ xp: items.length * 2 + good * 2 });
  };
  const best = scores[it.id];
  return (
    <>
      <p className="qprompt">{t.lesson.repeat}</p>
      <p className="sm mut ctr" style={{ marginTop: -6 }}>Écoutez, puis dites-le : l’application vérifie que le thaï est compris.</p>
      <MicPanel key={it.id} item={it} inline onScore={(s) => setScores((prev) => ({ ...prev, [it.id]: Math.max(prev[it.id] ?? 0, s) }))} />
      <div className="sp" />
      <StepFooter meta={<><span>{best != null ? `Note : ${best}/10` : step.graded ? 'Dites le mot pour obtenir une note' : 'Facultatif : jamais bloquant.'}</span><span className="b">{i + 1} / {items.length}</span></>}>
        <div className="btns">
          {!step.graded && <button className="btn ghost" onClick={() => onDone({ xp: i + 1 })}>{t.common.skip}</button>}
          <ContinueButton onClick={() => (i + 1 < items.length ? setI(i + 1) : finish())} label={i + 1 < items.length ? t.common.continue : t.common.finish} />
        </div>
      </StepFooter>
    </>
  );
}
