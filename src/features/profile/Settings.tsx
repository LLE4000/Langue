/** Réglages, en quatre onglets courts : Profil · Voix · Exercices · Affichage. */
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { tts, clips, useSpeaker, useVoices, recognizer, recorder } from '@/app/services/speech';
import { WebSpeechProvider, chooseVoice, type VoiceGender } from '@/engine/audio/tts';
import { activePack } from '@/content/packs';
import { T } from '@/i18n';
import { Segmented, Thai, useToast } from '@/components/ui';

type Tab = 'profile' | 'voice' | 'exercises' | 'display';
const TABS: { id: Tab; label: string }[] = [{ id: 'profile', label: 'Profil' }, { id: 'voice', label: 'Voix' }, { id: 'exercises', label: 'Exercices' }, { id: 'display', label: 'Affichage' }];

/** Choix homme / femme de la voix, et attribution manuelle d'un genre aux voix inconnues. */
function VoiceGenderSection() {
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const profile = useStore((s) => s.profile)!;
  const sp = useSpeaker();
  const target = tts.targetVoices();
  if (!target.length) return null;
  const wanted: VoiceGender = settings.voiceGender === 'auto' ? profile.gender : settings.voiceGender;
  const pick = chooseVoice(target, { voiceId: settings.voiceId, gender: wanted, voiceGenders: settings.voiceGenders, speechLang: activePack().speechLang });
  const genderOf = (v: { id: string; name: string; gender?: VoiceGender }) => settings.voiceGenders?.[v.id] ?? v.gender;
  const unknown = target.filter((v) => !genderOf(v));
  const label = (g: VoiceGender) => (g === 'm' ? 'homme' : 'femme');
  return (
    <>
      <label className="f">Je préfère entendre</label>
      <Segmented value={settings.voiceGender ?? 'auto'} options={[{ v: 'auto' as const, label: `Comme moi (${label(profile.gender)})` }, { v: 'm' as const, label: 'Un homme' }, { v: 'f' as const, label: 'Une femme' }]} onChange={(v) => update({ voiceGender: v })} />
      {pick.approx ? (
        <>
          <div className="note warn sm" style={{ marginTop: 10 }}>Aucune voix thaïe <b>{label(wanted)}</b> n’est installée sur cet appareil. {settings.voiceApprox !== false ? `La voix disponible est ${wanted === 'm' ? 'rendue plus grave' : 'rendue plus aiguë'} pour s’en approcher : c’est une approximation, pas une vraie voix ${label(wanted)}.` : 'La voix disponible est lue telle quelle.'}</div>
          <label className="f">Approcher la voix voulue (plus grave / plus aiguë)</label>
          <Segmented value={settings.voiceApprox !== false} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non, voix d’origine' }]} onChange={(v) => update({ voiceApprox: v })} />
          <p className="xs mut" style={{ margin: '8px 2px 0' }}>Pour une vraie voix {label(wanted)} : sur PC, Microsoft Edge propose les voix thaïes « Niwat » (homme) et « Premwadee » (femme), très naturelles. Sur Android et iPhone, les voix thaïes fournies par Google et Apple sont pour l’instant féminines.</p>
        </>
      ) : (
        <p className="sm mut" style={{ margin: '8px 2px 0' }}>Voix utilisée : <b>{pick.voice?.name}</b>{pick.gender ? ` (${label(pick.gender)})` : ''}. Dans les conversations, l’interlocuteur a une voix de l’autre genre quand c’est possible.</p>
      )}
      {unknown.length > 0 && (
        <>
          <label className="f">Cette voix est celle d’un homme ou d’une femme ? <span className="xs">(l’application ne le devine pas d’après son nom)</span></label>
          <div className="stack">
            {unknown.map((v) => (
              <div key={v.id} className="row-flex">
                <button className="ib sm" onClick={() => tts.speak('สวัสดีครับ ยินดีที่ได้รู้จัก', { voiceId: v.id, force: true })} aria-label={`Écouter ${v.name}`}>▶</button>
                <span className="sm" style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.name}</span>
                <div className="seg" style={{ width: 170 }}>{(['m', 'f'] as const).map((g) => <button key={g} className={settings.voiceGenders?.[v.id] === g ? 'on' : ''} onClick={() => update({ voiceGenders: { ...settings.voiceGenders, [v.id]: g } })}>{g === 'm' ? 'Homme' : 'Femme'}</button>)}</div>
              </div>
            ))}
          </div>
        </>
      )}
      <div className="btns" style={{ marginTop: 10 }}><button className="btn soft sm" onClick={() => sp.speak('สวัสดี{P} ยินดีที่ได้รู้จัก')}>▶ Ma voix</button><button className="btn ghost sm" onClick={() => sp.speak('สวัสดี{P} ยินดีที่ได้รู้จัก', { speaker: wanted === 'm' ? 'f' : 'm' })}>▶ L’interlocuteur</button></div>
    </>
  );
}

function ProfileTab() {
  const profile = useStore((s) => s.profile)!;
  const updateProfile = useStore((s) => s.updateProfile);
  const [name, setName] = useState(profile.name);
  return (
    <>
      <label className="f" htmlFor="pname">Prénom</label>
      <input id="pname" className="field" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && updateProfile({ name: name.trim() })} />
      <label className="f">Je suis <span className="xs">(pour les particules de politesse)</span></label>
      <Segmented value={profile.gender} options={[{ v: 'm', label: <>Un homme · <Thai text="ครับ" /></> }, { v: 'f', label: <>Une femme · <Thai text="ค่ะ" /></> }]} onChange={(g) => updateProfile({ gender: g })} />
      <label className="f">Objectif quotidien</label>
      <Segmented value={profile.dailyGoalMinutes} options={[5, 10, 15, 30].map((g) => ({ v: g, label: `${g} min` }))} onChange={(g) => updateProfile({ dailyGoalMinutes: g })} />
      <p className="sm mut" style={{ margin: '14px 2px 0' }}>L’objectif d’apprentissage (parler, lire et écrire) et les niveaux se règlent dans Profil › Objectif et niveaux.</p>
    </>
  );
}

/** Voix natives pré-générées (Azure) : état, téléchargement pour le hors-ligne. */
function NativeVoicesSection() {
  const { native } = useVoices();
  const [prog, setProg] = useState<Record<string, string>>({});
  const toast = useToast((s) => s.show);
  if (!native) {
    return (
      <details className="fold sm">
        <summary>Voix natives (homme et femme) : pas encore générées</summary>
        <p className="sm mut" style={{ margin: '6px 0 0' }}>Les voix neuronales Niwat (homme) et Premwadee (femme) se génèrent une fois pour toutes, gratuitement, avec un compte Azure : renseignez les secrets <code>AZURE_SPEECH_KEY</code> et <code>AZURE_SPEECH_REGION</code> dans GitHub, puis lancez le workflow « Générer les voix natives ». En attendant, l’application utilise la voix de l’appareil.</p>
      </details>
    );
  }
  const dl = async (g: 'm' | 'f') => {
    setProg((p) => ({ ...p, [g]: '0 %' }));
    const n = await clips.downloadAll(g, (done, total) => setProg((p) => ({ ...p, [g]: `${Math.round((done / total) * 100)} %` })));
    setProg((p) => ({ ...p, [g]: 'prêt' }));
    toast(`${n} clips ${g === 'm' ? 'de la voix d’homme' : 'de la voix de femme'} gardés pour le hors-ligne.`);
  };
  return (
    <>
      <div className="note info" style={{ marginTop: 0 }}>✅ Voix natives disponibles : <b>{clips.count('m')}</b> phrases avec la voix d’homme, <b>{clips.count('f')}</b> avec la voix de femme. Elles sont lues en priorité ; la voix de l’appareil ne sert que pour le reste (prénoms, nombres tapés).</div>
      <label className="f">Garder les voix pour le hors-ligne <span className="xs">(quelques dizaines de Mo par voix, une fois)</span></label>
      <div className="btns"><button className="btn soft sm" onClick={() => dl('m')} disabled={!!prog.m && prog.m !== 'prêt'}>♂ Voix d’homme {prog.m ? `· ${prog.m}` : ''}</button><button className="btn soft sm" onClick={() => dl('f')} disabled={!!prog.f && prog.f !== 'prêt'}>♀ Voix de femme {prog.f ? `· ${prog.f}` : ''}</button></div>
    </>
  );
}

function VoiceTab() {
  const t = T();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const { status } = useVoices();
  const sp = useSpeaker();
  const toast = useToast((s) => s.show);
  const voices = tts.voices(), target = tts.targetVoices();
  const sample = 'สวัสดี{P} ยินดีที่ได้รู้จัก';
  const msg: Record<string, string> = {
    ok: `✅ ${target.length} voix thaïlandaise${target.length > 1 ? 's' : ''} détectée${target.length > 1 ? 's' : ''}.`,
    searching: '🔎 Recherche des voix en cours… Chrome Android met parfois plusieurs secondes à communiquer la liste.',
    unknown: 'ℹ️ Le navigateur ne communique aucune voix (liste vide). Touchez « Tester la voix » : la liste arrive souvent après ce premier essai.',
    none: `❌ Le navigateur liste ${voices.length} voix, mais aucune en thaï. L’application refuse de lire du thaï avec une voix française ou anglaise.`,
    unsupported: '❌ Ce navigateur ne propose pas la synthèse vocale.',
  };
  return (
    <>
      <NativeVoicesSection />
      <div className={`note ${status === 'ok' ? 'info' : status === 'none' || status === 'unsupported' ? 'warn' : ''}`}>{msg[status]}</div>
      <div className="btns"><button className="btn soft sm" onClick={() => sp.speak(sample)}>▶ Tester la voix</button><button className="btn soft sm" onClick={() => sp.speak(sample, { slow: true })}>🐢 Lentement</button></div>
      {status === 'none' && <>
        <p className="sm mut" style={{ margin: '10px 2px 8px' }}><b>Si la voix thaïe Google est pourtant installée</b>, Chrome utilise sans doute un autre moteur vocal (Samsung, etc.) : Paramètres › Système › Langues et saisie › Synthèse vocale › Moteur préféré › Services de synthèse vocale Google. Puis touchez « Relancer la détection ».</p>
        <button className="btn ghost sm" style={{ marginBottom: 8 }} onClick={() => tts.speak('สวัสดีครับ', { force: true })}>▶ Essai forcé en th-TH</button>
        <label className="f">Si l’essai forcé parle bien thaï : toujours lire ainsi</label>
        <Segmented value={settings.forceTTS} options={[{ v: false, label: 'Non' }, { v: true, label: 'Oui, forcer th-TH' }]} onChange={(v) => update({ forceTTS: v })} />
      </>}
      {(status === 'unknown' || status === 'searching') && <p className="sm mut" style={{ margin: '10px 2px 8px' }}>Pour installer la voix sur Android : Paramètres › Système › Langues et saisie › Synthèse vocale › ⚙ du moteur Google › Installer les données vocales › Thaï. Sur iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Thaï.</p>}
      <VoiceGenderSection />
      {target.length > 1 && <><label className="f" htmlFor="voice">Imposer une voix précise</label><select id="voice" className="field" value={settings.voiceId} onChange={(e) => update({ voiceId: e.target.value })}><option value="">Automatique (selon le choix ci-dessus)</option>{target.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.lang}{v.local ? ' · hors ligne' : ' · en ligne'}</option>)}</select></>}
      <label className="f" htmlFor="slow">Vitesse de la lecture lente 🐢 : <b>{Math.round(settings.slowRate * 100)} %</b></label>
      <input id="slow" type="range" min={0.4} max={0.85} step={0.05} value={settings.slowRate} onChange={(e) => update({ slowRate: +e.target.value })} />
      <label className="f">{t.profile.autoAudio} <span className="xs">(réponse d’une carte, ouverture d’une fiche)</span></label>
      <Segmented value={settings.autoAudio} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non' }]} onChange={(v) => update({ autoAudio: v })} />

      <details className="note plain sm" style={{ marginTop: 16 }}>
        <summary>Diagnostic des voix · {voices.length} détectée{voices.length > 1 ? 's' : ''}</summary>
        <div className="btns" style={{ margin: '10px 0' }}><button className="btn ghost sm" onClick={() => { tts.rescan(); toast('Détection des voix relancée.'); }}>🔄 Relancer la détection</button><button className="btn ghost sm" onClick={() => { const rep = tts instanceof WebSpeechProvider ? tts.report() : 'Synthèse vocale indisponible'; navigator.clipboard?.writeText(rep).then(() => toast('Liste des voix copiée.'), () => toast('Copie impossible.')); }}>Copier le diagnostic</button></div>
        <div className="vlist">{voices.length ? voices.slice().sort((a, b) => Number(b.isTarget) - Number(a.isTarget)).map((v) => <div key={v.id} className={`v ${v.isTarget ? 'is' : ''}`}><span>{v.isTarget ? '✓ ' : ''}{v.name}</span><code>{v.lang || '(vide)'}</code></div>) : <div className="v"><span className="mut">Liste vide pour l’instant.</span></div>}</div>
      </details>
    </>
  );
}

function ExercisesTab() {
  const t = T();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const strict = settings.pronStrictness ?? 'normal';
  return (
    <>
      <label className="f" style={{ marginTop: 0 }}>Avance automatique <span className="xs">(après une bonne réponse, la suite arrive seule ; après une erreur, on attend toujours « Continuer »)</span></label>
      <Segmented value={settings.autoAdvance !== false} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non, je touche Continuer' }]} onChange={(v) => update({ autoAdvance: v })} />

      <label className="f">{t.profile.transliteration} <span className="xs">(la phonétique sous le thaï)</span></label>
      <Segmented value={settings.translit} options={[{ v: 'always', label: t.profile.translit.always }, { v: 'learning', label: t.profile.translit.learning }, { v: 'hidden', label: t.profile.translit.hidden }]} onChange={(v) => update({ translit: v })} />
      <p className="sm mut" style={{ margin: '8px 2px 0' }}>{settings.translit === 'always' ? 'La phonétique est toujours affichée.' : settings.translit === 'learning' ? 'La phonétique disparaît progressivement : elle est masquée sur les mots que vous savez lire avec les lettres déjà apprises.' : 'La phonétique est masquée dans les listes et les exercices (elle reste dans les fiches détaillées).'}</p>

      <div className="h2">Micro et prononciation</div>
      <div className="list" style={{ padding: '4px 14px' }}><div className="status"><i>{recorder.supported ? '✅' : '❌'}</i><span>Enregistrement de ma voix et analyse du ton</span></div><div className="status"><i>{recognizer.supported ? '✅' : '❌'}</i><span>Reconnaissance vocale thaïe (th-TH){recognizer.supported ? '' : ' — non disponible sur ce navigateur'}</span></div></div>
      <label className="f">Sévérité du contrôle de prononciation</label>
      <Segmented value={strict} options={[{ v: 'lenient' as const, label: 'Indulgente' }, { v: 'normal' as const, label: 'Normale' }, { v: 'strict' as const, label: 'Stricte' }]} onChange={(v) => update({ pronStrictness: v })} />
      <p className="sm mut" style={{ margin: '8px 2px 0' }}>{strict === 'lenient' ? 'Le moteur peut « deviner » : sa meilleure hypothèse compte, même si ce n’est pas la première. Les erreurs de ton ne sont pas plafonnées.' : strict === 'normal' ? 'Seule la première hypothèse du moteur compte. Une erreur de ton ou de longueur de voyelle plafonne à 5/10 ; un moteur peu sûr de lui plafonne aussi la note.' : 'Première hypothèse seulement, rien d’approximatif : sans correspondance exacte, 7/10 au maximum ; ton ou longueur faux, 4/10 au maximum.'}</p>
    </>
  );
}

function DisplayTab() {
  const t = T();
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  return (
    <>
      <label className="f" style={{ marginTop: 0 }}>{t.profile.theme}</label>
      <Segmented value={settings.theme} options={[{ v: 'auto', label: 'Automatique' }, { v: 'light', label: 'Clair' }, { v: 'dark', label: 'Sombre' }]} onChange={(v) => update({ theme: v })} />
      <label className="f">{t.profile.thaiSize}</label>
      <Segmented value={settings.thaiSize} options={[{ v: 1, label: 'Normale' }, { v: 1.15, label: 'Grande' }, { v: 1.3, label: 'Très grande' }]} onChange={(v) => update({ thaiSize: v })} />
      <p className="ctr" style={{ margin: '10px 0 0' }}><Thai text="สวัสดีครับ ยินดีที่ได้รู้จัก" style={{ fontSize: `calc(26px * ${settings.thaiSize})` }} /></p>
      <label className="f">Montrer aussi la forme moderne des lettres (sans boucles)</label>
      <Segmented value={settings.showModern} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non' }]} onChange={(v) => update({ showModern: v })} />
      <p className="xs mut" style={{ margin: '10px 2px 0' }}>Traditionnelle : <Thai text="ก ข ค ง จ" style={{ fontSize: 20, color: 'var(--ink)' }} /> · moderne : <Thai text="ก ข ค ง จ" modern style={{ fontSize: 20, color: 'var(--ink)' }} /></p>
    </>
  );
}

export function Settings() {
  const t = T();
  usePage(t.profile.settings, { back: '/profile' });
  const [params, setParams] = useSearchParams();
  const raw = params.get('tab');
  const tab: Tab = (TABS.some((x) => x.id === raw) ? raw : 'profile') as Tab;
  return (
    <>
      <div className="seg tabs" role="tablist" aria-label="Réglages">{TABS.map((x) => <button key={x.id} role="tab" aria-selected={tab === x.id} className={tab === x.id ? 'on' : ''} onClick={() => setParams({ tab: x.id }, { replace: true })}>{x.label}</button>)}</div>
      <div className="tabpane" role="tabpanel">
        {tab === 'profile' && <ProfileTab />}
        {tab === 'voice' && <VoiceTab />}
        {tab === 'exercises' && <ExercisesTab />}
        {tab === 'display' && <DisplayTab />}
      </div>
    </>
  );
}
