/** Grammaire : bibliothèque des fiches (une idée par fiche), avec exemples audio. */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { GRAMMAR_BY_ID, th } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioPair, Empty, Fr, Icon, Rom, Thai } from '@/components/ui';

export function Grammar() {
  const t = T();
  usePage(t.explore.grammar, { back: '/explore' });
  const srs = useStore((s) => s.srs);
  return (
    <>
      <p className="lead">Une idée par fiche, des exemples courts. Aucune conjugaison à apprendre : tout repose sur l’ordre des mots et quelques particules. Ces fiches sont aussi réparties dans les leçons du parcours.</p>
      <div className="list">{th.GRAMMAR.map((g) => <Link key={g.id} className={`row ${srs[g.id] ? 'done' : ''}`} to={`/explore/grammar/${encodeURIComponent(g.id)}`}><span className="ico">{srs[g.id] ? '✓' : g.icon}</span><span className="mid"><span className="t">{L(g.title)}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div>
    </>
  );
}

export function GrammarScreen() {
  const { id = '' } = useParams();
  const g = GRAMMAR_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const rateItem = useStore((s) => s.rateItem);
  const fav = useStore((s) => s.favorites[g?.id ?? '']);
  const toggleFav = useStore((s) => s.toggleFavorite);
  usePage(g ? L(g.title) : 'Grammaire', { back: '/explore/grammar' });
  if (!g) return <Empty e="🔍">Fiche introuvable.</Empty>;
  const k = th.GRAMMAR.findIndex((x) => x.id === g.id);
  const next = th.GRAMMAR[(k + 1) % th.GRAMMAR.length];
  return (
    <>
      <p style={{ fontSize: 17, lineHeight: 1.5 }}>{L(g.rule)}</p>
      <div className="pattern" lang="th">{g.pattern}</div>
      <div className="list">{g.examples.map((e, i) => <div key={i} className="row"><span className="mid"><Thai text={e.thai} /><span className="s"><Rom text={e.rom} /><br /><Fr text={e.meaning} /></span></span><span className="end"><AudioPair text={e.thai} /></span></div>)}</div>
      {g.tip && <div className="note">{L(g.tip)}</div>}
      {g.id === 'g:clf' && <Link className="btn soft" style={{ marginTop: 10 }} to="/explore/classifiers">Ouvrir le module Classificateurs</Link>}
      <div className="btns" style={{ marginTop: 14 }}>
        <button className={`ib fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(g.id)} aria-label="Favori"><Icon name="star" /></button>
        <button className="btn" onClick={() => { rateItem(g.id, 3); nav(`/explore/grammar/${encodeURIComponent(next.id)}`); }}>Compris · fiche suivante</button>
      </div>
    </>
  );
}
