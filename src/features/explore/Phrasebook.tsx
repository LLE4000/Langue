/** Phrases de voyage : à montrer en très grand à son interlocuteur, avec audio et numéros d'urgence. */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { WORD_BY_THAI, th, type LearnItem } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, AudioPair, Empty, Fr, Icon, Rom, Thai } from '@/components/ui';
import { WordByWord } from '@/components/WordByWord';
import { MicPanel } from '@/components/MicPanel';

export function Phrasebook() {
  const t = T();
  usePage(t.explore.phrasebook, { back: '/explore' });
  const favs = useStore((s) => s.favorites);
  const nFav = Object.keys(favs).filter((k) => WORD_BY_THAI[k.slice(2)]).length;
  return (
    <>
      <p className="lead">Les phrases essentielles, sur place. Touchez une phrase pour l’afficher en très grand et la montrer à votre interlocuteur.</p>
      <div className="tiles">
        {th.PHRASEBOOK.map((s) => <Link key={s.id} to={`/explore/phrasebook/${s.id}`} className="tile ctr"><span className="e">{s.icon}</span><span className="t">{L(s.title)}</span></Link>)}
        <Link to="/explore/phrasebook/favs" className="tile ctr"><span className="ic"><Icon name="star" /></span><span className="t">Mes favoris</span><span className="s">{nFav} phrase{nFav > 1 ? 's' : ''}</span></Link>
      </div>
    </>
  );
}

export function ShowBig({ it, onClose }: { it: LearnItem; onClose: () => void }) {
  const [mic, setMic] = useState(false);
  const fav = useStore((s) => s.favorites[it.id]);
  const toggleFav = useStore((s) => s.toggleFavorite);
  return (
    <div className="showbig">
      <div className="row-flex"><button className={`ib fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(it.id)} aria-label="Favori"><Icon name="star" /></button><span className="sp" /><button className="ib" onClick={onClose} aria-label="Fermer"><Icon name="close" /></button></div>
      <div className="mid"><WordByWord thai={it.thai} rom={it.rom} /><span className="fr"><Fr text={it.meaning} /></span></div>
      <div className="audio"><AudioPair text={it.say} big /><button className="ib big" onClick={() => setMic(true)} aria-label="Vérifier ma prononciation" title="Vérifier ma prononciation"><Icon name="mic" /></button></div>
      {mic && <MicPanel item={it} onClose={() => setMic(false)} />}
    </div>
  );
}

export function PhrasebookSection() {
  const { id = '' } = useParams();
  const favs = useStore((s) => s.favorites);
  const sec = th.PHRASEBOOK.find((s) => s.id === id);
  const title = id === 'favs' ? 'Mes favoris' : sec ? `${sec.icon} ${L(sec.title)}` : 'Phrases';
  usePage(title, { back: '/explore/phrasebook' });
  const [big, setBig] = useState<LearnItem | null>(null);
  const items = id === 'favs' ? Object.keys(favs).sort((a, b) => favs[b] - favs[a]).map((k) => WORD_BY_THAI[k.slice(2)]).filter(Boolean) : (sec?.keys ?? []).map((k) => WORD_BY_THAI[k]).filter(Boolean);
  if (!sec && id !== 'favs') return <Empty icon="search">Section introuvable.</Empty>;
  return (
    <>
      {id === 'sos' && <div className="tel">{th.SOS_NUMBERS.map((n) => <a key={n.number} href={`tel:${n.number}`}><b>{n.number}</b>{L(n.label)}</a>)}</div>}
      {!items.length && <Empty icon="star">Touchez <Icon name="star" size={16} /> sur un mot ou une phrase pour les retrouver ici.</Empty>}
      <div className="list">{items.map((w) => <div key={w.id} className="row tap" role="button" tabIndex={0} onClick={() => setBig(w)} onKeyDown={(e) => { if (e.key === 'Enter') setBig(w); }}><span className="mid"><span className="t"><Fr text={w.meaning} /></span><Thai text={w.thai} /><span className="s"><Rom text={w.rom} /></span></span><span className="end"><AudioButton text={w.say} className="sm" /></span></div>)}</div>
      {big && <ShowBig it={big} onClose={() => setBig(null)} />}
    </>
  );
}
