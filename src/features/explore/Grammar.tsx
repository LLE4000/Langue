/** Grammaire : bibliothèque des fiches (une idée par fiche), avec exemples audio. */
import { Fragment } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { GRAMMAR_BY_ID, th } from '@/content/th';
import { L, T } from '@/i18n';
import { AudioButton, Empty, Fr, GlyphIcon, Icon, Rom, Thai, useToast } from '@/components/ui';

/** Émoji de chaque fiche → icône vectorielle de l'app (une seule famille visuelle dans les listes). */
const GLYPHS: Record<string, string> = {
  '🧱': 'layers', '🪶': 'pen', '⏪': 'back', '⏩': 'next', '🔄': 'repeat', '🔁': 'repeat', '🚫': 'close', '❓': 'help', '🤔': 'bulb', '🔎': 'search',
  '🙏': 'heart', '🌿': 'leaf', '🤲': 'send', '🔑': 'lock', '📦': 'cube', '👥': 'users', '🧑': 'user', '🎩': 'star', '✅': 'check', '☑': 'checkCircle',
  '💭': 'chat', '❗': 'alert', '📈': 'trend', '⚖': 'sliders', '🟰': 'equal', '📍': 'pin', '🔢': 'hash', '🎁': 'sparkles', '🔗': 'link', '🪢': 'type',
  '🤝': 'users', '💥': 'bolt',
};
export function GrammarGlyph({ icon }: { icon: string }) {
  // un émoji du contenu, ou directement un nom d'icône (fiches A2)
  return <GlyphIcon name={GLYPHS[icon.replace(/\uFE0F/g, '')] ?? icon} />;
}

const hasThai = (x: string) => /[฀-๿]/.test(x);
/** « Relier les idées : และ · แต่ » → le titre français d'un côté, la liste thaïe dessous (jamais de « · » en fin de ligne). */
function splitTitle(s: string): { t: string; th?: string } {
  const k = s.search(/[ \u00a0\u202f]:[ \u00a0\u202f]/);
  if (k < 0) return { t: s };
  const a = s.slice(0, k), b = s.slice(k + 3);
  if (hasThai(b) && !hasThai(a)) return { t: a, th: b };
  if (hasThai(a) && !hasThai(b)) return { t: b, th: a };
  return { t: s };
}
/** Titre de fiche en ligne de liste : le français en titre, le thaï en sous-ligne (séparateurs insécables). */
export function GrammarRowTitle({ title }: { title: string }) {
  const st = splitTitle(title);
  return <span className="mid"><span className="t">{st.t}</span>{st.th && <span className="s"><Thai text={st.th.replace(/ · /g, '\u00a0· ')} className="th-s" /></span>}</span>;
}

export function Grammar() {
  const t = T();
  usePage(t.explore.grammar, { back: '/explore' });
  const srs = useStore((s) => s.srs);
  return (
    <>
      <p className="lead">Une idée par fiche, des exemples courts. Aucune conjugaison à apprendre&nbsp;: tout repose sur l’ordre des mots et quelques particules. Ces fiches sont aussi réparties dans les leçons du parcours.</p>
      <div className="list">{th.GRAMMAR.map((g) => <Link key={g.id} className={`row ${srs[g.id] ? 'done' : ''}`} to={`/explore/grammar/${encodeURIComponent(g.id)}`}><span className="ico"><GrammarGlyph icon={g.icon} />{srs[g.id] && <span className="done-dot" role="img" aria-label="vue"><Icon name="check" size={12} /></span>}</span><GrammarRowTitle title={L(g.title)} /><span className="end"><span className="chev">›</span></span></Link>)}</div>
    </>
  );
}

/** Le schéma d'une fiche mêle français et thaï : on n'étiquette en thaï que les segments thaïs. */
function Pattern({ text }: { text: string }) {
  const parts = text.split(/([฀-๿][฀-๿\s]*)/g).filter(Boolean);
  // Le segment thaï capture l'espace qui le suit : on le rend hors de l'étiquette thaïe (« ไม่ + verbe », pas « ไม่+ verbe »)
  return <div className="pattern">{parts.map((p, i) => (hasThai(p) ? <Fragment key={i}><Thai text={p.trim()} className="th-s" />{/\s$/.test(p) ? ' ' : ''}</Fragment> : <span key={i}>{p}</span>))}</div>;
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
      <h2 className="theory-title mt-1 mb-3">{L(g.title)}</h2>
      <p className="lead ink">{L(g.rule)}</p>
      <Pattern text={g.pattern} />
      <div className="list">{g.examples.map((e, i) => <div key={i} className="row"><span className="mid"><Thai text={e.thai} /><span className="s"><Rom text={e.rom} /><br /><Fr text={e.meaning} /></span></span><span className="end"><AudioButton text={e.thai} className="sm" /></span></div>)}</div>
      {g.tip && <div className="note">{L(g.tip)}</div>}
      {g.id === 'g:clf' && <Link className="btn soft mt-3" to="/explore/classifiers">Ouvrir le module Classificateurs</Link>}
      <div className="btns mt-4">
        <button className={`ib fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(g.id)} aria-label="Favori" aria-pressed={!!fav}><Icon name="star" /></button>
        {prev && <button className="ib" onClick={() => go(prev.id)} aria-label="Fiche précédente"><Icon name="back" /></button>}
        <button className="btn" aria-label={next ? 'Compris, fiche suivante' : 'Compris, retour aux fiches'} onClick={() => { rateItem(g.id, 3); if (next) go(next.id); else { toast('Toutes les fiches sont vues.'); nav('/explore/grammar'); } }}><Icon name="check" size={18} /> {next ? 'Fiche suivante' : 'Retour aux fiches'}</button>
      </div>
    </>
  );
}
