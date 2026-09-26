/** Guide de la transcription utilisée dans l'application (système documenté). */
import { usePage } from '@/app/Shell';
import { th } from '@/content/th';
import { TONES } from '@/content/th/tones';
import { L, T } from '@/i18n';
import { ToneCurve } from '@/components/ToneCurve';
import { Thai } from '@/components/ui';

export function Transcription() {
  const t = T();
  usePage(t.explore.transcription, { back: '/explore' });
  return (
    <>
      <p className="lead">La phonétique affichée est une aide, pas un but : fiez-vous d’abord à l’audio. Une seule convention est utilisée partout, proche de l’alphabet phonétique international. Réglez sa présence dans Profil › Réglages › Translittération.</p>
      <div className="h2">Les tons</div>
      <div className="list">{TONES.map((tn) => <div key={tn.id} className="row"><span className="mid tone"><ToneCurve tone={tn.id} /><span className="t"><span className="rom lg">{tn.mark}</span> · ton {L(tn.name)}</span></span></div>)}</div>
      <div className="h2">Consonnes</div>
      <div className="list">{th.PHON_CONSONANTS.map((c, i) => <div key={i} className="row"><span className="mid"><span className="t"><span className="rom lg">{c.rom}</span> {c.ipa && <span className="ipa">/{c.ipa}/</span>} <Thai text={c.letters} className="mut" /></span><span className="s">{L(c.help)}</span></span></div>)}</div>
      <div className="h2">Voyelles (doublées = longues)</div>
      <div className="list">{th.PHON_VOWELS.map((v, i) => <div key={i} className="row"><span className="mid"><span className="t"><span className="rom lg">{v.rom}</span> <span className="ipa">/{v.ipa}/</span></span><span className="s">{L(v.help)}</span></span></div>)}</div>
      <div className="note info">Dans les fiches, l’API et la romanisation officielle RTGS sont calculées à partir de cette transcription. Le RTGS (celui des panneaux routiers) ne note ni les tons ni la durée des voyelles : il ne suffit pas pour prononcer.</div>
    </>
  );
}
