/**
 * Duel sur un écran : deux personnes, un appareil, la même question des deux côtés.
 * Le premier qui touche la bonne réponse marque le point ; une erreur bloque pour la manche.
 * Face à face : la moitié haute est retournée (appareil posé entre les deux joueurs).
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { ITEMS } from '@/content/th';
import { Icon, Thai } from '@/components/ui';
import { PlaySetup, type PlayConfig } from './PlaySetup';
import { buildPlayQuestions, meaningOf, poolFor, type PlayQuestion } from './quiz';

type Resolved = null | 0 | 1 | 'none';

function Half({ who, name, score, q, locked, picked, resolved, onPick }: { who: 0 | 1; name: string; score: number; q: PlayQuestion; locked: boolean; picked: number | null; resolved: Resolved; onPick: (k: number) => void }) {
  const it = ITEMS[q.itemId];
  const done = resolved !== null;
  return (
    <section className={`half p${who} ${done ? (resolved === who ? 'won' : 'lost') : ''}`} aria-label={`Côté de ${name}`}>
      <header><b>{name}</b><span className="score-pill">{score}</span>{done && <span className="verdict-mini">{resolved === who ? '+1' : resolved === 'none' ? '—' : ''}</span>}</header>
      <div className="stem">
        {q.kind === 'meaning' ? <Thai text={it.thai} className="big-h" /> : <span className="frbig">{meaningOf(it)}</span>}
      </div>
      <div className="choices c2 duel-choices">
        {q.choiceIds.map((id, k) => {
          const c = ITEMS[id];
          const isOk = id === q.itemId;
          const cls = done ? (isOk ? 'ok' : picked === k ? 'ko' : 'dim') : picked === k ? 'ko' : '';
          return (
            <button key={id} className={`choice ${cls}`} disabled={done || locked} onPointerDown={(e) => { e.preventDefault(); onPick(k); }} data-side={who} data-ok={isOk ? '1' : '0'}>
              {q.kind === 'meaning' ? <span>{meaningOf(c)}</span> : <><Thai text={c.thai} /><span className="rom" style={{ fontSize: 13 }}>{c.rom}</span></>}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export function Duel() {
  const nav = useNavigate();
  const sp = useSpeaker();
  const srs = useStore((s) => s.srs);
  const logHistory = useStore((s) => s.logHistory);
  const addXp = useStore((s) => s.addXp);
  const [cfg, setCfg] = useState<PlayConfig | null>(null);
  const [qs, setQs] = useState<PlayQuestion[]>([]);
  const [i, setI] = useState(0);
  const [scores, setScores] = useState<[number, number]>([0, 0]);
  const [locked, setLocked] = useState<[boolean, boolean]>([false, false]);
  const [picked, setPicked] = useState<[number | null, number | null]>([null, null]);
  const [resolved, setResolved] = useState<Resolved>(null);
  const [phase, setPhase] = useState<'setup' | 'play' | 'end'>('setup');
  const timer = useRef<number | null>(null);

  const start = (c: PlayConfig) => {
    const built = buildPlayQuestions(poolFor(c.source, srs), c.count);
    if (built.length < 4) return;
    setCfg(c); setQs(built); setI(0); setScores([0, 0]); setLocked([false, false]); setPicked([null, null]); setResolved(null); setPhase('play');
  };
  const q = qs[i];
  useEffect(() => {
    if (phase !== 'play' || !q) return;
    if (q.kind === 'meaning') { const h = setTimeout(() => sp.speak(ITEMS[q.itemId].say), 300); return () => clearTimeout(h); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, i]);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const finishRound = (r: Resolved) => {
    setResolved(r);
    if (q && q.kind === 'toThai') sp.speak(ITEMS[q.itemId].say);
    timer.current = window.setTimeout(() => {
      if (i + 1 >= qs.length) { setPhase('end'); return; }
      setI(i + 1); setLocked([false, false]); setPicked([null, null]); setResolved(null);
    }, 1500);
  };
  const pick = (who: 0 | 1, k: number) => {
    if (!q || resolved !== null || locked[who]) return;
    const ok = q.choiceIds[k] === q.itemId;
    const np: [number | null, number | null] = [...picked] as [number | null, number | null]; np[who] = k; setPicked(np);
    if (ok) { const ns: [number, number] = [...scores] as [number, number]; ns[who]++; setScores(ns); finishRound(who); return; }
    const nl: [boolean, boolean] = [...locked] as [boolean, boolean]; nl[who] = true; setLocked(nl);
    if (nl[0] && nl[1]) finishRound('none');
  };

  useEffect(() => {
    if (phase !== 'end' || !cfg) return;
    logHistory('duel', `${cfg.players[0]} ${scores[0]} – ${scores[1]} ${cfg.players[1]}`);
    addXp(5 + Math.max(scores[0], scores[1]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'setup') {
    return (
      <FullScreen title="Duel sur un écran" onBack={() => nav('/play')}>
        <p className="lead">Deux personnes, un appareil, la même question des deux côtés. Le premier qui touche la bonne réponse marque le point ; une erreur vous bloque pour la manche.</p>
        <PlaySetup minPlayers={2} maxPlayers={2} withLayout onStart={start} startLabel="Lancer le duel" />
      </FullScreen>
    );
  }
  if (phase === 'end' && cfg) {
    const [a, b] = scores;
    const winner = a === b ? null : a > b ? cfg.players[0] : cfg.players[1];
    return (
      <FullScreen title="Résultat du duel" onBack={() => nav('/play')}>
        <div className="recap ok">
          <div style={{ fontSize: 40 }}>{winner ? '🏆' : '🤝'}</div>
          <div className="score">{a}<small> – </small>{b}</div>
          <div className="b" style={{ fontSize: 18, marginTop: 6 }}>{winner ? `${winner} gagne` : 'Égalité parfaite'}</div>
          <div className="mut sm">{cfg.players[0]} · {cfg.players[1]} · {qs.length} questions</div>
        </div>
        <div className="stack" style={{ marginTop: 14 }}>
          <button className="btn" onClick={() => start(cfg)}>Revanche, mêmes réglages</button>
          <button className="btn ghost" onClick={() => setPhase('setup')}>Changer les joueurs ou les mots</button>
          <button className="btn soft" onClick={() => nav('/play')}>Terminer</button>
        </div>
      </FullScreen>
    );
  }
  if (!cfg || !q) return null;
  return (
    <div className={`duel ${cfg.layout}`}>
      <Half who={1} name={cfg.players[1]} score={scores[1]} q={q} locked={locked[1]} picked={picked[1]} resolved={resolved} onPick={(k) => pick(1, k)} />
      <div className="mid">
        <button className="ib sm" aria-label="Quitter le duel" onClick={() => setPhase('setup')}><Icon name="close" size={16} /></button>
        <span>{i + 1} / {qs.length}</span>
        <button className="ib sm" aria-label="Réécouter" onClick={() => sp.speak(ITEMS[q.itemId].say)}><Icon name="speaker" size={16} /></button>
      </div>
      <Half who={0} name={cfg.players[0]} score={scores[0]} q={q} locked={locked[0]} picked={picked[0]} resolved={resolved} onPick={(k) => pick(0, k)} />
    </div>
  );
}
