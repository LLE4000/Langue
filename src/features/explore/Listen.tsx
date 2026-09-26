/**
 * Écoute en boucle — « mode voiture » : les lettres (ou les voyelles, ou mes mots) sont lues l'une après l'autre,
 * chacune à vitesse normale puis lente (puis très lente), en boucle, sans toucher l'écran.
 * On peut se limiter à quelques lettres (ป / พ…) pour entendre la différence, dire seulement le son (ปอ)
 * ou le nom entier (ปอ ปลา), mélanger, et « deviner d'abord » (le caractère apparaît après la première lecture).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { DEFAULT_LISTEN, useStore, type ListenPrefs } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { CONS_ITEMS, ITEMS, TAUGHT_VOWELS, th, vowelDisplay } from '@/content/th';
import { L } from '@/i18n';
import { Icon, Rom, Segmented, Thai, useToast, VoiceStatusNote } from '@/components/ui';
import { buildListenQueue, type ListenEntry } from './listen';

const GAP_TAKE = 550; // entre deux prises d'un même élément
const GAP_ENTRY = 1200; // entre deux éléments
const MAX_TAKE_MS = 7000; // garde-fou si le navigateur ne signale pas la fin

/** Garde l'écran allumé pendant la lecture (API Wake Lock, si disponible). */
function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    let lock: { release(): Promise<void> } | null = null;
    let gone = false;
    const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<{ release(): Promise<void> }> } };
    const ask = async () => { try { lock = (await nav.wakeLock?.request('screen')) ?? null; if (gone) await lock?.release(); } catch { /* refusé : tant pis */ } };
    ask();
    const onVis = () => { if (document.visibilityState === 'visible') ask(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { gone = true; document.removeEventListener('visibilitychange', onVis); lock?.release().catch(() => {}); };
  }, [active]);
}

export function Listen() {
  usePage('Écoute en boucle', { back: '/explore' });
  const [params, setParams] = useSearchParams();
  const sp = useSpeaker();
  const toast = useToast((s) => s.show);
  const srs = useStore((s) => s.srs);
  const saved = useStore((s) => s.settings.listen) ?? DEFAULT_LISTEN;
  const update = useStore((s) => s.updateSettings);
  const prefs: ListenPrefs = useMemo(() => ({ ...DEFAULT_LISTEN, ...saved }), [saved]);
  const setPrefs = useCallback((patch: Partial<ListenPrefs>) => update({ listen: { ...DEFAULT_LISTEN, ...useStore.getState().settings.listen, ...patch } }), [update]);

  // Arrivée depuis l'alphabet avec une sélection (?set=custom&ids=c:ป,c:พ)
  useEffect(() => {
    const set = params.get('set'), ids = params.get('ids');
    if (!set && !ids) return;
    const patch: Partial<ListenPrefs> = {};
    if (ids) { patch.custom = ids.split(',').filter((id) => ITEMS[id]); patch.set = 'custom'; }
    else if (set === 'cons' || set === 'vow' || set === 'words' || set === 'custom') patch.set = set;
    setPrefs(patch);
    setParams({}, { replace: true });
  }, [params, setParams, setPrefs]);

  const [seed, setSeed] = useState(() => Date.now());
  const queue: ListenEntry[] = useMemo(() => buildListenQueue(prefs, srs, seed), [prefs, srs, seed]);
  const [i, setI] = useState(0);
  const [take, setTake] = useState(-1); // prise en cours (-1 = aucune)
  const [on, setOn] = useState(false);
  const [revealed, setRevealed] = useState(true);
  const token = useRef(0);
  const iRef = useRef(0);
  const cur = queue[Math.min(i, Math.max(0, queue.length - 1))];
  useWakeLock(on);

  const stop = useCallback(() => { token.current++; setOn(false); setTake(-1); sp.cancel(); }, [sp]);
  useEffect(() => () => { token.current++; sp.cancel(); }, [sp]);
  // Changement de réglages ou de file : on repart proprement au début
  useEffect(() => { stop(); setI(0); iRef.current = 0; setRevealed(!prefs.guess); }, [queue, prefs.guess, stop]);

  const playEntry = useCallback((tok: number, k: number) => {
    if (tok !== token.current || !queue.length) return;
    const idx = ((k % queue.length) + queue.length) % queue.length;
    const entry = queue[idx];
    iRef.current = idx; setI(idx); setRevealed(!prefs.guess);
    const takes = entry.takes;
    const doTake = (t: number) => {
      if (tok !== token.current) return;
      if (t >= takes.length) { setTake(-1); setTimeout(() => playEntry(tok, idx + 1), GAP_ENTRY); return; }
      setTake(t);
      let done = false;
      const after = () => { if (done || tok !== token.current) return; done = true; setRevealed(true); setTimeout(() => doTake(t + 1), GAP_TAKE); };
      const ok = sp.speak(takes[t].text, { rate: takes[t].rate, onend: after });
      if (!ok) { stop(); toast(sp.status === 'unsupported' ? 'Ce navigateur ne propose pas la synthèse vocale.' : 'Aucune voix thaïlandaise détectée. Voir Profil › Réglages › Voix.'); return; }
      setTimeout(after, MAX_TAKE_MS);
    };
    doTake(0);
  }, [queue, prefs.guess, sp, stop, toast]);

  const play = () => { if (!queue.length) return; token.current++; setOn(true); playEntry(token.current, iRef.current); };
  const jump = (d: number) => { const was = on; stop(); const n = queue.length ? (((iRef.current + d) % queue.length) + queue.length) % queue.length : 0; iRef.current = n; setI(n); setRevealed(true); if (was) { token.current++; setOn(true); playEntry(token.current, n); } };

  const learnedCount = useMemo(() => buildListenQueue({ ...prefs, set: 'words' }, srs, 1).length, [prefs, srs]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const summary = [prefs.set === 'words' ? '' : prefs.what === 'sound' ? 'son seul' : prefs.what === 'name' ? 'nom entier' : 'son puis nom', ['normal', 'normal + lent', 'normal, lent, très lent'][prefs.speeds - 1], prefs.order === 'shuffle' ? 'mélangé' : 'dans l’ordre', prefs.guess ? 'deviner d’abord' : ''].filter(Boolean).join(' · ');
  const isLetter = cur && (cur.item.kind === 'cons' || cur.item.kind === 'vow');
  const label = cur ? (cur.item.kind === 'cons' ? `${cur.item.thai} ${cur.item.ref.nameWord}` : cur.item.kind === 'vow' ? vowelDisplay(cur.item.ref.form, 'อ') : cur.item.thai) : '';
  const toggleCustom = (id: string) => setPrefs({ set: 'custom', custom: prefs.custom.includes(id) ? prefs.custom.filter((x) => x !== id) : [...prefs.custom, id] });

  return (
    <>
      <VoiceStatusNote />
      <div className="stage listen-stage" aria-live="polite">
        <span className="tag">{queue.length ? `${i + 1} / ${queue.length}` : '—'}</span>
        {cur ? (
          <>
            <div className={`big ${isLetter ? 's1' : cur.item.thai.length > 8 ? 's4' : 's2'}`} style={{ color: cur.item.kind === 'cons' ? `var(--c-${cur.item.ref.cls})` : undefined }}>
              {revealed ? <Thai text={cur.item.kind === 'vow' ? vowelDisplay(cur.item.ref.form, 'อ') : cur.item.thai} /> : <span className="mut">?</span>}
            </div>
            {revealed && <div className="listen-sub"><Thai text={label} className="sm" style={{ fontSize: 22 }} /> <Rom text={cur.item.rom} /> <span className="mut">· {L(cur.item.meaning)}</span></div>}
            <div className="takes" aria-label="Lectures">{cur.takes.map((t, k) => <span key={k} className={`take ${k === take ? 'on' : k < take ? 'done' : ''}`}>{t.label}</span>)}</div>
          </>
        ) : (
          <div className="mut" style={{ padding: 20 }}>{prefs.set === 'words' ? 'Aucun mot appris pour l’instant : faites une leçon, ou écoutez les consonnes.' : 'Choisissez des lettres ci-dessous.'}</div>
        )}
      </div>
      <div className="audio">
        <button className="ib big" onClick={() => jump(-1)} aria-label="Précédent" disabled={!queue.length}><Icon name="back" /></button>
        <button className="ib big pri listen-play" onClick={on ? stop : play} aria-label={on ? 'Pause' : 'Lire en boucle'} disabled={!queue.length} data-testid="listen-play"><Icon name={on ? 'pause' : 'play'} /></button>
        <button className="ib big" onClick={() => jump(1)} aria-label="Suivant" disabled={!queue.length}><Icon name="next" /></button>
      </div>
      <p className="xs mut ctr" style={{ margin: '-2px 0 8px' }}>{on ? 'Lecture en boucle. L’écran reste allumé ; laissez l’application au premier plan.' : 'Lecture continue, en boucle, sans toucher l’écran : idéal en voiture ou en marchant.'}</p>

      <div className="h2">Quoi écouter</div>
      <div className="chips">
        {(['cons', 'vow', 'words', 'custom'] as const).map((s) => (
          <button key={s} className={`chip ${prefs.set === s ? 'on' : ''}`} onClick={() => setPrefs({ set: s })} disabled={s === 'words' && !learnedCount}>
            {s === 'cons' ? 'Consonnes · 44' : s === 'vow' ? `Voyelles · ${TAUGHT_VOWELS.length}` : s === 'words' ? `Mes mots · ${learnedCount}` : `Ma sélection · ${prefs.custom.length}`}
          </button>
        ))}
      </div>
      {prefs.set === 'custom' && (
        <>
          <p className="sm mut" style={{ margin: '0 2px 6px' }}>Sons voisins à distinguer, ou cochez librement.</p>
          <div className="chips">{th.NEAR_SOUNDS.map(([lab, chars]) => { const ids = [...chars].map((c) => 'c:' + c); const active = ids.length === prefs.custom.length && ids.every((x) => prefs.custom.includes(x)); return <button key={lab} className={`chip ${active ? 'on' : ''}`} aria-pressed={active} onClick={() => setPrefs({ set: 'custom', custom: ids })}><b className="rom">{lab}</b> <Thai text={[...chars].join(' ')} style={{ fontSize: 17, color: active ? 'var(--bg)' : 'var(--ink)' }} /></button>; })}</div>
          {prefs.custom.length > 0 && <p className="xs mut" style={{ margin: '0 2px 6px', textAlign: 'right' }}><button className="link" onClick={() => setPrefs({ custom: [] })}>Tout décocher</button></p>}
          <div className="lgrid" style={{ marginTop: 6 }}>{CONS_ITEMS.map((c) => <button key={c.id} className={`cell ${c.ref.cls} ${prefs.custom.includes(c.id) ? 'sel' : ''} ${c.ref.obsolete ? 'locked' : ''}`} lang="th" aria-pressed={prefs.custom.includes(c.id)} onClick={() => toggleCustom(c.id)}>{c.thai}<small>{c.ref.initial === '(muet)' ? '–' : c.ref.initial}</small></button>)}</div>
          <label className="f">Voyelles</label>
          <div className="lgrid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))' }}>{TAUGHT_VOWELS.map((v) => <button key={v.id} className={`cell wide ${prefs.custom.includes(v.id) ? 'sel' : ''}`} lang="th" aria-pressed={prefs.custom.includes(v.id)} onClick={() => toggleCustom(v.id)}>{vowelDisplay(v.form, 'อ')}<small>{v.rom}</small></button>)}</div>
        </>
      )}

      <details className="fold" open={settingsOpen} onToggle={(e) => setSettingsOpen((e.target as HTMLDetailsElement).open)}>
        <summary>Réglages <span className="sm mut">· {summary}</span></summary>
        {(prefs.set === 'cons' || prefs.set === 'vow' || prefs.set === 'custom') && (
          <>
            <label className="f">Ce qui est dit</label>
            <Segmented value={prefs.what} options={[{ v: 'sound' as const, label: <>Son <span className="th" lang="th">ปอ</span></> }, { v: 'name' as const, label: <>Nom <span className="th" lang="th">ปอ ปลา</span></> }, { v: 'both' as const, label: 'Les deux' }]} onChange={(v) => setPrefs({ what: v })} />
          </>
        )}
        <label className="f">Vitesses, pour chaque élément</label>
        <Segmented value={prefs.speeds} options={[{ v: 1 as const, label: 'Normal' }, { v: 2 as const, label: '+ lent' }, { v: 3 as const, label: '+ lent + très lent' }]} onChange={(v) => setPrefs({ speeds: v })} />
        <label className="f">Ordre</label>
        <Segmented value={prefs.order} options={[{ v: 'order' as const, label: prefs.set === 'words' ? 'Ordre appris' : 'Ordre de l’alphabet' }, { v: 'shuffle' as const, label: 'Mélangé' }]} onChange={(v) => { setSeed(Date.now()); setPrefs({ order: v }); }} />
        <label className="f">Deviner d’abord <span className="xs">(le caractère n’apparaît qu’après la première lecture)</span></label>
        <Segmented value={prefs.guess} options={[{ v: false, label: 'Non' }, { v: true, label: 'Oui' }]} onChange={(v) => setPrefs({ guess: v })} />
      </details>
      {prefs.set === 'custom' && <div className="note info sm" style={{ marginTop: 16 }}>Dans un groupe « même son » (ข ฃ ค…), les lettres se prononcent <b>exactement pareil</b> en début de syllabe : seule la classe change. Pour ป / พ ou ต / ท, la différence est réelle : la deuxième est <b>aspirée</b> (un souffle après la consonne, comme en anglais <i>pin</i>).</div>}
    </>
  );
}
