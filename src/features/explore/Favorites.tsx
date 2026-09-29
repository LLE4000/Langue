/**
 * Mes favoris : tout ce qui porte une étoile, où qu'on l'ait mise (mot, réplique, lettre, voyelle, nombre, fiche de
 * grammaire), rangé par sections. Un toucher ouvre la fiche ; « Réviser mes favoris » lance des cartes sur eux seuls.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { GRAMMAR_BY_ID, ITEMS, type LearnItem } from '@/content/th';
import { L, T } from '@/i18n';
import { Empty, Icon } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import { favoriteItems } from '@/features/review/training';
import { ItemRow } from './Vocabulary';
import { GrammarGlyph, GrammarRowTitle } from './Grammar';

type Section = 'words' | 'letters' | 'vowels';
const SECTIONS: { id: Section; title: string; kinds: LearnItem['kind'][] }[] = [
  { id: 'words', title: 'Mots et phrases', kinds: ['word', 'num', 'clf', 'tone'] },
  { id: 'letters', title: 'Lettres', kinds: ['cons'] },
  { id: 'vowels', title: 'Voyelles', kinds: ['vow'] },
];
/** Les cartes demandent au moins trois éléments (voir buildTraining). */
const MIN_CARDS = 3;

export function Favorites() {
  const t = T();
  usePage(t.explore.favorites, { back: '/explore' });
  const favs = useStore((s) => s.favorites);
  // fiche ouverte : la liste est figée à l'ouverture (retirer l'étoile ne fait pas sauter à une autre fiche)
  const [detail, setDetail] = useState<{ ids: string[]; i: number } | null>(null);
  const { items, grammar } = useMemo(() => {
    const ids = Object.keys(favs).sort((a, b) => favs[b] - favs[a]);
    return {
      items: ids.map((id) => ITEMS[id]).filter((it): it is LearnItem => !!it && it.kind !== 'rule' && it.kind !== 'grammar'),
      grammar: ids.map((id) => GRAMMAR_BY_ID[id]).filter(Boolean),
    };
  }, [favs]);
  const cards = favoriteItems(favs).length;
  if (!items.length && !grammar.length) {
    return (
      <>
        <Empty icon="star">Touchez <Icon name="star" size={16} /> sur un mot, une lettre, une voyelle ou une fiche de grammaire&#8239;: vous les retrouverez tous ici.</Empty>
        <div className="btns fav-empty"><Link className="btn soft sm" to="/explore/vocab">Parcourir le vocabulaire</Link><Link className="btn soft sm" to="/explore/alphabet">Voir l’alphabet</Link></div>
      </>
    );
  }
  return (
    <>
      <p className="lead">Tout ce qui porte une étoile, où que vous l’ayez mise. Touchez une ligne pour ouvrir sa fiche.</p>
      {cards >= MIN_CARDS
        ? <Link className="btn" to="/train/flashcards?set=favs" state={{ from: '/explore/favorites' }}><Icon name="cards" size={18} /> Réviser mes favoris</Link>
        : <p className="xs mut">Encore {MIN_CARDS - cards} favori{MIN_CARDS - cards > 1 ? 's' : ''} (mot, lettre, voyelle…) pour pouvoir les réviser en cartes.</p>}
      {SECTIONS.map((s) => {
        const list = items.filter((it) => s.kinds.includes(it.kind));
        if (!list.length) return null;
        const ids = list.map((it) => it.id);
        return (
          <section key={s.id} aria-label={s.title}>
            <div className="h2">{s.title} <span className="sm mut">{list.length}</span><span className="sp" />{s.id === 'words' && <Link to="/explore/phrasebook/favs">Montrer en grand</Link>}</div>
            <div className="list">{list.map((it, i) => <ItemRow key={it.id} it={it} onClick={() => setDetail({ ids, i })} />)}</div>
          </section>
        );
      })}
      {grammar.length > 0 && (
        <section aria-label="Grammaire">
          <div className="h2">Grammaire <span className="sm mut">{grammar.length}</span></div>
          <div className="list">{grammar.map((g) => <Link key={g.id} className="row" to={`/explore/grammar/${encodeURIComponent(g.id)}`}><span className="ico"><GrammarGlyph icon={g.icon} /></span><GrammarRowTitle title={L(g.title)} /><span className="end"><span className="chev">›</span></span></Link>)}</div>
        </section>
      )}
      {detail && <ItemDetailSheet ids={detail.ids} index={detail.i} onClose={() => setDetail(null)} onNav={(i) => setDetail({ ...detail, i })} />}
    </>
  );
}
