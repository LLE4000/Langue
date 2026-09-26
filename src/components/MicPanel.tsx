/**
 * Panneau « Je le dis » : UN bouton, UNE note.
 *  - Le moteur de reconnaissance thaï de l'appareil écrit ce qu'il comprend : note sur 10, mot par mot,
 *    ce qui a été entendu, indice (ton, longueur de voyelle, mot manquant). Sévérité réglable.
 *  - En même temps, la voix est enregistrée ; sur une syllabe, sa hauteur est analysée et comparée au ton
 *    attendu : un ton faux plafonne la note (5/10), car en thaï c'est un autre mot (หมา / มา).
 *  - L'enregistrement sert aussi à se réécouter face au modèle.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { recognizer, recorder, useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { RECOGNITION_ERRORS } from '@/engine/audio/mic';
import { applyToneCheck, scorePronunciation, type PronResult } from '@/engine/audio/pronunciation';
import { analyzeToneFromBlob, type ToneCheckResult } from '@/engine/audio/toneCheck';
import { parseSyl, sylsOf } from '@/engine/thai/transcription';
import { TONE_BY_ID, type LearnItem } from '@/content/th';
import { TONES } from '@/content/th/tones';
import { resolveTokens } from '@/engine/tokens';
import { L } from '@/i18n';
import { Icon, Thai, Rom, useTokens, AudioPair, Sheet } from './ui';
import { useWbw } from './WordByWord';

const VERDICT_TEXT: Record<PronResult['verdict'], string> = { ok: 'Compris !', near: 'Presque compris', ko: 'Pas compris' };
const TONE_ONLY_MS = 1700;

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
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<PronResult | null>(null);
  const [toneRes, setToneRes] = useState<ToneCheckResult | null>(null);
  const [msg, setMsg] = useState('');
  const [rec, setRec] = useState(false);
  const [url, setUrl] = useState('');
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
  const canTone = !!expectedTone && recorder.supported;
  useEffect(() => () => { if (recorder.active) recorder.stop(); recognizer.stop(); }, []);

  const toneLabel = (id: keyof typeof TONE_BY_ID) => L(TONE_BY_ID[id].name);
  const analyze = async (): Promise<ToneCheckResult | null> => {
    if (!expectedTone || !recorder.active) return null;
    const u = await recorder.stop();
    if (u) setUrl(u);
    if (!recorder.blob) return null;
    const t = await analyzeToneFromBlob(recorder.blob, expectedTone);
    return 'error' in t ? null : t;
  };
  const finish = (r: PronResult, tone: ToneCheckResult | null) => {
    const final = applyToneCheck(r, tone && expectedTone ? { ok: tone.ok, similarity: tone.similarity, predicted: toneLabel(tone.predicted), expected: toneLabel(expectedTone) } : null, strictness);
    setRes(final); setToneRes(tone); record(item.id, final.score); onScore?.(final.score);
  };

  /** Le bouton unique : reconnaissance + enregistrement en même temps, puis une seule note. */
  const listen = async () => {
    if (listening) { recognizer.stop(); return; }
    setRes(null); setToneRes(null); setMsg(''); sp.cancel();
    if (!recognizer.supported) { await toneOnly(); return; }
    setListening(true);
    if (canTone) { try { await recorder.start(); } catch { /* sans micro brut : la reconnaissance seule */ } }
    let got = false;
    try {
      recognizer.start(async (ev) => {
        if (ev.type === 'result') {
          got = true;
          const r = scorePronunciation(ev.alts, targets, words, strictness, ev.confidence);
          setBusy(true);
          const tone = await analyze().catch(() => null);
          setBusy(false);
          finish(r, tone);
        } else if (ev.type === 'error') {
          got = true;
          if (recorder.active) recorder.stop();
          if (ev.code !== 'aborted') setMsg(RECOGNITION_ERRORS[ev.code] ?? `Reconnaissance interrompue (${ev.code}).`);
        } else {
          setListening(false);
          if (recorder.active) recorder.stop();
          if (!got) setMsg('Rien entendu : touchez le micro, puis dites le mot.');
        }
      });
    } catch { setListening(false); if (recorder.active) recorder.stop(); setMsg('La reconnaissance vocale n’a pas pu démarrer.'); }
  };
  /** Sans reconnaissance vocale : on juge au moins le ton (une syllabe). */
  const toneOnly = async () => {
    if (!canTone) return;
    setListening(true);
    try { await recorder.start(); } catch (e) { setListening(false); setMsg((e as Error)?.name === 'NotAllowedError' ? 'Accès au micro refusé. Autorisez le micro pour cette page.' : 'Micro inaccessible : il exige une page sécurisée (https) ou l’application installée.'); return; }
    await new Promise((r) => setTimeout(r, TONE_ONLY_MS));
    setListening(false); setBusy(true);
    const tone = await analyze().catch(() => null);
    setBusy(false);
    setToneRes(tone);
    if (!tone) setMsg('Rien n’a été enregistré.');
  };
  const toggleRec = async () => {
    if (rec) { const u = await recorder.stop(); setUrl(u ?? ''); setRec(false); return; }
    try { await recorder.start(); setRec(true); setMsg(''); }
    catch (e) { setMsg((e as Error)?.name === 'NotAllowedError' ? 'Accès au micro refusé. Autorisez le micro pour cette page.' : 'Micro inaccessible : il exige une page sécurisée (https) ou l’application installée.'); }
  };

  const modeNote = strictness === 'strict' ? ' · mode strict' : strictness === 'lenient' ? ' · mode indulgent' : '';
  const body = (
    <>
      <div className="stage compact"><div className="big s3"><Thai text={thai} /></div><Rom text={item.rom} /><span className="mut sm">{resolveTokens(L(item.meaning), tok)}</span></div>
      <div className="audio"><AudioPair text={item.say} big /></div>

      {(recognizer.supported || canTone) ? (
        <>
          <button className={`btn ${listening ? 'listening' : ''}`} onClick={listen} disabled={busy} data-testid="mic-say">
            <Icon name="mic" size={20} /> {busy ? 'Analyse…' : listening ? 'Je vous écoute… parlez maintenant' : res || toneRes ? 'Je le redis' : 'Je le dis'}
          </button>
          <p className="xs mut ctr mt-2">
            {listening ? (recognizer.supported ? 'Touchez à nouveau pour arrêter.' : 'Dites la syllabe, un peu longuement.') : recognizer.supported ? `Dites « ${resolveTokens(thai, tok)} ». Le moteur thaï écrit ce qu’il comprend${canTone ? ' et la courbe de votre voix est comparée au ton attendu' : ''}${modeNote}.` : 'Sans reconnaissance vocale sur ce navigateur, l’application juge au moins le ton.'}
          </p>
          {msg && <div className="note warn sm">{msg}</div>}
        </>
      ) : (
        <div className="note plain sm">La reconnaissance vocale n’est pas disponible sur ce navigateur (elle fonctionne dans Chrome pour Android et Safari). Vous pouvez tout de même vous enregistrer pour vous comparer au modèle.</div>
      )}

      {(res || toneRes) && (
        <div className={`pron ${res?.verdict ?? (toneRes?.ok ? 'ok' : 'ko')}`} aria-live="polite">
          {res && <div className="cring" data-tone={res.verdict} style={{ ['--p' as string]: res.score * 10 }}><b>{res.score}</b><small>/ 10</small></div>}
          <div className="grow">
            {res && <div className={`verdict ${res.verdict}`}>{VERDICT_TEXT[res.verdict]}</div>}
            {res && res.words.length > 1 && <div className="pwords">{res.words.map((w, k) => <span key={k} className={`pw ${w.ok ? 'ok' : w.near ? 'near' : 'ko'}`} lang="th"><b>{w.t}</b>{w.r && <em>{w.r}</em>}</span>)}</div>}
            {toneRes && expectedTone && (
              <div className={`sm toneline mt-2 ${toneRes.ok ? 'ok' : toneRes.similarity >= 0.6 ? 'near' : 'ko'}`}>
                <Icon name="music" size={14} /> {toneRes.ok ? <>Ton <b>{toneLabel(expectedTone)}</b> reconnu <Icon name="check" size={14} /></> : <>Ton entendu : <b>{toneLabel(toneRes.predicted)}</b> · attendu : <b>{toneLabel(expectedTone)}</b></>} <span className="mut">· ressemblance {Math.round(toneRes.similarity * 100)} %</span>
              </div>
            )}
            {res && res.verdict !== 'ok' && res.heard && <div className="sm mt-2">Le moteur a compris : <b className="th th-s">{res.heard}</b></div>}
            {res && typeof res.confidence === 'number' && <div className="xs mut mt-1">Certitude du moteur : {Math.round(res.confidence * 100)} %</div>}
            {res && res.verdict !== 'ok' && res.alts.length > 1 && <div className="xs mut mt-1">Il hésitait aussi avec : <span className="th">{res.alts.slice(1, 3).join(' · ')}</span></div>}
            {(res?.hints ?? []).map((h, k) => <div key={k} className="sm mut mt-1">{h}</div>)}
            {!res && toneRes && !toneRes.ok && <div className="sm mut mt-1">{L(TONES.find((t) => t.id === expectedTone)!.desc)} Réécoutez le modèle et exagérez le mouvement.</div>}
            {stat && stat.n > 1 && <div className="xs mut mt-2">Meilleur : {stat.best}/10 · {stat.n} essais</div>}
          </div>
        </div>
      )}
      {toneRes && expectedTone && <details className="fold sm"><summary>Voir la courbe de mon ton</summary><div className="tonecheck mt-0"><ToneOverlay points={toneRes.points} expected={expectedTone} /></div></details>}
      {!res && !toneRes && stat && <p className="xs mut ctr">Meilleur : {stat.best}/10 · dernier : {stat.last}/10 · {stat.n} essai{stat.n > 1 ? 's' : ''}</p>}

      <details className="fold sm">
        <summary>Me réécouter face au modèle</summary>
        <div className="btns mt-3">
          <button className="btn soft sm" onClick={() => sp.speak(item.say)}><Icon name="speaker" size={16} /> Modèle</button>
          <button className="btn soft sm" disabled={!url} onClick={() => { if (audio.current) { audio.current.src = url; audio.current.play().catch(() => setMsg('Lecture impossible sur ce navigateur.')); } }}><Icon name="play" size={16} /> Ma voix</button>
          {recorder.supported && <button className={`btn sm ${rec ? 'danger' : 'ghost'}`} onClick={toggleRec}><Icon name={rec ? 'pause' : 'mic'} size={16} /> {rec ? 'Arrêter' : 'Enregistrer'}</button>}
        </div>
        <p className="foot-note">{url ? 'Votre dernier essai est gardé : comparez-le au modèle à l’oreille.' : 'Après « Je le dis », votre voix est gardée ici pour la comparer au modèle.'}</p>
        <audio ref={audio} preload="none" />
      </details>
    </>
  );
  if (inline) return <div>{body}</div>;
  return <Sheet open onClose={onClose ?? (() => {})} title="Prononciation">{body}</Sheet>;
}
