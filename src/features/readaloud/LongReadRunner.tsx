/**
 * Lecture longue à voix haute — un texte entier. La phrase en cours en grand, ses mots se colorent au fil de la
 * reconnaissance ; les phrases lues au-dessus, les suivantes en dessous. Le bilan donne les mots justes, déformés et
 * manqués, le débit et les pauses, et renvoie les mots difficiles vers « Mes erreurs » du tapis de lecture.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { activePack } from '@/content/packs';
import { ITEMS, th } from '@/content/th';
import { L } from '@/i18n';
import { MicStream } from '@/engine/audio/stream';
import { ContinuousRecognizer } from '@/engine/audio/mic';
import { assessPronunciation, azureConfig } from '@/engine/audio/azure';
import { summarizeText, type LrWord } from '@/engine/readaloud/longread';
import { consonantsOf } from '@/engine/thai/script';
import { Icon } from '@/components/ui';
import { LongRun, type LrState } from './longrun';

const VERDICT_FR: Record<string, string> = { ok: 'lu', near: 'déformé', missed: 'manqué', none: 'non jugé' };

/** Les textes lisibles à voix haute : les lectures de la bibliothèque, par niveau. */
export const longTexts = () => [...th.READINGS].sort((a, b) => a.level - b.level).filter((r) => r.sentences.every((s) => s.tokens.every((t) => !/[{]/.test(t.thai))));

export function LongReadRunner() {
  const { id = '' } = useParams();
  const nav = useNavigate();
  const sp = useSpeaker();
  const r = th.READINGS.find((x) => x.id === decodeURIComponent(id));
  const recordActivity = useStore((s) => s.recordActivity);
  const record = useStore((s) => s.recordReadAloud);
  const sentences: LrWord[][] = useMemo(() => (r ? r.sentences.map((s) => s.tokens.map((t) => ({ thai: t.thai, rom: t.rom, gloss: t.gloss ? L(t.gloss) : undefined }))) : []), [r]);
  const [run, setRun] = useState<LongRun | null>(null);
  const runRef = useRef<LongRun | null>(null);
  const [rom, setRom] = useState(false);
  useEffect(() => () => runRef.current?.release(), []);
  const state = useSyncExternalStore((cb) => run?.subscribe(cb) ?? (() => {}), () => run?.state ?? null, () => null);
  const cur = useRef<HTMLDivElement>(null);
  useEffect(() => { cur.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, [state?.si]);

  const create = () => {
    runRef.current?.release();
    const x = new LongRun(sentences, {
      speak: (t, onend) => sp.speak(t, { onend }), cancelSpeak: () => sp.cancel(),
      mic: MicStream.supported ? new MicStream() : null,
      asr: new ContinuousRecognizer(activePack().speechLang).supported ? new ContinuousRecognizer(activePack().speechLang) : null,
      azure: azureConfig(), assess: assessPronunciation, now: () => performance.now() / 1000,
    });
    runRef.current = x; setRun(x);
    return x;
  };

  // bilan enregistré une fois (les derniers jugements arrivent dans les 2 s)
  const saved = useRef<LongRun | null>(null);
  useEffect(() => {
    if (!run || !r || state?.phase !== 'done' || saved.current === run) return;
    const t = setTimeout(() => {
      saved.current = run;
      const s = summarizeText(run.state.sentences);
      recordActivity('reading:' + r.id);
      recordActivity('readtext:' + r.id, s.score, 100);
      const items = run.state.sentences.flatMap((se) => se.words.map((w, k) => ({ key: w.thai, thai: w.thai, rom: w.rom, verdict: se.results[k].verdict === 'missed' ? 'ko' : se.results[k].verdict, detail: se.results[k].verdict === 'missed' ? 'mot manqué dans un texte' : se.results[k].verdict === 'near' ? 'mot déformé dans un texte' : undefined })));
      const tags: Record<string, { ok: number; n: number }> = {};
      run.state.sentences.forEach((se) => se.words.forEach((w, k) => { const v = se.results[k].verdict; if (v === 'none') return; for (const c of consonantsOf(w.thai)) { const g = (tags['c:' + c] ??= { ok: 0, n: 0 }); g.n++; if (v === 'ok') g.ok++; } }));
      record({ label: `Lecture à voix haute · ${L(r.title)}`, minutes: Math.max(1, Math.round(((run.state.endedAt ?? 0) - run.state.startedAt) / 60)), ok: s.ok, total: s.judged, tags: Object.fromEntries(Object.entries(tags).filter(([k]) => ITEMS[k])), items: items.filter((i) => i.verdict !== 'ok') });
    }, 2200);
    return () => clearTimeout(t);
  }, [run, state?.phase, r, record, recordActivity]);

  if (!r) return <FullScreen title="Lecture" onBack={() => nav('/read')}><div className="empty mt-6">Texte introuvable.</div></FullScreen>;
  const title = L(r.title);

  if (!state || state.phase === 'ready' || state.phase === 'starting') {
    return (
      <FullScreen title={title} onBack={() => nav(-1)}>
        <div className="ra-intro">
          <span className="eyebrow">Lecture à voix haute · niveau {r.level}</span>
          <h2 className="theory-title">{title}</h2>
          <p className="theory-sub">{r.sentences.length} phrases · {sentences.flat().length} mots. Lisez le texte d’un bout à l’autre, naturellement : chaque phrase se colore au fil de votre lecture et la suivante arrive toute seule.</p>
          <p className="lr-preview" lang="th">{r.sentences.slice(0, 2).map((s) => s.tokens.map((t) => t.thai).join('')).join(' ')}…</p>
          <ul className="ra-tips">
            <li><Icon name="mic" size={18} /> Micro ouvert du début à la fin : marquez une pause pour passer à la phrase suivante.</li>
            <li><Icon name="speaker" size={18} /> Un doute ? « Écouter » fait entendre la phrase en voix native.</li>
            <li><Icon name="target" size={18} /> Les mots difficiles rejoignent vos erreurs, pour les reprendre au tapis de lecture.</li>
          </ul>
          <button className="btn big" disabled={state?.phase === 'starting'} onClick={() => create().start()}><Icon name="mic" /> {state?.phase === 'starting' ? 'Ouverture du micro…' : 'Commencer la lecture'}</button>
        </div>
      </FullScreen>
    );
  }

  if (state.phase === 'done') return <FullScreen title={title} onBack={() => nav('/read')}><LongResults state={state} rTitle={title} onAgain={() => setRun(null)} /></FullScreen>;

  const pct = Math.round((100 * state.si) / state.sentences.length);
  return (
    <div className={`app lr-app ${state.phase === 'paused' ? 'paused' : ''}`}>
      <header className="ltop">
        <button className="tb" aria-label="Quitter" onClick={() => { runRef.current?.release(); nav('/read'); }}><Icon name="close" /></button>
        <div className="lbar" role="progressbar" aria-label={`Progression : ${title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
        <span className="ra-count">{state.si + 1} / {state.sentences.length}</span>
        <button className={`tb ${rom ? 'on' : ''}`} aria-pressed={rom} aria-label="Afficher la phonétique" onClick={() => setRom(!rom)}><Icon name="eye" /></button>
      </header>
      <main className="lr-text">
        {state.sentences.map((s, i) => (
          <div key={i} ref={i === state.si ? cur : undefined} className={`lr-s ${i < state.si ? 'past' : i === state.si ? 'cur' : 'next'} ${i === state.si && state.voice ? 'voice' : ''}`}>
            <p className="th" lang="th">{s.words.map((w, k) => <span key={k} className={`w ${i <= state.si ? s.results[k].verdict : ''}`}>{w.thai}</span>)}</p>
            {rom && i === state.si && <p className="rom">{s.words.map((w) => w.rom).join(' ')}</p>}
          </div>
        ))}
      </main>
      <footer className="ra-ctrl">
        <div className="ra-status">
          <span className={state.mic ? 'on' : ''}><Icon name="mic" size={14} />{state.mic ? (state.voice ? 'on vous entend' : 'micro ouvert') : 'sans micro'}</span>
          {state.asr !== 'off' && <span className={state.asr === 'ok' ? 'on' : ''}>reconnaissance {state.asr === 'ok' ? 'active' : state.asr === 'silent' ? 'muette' : '…'}</span>}
          {state.azure !== 'off' && <span className={state.azure === 'on' ? 'on' : 'ko'}>Azure</span>}
        </div>
        {state.notice && <p className="ra-notice">{state.notice}</p>}
        <div className="ra-btns">
          <button className="ib big" aria-label="Écouter la phrase" onClick={() => run!.listen()}><Icon name="speaker" /></button>
          <button className="ra-main" aria-label={state.phase === 'paused' ? 'Reprendre' : 'Pause'} onClick={() => (state.phase === 'paused' ? run!.resume() : run!.pause())}><Icon name={state.phase === 'paused' ? 'play' : 'pause'} /></button>
          <button className="ib big" aria-label="Phrase suivante" onClick={() => run!.next()}><Icon name="next" /></button>
        </div>
        <div className="lr-sub"><button className="ra-end" onClick={() => run!.again()}>Relire cette phrase</button><button className="ra-end" onClick={() => run!.finish()}>Terminer</button></div>
      </footer>
    </div>
  );
}

function LongResults({ state, rTitle, onAgain }: { state: LrState; rTitle: string; onAgain: () => void }) {
  const nav = useNavigate();
  const sp = useSpeaker();
  const s = useMemo(() => summarizeText(state.sentences), [state.sentences]);
  return (
    <div className="ra-res">
      <section className="ra-score">
        <div className="ring" style={{ ['--p' as string]: s.score }}><b>{s.judged ? <>{s.score}<small>%</small></> : '—'}</b></div>
        <div className="mid">
          <div className="t">{s.judged ? (s.score >= 85 ? 'Lecture fluide et juste' : s.score >= 60 ? 'Bonne lecture, quelques mots à revoir' : 'On reprend les mots difficiles') : 'Lecture terminée'}</div>
          <div className="s">{rTitle}</div>
          {s.judged ? <div className="chips"><span className="c ok">{s.ok} lus</span><span className="c near">{s.near} déformés</span><span className="c ko">{s.missed} manqués</span>{s.none > 0 && <span className="c">{s.none} non jugés</span>}</div> : <div className="xs mut">La reconnaissance vocale n’a rien rendu : seuls le débit et les pauses sont mesurés.</div>}
          <div className="xs mut">{s.perMin ? `${s.perMin} syllabes / min de parole · ` : ''}{s.pauses} pause{s.pauses > 1 ? 's' : ''} en milieu de phrase{s.longPauses ? ` (dont ${s.longPauses} longue${s.longPauses > 1 ? 's' : ''})` : ''}</div>
        </div>
      </section>
      <p className="note plain sm mt-3">Repère : un Thaï lit à voix haute autour de 250 à 300 syllabes par minute. Au début, la justesse compte plus que la vitesse. Les tons ne sont pas notés dans la lecture enchaînée : travaillez-les au tapis de lecture.</p>

      <div className="h2">Le texte</div>
      <div className="lr-text res">
        {state.sentences.map((se, i) => <p key={i} className="th" lang="th">{se.words.map((w, k) => <span key={k} className={`w ${se.results[k].verdict}`} title={VERDICT_FR[se.results[k].verdict]}>{w.thai}</span>)}</p>)}
      </div>
      <p className="xs mut">Vert : lu · ambre : déformé · rouge : manqué · gris : non jugé.</p>

      {s.problems.length > 0 && (
        <>
          <div className="h2">Mots à retravailler</div>
          <div className="list ra-seq">
            {s.problems.slice(0, 20).map((p) => (
              <div key={p.word.thai} className={`row ra-line ${p.verdict === 'missed' ? 'ko' : 'near'}`}>
                <i className={`dot ${p.verdict === 'missed' ? 'ko' : 'near'}`} />
                <span className="mid"><span className="pair"><span className="exp" lang="th">{p.word.thai}</span>{p.heard && p.verdict === 'near' && <><span className="arr">→</span><span className="got" lang="th">{p.heard}</span></>}</span><span className="s">{p.word.rom}{p.word.gloss ? ` · ${p.word.gloss}` : ''}</span><span className="why">{VERDICT_FR[p.verdict]}</span></span>
                <span className="end"><button className="ib sm" aria-label={`Écouter ${p.word.thai}`} onClick={() => sp.speak(p.word.thai)}><Icon name="speaker" size={16} /></button></span>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="ra-actions">
        {s.problems.length > 0 && <button className="btn" onClick={() => nav('/read/errors?mode=listen')}><Icon name="target" /> S’entraîner sur ces mots</button>}
        <button className="btn soft" onClick={onAgain}><Icon name="rotate" /> Relire le texte</button>
        <button className="btn ghost" onClick={() => nav('/read')}>Retour</button>
      </div>
    </div>
  );
}
