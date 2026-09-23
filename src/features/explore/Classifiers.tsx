/** Classificateurs : schémas d'emploi et liste des plus courants. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { CLF_ITEMS, th } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, Rom, Thai } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import { ItemRow } from './Vocabulary';

export function Classifiers() {
  const t = T();
  usePage(t.explore.classifiers, { back: '/explore' });
  const [detail, setDetail] = useState<number | null>(null);
  const ids = CLF_ITEMS.map((c) => c.id);
  return (
    <>
      <p className="lead">En thaï on ne compte jamais un nom directement : on ajoute un mot-mesure, comme « deux <i>tasses</i> de café » — mais pour tout.</p>
      <div className="list">{th.CLF_PATTERNS.map((p, i) => <div key={i} className="row"><span className="mid"><span className="t">{L(p.use)}</span><span className="s">{L(p.pattern)}</span><span className="s"><Thai text={p.thai} /> <Rom text={p.rom} /> · {L(p.meaning)}</span></span><span className="end"><AudioButton text={p.thai} className="sm" /></span></div>)}</div>
      <div className="btns" style={{ margin: '14px 0' }}><Link className="btn soft sm" to="/train/flashcards">Flashcards</Link><Link className="btn ghost sm" to="/train/match">Associer</Link></div>
      <div className="h2">Les plus courants</div>
      <div className="list">{CLF_ITEMS.map((c, i) => <ItemRow key={c.id} it={c} onClick={() => setDetail(i)} />)}</div>
      <div className="note" style={{ marginTop: 12 }}>En cas de doute, <Thai text="อัน" /> (an) dépanne pour les objets, et pointer du doigt en disant <Thai text="อันนี้" /> (an-níi, « celui-ci ») fonctionne toujours.</div>
      {detail != null && <ItemDetailSheet ids={ids} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
