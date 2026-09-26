/** Mes données : sauvegarde (export), restauration (import avec confirmation), réinitialisation. */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, exportState, isValidExport, type PersistedState } from '@/app/store';
import { todayKey } from '@/engine/util';
import { T } from '@/i18n';
import { Sheet, useToast, Icon } from '@/components/ui';

export function DataScreen() {
  const t = T();
  usePage(t.profile.data, { back: '/profile' });
  const toast = useToast((s) => s.show);
  const nav = useNavigate();
  const importState = useStore((s) => s.importState);
  const resetAll = useStore((s) => s.resetAll);
  const me = useStore((s) => s.profile?.name ?? '');
  const [txt, setTxt] = useState('');
  const [ask, setAsk] = useState(false);
  const [pending, setPending] = useState<PersistedState | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const doExport = () => {
    try {
      const blob = new Blob([JSON.stringify(exportState(), null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `langue-progression-${todayKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
      toast('Sauvegarde exportée.');
    } catch { toast('Export en fichier impossible ici : utilisez « Copier la sauvegarde ».'); }
  };
  const prepareImport = (text: string) => {
    try { const o = JSON.parse(text); if (!isValidExport(o)) throw new Error(); setPending(o as PersistedState); }
    catch { toast('Ce contenu n’est pas une sauvegarde valide.'); }
  };
  const confirmImport = () => { if (!pending) return; importState(pending); setPending(null); toast('Progression restaurée.'); nav('/'); };
  const pendingName = pending?.profile?.name ?? 'inconnu';
  const pendingWords = pending ? Object.keys(pending.srs ?? {}).length : 0;
  return (
    <>
      <div className="note info mt-0">Votre progression est enregistrée automatiquement sur cet appareil. Exportez une sauvegarde de temps en temps, ou pour passer sur un autre téléphone.</div>
      <div className="h2">Sauvegarder</div>
      <button className="btn" onClick={doExport}><Icon name="download" size={18} /> Exporter une sauvegarde</button>
      <div className="h2">Restaurer</div>
      <button className="btn ghost" onClick={() => file.current?.click()}><Icon name="upload" size={18} /> Importer une sauvegarde</button>
      <input ref={file} type="file" accept=".json,application/json,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => prepareImport(String(r.result)); r.readAsText(f); e.target.value = ''; }} />
      <details className="note plain sm">
        <summary>Plus d’options : copier, coller</summary>
        <div className="stack mt-3">
          <button className="btn soft sm" onClick={() => navigator.clipboard?.writeText(JSON.stringify(exportState())).then(() => toast('Sauvegarde copiée.'), () => toast('Copie impossible.'))}>Copier la sauvegarde (texte)</button>
          <textarea className="field" placeholder="…ou collez ici le texte d’une sauvegarde" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <button className="btn ghost sm" disabled={!txt.trim()} onClick={() => prepareImport(txt)}>Restaurer le texte collé</button>
        </div>
        <p className="foot-note">Format de sauvegarde : texte lisible, version {exportState().version}.</p>
      </details>
      <div className="h2">Réinitialiser</div>
      <button className="btn danger" onClick={() => setAsk(true)}><Icon name="trash" size={18} /> Effacer toute ma progression</button>

      <Sheet open={!!pending} onClose={() => setPending(null)} title="Remplacer la progression ?" footer={null}>
        <p className="lead">La sauvegarde de <b>{pendingName}</b> ({pendingWords} élément{pendingWords > 1 ? 's' : ''} en mémoire) remplacera la progression actuelle de <b>{me}</b> sur cet appareil. Cette action est définitive.</p>
        <div className="stack"><button className="btn" onClick={confirmImport}>Oui, remplacer</button><button className="btn ghost" onClick={() => setPending(null)}>Annuler</button></div>
      </Sheet>
      <Sheet open={ask} onClose={() => setAsk(false)} title="Tout effacer ?" footer={null}>
        <p className="lead">Toute la progression, les favoris et l’historique de <b>{me}</b> seront effacés de cet appareil. Pensez à exporter d’abord. Cette action est définitive.</p>
        <div className="stack"><button className="btn danger" onClick={() => { resetAll(); nav('/onboarding', { replace: true }); }}>Oui, tout effacer</button><button className="btn ghost" onClick={() => setAsk(false)}>Annuler</button></div>
      </Sheet>
    </>
  );
}
