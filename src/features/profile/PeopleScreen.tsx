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
  const refresh = () => setReg(readRegistry());
  return (
    <>
      <p className="lead">Chaque personne a son parcours, sa mémoire de révision, ses réglages et ses défis. Tout reste sur l’appareil.</p>
      <div className="list">
        {reg.list.map((p) => {
          const active = p.id === reg.active;
          const name = active ? me || p.name || 'Sans nom' : p.name || 'Sans nom';
          return (
            <div className="row" key={p.id}>
              <span className="ico" style={active ? { background: 'var(--acc-soft)' } : undefined}>{name.slice(0, 1).toUpperCase() || '?'}</span>
              <span className="mid"><span className="t">{name}</span><span className="s">{active ? 'Profil actif' : 'Touchez pour passer à ce profil'}</span></span>
              <span className="end">
                {!active && <button className="btn sm auto" onClick={() => { switchProfile(p.id); reloadToHome(); }}>Utiliser</button>}
                {reg.list.length > 1 && <button className="ib sm" aria-label="Supprimer ce profil" onClick={() => setAsk(p.id)}><Icon name="trash" size={16} /></button>}
              </span>
            </div>
          );
        })}
      </div>
      <button className="btn" style={{ marginTop: 14 }} onClick={() => { createProfile(); reloadToHome(); }}>+ Ajouter une personne</button>
      <p className="xs mut" style={{ margin: '8px 2px 0' }}>L’application redémarre sur l’écran de bienvenue du nouveau profil. Pour revenir, repassez par cet écran.</p>
      <Sheet open={!!ask} onClose={() => setAsk(null)} title="Supprimer ce profil ?">
        <p className="lead">Sa progression sera effacée de cet appareil (pensez à l’exporter avant, dans Mes données). Définitif.</p>
        <div className="stack">
          <button className="btn danger" onClick={async () => { const id = ask!; const wasActive = id === reg.active; await deleteProfile(id); setAsk(null); if (wasActive) reloadToHome(); else refresh(); }}>Oui, supprimer</button>
          <button className="btn ghost" onClick={() => setAsk(null)}>Annuler</button>
        </div>
      </Sheet>
    </>
  );
}
