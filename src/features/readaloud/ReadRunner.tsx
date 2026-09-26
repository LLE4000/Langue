/**
 * Lire à voix haute — le tapis de lecture. Une syllabe en très grand au centre, les suivantes à droite, les lues
 * à gauche avec leur verdict (point vert, ambre ou rouge). Aucune fenêtre entre deux lectures : on lit, le tapis
 * avance. En bas, à portée de pouce : réécouter, pause, passer.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore, emptyReadAloud } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { activePack } from '@/content/packs';
import { ITEMS } from '@/content/th';
import { raSession } from '@/engine/readaloud/program';
import { summarize } from '@/engine/readaloud/queue';
import type { RaItem } from '@/engine/readaloud/compose';
import { MicStream, toneOfSegment } from '@/engine/audio/stream';
import { PitchBaseline } from '@/engine/audio/pitch';
import { ContinuousRecognizer } from '@/engine/audio/mic';
import { assessPronunciation, azureConfig } from '@/engine/audio/azure';
import { visualLength } from '@/engine/thai/script';
import { Icon, Segmented } from '@/components/ui';
import { RaRun, type RaMode, type RunState } from './run';
import { chronoSeries, errorsSeries, raPrefs, saveRaPrefs } from './data';
import { MODE_INFO } from './ReadHub';
import { ReadResults } from './ReadResults';

/** Taille du texte au centre : très grand pour une syllabe, réduit pour un mot long. */
function bigSize(it: RaItem): number {
  const n = visualLength(it.thai);
  if (it.kind === 'phrase') return Math.max(30, Math.min(44, 520 / Math.max(8, n)));
  return Math.round(Math.max(48, Math.min(it.kind === 'word' ? 96 : 128, 270 / Math.max(1.8, n * 0.62))));
}

function useWakeLock(on: boolean) {
  useEffect(() => {
    if (!on) return;
    let lock: { release(): Promise<void> } | null = null, gone = false;
    const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => { lock = l; if (gone) l.release(); }).catch(() => {});
    return () => { gone = true; lock?.release().catch(() => {}); };
  }, [on]);
}

export function ReadRunner() {
  const { id = '' } = useParams();
  const [qs] = useSearchParams();
  const nav = useNavigate();
  const sp = useSpeaker();
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const record = useStore((s) => s.recordReadAloud);
  const session = raSession(id);
  const [prefs, setPrefs] = useState(raPrefs());
  const initialMode = (qs.get('mode') as RaMode) || (id === 'chrono' ? 'chrono' : prefs.mode);
  const [mode, setMode] = useState<RaMode>(id === 'chrono' ? 'chrono' : initialMode);
  const [runKey, setRunKey] = useState(0);
  // la série est figée au montage (et à chaque « recommencer »)
  const items = useMemo(() => {
    const seed = `${id}-${Date.now()}`;
    if (id === 'errors') return errorsSeries(ra, seed);
    if (id === 'chrono') return chronoSeries(ra, seed);
    return session?.items ?? [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, runKey]);
  const title = id === 'errors' ? 'Mes erreurs' : id === 'chrono' ? 'Chrono' : session ? `Séance ${session.n} · ${session.title}` : 'Lecture';

  const runRef = useRef<RaRun | null>(null);
  const [run, setRun] = useState<RaRun | null>(null);
  const create = () => {
    runRef.current?.release();
    const baseline = new PitchBaseline(); // registre de la voix, appris pendant la série
    const r = new RaRun(items, mode, {
      speak: (t, onend) => sp.speak(t, { onend }),
      cancelSpeak: () => sp.cancel(),
      mic: MicStream.supported ? new MicStream() : null,
      asr: new ContinuousRecognizer(activePack().speechLang).supported ? new ContinuousRecognizer(activePack().speechLang) : null,
      azure: azureConfig(),
      assess: assessPronunciation,
      pitch: (samples, it) => toneOfSegment(samples, it.tone, baseline),
      now: () => performance.now(),
    }, { tempo: prefs.tempo, chronoMs: 60000 });
    runRef.current = r;
    setRun(r);
    return r;
  };
  useEffect(() => () => runRef.current?.release(), []);
  const state = useSyncExternalStore((cb) => run?.subscribe(cb) ?? (() => {}), () => run?.state ?? null, () => null);
  useWakeLock(state?.phase === 'running');

  // bilan enregistré une fois, après les derniers jugements
  const saved = useRef<RaRun | null>(null);
  useEffect(() => {
    if (!run || state?.phase !== 'done' || saved.current === run) return;
    const t = setTimeout(() => {
      saved.current = run;
      const s = summarize(run.state.queue);
      const judged = s.ok + s.near + s.ko;
      if (!judged && !s.total) return;
      record({
        sessionId: session?.id, label: `Lecture à voix haute · ${title}`,
        minutes: Math.max(1, Math.round(((run.state.endedAt ?? 0) - run.state.startedAt) / 60000)),
        ok: s.ok, total: judged,
        tags: Object.fromEntries(Object.entries(s.tags).filter(([k]) => !/^(c|v|rule):/.test(k) || ITEMS[k])),
        items: run.state.queue.map((q) => ({ key: q.item.key, thai: q.item.thai, rom: q.item.rom, verdict: q.result?.verdict ?? 'none', detail: q.result?.detail })),
      });
    }, 1900);
    return () => clearTimeout(t);
  }, [run, state?.phase, record, session?.id, title]);

  const leave = () => { runRef.current?.release(); nav('/read'); };

  if (!items.length) {
    return (
      <FullScreen title={title} onBack={() => nav('/read')}>
        <div className="empty mt-6"><span className="e" aria-hidden="true"><Icon name="checkCircle" /></span>{id === 'errors' ? 'Aucune lecture à reprendre pour l’instant : les syllabes ratées apparaîtront ici après une séance.' : 'Cette série est introuvable.'}</div>
        <button className="btn soft mt-4" onClick={() => nav('/read')}>Retour au programme</button>
      </FullScreen>
    );
  }

  // ----- avant de commencer -----
  if (!state || state.phase === 'ready' || state.phase === 'starting') {
    const setP = (p: Partial<typeof prefs>) => { saveRaPrefs(p); setPrefs({ ...prefs, ...p }); };
    return (
      <FullScreen title={title} onBack={() => nav('/read')}>
        <div className="ra-intro">
          <span className="eyebrow">{session ? session.stage : 'Lire à voix haute'}</span>
          <h2 className="theory-title">{id === 'errors' ? 'Mes erreurs' : id === 'chrono' ? 'Une minute chrono' : session?.title}</h2>
          <p className="theory-sub">{id === 'errors' ? 'Les syllabes qui vous ont posé problème, jusqu’à ce qu’elles passent.' : id === 'chrono' ? 'Lisez le plus de syllabes possible en une minute, sans sacrifier la justesse.' : session?.focus}</p>
          <div className="ra-sample" lang="th" aria-hidden="true">{items.slice(0, 5).map((it, k) => <span key={k} className={k ? '' : 'first'}>{it.thai}</span>)}</div>
          {mode !== 'chrono' && (
            <>
              <Segmented value={mode as RaMode} options={(Object.keys(MODE_INFO) as ('listen' | 'read' | 'auto')[]).map((m) => ({ v: m as RaMode, label: MODE_INFO[m].label }))} onChange={(m) => { setMode(m); if (m !== 'chrono') setP({ mode: m }); }} />
              <p className="mdesc">{MODE_INFO[mode as 'listen'].desc}</p>
              {mode === 'auto' && <Segmented value={prefs.tempo} options={[{ v: 'slow', label: 'Lent' }, { v: 'mid', label: 'Moyen' }, { v: 'fast', label: 'Rapide' }]} onChange={(tempo) => setP({ tempo })} />}
            </>
          )}
          <ul className="ra-tips">
            <li><Icon name="mic" size={18} /> Lisez à voix haute, sans toucher l’écran : le tapis avance quand vous vous arrêtez.</li>
            <li><Icon name="phone" size={18} /> Téléphone à 20–30 cm, dans un endroit calme.</li>
            <li><Icon name="rotate" size={18} /> Une lecture ratée revient quelques syllabes plus loin.</li>
          </ul>
          <button className="btn big" disabled={state?.phase === 'starting'} onClick={() => (runRef.current && runRef.current.state.phase === 'ready' ? runRef.current : create()).start()}>
            <Icon name="mic" /> {state?.phase === 'starting' ? 'Ouverture du micro…' : `Démarrer · ${items.length} lectures`}
          </button>
        </div>
      </FullScreen>
    );
  }

  if (state.phase === 'done') {
    return (
      <FullScreen title={title} onBack={leave}>
        <ReadResults state={state} title={title} sessionId={session?.id} onAgain={() => { setRunKey((k) => k + 1); setRun(null); }} />
      </FullScreen>
    );
  }
  return <Belt run={run!} state={state} title={title} onClose={leave} rom={prefs.rom} setRom={(rom) => { saveRaPrefs({ rom }); setPrefs({ ...prefs, rom }); }} />;
}

/** Le tapis : fenêtre de lectures autour de la position courante. */
function Belt({ run, state, title, onClose, rom, setRom }: { run: RaRun; state: RunState; title: string; onClose: () => void; rom: boolean; setRom: (v: boolean) => void }) {
  const { pos, queue } = state;
  const cur = queue[pos]?.item;
  const vertical = cur?.kind === 'phrase';
  const showRom = rom || state.mode === 'listen';
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => { if (state.mode !== 'chrono') return; const t = setInterval(() => setNow(performance.now()), 250); return () => clearInterval(t); }, [state.mode]);
  const left = state.chronoEnd ? Math.max(0, Math.ceil((state.chronoEnd - now) / 1000)) : 0;
  const done = queue.slice(0, pos).filter((s) => s.result && s.result.verdict !== 'none');
  const okN = done.filter((s) => s.result!.verdict === 'ok').length;
  const flash = state.flash && state.flash.j.verdict !== 'ok' && state.flash.j.verdict !== 'none' && pos - state.flash.index <= 3 ? state.flash : null;
  const win: number[] = [];
  for (let k = Math.max(0, pos - 3); k < Math.min(queue.length, pos + (vertical ? 3 : 5)); k++) win.push(k);

  return (
    <div className={`app ra-app ${state.phase === 'paused' ? 'paused' : ''}`}>
      <header className="ltop">
        <button className="tb" aria-label="Quitter" onClick={onClose}><Icon name="close" /></button>
        <div className="lbar" role="progressbar" aria-label={`Progression : ${title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((100 * pos) / Math.max(1, queue.length))}><i style={{ width: `${Math.round((100 * pos) / Math.max(1, queue.length))}%` }} /></div>
        <span className="ra-count">{state.mode === 'chrono' ? `${left} s` : `${Math.min(pos + 1, queue.length)} / ${queue.length}`}</span>
        <button className={`tb ${showRom ? 'on' : ''}`} aria-pressed={showRom} aria-label="Afficher la phonétique" onClick={() => setRom(!rom)} disabled={state.mode === 'listen'}><Icon name="eye" /></button>
      </header>

      <main className={`ra-stage ${vertical ? 'v' : 'h'}`} onClick={() => run.skip()} aria-live="polite">
        <div className={`ra-belt ${vertical ? 'v' : 'h'} ${cur?.kind === 'word' ? 'w' : ''}`}>
          {win.map((k) => {
            const o = k - pos, s = queue[k];
            const v = s.result?.verdict;
            return (
              <div key={k} className={`ra-s o${Math.max(-3, Math.min(4, o))} ${o === 0 && state.voice ? 'voice' : ''}`} style={o === 0 ? { fontSize: bigSize(s.item) } : undefined} lang="th" aria-hidden={o !== 0}>
                <span className="g">{s.item.thai}</span>
                {o < 0 && <i className={`dot ${v ?? 'wait'}`} />}
              </div>
            );
          })}
        </div>
        <div className="ra-under">
          {cur && showRom && <div className="rom lg">{cur.rom}</div>}
          {cur?.meaning && (cur.kind !== 'syl') && <div className="mean">{cur.meaning}</div>}
          <div className="ra-cue">{state.modelPlaying ? <><Icon name="speaker" size={16} /> Écoutez…</> : state.voice ? <><span className="lv" /> On vous entend</> : state.phase === 'paused' ? 'En pause' : state.mic || state.asr === 'ok' ? 'À vous' : 'Touchez l’écran pour avancer'}</div>
          {flash && <div key={flash.index} className={`ra-flash ${flash.j.verdict}`}><span lang="th">{flash.j.heard && flash.j.heard !== queue[flash.index]?.item.thai ? flash.j.heard : queue[flash.index]?.item.thai}</span>{flash.j.detail && <> · {flash.j.detail}</>}</div>}
        </div>
      </main>

      <footer className="ra-ctrl">
        <div className="ra-status">
          <span className={state.mic ? 'on' : ''}><Icon name="mic" size={14} />{state.mic ? 'micro ouvert' : 'sans micro'}</span>
          {state.asr !== 'off' && <span className={state.asr === 'ok' ? 'on' : ''}>reconnaissance {state.asr === 'ok' ? 'active' : state.asr === 'silent' ? 'muette' : '…'}</span>}
          {state.azure !== 'off' && <span className={state.azure === 'on' ? 'on' : 'ko'}>Azure</span>}
          {done.length > 0 && <span>{okN} / {done.length} justes</span>}
        </div>
        {state.notice && <p className="ra-notice">{state.notice}</p>}
        <div className="ra-btns">
          <button className="ib big" aria-label="Réécouter le modèle" onClick={() => run.replay()}><Icon name="speaker" /></button>
          <button className="ra-main" aria-label={state.phase === 'paused' ? 'Reprendre' : 'Pause'} onClick={() => (state.phase === 'paused' ? run.resume() : run.pause())}><Icon name={state.phase === 'paused' ? 'play' : 'pause'} /></button>
          <button className="ib big" aria-label="Passer" onClick={() => run.skip()}><Icon name="next" /></button>
        </div>
        <button className="ra-end" onClick={() => run.finish()}>Terminer et voir le bilan</button>
      </footer>
    </div>
  );
}
