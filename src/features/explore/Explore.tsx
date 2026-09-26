/** Bibliothèque : tout le contenu, librement — alphabet, voyelles, tons, nombres, vocabulaire, conversations, lectures, grammaire… */
import { Link, NavLink } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useMetrics, useProgress } from '@/app/hooks';
import { th, MAIN_WORDS } from '@/content/th';
import { T } from '@/i18n';
import { Bar, Icon } from '@/components/ui';

// La loupe vit dans la bibliothèque (élément stable : un nouvel élément à chaque rendu relancerait usePage)
const SEARCH_BUTTON = <NavLink to="/explore/search" className="tb" aria-label="Rechercher"><Icon name="search" /></NavLink>;

/** Une tuile : un glyphe thaï (le contenu lui-même) ou une icône, un titre, une ligne, et l'avancement s'il existe. */
function Tile({ to, thai, icon, title, sub, p }: { to: string; thai?: string; icon?: string; title: string; sub: string; p?: number }) {
  return (
    <Link to={to} className="tile">
      {thai ? <span className="th" lang="th">{thai}</span> : <span className="ic"><Icon name={icon ?? 'book'} /></span>}
      <span className="t">{title}</span><span className="s">{sub}</span>
      {p != null && <Bar p={p} thin />}
    </Link>
  );
}

export function Explore() {
  const t = T();
  usePage(t.explore.title, { right: SEARCH_BUTTON, avatar: true, thai: { th: 'ห้องสมุด', rom: 'hɔ̂ng-sà-mùt' } });
  const m = useMetrics();
  const prog = useProgress();
  const vocab = prog.skills.find((s) => s.id === 'vocab')!;
  return (
    <>
      <p className="lead">Tout le contenu, librement. Le parcours reste le fil conducteur : ici, vous approfondissez.</p>
      <div className="tiles">
        <Link to="/explore/listen" className="tile wide feature"><span className="ic"><Icon name="headphones" /></span><span><span className="t">Écoute en boucle · mode voiture</span><span className="s">Lettres, voyelles ou vos mots, normal puis lent, sans toucher l’écran.</span></span></Link>
      </div>
      <div className="h2">L’écriture</div>
      <div className="tiles">
        <Tile to="/explore/alphabet" thai="ก ข ค" title={t.explore.alphabet} sub="44 consonnes, 3 classes" p={m.letters.progress} />
        <Tile to="/explore/vowels" thai="กา กี กู" title={t.explore.vowels} sub="Avant, après, dessus, dessous" p={m.vowels.progress} />
        <Tile to="/explore/tones" thai="ก่ ก้ ก๊ ก๋" title={t.explore.tones} sub="5 tons, règles, séries" p={m.tones.progress} />
        <Tile to="/explore/writing" icon="pen" title={t.explore.writing} sub="Tracer au doigt" />
      </div>
      <div className="h2">Au quotidien</div>
      <div className="tiles">
        <Tile to="/explore/vocab" icon="grid" title={t.explore.vocabulary} sub={`${prog.counts.wordsAcquired} acquis sur ${MAIN_WORDS.length} · ${th.VOCAB_THEMES.length} thèmes`} p={vocab.value / 100} />
        <Tile to="/explore/dialogs" icon="chat" title={t.explore.conversations} sub={`${th.DIALOGS.length} situations réelles`} />
        <Tile to="/explore/comprehension" icon="headphones" title="Compréhension orale" sub="Écouter, puis répondre en français" />
        <Tile to="/explore/numbers" thai="๑ ๒ ๓" title={t.explore.numbers} sub="๐–๙, prix, convertisseur" p={m.numbers.progress} />
        <Tile to="/explore/phrasebook" icon="globe" title={t.explore.phrasebook} sub="À montrer en très grand" />
      </div>
      <div className="h2">Approfondir</div>
      <div className="tiles">
        <Tile to="/explore/readings" icon="bookOpen" title={t.explore.readings} sub={`${th.READINGS.length} textes progressifs`} />
        <Tile to="/explore/grammar" icon="layers" title={t.explore.grammar} sub={`${th.GRAMMAR.length} fiches courtes`} />
        <Tile to="/explore/classifiers" icon="cube" title={t.explore.classifiers} sub="Compter en thaï" p={m.classifiers.progress} />
        <Tile to="/explore/transcription" icon="type" title="Phonétique" sub="Lire la transcription" />
      </div>
    </>
  );
}
