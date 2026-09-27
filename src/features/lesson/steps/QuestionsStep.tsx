/**
 * Suite de questions (écoute, lecture, sens, dictée, tons, syllabes, épellation).
 * Une mauvaise réponse revient plus loin dans la série (maîtrise progressive, au plus deux fois).
 * Après une bonne réponse, la suite arrive seule (réglage « avance automatique ») ; après une erreur,
 * on prend le temps de lire la correction et on touche « Continuer ».
 */
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Question, RuntimeStep } from '../engine';
import { xpFor } from '../engine';
import type { StepResult } from '../LessonRunner';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { L, T } from '@/i18n';
import { AudioPair, Icon, Thai, Rom, Fr, sizeClass, useShowRom, useOral } from '@/components/ui';
import { useGoals, useKnown } from '@/app/hooks';
import { isReadable } from '@/engine/thai/reading';
import { StepFooter, ContinueButton, useDigitKeys } from '@/components/StepFooter';
import { useStepProgress } from '../progress';
import { ToneCurve } from '@/components/ToneCurve';
import { WordByWord } from '@/components/WordByWord';
import { ITEMS } from '@/content/th';
import type { ToneId } from '@/content/types';

/** `oral` : décidé pour toute la question, pour que les quatre choix aient la même mise en page (aucun ne se trahit). */
function ChoiceLabel({ c, lg, oral }: { c: Question['choices'][number]; lg?: boolean; oral: boolean }) {
  // Pas encore lisible : la phonétique porte la réponse, le thaï reste visible en petit (exposition, pas lecture).
  if (oral && c.thai && c.rom && !c.text) return <><Rom text={c.rom} className="main" /><Thai text={c.thai} className="sub" /></>;
  return (
    <>
      {c.tone && <ToneCurve tone={c.tone as ToneId} />}
      {c.thai && <Thai text={c.thai} className={lg ? 'lg' : ''} />}
      {c.rom && <Rom text={c.rom} className={c.thai ? '' : 'solo'} />}
      {c.sub && <span className="csub">{c.sub}</span>}
      {c.text && <span><Fr text={c.text} /></span>}
    </>
  );
}

/** Taille du thaï révélé dans la carte d'écoute : plafonnée pour que la carte garde sa hauteur avant/après la réponse. */
const revealSize = (thai: string) => { const s = sizeClass(thai); return s === 's1' || s === 's2' ? 's3' : s; };

function Stage({ q, done, onPlay }: { q: Question; done: boolean; onPlay: () => void }) {
  const showRom = useShowRom(q.stage.thai, q.stage.showRom);
  const oral = useOral(q.stage.thai);
  // Thaï à révéler après une question d'écoute (à défaut, celui de la bonne réponse : la carte n'est jamais vide)
  const rvThai = q.stage.ear ? q.reveal?.thai ?? q.choices.find((c) => c.ok)?.thai : undefined;
  const oralReveal = useOral(rvThai);
  if (oral && q.stage.thai && q.stage.rom && !q.stage.ear) {
    return (
      <div className={`stage ${q.stage.big ? '' : 'compact'}`}>
        <Rom text={q.stage.rom} className="oral-main" />
        <div className="big s4 oral-sub"><Thai text={q.stage.thai} /></div>
        {q.stage.text && <div className="mut"><Fr text={q.stage.text} /></div>}
      </div>
    );
  }
  if (q.stage.ear && !done) {
    return (
      <div className="stage ear">
        <button type="button" className="ear-ic" onClick={onPlay} aria-label="Écouter"><Icon name="ear" /></button>
        <div className="mut sm">Écoutez, puis choisissez</div>
      </div>
    );
  }
  if (q.stage.ear && rvThai) {
    const rvRom = q.reveal?.rom ?? '';
    const ci = q.itemId ? ITEMS[q.itemId] : null;
    let body: ReactNode;
    if (ci && ci.kind === 'cons' && rvThai.startsWith(ci.thai)) {
      // Lettre : la lettre en grand, puis son nom et sa transcription (jamais plus petits que la transcription seule)
      body = <><div className="big s3"><Thai text={ci.thai} /></div><span className="rv-name"><Thai text={ci.ref.nameWord} /> <Rom text={ci.rom} className="reveal" /></span></>;
    } else if (oralReveal && rvRom) {
      // Pas encore lisible : même hiérarchie que les autres questions orales (phonétique en grand, thaï en petit)
      body = <><Rom text={rvRom} className="oral-main" /><div className="big s4 oral-sub"><Thai text={rvThai} /></div></>;
    } else if (/\s/.test(rvThai)) {
      body = <WordByWord thai={rvThai} rom={rvRom} big chips={false} />;
    } else {
      body = <><div className={`big ${revealSize(rvThai)}`}><Thai text={rvThai} /></div>{rvRom && <Rom text={rvRom} className="reveal" />}</>;
    }
    return <div className="stage ear done">{body}{q.reveal?.text && <span className="mut"><Fr text={q.reveal.text} /></span>}</div>;
  }
  const numeral = !q.stage.thai && !!q.stage.text && /^[\d\s\u00a0]+$/.test(q.stage.text);
  return (
    <div className={`stage ${q.stage.big ? '' : 'compact'}`}>
      {q.stage.thai && <div className={`big ${sizeClass(q.stage.thai)}`}><Thai text={q.stage.thai} /></div>}
      {q.stage.rom && (showRom || q.kind === 'toneEar' || q.stage.showRom) && <Rom text={q.stage.rom} className="plain" />}
      {q.stage.text && <div className={q.stage.thai ? 'mut' : `frbig${numeral ? ' num' : ''}`}><Fr text={q.stage.text} /></div>}
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
      <div className="spellzone" onClick={() => !done && setPicked(picked.slice(0, -1))} role="button" aria-label="Retirer le dernier signe">{typed || <span className="ph">touchez les signes dans l’ordre</span>}</div>
      <div className="tiles-spell">{tiles.map((c, k) => <button key={k} lang="th" className={picked.includes(k) ? 'used' : ''} disabled={done} onClick={() => setPicked([...picked, k])}>{c}</button>)}</div>
      {!done && picked.length > 0 && <div className="btns mt-3"><button className="btn ghost sm" onClick={() => setPicked(picked.slice(0, -1))} aria-label="Retirer le dernier signe">⌫ Dernier signe</button><button className="btn ghost sm" onClick={() => setPicked([])}>Tout effacer</button></div>}
    </>
  );
}

/** `record` : enregistrer les réponses dans la mémoire de révision du profil (faux pour les parties à plusieurs). */
export function QuestionsStep({ step, onDone, timed, noRetry, record = true }: { step: RuntimeStep & { type: 'questions' }; onDone: (r: StepResult) => void; timed?: boolean; noRetry?: boolean; record?: boolean }) {
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
  // Dans une leçon, la barre du haut avance à chaque réponse ; dans un jeu, l'étape garde son compteur
  const inLesson = useStepProgress((i + (done ? 1 : 0)) / Math.max(1, queue.length));
  const goals = useGoals();
  const known = useKnown();
  // Mise en page « orale » pour tous les choix dès qu'un seul n'est pas encore lisible
  const oralQ = !!q && q.choices.some((c) => !!c.thai && !!c.rom && !c.text && (!goals.read || !isReadable(c.thai, known.concepts)));

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
  // Après la réponse, la barre du verdict ne doit masquer ni la bonne réponse ni le choix touché
  useEffect(() => {
    if (!done) return;
    const h = requestAnimationFrame(() => {
      const foot = document.querySelector<HTMLElement>('.qfoot');
      const marks = [...document.querySelectorAll<HTMLElement>('.choices .choice.ok, .choices .choice.ko')];
      if (!foot || !marks.length) return;
      const top = window.innerHeight - (parseFloat(getComputedStyle(foot).bottom) || 0) - foot.offsetHeight;
      const over = Math.max(...marks.map((m) => m.getBoundingClientRect().bottom)) + 12 - top;
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (over > 0) window.scrollBy({ top: over, behavior: reduce ? 'auto' : 'smooth' });
    });
    return () => cancelAnimationFrame(h);
  }, [done, q?.id]);

  const grade = (isOk: boolean, idx: number | null) => {
    if (done || !q) return;
    const secs = (performance.now() - t0.current) / 1000;
    setPicked(idx); setOk(isOk);
    if (record) { if (q.itemId) answer(q.itemId, isOk, secs, q.ruleKey); markSeen(q.itemId ?? q.id); }
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
  const audioText = q.say ?? q.sayAfter; // la rangée audio garde sa place avant la réponse : rien ne saute
  const twoCols = q.choices.every((c) => (c.thai && !c.text && (c.thai.length <= 6)) || c.tone || (c.rom && !c.text && c.rom.length <= 12) || (c.text && c.text.length <= 12 && !c.thai));
  // Ce que la ligne de correction apporte en plus de la bonne réponse (déjà en vert, ou rappelée juste au-dessus)
  const rv = q.stage.ear ? undefined : q.reveal;
  const answerThai = q.kind === 'spell' ? (ok ? undefined : q.reveal?.thai) : good?.thai;
  const rvThai = rv?.thai && !q.stage.thai?.includes(rv.thai) && rv.thai !== answerThai ? rv.thai : undefined;
  const rvRom = rv?.rom && !(rv.rom === good?.rom && (!rv.thai || rv.thai === good?.thai)) ? rv.rom : undefined;
  const rvText = rv?.text && !(!ok && rv.text === good?.text) ? rv.text : undefined;
  const extra = queue.length - step.questions.length; // questions ratées remises plus loin

  return (
    <>
      {!inLesson ? (
        <div className="sess mb-2"><span className="tag jade">{L(step.label)}</span><span className="sp" /><span className="n">Question {i + 1} / {step.questions.length}{extra > 0 ? ` · +${extra} à revoir` : ''}</span>{timed && <span className="timer">{elapsed.toFixed(1).replace('.', ',')} s</span>}</div>
      ) : timed ? <div className="qtimer"><span className="timer">{elapsed.toFixed(1).replace('.', ',')} s</span></div> : null}
      <p className="qprompt">{L(q.prompt)}</p>
      {q.meaningHint && !done && <div className="note info sm mt-n1">{L(q.meaningHint)}</div>}
      <Stage q={q} done={done} onPlay={() => { if (q.say) sp.speak(q.say); }} />
      {audioText ? <div className={`audio ${sayText ? '' : 'pending'}`} aria-hidden={sayText ? undefined : true}><AudioPair text={audioText} /></div> : <div className="gap" />}
      {q.kind === 'spell' ? <SpellInput key={q.id} q={q} done={done} onAnswer={(isOk) => grade(isOk, null)} /> : (
        <div className={`choices ${twoCols ? 'c2' : ''} ${done ? 'lock' : ''}`}>
          {q.choices.map((c, k) => (
            <button key={k} className={`choice ${!oralQ && c.thai && !c.text && c.thai.length <= 2 ? 'lg' : ''} ${done ? (c.ok ? 'ok' : k === picked ? 'ko' : 'dim') : ''}`} onClick={() => grade(!!c.ok, k)} disabled={done}>
              <span className="k" aria-hidden="true">{k + 1}</span>
              <ChoiceLabel c={c} oral={oralQ} lg={!oralQ && !!c.thai && c.thai.length <= 2 && !c.text} />
            </button>
          ))}
        </div>
      )}
      <div className="sp" />
      {done && (
        <StepFooter tone={ok ? 'ok' : 'ko'}>
          <div className="qfin">
            <div className={`verdict ${ok ? 'ok' : 'ko'}`}><Icon name={ok ? 'check' : 'close'} />{ok ? t.common.correct : t.common.wrong}</div>
            {!ok && good && q.kind !== 'spell' && (
              <div className="good">
                <span className="lbl">{t.common.goodAnswer} :</span>
                {good.tone && <ToneCurve tone={good.tone as ToneId} />}
                {good.thai && <Thai text={good.thai} />}
                {good.rom && <Rom text={good.rom} />}
                {good.sub && <span className="mut">{good.sub}</span>}
                {good.text && <span><Fr text={good.text} /></span>}
              </div>
            )}
            {!ok && q.kind === 'spell' && q.reveal?.thai && <div className="good"><span className="lbl">{t.common.goodAnswer} :</span><Thai text={q.reveal.thai} /></div>}
            {(rvThai || rvRom || rvText) && <div className="rv">{rvThai && <Thai text={rvThai} />}{rvRom && <Rom text={rvRom} />}{rvText && <span className="mut">{rvThai || rvRom ? '·\u00a0' : ''}<Fr text={rvText} /></span>}</div>}
            {q.reveal?.explain && <ol>{q.reveal.explain.map((e, k) => <li key={k}>{L(e)}</li>)}</ol>}
            {q.itemId && ITEMS[q.itemId]?.kind === 'cons' && q.kind === 'listen' && <div className="xs mut mt-1">Astuce : le nom de la lettre commence par son propre son.</div>}
          </div>
          <ContinueButton onClick={next} label={t.common.continue} auto={!!ok} autoMs={timed ? 700 : q.sayAfter ? 1700 : 1200} autoFocus />
        </StepFooter>
      )}
    </>
  );
}
