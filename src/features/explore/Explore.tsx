/**
 * Bibliothèque : tout le contenu, librement. En tête, la recherche et Mes favoris ; puis (1) l'écriture, dans l'ordre où
 * on l'apprend (alphabet, voyelles, tons, phonétique, grille de lecture), (2) le quotidien, (3) pour approfondir, et
 * (4) les outils (écoute en boucle, tracer les lettres, phrases à montrer).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useMetrics, useProgress } from '@/app/hooks';
import { useStore } from '@/app/store';
import { th, MAIN_WORDS } from '@/content/th';
import { T } from '@/i18n';
import { Bar, Icon, ThInl } from '@/components/ui';

/** Une tuile : un glyphe thaï (le contenu lui-même) ou une icône, un titre, une ligne, et l'avancement s'il existe. */
function Tile({ to, thai, icon, title, sub, p }: { to: string; thai?: string; icon?: string; title: string; sub: ReactNode; p?: number }) {
  return (
    <Link to={to} className="tile lib">
      {thai ? <span className="th" lang="th">{thai}</span> : <span className="ic"><Icon name={icon ?? 'book'} /></span>}
      <span className="t">{title}</span><span className="s">{sub}</span>
      {p != null && <Bar p={p} thin />}
    </Link>
  );
}

export function Explore() {
  const t = T();
  usePage(t.explore.title, { avatar: true, thai: { th: 'ห้องสมุด', rom: 'hɔ̂ng-sà-mùt' } });
  const m = useMetrics();
  const prog = useProgress();
  const nFav = useStore((s) => Object.keys(s.favorites).length);
  const vocab = prog.skills.find((s) => s.id === 'vocab')!;
  return (
    <>
      <div className="lib-top">
        <Link to="/explore/search" className="lib-search"><Icon name="search" size={18} /><span>Rechercher un mot…</span></Link>
        <Link to="/explore/favorites" className="lib-fav" aria-label={`${t.explore.favorites} (${nFav})`}><Icon name="star" size={18} /><span>{t.explore.favorites}</span>{nFav > 0 && <b>{nFav}</b>}</Link>
      </div>
      <p className="lead">Tout le contenu, librement. Le parcours reste le fil conducteur&nbsp;: ici, vous approfondissez.</p>
      <div className="h2">L’écriture</div>
      <div className="tiles">
        <Tile to="/explore/alphabet" thai="ก ข ค" title={t.explore.alphabet} sub="44 consonnes · 3 classes" p={m.letters.progress} />
        <Tile to="/explore/vowels" thai="กา กี กู" title={t.explore.vowels} sub="Avant, après, dessus, dessous" p={m.vowels.progress} />
        <Tile to="/explore/tones" thai="ก่ ก้ ก๊ ก๋" title={t.explore.tones} sub="5 tons, règles, séries" p={m.tones.progress} />
        <Tile to="/explore/transcription" icon="type" title={t.explore.transcription} sub="La transcription, son par son" />
        <Tile to="/read/grid" icon="grid" title={t.explore.readGrid} sub={<><ThInl text="ขา ขี ขู" /> · à voix haute</>} />
      </div>
      <div className="h2">Au quotidien</div>
      <div className="tiles">
        <Tile to="/explore/vocab" icon="word" title={t.explore.vocabulary} sub={`${prog.counts.wordsAcquired} acquis sur ${MAIN_WORDS.length} · ${th.VOCAB_THEMES.length} thèmes`} p={vocab.value / 100} />
        <Tile to="/explore/dialogs" icon="dialog" title={t.explore.conversations} sub={`${th.DIALOGS.length} situations réelles`} />
        <Tile to="/talk" icon="mic" title={t.explore.talk} sub="Jouer votre rôle au micro" />
        <Tile to="/explore/numbers" thai="๑ ๒ ๓" title={t.explore.numbers} sub="๐–๙, prix, convertisseur" p={m.numbers.progress} />
      </div>
      <div className="h2">Approfondir</div>
      <div className="tiles">
        <Tile to="/explore/readings" icon="bookOpen" title={t.explore.readings} sub={`${th.READINGS.length} textes progressifs`} />
        <Tile to="/explore/grammar" icon="layers" title={t.explore.grammar} sub={`${th.GRAMMAR.length} fiches courtes`} />
        <Tile to="/explore/classifiers" icon="cube" title={t.explore.classifiers} sub="Compter en thaï" p={m.classifiers.progress} />
      </div>
      <div className="h2">Outils</div>
      <div className="tiles">
        <Tile to="/explore/listen" icon="repeat" title={t.explore.listen} sub="Mode voiture, sans toucher l’écran" />
        <Tile to="/explore/writing" icon="pen" title={t.explore.writing} sub="Au doigt, trait par trait" />
        <Tile to="/explore/phrasebook" icon="globe" title={t.explore.phrasebook} sub="Phrases de voyage, en très grand" />
      </div>
    </>
  );
}
