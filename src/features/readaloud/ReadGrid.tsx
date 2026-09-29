/**
 * Grille de lecture (route /read/grid) : des consonnes en lignes, des voyelles en colonnes, tirées au sort, et l'on
 * lit toute la grille à voix haute — comme au tableau avec un professeur (« ขา ขี ขู เข… »).
 *
 * Avant : les réglages (classe de consonnes, voyelles, marques, finales, taille, ordre) et la grille elle-même ;
 * chaque case se touche pour l'entendre. Pendant : la case à lire est cerclée, les cases lues prennent la couleur
 * du verdict ; même moteur que le tapis (micro continu, reconnaissance, courbe du ton, Azure s'il est là).
 * Après : la grille colorée, les cases à reprendre, et le bilan détaillé du tapis.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FullScreen } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { ITEMS } from '@/content/th';
import { summarize } from '@/engine/readaloud/queue';
import type { RaItem } from '@/engine/readaloud/compose';
import { buildGrid, CONS_LABEL, CONS_SETS, GRID_DEFAULT, gridItems, gridQuery, parseGridQuery, VOWEL_LABEL, vowelHead, type Grid, type GridConfig, type GridCons, type GridVowels } from '@/engine/readaloud/grid';
import { Icon, Rom, Segmented } from '@/components/ui';
import type { RaMode, RaRun, RunState } from './run';
import { raPrefs, saveRaPrefs } from './data';
import { MODE_INFO } from './ReadHub';
import { newRaRun, useWakeLock } from './ReadRunner';
import { ReadResults } from './ReadResults';

const PREF_KEY = 'langue.grid';
const loadCfg = (): GridConfig => { try { return { ...GRID_DEFAULT, ...JSON.parse(localStorage.getItem(PREF_KEY) ?? '{}') }; } catch { return GRID_DEFAULT; } };
const saveCfg = (c: GridConfig) => { try { localStorage.setItem(PREF_KEY, JSON.stringify(c)); } catch { /* stockage indisponible */ } };
const newSeed = () => Math.random().toString(36).slice(2, 8);

type Verdict = 'ok' | 'near' | 'ko' | 'none';

/** Dernier verdict de chaque case (une case ratée revient plus loin : c'est la dernière lecture qui compte). */
function verdicts(state: RunState | null): Map<string, Verdict> {
  const m = new Map<string, Verdict>();
  if (!state) return m;
  for (const s of state.queue) if (s.result) m.set(s.item.key, s.result.verdict as Verdict);
  return m;
}

function GridTable({ grid, showRom, heads, current, marks, onCell }: { grid: Grid; showRom: boolean; heads: boolean; current?: string; marks: Map<string, Verdict>; onCell: (it: RaItem) => void }) {
  const n = grid.cols.length;
  return (
    <div className={`rg-grid n${n} ${heads ? '' : 'noheads'}`} role="grid" aria-label="Grille de lecture">
      {heads && <div className="rg-corner" aria-hidden="true" />}
      {heads && grid.cols.map((v) => <div key={v} className="rg-head col" lang="th" role="columnheader">{vowelHead(v)}</div>)}
      {grid.rows.map((c, r) => (
        <div key={c} className="rg-row" role="row">
          {heads && <div className="rg-head row" lang="th" role="rowheader">{c}</div>}
          {grid.cells[r].map((it, k) => {
            if (!it) return <div key={k} className="rg-cell empty" aria-hidden="true" />;
            const v = marks.get(it.key);
            return (
              <button key={k} role="gridcell" className={`rg-cell ${v ? 'v-' + v : ''} ${current === it.key ? 'cur' : ''}`} onClick={() => onCell(it)} aria-label={`${it.thai}, ${it.rom}`}>
                <span className="g" lang="th">{it.thai}</span>
                {showRom && <Rom text={it.rom} className="xs" />}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export function ReadGrid() {
  const nav = useNavigate();
  const sp = useSpeaker();
  const srs = useStore((s) => s.srs);
  const record = useStore((s) => s.recordReadAloud);
  const [qs, setQs] = useSearchParams();
  const [fromUrl] = useState(() => (qs.get('s') ? parseGridQuery(qs) : null)); // lien partagé : grille imposée, réglages repliés
  const [cfg, setCfg] = useState<GridConfig>(fromUrl?.cfg ?? loadCfg());
  const [seed, setSeed] = useState(fromUrl?.seed ?? newSeed());
  const [prefs, setPrefs] = useState(raPrefs());
  const [mode, setMode] = useState<RaMode>(prefs.mode === 'auto' ? 'read' : prefs.mode);
  const [showRom, setShowRom] = useState(false);
  const [heads, setHeads] = useState(true);
  const [only, setOnly] = useState<string[] | null>(null); // relire seulement les cases ratées
  const known = useMemo(() => Object.keys(srs).filter((k) => k.startsWith('c:')).map((k) => k.slice(2)).filter((c) => CONS_SETS.all.includes(c)), [srs]);
  const grid = useMemo(() => buildGrid(cfg, seed, known), [cfg, seed, known]);
  useEffect(() => { setQs(gridQuery(cfg, seed), { replace: true }); saveCfg(cfg); }, [cfg, seed, setQs]);

  const runRef = useRef<RaRun | null>(null);
  const [run, setRun] = useState<RaRun | null>(null);
  const state = useSyncExternalStore((cb) => run?.subscribe(cb) ?? (() => {}), () => run?.state ?? null, () => null);
  useWakeLock(state?.phase === 'running');
  useEffect(() => () => runRef.current?.release(), []);
  const marks = useMemo(() => verdicts(state), [state]);

  const start = (keys: string[] | null) => {
    runRef.current?.release();
    const items = gridItems(grid).filter((it) => !keys || keys.includes(it.key));
    const r = newRaRun(items, mode, sp, prefs.tempo);
    runRef.current = r; setRun(r); setOnly(keys);
    r.start();
  };
  const change = (p: Partial<GridConfig>) => { runRef.current?.release(); setRun(null); setCfg({ ...cfg, ...p }); };
  const redraw = () => { runRef.current?.release(); setRun(null); setSeed(newSeed()); };
  const hear = (it: RaItem) => { if (!state || state.phase === 'paused' || state.phase === 'done' || state.phase === 'ready') sp.speak(it.thai); };

  // bilan enregistré une fois
  const saved = useRef<RaRun | null>(null);
  useEffect(() => {
    if (!run || state?.phase !== 'done' || saved.current === run) return;
    const t = setTimeout(() => {
      saved.current = run;
      const s = summarize(run.state.queue);
      const judged = s.ok + s.near + s.ko;
      if (!judged) return;
      record({
        label: 'Grille de lecture', minutes: Math.max(1, Math.round(((run.state.endedAt ?? 0) - run.state.startedAt) / 60000)), ok: s.ok, total: judged,
        tags: Object.fromEntries(Object.entries(s.tags).filter(([k]) => !/^(c|v|rule):/.test(k) || ITEMS[k])),
        items: run.state.queue.map((q) => ({ key: q.item.key, thai: q.item.thai, rom: q.item.rom, verdict: q.result?.verdict ?? 'none', detail: q.result?.detail })),
      });
    }, 1900);
    return () => clearTimeout(t);
  }, [run, state?.phase, record]);

  const [detail, setDetail] = useState(false);
  const running = state && (state.phase === 'running' || state.phase === 'paused' || state.phase === 'starting');
  const cur = running ? state.queue[state.pos]?.item : undefined;

  if (state?.phase === 'done' && detail) {
    return <FullScreen title="Grille de lecture" onBack={() => setDetail(false)}><ReadResults state={state} title="Grille de lecture" onAgain={() => { setDetail(false); start(only); }} /></FullScreen>;
  }

  const total = gridItems(grid).filter((it) => !only || only.includes(it.key)).length;
  // bilan par case (une case ratée puis relue juste compte comme juste : c'est la dernière lecture qui compte)
  const cellsIn = gridItems(grid).filter((it) => !only || only.includes(it.key));
  const s = state?.phase === 'done' ? { ok: cellsIn.filter((it) => marks.get(it.key) === 'ok').length, near: cellsIn.filter((it) => marks.get(it.key) === 'near').length, ko: cellsIn.filter((it) => marks.get(it.key) === 'ko').length } : null;
  const missed = state?.phase === 'done' ? [...marks].filter(([, v]) => v === 'ko' || v === 'near').map(([k]) => k) : [];

  return (
    <FullScreen title="Grille de lecture" onBack={() => { runRef.current?.release(); nav('/read'); }} right={<button className={`tb ${showRom ? 'on' : ''}`} aria-pressed={showRom} aria-label="Afficher la phonétique" onClick={() => setShowRom(!showRom)}><Icon name="eye" /></button>}>
      {!running && state?.phase !== 'done' && (
        <details className="rg-settings" open={!fromUrl}>
          <summary><span className="t">Réglages</span><span className="s">{CONS_LABEL[cfg.cons].split(' · ')[0]} · {VOWEL_LABEL[cfg.vowels].split(' · ')[0]}{cfg.marks ? ' · marques' : ''}{cfg.finals !== 'none' ? ` · finales ${cfg.finals === 'live' ? 'vivantes' : 'mortes'}` : ''} · {cfg.size}×{cfg.size}</span></summary>
          <label className="f">Consonnes</label>
          <div className="chips">{(Object.keys(CONS_LABEL) as GridCons[]).map((c) => <button key={c} className={`chip ${cfg.cons === c ? 'on' : ''}`} disabled={c === 'known' && known.length < 3} onClick={() => change({ cons: c })}>{CONS_LABEL[c]}</button>)}</div>
          <label className="f">Voyelles</label>
          <div className="chips">{(Object.keys(VOWEL_LABEL) as GridVowels[]).map((v) => <button key={v} className={`chip ${cfg.vowels === v ? 'on' : ''}`} onClick={() => change({ vowels: v, finals: v === 'compound' ? 'none' : cfg.finals })}>{VOWEL_LABEL[v]}</button>)}</div>
          <label className="f">Tons</label>
          <Segmented value={cfg.marks} options={[{ v: false, label: 'Sans marque' }, { v: true, label: 'Avec ◌่ ◌้' }]} onChange={(marks) => change({ marks })} />
          <label className="f">Finale</label>
          <Segmented value={cfg.finals} options={[{ v: 'none', label: 'Sans' }, { v: 'live', label: 'น ม ง' }, { v: 'dead', label: 'ก ด บ' }]} onChange={(finals) => change({ finals })} />
          <label className="f">Taille et ordre</label>
          <Segmented value={cfg.size} options={[4, 5, 6].map((n) => ({ v: n as 4 | 5 | 6, label: `${n} × ${n}` }))} onChange={(size) => change({ size })} />
          <Segmented value={cfg.order} options={[{ v: 'rows', label: 'Ligne par ligne' }, { v: 'random', label: 'Case au hasard' }]} onChange={(order) => change({ order })} />
        </details>
      )}

      {s && (
        <section className="ra-score rg-score" aria-live="polite">
          <div className="ring" style={{ ['--p' as string]: Math.round((100 * s.ok) / Math.max(1, s.ok + s.near + s.ko)) }}><b>{s.ok + s.near + s.ko ? Math.round((100 * s.ok) / (s.ok + s.near + s.ko)) : '—'}<small>{s.ok + s.near + s.ko ? '%' : ''}</small></b></div>
          <div className="mid"><div className="t">{s.ok} justes · {s.near} presque · {s.ko} à reprendre</div><div className="s">{s.ok + s.near + s.ko ? 'Touchez une case pour la réentendre.' : 'Rien n’a été jugé : le micro ou la reconnaissance n’ont pas répondu.'}</div></div>
        </section>
      )}

      <GridTable grid={grid} showRom={showRom || state?.phase === 'done'} heads={heads} current={cur?.key} marks={marks} onCell={hear} />

      {running && state ? (
        <div className="rg-run">
          <div className="rg-cue">{state.modelPlaying ? <><Icon name="speaker" size={16} /> Écoutez…</> : state.voice ? <><span className="lv" /> On vous entend</> : state.phase === 'paused' ? 'En pause' : state.mic || state.asr === 'ok' ? <>À vous : <b lang="th">{cur?.thai}</b></> : 'Touchez « passer » pour avancer'}</div>
          <div className="ra-btns">
            <button className="ib big" aria-label="Réécouter le modèle" onClick={() => run!.replay()}><Icon name="speaker" /></button>
            <button className="ra-main" aria-label={state.phase === 'paused' ? 'Reprendre' : 'Pause'} onClick={() => (state.phase === 'paused' ? run!.resume() : run!.pause())}><Icon name={state.phase === 'paused' ? 'play' : 'pause'} /></button>
            <button className="ib big" aria-label="Passer" onClick={() => run!.skip()}><Icon name="next" /></button>
          </div>
          <button className="ra-end" onClick={() => run!.finish()}>Terminer</button>
        </div>
      ) : state?.phase === 'done' ? (
        <div className="stack mt-4">
          {missed.length > 0 && <button className="btn" onClick={() => start(missed)}><Icon name="rotate" /> Relire les {missed.length} case{missed.length > 1 ? 's' : ''} à reprendre</button>}
          <button className={`btn ${missed.length ? 'soft' : ''}`} onClick={redraw}><Icon name="shuffle" /> Nouvelle grille</button>
          <button className="btn ghost" onClick={() => setDetail(true)}>Bilan détaillé</button>
        </div>
      ) : (
        <div className="rg-actions">
          <div className="row-flex rg-tools">
            <button className="btn soft sm auto" onClick={redraw}><Icon name="shuffle" size={16} /> Tirer au sort</button>
            <button className={`btn ghost sm auto ${heads ? '' : 'on'}`} aria-pressed={!heads} onClick={() => setHeads(!heads)}>{heads ? 'Cacher les en-têtes' : 'Montrer les en-têtes'}</button>
          </div>
          <Segmented value={mode} options={(['listen', 'read'] as const).map((m) => ({ v: m as RaMode, label: MODE_INFO[m].label }))} onChange={(m) => { setMode(m); saveRaPrefs({ mode: m as 'listen' | 'read' }); setPrefs({ ...prefs, mode: m as 'listen' }); }} />
          <p className="mdesc">{mode === 'listen' ? 'La voix thaïe lit chaque case, puis vous la répétez.' : 'Vous lisez chaque case ; la suivante s’entoure dès que vous vous arrêtez.'} Touchez une case pour l’entendre.</p>
          <button className="btn big" onClick={() => start(null)}><Icon name="mic" /> Lire la grille · {total} cases</button>
        </div>
      )}
    </FullScreen>
  );
}
