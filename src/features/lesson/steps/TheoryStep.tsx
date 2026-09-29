/** Étape « À retenir » : blocs d'explication (texte, lettres, voyelles, syllabes, mots, règles de ton, grammaire…). */
import { Link } from 'react-router-dom';
import type { LessonDef, TheoryBlock } from '@/curriculum/types';
import type { RuntimeStep } from '../engine';
import { ITEMS, GRAMMAR_BY_ID, TONE_BY_ID, vowelDisplay, type LearnItem } from '@/content/th';
import { TONES, TONE_MARKS } from '@/content/th/tones';
import { toneRule, classNameFr, toneNameFr, ruleLabel } from '@/engine/thai/toneRule';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { L } from '@/i18n';
import { AudioButton, Fr, Icon, Thai, Rom, MasteryDot, useShowRom, ThInl } from '@/components/ui';
import { StepFooter, ContinueButton } from '@/components/StepFooter';
import { ToneCurve } from '@/components/ToneCurve';
import { useMastery } from '@/app/hooks';
import { lessonCard } from '@/curriculum/card';
import { LessonBadge, CardTitle, kindClass } from '@/components/LessonCard';
import { InitialSound, vowelPosFr } from '@/components/ItemCard';
import type { ConsonantClass } from '@/content/types';

/** Séparateur collé à l'élément qui suit : une ligne ne finit jamais sur « · ». */
const SEP = '·\u00a0';

/** Formule de grammaire (« phrase + ครับ / ค่ะ ») : texte en police d'interface, parties thaïes en police thaïe. */
function Pattern({ text }: { text: string }) {
  const parts = text.split(/([\u0E00-\u0E7F][\u0E00-\u0E7F\s]*)/g).filter(Boolean);
  return <div className="pattern">{parts.map((p, i) => (/[\u0E00-\u0E7F]/.test(p) ? <Thai key={i} text={p.trim()} /> : <span key={i}>{p}</span>))}</div>;
}

function KnownTag({ id }: { id: string }) {
  const m = useMastery(id);
  return m >= 0.5 ? <span className="tag ok">déjà connu</span> : null;
}

function WordRow({ it, knownOrally }: { it: LearnItem; knownOrally?: boolean }) {
  const showRom = useShowRom(it.thai);
  const m = useMastery(it.id);
  const ex = it.kind === 'word' ? it.ref.example : null;
  return (
    <div className="row">
      <span className="mid">
        <Thai text={it.thai} />
        {/* Transcription et sens sur deux lignes ; l'exemple en retrait, plus discret que le mot lui-même */}
        <span className="s">{showRom && <Rom text={it.rom} className="block" />}<span className="block"><Fr text={it.meaning} />{knownOrally && m < 0.5 && <> <span className="tag jade">connu à l’oral</span></>} <KnownTag id={it.id} /></span></span>
        {ex && <span className="wex"><Thai text={ex.thai} />{showRom && <Rom text={ex.rom} className="block" />}<span className="block"><Fr text={ex.meaning} /></span></span>}
      </span>
      <span className="end"><MasteryDot m={m} /><AudioButton text={it.say} className="sm" /></span>
    </div>
  );
}

export function TheoryBlockView({ b, knownOrally }: { b: TheoryBlock; knownOrally?: boolean }) {
  const sp = useSpeaker();
  const showModern = useStore((s) => s.settings.showModern);
  switch (b.kind) {
    case 'text': return <p className="lead theory-text"><Fr text={b.text} /></p>;
    case 'note': return <div className="note info"><Fr text={b.text} /></div>;
    case 'tip': return <div className="note"><b>Astuce.</b> <Fr text={b.text} /></div>;
    case 'pattern': return <Pattern text={L(b.text)} />;
    case 'letters': return (
      <><div className="h2">Les consonnes</div><div className="list">{(b.ids ?? []).map((id) => { const c = ITEMS[id]; if (!c || c.kind !== 'cons') return null; return (
        <div className="row" key={id}>
          <span className="lglyph" lang="th">{c.thai}</span>
          <span className="mid"><span className="t"><span className="nw"><Thai text={c.thai + ' ' + c.ref.nameWord} /> <Rom text={c.rom} /></span> {SEP}<Fr text={c.ref.nameMeaning} /> <KnownTag id={id} /></span>
            {/* Segments insécables qui passent à la ligne en bloc (jamais « · » en fin de ligne, jamais une lettre seule) */}
            <span className="s segs"><span className="nw">son <InitialSound s={c.ref.initial} /></span>{c.ref.final ? <span className="nw">{SEP}en finale <b className="rom">-{c.ref.final}</b></span> : null}<span className={`tag ${c.ref.cls}`}>classe {classNameFr(c.ref.cls)}</span>{showModern ? <span className="nw mut">moderne{'\u00a0'}: <span className="thm th-s ink" lang="th">{c.thai}</span></span> : null}</span>
            {c.ref.note ? <span className="s"><Fr text={c.ref.note} /></span> : null}</span>
          <span className="end"><AudioButton text={c.say} className="sm" /></span>
        </div>); })}</div></>);
    case 'vowels': return (
      <><div className="h2">Les voyelles</div><div className="list">{(b.ids ?? []).map((id) => { const v = ITEMS[id]; if (!v || v.kind !== 'vow') return null; const r = v.ref; return (
        <div className="row" key={id}>
          <span className="lglyph" lang="th">{vowelDisplay(r.form)}</span>
          <span className="mid"><span className="t"><Rom text={r.rom} /> · {r.length === 'S' ? 'courte' : 'longue'} <span className="ipa">/{r.ipa}/</span> <KnownTag id={id} /></span>
            <span className="s segs"><span>s’écrit {vowelPosFr(r.positions || '')}</span>{r.closedForm ? <span className="nw">{SEP}avec finale{'\u00a0'}: <Thai text={r.closedForm} /></span> : null}{r.example ? <span>{SEP}<span className="nw"><Thai text={r.example.thai} /> <Rom text={r.example.rom} /></span> «{'\u00a0'}<Fr text={r.example.meaning} />{'\u00a0'}»</span> : null}</span>
            {r.note ? <span className="s"><Fr text={r.note} /></span> : null}</span>
          <span className="end"><AudioButton text={r.example ? r.example.thai : v.say} className="sm" /></span>
        </div>); })}</div></>);
    case 'toneMarks': return (
      <><div className="h2">Les marques de ton</div><div className="list">{(b.ids ?? []).map((id) => { const n = +id.slice(2); const m = TONE_MARKS[n - 1]; if (!m) return null; return (
        <div className="row" key={id}><span className="lglyph" lang="th">◌{m.char}</span><span className="mid"><span className="t"><Thai text={m.name} /> <Rom text={m.rom} /></span>
          <span className="s">{(['M', 'H', 'L'] as ConsonantClass[]).map((c) => { const t = toneRule(c, true, true, n); return t ? `classe ${classNameFr(c)} → ${toneNameFr(t)}` : null; }).filter(Boolean).join(' · ')}</span></span></div>); })}</div></>);
    case 'toneRule': {
      const key = b.ruleKey ?? '';
      if (key === 'rule:live-dead') return (
        <>
          <div className="step"><span className="num">●</span><div><h3>Syllabe vivante <span className="th mut">คำเป็น</span></h3><p>Le son peut se prolonger : voyelle <b>longue</b>, ou finale <b>n, m, ng, i, o</b>.</p><p><Thai text="มา" /> <Rom text="maa" /> · <Thai text="กิน" /> <Rom text="kin" /> · <Thai text="ยาว" /> <Rom text="yaao" /></p></div></div>
          <div className="step"><span className="num">■</span><div><h3>Syllabe morte <span className="th mut">คำตาย</span></h3><p>Le son est coupé net : voyelle <b>courte</b> seule, ou finale bloquée <b>k, t, p</b>.</p><p><Thai text="จะ" /> <Rom text="jà" /> · <Thai text="รัก" /> <Rom text="rák" /> · <Thai text="มาก" /> <Rom text="mâak" /></p></div></div>
        </>);
      const [c, k] = key.replace('rule:', '').split('|');
      const cls = c as ConsonantClass;
      const mark = k[0] === 'm' ? +k[1] : 0;
      const live = k === 'live' || mark > 0, long = k !== 'dead-short';
      const tone = toneRule(cls, live, long, mark);
      const examples = Object.values(ITEMS).filter((i): i is LearnItem & { kind: 'tone' } => i.kind === 'tone' && i.ruleKey === key).slice(0, 4);
      return (
        <div className="step"><span className="num" style={{ background: tone ? TONE_BY_ID[tone].color : undefined }}>{tone ? <ToneCurve tone={tone} className="tsvg" /> : '?'}</span><div className="grow">
          <h3>{L(ruleLabel(key))} → ton <b style={{ color: tone ? TONE_BY_ID[tone].color : undefined }}>{tone ? toneNameFr(tone) : '—'}</b></h3>
          <p className="ex-list">{examples.map((e) => <button key={e.id} onClick={() => sp.speak(e.say)} className="row-flex tight"><Thai text={e.thai} className="th-m" /><Rom text={e.rom} /><span className="xs mut">{L(e.meaning)}</span><Icon name="speaker" size={14} /></button>)}</p>
        </div></div>);
    }
    case 'tones': return (
      <>{TONES.map((t) => (
        <div key={t.id} className="step tap" onClick={() => sp.speak(t.example.thai)}>
          <div className="grow">
            <div className="tone"><ToneCurve tone={t.id} className="" /><div><h3 style={{ color: t.color }}>Ton {L(t.name)} <span className="rom">{t.mark}</span></h3><p>{L(t.desc)}</p></div></div>
            <div className="row-flex ex-line"><Thai text={t.example.thai} className="th-l" /><span><Rom text={t.example.rom} /><br /><span className="mut sm">{L(t.example.meaning)}</span></span><span className="sp" /><AudioButton text={t.example.thai} /><AudioButton text={t.example.thai} slow /></div>
          </div>
        </div>))}
      <div className="note">Phrase célèbre : <Thai text="ไม้ใหม่ไม่ไหม้ไหม" className="th-m" /> <Rom text="máai mài mâi mâi mái" /> — « le bois neuf ne brûle pas, n’est-ce pas ? » <button className="mini" onClick={() => sp.speak('ไม้ใหม่ไม่ไหม้ไหม')} aria-label="Écouter"><Icon name="speaker" /></button></div></>);
    case 'syllables': return (
      <><div className="h2">Lire des syllabes</div><p className="note-under">Touchez pour écouter. Le ton est donné par la classe de la consonne et la voyelle.</p>
        <div className="syls">{(b.syllables ?? []).map((s, i) => <button key={i} className="syl" onClick={() => sp.speak(s.thai)}><b lang="th">{s.thai}</b><em><Fr text={s.rom} /></em></button>)}</div>
        <div className="btns mt-2"><button className="btn soft sm" onClick={() => { const list = (b.syllables ?? []).map((s) => s.thai); let i = 0; const next = () => { if (i < list.length) sp.speak(list[i++], { onend: () => setTimeout(next, 500) }); }; next(); }}><Icon name="play" size={16} /> Toute la série</button></div></>);
    case 'words': return (
      <><div className="h2">Les mots</div><div className="list">{(b.ids ?? []).map((id) => ITEMS[id] ? <WordRow key={id} it={ITEMS[id]} knownOrally={knownOrally} /> : null)}</div></>);
    case 'numbers': return (
      <><div className="h2">Les nombres</div><div className="list">{(b.ids ?? []).map((id) => { const n = ITEMS[id]; if (!n || n.kind !== 'num') return null; return <div className="row" key={id}><span className={`lglyph sm-num ${n.digits.length <= 2 ? 'short' : ''}`} lang="th">{n.digits}</span><span className="mid"><span className="t">{n.meaning.fr}</span><span className="s"><Thai text={n.thai} /> <Rom text={n.rom} /></span></span><span className="end"><AudioButton text={n.say} className="sm" /></span></div>; })}</div></>);
    case 'classifiers': return (
      <><div className="h2">Les classificateurs</div><div className="list">{(b.ids ?? []).map((id) => { const c = ITEMS[id]; if (!c || c.kind !== 'clf') return null; return <div className="row" key={id}><span className="mid"><span className="t"><Thai text={c.thai} className="th-m" /> <Rom text={c.rom} /></span><span className="s"><Fr text={c.ref.use} /> {SEP}<span className="nw"><Thai text={c.ref.example.thai} /> <Rom text={c.ref.example.rom} /></span> «{'\u00a0'}<Fr text={c.ref.example.meaning} />{'\u00a0'}»</span></span><span className="end"><AudioButton text={c.ref.example.thai} className="sm" /></span></div>; })}</div></>);
    case 'grammar': {
      const g = b.grammarId ? GRAMMAR_BY_ID[b.grammarId] : null;
      if (!g) return null;
      return (
        <><div className="h2"><span className="h2-ic" aria-hidden="true"><Icon name="layers" size={16} /></span>{L(g.title)} <span className="sp" /><Link to={`/explore/grammar/${encodeURIComponent(g.id)}`}>Fiche complète ›</Link></div>
          <p className="lead ink"><Fr text={g.rule} /></p><Pattern text={g.pattern} />
          <div className="list">{g.examples.slice(0, 3).map((e, i) => <div className="row" key={i}><span className="mid"><Thai text={e.thai} /><span className="s"><Rom text={e.rom} className="block" /><span className="block"><Fr text={e.meaning} /></span></span></span><span className="end"><AudioButton text={e.thai} className="sm" /></span></div>)}</div>
          {g.tip && <div className="note sm">{L(g.tip)}</div>}</>);
    }
    case 'compare': return null;
    default: return null;
  }
}

export function TheoryStep({ step, onDone, title, subtitle, lesson }: { step: RuntimeStep & { type: 'theory' }; onDone: () => void; title: string; subtitle?: string; lesson?: LessonDef }) {
  const card = lesson ? lessonCard(lesson) : null;
  return (
    <>
      {/* Le type de la leçon, tel que sur sa carte : badge, libellé, indicateur */}
      {card && <div className={`lkind ${kindClass(card)}`}><LessonBadge card={card} /><span>{card.label}</span><span className="sep" aria-hidden="true">·</span><span className="n">{card.count}</span></div>}
      <h2 className="theory-title">{step.title ? L(step.title) : card ? <CardTitle card={card} /> : title}</h2>
      {subtitle && <p className="theory-sub"><ThInl text={subtitle} /></p>}
      {step.blocks.map((b, i) => <div className="theory-block" key={i}><TheoryBlockView b={b} /></div>)}
      <div className="gap" />
      <StepFooter meta={<span>Parcourez, écoutez : les exercices suivent tout de suite.</span>}>
        <ContinueButton onClick={onDone} label="Continuer" />
      </StepFooter>
    </>
  );
}
