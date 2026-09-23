/** Voyelles : par groupe, avec consonne de référence, fiche détaillée. */
import { useState } from 'react';
import { usePage } from '@/app/Shell';
import { useKnown } from '@/app/hooks';
import { useStore } from '@/app/store';
import { VOWEL_ITEMS, vowelDisplay } from '@/content/th';
import { mastery } from '@/engine/srs';
import { T } from '@/i18n';
import { MasteryDot, Segmented } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import type { VowelGroup } from '@/content/types';

const GROUPS: [VowelGroup, string][] = [['simple', 'Simples'], ['diph', 'Diphtongues'], ['special', 'Particulières'], ['combo', 'Avec ย / ว']];

export function Vowels() {
  const t = T();
  usePage(t.explore.vowels, { back: '/explore' });
  const [g, setG] = useState<VowelGroup>('simple');
  const [ref, setRef] = useState('ก');
  const [detail, setDetail] = useState<{ ids: string[]; i: number } | null>(null);
  const known = useKnown();
  const srs = useStore((s) => s.srs);
  const list = VOWEL_ITEMS.filter((v) => v.ref.group === g);
  const ids = list.map((v) => v.id);
  return (
    <>
      <p className="lead">Une voyelle thaïe s’écrit autour de la consonne : avant, après, au-dessus, en dessous, ou plusieurs à la fois. Le son, lui, vient toujours après la consonne.</p>
      <div className="chips">{GROUPS.map(([k, lab]) => <button key={k} className={`chip ${g === k ? 'on' : ''}`} onClick={() => setG(k)}>{lab}</button>)}</div>
      <div className="lgrid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))' }}>
        {list.map((v) => <button key={v.id} className={`cell wide ${known.concepts.has(v.id) ? '' : 'locked'}`} lang="th" style={{ color: v.ref.length === 'S' ? 'var(--gold)' : 'var(--ink)' }} onClick={() => setDetail({ ids, i: ids.indexOf(v.id) })}>{vowelDisplay(v.ref.form, ref)}<MasteryDot m={mastery(srs[v.id])} /><small>{v.rom} · {v.ref.length === 'S' ? 'courte' : 'longue'}</small></button>)}
      </div>
      <label className="f">Consonne de référence pour les exemples</label>
      <Segmented value={ref} options={['ก', 'อ', 'น', 'บ'].map((c) => ({ v: c, label: <span lang="th" className="th">{c}</span> }))} onChange={setRef} />
      <div className="note" style={{ marginTop: 14 }}>Couleur or = voyelle <b>courte</b>. La durée change le sens d’un mot et entre dans les règles de ton. Les formes grisées n’ont pas encore été enseignées dans votre parcours.</div>
      {detail && <ItemDetailSheet ids={detail.ids} index={detail.i} onClose={() => setDetail(null)} onNav={(i) => setDetail({ ...detail, i })} />}
    </>
  );
}
