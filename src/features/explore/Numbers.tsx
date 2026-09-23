/** Nombres : chiffres thaïs, nombres clés, convertisseur, à savoir. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { NUM_ITEMS, th } from '@/content/th';
import { thaiNumber } from '@/engine/thai/numbers';
import { mastery } from '@/engine/srs';
import { T, L } from '@/i18n';
import { AudioPair, AudioButton, MasteryDot, Segmented, Thai, Rom, sizeClass } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';

export function Numbers() {
  const t = T();
  usePage(t.explore.numbers, { back: '/explore' });
  const [tab, setTab] = useState<'learn' | 'conv' | 'notes'>('learn');
  const [input, setInput] = useState('357');
  const [detail, setDetail] = useState<number | null>(null);
  const srs = useStore((s) => s.srs);
  const n = Math.min(999_999_999, parseInt(input.replace(/\D/g, '') || '0', 10));
  const conv = thaiNumber(n);
  const ids = NUM_ITEMS.map((x) => x.id);
  return (
    <>
      <Segmented value={tab} options={[{ v: 'learn', label: 'Apprendre' }, { v: 'conv', label: 'Convertisseur' }, { v: 'notes', label: 'À savoir' }]} onChange={setTab} />
      <div className="gap" />
      {tab === 'learn' && (
        <>
          <div className="lgrid" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>{th.DIGITS.map((d, i) => <button key={i} className="cell wide" lang="th" onClick={() => setDetail(i)}>{d[0]}<MasteryDot m={mastery(srs['n:' + i])} /><small>{i} · {d[2]}</small></button>)}</div>
          <div className="h2">Nombres clés</div>
          <div className="list">{NUM_ITEMS.filter((x) => x.value >= 10).map((x) => <button key={x.id} className="row" onClick={() => setDetail(ids.indexOf(x.id))}><span className="mid"><span className="t">{x.meaning.fr} <span className="th mut">{x.digits}</span></span><span className="s"><Thai text={x.thai} /> <Rom text={x.rom} /></span></span><span className="end"><MasteryDot m={mastery(srs[x.id])} /><AudioButton text={x.say} className="sm" /></span></button>)}</div>
          <div className="btns" style={{ marginTop: 14 }}><Link className="btn soft sm" to="/train/listening">🎧 Écoute</Link><Link className="btn soft sm" to="/train/flashcards">Flashcards</Link></div>
        </>
      )}
      {tab === 'conv' && (
        <>
          <label className="f" htmlFor="numin">Tapez un nombre</label>
          <input id="numin" className="field" inputMode="numeric" value={input} onChange={(e) => setInput(e.target.value)} />
          <div className="stage" style={{ marginTop: 12, minHeight: 170 }}><div className={`big ${sizeClass(conv.thai)}`}><Thai text={conv.thai} /></div><Rom text={conv.rom} /><div className="th mut" style={{ fontSize: 22 }}>{conv.digits}</div></div>
          <div className="audio"><AudioPair text={conv.thai} big /></div>
        </>
      )}
      {tab === 'notes' && th.NUM_NOTES.map((x, i) => <div key={i} className="note info">{L(x)}</div>)}
      {detail != null && <ItemDetailSheet ids={ids} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
