/**
 * Réglages, volontairement courts : trois onglets, seulement les choix qui changent vraiment l'expérience.
 * Tout ce qui relève du dépannage est replié en bas de l'onglet Voix.
 */
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { tts, clips, useSpeaker, useVoices, recognizer, recorder } from '@/app/services/speech';
import { WebSpeechProvider, type VoiceGender } from '@/engine/audio/tts';
import { azureConfig, saveAzureConfig, testAzure } from '@/engine/audio/azure';
import { T } from '@/i18n';
import { Icon, Segmented, Thai, useToast } from '@/components/ui';

type Tab = 'profile' | 'voice' | 'exercises';
const TABS: { id: Tab; label: string }[] = [{ id: 'profile', label: 'Profil' }, { id: 'voice', label: 'Voix' }, { id: 'exercises', label: 'Exercices' }];
const SAMPLE = 'สวัสดี{P} ยินดีที่ได้รู้จัก';

function ProfileTab() {
  const profile = useStore((s) => s.profile)!;
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  return (
    <>
      <label className="f" htmlFor="pname">Prénom</label>
      <input id="pname" className="field" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && updateProfile({ name: name.trim() })} />
      <label className="f">Je suis</label>
      <Segmented value={profile.gender} options={[{ v: 'm', label: <>Un homme · <Thai text="ครับ" /></> }, { v: 'f', label: <>Une femme · <Thai text="ค่ะ" /></> }]} onChange={(g) => updateProfile({ gender: g })} />
      <label className="f">Objectif par jour</label>
      <Segmented value={profile.dailyGoalMinutes} options={[5, 10, 15, 30].map((g) => ({ v: g, label: `${g} min` }))} onChange={(g) => updateProfile({ dailyGoalMinutes: g })} />
      <div className="list mt-5">
        <Link className="row" to="/profile/levels"><span className="mid"><span className="t">Objectif et niveaux</span><span className="s">Parler, lire et écrire · niveau de départ</span></span><span className="end"><span className="chev">›</span></span></Link>
      </div>
    </>
  );
}

/** Voix natives pré-générées : une ligne d'état et le téléchargement pour le hors-ligne. Rien si elles n'existent pas. */
function NativeVoices() {
  const { native } = useVoices();
  const [prog, setProg] = useState<Record<string, string>>({});
  const toast = useToast((s) => s.show);
  if (!native) return null;
  const dl = async (g: 'm' | 'f') => {
    setProg((p) => ({ ...p, [g]: '0 %' }));
    const n = await clips.downloadAll(g, (done, total) => setProg((p) => ({ ...p, [g]: `${Math.round((done / total) * 100)} %` })));
    setProg((p) => ({ ...p, [g]: 'prêt' }));
    toast(`${n} clips gardés pour le hors-ligne.`);
  };
  return (
    <>
      <label className="f">Voix natives thaïes <span className="xs">· installées, {clips.count('m')} phrases par voix</span></label>
      <div className="btns"><button className="btn soft sm" onClick={() => dl('m')} disabled={!!prog.m && prog.m !== 'prêt'}>Garder la voix d’homme hors ligne{prog.m ? ` · ${prog.m}` : ''}</button><button className="btn soft sm" onClick={() => dl('f')} disabled={!!prog.f && prog.f !== 'prêt'}>Garder la voix de femme hors ligne{prog.f ? ` · ${prog.f}` : ''}</button></div>
    </>
  );
}

/** Marque d'état (disponible ou non) devant une ligne `.status`. */
const StatusMark = ({ ok }: { ok: boolean }) => <i className={ok ? 'ok-t' : 'ko-t'} role="img" aria-label={ok ? 'Disponible' : 'Indisponible'}><Icon name={ok ? 'check' : 'close'} size={18} /></i>;

/** Dépannage : tout ce qui ne sert que si la voix de l'appareil pose problème. Replié. */
function VoiceTroubleshooting() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const { status } = useVoices();
  const toast = useToast((s) => s.show);
  const voices = tts.voices(), target = tts.targetVoices();
  const genderOf = (v: { id: string; gender?: VoiceGender }) => settings.voiceGenders?.[v.id] ?? v.gender;
  const unknown = target.filter((v) => !genderOf(v));
  const msg: Record<string, string> = {
    ok: `${target.length} voix thaïe${target.length > 1 ? 's' : ''} sur cet appareil.`,
    searching: 'Recherche des voix de l’appareil…',
    unknown: 'Aucune voix communiquée par le navigateur pour l’instant. Touchez « Essayer ».',
    none: `Aucune voix thaïe sur cet appareil (${voices.length} voix listées).`,
    unsupported: 'Ce navigateur ne propose pas de synthèse vocale.',
  };
  return (
    <details className="fold sm mt-5">
      <summary>La voix pose problème ?</summary>
      <div className={`note sm mt-1 ${status === 'ok' ? 'info' : status === 'none' || status === 'unsupported' ? 'warn' : 'plain'}`}>{msg[status]}</div>
      <div className="btns"><button className="btn ghost sm" onClick={() => tts.speak('สวัสดีครับ', { force: true })}>Essayer la voix de l’appareil</button><button className="btn ghost sm" onClick={() => { tts.rescan(); toast('Détection relancée.'); }}>Relancer la détection</button></div>
      {status === 'none' && <>
        <label className="f">Forcer la lecture en th-TH</label>
        <Segmented value={settings.forceTTS} options={[{ v: false, label: 'Non' }, { v: true, label: 'Oui' }]} onChange={(v) => update({ forceTTS: v })} />
        <p className="foot-note">Android : Paramètres › Système › Langues et saisie › Synthèse vocale › moteur Google › Installer les données vocales › Thaï. iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Thaï.</p>
      </>}
      {target.length > 1 && <><label className="f" htmlFor="voice">Imposer une voix de l’appareil</label><select id="voice" className="field" value={settings.voiceId} onChange={(e) => update({ voiceId: e.target.value })}><option value="">Automatique</option>{target.map((v) => <option key={v.id} value={v.id}>{v.name}{v.local ? '' : ' · en ligne'}</option>)}</select></>}
      {unknown.length > 0 && <>
        <label className="f">Homme ou femme ? <span className="xs">(voix que l’application ne sait pas classer)</span></label>
        <div className="stack">{unknown.map((v) => <div key={v.id} className="row-flex"><button className="ib sm" onClick={() => tts.speak('สวัสดีครับ ยินดีที่ได้รู้จัก', { voiceId: v.id, force: true })} aria-label={`Écouter ${v.name}`}><Icon name="play" size={16} /></button><span className="sm grow clip">{v.name}</span><div className="seg compact">{(['m', 'f'] as const).map((g) => <button key={g} className={settings.voiceGenders?.[v.id] === g ? 'on' : ''} onClick={() => update({ voiceGenders: { ...settings.voiceGenders, [v.id]: g } })}>{g === 'm' ? 'Homme' : 'Femme'}</button>)}</div></div>)}</div>
      </>}
      <div className="list pad mt-3 mb-4"><div className="status"><StatusMark ok={recorder.supported} /><span>Micro et analyse du ton</span></div><div className="status"><StatusMark ok={recognizer.supported} /><span>Reconnaissance vocale thaïe{recognizer.supported ? '' : ' · indisponible sur ce navigateur'}</span></div></div>
      <button className="btn ghost sm mb-4" onClick={() => { const rep = tts instanceof WebSpeechProvider ? tts.report() : 'Synthèse vocale indisponible'; navigator.clipboard?.writeText(rep).then(() => toast('Diagnostic copié.'), () => toast('Copie impossible.')); }}>Copier le diagnostic</button>
    </details>
  );
}

/**
 * Évaluation Azure de la lecture à voix haute : facultative, avec la clé personnelle de l'apprenant, gardée sur cet
 * appareil uniquement (hors sauvegardes). Repliée : la plupart des gens n'en ont pas besoin.
 */
function AzureAssessment() {
  const toast = useToast((s) => s.show);
  const cur = azureConfig();
  const [key, setKey] = useState(cur?.key ?? '');
  const [region, setRegion] = useState(cur?.region ?? 'northeurope');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!key.trim()) { saveAzureConfig(null); toast('Évaluation Azure désactivée.'); return; }
    setBusy(true);
    const err = await testAzure({ key, region });
    setBusy(false);
    if (err) { toast(err); return; }
    saveAzureConfig({ key, region });
    toast('Clé Azure vérifiée : la lecture à voix haute l’utilisera.');
  };
  return (
    <details className="fold sm mt-5">
      <summary>Évaluation Azure de la lecture {cur ? '· active' : '(facultatif)'}</summary>
      <p className="sm mut mt-1">Avec votre propre clé <b>Azure Speech</b> (niveau gratuit F0), chaque bloc de six lectures du tapis de lecture est comparé au texte attendu : précision par syllabe, lectures omises. Azure ne note pas les tons en thaï. La clé reste sur cet appareil, hors des sauvegardes.</p>
      <label className="f" htmlFor="azkey">Clé</label>
      <input id="azkey" className="field" type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder="Clé 1 de la ressource Speech" />
      <label className="f" htmlFor="azreg">Région</label>
      <input id="azreg" className="field" value={region} onChange={(e) => setRegion(e.target.value)} placeholder="northeurope" />
      <div className="btns mt-3 mb-4"><button className="btn soft sm" onClick={save} disabled={busy}>{busy ? 'Vérification…' : key.trim() ? 'Vérifier et enregistrer' : 'Désactiver'}</button>{cur && <button className="btn ghost sm" onClick={() => { saveAzureConfig(null); setKey(''); toast('Clé effacée de cet appareil.'); }}>Effacer la clé</button>}</div>
    </details>
  );
}

const SLOW_OPTIONS = [{ v: 0.7, label: 'Un peu' }, { v: 0.6, label: 'Lente' }, { v: 0.5, label: 'Très lente' }];
const nearestSlow = (r: number) => SLOW_OPTIONS.reduce((a, o) => (Math.abs(o.v - r) < Math.abs(a - r) ? o.v : a), SLOW_OPTIONS[0].v);

function VoiceTab() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const profile = useStore((s) => s.profile)!;
  const sp = useSpeaker();
  const wanted: VoiceGender = settings.voiceGender === 'auto' ? profile.gender : settings.voiceGender;
  return (
    <>
      <label className="f mt-0">Je préfère entendre</label>
      <Segmented value={settings.voiceGender ?? 'auto'} options={[{ v: 'auto' as const, label: `Comme moi` }, { v: 'm' as const, label: 'Un homme' }, { v: 'f' as const, label: 'Une femme' }]} onChange={(v) => update({ voiceGender: v })} />
      <div className="btns mt-3"><button className="btn soft sm" onClick={() => sp.speak(SAMPLE)}><Icon name="play" size={16} /> Écouter</button><button className="btn ghost sm" onClick={() => sp.speak(SAMPLE, { speaker: wanted === 'm' ? 'f' : 'm' })}><Icon name="play" size={16} /> L’interlocuteur</button></div>
      <label className="f">Lecture lente <Icon name="turtle" size={16} /></label>
      <Segmented value={nearestSlow(settings.slowRate)} options={SLOW_OPTIONS} onChange={(v) => update({ slowRate: v })} />
      <label className="f">Lire à voix haute automatiquement</label>
      <Segmented value={settings.autoAudio} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non' }]} onChange={(v) => update({ autoAudio: v })} />
      <NativeVoices />
      <AzureAssessment />
      <VoiceTroubleshooting />
    </>
  );
}

function ExercisesTab() {
  const t = T();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const strict = settings.pronStrictness === 'strict' ? 'strict' : 'normal';
  return (
    <>
      <label className="f mt-0">Passer à la suite après une bonne réponse</label>
      <Segmented value={settings.autoAdvance !== false} options={[{ v: true, label: 'Automatiquement' }, { v: false, label: 'Quand je touche' }]} onChange={(v) => update({ autoAdvance: v })} />
      <label className="f">Phonétique sous le thaï</label>
      <Segmented value={settings.translit} options={[{ v: 'always', label: 'Toujours' }, { v: 'learning', label: 'Tant que je ne lis pas' }, { v: 'hidden', label: 'Jamais' }]} onChange={(v) => update({ translit: v })} />
      <label className="f">Contrôle de prononciation</label>
      <Segmented value={strict} options={[{ v: 'normal' as const, label: 'Normal' }, { v: 'strict' as const, label: 'Strict' }]} onChange={(v) => update({ pronStrictness: v })} />
      <label className="f">{t.profile.theme}</label>
      <Segmented value={settings.theme} options={[{ v: 'auto', label: 'Automatique' }, { v: 'light', label: 'Clair' }, { v: 'dark', label: 'Sombre' }]} onChange={(v) => update({ theme: v })} />
      <label className="f">{t.profile.thaiSize}</label>
      <Segmented value={settings.thaiSize} options={[{ v: 1, label: 'Normale' }, { v: 1.15, label: 'Grande' }, { v: 1.3, label: 'Très grande' }]} onChange={(v) => update({ thaiSize: v })} />
      <label className="f">Forme des lettres</label>
      <Segmented value={settings.showModern} options={[{ v: true, label: <>Les deux · <Thai text="ก" /> <Thai text="ก" modern /></> }, { v: false, label: <>Classique · <Thai text="ก" /></> }]} onChange={(v) => update({ showModern: v })} />
    </>
  );
}

export function Settings() {
  const t = T();
  usePage(t.profile.settings, { back: '/profile' });
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab') === 'display' ? 'exercises' : params.get('tab');
  const tab: Tab = (TABS.some((x) => x.id === raw) ? raw : 'profile') as Tab;
  return (
    <>
      <div className="seg tabs" role="tablist" aria-label="Réglages">{TABS.map((x) => <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setParams({ tab: x.id }, { replace: true })}>{x.label}</button>)}</div>
      <div className="tabpane" role="tabpanel">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'voice' && <VoiceTab />}
        {tab === 'exercises' && <ExercisesTab />}
      </div>
    </>
  );
}
