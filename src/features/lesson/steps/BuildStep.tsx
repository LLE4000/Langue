/** Construire la phrase : remettre les mots d'une phrase de lecture dans l'ordre. */
import { useEffect, useMemo, useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { READING_BY_ID, sentenceThai, sentenceRom } from '@/content/th';
import { useSpeaker } from '@/app/services/speech';
import { shuffle } from '@/engine/util';
import { T } from '@/i18n';
import { AudioButton, Fr, Thai, Rom } from '@/components/ui';
import { StepFooter, ContinueButton } from '@/components/StepFooter';

export function BuildStep({ step, onDone }: { step: RuntimeStep & { type: 'build' }; onDone: (r: StepResult) => void }) {
  const t = T();
  const sp = useSpeaker();
  const items = useMemo(() => step.items.map((s) => { const r = READING_BY_ID[s.readingId]; const sent = r.sentences[s.index]; const toks = sent.tokens.filter((x) => !/\{/.test(x.thai)); let order: number[]; do order = shuffle(toks.map((_, k) => k)); while (toks.length > 1 && order.every((v, k) => v === k)); return { sent, toks, order }; }), [step]);
  const [i, setI] = useState(0);
  const [pick, setPick] = useState<number[]>([]);
  const [res, setRes] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const cur = items[i];
  useEffect(() => { if (!items.length) onDone({}); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!cur) return null;
  const full = sentenceThai(cur.toks);
  const check = () => { const ok = pick.map((k) => cur.toks[k].thai).join('') === full; setRes(ok); if (ok) { setScore(score + 1); sp.speak(full); } };
  const next = () => { if (i + 1 >= items.length) { onDone({ ok: score, total: items.length, xp: score * 4 }); return; } setI(i + 1); setPick([]); setRes(null); };
  return (
    <>
      <p className="qprompt">{t.lesson.order}</p>
      <div className="stage compact"><div className="frbig" style={{ fontSize: 22 }}><Fr text={cur.sent.tr} /></div></div>
      <div className="audio"><AudioButton text={full} /><span className="xs mut">indice audio</span></div>
      <div className="tline" aria-label="Votre phrase">{pick.length === 0 && <span className="xs mut" style={{ alignSelf: 'center' }}>Votre phrase apparaît ici · touchez un mot placé pour le retirer</span>}{pick.map((k, j) => <button key={j} className="tok" disabled={res !== null} onClick={() => setPick(pick.filter((_, x) => x !== j))} aria-label={`Retirer ${cur.toks[k].thai}`}><Fr text={cur.toks[k].thai} /></button>)}</div>
      <div className="tline" style={{ border: 0, background: 'none', padding: '12px 0', justifyContent: 'center' }}>{cur.order.map((k) => <button key={k} className={`tok ${pick.includes(k) ? 'used' : ''}`} disabled={res !== null} onClick={() => setPick([...pick, k])}><Fr text={cur.toks[k].thai} /></button>)}</div>
      <div className="sp" />
      <StepFooter tone={res === null ? '' : res ? 'ok' : 'ko'} meta={res === null ? <><span>Touchez les mots dans l’ordre, puis vérifiez</span><span className="b">{i + 1} / {items.length}</span></> : undefined}>
        {res === null ? (
          <div className="btns">
            {pick.length > 0 && <button className="btn ghost" style={{ flex: '0 0 auto' }} onClick={() => setPick([])}>Effacer</button>}
            <ContinueButton onClick={check} label={t.common.check} icon={false} disabled={pick.length !== cur.toks.length} />
          </div>
        ) : (
          <><div className="qfin"><span className={`verdict ${res ? 'ok' : 'ko'}`}>{res ? '✓ ' + t.common.correct : '✗ ' + t.common.wrong}</span>{!res && <span className="good"> · {t.common.goodAnswer} :</span>}<div style={{ marginTop: 4 }}><Thai text={full} /><br /><Rom text={sentenceRom(cur.toks)} /></div></div>
            <ContinueButton onClick={next} label={t.common.continue} auto={res} autoMs={1600} autoFocus /></>
        )}
      </StepFooter>
    </>
  );
}
