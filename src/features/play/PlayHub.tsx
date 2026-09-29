/** Onglet Défis : les jeux à plusieurs (sans classement permanent ni compte), puis les profils de joueurs et la comparaison des progrès. */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { readRegistry } from '@/app/profiles';
import { recognizer } from '@/app/services/speech';
import { Icon, Ico } from '@/components/ui';
import { T, frTypo } from '@/i18n';
import { OnlineRow } from './Online';

export function PlayHub() {
  const t = T();
  usePage(t.nav.play, { avatar: true, thai: { th: 'ท้าทาย', rom: 'tháa-thaai' } });
  const records = useStore((s) => s.challenges);
  const pending = records.filter((r) => r.dir === 'sent' && !r.theirs).length;
  const people = Math.max(1, readRegistry().list.filter((p) => p.name).length);
  return (
    <>
      <p className="lead">{frTypo('Apprendre à deux, c’est tenir plus longtemps. Sans compte ni classement mondial : on se mesure à quelqu’un qu’on connaît.')}</p>
      <div className="list">
        <Link className="row" to="/play/duel"><Ico name="swords" tone="plum" /><span className="mid"><span className="t">Duel sur un écran</span><span className="s">Deux joueurs, un appareil posé entre vous, la même question des deux côtés. Le plus rapide marque.</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
        <Link className="row" to="/play/turns"><Ico name="users" tone="plum" /><span className="mid"><span className="t">Tour à tour</span><span className="s">{frTypo('De 2 à 6 joueurs, on se passe l’appareil : même série, chrono, résultats à la fin.')}</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
        {recognizer.supported && <Link className="row" to="/play/voice"><Ico name="mic" tone="plum" /><span className="mid"><span className="t">Duel de prononciation</span><span className="s">{frTypo('Les mêmes mots pour tous ; chacun les dit à son tour, le moteur thaï note sur 10. Le plus clair gagne, pas le plus rapide.')}</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>}
        <OnlineRow />
        <Link className="row" to="/play/defi"><Ico name="send" tone="plum" /><span className="mid"><span className="t">Défi à distance</span><span className="s">{frTypo('Jouez une série, envoyez le lien ; l’autre joue la même et vous renvoie son score.')}{pending ? ` · ${pending} en attente` : ''}</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
      </div>
      <div className="list mt-3">
        <Link className="row" to="/profile/people"><Ico name="users" /><span className="mid"><span className="t">Un profil par joueur · {people} profil{people > 1 ? 's' : ''}</span><span className="s">{frTypo(people > 1 ? 'Changer de joueur ou en ajouter un : chacun garde son parcours, ses révisions et ses défis.' : 'Vous partagez l’appareil ? Créez un profil par personne : chacun garde son parcours, ses révisions et ses défis.')}</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
        <Link className="row" to="/profile/share"><Ico name="share" /><span className="mid"><span className="t">Comparer nos progrès</span><span className="s">Une carte de progression à envoyer, à comparer avec la sienne.</span></span><span className="end"><span className="chev"><Icon name="next" size={18} /></span></span></Link>
      </div>
      <p className="foot-note mt-4"><b>Les mots du jeu</b>&nbsp;: ceux que vous avez appris, ou un thème au choix, ou les nombres.</p>
    </>
  );
}
