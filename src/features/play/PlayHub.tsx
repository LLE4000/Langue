/** Jouer à plusieurs : trois façons de se mesurer sans classement permanent ni serveur. */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { readRegistry } from '@/app/profiles';
import { recognizer } from '@/app/services/speech';

export function PlayHub() {
  usePage('À plusieurs', { back: '/review' });
  const records = useStore((s) => s.challenges);
  const pending = records.filter((r) => r.dir === 'sent' && !r.theirs).length;
  const people = readRegistry().list.filter((p) => p.name).length;
  return (
    <>
      <p className="lead">Apprendre à deux, c’est tenir plus longtemps. {recognizer.supported ? 'Quatre' : 'Trois'} façons de jouer, sans compte ni classement mondial : on se mesure à quelqu’un qu’on connaît.</p>
      <div className="list">
        <Link className="row" to="/play/duel"><span className="ico">⚔️</span><span className="mid"><span className="t">Duel sur un écran</span><span className="s">Deux joueurs, un appareil posé entre vous, la même question des deux côtés. Le plus rapide marque.</span></span><span className="end"><span className="chev">›</span></span></Link>
        <Link className="row" to="/play/turns"><span className="ico">🔁</span><span className="mid"><span className="t">Tour à tour</span><span className="s">De 2 à 6 joueurs, on se passe l’appareil : même série, chrono, résultats à la fin.</span></span><span className="end"><span className="chev">›</span></span></Link>
        {recognizer.supported && <Link className="row" to="/play/voice"><span className="ico">🎙️</span><span className="mid"><span className="t">Duel de prononciation</span><span className="s">2 à 6 joueurs, les mêmes mots pour tous ; chacun les dit à son tour, le moteur thaï note sur 10. Le plus clair gagne, pas le plus rapide.</span></span><span className="end"><span className="chev">›</span></span></Link>}
        <Link className="row" to="/play/defi"><span className="ico">📨</span><span className="mid"><span className="t">Défi à distance</span><span className="s">Jouez une série, envoyez le lien ; l’autre joue la même et vous renvoie son score.{pending ? ` · ${pending} en attente` : ''}</span></span><span className="end"><span className="chev">›</span></span></Link>
      </div>
      <div className="h2">Bon à savoir</div>
      <div className="note plain sm">
        <b>Chacun son profil.</b> {people > 1 ? `${people} personnes utilisent cet appareil.` : 'Si vous partagez l’appareil, créez un profil par personne'} (Profil › Personnes sur cet appareil) : chacun garde son parcours, sa mémoire de révision et ses défis.
      </div>
      <div className="note plain sm"><b>Les mots du jeu.</b> Par défaut, ce que vous avez déjà appris ; sinon un thème au choix ou les nombres. Un débutant peut donc défier quelqu’un de plus avancé sur un thème qu’il vient de voir.</div>
    </>
  );
}
