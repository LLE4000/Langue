/** Voyelles : par groupe, avec consonne de référence ; un toucher = le son (et un aperçu), un second = la fiche. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useKnown } from '@/app/hooks';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { ITEMS, VOWEL_ITEMS, vowelDisplay } from '@/content/th';
import { mastery } from '@/engine/srs';
import { T } from '@/i18n';
import { Icon, MasteryDot, Segmented } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import { PeekBar } from './Alphabet';
import type { VowelGroup } from '@/content/types';

const GROUPS: [VowelGroup, string][] = [['simple', 'Simples'], ['diph', 'Diphtongues'], ['special', 'Particulières'], ['combo', 'Avec ย / ว']];

export function Vowels() {
  const t = T();
  const nav = useNavigate();
  const sp = useSpeaker();
  usePage(t.explore.vowels, { back: '/explore' });
  const [g, setG] = useState<VowelGroup>('simple');
  const [ref, setRef] = useState('ก');
  const [detail, setDetail] = useState<{ ids: string[]; i: number } | null>(null);
  const [peek, setPeek] = useState<{ ids: string[]; i: number } | null>(null);
  const known = useKnown();
  const srs = useStore((s) => s.srs);
  const list = VOWEL_ITEMS.filter((v) => v.ref.group === g);
  const ids = list.map((v) => v.id);
  const peekItem = peek ? ITEMS[peek.ids[peek.i]] : null;
  const tap = (id: string) => {
    if (peekItem?.id === id) { setDetail({ ids, i: ids.indexOf(id) }); return; }
    sp.speak(ITEMS[id].say);
    setPeek({ ids, i: ids.indexOf(id) });
  };
  return (
    <>
      <p className="lead">Une voyelle thaïe s’écrit autour de la consonne : avant, après, au-dessus, en dessous, ou plusieurs à la fois. Le son, lui, vient toujours après la consonne.</p>
      <div className="chips">{GROUPS.map(([k, lab]) => <button key={k} className={`chip ${g === k ? 'on' : ''}`} onClick={() => setG(k)}>{lab}</button>)}</div>
      <div className="btns mb-3"><button className="btn soft sm" onClick={() => nav('/explore/listen?set=vow')}><Icon name="repeat" size={18} /> Écouter les voyelles en boucle</button></div>
      <p className="xs mut mt-n1 mb-3">Touchez une voyelle pour l’entendre ; touchez-la encore pour ouvrir sa fiche.</p>
      <div className="row-flex mb-3"><span className="sm mut nowrap">Autour de</span><div className="grow"><Segmented value={ref} options={['ก', 'อ', 'น', 'บ'].map((c) => ({ v: c, label: <span lang="th" className="th">{c}</span> }))} onChange={setRef} /></div></div>
      <div className="lgrid wide">
        {list.map((v) => <button key={v.id} className={`cell wide ${known.concepts.has(v.id) ? '' : 'locked'} ${peekItem?.id === v.id ? 'sel' : ''}`} lang="th" aria-pressed={peekItem?.id === v.id} style={{ color: v.ref.length === 'S' ? 'var(--gold)' : 'var(--ink)' }} onClick={() => tap(v.id)}>{vowelDisplay(v.ref.form, ref)}<MasteryDot m={mastery(srs[v.id])} /><small>{v.rom} · {v.ref.length === 'S' ? 'courte' : 'longue'}</small></button>)}
      </div>
      <div className="note mt-4">Couleur or = voyelle <b>courte</b>. La durée change le sens d’un mot et entre dans les règles de ton. Les formes grisées n’ont pas encore été enseignées dans votre parcours.</div>
      {peekItem && !detail && <PeekBar it={peekItem} onDetail={() => setDetail(peek)} onClose={() => setPeek(null)} />}
      {detail && <ItemDetailSheet ids={detail.ids} index={detail.i} onClose={() => setDetail(null)} onNav={(i) => setDetail({ ...detail, i })} />}
    </>
  );
}
