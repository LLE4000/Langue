/** Grammaire : bibliothèque des fiches (une idée par fiche), avec exemples audio. */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { GRAMMAR_BY_ID, th } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, Empty, Fr, Icon, Rom, Thai, useToast } from '@/components/ui';

export function Grammar() {
  const t = T();
  usePage(t.explore.grammar, { back: '/explore' });
  const srs = useStore((s) => s.srs);
  return (
    <>
      <p className="lead">Une idée par fiche, des exemples courts. Aucune conjugaison à apprendre : tout repose sur l’ordre des mots et quelques particules. Ces fiches sont aussi réparties dans les leçons du parcours.</p>
      <div className="list">{th.GRAMMAR.map((g) => <Link key={g.id} className={`row ${srs[g.id] ? 'done' : ''}`} to={`/explore/grammar/${encodeURIComponent(g.id)}`}><span className="ico">{g.icon}{srs[g.id] && <span className="done-dot" role="img" aria-label="vue"><Icon name="check" size={12} /></span>}</span><span className="mid"><span className="t">{L(g.title)}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div>
    </>
  );
}

/** Le schéma d'une fiche mêle français et thaï : on n'étiquette en thaï que les segments thaïs. */
function Pattern({ text }: { text: string }) {
  const parts = text.split(/([฀-๿][฀-๿\s]*)/g).filter(Boolean);
  return <div className="pattern">{parts.map((p, i) => (/[฀-๿]/.test(p) ? <Thai key={i} text={p.trim()} className="th-s" /> : <span key={i}>{p}</span>))}</div>;
}

export function GrammarScreen() {
  const { id = '' } = useParams();
  const g = GRAMMAR_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const rateItem = useStore((s) => s.rateItem);
  const fav = useStore((s) => s.favorites[g?.id ?? '']);
  const toggleFav = useStore((s) => s.toggleFavorite);
  const toast = useToast((s) => s.show);
  const k = g ? th.GRAMMAR.findIndex((x) => x.id === g.id) : -1;
  usePage(g ? `Fiche ${k + 1} / ${th.GRAMMAR.length}` : 'Grammaire', { back: '/explore/grammar' });
  if (!g) return <Empty icon="search">Fiche introuvable.</Empty>;
  const prev = k > 0 ? th.GRAMMAR[k - 1] : null;
  const next = k + 1 < th.GRAMMAR.length ? th.GRAMMAR[k + 1] : null;
  const go = (gid: string) => nav(`/explore/grammar/${encodeURIComponent(gid)}`);
  return (
    <>
      <h2 className="theory-title mt-1">{g.icon} {L(g.title)}</h2>
      <p className="lead ink">{L(g.rule)}</p>
      <Pattern text={g.pattern} />
      <div className="list">{g.examples.map((e, i) => <div key={i} className="row"><span className="mid"><Thai text={e.thai} /><span className="s"><Rom text={e.rom} /><br /><Fr text={e.meaning} /></span></span><span className="end"><AudioButton text={e.thai} className="sm" /></span></div>)}</div>
      {g.tip && <div className="note">{L(g.tip)}</div>}
      {g.id === 'g:clf' && <Link className="btn soft mt-3" to="/explore/classifiers">Ouvrir le module Classificateurs</Link>}
      <div className="btns mt-4">
        <button className={`ib fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(g.id)} aria-label="Favori" aria-pressed={!!fav}><Icon name="star" /></button>
        {prev && <button className="ib" onClick={() => go(prev.id)} aria-label="Fiche précédente"><Icon name="back" /></button>}
        <button className="btn" onClick={() => { rateItem(g.id, 3); if (next) go(next.id); else { toast('Toutes les fiches sont vues.'); nav('/explore/grammar'); } }}>{next ? 'Compris · fiche suivante' : 'Compris · retour aux fiches'} <Icon name="next" size={18} /></button>
      </div>
    </>
  );
}
