/** Mes données : export JSON, import (fichier ou texte collé), réinitialisation. */
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore, exportState, isValidExport } from '@/app/store';
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
  const [txt, setTxt] = useState('');
  const [ask, setAsk] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const doExport = () => {
    try {
      const blob = new Blob([JSON.stringify(exportState(), null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `langue-progression-${todayKey()}.json`; document.body.appendChild(a); a.click(); a.remove();
      toast('Sauvegarde exportée.');
    } catch { toast('Export en fichier impossible ici : utilisez « Copier le JSON ».'); }
  };
  const doImport = (text: string) => {
    try { const o = JSON.parse(text); if (!isValidExport(o)) throw new Error(); importState(o); toast('Progression importée.'); nav('/'); }
    catch { toast('Ce contenu n’est pas une sauvegarde valide.'); }
  };
  return (
    <>
      <div className="note info">✅ Sauvegarde automatique sur cet appareil (IndexedDB). Exportez de temps en temps pour ne jamais perdre votre progression, ou pour la transférer sur un autre appareil.</div>
      <div className="h2">Exporter</div>
      <div className="btns"><button className="btn" onClick={doExport}><Icon name="download" size={18} /> {t.profile.export}</button><button className="btn soft" onClick={() => navigator.clipboard?.writeText(JSON.stringify(exportState())).then(() => toast('JSON copié.'), () => toast('Copie impossible.'))}>Copier le JSON</button></div>
      <div className="h2">Importer</div>
      <button className="btn ghost" onClick={() => file.current?.click()}><Icon name="upload" size={18} /> {t.profile.import} (fichier)</button>
      <input ref={file} type="file" accept=".json,application/json,text/plain" hidden onChange={(e) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => doImport(String(r.result)); r.readAsText(f); }} />
      <textarea className="field" style={{ marginTop: 10 }} placeholder="…ou collez ici le JSON d’une sauvegarde" value={txt} onChange={(e) => setTxt(e.target.value)} />
      <button className="btn ghost sm" style={{ marginTop: 8 }} disabled={!txt.trim()} onClick={() => doImport(txt)}>Importer le JSON collé</button>
      <div className="h2">Réinitialiser</div>
      <button className="btn danger" onClick={() => setAsk(true)}><Icon name="trash" size={18} /> {t.profile.reset} toute ma progression</button>
      <Sheet open={ask} onClose={() => setAsk(false)} title="Réinitialiser ?">
        <p className="lead">Toute la progression, les favoris et l’historique seront effacés de cet appareil. Pensez à exporter d’abord. Cette action est définitive.</p>
        <div className="stack"><button className="btn danger" onClick={() => { resetAll(); nav('/onboarding', { replace: true }); }}>Oui, tout effacer</button><button className="btn ghost" onClick={() => setAsk(false)}>Annuler</button></div>
      </Sheet>
      <p className="xs mut ctr" style={{ marginTop: 16 }}>Format : JSON lisible, versionné (version {exportState().version}). Une synchronisation entre appareils pourra s’appuyer sur ce même format.</p>
    </>
  );
}
