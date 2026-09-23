/** Réglages : profil, voix (détection, choix, test), translittération, apparence, audio. */
import { useState } from 'react';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { tts, useSpeaker, useVoices, recognizer, recorder } from '@/app/services/speech';
import { WebSpeechProvider } from '@/engine/audio/tts';
import { T } from '@/i18n';
import { Segmented, Thai, useToast } from '@/components/ui';

export function Settings() {
  const t = T();
  usePage(t.profile.settings, { back: '/profile' });
  const settings = useStore((s) => s.settings);
  const update = useStore((s) => s.updateSettings);
  const profile = useStore((s) => s.profile)!;
  const updateProfile = useStore((s) => s.updateProfile);
  const { status } = useVoices();
  const sp = useSpeaker();
  const toast = useToast((s) => s.show);
  const [name, setName] = useState(profile.name);
  const voices = tts.voices(), target = tts.targetVoices();
  const sample = 'สวัสดี{P} ยินดีที่ได้รู้จัก';
  const msg: Record<string, string> = {
    ok: `✅ ${target.length} voix thaïlandaise${target.length > 1 ? 's' : ''} détectée${target.length > 1 ? 's' : ''}. Lecture en th-TH.`,
    searching: '🔎 Recherche des voix en cours… Chrome Android met parfois plusieurs secondes à communiquer la liste.',
    unknown: 'ℹ️ Le navigateur ne communique aucune voix (liste vide). Touchez « Tester la voix » : la liste arrive souvent après ce premier essai.',
    none: `❌ Le navigateur liste ${voices.length} voix, mais aucune en thaï. L’application refuse de lire du thaï avec une voix française ou anglaise.`,
    unsupported: '❌ Ce navigateur ne propose pas la synthèse vocale.',
  };
  return (
    <>
      <div className="h2">Profil</div>
      <label className="f" htmlFor="pname">Prénom</label>
      <input id="pname" className="field" value={name} onChange={(e) => setName(e.target.value)} onBlur={() => name.trim() && updateProfile({ name: name.trim() })} />
      <label className="f">Je suis</label>
      <Segmented value={profile.gender} options={[{ v: 'm', label: <>Un homme · <Thai text="ครับ" /></> }, { v: 'f', label: <>Une femme · <Thai text="ค่ะ" /></> }]} onChange={(g) => updateProfile({ gender: g })} />
      <label className="f">Objectif quotidien</label>
      <Segmented value={profile.dailyGoalMinutes} options={[5, 10, 15, 30].map((g) => ({ v: g, label: `${g} min` }))} onChange={(g) => updateProfile({ dailyGoalMinutes: g })} />

      <div className="h2">{t.profile.voice} thaïlandaise</div>
      <div className={`note ${status === 'ok' ? 'info' : status === 'none' || status === 'unsupported' ? 'warn' : ''}`}>{msg[status]}</div>
      {target.length > 1 && <><label className="f" htmlFor="voice">Voix utilisée</label><select id="voice" className="field" value={settings.voiceId} onChange={(e) => update({ voiceId: e.target.value })}><option value="">Automatique (locale de préférence)</option>{target.map((v) => <option key={v.id} value={v.id}>{v.name} — {v.lang}{v.local ? ' · hors ligne' : ' · en ligne'}</option>)}</select></>}
      {status === 'none' && <>
        <p className="sm mut" style={{ margin: '0 2px 8px' }}><b>Si la voix thaïe Google est pourtant installée</b>, Chrome utilise sans doute un autre moteur vocal (Samsung, etc.) : Paramètres › Système › Langues et saisie › Synthèse vocale › Moteur préféré › Services de synthèse vocale Google. Puis touchez « Relancer la détection ».</p>
        <button className="btn ghost sm" style={{ marginBottom: 8 }} onClick={() => tts.speak('สวัสดีครับ', { force: true })}>▶ Essai forcé en th-TH</button>
        <label className="f">Si l’essai forcé parle bien thaï : toujours lire ainsi</label>
        <Segmented value={settings.forceTTS} options={[{ v: false, label: 'Non' }, { v: true, label: 'Oui, forcer th-TH' }]} onChange={(v) => update({ forceTTS: v })} />
      </>}
      {(status === 'unknown' || status === 'searching') && <p className="sm mut" style={{ margin: '0 2px 8px' }}>Pour installer la voix sur Android : Paramètres › Système › Langues et saisie › Synthèse vocale › ⚙ du moteur Google › Installer les données vocales › Thaï. Sur iPhone : Réglages › Accessibilité › Contenu énoncé › Voix › Thaï.</p>}
      <div className="btns"><button className="btn soft sm" onClick={() => sp.speak(sample)}>▶ Tester la voix</button><button className="btn soft sm" onClick={() => sp.speak(sample, { slow: true })}>🐢 Lentement</button></div>
      <div className="btns" style={{ marginTop: 8 }}><button className="btn ghost sm" onClick={() => { tts.rescan(); toast('Détection des voix relancée.'); }}>🔄 Relancer la détection</button><button className="btn ghost sm" onClick={() => { const rep = tts instanceof WebSpeechProvider ? tts.report() : 'Synthèse vocale indisponible'; navigator.clipboard?.writeText(rep).then(() => toast('Liste des voix copiée.'), () => toast('Copie impossible.')); }}>Copier le diagnostic</button></div>
      <label className="f">Voix détectées · {voices.length}</label>
      <div className="vlist">{voices.length ? voices.slice().sort((a, b) => Number(b.isTarget) - Number(a.isTarget)).map((v) => <div key={v.id} className={`v ${v.isTarget ? 'is' : ''}`}><span>{v.isTarget ? '✓ ' : ''}{v.name}</span><code>{v.lang || '(vide)'}</code></div>) : <div className="v"><span className="mut">Liste vide pour l’instant.</span></div>}</div>
      <label className="f" htmlFor="slow">Vitesse de la lecture lente 🐢 : <b>{Math.round(settings.slowRate * 100)} %</b></label>
      <input id="slow" type="range" min={0.4} max={0.85} step={0.05} value={settings.slowRate} onChange={(e) => update({ slowRate: +e.target.value })} />
      <label className="f">{t.profile.autoAudio} <span className="xs">(réponse d’une carte, ouverture d’une fiche)</span></label>
      <Segmented value={settings.autoAudio} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non' }]} onChange={(v) => update({ autoAudio: v })} />

      <div className="h2">Micro</div>
      <div className="list" style={{ padding: '4px 14px' }}><div className="status"><i>{recorder.supported ? '✅' : '❌'}</i><span>Enregistrement de ma voix</span></div><div className="status"><i>{recognizer.supported ? '✅' : '❌'}</i><span>Reconnaissance vocale thaïe (th-TH){recognizer.supported ? '' : ' — non disponible sur ce navigateur'}</span></div></div>

      <div className="h2">{t.profile.transliteration}</div>
      <Segmented value={settings.translit} options={[{ v: 'always', label: t.profile.translit.always }, { v: 'learning', label: t.profile.translit.learning }, { v: 'hidden', label: t.profile.translit.hidden }]} onChange={(v) => update({ translit: v })} />
      <p className="sm mut" style={{ margin: '8px 2px 0' }}>{settings.translit === 'always' ? 'La phonétique est toujours affichée.' : settings.translit === 'learning' ? 'La phonétique disparaît progressivement : elle est masquée sur les mots que vous savez lire avec les lettres déjà apprises.' : 'La phonétique est masquée dans les listes et les exercices (elle reste dans les fiches détaillées).'}</p>

      <div className="h2">{t.profile.theme}</div>
      <Segmented value={settings.theme} options={[{ v: 'auto', label: 'Automatique' }, { v: 'light', label: 'Clair' }, { v: 'dark', label: 'Sombre' }]} onChange={(v) => update({ theme: v })} />
      <label className="f">{t.profile.thaiSize}</label>
      <Segmented value={settings.thaiSize} options={[{ v: 1, label: 'Normale' }, { v: 1.15, label: 'Grande' }, { v: 1.3, label: 'Très grande' }]} onChange={(v) => update({ thaiSize: v })} />
      <label className="f">Montrer aussi la forme moderne des lettres (sans boucles)</label>
      <Segmented value={settings.showModern} options={[{ v: true, label: 'Oui' }, { v: false, label: 'Non' }]} onChange={(v) => update({ showModern: v })} />
      <p className="xs mut" style={{ margin: '10px 2px 0' }}>Traditionnelle : <Thai text="ก ข ค ง จ" style={{ fontSize: 20, color: 'var(--ink)' }} /> · moderne : <Thai text="ก ข ค ง จ" modern style={{ fontSize: 20, color: 'var(--ink)' }} /></p>
    </>
  );
}
