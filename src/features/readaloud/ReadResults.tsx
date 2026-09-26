/**
 * Bilan d'une série de lecture à voix haute : le score, le rythme, ce qu'il faut retravailler (par lecture et par
 * consonne / voyelle / ton), puis toute la séquence : attendu ↔ reconnu, avec la raison et sa propre voix à réécouter.
 */
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpeaker } from '@/app/services/speech';
import { summarize } from '@/engine/readaloud/queue';
import { toneFr } from '@/engine/readaloud/compose';
import { raProgram } from '@/engine/readaloud/program';
import { wavBlob } from '@/engine/audio/vad';
import { ITEMS } from '@/content/th';
import type { ToneId } from '@/content/types';
import { Icon, Segmented } from '@/components/ui';
import type { RunState } from './run';

const VERDICT: Record<string, string> = { ok: 'Juste', near: 'Approximatif', ko: 'À revoir', none: 'Non jugé' };
const SOURCE: Record<string, string> = { asr: 'reconnaissance', azure: 'Azure', pitch: 'courbe de la voix', self: 'passée' };

/** Libellé lisible d'une étiquette de maîtrise. */
function tagLabel(t: string): { group: string; label: string } | null {
  if (t.startsWith('c:')) return { group: 'Consonnes', label: t.slice(2) };
  if (t.startsWith('v:')) return { group: 'Voyelles', label: t.slice(2).replace('–', '◌') };
  if (t.startsWith('tone:')) return { group: 'Tons', label: toneFr(t.slice(5) as ToneId) };
  if (t.startsWith('f:')) return { group: 'Finales', label: t.slice(2) };
  if (t === 'syl:live') return { group: 'Syllabes', label: 'vivantes' };
  if (t === 'syl:dead') return { group: 'Syllabes', label: 'mortes' };
  return null;
}

export function ReadResults({ state, title, sessionId, onAgain }: { state: RunState; title: string; sessionId?: string; onAgain: () => void }) {
  const nav = useNavigate();
  const sp = useSpeaker();
  const s = useMemo(() => summarize(state.queue), [state.queue]);
  const [filter, setFilter] = useState<'all' | 'bad'>('bad');
  const audio = useRef<HTMLAudioElement | null>(null);
  const judged = s.ok + s.near + s.ko;
  const pct = judged ? Math.round((100 * s.ok) / judged) : 0;
  const secs = Math.max(1, ((state.endedAt ?? 0) - state.startedAt) / 1000);
  const perMin = Math.round((state.queue.length / secs) * 60);
  const program = raProgram();
  const idx = sessionId ? program.findIndex((p) => p.id === sessionId) : -1;
  const nextS = idx >= 0 ? program[idx + 1] : undefined;
  const playMine = (k: number) => {
    const seg = state.audio[k]?.seg;
    if (!seg) return;
    audio.current?.pause();
    const a = new Audio(URL.createObjectURL(wavBlob(seg.samples)));
    audio.current = a;
    a.play().catch(() => {});
  };
  // maîtrise par groupe : seulement ce qui a été lu au moins deux fois, les plus fragiles d'abord
  const groups = useMemo(() => {
    const g: Record<string, { label: string; ok: number; n: number }[]> = {};
    for (const [t, v] of Object.entries(s.tags)) { const l = tagLabel(t); if (!l || v.n < 2) continue; (g[l.group] ??= []).push({ label: l.label, ...v }); }
    for (const k of Object.keys(g)) g[k].sort((a, b) => a.ok / a.n - b.ok / b.n);
    return g;
  }, [s.tags]);
  const rows = state.queue.map((q, k) => ({ q, k })).filter(({ q }) => filter === 'all' || (q.result && q.result.verdict !== 'ok'));

  return (
    <div className="ra-res">
      <section className="ra-score">
        <div className="ring" style={{ ['--p' as string]: pct }}><b>{pct}<small>%</small></b></div>
        <div className="mid">
          <div className="t">{pct >= 80 ? 'Très bonne lecture' : pct >= 55 ? 'Bonne base, à consolider' : judged ? 'On reprend les points fragiles' : 'Série terminée'}</div>
          <div className="s">{title}</div>
          <div className="chips"><span className="c ok">{s.ok} justes</span><span className="c near">{s.near} approx.</span><span className="c ko">{s.ko} à revoir</span>{s.none > 0 && <span className="c">{s.none} non jugées</span>}</div>
          <div className="xs mut">{state.queue.length} lectures · {Math.round(secs / 60) || '< 1'} min · {perMin} lectures / min</div>
        </div>
      </section>

      {s.weak.length > 0 && (
        <>
          <div className="h2">À retravailler</div>
          <div className="ra-weak">
            {s.weak.slice(0, 12).map((w) => (
              <button key={w.item.key} className={`chip ${w.lastVerdict === 'ok' ? 'fixed' : ''}`} onClick={() => sp.speak(w.item.thai)}>
                <span className="th" lang="th">{w.item.thai}</span><span className="xs">{w.item.rom}{w.lastVerdict === 'ok' ? ' · corrigée' : ''}</span>
              </button>
            ))}
          </div>
          {s.weak.some((w) => w.details.length) && <ul className="ra-why">{[...new Set(s.weak.flatMap((w) => w.details))].slice(0, 5).map((d) => <li key={d}>{d}</li>)}</ul>}
        </>
      )}

      {Object.keys(groups).length > 0 && (
        <>
          <div className="h2">Ce que vous maîtrisez</div>
          {Object.entries(groups).map(([g, list]) => (
            <div key={g} className="ra-tags">
              <span className="k">{g}</span>
              <span className="v">{list.slice(0, 14).map((x) => <span key={x.label} className={`tg ${x.ok / x.n >= 0.8 ? 'ok' : x.ok / x.n >= 0.5 ? 'near' : 'ko'}`} lang={g === 'Consonnes' || g === 'Voyelles' || g === 'Finales' ? 'th' : undefined}>{x.label}<small>{x.ok}/{x.n}</small></span>)}</span>
            </div>
          ))}
        </>
      )}

      <div className="h2">La séquence <span className="sp" /><Segmented value={filter} options={[{ v: 'bad', label: 'Erreurs' }, { v: 'all', label: 'Tout' }]} onChange={setFilter} /></div>
      {rows.length ? (
        <div className="list ra-seq">
          {rows.map(({ q, k }) => {
            const r = q.result;
            const heardOther = r?.heard && r.heard !== q.item.thai;
            const meaning = q.item.meaning ?? (q.item.kind === 'syl' ? ITEMS['w:' + q.item.thai]?.meaning.fr.split(';')[0] : undefined);
            return (
              <div key={k} className={`row ra-line ${r?.verdict ?? 'none'}`}>
                <i className={`dot ${r?.verdict ?? 'none'}`} aria-label={VERDICT[r?.verdict ?? 'none']} />
                <span className="mid">
                  <span className="pair"><span className="exp" lang="th">{q.item.thai}</span>{heardOther && <><span className="arr">→</span><span className="got" lang="th">{r!.heard}</span></>}</span>
                  <span className="s">{q.item.rom}{r?.heardRom && heardOther ? ` → ${r.heardRom}` : ''}{meaning ? ` · ${meaning}` : ''}</span>
                  {r && r.verdict !== 'ok' && <span className="why">{r.detail ?? (r.verdict === 'none' ? 'Non jugé : voix trop brève ou trop bruitée' : VERDICT[r.verdict])}{r.source && r.verdict !== 'none' ? ` · ${SOURCE[r.source]}` : ''}{q.retry ? ' · reprise' : ''}</span>}
                </span>
                <span className="end">
                  <button className="ib sm" aria-label={`Écouter ${q.item.thai}`} onClick={() => sp.speak(q.item.thai)}><Icon name="speaker" size={16} /></button>
                  {state.audio[k]?.seg && <button className="ib sm" aria-label="Réécouter ma voix" onClick={() => playMine(k)}><Icon name="mic" size={16} /></button>}
                </span>
              </div>
            );
          })}
        </div>
      ) : <p className="note info sm">Aucune erreur dans cette série.</p>}

      <div className="ra-actions">
        {s.weak.some((w) => w.lastVerdict !== 'ok') && <button className="btn" onClick={() => nav('/read/errors?mode=read')}><Icon name="target" /> Reprendre mes erreurs</button>}
        {nextS && pct >= 80 && <button className="btn" onClick={() => nav(`/read/${nextS.id}`)}>Séance suivante : {nextS.title} <Icon name="next" /></button>}
        <button className="btn soft" onClick={onAgain}><Icon name="rotate" /> Recommencer</button>
        <button className="btn ghost" onClick={() => nav('/read')}>Retour au programme</button>
      </div>
    </div>
  );
}
