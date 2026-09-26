/** Associer : relier chaque mot thaï à son sens (ou sa transcription). Se termine tout seul quand tout est relié. */
import { useEffect, useMemo, useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { shuffle } from '@/engine/util';
import { T } from '@/i18n';
import { Icon, Thai, Fr, Rom, useShowRom, useOral } from '@/components/ui';
import { StepFooter, ContinueButton } from '@/components/StepFooter';
import { useStepProgress } from '../progress';

function LeftPair({ p, cls, showRom, byMeaning, onClick }: { p: { id: string; thai: string; rom: string }; cls: string; showRom: boolean; byMeaning: boolean; onClick: () => void }) {
  const oral = useOral(p.thai);
  return (
    <button data-pair={p.id} className={`pr ${cls}`} onClick={onClick}>
      {oral && byMeaning ? <><Rom text={p.rom} className="main" /><Thai text={p.thai} className="sub" /></> : <><Thai text={p.thai} />{showRom && byMeaning && <span className="rom xs">{p.rom}</span>}</>}
    </button>
  );
}

export function MatchStep({ step, onDone }: { step: RuntimeStep & { type: 'match' }; onDone: (r: StepResult) => void }) {
  const t = T();
  const sp = useSpeaker();
  const answer = useStore((s) => s.answer);
  const left = useMemo(() => shuffle(step.pairs), [step]);
  const right = useMemo(() => shuffle(step.pairs), [step]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [bad, setBad] = useState<string | null>(null);
  const [missed, setMissed] = useState<Set<string>>(new Set()); // paires ratées au moins une fois
  const showRom = useShowRom(undefined);
  const complete = step.pairs.length > 0 && matched.size === step.pairs.length;
  useStepProgress(matched.size / Math.max(1, step.pairs.length));
  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r || bad) return;
    if (l === r) {
      const m = new Set(matched); m.add(l); setMatched(m); setSelL(null); setSelR(null); answer(l, true);
      const p = step.pairs.find((x) => x.id === l); if (p) sp.speak(p.thai);
    } else {
      setBad(l + '|' + r); setMissed((s) => new Set(s).add(l).add(r)); answer(l, false);
      setTimeout(() => { setBad(null); setSelL(null); setSelR(null); }, 500);
    }
  };
  const errors = missed.size;
  const finish = () => onDone({ ok: Math.max(0, step.pairs.length - errors), total: step.pairs.length, xp: Math.max(2, step.pairs.length * 2 - errors), wrong: [...missed] });
  useEffect(() => { if (!step.pairs.length) onDone({}); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const cls = (id: string, side: 'l' | 'r', sel: string | null) => matched.has(id) ? 'ok' : bad && bad.split('|')[side === 'l' ? 0 : 1] === id ? 'ko' : sel === id ? 'on' : '';
  return (
    <>
      <p className="qprompt">{t.lesson.matchPairs}</p>
      <p className="sm mut ctr mb-3 mt-n1">Touchez un élément dans chaque colonne pour les relier.</p>
      <div className={`match ${bad ? 'lock' : ''}`}>
        <div className="match-col">
          {left.map((p) => <LeftPair key={p.id} p={p} cls={cls(p.id, 'l', selL)} showRom={showRom} byMeaning={step.by === 'meaning'} onClick={() => { if (bad) return; setSelL(p.id); tryMatch(p.id, selR); }} />)}
        </div>
        <div className="match-col">
          {right.map((p) => <button key={p.id} data-pair={p.id} className={`pr ${cls(p.id, 'r', selR)}`} onClick={() => { if (bad) return; setSelR(p.id); tryMatch(selL, p.id); }}>{step.by === 'meaning' ? <Fr text={p.text} /> : <span className="rom">{p.rom}</span>}</button>)}
        </div>
      </div>
      <div className="sp" />
      {complete && (
        <StepFooter tone="ok">
          <div className="qfin"><span className="verdict ok"><Icon name="check" />Toutes les paires sont reliées</span>{errors > 0 && <span className="mut"> · {errors} paire{errors > 1 ? 's' : ''} à revoir</span>}</div>
          <ContinueButton onClick={finish} label={t.common.continue} auto autoMs={900} autoFocus />
        </StepFooter>
      )}
    </>
  );
}
