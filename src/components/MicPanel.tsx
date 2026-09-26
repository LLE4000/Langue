/**
 * Panneau « Je le dis » : contrôle de prononciation.
 *  - Reconnaissance vocale thaïe de l'appareil : note sur 10, mot par mot, ce que le moteur a compris,
 *    indice (ton, longueur de voyelle, mot manquant). Sévérité réglable.
 *  - Sur une syllabe : analyse de la hauteur de la voix, courbe superposée au ton attendu, ton entendu.
 *  - Enregistrement pour se comparer au modèle.
 * Aide honnête : la reconnaissance dit si l'on est COMPRIS ; la courbe dit si le TON a la bonne forme.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { recognizer, recorder, useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { RECOGNITION_ERRORS } from '@/engine/audio/mic';
import { scorePronunciation, type PronResult } from '@/engine/audio/pronunciation';
import { analyzeToneFromBlob, type ToneCheckResult } from '@/engine/audio/toneCheck';
import { parseSyl, sylsOf } from '@/engine/thai/transcription';
import { TONE_BY_ID, type LearnItem } from '@/content/th';
import { TONES } from '@/content/th/tones';
import { resolveTokens } from '@/engine/tokens';
import { L } from '@/i18n';
import { Icon, Thai, Rom, useTokens, AudioPair, Segmented, Sheet } from './ui';
import { useWbw } from './WordByWord';

const VERDICT_TEXT: Record<PronResult['verdict'], string> = { ok: 'Compris !', near: 'Presque compris', ko: 'Pas compris' };
const TONE_MS = 1700;

/** Courbe du ton : gabarit attendu (couleur du ton) et courbe de la voix (pointillés). */
function ToneOverlay({ points, expected }: { points: number[]; expected: keyof typeof TONE_BY_ID }) {
  const t = TONE_BY_ID[expected];
  const me = points.map((st, i) => `${i === 0 ? 'M' : 'L'}${(6 + (88 * i) / (points.length - 1)).toFixed(1)} ${Math.max(4, Math.min(60, 32 - st * 4)).toFixed(1)}`).join(' ');
  return (
    <>
      <svg viewBox="0 0 100 64" aria-label="Courbe du ton"><path d={t.path} stroke={t.color} /><path className="me" d={me} /></svg>
      <div className="legend"><span><i style={{ background: t.color }} />ton {L(t.name)} attendu</span><span><i style={{ background: 'var(--ink)' }} />ma voix</span></div>
    </>
  );
}

export function MicPanel({ item, onClose, inline, onScore }: { item: LearnItem; onClose?: () => void; inline?: boolean; onScore?: (score: number) => void }) {
  const sp = useSpeaker();
  const tok = useTokens();
  const record = useStore((s) => s.recordPronunciation);
  const stat = useStore((s) => s.pron[item.id]);
  const strictness = useStore((s) => s.settings.pronStrictness ?? 'normal');
  const [listening, setListening] = useState(false);
  const [res, setRes] = useState<PronResult | null>(null);
  const [msg, setMsg] = useState('');
  const [rec, setRec] = useState(false);
  const [url, setUrl] = useState('');
  const [toneState, setToneState] = useState<'idle' | 'rec' | 'busy'>('idle');
  const [toneRes, setToneRes] = useState<ToneCheckResult | null>(null);
  const [tab, setTab] = useState<'say' | 'tone'>(recognizer.supported ? 'say' : 'tone');
  const audio = useRef<HTMLAudioElement>(null);
  const thai = item.kind === 'cons' ? item.thai + ' ' + item.ref.nameWord : item.thai;
  const seg = useWbw(item.kind === 'cons' ? item.ref.nameWord : item.thai, item.kind === 'cons' ? item.rom.split(' ').slice(1).join(' ') : item.rom);
  const words = useMemo(() => (seg ?? []).map((s) => ({ t: s.t, r: s.r })), [seg]);
  const targets = useMemo(() => item.targets.map((t) => resolveTokens(t, tok)), [item.targets, tok]);
  // Analyse du ton : sur une syllabe (mots courts, mots-tons), le ton attendu vient de la transcription
  const expectedTone = useMemo(() => {
    if (item.kind === 'cons' || item.kind === 'vow' || item.kind === 'rule' || item.kind === 'grammar') return null;
    const syls = sylsOf(resolveTokens(item.rom, tok)).filter((s) => !/[{…]/.test(s));
    return syls.length === 1 ? parseSyl(syls[0])?.tone ?? null : null;
  }, [item, tok]);
  useEffect(() => () => { if (recorder.active) recorder.stop(); recognizer.stop(); }, []);

  const listen = () => {
    if (listening) { recognizer.stop(); return; }
    setRes(null); setMsg(''); setListening(true); sp.cancel();
    try {
      recognizer.start((ev) => {
        if (ev.type === 'result') {
          const r = scorePronunciation(ev.alts, targets, words, strictness, ev.confidence);
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
  const checkTone = async () => {
    if (!expectedTone || toneState !== 'idle') return;
    setToneRes(null); setMsg(''); sp.cancel(); setToneState('rec');
    try { await recorder.start(); }
    catch (e) { setToneState('idle'); setMsg((e as Error)?.name === 'NotAllowedError' ? 'Accès au micro refusé. Autorisez le micro pour cette page.' : 'Micro inaccessible : il exige une page sécurisée (https) ou l’application installée.'); return; }
    await new Promise((r) => setTimeout(r, TONE_MS));
    const u = await recorder.stop();
    if (u) setUrl(u);
    setToneState('busy');
    const r = recorder.blob ? await analyzeToneFromBlob(recorder.blob, expectedTone) : { error: 'Rien n’a été enregistré.' };
    if ('error' in r) setMsg(r.error); else setToneRes(r);
    setToneState('idle');
  };

  const hasToneTab = recorder.supported;
  const body = (
    <>
      <div className="stage compact"><div className="big s3"><Thai text={thai} /></div><Rom text={item.rom} /><span className="mut sm">{resolveTokens(L(item.meaning), tok)}</span></div>
      <div className="audio"><AudioPair text={item.say} big /></div>
      {hasToneTab && recognizer.supported && <div style={{ marginBottom: 12 }}><Segmented value={tab} options={[{ v: 'say' as const, label: '🎙️ Je le dis' }, { v: 'tone' as const, label: '🎵 Mon ton et ma voix' }]} onChange={setTab} /></div>}

      {tab === 'say' && (recognizer.supported ? (
        <>
          <button className={`btn ${listening ? 'listening' : ''}`} onClick={listen} data-testid="mic-say">
            <Icon name="mic" size={20} /> {listening ? 'Je vous écoute… parlez maintenant' : res ? 'Je le redis' : 'Je le dis'}
          </button>
          <p className="xs mut ctr" style={{ marginTop: 6 }}>{listening ? 'Touchez à nouveau pour arrêter.' : `Dites « ${resolveTokens(thai, tok)} » : le moteur thaï écrit ce qu’il comprend${strictness === 'strict' ? ' · mode strict' : strictness === 'lenient' ? ' · mode indulgent' : ''}.`}</p>
          {msg && <div className="note warn sm">{msg}</div>}
          {res && (
            <div className={`pron ${res.verdict}`} aria-live="polite">
              <div className="cring" data-tone={res.verdict} style={{ ['--p' as string]: res.score * 10 }}><b>{res.score}</b><small>/ 10</small></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={`verdict ${res.verdict}`}>{VERDICT_TEXT[res.verdict]}</div>
                {res.words.length > 1 && <div className="pwords">{res.words.map((w, k) => <span key={k} className={`pw ${w.ok ? 'ok' : w.near ? 'near' : 'ko'}`} lang="th"><b>{w.t}</b>{w.r && <em>{w.r}</em>}</span>)}</div>}
                {res.verdict !== 'ok' && res.heard && <div className="sm" style={{ marginTop: 6 }}>Le moteur a compris : <b className="th" style={{ fontSize: 18 }}>{res.heard}</b></div>}
                {typeof res.confidence === 'number' && <div className="xs mut" style={{ marginTop: 4 }}>Certitude du moteur : {Math.round(res.confidence * 100)} %</div>}
                {res.verdict !== 'ok' && res.alts.length > 1 && <div className="xs mut" style={{ marginTop: 2 }}>Il hésitait aussi avec : <span className="th">{res.alts.slice(1, 3).join(' · ')}</span></div>}
                {res.hints.map((h, k) => <div key={k} className="sm mut" style={{ marginTop: 4 }}>{h}</div>)}
                {stat && stat.n > 1 && <div className="xs mut" style={{ marginTop: 6 }}>Meilleur : {stat.best}/10 · {stat.n} essais</div>}
              </div>
            </div>
          )}
          {!res && stat && <p className="xs mut ctr">Meilleur : {stat.best}/10 · dernier : {stat.last}/10 · {stat.n} essai{stat.n > 1 ? 's' : ''}</p>}
        </>
      ) : (
        <div className="note plain sm">La reconnaissance vocale n’est pas disponible sur ce navigateur (elle fonctionne dans Chrome pour Android et Safari). L’analyse du ton et l’enregistrement restent possibles.</div>
      ))}

      {tab === 'tone' && hasToneTab && (
        <>
          {expectedTone ? (
            <div className="tonecheck">
              <div className="row-flex" style={{ gap: 8 }}>
                <b style={{ flex: 1 }}>Mon ton <span className="mut" style={{ fontWeight: 500 }}>· attendu : {L(TONE_BY_ID[expectedTone].name)}</span></b>
                <button className={`btn auto sm ${toneState === 'rec' ? 'listening' : 'soft'}`} onClick={checkTone} disabled={toneState !== 'idle'} data-testid="tone-check">
                  {toneState === 'rec' ? 'Parlez…' : toneState === 'busy' ? 'Analyse…' : '🎵 Vérifier mon ton'}
                </button>
              </div>
              <p className="xs mut" style={{ margin: '4px 0 8px' }}>{toneState === 'rec' ? `Dites la syllabe seule, un peu longuement (${(TONE_MS / 1000).toFixed(1).replace('.', ',')} s d’enregistrement).` : 'L’application mesure la hauteur de votre voix et la compare à la forme du ton. Cette analyse se fait sur l’appareil.'}</p>
              {toneRes && (
                <>
                  <ToneOverlay points={toneRes.points} expected={expectedTone} />
                  <div className={`verdict ${toneRes.ok ? 'ok' : toneRes.similarity >= 0.6 ? 'near' : 'ko'}`} style={{ marginTop: 8 }}>
                    {toneRes.ok ? `Ton ${L(TONE_BY_ID[expectedTone].name)} reconnu` : `On entend plutôt un ton ${L(TONE_BY_ID[toneRes.predicted].name)}`} · ressemblance {Math.round(toneRes.similarity * 100)} %
                  </div>
                  {!toneRes.ok && <div className="sm mut" style={{ marginTop: 4 }}>{L(TONES.find((t) => t.id === expectedTone)!.desc)} Réécoutez le modèle et exagérez le mouvement.</div>}
                </>
              )}
            </div>
          ) : (
            <p className="sm mut" style={{ margin: '0 2px 10px' }}>L’analyse du ton se fait sur les mots d’une syllabe. Ici, comparez votre voix au modèle.</p>
          )}
          <div className="note plain sm" style={{ marginTop: 12 }}>
            <b>Me comparer au modèle</b>
            <div className="btns" style={{ marginTop: 10 }}>
              <button className="btn soft sm" onClick={() => sp.speak(item.say)}><Icon name="speaker" size={16} /> Modèle</button>
              <button className={`btn sm ${rec ? 'danger' : 'ghost'}`} onClick={toggleRec}><Icon name={rec ? 'pause' : 'mic'} size={16} /> {rec ? 'Arrêter' : 'M’enregistrer'}</button>
              <button className="btn soft sm" disabled={!url} onClick={() => { if (audio.current) { audio.current.src = url; audio.current.play().catch(() => setMsg('Lecture impossible sur ce navigateur.')); } }}><Icon name="play" size={16} /> Ma voix</button>
            </div>
            <p className="xs mut" style={{ marginTop: 8 }}>La reconnaissance juge si le mot est compréhensible ; la courbe juge la forme du ton sur une syllabe. Pour le reste, l’oreille : comparez « Modèle » et « Ma voix ».</p>
            <audio ref={audio} preload="none" />
          </div>
          {msg && <div className="note warn sm">{msg}</div>}
        </>
      )}
    </>
  );
  if (inline) return <div>{body}</div>;
  return <Sheet open onClose={onClose ?? (() => {})} title="Prononciation">{body}</Sheet>;
}
