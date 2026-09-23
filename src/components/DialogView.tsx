/** Conversation : bulles, phonétique/traduction masquées au départ, écoute réplique par réplique ou en entier. */
import { useEffect, useRef, useState } from 'react';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { DIALOG_BY_ID, WORD_BY_THAI } from '@/content/th';
import { L } from '@/i18n';
import { Icon, Thai, Rom, Fr, useShowRom } from './ui';
import { WordByWord } from './WordByWord';
import { MicPanel } from './MicPanel';
import { StepFooter, ContinueButton } from './StepFooter';

export function DialogView({ id, onDone, doneLabel }: { id: string; onDone?: () => void; doneLabel?: string }) {
  const d = DIALOG_BY_ID[id];
  const sp = useSpeaker();
  const [rom, setRom] = useState(false);
  const [tr, setTr] = useState(false);
  const [one, setOne] = useState<Record<string, boolean>>({});
  const [mic, setMic] = useState<string | null>(null);
  const playing = useRef(false);
  const toggleFav = useStore((s) => s.toggleFavorite);
  const favs = useStore((s) => s.favorites);
  const defaultRom = useShowRom(undefined, false);
  useEffect(() => { setRom(defaultRom && useStore.getState().settings.translit === 'always'); }, [defaultRom, id]);
  useEffect(() => () => { playing.current = false; sp.cancel(); }, [sp]);
  if (!d) return null;
  const on = (i: number, k: string) => (one[i + k] != null ? one[i + k] : k === 'rom' ? rom : k === 'tr' ? tr : false);
  const playAll = () => {
    playing.current = true;
    let i = 0;
    const next = () => { if (!playing.current || i >= d.lines.length) { playing.current = false; return; } sp.speak(d.lines[i++].thai, { onend: () => setTimeout(next, 450) }); };
    next();
  };
  return (
    <>
      <div className="btns" style={{ marginBottom: 8 }}>
        <button className={`btn sm ${rom ? '' : 'ghost'}`} onClick={() => { setRom(!rom); setOne({}); }}><Icon name="eye" size={16} /> Phonétique</button>
        <button className={`btn sm ${tr ? '' : 'ghost'}`} onClick={() => { setTr(!tr); setOne({}); }}>🇫🇷 Traduction</button>
      </div>
      <div className="btns" style={{ marginBottom: 14 }}><button className="btn soft sm" onClick={playAll}><Icon name="play" size={16} /> Tout écouter</button><button className="btn ghost sm" onClick={() => { playing.current = false; sp.cancel(); }}>Stop</button></div>
      {d.lines.map((l, i) => {
        const wid = 'w:' + l.thai;
        const it = WORD_BY_THAI[l.thai];
        return (
          <div key={i} className={`bub ${l.who === 'me' ? 'me' : ''}`}>
            <div className="who">{l.who === 'me' ? 'Vous' : L(d.other)}</div>
            {on(i, 'w') ? <WordByWord thai={l.thai} rom={l.rom} /> : <><Thai text={l.thai} />{on(i, 'rom') && <Rom text={l.rom} style={{ display: 'block' }} />}</>}
            {on(i, 'tr') && <span className="tr"><Fr text={l.tr} /></span>}
            <div className="acts">
              <button className="mini" onClick={() => sp.speak(l.thai)} aria-label="Écouter"><Icon name="speaker" /></button>
              <button className="mini" onClick={() => sp.speak(l.thai, { slow: true })} aria-label="Lentement"><Icon name="turtle" /></button>
              <button className={`mini ${on(i, 'rom') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'rom']: !on(i, 'rom') })} aria-label="Phonétique"><Icon name="eye" /></button>
              <button className={`mini ${on(i, 'tr') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'tr']: !on(i, 'tr') })} aria-label="Traduction">🇫🇷</button>
              <button className={`mini ${on(i, 'w') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'w']: !on(i, 'w') })} aria-label="Mot à mot">🎨</button>
              {l.who === 'me' && it && <button className="mini" onClick={() => setMic(wid)} aria-label="M'enregistrer"><Icon name="mic" /></button>}
              {it && <button className={`mini ${favs[wid] ? 'on' : ''}`} onClick={() => toggleFav(wid)} aria-label="Favori"><Icon name="star" /></button>}
            </div>
          </div>
        );
      })}
      {onDone && <StepFooter meta={<span>Écoutez, lisez, répétez les répliques « Vous » à voix haute.</span>}><ContinueButton onClick={onDone} label={doneLabel ?? 'J’ai compris ce dialogue'} /></StepFooter>}
      {mic && WORD_BY_THAI[mic.slice(2)] && <MicPanel item={WORD_BY_THAI[mic.slice(2)]} onClose={() => setMic(null)} />}
    </>
  );
}
