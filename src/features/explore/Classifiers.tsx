/** Classificateurs : schémas d'emploi et liste des plus courants. */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { CLF_ITEMS, th } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, Icon, Rom, Thai } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import { ItemRow } from './Vocabulary';

/** Les entraînements lancés d'ici portent sur les classificateurs (?set=clf) et reviennent ici. */
const FROM = { from: '/explore/classifiers' };

export function Classifiers() {
  const t = T();
  usePage(t.explore.classifiers, { back: '/explore' });
  const [detail, setDetail] = useState<number | null>(null);
  const ids = CLF_ITEMS.map((c) => c.id);
  return (
    <>
      <p className="lead">En thaï on ne compte jamais un nom directement&nbsp;: on ajoute un mot-mesure, comme {'«\u00a0deux'} <i>tasses</i> de {'café\u00a0»'} — mais pour tout.</p>
      <div className="list">{th.CLF_PATTERNS.map((p, i) => <div key={i} className="row"><span className="mid"><span className="t">{L(p.use)}</span><span className="s">{L(p.pattern)}</span><span className="s"><Thai text={p.thai} /> <Rom text={p.rom} /></span><span className="s">{L(p.meaning)}</span></span><span className="end"><AudioButton text={p.thai} className="sm" /></span></div>)}</div>
      <div className="btns mt-4 mb-4"><Link className="btn soft sm" to="/train/flashcards?set=clf" state={FROM}><Icon name="cards" size={16} /> Cartes</Link><Link className="btn soft sm" to="/train/match?set=clf" state={FROM}><Icon name="link" size={16} /> Associer</Link></div>
      <div className="h2">Les plus courants</div>
      <div className="list">{CLF_ITEMS.map((c, i) => <ItemRow key={c.id} it={c} onClick={() => setDetail(i)} />)}</div>
      <div className="note">En cas de doute, <Thai text="อัน" /> <Rom text="an" /> dépanne pour les objets, et pointer du doigt en disant <Thai text="อันนี้" /> <Rom text="an-níi" /> {'(«\u00a0celui\u2011ci\u00a0»)'} fonctionne toujours.</div>
      {detail != null && <ItemDetailSheet ids={ids} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
