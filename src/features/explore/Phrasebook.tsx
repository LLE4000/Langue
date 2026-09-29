/** Phrases à montrer (phrases de voyage) : en très grand à son interlocuteur, avec audio et numéros d'urgence. */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { ITEMS, WORD_BY_THAI, th, type LearnItem } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, AudioPair, Empty, Fr, Icon, Rom, Thai } from '@/components/ui';
import { WordByWord } from '@/components/WordByWord';
import { MicPanel } from '@/components/MicPanel';

/** Les mots et phrases mis en favori (les lettres, voyelles, fiches… sont dans Bibliothèque › Mes favoris). */
function favPhrases(favs: Record<string, number>): LearnItem[] {
  return Object.keys(favs).sort((a, b) => favs[b] - favs[a]).map((k) => ITEMS[k]).filter((it): it is LearnItem => it?.kind === 'word');
}

export function Phrasebook() {
  const t = T();
  usePage(t.explore.phrasebook, { back: '/explore' });
  const favs = useStore((s) => s.favorites);
  const nFav = favPhrases(favs).length;
  return (
    <>
      <p className="lead">Choisissez une situation, puis touchez une phrase pour l’afficher en très grand et la montrer à votre interlocuteur.</p>
      <div className="tiles">
        {th.PHRASEBOOK.map((s) => { const n = s.keys.filter((k) => WORD_BY_THAI[k]).length; return <Link key={s.id} to={`/explore/phrasebook/${s.id}`} className="tile ctr"><span className="e">{s.icon}</span><span className="t">{L(s.title)}</span><span className="s">{n} phrase{n > 1 ? 's' : ''}</span></Link>; })}
        <Link to="/explore/phrasebook/favs" className="tile ctr"><span className="e fav"><Icon name="star" size={38} /></span><span className="t">Phrases favorites</span><span className="s">{nFav} phrase{nFav > 1 ? 's' : ''}</span></Link>
      </div>
      <p className="xs mut mt-3">Lettres, voyelles et fiches favorites&#8239;: <Link to="/explore/favorites">Mes favoris</Link>.</p>
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
  const title = id === 'favs' ? 'Phrases favorites' : sec ? L(sec.title) : 'Phrases';
  usePage(title, { back: '/explore/phrasebook' });
  const [big, setBig] = useState<LearnItem | null>(null);
  const items = id === 'favs' ? favPhrases(favs) : (sec?.keys ?? []).map((k) => WORD_BY_THAI[k]).filter(Boolean);
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
