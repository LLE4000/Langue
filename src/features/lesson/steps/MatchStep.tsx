/** Associer : relier chaque mot thaï à son sens (ou sa transcription). */
import { useEffect, useMemo, useState } from 'react';
import type { RuntimeStep } from '../engine';
import type { StepResult } from '../LessonRunner';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { shuffle } from '@/engine/util';
import { T } from '@/i18n';
import { Thai, Fr, useShowRom } from '@/components/ui';

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
  const [errors, setErrors] = useState(0);
  const showRom = useShowRom(undefined);
  const tryMatch = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    if (l === r) {
      const m = new Set(matched); m.add(l); setMatched(m); setSelL(null); setSelR(null); answer(l, true);
      const p = step.pairs.find((x) => x.id === l); if (p) sp.speak(p.thai);
    } else { setBad(l + '|' + r); setErrors(errors + 1); answer(l, false); setTimeout(() => { setBad(null); setSelL(null); setSelR(null); }, 500); }
  };
  useEffect(() => {
    if (matched.size !== step.pairs.length || !step.pairs.length) return;
    const h = setTimeout(() => onDone({ ok: Math.max(0, step.pairs.length - errors), total: step.pairs.length, xp: Math.max(2, step.pairs.length * 2 - errors) }), 500);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matched.size]);
  const cls = (id: string, side: 'l' | 'r', sel: string | null) => matched.has(id) ? 'ok' : bad && bad.split('|')[side === 'l' ? 0 : 1] === id ? 'ko' : sel === id ? 'on' : '';
  return (
    <>
      <p className="qprompt">{t.lesson.matchPairs}</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div className="stack" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 0 }}>
          {left.map((p) => <button key={p.id} data-pair={p.id} className={`pr ${cls(p.id, 'l', selL)}`} style={{ marginTop: 0 }} onClick={() => { setSelL(p.id); tryMatch(p.id, selR); }}><Thai text={p.thai} />{showRom && step.by === 'meaning' && <span className="rom xs">{p.rom}</span>}</button>)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {right.map((p) => <button key={p.id} data-pair={p.id} className={`pr ${cls(p.id, 'r', selR)}`} onClick={() => { setSelR(p.id); tryMatch(selL, p.id); }}>{step.by === 'meaning' ? <Fr text={p.text} /> : <span className="rom">{p.rom}</span>}</button>)}
        </div>
      </div>
    </>
  );
}
