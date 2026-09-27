/** Vocabulaire : thèmes regroupés, puis liste d'un thème avec fiche et entraînements ciblés. */
import { Fragment, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useKnown } from '@/app/hooks';
import { th, THEME_BY_ID, WORD_BY_THAI, type LearnItem } from '@/content/th';
import { mastery } from '@/engine/srs';
import { isReadable } from '@/engine/thai/reading';
import { L, T, frTypo } from '@/i18n';
import { AudioButton, Bar, Empty, Fr, Icon, MasteryDot, Rom, Thai, useShowRom } from '@/components/ui';
import { themeIcon } from '@/content/th/themeIcons';
import { ItemDetailSheet } from '@/components/ItemCard';

export function ItemRow({ it, onClick, showMissing }: { it: LearnItem; onClick: () => void; showMissing?: boolean }) {
  const m = useStore((s) => mastery(s.srs[it.id]));
  const showRom = useShowRom(it.thai);
  const known = useKnown();
  const readable = it.kind === 'word' ? isReadable(it.thai, known.concepts) : true;
  return (
    <div className="row tap" role="button" tabIndex={0} onClick={onClick} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}>
      <span className="mid"><Thai text={it.thai} /><span className="s">{showRom && <Rom text={it.rom} className="block" />}<span className="block"><Fr text={it.kind === 'cons' ? it.ref.nameMeaning : it.kind === 'clf' ? it.ref.use : it.meaning} /></span>{showMissing && !readable && <span className="unread">pas encore lisible</span>}</span></span>
      <span className="end"><MasteryDot m={m} />{it.say && <AudioButton text={it.say} className="sm" />}</span>
    </div>
  );
}

export function Vocabulary() {
  const t = T();
  usePage(t.explore.vocabulary, { back: '/explore' });
  const srs = useStore((s) => s.srs);
  const used = new Set<string>();
  const Row = ({ id }: { id: string }) => {
    const c = THEME_BY_ID[id]; if (!c) return null; used.add(id);
    const ids = c.items.map((w) => w.id);
    const p = ids.length ? ids.reduce((a, x) => a + mastery(srs[x]), 0) / ids.length : 0;
    return <Link className="row" to={`/explore/vocab/${id}`}><span className="ico"><Icon name={themeIcon(id)} /></span><span className="mid"><span className="t">{L(c.name)}</span><span className="s">{ids.length} éléments · {Math.round(p * 100)} %</span><Bar p={p} thin /></span><span className="end"><span className="chev">›</span></span></Link>;
  };
  const groups = th.THEME_GROUPS.filter((g) => g.title.fr !== 'Mes thèmes');
  const rest = th.VOCAB_THEMES.filter((c) => !groups.some((g) => g.ids.includes(c.id)));
  return (
    <>
      {groups.map((g) => <Fragment key={g.title.fr}><div className="h2">{L(g.title)}</div><div className="list">{g.ids.map((id) => <Row key={id} id={id} />)}</div></Fragment>)}
      {rest.length > 0 && <><div className="h2">Autres thèmes</div><div className="list">{rest.map((c) => <Row key={c.id} id={c.id} />)}</div></>}
    </>
  );
}

export function VocabTheme() {
  const { id = '' } = useParams();
  const c = THEME_BY_ID[id];
  usePage(c ? L(c.name) : 'Thème', { back: '/explore/vocab' });
  const [detail, setDetail] = useState<number | null>(null);
  const known = useKnown();
  if (!c) return <Empty icon="search">Thème introuvable.</Empty>;
  const items = c.items.map((w) => WORD_BY_THAI[w.thai]).filter(Boolean);
  const ids = items.map((w) => w.id);
  // Lisibilité : un résumé au-dessus de la liste ; le repère par ligne seulement quand certains mots sont lisibles et d'autres non
  const unread = items.filter((w) => w.kind === 'word' && !isReadable(w.thai, known.concepts)).length;
  const allUnread = unread > 0 && unread === items.length;
  return (
    <>
      <div className="btns"><Link className="btn soft sm" to={`/train/flashcards?theme=${id}`}><Icon name="cards" size={16} /> Cartes</Link><Link className="btn soft sm" to={`/train/listening?theme=${id}`}><Icon name="headphones" size={16} /> Écoute</Link><Link className="btn soft sm" to={`/train/match?theme=${id}`}><Icon name="link" size={16} /> Associer</Link></div>
      {unread > 0 ? <p className="note-under mt-3">{allUnread ? frTypo('Pas encore lisibles avec les lettres vues : écoutez-les d’abord.') : `${unread} sur ${items.length} pas encore lisibles avec les lettres vues.`}</p> : <div className="gap" />}
      <div className="list">{items.map((w, i) => <ItemRow key={w.id} it={w} onClick={() => setDetail(i)} showMissing={!allUnread} />)}</div>
      {detail != null && <ItemDetailSheet ids={ids} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
    </>
  );
}
