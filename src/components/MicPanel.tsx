/**
 * Panneau « Je le dis » : contrôle de prononciation par la reconnaissance vocale thaïe de l'appareil.
 * On écoute le modèle, on parle, le moteur transcrit : note sur 10, mot par mot, ce qu'il a compris et un
 * indice (ton, longueur de voyelle, mot manquant). On peut aussi s'enregistrer pour se comparer au modèle.
 * Aide honnête : le moteur dit s'il COMPREND, pas si l'accent est parfait.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { recognizer, recorder, useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { RECOGNITION_ERRORS } from '@/engine/audio/mic';
import { scorePronunciation, type PronResult } from '@/engine/audio/pronunciation';
import type { LearnItem } from '@/content/th';
import { resolveTokens } from '@/engine/tokens';
import { L } from '@/i18n';
import { Icon, Thai, Rom, useTokens, AudioPair } from './ui';
import { useWbw } from './WordByWord';

const VERDICT_TEXT: Record<PronResult['verdict'], string> = { ok: 'Compris du premier coup', near: 'Presque compris', ko: 'Pas compris' };

export function MicPanel({ item, onClose, inline, onScore }: { item: LearnItem; onClose?: () => void; inline?: boolean; onScore?: (score: number) => void }) {
  const sp = useSpeaker();
  const tok = useTokens();
  const record = useStore((s) => s.recordPronunciation);
  const stat = useStore((s) => s.pron[item.id]);
  const [listening, setListening] = useState(false);
  const [res, setRes] = useState<PronResult | null>(null);
  const [msg, setMsg] = useState('');
  const [rec, setRec] = useState(false);
  const [url, setUrl] = useState('');
  const audio = useRef<HTMLAudioElement>(null);
  const thai = item.kind === 'cons' ? item.thai + ' ' + item.ref.nameWord : item.thai;
  const seg = useWbw(item.kind === 'cons' ? item.ref.nameWord : item.thai, item.kind === 'cons' ? item.rom.split(' ').slice(1).join(' ') : item.rom);
  const words = useMemo(() => (seg ?? []).map((s) => ({ t: s.t, r: s.r })), [seg]);
  const targets = useMemo(() => item.targets.map((t) => resolveTokens(t, tok)), [item.targets, tok]);
  useEffect(() => () => { if (recorder.active) recorder.stop(); recognizer.stop(); }, []);

  const listen = () => {
    if (listening) { recognizer.stop(); return; }
    setRes(null); setMsg(''); setListening(true); sp.cancel();
    try {
      recognizer.start((ev) => {
        if (ev.type === 'result') {
          const r = scorePronunciation(ev.alts, targets, words);
          setRes(r); record(item.id, r.score); onScore?.(r.score);
        } else if (ev.type === 'error') { if (ev.code !== 'aborted') setMsg(RECOGNITION_ERRORS[ev.code] ?? `Reconnaissance interrompue (${ev.code}).`); }
        else setListening(false);
      });
    } catch { setListening(false); setMsg('La reconnaissance vocale n’a pas pu démarrer.'); }
  };
  const toggleRec = async () => {
    if (rec) { const u = await recorder.stop(); setUrl(u ?? ''); setRec(false); return; }
    try { await recorder.start(); setRec(true); setMsg(''); }
    catch (e) { setMsg((e as Error)?.name === 'NotAllowedError' ? 'Accès au micro refusé. Autorisez le micro pour cette page.' : 'Micro inaccessible : il exige une page sécurisée (https) ou l’application installée.'); }
  };

  const body = (
    <>
      <div className="stage compact"><div className="big s3"><Thai text={thai} /></div><Rom text={item.rom} /><span className="mut sm">{resolveTokens(L(item.meaning), tok)}</span></div>
      <div className="audio"><AudioPair text={item.say} big /></div>

      {recognizer.supported ? (
        <>
          <button className={`btn ${listening ? 'listening' : ''}`} onClick={listen} data-testid="mic-say">
            <Icon name="mic" size={20} /> {listening ? 'Je vous écoute… parlez maintenant' : res ? 'Je le redis' : 'Je le dis'}
          </button>
          <p className="xs mut ctr" style={{ marginTop: 6 }}>{listening ? 'Touchez à nouveau pour arrêter.' : `Dites « ${resolveTokens(thai, tok)} » : le moteur thaï écrit ce qu’il comprend.`}</p>
        </>
      ) : (
        <div className="note plain sm">La reconnaissance vocale n’est pas disponible sur ce navigateur (elle fonctionne dans Chrome pour Android et Safari). Vous pouvez tout de même vous enregistrer et vous comparer au modèle.</div>
      )}

      {res && (
        <div className={`pron ${res.verdict}`} aria-live="polite">
          <div className="cring" data-tone={res.verdict} style={{ ['--p' as string]: res.score * 10 }}><b>{res.score}</b><small>/ 10</small></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className={`verdict ${res.verdict}`}>{VERDICT_TEXT[res.verdict]}</div>
            {res.words.length > 1 && <div className="pwords">{res.words.map((w, k) => <span key={k} className={`pw ${w.ok ? 'ok' : w.near ? 'near' : 'ko'}`} lang="th"><b>{w.t}</b>{w.r && <em>{w.r}</em>}</span>)}</div>}
            {res.verdict !== 'ok' && res.heard && <div className="sm" style={{ marginTop: 6 }}>Le moteur a compris : <b className="th" style={{ fontSize: 18 }}>{res.heard}</b></div>}
            {res.hints.map((h, k) => <div key={k} className="sm mut" style={{ marginTop: 4 }}>{h}</div>)}
            {stat && stat.n > 1 && <div className="xs mut" style={{ marginTop: 6 }}>Meilleur : {stat.best}/10 · {stat.n} essais</div>}
          </div>
        </div>
      )}
      {!res && stat && <p className="xs mut ctr">Meilleur : {stat.best}/10 · dernier : {stat.last}/10 · {stat.n} essai{stat.n > 1 ? 's' : ''}</p>}
      {msg && <div className="note warn sm">{msg}</div>}

      <details className="note plain sm" style={{ marginTop: 12 }}>
        <summary>Me comparer au modèle (enregistrement)</summary>
        <div className="btns" style={{ marginTop: 10 }}>
          <button className="btn soft sm" onClick={() => sp.speak(item.say)}><Icon name="speaker" size={16} /> Modèle</button>
          {recorder.supported && <button className={`btn sm ${rec ? 'danger' : 'ghost'}`} onClick={toggleRec}><Icon name={rec ? 'pause' : 'mic'} size={16} /> {rec ? 'Arrêter' : 'M’enregistrer'}</button>}
          <button className="btn soft sm" disabled={!url} onClick={() => { if (audio.current) { audio.current.src = url; audio.current.play().catch(() => setMsg('Lecture impossible sur ce navigateur.')); } }}><Icon name="play" size={16} /> Ma voix</button>
        </div>
        <p className="xs mut" style={{ marginTop: 8 }}>Le moteur juge si le mot est compréhensible, pas la finesse de l’accent. Pour les tons, l’oreille reste le meilleur juge : comparez « Modèle » et « Ma voix ».</p>
        <audio ref={audio} preload="none" />
      </details>
    </>
  );
  if (inline) return <div>{body}</div>;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true">
        <div className="shead"><b>Prononciation</b><span className="sp" /><button className="ib sm" onClick={onClose} aria-label="Fermer"><Icon name="close" size={18} /></button></div>
        {body}
      </section>
    </>
  );
}
