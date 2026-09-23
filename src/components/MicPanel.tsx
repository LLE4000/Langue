/**
 * Panneau micro : écouter le modèle, s'enregistrer, se réécouter, et (si disponible) demander au moteur de
 * reconnaissance vocale s'il a compris le bon mot. Aide, pas mesure scientifique de l'accent.
 */
import { useEffect, useRef, useState } from 'react';
import { recognizer, recorder, useSpeaker } from '@/app/services/speech';
import { judgeSpeech, RECOGNITION_ERRORS, type Verdict } from '@/engine/audio/mic';
import type { LearnItem } from '@/content/th';
import { resolveTokens } from '@/engine/tokens';
import { L } from '@/i18n';
import { Icon, Sheet, Thai, Rom, useTokens, AudioButton } from './ui';

const VERDICT: Record<Verdict, [string, string]> = { ok: ['ok', '✅ Reconnu correctement'], near: ['near', '🟠 Presque : le moteur a compris quelque chose de proche'], ko: ['ko', '❌ Le moteur n’a pas reconnu la bonne expression'] };

export function MicPanel({ item, onClose, inline }: { item: LearnItem; onClose?: () => void; inline?: boolean }) {
  const sp = useSpeaker();
  const tok = useTokens();
  const [rec, setRec] = useState(false);
  const [asr, setAsr] = useState(false);
  const [url, setUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [res, setRes] = useState<{ verdict: Verdict; alts: string[] } | null>(null);
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => () => { if (recorder.active) recorder.stop(); recognizer.stop(); }, []);

  const toggleRec = async () => {
    if (rec) { const u = await recorder.stop(); setUrl(u ?? ''); setRec(false); return; }
    try { await recorder.start(); setRec(true); setMsg(''); }
    catch (e) { setMsg((e as Error)?.name === 'NotAllowedError' ? 'Accès au micro refusé. Autorisez le micro pour cette page.' : 'Micro inaccessible : le micro exige une page sécurisée (https) ou une application installée.'); }
  };
  const startAsr = () => {
    if (asr) { recognizer.stop(); return; }
    setAsr(true); setRes(null); setMsg('');
    try {
      recognizer.start((ev) => {
        if (ev.type === 'result') { const j = judgeSpeech(ev.alts, item.targets.map((t) => resolveTokens(t, tok))); setRes({ verdict: j.verdict, alts: ev.alts }); }
        else if (ev.type === 'error') setMsg(RECOGNITION_ERRORS[ev.code] ?? `Reconnaissance interrompue (${ev.code}).`);
        else setAsr(false);
      });
    } catch { setAsr(false); setMsg('La reconnaissance vocale n’a pas pu démarrer.'); }
  };
  const body = (
    <>
      <div className="stage compact"><div className="big s3"><Thai text={item.kind === 'cons' ? item.thai + ' ' + item.ref.nameWord : item.thai} /></div><Rom text={item.rom} /><span className="mut sm">{resolveTokens(L(item.meaning), tok)}</span></div>
      <div className="btns" style={{ marginTop: 12 }}>
        <button className="btn soft" onClick={() => sp.speak(item.say)}><Icon name="speaker" size={18} /> Modèle</button>
        <button className="btn soft" disabled={!url} onClick={() => { if (audio.current) { audio.current.src = url; audio.current.play().catch(() => setMsg('Lecture impossible sur ce navigateur.')); } }}><Icon name="play" size={18} /> Ma voix</button>
      </div>
      <div className="audio">
        <AudioButton text={item.say} slow />
        {recorder.supported && <button className={`ib big ${rec ? 'rec' : 'pri'}`} onClick={toggleRec} aria-label={rec ? 'Arrêter' : 'Enregistrer ma voix'}><Icon name={rec ? 'pause' : 'mic'} /></button>}
        {recognizer.supported && <button className={`ib ${asr ? 'rec' : ''}`} onClick={startAsr} aria-label="Tester la reconnaissance vocale">🗣</button>}
      </div>
      <p className="xs mut ctr">{rec ? 'Enregistrement… touchez ⏸ pour arrêter.' : asr ? 'Le moteur vous écoute… parlez maintenant.' : `🎙 s’enregistrer pour se comparer au modèle${recognizer.supported ? ' · 🗣 vérifier si le moteur vous comprend' : ''}`}</p>
      {msg && <div className="note warn sm">{msg}</div>}
      {res && <div className="note plain"><div className={`verdict ${VERDICT[res.verdict][0]}`}>{VERDICT[res.verdict][1]}</div><div style={{ marginTop: 6 }}>Le moteur a compris : {res.alts.slice(0, 3).map((a, i) => <b key={i} className="th" style={{ fontSize: 19, marginRight: 8 }}>{a}</b>)}</div></div>}
      {!recorder.supported && <div className="note warn sm">L’enregistrement audio n’est pas disponible sur ce navigateur.</div>}
      {!recognizer.supported && <div className="note plain sm">La reconnaissance vocale n’est pas disponible ici (elle fonctionne sur Chrome pour Android). L’enregistrement et la comparaison restent possibles.</div>}
      <div className="note info sm"><b>Reconnaissance du mot ≠ qualité de prononciation.</b> Le moteur indique seulement s’il a compris le bon mot ; il ne mesure ni l’accent ni les tons. Pour juger vos tons, comparez « Modèle » et « Ma voix ».</div>
      <audio ref={audio} preload="none" />
    </>
  );
  if (inline) return <div>{body}</div>;
  return <Sheet open onClose={onClose ?? (() => {})} title="Prononciation">{body}</Sheet>;
}
