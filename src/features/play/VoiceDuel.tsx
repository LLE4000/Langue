/**
 * Duel de prononciation : 2 à 6 personnes, un appareil qu'on se passe, les mêmes mots pour tout le monde.
 * Chacun dit le mot à son tour ; le moteur de reconnaissance thaï note sur 10 (même barème que « Je le dis »).
 * À la fin : le total par joueur et le détail mot par mot. Pas de chrono : ici, c'est la clarté qui gagne.
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore } from '@/app/store';
import { recognizer, useSpeaker } from '@/app/services/speech';
import { ITEMS, type LearnItem } from '@/content/th';
import { RECOGNITION_ERRORS } from '@/engine/audio/mic';
import { scorePronunciation, type PronResult } from '@/engine/audio/pronunciation';
import { resolveTokens } from '@/engine/tokens';
import { AudioPair, Empty, Icon, Rom, Segmented, Thai, useTokens, useToast } from '@/components/ui';
import { SourcePicker, usePlayerDefaults } from './PlaySetup';
import { defaultSource, poolFor, type PlaySource } from './quiz';

interface Cfg { players: string[]; count: number; source: PlaySource }
type Scores = number[][]; // [mot][joueur]

const shuffle = <T,>(a: T[]) => { const o = [...a]; for (let i = o.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
const sayable = (it: LearnItem) => (it.kind === 'word' || it.kind === 'clf' || it.kind === 'tone' || it.kind === 'num') && it.targets.length > 0;

function Setup({ onStart }: { onStart: (c: Cfg) => void }) {
  const srs = useStore((s) => s.srs);
  const defaults = usePlayerDefaults(2);
  const [players, setPlayers] = useState<string[]>(defaults);
  const [count, setCount] = useState(5);
  const [source, setSource] = useState<PlaySource>(() => defaultSource(srs));
  const pool = poolFor(source, srs).filter(sayable);
  const ok = pool.length >= 3 && players.every((p) => p.trim());
  return (
    <>
      <label className="f">Joueurs (2 à 6)</label>
      <div className="stack">
        {players.map((p, i) => (
          <div key={i} className="row-flex">
            <span className="tag pnum">{i + 1}</span>
            <input className="field" value={p} onChange={(e) => setPlayers(players.map((x, k) => (k === i ? e.target.value : x)))} placeholder={`Joueur ${i + 1}`} aria-label={`Nom du joueur ${i + 1}`} />
            {players.length > 2 && <button className="ib sm" aria-label="Retirer" onClick={() => setPlayers(players.filter((_, k) => k !== i))}><Icon name="close" size={16} /></button>}
          </div>
        ))}
        {players.length < 6 && <button className="btn ghost sm" onClick={() => setPlayers([...players, `Joueur ${players.length + 1}`])}>+ Ajouter un joueur</button>}
      </div>
      <label className="f">Nombre de mots</label>
      <Segmented value={count} options={[3, 5, 8].map((n) => ({ v: n, label: String(n) }))} onChange={setCount} />
      <SourcePicker value={source} onChange={setSource} />
      <button className="btn mt-5" disabled={!ok} onClick={() => onStart({ players: players.map((p) => p.trim()), count: Math.min(count, pool.length), source })}>À vos micros</button>
    </>
  );
}

/** Un joueur dit le mot : bouton micro, résultat, puis passage au suivant. */
function Turn({ item, player, onScored }: { item: LearnItem; player: string; onScored: (score: number) => void }) {
  const sp = useSpeaker();
  const tok = useTokens();
  const strictness = useStore((s) => s.settings.pronStrictness ?? 'normal');
  const [listening, setListening] = useState(false);
  const [res, setRes] = useState<PronResult | null>(null);
  const [msg, setMsg] = useState('');
  const targets = useMemo(() => item.targets.map((t) => resolveTokens(t, tok)), [item.targets, tok]);
  useEffect(() => () => recognizer.stop(), []);
  useEffect(() => { setRes(null); setMsg(''); setListening(false); }, [item.id, player]);
  const listen = () => {
    if (listening) { recognizer.stop(); return; }
    setRes(null); setMsg(''); setListening(true); sp.cancel();
    let got = false;
    try {
      recognizer.start((ev) => {
        if (ev.type === 'result') { got = true; setRes(scorePronunciation(ev.alts, targets, [{ t: resolveTokens(item.thai, tok), r: resolveTokens(item.rom, tok) }], strictness, ev.confidence)); }
        else if (ev.type === 'error') { got = true; if (ev.code !== 'aborted') setMsg(RECOGNITION_ERRORS[ev.code] ?? `Reconnaissance interrompue (${ev.code}).`); }
        else { setListening(false); if (!got) setMsg('Rien entendu : touchez le micro et dites le mot.'); }
      });
    } catch { setListening(false); setMsg('La reconnaissance vocale n’a pas pu démarrer.'); }
  };
  return (
    <>
      <div className="stage compact"><div className="big s3"><Thai text={item.thai} /></div><Rom text={item.rom} /><span className="mut sm">{resolveTokens(item.meaning.fr, tok)}</span></div>
      <div className="audio"><AudioPair text={item.say} big /></div>
      {!res ? (
        <>
          <button className={`btn ${listening ? 'listening' : ''}`} onClick={listen} data-testid="voice-say"><Icon name="mic" size={20} /> {listening ? `${player}, parlez maintenant…` : `${player}, je le dis`}</button>
          <p className="xs mut ctr mt-2">{listening ? 'Touchez à nouveau pour arrêter.' : 'Écoutez le modèle si besoin, puis touchez le micro et dites le mot.'}</p>
          {msg && <div className="note warn sm">{msg} <button className="btn ghost sm mt-2" onClick={listen}>Réessayer</button></div>}
        </>
      ) : (
        <>
          <div className="pron">
            <div className="cring" data-tone={res.verdict} style={{ ['--p' as string]: res.score * 10 }}><b>{res.score}</b><small>/ 10</small></div>
            <div className="grow">
              <div className="b">{player} · {res.verdict === 'ok' ? 'Compris du premier coup' : res.verdict === 'near' ? 'Presque compris' : 'Pas compris'}</div>
              {res.heard && <div className="sm mut mt-1">Entendu : <Thai text={res.heard} className="ink" /></div>}
              {res.hints[0] && <div className="xs mut mt-1">{res.hints[0]}</div>}
            </div>
          </div>
          <button className="btn mt-3" onClick={() => onScored(res.score)} data-testid="voice-next">Continuer</button>
        </>
      )}
    </>
  );
}

export function VoiceDuel() {
  const nav = useNavigate();
  const srs = useStore((s) => s.srs);
  const logHistory = useStore((s) => s.logHistory);
  const addXp = useStore((s) => s.addXp);
  const [cfg, setCfg] = useState<Cfg | null>(null);
  const [items, setItems] = useState<LearnItem[]>([]);
  const [w, setW] = useState(0);
  const [p, setP] = useState(0);
  const [scores, setScores] = useState<Scores>([]);
  const [phase, setPhase] = useState<'setup' | 'handoff' | 'say' | 'end'>('setup');

  const toast = useToast((s) => s.show);
  const start = (c: Cfg) => {
    const pool = shuffle(poolFor(c.source, srs).filter(sayable)).slice(0, c.count);
    if (pool.length < 3) { toast('Pas assez de mots dans cette source : choisissez un thème.'); return; }
    setCfg(c); setItems(pool); setW(0); setP(0); setScores(pool.map(() => c.players.map(() => 0))); setPhase('handoff');
  };
  const totals = useMemo(() => (cfg ? cfg.players.map((_, k) => scores.reduce((a, row) => a + (row[k] ?? 0), 0)) : []), [cfg, scores]);
  useEffect(() => {
    if (phase !== 'end' || !cfg) return;
    const best = Math.max(...totals);
    const winners = cfg.players.filter((_, k) => totals[k] === best);
    logHistory('voice', `${cfg.players.length} joueurs · ${winners.join(' & ')} ${best}/${items.length * 10}`);
    addXp(5 + Math.round(best / items.length));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  if (!recognizer.supported) {
    return (
      <FullScreen title="Duel de prononciation" onBack={() => nav('/play')}>
        <Empty icon="mic">La reconnaissance vocale n’est pas disponible sur ce navigateur. Sur Android ou PC, utilisez Chrome ; sur iPhone, Safari.</Empty>
        <button className="btn soft" onClick={() => nav('/play')}>Retour</button>
      </FullScreen>
    );
  }
  if (phase === 'setup') {
    return (
      <FullScreen title="Duel de prononciation" onBack={() => nav('/play')}>
        <p className="lead">Les mêmes mots pour tout le monde. Chacun son tour, on prend l’appareil et on <b>dit</b> le mot : le moteur thaï note sur 10 ce qu’il a compris. Ici, ce n’est pas le plus rapide qui gagne, c’est le plus clair.</p>
        <Setup onStart={start} />
      </FullScreen>
    );
  }
  if (!cfg) return null;
  const item = items[w];
  const name = cfg.players[p];
  if (phase === 'handoff') {
    return (
      <FullScreen title={`Mot ${w + 1} / ${items.length}`} onBack={() => { if ((w === 0 && p === 0) || window.confirm('Abandonner la partie en cours ?')) setPhase('setup'); }}>
        <div className="recap mt-6">
          <div className="result-ic"><Icon name="mic" /></div>
          <div className="title-xl">À {name}</div>
          <p className="mut mt-2">{w === 0 && p === 0 ? 'Prenez l’appareil, écoutez le modèle, puis dites le mot dans le micro.' : 'Passez l’appareil.'}</p>
        </div>
        {p > 0 && <div className="pchips scores mt-4">{cfg.players.slice(0, p).map((n, k) => <span key={k} className={`pw ${scores[w][k] >= 9 ? 'ok' : scores[w][k] >= 6 ? 'near' : 'ko'}`}><em>{n}</em><b>{scores[w][k]}</b></span>)}</div>}
        <button className="btn mt-5" onClick={() => setPhase('say')} data-testid="voice-go">Je suis {name}, à moi</button>
      </FullScreen>
    );
  }
  if (phase === 'say') {
    return (
      <FullScreen title={`${name} · mot ${w + 1} / ${items.length}`} onBack={() => setPhase('handoff')}>
        <Turn item={item} player={name} onScored={(s) => {
          const next = scores.map((row, k) => (k === w ? row.map((v, j) => (j === p ? s : v)) : row));
          setScores(next);
          if (p + 1 < cfg.players.length) { setP(p + 1); setPhase('handoff'); }
          else if (w + 1 < items.length) { setW(w + 1); setP(0); setPhase('handoff'); }
          else setPhase('end');
        }} />
      </FullScreen>
    );
  }
  const max = items.length * 10;
  const order = cfg.players.map((n, k) => ({ n, k, t: totals[k] })).sort((a, b) => b.t - a.t);
  const best = order[0].t;
  const winners = order.filter((o) => o.t === best);
  return (
    <FullScreen title="Résultats" onBack={() => nav('/play')}>
      <div className="recap ok">
        <div className="result-ic"><Icon name={winners.length > 1 ? 'equal' : 'trophy'} /></div>
        <div className="title-xl">{winners.map((o) => o.n).join(' & ')}</div>
        <div className="mut sm">{best} / {max} · {winners.length > 1 ? 'à égalité' : 'la prononciation la plus claire'}</div>
      </div>
      <div className="list mt-3">
        {order.map((o, r) => (
          <div className="row" key={o.k}>
            <span className={`ico ${r === 0 ? 'acc' : ''}`}>{r + 1}</span>
            <span className="mid"><span className="t">{o.n}</span><span className="s">moyenne {(o.t / items.length).toFixed(1)} / 10</span></span>
            <span className="end"><b>{o.t}</b></span>
          </div>
        ))}
      </div>
      <div className="h2">Mot par mot</div>
      <div className="vgrid" style={{ ['--n' as string]: cfg.players.length }}>
        <span />{cfg.players.map((n, k) => <b key={k} className="xs ctr">{n}</b>)}
        {items.map((it, i) => <FragmentRow key={it.id} it={it} row={scores[i]} />)}
      </div>
      <p className="foot-note">Vert : compris du premier coup · orange : presque · rouge : le moteur a compris autre chose. Réécoutez les mots rouges et rejouez.</p>
      <div className="stack mt-4">
        <button className="btn" onClick={() => start(cfg)}>Rejouer, autres mots</button>
        <button className="btn ghost" onClick={() => setPhase('setup')}>Changer les joueurs ou les mots</button>
        <button className="btn soft" onClick={() => nav('/play')}>Terminer</button>
      </div>
    </FullScreen>
  );
}

function FragmentRow({ it, row }: { it: LearnItem; row: number[] }) {
  const sp = useSpeaker();
  return (
    <>
      <button className="vword" onClick={() => sp.speak(it.say)} aria-label={`Écouter ${it.thai}`}><Thai text={it.thai} /><span className="rom xs">{ITEMS[it.id]?.rom}</span></button>
      {row.map((s, k) => <span key={k} className={`vscore ${s >= 9 ? 'ok' : s >= 6 ? 'near' : 'ko'}`}>{s}</span>)}
    </>
  );
}
