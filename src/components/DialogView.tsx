/** Conversation : bulles, phonétique/traduction masquées au départ, écoute réplique par réplique ou en entier. */
import { useEffect, useRef, useState } from 'react';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { DIALOG_BY_ID, WORD_BY_THAI } from '@/content/th';
import { L } from '@/i18n';
import { dialogOtherGender } from '@/engine/speakers';
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
  const [playingLine, setPlayingLine] = useState<number | null>(null); // réplique en cours dans « Tout écouter »
  const token = useRef(0);
  const toggleFav = useStore((s) => s.toggleFavorite);
  const favs = useStore((s) => s.favorites);
  const defaultRom = useShowRom(undefined, false);
  useEffect(() => { setRom(defaultRom && useStore.getState().settings.translit === 'always'); }, [defaultRom, id]);
  useEffect(() => () => { token.current++; sp.cancel(); }, [sp]);
  if (!d) return null;
  const on = (i: number, k: string) => (one[i + k] != null ? one[i + k] : k === 'rom' ? rom : k === 'tr' ? tr : false);
  // Bascule globale : n'efface que les choix ligne par ligne de la même aide (les « mot à mot » ouverts restent)
  const toggleAll = (k: 'rom' | 'tr') => { const v = k === 'rom' ? !rom : !tr; if (k === 'rom') setRom(v); else setTr(v); setOne(Object.fromEntries(Object.entries(one).filter(([key]) => !key.endsWith(k)))); };
  // Deux voix : l'apprenant (sa voix préférée) et l'interlocuteur (homme ou femme selon le dialogue).
  const other = dialogOtherGender(d, sp.gender === 'm' ? 'f' : 'm');
  const say = (l: { who: 'me' | 'other'; thai: string }, opts: { slow?: boolean; onend?: () => void } = {}) => sp.speak(l.thai, { ...opts, speaker: l.who === 'other' ? other : undefined });
  const stopAll = () => { token.current++; setPlayingLine(null); sp.cancel(); };
  const playAll = () => {
    if (playingLine !== null) { stopAll(); return; }
    const tok = ++token.current;
    let i = 0;
    const next = () => {
      if (tok !== token.current || i >= d.lines.length) { if (tok === token.current) setPlayingLine(null); return; }
      setPlayingLine(i);
      document.getElementById(`bub-${id}-${i}`)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      const ok = say(d.lines[i++], { onend: () => setTimeout(next, 450) });
      if (!ok) setPlayingLine(null);
    };
    next();
  };
  return (
    <>
      <div className="dlgbar">
        <button className={`btn sm ${playingLine !== null ? '' : 'soft'}`} onClick={playAll}><Icon name={playingLine !== null ? 'pause' : 'play'} size={16} /> {playingLine !== null ? 'Arrêter' : 'Tout écouter'}</button>
        <button className={`btn sm ${rom ? '' : 'ghost'}`} onClick={() => toggleAll('rom')} aria-pressed={rom}><Icon name="eye" size={16} /> Phonétique</button>
        <button className={`btn sm ${tr ? '' : 'ghost'}`} onClick={() => toggleAll('tr')} aria-pressed={tr}><Icon name="globe" size={16} /> Traduction</button>
      </div>
      {d.lines.map((l, i) => {
        const wid = 'w:' + l.thai;
        const it = WORD_BY_THAI[l.thai];
        const voice = l.who === 'me' ? sp.gender : other;
        return (
          <div key={i} id={`bub-${id}-${i}`} className={`bub ${l.who === 'me' ? 'me' : ''} ${playingLine === i ? 'playing' : ''}`}>
            <div className="who">{l.who === 'me' ? 'Vous' : L(d.other)} <span aria-label={voice === 'f' ? 'voix de femme' : 'voix d’homme'} title="Voix">{voice === 'f' ? '♀' : '♂'}</span></div>
            {on(i, 'w') ? <WordByWord thai={l.thai} rom={l.rom} /> : <><Thai text={l.thai} />{on(i, 'rom') && <Rom text={l.rom} className="block" />}</>}
            {on(i, 'tr') && <span className="tr"><Fr text={l.tr} /></span>}
            <div className="acts">
              <button className="mini" onClick={() => say(l)} aria-label="Écouter"><Icon name="speaker" /></button>
              <button className="mini" onClick={() => say(l, { slow: true })} aria-label="Lentement"><Icon name="turtle" /></button>
              <button className={`mini ${on(i, 'rom') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'rom']: !on(i, 'rom') })} aria-label="Phonétique" aria-pressed={on(i, 'rom')}><Icon name="eye" /></button>
              <button className={`mini ${on(i, 'tr') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'tr']: !on(i, 'tr') })} aria-label="Traduction" aria-pressed={on(i, 'tr')}><Icon name="globe" /></button>
              <button className={`mini txt ${on(i, 'w') ? 'on' : ''}`} onClick={() => setOne({ ...one, [i + 'w']: !on(i, 'w') })} aria-pressed={on(i, 'w')}>Mot à mot</button>
              {l.who === 'me' && it && <button className="mini" onClick={() => setMic(wid)} aria-label="Vérifier ma prononciation" title="Vérifier ma prononciation"><Icon name="mic" /></button>}
              {it && <button className={`mini ${favs[wid] ? 'on' : ''}`} onClick={() => toggleFav(wid)} aria-label="Favori" aria-pressed={!!favs[wid]}><Icon name="star" /></button>}
            </div>
          </div>
        );
      })}
      {onDone && <StepFooter meta={<span>Écoutez, lisez, répétez les répliques « Vous » à voix haute.</span>}><ContinueButton onClick={onDone} label={doneLabel ?? 'J’ai compris ce dialogue'} /></StepFooter>}
      {mic && WORD_BY_THAI[mic.slice(2)] && <MicPanel item={WORD_BY_THAI[mic.slice(2)]} onClose={() => setMic(null)} />}
    </>
  );
}
