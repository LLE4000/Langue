/** Explorer : la bibliothèque — alphabet, voyelles, tons, nombres, vocabulaire, conversations, lectures, grammaire… */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useMetrics } from '@/app/hooks';
import { th, MAIN_WORDS } from '@/content/th';
import { T } from '@/i18n';
import { Bar } from '@/components/ui';

export function Explore() {
  const t = T();
  usePage(t.explore.title);
  const m = useMetrics();
  const Tile = ({ to, glyph, title, sub, p, cls = '', thai }: { to: string; glyph: string; title: string; sub: string; p?: number; cls?: string; thai?: boolean }) => (
    <Link to={to} className={`tile ${cls}`}><span className={thai ? 'th' : 'e'} lang={thai ? 'th' : undefined}>{glyph}</span><span className="t">{title}</span><span className="s">{sub}</span>{p != null && <Bar p={p} thin />}</Link>
  );
  return (
    <>
      <p className="lead">Tout le contenu, librement. Le parcours reste le fil conducteur : ici, vous approfondissez.</p>
      <div className="tiles" style={{ marginBottom: 4 }}>
        <Link to="/explore/listen" className="tile wide jade-fill"><span className="e">🎧</span><span><span className="t">Écoute en boucle · mode voiture</span><span className="s" style={{ display: 'block' }}>Lettres, voyelles ou vos mots, l’un après l’autre, normal puis lent, sans toucher l’écran. Choisissez deux lettres proches pour entendre la différence.</span></span></Link>
      </div>
      <div className="h2">L’écriture</div>
      <div className="tiles">
        <Tile to="/explore/alphabet" glyph="ก ข ค" thai title={t.explore.alphabet} sub="44 consonnes, 3 classes" p={m.letters.progress} />
        <Tile to="/explore/vowels" glyph="กา กี กู" thai title={t.explore.vowels} sub="Avant, après, dessus, dessous" p={m.vowels.progress} cls="gold" />
        <Tile to="/explore/tones" glyph="ก่ ก้ ก๊ ก๋" thai title={t.explore.tones} sub="5 tons, règles, séries" p={m.tones.progress} cls="red" />
        <Tile to="/explore/writing" glyph="✍️" title={t.explore.writing} sub="Tracer au doigt" cls="orange" />
      </div>
      <div className="h2">Parler et comprendre</div>
      <div className="tiles">
        <Tile to="/explore/vocab" glyph="🗂️" title={t.explore.vocabulary} sub={`${MAIN_WORDS.length} mots · ${th.VOCAB_THEMES.length} thèmes`} p={Math.min(1, m.words.known / 300)} />
        <Tile to="/explore/dialogs" glyph="💬" title={t.explore.conversations} sub={`${th.DIALOGS.length} situations réelles`} cls="indigo" />
        <Tile to="/explore/numbers" glyph="๑ ๒ ๓" thai title={t.explore.numbers} sub="๐–๙, prix, convertisseur" p={m.numbers.progress} cls="indigo" />
        <Tile to="/explore/phrasebook" glyph="✈️" title={t.explore.phrasebook} sub="À montrer en très grand" cls="plum" />
      </div>
      <div className="h2">Comprendre la langue</div>
      <div className="tiles">
        <Tile to="/explore/readings" glyph="📖" title={t.explore.readings} sub={`${th.READINGS.length} textes progressifs`} cls="plum" />
        <Tile to="/explore/grammar" glyph="🧩" title={t.explore.grammar} sub={`${th.GRAMMAR.length} fiches courtes`} cls="gold" />
        <Tile to="/explore/classifiers" glyph="📦" title={t.explore.classifiers} sub="Compter en thaï" p={m.classifiers.progress} cls="orange" />
        <Tile to="/explore/transcription" glyph="🔤" title={t.explore.transcription} sub="Lire la phonétique" />
      </div>
    </>
  );
}
