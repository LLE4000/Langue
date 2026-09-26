/** Personnes sur cet appareil : changer de profil, en ajouter, en supprimer. */
import { useState } from 'react';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { createProfile, deleteProfile, readRegistry, reloadToHome, switchProfile } from '@/app/profiles';
import { Icon, Sheet } from '@/components/ui';

export function PeopleScreen() {
  usePage('Personnes sur cet appareil', { back: '/profile' });
  const me = useStore((s) => s.profile?.name ?? '');
  const [reg, setReg] = useState(readRegistry());
  const [ask, setAsk] = useState<string | null>(null);
  const [askAdd, setAskAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const refresh = () => setReg(readRegistry());
  const nameOf = (id: string) => { const p = reg.list.find((x) => x.id === id); return (p?.id === reg.active ? me || p.name : p?.name) || 'Sans nom'; };
  return (
    <>
      <p className="lead">Chaque personne a son parcours, sa mémoire de révision, ses réglages et ses défis. Tout reste sur l’appareil.</p>
      <div className="h2 mt-0">Profils <span className="sp" />{reg.list.length > 1 && <button onClick={() => setEdit(!edit)}>{edit ? 'Terminer' : 'Modifier'}</button>}</div>
      <div className="list">
        {reg.list.map((p) => {
          const active = p.id === reg.active;
          const name = nameOf(p.id);
          return (
            <button className="row" key={p.id} onClick={() => { if (!active && !edit) { switchProfile(p.id); reloadToHome(); } }} disabled={active && !edit} aria-current={active ? 'true' : undefined}>
              <span className={`ico ${active ? 'acc' : ''}`}>{name.slice(0, 1).toUpperCase() || '?'}</span>
              <span className="mid"><span className="t">{name}</span><span className="s">{active ? 'Profil actif' : 'Touchez pour passer à ce profil'}</span></span>
              <span className="end">
                {edit && reg.list.length > 1 ? <span className="ib sm" role="button" aria-label={`Supprimer le profil de ${name}`} onClick={(e) => { e.stopPropagation(); setAsk(p.id); }}><Icon name="trash" size={16} /></span> : active ? <Icon name="check" size={18} /> : <span className="chev">›</span>}
              </span>
            </button>
          );
        })}
      </div>
      <p className="sm mut mt-4 mb-2">Ajouter une personne redémarre l’application sur l’écran de bienvenue du nouveau profil. Pour revenir à votre profil, repassez par cet écran.</p>
      <button className="btn" onClick={() => setAskAdd(true)}>+ Ajouter une personne</button>

      <Sheet open={askAdd} onClose={() => setAskAdd(false)} title="Ajouter une personne ?" footer={null}>
        <p className="lead">L’application va redémarrer sur l’écran de bienvenue pour créer le nouveau profil. Votre progression est conservée.</p>
        <div className="stack"><button className="btn" onClick={() => { createProfile(); reloadToHome(); }}>Créer le profil</button><button className="btn ghost" onClick={() => setAskAdd(false)}>Annuler</button></div>
      </Sheet>
      <Sheet open={!!ask} onClose={() => setAsk(null)} title={`Supprimer le profil de ${ask ? nameOf(ask) : ''} ?`} footer={null}>
        <p className="lead">Sa progression sera effacée de cet appareil. Pour la garder, passez d’abord sur ce profil et exportez une sauvegarde (Profil › Mes données). Cette action est définitive.</p>
        <div className="stack">
          <button className="btn danger" onClick={async () => { const id = ask!; const wasActive = id === reg.active; await deleteProfile(id); setAsk(null); if (wasActive) reloadToHome(); else refresh(); }}>Oui, supprimer</button>
          <button className="btn ghost" onClick={() => setAsk(null)}>Annuler</button>
        </div>
      </Sheet>
    </>
  );
}
