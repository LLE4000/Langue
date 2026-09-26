/**
 * Défi à distance, sans serveur : le défi (questions + score de l'auteur) tient dans un lien.
 *   1. Je joue une série, j'envoie le lien (WhatsApp, SMS…).
 *   2. L'autre ouvre le lien dans son application, joue exactement la même série, voit la comparaison,
 *      et me renvoie un lien-résultat d'un geste.
 *   3. En ouvrant ce lien, je vois le résultat des deux côtés, gardé dans « Mes défis ».
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FullScreen, usePage } from '@/app/Shell';
import { useStore, type ChallengeRecord } from '@/app/store';
import { Empty, Icon, Ico, Segmented, useToast } from '@/components/ui';
import { SourcePicker } from './PlaySetup';
import { QuizRunner } from './QuizRunner';
import { buildPlayQuestions, challengeUrl, decodeChallenge, defaultSource, encodeChallenge, fmtSecs, poolFor, shareText, type PlayQuestion, type PlayResult, type PlaySource } from './quiz';

/** Vainqueur d'un défi : le score, puis le temps ; null si tout est égal. */
export function winnerOf(a: PlayResult, b: PlayResult): PlayResult | null {
  if (a.score !== b.score) return a.score > b.score ? a : b;
  if (a.secs !== b.secs) return a.secs < b.secs ? a : b;
  return null;
}

function Compare({ a, b }: { a: PlayResult; b: PlayResult | null }) {
  const win = b ? winnerOf(a, b) : null;
  return (
    <div className="versus">
      <div className={`side ${win === a ? 'win' : ''}`}><span className="name">{a.name}</span><span className="big">{a.score}<small>/{a.total}</small></span><span className="mut xs">{fmtSecs(a.secs)}</span></div>
      <span className="vs">vs</span>
      <div className={`side ${b && win === b ? 'win' : ''}`}>{b ? <><span className="name">{b.name}</span><span className="big">{b.score}<small>/{b.total}</small></span><span className="mut xs">{fmtSecs(b.secs)}</span></> : <><span className="name">En attente</span><span className="big mut">?</span></>}</div>
    </div>
  );
}

function ShareButtons({ text, url, label }: { text: string; url: string; label: string }) {
  const toast = useToast((s) => s.show);
  const go = async () => { const r = await shareText(text, url); toast(r === 'shared' ? 'Envoyé.' : r === 'copied' ? 'Lien copié : collez-le dans votre messagerie.' : 'Partage impossible ici.'); };
  return (
    <div className="btns">
      <button className="btn" onClick={go}><Icon name="share" size={18} /> {label}</button>
      <button className="btn ghost" onClick={async () => { try { await navigator.clipboard.writeText(url); toast('Lien copié.'); } catch { toast('Copie impossible.'); } }}>Copier le lien</button>
    </div>
  );
}

/** Créer un défi : régler, jouer, partager. */
export function ChallengeCreate({ onBack }: { onBack: () => void }) {
  const srs = useStore((s) => s.srs);
  const me = useStore((s) => s.profile?.name ?? 'Moi');
  const save = useStore((s) => s.saveChallenge);
  const [source, setSource] = useState<PlaySource>(() => defaultSource(srs));
  const [count, setCount] = useState(10);
  const [qs, setQs] = useState<PlayQuestion[] | null>(null);
  const [mine, setMine] = useState<PlayResult | null>(null);
  const pool = poolFor(source, srs);
  if (!qs) {
    return (
      <FullScreen title="Lancer un défi" onBack={onBack}>
        <p className="lead">Vous jouez d’abord la série, puis vous envoyez le lien. La personne joue exactement les mêmes questions et vous renvoie son résultat.</p>
        <label className="f">Nombre de questions</label>
        <Segmented value={count} options={[10, 15, 20].map((n) => ({ v: n, label: String(n) }))} onChange={setCount} />
        <SourcePicker value={source} onChange={setSource} />
        <button className="btn mt-5" disabled={pool.length < 4} onClick={() => setQs(buildPlayQuestions(pool, count))}>Je joue ma série</button>
      </FullScreen>
    );
  }
  if (!mine) {
    return <FullScreen title="Votre série" onBack={() => setQs(null)} fit><QuizRunner questions={qs} label="Défi" onDone={(r) => { const res = { name: me, ...r }; setMine(res); const code = encodeChallenge(qs, res, null); save({ id: decodeIdOf(code), code, dir: 'sent', from: me, createdAt: Date.now(), mine: r }); }} /></FullScreen>;
  }
  const code = encodeChallenge(qs, mine, null);
  const url = challengeUrl(code);
  const text = `${me} vous défie en thaï sur Langue : ${mine.score}/${mine.total} en ${fmtSecs(mine.secs)}. À vous !`;
  return (
    <FullScreen title="Défi prêt" onBack={onBack}>
      <div className="recap ok"><div className="result-ic"><Icon name="target" /></div><div className="score">{mine.score}<small> / {mine.total}</small></div><div className="mut sm">en {fmtSecs(mine.secs)}</div></div>
      <p className="lead mt-4">Envoyez ce lien. Quand la personne aura joué, elle vous renverra un lien-résultat : ouvrez-le dans Langue pour voir la comparaison.</p>
      <ShareButtons text={text} url={url} label="Envoyer le défi" />
      <details className="note plain sm"><summary>Code du défi (si le lien ne passe pas)</summary><code className="xs break-all">{code}</code></details>
      <Link className="btn soft mt-3" to="/play/defi">Retour à mes défis</Link>
    </FullScreen>
  );
}

const decodeIdOf = (code: string) => { const d = decodeChallenge(code); return 'error' in d ? code.slice(0, 40) : d.id; };

/** Ouvrir un lien de défi : soit un défi à jouer, soit un résultat qui revient. */
export function ChallengePlay() {
  const { code = '' } = useParams();
  const nav = useNavigate();
  const me = useStore((s) => s.profile?.name ?? 'Moi');
  const records = useStore((s) => s.challenges);
  const save = useStore((s) => s.saveChallenge);
  const decoded = useMemo(() => decodeChallenge(decodeURIComponent(code)), [code]);
  const [mine, setMine] = useState<PlayResult | null>(null);
  const [playing, setPlaying] = useState(false);
  const ch = 'error' in decoded ? null : decoded;
  const existing = ch ? records.find((r) => r.id === ch.id) : null;

  // Un lien-résultat qui revient vers l'auteur : on enregistre la réponse de l'autre.
  useEffect(() => {
    if (!ch || !ch.to || !ch.from) return;
    const rec: ChallengeRecord = existing ? { ...existing, code: decodeURIComponent(code), theirs: existing.dir === 'sent' ? ch.to : existing.theirs } : { id: ch.id, code: decodeURIComponent(code), dir: 'received', from: ch.from.name, createdAt: Date.now(), theirs: ch.from, mine: ch.to };
    if (!existing || existing.dir === 'sent') save(rec);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch?.id]);

  if (!ch) return <FullScreen title="Défi" onBack={() => nav('/play/defi')}><div className="note warn">{(decoded as { error: string }).error}</div><Link className="btn" to="/play/defi">Mes défis</Link></FullScreen>;

  if (ch.to && ch.from) {
    const iAmAuthor = existing?.dir === 'sent' || ch.from.name === me;
    const a = iAmAuthor ? ch.from : ch.to, b = iAmAuthor ? ch.to : ch.from;
    return (
      <FullScreen title="Résultat du défi" onBack={() => nav('/play/defi')}>
        <Compare a={a} b={b} />
        <p className="lead ctr mt-3">{(() => { const w = winnerOf(a, b); return w ? `${w.name} l’emporte${a.score === b.score ? ' au temps' : ''}.` : 'Égalité parfaite !'; })()} Revanche ?</p>
        <div className="stack"><Link className="btn" to="/play/defi/new">Lancer un nouveau défi</Link><Link className="btn ghost" to="/play/defi">Mes défis</Link></div>
      </FullScreen>
    );
  }

  const from = ch.from;
  const alreadyMine = existing?.dir === 'sent' ? existing.mine : existing?.mine;
  if (!playing && !mine) {
    return (
      <FullScreen title="Défi reçu" onBack={() => nav('/play/defi')}>
        <div className="recap"><div className="result-ic"><Icon name="swords" /></div><div className="title-xl">{from ? `${from.name} vous défie` : 'Un défi'}</div><div className="mut sm">{ch.questions.length} questions{from ? ` · son score : ${from.score}/${from.total} en ${fmtSecs(from.secs)}` : ''}</div></div>
        {existing?.dir === 'sent' && <div className="note info sm">C’est votre propre défi. Renvoyez plutôt le lien à quelqu’un d’autre.</div>}
        {alreadyMine && existing?.dir === 'received' && <div className="note info sm">Vous l’avez déjà joué : {alreadyMine.score}/{alreadyMine.total}. Vous pouvez rejouer pour vous entraîner ; c’est ce premier résultat qui sera renvoyé.</div>}
        <button className="btn mt-4" onClick={() => setPlaying(true)}>Relever le défi</button>
      </FullScreen>
    );
  }
  if (playing && !mine) {
    return <FullScreen title="Défi en cours" onBack={() => setPlaying(false)} fit><QuizRunner questions={ch.questions} label={from ? `Défi de ${from.name}` : 'Défi'} onDone={(r) => {
      const res = { name: me, ...r };
      setMine(res); setPlaying(false);
      if (!(existing?.dir === 'received' && existing.mine)) save({ id: ch.id, code: encodeChallenge(ch.questions, from, res), dir: 'received', from: from?.name ?? '?', createdAt: existing?.createdAt ?? Date.now(), mine: r, theirs: from ?? undefined });
    }} /></FullScreen>;
  }
  // Le résultat renvoyé est toujours le premier (celui enregistré) ; une partie rejouée sert d'entraînement.
  const official: PlayResult = existing?.dir === 'received' && existing.mine ? { name: me, ...existing.mine } : mine!;
  const back = encodeChallenge(ch.questions, from, official);
  const url = challengeUrl(back);
  const text = from ? `${me} a relevé le défi de ${from.name} : ${official.score}/${official.total} en ${fmtSecs(official.secs)} (contre ${from.score}/${from.total}).` : `${me} : ${official.score}/${official.total}.`;
  return (
    <FullScreen title="Votre résultat" onBack={() => nav('/play/defi')}>
      <Compare a={mine!} b={from} />
      {from && <p className="lead ctr mt-3">Renvoyez votre résultat à {from.name} : en ouvrant le lien, {from.name} verra la comparaison.</p>}
      <ShareButtons text={text} url={url} label={from ? `Renvoyer à ${from.name}` : 'Partager'} />
      <div className="stack mt-3"><Link className="btn soft" to="/play/defi/new">Lancer mon propre défi</Link><Link className="btn ghost" to="/play/defi">Mes défis</Link></div>
    </FullScreen>
  );
}

/** Mes défis : lancer, saisir un code, historique. */
export function ChallengeHub() {
  usePage('Défi à distance', { back: '/play' });
  const nav = useNavigate();
  const records = useStore((s) => s.challenges);
  const remove = useStore((s) => s.removeChallenge);
  const [code, setCode] = useState('');
  const open = () => { const c = code.trim().replace(/^.*#\/play\/defi\//, ''); if (c) nav(`/play/defi/${encodeURIComponent(c)}`); };
  return (
    <>
      <p className="lead">Sans compte ni serveur : le défi voyage dans un lien. Vous jouez, vous envoyez ; l’autre joue la même série et vous renvoie son résultat.</p>
      <Link className="btn" to="/play/defi/new"><Icon name="bolt" size={18} /> Lancer un défi</Link>
      <label className="f">J’ai reçu un lien ou un code</label>
      <div className="row-flex"><input className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Collez le lien ou le code ici" aria-label="Code du défi" /><button className="btn auto sm" onClick={open} disabled={!code.trim()}>Ouvrir</button></div>
      <div className="h2">Mes défis <span className="sp" /><span className="sm mut">{records.length}</span></div>
      {records.length === 0 ? <Empty icon="swords">Aucun défi pour l’instant.</Empty> : (
        <div className="list">
          {records.map((r) => {
            const status = r.dir === 'sent' ? (r.theirs ? `${r.theirs.name} : ${r.theirs.score}/${r.theirs.total} · vous : ${r.mine?.score ?? '?'}/${r.mine?.total ?? '?'}` : `Envoyé · vous : ${r.mine?.score ?? '?'}/${r.mine?.total ?? '?'} · en attente de réponse`) : `De ${r.from} : ${r.theirs?.score ?? '?'}/${r.theirs?.total ?? '?'} · vous : ${r.mine?.score ?? '?'}/${r.mine?.total ?? '?'}`;
            const w = r.mine && r.theirs ? winnerOf({ name: 'me', ...r.mine }, { ...r.theirs }) : null;
            // égalité, gagné, perdu ; sinon envoyé (en attente) ou reçu
            const mark = r.mine && r.theirs ? (w === null ? 'equal' : w.name === 'me' ? 'trophy' : 'target') : r.dir === 'sent' ? 'upload' : 'download';
            return (
              <div className="row" key={r.id}>
                <Ico name={mark} tone={mark === 'trophy' ? 'ok' : ''} />
                <span className="mid"><span className="t">{r.dir === 'sent' ? 'Mon défi' : `Défi de ${r.from}`}</span><span className="s">{status}</span></span>
                <span className="end">
                  <button className="ib sm" aria-label="Ouvrir" onClick={() => nav(`/play/defi/${encodeURIComponent(r.code)}`)}><Icon name="next" size={16} /></button>
                  <button className="ib sm" aria-label="Supprimer" onClick={() => { if (window.confirm('Supprimer ce défi de la liste ?')) remove(r.id); }}><Icon name="trash" size={16} /></button>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

export function ChallengeNew() {
  const nav = useNavigate();
  return <ChallengeCreate onBack={() => nav('/play/defi')} />;
}
