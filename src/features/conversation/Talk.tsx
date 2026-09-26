/**
 * Conversation guidée parlée : on joue son rôle dans un dialogue, au micro. L'interlocuteur parle avec la voix native ;
 * à notre tour, on dit sa réplique — plusieurs formulations sont acceptées (la réplique du dialogue et ses variantes).
 * Trois niveaux d'aide : la réplique affichée (lire), une amorce (les premiers mots), rien que l'intention en français.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FullScreen, usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker, recognizer } from '@/app/services/speech';
import { DIALOG_BY_ID, ITEMS, th } from '@/content/th';
import type { Dialog } from '@/content/types';
import { L } from '@/i18n';
import { dialogOtherGender } from '@/engine/speakers';
import { resolveTokens } from '@/engine/tokens';
import { judgeReply, replyStarter, type Reply, type ReplyJudgement } from '@/engine/conversation';
import { REPLY_VARIANTS } from './variants';
import { Icon, Segmented } from '@/components/ui';

type Aid = 'full' | 'hint' | 'none';
const AID: Record<Aid, { label: string; desc: string }> = {
  full: { label: 'Réplique affichée', desc: 'Vous lisez votre réplique : idéal pour une première fois.' },
  hint: { label: 'Amorce', desc: 'Le sens en français et les premiers mots thaïs : vous finissez la phrase.' },
  none: { label: 'Sans aide', desc: 'Seulement ce que vous voulez dire, en français : à vous de le dire en thaï.' },
};
const AID_KEY = 'langue.talk.aid';
const loadAid = (): Aid => { try { const v = localStorage.getItem(AID_KEY); return v === 'hint' || v === 'none' ? v : 'full'; } catch { return 'full'; } };

/** Réponses acceptées pour une réplique « Vous » : la réplique et ses variantes, jetons résolus pour l'apprenant. */
export function acceptedReplies(d: Dialog, i: number, tok: { gender: 'm' | 'f'; name: string }): Reply[] {
  const l = d.lines[i];
  const base = { thai: l.thai, rom: l.rom, fr: L(l.tr) };
  return [base, ...(REPLY_VARIANTS[d.id]?.[i] ?? [])].map((r) => ({ thai: resolveTokens(r.thai, tok).replace(/…/g, ''), rom: resolveTokens(r.rom, tok), fr: r.fr }));
}

/** Liste des conversations à jouer, longues par niveau puis courtes, avec le meilleur score. */
export function TalkHub() {
  usePage('Conversation parlée', { back: '/review', thai: { th: 'สนทนา', rom: 'sǒn-thá-naa' } });
  const acts = useStore((s) => s.activities);
  const row = (d: Dialog) => {
    const best = acts['talk:' + d.id]?.best;
    const mine = d.lines.filter((l) => l.who === 'me').length;
    return (
      <Link key={d.id} className="row" to={`/talk/${encodeURIComponent(d.id)}`}>
        <span className="ico jade">{d.level ? <Icon name={d.icon} /> : <Icon name="chat" />}</span>
        <span className="mid"><span className="t">{L(d.title)}</span><span className="s">{mine} répliques à dire · avec {L(d.other).toLowerCase()}</span></span>
        <span className="end">{best != null ? <span className={`tag ${best >= 80 ? 'ok' : ''}`}>{best} %</span> : <span className="chev">›</span>}</span>
      </Link>
    );
  };
  return (
    <>
      <p className="lead">Vous jouez votre rôle, au micro. L’interlocuteur répond avec une voix native ; plusieurs formulations sont acceptées pour chaque réplique.</p>
      {!recognizer.supported && <div className="note warn sm">Ce navigateur ne propose pas la reconnaissance vocale : vous pourrez dire vos répliques et les comparer au modèle, sans jugement automatique.</div>}
      {(['A1', 'A2', 'B1'] as const).map((lv) => { const list = th.DIALOGS.filter((d) => d.level === lv); return list.length ? <section key={lv}><div className="h2">Conversations longues · {lv}</div><div className="list">{list.map(row)}</div></section> : null; })}
      <div className="h2">Conversations courtes</div>
      <div className="list">{th.DIALOGS.filter((d) => !d.level).map(row)}</div>
    </>
  );
}

interface Turn { i: number; j?: ReplyJudgement; tries: number }

export function TalkRun() {
  const { id = '' } = useParams();
  const d = DIALOG_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const sp = useSpeaker();
  const profile = useStore((s) => s.profile)!;
  const recordActivity = useStore((s) => s.recordActivity);
  const recordPronunciation = useStore((s) => s.recordPronunciation);
  const log = useStore((s) => s.logHistory);
  const [aid, setAid] = useState<Aid>(loadAid);
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro');
  const [pos, setPos] = useState(0); // réplique en cours
  const [state, setState] = useState<'idle' | 'other' | 'listen' | 'judged'>('idle');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [showTr, setShowTr] = useState(false);
  const token = useRef(0);
  const endRef = useRef<HTMLDivElement>(null);
  const tok = useMemo(() => ({ gender: profile.gender, name: profile.thaiName ?? '' }), [profile.gender, profile.thaiName]);
  const other = d ? dialogOtherGender(d, sp.gender === 'm' ? 'f' : 'm') : 'f';
  useEffect(() => () => { token.current++; sp.cancel(); recognizer.stop(); }, [sp]);
  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' }); }, [pos, state, turns.length]);

  const turnOf = (i: number) => turns.find((t) => t.i === i);
  const setTurn = (t: Turn) => setTurns((ts) => [...ts.filter((x) => x.i !== t.i), t]);

  const listen = (i: number, tries: number) => {
    if (!d) return;
    if (!recognizer.supported) { setState('judged'); setTurn({ i, tries, j: { verdict: 'none', score: 0, heard: '', detail: 'reconnaissance indisponible : comparez avec le modèle' } }); return; }
    setState('listen');
    const tk = token.current;
    let got = false;
    try {
      recognizer.start((e) => {
        if (tk !== token.current) return;
        if (e.type === 'result' && !got) { got = true; const j = judgeReply(e.alts, acceptedReplies(d, i, tok)); setTurn({ i, tries: tries + 1, j }); setState('judged'); if (j.verdict === 'ok') setTimeout(() => { if (tk === token.current) advance(i + 1); }, 900); }
        if (e.type === 'error' && !got) { got = true; setTurn({ i, tries: tries + 1, j: { verdict: 'none', score: 0, heard: '', detail: e.code === 'no-speech' ? 'rien entendu : réessayez, plus près du micro' : 'micro indisponible' } }); setState('judged'); }
      });
    } catch { setState('judged'); }
  };

  const advance = (i: number) => {
    if (!d) return;
    token.current++;
    const tk = token.current;
    if (i >= d.lines.length) { finish(); return; }
    setPos(i);
    const l = d.lines[i];
    if (l.who === 'other') {
      setState('other');
      const ok = sp.speak(l.thai, { speaker: other, onend: () => setTimeout(() => { if (tk === token.current) advance(i + 1); }, 350) });
      if (!ok) setTimeout(() => { if (tk === token.current) advance(i + 1); }, 1500);
    } else {
      setState('idle');
      setTimeout(() => { if (tk === token.current) listen(i, 0); }, 450);
    }
  };

  const finish = () => {
    if (!d) return;
    setPhase('done'); setState('idle');
    const mine = d.lines.map((l, i) => ({ l, i })).filter((x) => x.l.who === 'me');
    const scores = mine.map((x) => turnOf(x.i)?.j?.score ?? 0);
    const judged = mine.filter((x) => turnOf(x.i)?.j && turnOf(x.i)!.j!.verdict !== 'none');
    const pct = judged.length ? Math.round((10 * scores.reduce((a, b) => a + b, 0)) / mine.length) : 0;
    recordActivity('dialog:' + d.id);
    if (judged.length) {
      recordActivity('talk:' + d.id, pct, 100);
      for (const x of judged) if (ITEMS['w:' + x.l.thai]) recordPronunciation('w:' + x.l.thai, turnOf(x.i)!.j!.score);
      log('talk', `Conversation · ${L(d.title)}`, pct, 100);
    }
  };

  if (!d) return <FullScreen title="Conversation" onBack={() => nav('/talk')}><div className="empty mt-6">Conversation introuvable.</div></FullScreen>;
  const title = L(d.title);

  if (phase === 'intro') {
    const mine = d.lines.filter((l) => l.who === 'me').length;
    return (
      <FullScreen title={title} onBack={() => nav(-1)}>
        <div className="ra-intro">
          <span className="eyebrow">Conversation parlée{d.level ? ` · ${d.level}` : ''}</span>
          <h2 className="theory-title">{title}</h2>
          <p className="theory-sub">Vous parlez avec {L(d.other).toLowerCase()} ({other === 'f' ? 'voix de femme' : 'voix d’homme'}). {mine} répliques à dire au micro ; à chaque fois, plusieurs formulations sont acceptées.</p>
          <label className="f">Aide</label>
          <Segmented value={aid} options={(Object.keys(AID) as Aid[]).map((a) => ({ v: a, label: AID[a].label }))} onChange={(a) => { setAid(a); try { localStorage.setItem(AID_KEY, a); } catch { /* ignore */ } }} />
          <p className="mdesc">{AID[aid].desc}</p>
          <button className="btn big" onClick={() => { setPhase('run'); setTurns([]); advance(0); }}><Icon name="mic" /> Commencer la conversation</button>
        </div>
      </FullScreen>
    );
  }

  if (phase === 'done') {
    const mine = d.lines.map((l, i) => ({ l, i })).filter((x) => x.l.who === 'me');
    const total = mine.reduce((a, x) => a + (turnOf(x.i)?.j?.score ?? 0), 0);
    const pct = Math.round((10 * total) / Math.max(1, mine.length));
    return (
      <FullScreen title={title} onBack={() => nav('/talk')}>
        <div className="ra-res">
          <section className="ra-score">
            <div className="ring" style={{ ['--p' as string]: pct }}><b>{pct}<small>%</small></b></div>
            <div className="mid"><div className="t">{pct >= 80 ? 'Conversation réussie' : pct >= 50 ? 'Bien engagé' : 'On la rejoue'}</div><div className="s">{title} · aide : {AID[aid].label.toLowerCase()}</div></div>
          </section>
          <div className="h2">Vos répliques</div>
          <div className="list ra-seq">
            {mine.map(({ l, i }) => {
              const j = turnOf(i)?.j;
              const acc = acceptedReplies(d, i, tok);
              return (
                <div key={i} className={`row ra-line ${j?.verdict ?? 'none'}`}>
                  <i className={`dot ${j?.verdict ?? 'none'}`} />
                  <span className="mid">
                    <span className="pair"><span className="exp" lang="th">{(j?.match ?? acc[0]).thai}</span></span>
                    <span className="s">{(j?.match ?? acc[0]).rom} · {L(l.tr)}</span>
                    {j?.heard && j.verdict !== 'ok' && <span className="why">Entendu : <span lang="th">{j.heard}</span>{j.detail ? ` · ${j.detail}` : ''}</span>}
                    {acc.length > 1 && <span className="why">Aussi accepté : {acc.filter((a) => a.thai !== (j?.match ?? acc[0]).thai).map((a) => a.thai).join(' · ')}</span>}
                  </span>
                  <span className="end"><button className="ib sm" aria-label="Écouter" onClick={() => sp.speak(l.thai)}><Icon name="speaker" size={16} /></button></span>
                </div>
              );
            })}
          </div>
          <div className="ra-actions">
            <button className="btn" onClick={() => { setPhase('run'); setTurns([]); advance(0); }}><Icon name="rotate" /> Rejouer</button>
            {aid !== 'none' && <button className="btn soft" onClick={() => { const a: Aid = aid === 'full' ? 'hint' : 'none'; setAid(a); try { localStorage.setItem(AID_KEY, a); } catch { /* ignore */ } setPhase('run'); setTurns([]); advance(0); }}>Rejouer avec moins d’aide</button>}
            <button className="btn ghost" onClick={() => nav('/talk')}>Une autre conversation</button>
          </div>
        </div>
      </FullScreen>
    );
  }

  // ----- la conversation -----
  const cur = d.lines[pos];
  const t = turnOf(pos);
  const acc = cur?.who === 'me' ? acceptedReplies(d, pos, tok) : [];
  return (
    <FullScreen title={title} onBack={() => { token.current++; sp.cancel(); recognizer.stop(); nav('/talk'); }} progress={pos / d.lines.length}>
      <div className="talk">
        {d.lines.slice(0, pos + 1).map((l, i) => {
          const tt = turnOf(i);
          if (l.who === 'other') return (
            <div key={i} className={`bub ${i === pos && state === 'other' ? 'playing' : ''}`} onClick={() => setShowTr(!showTr)}>
              <div className="who">{L(d.other)}</div>
              <span className="th" lang="th">{resolveTokens(l.thai, { gender: other, name: '' })}</span>
              {showTr && <span className="tr">{L(l.tr)}</span>}
            </div>
          );
          if (i < pos || state === 'judged') return (
            <div key={i} className={`bub me ${tt?.j?.verdict ?? ''}`}>
              <div className="who">Vous {tt?.j && <span className={`vd ${tt.j.verdict}`}>{tt.j.verdict === 'ok' ? 'compris' : tt.j.verdict === 'near' ? 'presque' : tt.j.verdict === 'ko' ? 'à reprendre' : ''}</span>}</div>
              <span className="th" lang="th">{tt?.j?.heard || (tt?.j?.match ?? acceptedReplies(d, i, tok)[0]).thai}</span>
              {tt?.j?.detail && tt.j.verdict !== 'ok' && <span className="tr">{tt.j.detail}</span>}
            </div>
          );
          return null;
        })}
        {cur?.who === 'me' && state !== 'judged' && (
          <div className="talk-me">
            <span className="eyebrow">À vous</span>
            {aid === 'full' && <><p className="th big" lang="th">{acc[0].thai}</p><p className="rom">{acc[0].rom}</p><p className="fr">{L(cur.tr)}</p></>}
            {aid === 'hint' && <><p className="fr big">{L(cur.tr)}</p><p className="th" lang="th">{replyStarter(acc[0]).thai}</p><p className="rom">{replyStarter(acc[0]).rom}</p></>}
            {aid === 'none' && <p className="fr big">« {L(cur.tr)} »</p>}
            <button className={`talk-mic ${state === 'listen' ? 'on' : ''}`} onClick={() => (state === 'listen' ? recognizer.stop() : listen(pos, t?.tries ?? 0))} aria-label={state === 'listen' ? 'J’ai fini' : 'Parler'}><Icon name="mic" /></button>
            <p className="xs mut">{state === 'listen' ? 'Je vous écoute…' : 'Touchez le micro pour parler'}</p>
          </div>
        )}
        {cur?.who === 'me' && state === 'judged' && t?.j?.verdict !== 'ok' && (
          <div className="talk-after">
            <button className="btn soft sm" onClick={() => sp.speak(cur.thai)}><Icon name="speaker" size={16} /> Écouter le modèle</button>
            <button className="btn soft sm" onClick={() => { token.current++; setTurn({ i: pos, tries: t?.tries ?? 0 }); listen(pos, t?.tries ?? 0); }}><Icon name="rotate" size={16} /> Réessayer</button>
            <button className="btn sm" onClick={() => advance(pos + 1)}>Continuer <Icon name="next" size={16} /></button>
          </div>
        )}
        <div ref={endRef} />
      </div>
    </FullScreen>
  );
}
