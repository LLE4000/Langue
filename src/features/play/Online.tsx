/**
 * EN PAUSE (chantier 10) : écran écrit et testé contre le serveur local (scripts/shots-online.mjs), mais non branché
 * (aucune route) tant que le jeu en ligne n'est pas décidé. Pour le réactiver : routes play/online et
 * /play/online/:code dans App.tsx, import de styles/online.css dans main.tsx, OnlineRow dans PlayHub, VITE_SERVER_URL.
 *
 * En ligne, en direct : une salle, un code de 5 lettres, de 2 à 6 joueurs sur leurs propres téléphones.
 * Tout le monde voit la même question au même moment ; le serveur cadence les manches et compte les points
 * (bonne réponse = 10, plus un bonus de vitesse jusqu'à 5). Revanche en un geste.
 *
 * Les mots viennent de l'hôte (ses mots appris, un thème, les nombres), codés comme un défi à distance :
 * les autres appareils décodent la même série, à condition d'avoir la même version du contenu.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FullScreen, usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { createRoom, onlineAvailable, playerId, roomInfo, RoomClient, type LinkStatus } from '@/app/services/online';
import { ITEMS } from '@/content/th';
import { Icon, Ico, Segmented, Thai, useToast, Rom, Fr } from '@/components/ui';
import { SourcePicker } from './PlaySetup';
import { buildPlayQuestions, decodeChallenge, defaultSource, encodeChallenge, meaningOf, poolFor, shareText, sourceLabel, type PlayQuestion, type PlaySource } from './quiz';
import { MAX_PLAYERS, REVEAL_MS, ROUND_MS, normalizeCode, type PublicPlayer, type RoomView } from '../../../server/src/protocol';

const roomUrl = (code: string) => `${location.origin}${location.pathname}#/play/online/${code}`;

function Unavailable() {
  return <div className="note plain">Le jeu en ligne n’est pas activé dans cette version de l’application. Les autres jeux (sur un écran, tour à tour, défi à distance) fonctionnent sans connexion.</div>;
}

/** Créer une salle ou rejoindre celle d'un proche. */
export function OnlineHub() {
  usePage('En ligne', { back: '/play' });
  const nav = useNavigate();
  const toast = useToast((s) => s.show);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'' | 'create' | 'join'>('');
  if (!onlineAvailable) return <Unavailable />;
  const clean = normalizeCode(code);
  const create = async () => {
    setBusy('create');
    try { const r = await createRoom(); nav(`/play/online/${r.code}`); } catch (e) { toast((e as Error).message); } finally { setBusy(''); }
  };
  const join = async () => {
    if (!clean) return;
    setBusy('join');
    try {
      const r = await roomInfo(clean);
      if (r.full) toast(`Cette salle est pleine (${MAX_PLAYERS} joueurs).`);
      else nav(`/play/online/${clean}`);
    } catch (e) {
      toast((e as { status?: number }).status === 404 ? 'Aucune salle avec ce code : vérifiez les lettres, ou elle a expiré.' : (e as Error).message);
    } finally { setBusy(''); }
  };
  return (
    <>
      <p className="lead">Chacun sur son téléphone, où qu’il soit : la même question au même moment, des points pour la bonne réponse et un bonus pour la vitesse. De 2 à {MAX_PLAYERS} joueurs.</p>
      <button className="btn" onClick={create} disabled={!!busy}><Icon name="users" size={18} /> {busy === 'create' ? 'Création…' : 'Créer une salle'}</button>
      <label className="f" htmlFor="room-code">Rejoindre avec un code</label>
      <div className="row-flex">
        <input id="room-code" className="field code-in" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} onKeyDown={(e) => { if (e.key === 'Enter') join(); }} placeholder="ABCDE" maxLength={80} autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-label="Code de la salle" />
        <button className="btn auto sm" onClick={join} disabled={!clean || !!busy}>{busy === 'join' ? '…' : 'Rejoindre'}</button>
      </div>
      <p className="foot-note">Le code (5 lettres) s’affiche chez la personne qui a créé la salle ; un lien partagé ouvre directement la salle.</p>
      <div className="h2">Comment ça marche</div>
      <div className="note plain sm"><b>L’hôte choisit les mots</b> (ses mots appris, un thème ou les nombres) et lance la partie. Chaque question dure 15 secondes ; on passe à la suivante dès que tout le monde a répondu.</div>
      <div className="note plain sm"><b>Sans compte.</b> Seul votre prénom est transmis, le temps de la partie ; la salle s’efface d’elle-même quand elle est vide. Votre progression reste sur votre appareil.</div>
    </>
  );
}

/** Temps restant (ms) avant l'échéance du serveur, rafraîchi 10 fois par seconde. */
function useCountdown(until: number, client: RoomClient | null): number {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!until || !client) { setLeft(0); return; }
    const upd = () => setLeft(Math.max(0, until - client.serverNow()));
    upd();
    const h = setInterval(upd, 100);
    return () => clearInterval(h);
  }, [until, client]);
  return left;
}

function PlayerList({ room, reveal }: { room: RoomView; reveal?: boolean }) {
  const pts = new Map(room.answers.map((a) => [a.id, a]));
  const rank = [...room.players].sort((a, b) => b.score - a.score);
  const list = room.phase === 'lobby' ? room.players : rank;
  return (
    <div className="list on-players">
      {list.map((p: PublicPlayer) => {
        const a = pts.get(p.id);
        return (
          <div key={p.id} className={`row ${p.id === room.you ? 'me' : ''} ${p.connected ? '' : 'off'}`}>
            <span className={`dot ${p.connected ? 'on' : ''}`} aria-hidden="true" />
            <span className="mid"><span className="t">{p.name}{p.id === room.you ? ' (vous)' : ''}</span><span className="s">{p.host ? 'Hôte' : ''}{!p.connected ? `${p.host ? ' · ' : ''}déconnecté` : ''}</span></span>
            <span className="end">
              {room.phase === 'question' && p.answered && <span className="tag ok"><Icon name="check" /> répondu</span>}
              {reveal && a && <span className={`tag ${a.ok ? 'ok' : 'ko'}`}>{a.ok ? `+${a.points}` : '0'}</span>}
              {room.phase !== 'lobby' && <b className="on-score">{p.score}</b>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Choices({ q, picked, room, onPick }: { q: PlayQuestion; picked: number | null; room: RoomView; onPick: (k: number) => void }) {
  const reveal = room.phase === 'reveal';
  return (
    <div className={`choices c2 ${picked !== null || reveal ? 'lock' : ''}`}>
      {q.choiceIds.map((id, k) => {
        const c = ITEMS[id];
        const isOk = id === q.itemId;
        const cls = reveal ? (isOk ? 'ok' : picked === k ? 'ko' : 'dim') : picked === k ? 'sel' : '';
        return (
          <button key={id} className={`choice ${cls}`} disabled={picked !== null || reveal} onClick={() => onPick(k)}>
            {q.kind === 'meaning' ? <span><Fr text={meaningOf(c)} /></span> : <><Thai text={c.thai} /><Rom text={c.rom} /></>}
          </button>
        );
      })}
    </div>
  );
}

export function OnlineRoom() {
  const { code: raw = '' } = useParams();
  const code = normalizeCode(raw);
  const nav = useNavigate();
  const toast = useToast((s) => s.show);
  const sp = useSpeaker();
  const me = useStore((s) => s.profile?.name || 'Joueur');
  const srs = useStore((s) => s.srs);
  const logHistory = useStore((s) => s.logHistory);
  const addXp = useStore((s) => s.addXp);
  const [room, setRoom] = useState<RoomView | null>(null);
  const [status, setStatus] = useState<LinkStatus>('connecting');
  const [fatal, setFatal] = useState('');
  const [client, setClient] = useState<RoomClient | null>(null);
  const [source, setSource] = useState<PlaySource>(() => defaultSource(srs));
  const [count, setCount] = useState(10);
  const [picked, setPicked] = useState<number | null>(null);
  const shownAt = useRef(0);
  const recorded = useRef(0);

  useEffect(() => {
    if (!onlineAvailable || !code) return;
    const c = new RoomClient(code, playerId(code), me, {
      state: setRoom,
      status: setStatus,
      error: (e) => { if (e.code === 'gone' || e.code === 'full') setFatal(e.msg); else toast(e.msg); },
    });
    setClient(c);
    c.connect();
    return () => c.close();
    // le prénom n'est envoyé qu'à l'arrivée : changer de profil en pleine partie ne recrée pas la connexion
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  const decoded = useMemo(() => (room?.quiz ? decodeChallenge(room.quiz) : null), [room?.quiz]);
  const questions = decoded && !('error' in decoded) ? decoded.questions : null;
  const q = room && questions && (room.phase === 'question' || room.phase === 'reveal') ? questions[room.i] : undefined;
  const left = useCountdown(room?.until ?? 0, client);

  // nouvelle manche : on note l'heure d'affichage (temps de réponse mesuré ici) et on fait entendre le mot
  const roundKey = room ? `${room.game}:${room.i}:${room.phase === 'question' ? 'q' : ''}` : '';
  useEffect(() => {
    if (!room || room.phase !== 'question' || !q) return;
    setPicked(null);
    shownAt.current = performance.now();
    if (q.kind === 'meaning') sp.speak(ITEMS[q.itemId].say);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roundKey]);
  useEffect(() => {
    if (room?.phase === 'reveal' && q && q.kind === 'toThai') sp.speak(ITEMS[q.itemId].say);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room?.phase === 'reveal' ? roundKey + 'r' : '']);

  // fin de partie : historique et XP, une fois par partie
  useEffect(() => {
    if (!room || room.phase !== 'end' || !room.game || recorded.current === room.game) return;
    recorded.current = room.game;
    const rank = [...room.players].sort((a, b) => b.score - a.score);
    const mine = rank.findIndex((p) => p.id === room.you);
    logHistory('online', `En ligne · ${rank.map((p) => `${p.name} ${p.score}`).join(' · ')}`, mine >= 0 ? rank.length - mine : undefined, rank.length);
    addXp(5 + Math.round((rank[mine]?.score ?? 0) / 20));
  }, [room, logHistory, addXp]);

  const leave = () => {
    if (room && (room.phase === 'question' || room.phase === 'reveal' || room.phase === 'countdown') && !window.confirm('Quitter la partie en cours ?')) return;
    client?.close();
    nav('/play/online');
  };

  if (!onlineAvailable) return <FullScreen title="En ligne" onBack={() => nav('/play')}><Unavailable /></FullScreen>;
  if (!code) return <FullScreen title="En ligne" onBack={() => nav('/play/online')}><div className="note warn">Ce code de salle n’est pas valable.</div></FullScreen>;
  if (fatal) return <FullScreen title={`Salle ${code}`} onBack={() => nav('/play/online')}><div className="note warn">{fatal}</div><button className="btn" onClick={() => nav('/play/online')}>Créer ou rejoindre une autre salle</button></FullScreen>;

  const banner = status === 'reconnecting' ? <div className="note warn sm on-link">Connexion perdue, reconnexion…</div> : null;
  if (!room) return <FullScreen title={`Salle ${code}`} onBack={leave}>{banner}<div className="on-wait"><span className="spin" aria-hidden="true" /> Connexion à la salle…</div></FullScreen>;

  const meP = room.players.find((p) => p.id === room.you);
  const host = !!meP?.host;
  const live = room.players.filter((p) => p.connected).length;
  const versionIssue = decoded && 'error' in decoded ? decoded.error : '';

  if (room.phase === 'lobby' || (room.phase === 'end' && !room.game)) {
    const pool = poolFor(source, srs);
    const start = () => {
      const qs = buildPlayQuestions(pool, count);
      if (qs.length < 4) { toast('Pas assez de mots dans cette source : choisissez un thème ou les nombres.'); return; }
      client?.send({ t: 'configure', code: encodeChallenge(qs, null, null), label: sourceLabel(source, srs).replace(/\s*\(\d+\)$/, '') });
      client?.send({ t: 'start' });
    };
    return (
      <FullScreen title="Salle d’attente" onBack={leave}>
        {banner}
        <div className="on-code">
          <span className="k">Code de la salle</span>
          <b aria-label={`Code ${[...code].join(' ')}`}>{code}</b>
          <button className="btn soft sm auto" onClick={async () => { const r = await shareText(`${me} vous invite à jouer en thaï sur Langue. Code : ${code}`, roomUrl(code)); toast(r === 'shared' ? 'Invitation envoyée.' : r === 'copied' ? 'Lien copié : collez-le dans votre messagerie.' : 'Partage impossible ici.'); }}><Icon name="share" size={16} /> Inviter</button>
        </div>
        <div className="h2">Joueurs <span className="sp" /><span className="sm mut">{live} / {MAX_PLAYERS}</span></div>
        <PlayerList room={room} />
        {host ? (
          <>
            <label className="f">Nombre de questions</label>
            <Segmented value={count} options={[10, 15, 20].map((n) => ({ v: n, label: String(n) }))} onChange={setCount} />
            <SourcePicker value={source} onChange={setSource} />
            <button className="btn mt-5" disabled={live < 2 || pool.length < 4 || status !== 'open'} onClick={start}>{live < 2 ? 'En attente d’un autre joueur…' : `Lancer la partie · ${live} joueurs`}</button>
          </>
        ) : (
          <div className="note info mt-4">L’hôte choisit les mots et lance la partie. Restez sur cet écran.</div>
        )}
      </FullScreen>
    );
  }

  if (room.phase === 'countdown') {
    return (
      <FullScreen title={room.label || 'En ligne'} onBack={leave}>
        {banner}
        {versionIssue && <div className="note warn">{versionIssue}</div>}
        <div className="on-count" aria-live="assertive"><span>{Math.max(1, Math.ceil(left / 1000))}</span><small>{room.total} questions · {live} joueurs</small></div>
      </FullScreen>
    );
  }

  if (room.phase === 'end') {
    const rank = [...room.players].sort((a, b) => b.score - a.score);
    const top = rank[0];
    const tie = rank.length > 1 && rank[1].score === top.score;
    const mine = rank.findIndex((p) => p.id === room.you) + 1;
    return (
      <FullScreen title="Résultats" onBack={leave}>
        {banner}
        <div className={`recap ${mine === 1 && !tie ? 'ok' : ''}`}>
          <div className="result-ic"><Icon name={tie ? 'equal' : 'trophy'} /></div>
          <div className="verdict-t">{tie ? 'Égalité en tête' : `${top.name} gagne`}</div>
          <div className="mut sm">{mine ? `Vous êtes ${mine === 1 ? '1er' : `${mine}e`} sur ${rank.length}` : ''} · {room.total} questions{room.label ? ` · ${room.label}` : ''}</div>
        </div>
        <PlayerList room={room} />
        <div className="stack mt-4">
          {host ? (
            <>
              <button className="btn" disabled={live < 2 || status !== 'open'} onClick={() => {
                const qs = buildPlayQuestions(poolFor(source, srs), count);
                if (qs.length < 4) { toast('Pas assez de mots dans cette source.'); return; }
                client?.send({ t: 'configure', code: encodeChallenge(qs, null, null), label: room.label });
                client?.send({ t: 'start' });
              }}>{live < 2 ? 'Les autres sont partis' : 'Revanche, nouvelles questions'}</button>
              <button className="btn ghost" onClick={() => client?.send({ t: 'lobby' })}>Changer les mots</button>
            </>
          ) : <div className="note info">L’hôte peut lancer une revanche : restez sur cet écran.</div>}
          <button className="btn soft" onClick={leave}>Quitter la salle</button>
        </div>
      </FullScreen>
    );
  }

  // manche (question ou révélation)
  if (versionIssue || !q) {
    return <FullScreen title={room.label || 'En ligne'} onBack={leave}><div className="note warn">{versionIssue || 'Question introuvable.'}</div><p className="sm mut">Mettez l’application à jour (fermez-la puis rouvrez-la), comme les autres joueurs.</p></FullScreen>;
  }
  const it = ITEMS[q.itemId];
  const myAnswer = room.answers.find((a) => a.id === room.you);
  const answered = room.players.filter((p) => p.connected && p.answered).length;
  const pick = (k: number) => {
    if (picked !== null || room.phase !== 'question') return;
    setPicked(k);
    if (!client?.send({ t: 'answer', i: room.i, k, ms: Math.round(performance.now() - shownAt.current) })) { setPicked(null); toast('Connexion perdue : réessayez dans un instant.'); }
  };
  const reveal = room.phase === 'reveal';
  const pct = Math.min(100, (left / (reveal ? REVEAL_MS : ROUND_MS)) * 100);
  return (
    <FullScreen title={`${room.i + 1} / ${room.total}`} onBack={leave} right={<span className="on-me">{meP?.score ?? 0} pts</span>} fit>
      {banner}
      <div className="on-round">
        <div className={`on-timer ${reveal ? 'rev' : ''}`} role="progressbar" aria-label={reveal ? 'Question suivante dans' : 'Temps restant'} aria-valuenow={Math.ceil(left / 1000)} aria-valuemin={0} aria-valuemax={(reveal ? REVEAL_MS : ROUND_MS) / 1000}><i style={{ width: `${pct}%` }} className={!reveal && left < 4000 ? 'low' : ''} /></div>
        <div className="stage">
          <span className="mut sm">{q.kind === 'meaning' ? 'Que veut dire…' : 'Comment dit-on…'}</span>
          {q.kind === 'meaning' ? (
            <>
              <Thai text={it.thai} className="big" size={46} />
              <Rom text={it.rom} />
              <button className="ib sm" aria-label="Réécouter" onClick={() => sp.speak(it.say)}><Icon name="speaker" size={16} /></button>
            </>
          ) : <span className="frbig"><Fr text={meaningOf(it)} /></span>}
        </div>
        <Choices q={q} picked={picked ?? myAnswer?.k ?? null} room={room} onPick={pick} />
        <div className="on-status" aria-live="polite">
          {room.phase === 'question'
            ? (picked !== null ? `Réponse envoyée · ${answered} / ${live} ont répondu` : `${Math.ceil(left / 1000)} s · ${answered} / ${live} ont répondu`)
            : myAnswer ? (myAnswer.ok ? `Juste ! +${myAnswer.points} points` : 'Raté cette fois.') : 'Pas de réponse à temps.'}
        </div>
        {room.phase === 'reveal' && <PlayerList room={room} reveal />}
      </div>
    </FullScreen>
  );
}

/** Ligne de l'onglet Défis (affichée seulement si le serveur est configuré). */
export function OnlineRow() {
  if (!onlineAvailable) return null;
  return (
    <Link className="row" to="/play/online">
      <Ico name="globe" tone="plum" />
      <span className="mid"><span className="t">En ligne, en direct</span><span className="s">Chacun sur son téléphone, où qu’il soit : un code de salle, la même question au même moment, jusqu’à {MAX_PLAYERS} joueurs.</span></span>
      <span className="end"><span className="chev">›</span></span>
    </Link>
  );
}
