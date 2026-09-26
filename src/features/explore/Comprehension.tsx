/**
 * Compréhension orale : on écoute une conversation (deux voix, homme et femme), sans le texte,
 * puis on répond en français à des questions sur ce qui a été dit. Le texte n'apparaît qu'à la fin.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { DIALOG_BY_ID, th } from '@/content/th';
import { dialogOtherGender } from '@/engine/speakers';
import { L } from '@/i18n';
import { Icon, Empty } from '@/components/ui';
import { DialogView } from '@/components/DialogView';
import { StepFooter, ContinueButton, useDigitKeys } from '@/components/StepFooter';
import { buildComprehensionQuiz, dialogSeconds, type CQuestion } from './comprehension';

const KIND = 'comprehension';

/** Liste des conversations à écouter, avec le meilleur score. */
export function ComprehensionHub() {
  usePage('Compréhension orale', { back: '/review' });
  const hist = useStore((s) => s.history);
  const nav = useNavigate();
  const best = useMemo(() => { const m: Record<string, string> = {}; for (const h of hist) if (h.kind === KIND && h.score != null && h.total) { const v = `${h.score}/${h.total}`; if (!m[h.label] || h.score / h.total > +m[h.label].split('/')[0] / +m[h.label].split('/')[1]) m[h.label] = v; } return m; }, [hist]);
  const random = () => { const pool = th.DIALOGS.filter((d) => !best[d.id]); const d = (pool.length ? pool : th.DIALOGS)[Math.floor(Math.random() * (pool.length ? pool : th.DIALOGS).length)]; nav(`/explore/comprehension/${encodeURIComponent(d.id)}`); };
  return (
    <>
      <p className="lead">Une conversation, deux voix, pas de texte. Écoutez autant de fois que vous voulez, puis répondez en français : qui a dit quoi, combien, quand. Le texte s’affiche seulement à la fin.</p>
      <button className="btn" onClick={random}><Icon name="play" size={18} /> Une conversation au hasard</button>
      <div className="h2">Choisir une conversation</div>
      <div className="list">
        {th.DIALOGS.map((d) => (
          <Link key={d.id} className="row" to={`/explore/comprehension/${encodeURIComponent(d.id)}`}>
            <span className="ico">{d.icon}</span>
            <span className="mid"><span className="t">{L(d.title)}</span><span className="s">≈ {dialogSeconds(d)} s · {d.lines.length} répliques · {(d.questions?.length ?? 0) + 2} questions</span></span>
            <span className="end">{best[d.id] ? <span className="tag ok">{best[d.id]}</span> : <span className="chev">›</span>}</span>
          </Link>
        ))}
      </div>
    </>
  );
}

export function ComprehensionRun() {
  const { id = '' } = useParams();
  const d = DIALOG_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const sp = useSpeaker();
  const log = useStore((s) => s.logHistory);
  const recordActivity = useStore((s) => s.recordActivity);
  const addXp = useStore((s) => s.addXp);
  usePage(d ? `Écoute · ${L(d.title)}` : 'Compréhension orale', { back: '/explore/comprehension' });
  const [phase, setPhase] = useState<'listen' | 'quiz' | 'result'>('listen');
  const [line, setLine] = useState<number | null>(null);
  const [plays, setPlays] = useState(0);
  const [seed] = useState(() => Date.now());
  const quiz: CQuestion[] = useMemo(() => (d ? buildComprehensionQuiz(d, seed) : []), [d, seed]);
  const [qi, setQi] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const token = useRef(0);
  const other = d ? dialogOtherGender(d, sp.gender === 'm' ? 'f' : 'm') : 'f';
  const stop = () => { token.current++; setLine(null); sp.cancel(); };
  useEffect(() => () => { token.current++; sp.cancel(); }, [sp]);
  const play = () => {
    if (!d) return;
    if (line !== null) { stop(); return; }
    const tok = ++token.current;
    let i = 0;
    const next = () => {
      if (tok !== token.current) return;
      if (i >= d.lines.length) { setLine(null); setPlays((p) => p + 1); return; }
      setLine(i);
      const l = d.lines[i++];
      const ok = sp.speak(l.thai, { speaker: l.who === 'other' ? other : undefined, onend: () => setTimeout(next, 500) });
      if (!ok) setLine(null);
    };
    next();
  };
  const q = quiz[qi];
  const answer = (k: number) => { if (picked !== null || !q) return; setPicked(k); if (k === q.answer) setScore((s) => s + 1); };
  useDigitKeys(phase === 'quiz' && q && picked === null ? q.choices.length : 0, answer);
  if (!d) return <Empty e="🔍">Conversation introuvable.</Empty>;
  const nextQ = () => {
    if (qi + 1 < quiz.length) { setQi(qi + 1); setPicked(null); return; }
    const total = quiz.length;
    log(KIND, d.id, score, total);
    recordActivity('comp:' + d.id, score, total); // alimente la compétence « compréhension orale »
    addXp(3 + score * 2);
    setPhase('result');
  };

  if (phase === 'listen') {
    return (
      <>
        <div className="stage listen-stage" style={{ minHeight: 220 }}>
          <div style={{ fontSize: 56 }}>{d.icon}</div>
          <div className="serif" style={{ fontSize: 26, marginTop: 6 }}>{L(d.title)}</div>
          <div className="mut sm" style={{ marginTop: 4 }}>Vous et {L(d.other).toLowerCase()} · {d.lines.length} répliques · ≈ {dialogSeconds(d)} s</div>
          <div className="takes" aria-label="Répliques">{d.lines.map((l, k) => <span key={k} className={`take ${line === k ? 'on' : line !== null && k < line ? 'done' : ''}`}>{l.who === 'me' ? '♟' : '●'}</span>)}</div>
        </div>
        <div className="audio"><button className={`ib big pri listen-play ${line !== null ? 'speaking' : ''}`} onClick={play} aria-label={line !== null ? 'Arrêter' : 'Écouter'} data-testid="comp-play"><Icon name={line !== null ? 'pause' : 'play'} /></button></div>
        <p className="xs mut ctr" style={{ margin: '-2px 0 8px' }}>{line !== null ? `Réplique ${line + 1} / ${d.lines.length}` : plays ? `Écouté ${plays} fois. Réécoutez ou passez aux questions.` : 'Sans le texte : essayez de saisir la situation, les nombres, les décisions.'}</p>
        <div className="note plain sm">Deux voix : la vôtre ({sp.gender === 'f' ? 'femme' : 'homme'}) et celle de l’interlocuteur ({other === 'f' ? 'femme' : 'homme'}). Vous pouvez écouter autant de fois que vous voulez.</div>
        <StepFooter meta={<span>{quiz.length} questions en français suivront.</span>}>
          <ContinueButton onClick={() => { stop(); setPhase('quiz'); }} label={plays ? 'Passer aux questions' : 'Passer aux questions sans avoir tout écouté'} className={plays ? 'btn' : 'btn ghost'} />
        </StepFooter>
      </>
    );
  }
  if (phase === 'quiz' && q) {
    const done = picked !== null;
    return (
      <>
        <div className="sess" style={{ marginBottom: 6 }}><span className="tag jade">Compréhension</span><span className="sp" /><span className="n">Question {qi + 1} / {quiz.length}</span></div>
        <p className="qprompt" style={{ fontSize: 22 }}>{q.q}</p>
        <div className="btns" style={{ marginBottom: 12 }}><button className="btn ghost sm" onClick={play}><Icon name={line !== null ? 'pause' : 'speaker'} size={16} /> {line !== null ? 'Arrêter' : 'Réécouter la conversation'}</button></div>
        <div className={`choices ${done ? 'lock' : ''}`}>
          {q.choices.map((c, k) => (
            <button key={k} className={`choice ${done ? (k === q.answer ? 'ok' : k === picked ? 'ko' : 'dim') : ''}`} onClick={() => answer(k)} disabled={done}><span className="k" aria-hidden="true">{k + 1}</span><span>{c}</span></button>
          ))}
        </div>
        <div className="sp" />
        {done && (
          <StepFooter tone={picked === q.answer ? 'ok' : 'ko'}>
            <div className="qfin"><span className={`verdict ${picked === q.answer ? 'ok' : 'ko'}`}>{picked === q.answer ? '✓ Correct' : '✗ Pas tout à fait'}</span>{picked !== q.answer && <span className="good"> · Bonne réponse : {q.choices[q.answer]}</span>}</div>
            <ContinueButton onClick={nextQ} label={qi + 1 < quiz.length ? 'Continuer' : 'Voir le résultat'} auto={picked === q.answer} autoMs={1200} autoFocus />
          </StepFooter>
        )}
      </>
    );
  }
  const pct = quiz.length ? Math.round((score / quiz.length) * 100) : 0;
  return (
    <>
      <div className={`recap ${pct >= 60 ? 'ok' : 'ko'}`}>
        <div style={{ fontSize: 44 }}>{pct >= 90 ? '🌟' : pct >= 60 ? '✅' : '🎧'}</div>
        <div className="score" style={{ fontSize: 52 }}>{score}<small> / {quiz.length}</small></div>
        <div className="b" style={{ fontSize: 18, marginTop: 6 }}>{pct >= 90 ? 'Tout compris' : pct >= 60 ? 'Bien compris' : 'À réécouter'}</div>
        <div className="mut sm">{L(d.title)} · +{3 + score * 2} XP</div>
      </div>
      <div className="h2">Le texte de la conversation</div>
      <p className="sm mut" style={{ margin: '-4px 2px 10px' }}>Relisez avec la phonétique et la traduction, puis réécoutez : les phrases devraient sonner plus clairement.</p>
      <DialogView id={d.id} />
      <div className="stack" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => nav('/explore/comprehension')}>Une autre conversation</button>
        <button className="btn ghost" onClick={() => { setPhase('listen'); setQi(0); setPicked(null); setScore(0); setPlays(0); }}>Réécouter celle-ci</button>
      </div>
    </>
  );
}
