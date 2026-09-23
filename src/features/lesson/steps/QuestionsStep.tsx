/**
 * Suite de questions (écoute, lecture, sens, dictée, tons, syllabes, épellation).
 * Une mauvaise réponse revient plus loin dans la série (maîtrise progressive, au plus deux fois).
 * Après une bonne réponse, la suite arrive seule (réglage « avance automatique ») ; après une erreur,
 * on prend le temps de lire la correction et on touche « Continuer ».
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Question, RuntimeStep } from '../engine';
import { xpFor } from '../engine';
import type { StepResult } from '../LessonRunner';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { L, T } from '@/i18n';
import { AudioPair, Thai, Rom, Fr, sizeClass, useShowRom, useTokens } from '@/components/ui';
import { StepFooter, ContinueButton, useDigitKeys } from '@/components/StepFooter';
import { ToneCurve } from '@/components/ToneCurve';
import { WordByWord } from '@/components/WordByWord';
import { resolveTokens } from '@/engine/tokens';
import { ITEMS } from '@/content/th';
import type { ToneId } from '@/content/types';

function ChoiceLabel({ c, lg }: { c: Question['choices'][number]; lg?: boolean }) {
  return (
    <>
      {c.tone && <ToneCurve tone={c.tone as ToneId} />}
      {c.thai && <Thai text={c.thai} className={lg ? 'lg' : ''} />}
      {c.rom && <span className="rom" style={{ fontSize: c.thai ? 15 : 20 }}>{c.rom}</span>}
      {c.text && <span>{c.text}</span>}
    </>
  );
}

function Stage({ q, done }: { q: Question; done: boolean }) {
  const tok = useTokens();
  const showRom = useShowRom(q.stage.thai, q.stage.showRom);
  if (q.stage.ear && !done) return <div className="stage ear"><div style={{ fontSize: 52 }}>👂</div><div className="mut sm">Écoutez, puis choisissez</div></div>;
  if (q.stage.ear && done && q.reveal?.thai) {
    const long = /[\s]|.{8,}/.test(q.reveal.thai);
    return <div className="stage compact">{long ? <WordByWord thai={q.reveal.thai} rom={q.reveal.rom ?? ''} big chips={false} /> : <><div className={`big ${sizeClass(q.reveal.thai)}`}><Thai text={q.reveal.thai} /></div>{q.reveal.rom && <span className="rom" style={{ fontSize: 22, fontWeight: 600 }}>{resolveTokens(q.reveal.rom, tok)}</span>}</>}{q.reveal.text && <span className="mut">{resolveTokens(q.reveal.text, tok)}</span>}</div>;
  }
  return (
    <div className={`stage ${q.stage.big ? '' : 'compact'}`}>
      {q.stage.thai && <div className={`big ${sizeClass(q.stage.thai)}`}><Thai text={q.stage.thai} /></div>}
      {q.stage.rom && (showRom || q.kind === 'toneEar' || q.stage.showRom) && <span className="rom plain">{resolveTokens(q.stage.rom, tok)}</span>}
      {q.stage.text && <div className={q.stage.thai ? 'mut' : 'frbig'}>{resolveTokens(q.stage.text, tok)}</div>}
    </div>
  );
}

function SpellInput({ q, onAnswer, done }: { q: Question; onAnswer: (ok: boolean) => void; done: boolean }) {
  const [picked, setPicked] = useState<number[]>([]);
  const tiles = q.spell!.tiles;
  const typed = picked.map((k) => tiles[k]).join('');
  useEffect(() => {
    if (!done && typed.length === q.spell!.target.length) onAnswer(typed === q.spell!.target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typed]);
  return (
    <>
      <div className="spellzone" onClick={() => !done && setPicked(picked.slice(0, -1))} role="button" aria-label="Retirer le dernier signe">{typed || <span className="mut" style={{ fontSize: 15, fontFamily: 'var(--f-ui)' }}>touchez les signes dans l’ordre</span>}</div>
      <div className="tiles-spell">{tiles.map((c, k) => <button key={k} lang="th" className={picked.includes(k) ? 'used' : ''} disabled={done} onClick={() => setPicked([...picked, k])}>{c}</button>)}</div>
      {!done && picked.length > 0 && <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setPicked([])}>Effacer</button>}
    </>
  );
}

export function QuestionsStep({ step, onDone, timed, noRetry }: { step: RuntimeStep & { type: 'questions' }; onDone: (r: StepResult) => void; timed?: boolean; noRetry?: boolean }) {
  const t = T();
  const sp = useSpeaker();
  const answer = useStore((s) => s.answer);
  const markSeen = useStore((s) => s.markSeen);
  const [queue, setQueue] = useState<Question[]>(step.questions);
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [ok, setOk] = useState<boolean | null>(null);
  const [stats, setStats] = useState({ ok: 0, total: 0, xp: 0, wrong: [] as string[] });
  const retries = useRef<Record<string, number>>({});
  const t0 = useRef(performance.now());
  const [elapsed, setElapsed] = useState(0);
  const q = queue[i];
  const done = ok !== null;
  const first = useMemo(() => !/-r\d+$/.test(q?.id ?? ''), [q?.id]);

  useEffect(() => {
    t0.current = performance.now();
    if (q?.say) { const h = setTimeout(() => sp.speak(q.say!), 350); return () => clearTimeout(h); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q?.id]);
  useEffect(() => {
    if (!timed || done) return;
    const h = setInterval(() => setElapsed((performance.now() - t0.current) / 1000), 100);
    return () => clearInterval(h);
  }, [timed, done, q?.id]);

  const grade = (isOk: boolean, idx: number | null) => {
    if (done || !q) return;
    const secs = (performance.now() - t0.current) / 1000;
    setPicked(idx); setOk(isOk);
    if (q.itemId) answer(q.itemId, isOk, secs, q.ruleKey);
    markSeen(q.itemId ?? q.id);
    const xp = isOk ? xpFor(q, first) : 0;
    setStats((s) => ({ ok: s.ok + (isOk && first ? 1 : 0), total: s.total + (first ? 1 : 0), xp: s.xp + xp, wrong: isOk || !q.itemId ? s.wrong : [...s.wrong, q.itemId!] }));
    if (isOk && q.sayAfter) setTimeout(() => sp.speak(q.sayAfter!), 250);
    if (!isOk && q.sayAfter) setTimeout(() => sp.speak(q.sayAfter!), 600);
  };
  // Clavier : 1–4 pour répondre (hors épellation)
  useDigitKeys(!q || done || q.kind === 'spell' ? 0 : q.choices.length, (k) => grade(!!q!.choices[k].ok, k));

  if (!q) return null;

  const baseId = q.id.replace(/-r\d+$/, '');
  const canRetry = !noRetry && ok === false && (retries.current[baseId] ?? 0) < 2;
  const next = () => {
    let nq = queue;
    if (canRetry) {
      retries.current[baseId] = (retries.current[baseId] ?? 0) + 1;
      const pos = Math.min(queue.length, i + 3);
      const copy = { ...q, id: baseId + '-r' + retries.current[baseId] };
      retries.current[copy.id] = 1; // pas « première fois » pour les XP
      nq = [...queue.slice(0, pos), copy, ...queue.slice(pos)];
      setQueue(nq);
    }
    if (i + 1 >= nq.length) { onDone({ ok: stats.ok, total: stats.total, xp: stats.xp, wrong: stats.wrong }); return; }
    setI(i + 1); setPicked(null); setOk(null);
  };
  const good = q.choices.find((c) => c.ok);
  const sayText = q.say ?? (done ? q.sayAfter : undefined);
  const twoCols = q.choices.every((c) => (c.thai && !c.text && (c.thai.length <= 6)) || c.tone || (c.rom && !c.text && c.rom.length <= 8) || (c.text && c.text.length <= 12 && !c.thai));

  return (
    <>
      <div className="sess" style={{ marginBottom: 6 }}><span className="tag jade">{L(step.label)}</span><span className="sp" /><span className="n">{i + 1} / {queue.length}</span>{timed && <span className="timer">{elapsed.toFixed(1).replace('.', ',')} s</span>}</div>
      <p className="qprompt">{L(q.prompt)}</p>
      {q.meaningHint && !done && <div className="note info sm" style={{ marginTop: -4 }}>{L(q.meaningHint)}</div>}
      <Stage q={q} done={done} />
      {sayText ? <div className="audio"><AudioPair text={sayText} /></div> : <div className="gap" />}
      {q.kind === 'spell' ? <SpellInput q={q} done={done} onAnswer={(isOk) => grade(isOk, null)} /> : (
        <div className={`choices ${twoCols ? 'c2' : ''} ${done ? 'lock' : ''}`}>
          {q.choices.map((c, k) => (
            <button key={k} className={`choice ${c.thai && !c.text && c.thai.length <= 2 ? 'lg' : ''} ${done ? (c.ok ? 'ok' : k === picked ? 'ko' : 'dim') : ''}`} onClick={() => grade(!!c.ok, k)} disabled={done}>
              <span className="k" aria-hidden="true">{k + 1}</span>
              <ChoiceLabel c={c} lg={!!c.thai && c.thai.length <= 2 && !c.text} />
            </button>
          ))}
        </div>
      )}
      <div className="sp" />
      {done && (
        <StepFooter tone={ok ? 'ok' : 'ko'}>
          <div className="qfin">
            <span className={`verdict ${ok ? 'ok' : 'ko'}`}>{ok ? '✓ ' + t.common.correct : '✗ ' + t.common.wrong}</span>
            {!ok && good && q.kind !== 'spell' && <span className="good"> · {t.common.goodAnswer} : {good.thai && <Thai text={good.thai} />} {good.rom && <span className="rom">{good.rom}</span>} {good.text} {good.tone && <b>{good.text}</b>}</span>}
            {!ok && q.kind === 'spell' && q.reveal?.thai && <span className="good"> · <Thai text={q.reveal.thai} /></span>}
            {q.reveal && !q.stage.ear && (q.reveal.thai || q.reveal.rom || q.reveal.text) && <div style={{ marginTop: 4 }}>{q.reveal.thai && !q.stage.thai?.includes(q.reveal.thai) && <><Thai text={q.reveal.thai} /> </>}{q.reveal.rom && <><Rom text={q.reveal.rom} /> </>}{q.reveal.text && <span className="mut">· <Fr text={q.reveal.text} /></span>}</div>}
            {q.reveal?.explain && <ol>{q.reveal.explain.map((e, k) => <li key={k}>{L(e)}</li>)}</ol>}
            {q.itemId && ITEMS[q.itemId]?.kind === 'cons' && q.kind === 'listen' && <div className="xs mut" style={{ marginTop: 4 }}>Astuce : le nom de la lettre commence par son propre son.</div>}
          </div>
          <ContinueButton onClick={next} label={t.common.continue} auto={!!ok && !timed} autoMs={q.sayAfter ? 1700 : 1200} autoFocus />
        </StepFooter>
      )}
    </>
  );
}
