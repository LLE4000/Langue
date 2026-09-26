/** Tour à tour : 2 à 6 joueurs, un appareil qu'on se passe, la même série pour tout le monde. */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useToast } from '@/components/ui';
import { PlaySetup, type PlayConfig } from './PlaySetup';
import { QuizRunner } from './QuizRunner';
import { buildPlayQuestions, fmtSecs, poolFor, type PlayQuestion, type PlayResult } from './quiz';

export function Turns() {
  const nav = useNavigate();
  const srs = useStore((s) => s.srs);
  const logHistory = useStore((s) => s.logHistory);
  const addXp = useStore((s) => s.addXp);
  const [cfg, setCfg] = useState<PlayConfig | null>(null);
  const [qs, setQs] = useState<PlayQuestion[]>([]);
  const [turn, setTurn] = useState(0);
  const [results, setResults] = useState<PlayResult[]>([]);
  const [phase, setPhase] = useState<'setup' | 'handoff' | 'play' | 'end'>('setup');

  const toast = useToast((s) => s.show);
  const start = (c: PlayConfig) => {
    const built = buildPlayQuestions(poolFor(c.source, srs), c.count);
    if (built.length < 4) { toast('Pas assez de mots dans cette source : choisissez un thème ou les nombres.'); return; }
    setCfg(c); setQs(built); setTurn(0); setResults([]); setPhase('handoff');
  };
  useEffect(() => {
    if (phase !== 'end' || !cfg) return;
    const best = [...results].sort((a, b) => b.score - a.score || a.secs - b.secs)[0];
    logHistory('turns', `${results.length} joueurs · meilleur : ${best?.name ?? ''} ${best?.score ?? 0}/${qs.length}`);
    addXp(5 + (best?.score ?? 0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (phase === 'setup') {
    return (
      <FullScreen title="Tour à tour" onBack={() => nav('/play')}>
        <p className="lead">De 2 à 6 joueurs. Tout le monde répond à la même série, chacun son tour, en se passant l’appareil. À la fin : les scores et les temps.</p>
        <PlaySetup minPlayers={2} maxPlayers={6} onStart={start} startLabel="C’est parti" />
      </FullScreen>
    );
  }
  if (!cfg) return null;
  if (phase === 'handoff') {
    const name = cfg.players[turn];
    return (
      <FullScreen title={`Joueur ${turn + 1} / ${cfg.players.length}`} onBack={() => { if (turn === 0 || window.confirm('Abandonner la partie en cours ?')) setPhase('setup'); }}>
        <div className="recap" style={{ marginTop: 24 }}>
          <div style={{ fontSize: 40 }}>📱</div>
          <div className="serif" style={{ fontSize: 30, marginTop: 6 }}>Au tour de {name}</div>
          <p className="mut" style={{ marginTop: 8 }}>{turn === 0 ? `${qs.length} questions, chronométrées. Les autres ne regardent pas !` : 'Passez l’appareil. Même série, même chrono.'}</p>
        </div>
        <button className="btn" style={{ marginTop: 18 }} onClick={() => setPhase('play')}>Je suis {name}, je commence</button>
      </FullScreen>
    );
  }
  if (phase === 'play') {
    return (
      <FullScreen title={`${cfg.players[turn]} joue`} onBack={() => { if (window.confirm('Interrompre cette série ? Elle sera recommencée du début.')) setPhase('handoff'); }} fit>
        <QuizRunner key={turn} questions={qs} label={`Joueur ${turn + 1}`} onDone={(r) => {
          const next = [...results, { name: cfg.players[turn], ...r }];
          setResults(next);
          if (turn + 1 < cfg.players.length) { setTurn(turn + 1); setPhase('handoff'); } else setPhase('end');
        }} />
      </FullScreen>
    );
  }
  const sorted = [...results].sort((a, b) => b.score - a.score || a.secs - b.secs);
  const top = sorted[0];
  return (
    <FullScreen title="Résultats" onBack={() => nav('/play')}>
      <div className="recap ok">
        <div style={{ fontSize: 40 }}>🏆</div>
        <div className="serif" style={{ fontSize: 30 }}>{top.name}</div>
        <div className="mut sm">{top.score} / {top.total} en {fmtSecs(top.secs)}</div>
      </div>
      <div className="list" style={{ marginTop: 12 }}>
        {sorted.map((r, k) => (
          <div className="row" key={k}>
            <span className="ico" style={k === 0 ? { background: 'var(--acc-soft)' } : undefined}>{k + 1}</span>
            <span className="mid"><span className="t">{r.name}</span><span className="s">{r.score} / {r.total} bonnes réponses · {fmtSecs(r.secs)}</span></span>
            <span className="end"><b>{r.score}</b></span>
          </div>
        ))}
      </div>
      <p className="xs mut" style={{ margin: '8px 2px 0' }}>Égalité de score : le plus rapide passe devant. Chacun progresse à son rythme, l’important est de rejouer.</p>
      <div className="stack" style={{ marginTop: 14 }}>
        <button className="btn" onClick={() => start(cfg)}>Rejouer, nouvelle série</button>
        <button className="btn ghost" onClick={() => setPhase('setup')}>Changer les joueurs ou les mots</button>
        <button className="btn soft" onClick={() => nav('/play')}>Terminer</button>
      </div>
    </FullScreen>
  );
}
