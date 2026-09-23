/** Étape « À retenir » : blocs d'explication (texte, lettres, voyelles, syllabes, mots, règles de ton, grammaire…). */
import { Link } from 'react-router-dom';
import type { TheoryBlock } from '@/curriculum/types';
import type { RuntimeStep } from '../engine';
import { ITEMS, GRAMMAR_BY_ID, TONE_BY_ID, vowelDisplay, type LearnItem } from '@/content/th';
import { TONES, TONE_MARKS } from '@/content/th/tones';
import { toneRule, classNameFr, toneNameFr, ruleLabel } from '@/engine/thai/toneRule';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { L } from '@/i18n';
import { AudioButton, Fr, Icon, Thai, Rom, MasteryDot, useShowRom } from '@/components/ui';
import { StepFooter, ContinueButton } from '@/components/StepFooter';
import { ToneCurve } from '@/components/ToneCurve';
import { useMastery } from '@/app/hooks';
import type { ConsonantClass } from '@/content/types';

const POS_LABEL: Record<string, string> = { L: 'avant', T: 'au-dessus', R: 'après', B: 'en dessous' };

function KnownTag({ id }: { id: string }) {
  const m = useMastery(id);
  return m >= 0.5 ? <span className="tag ok" style={{ fontSize: 11 }}>déjà connu</span> : null;
}

function WordRow({ it, knownOrally }: { it: LearnItem; knownOrally?: boolean }) {
  const showRom = useShowRom(it.thai);
  const m = useMastery(it.id);
  const ex = it.kind === 'word' ? it.ref.example : null;
  return (
    <div className="row">
      <span className="mid">
        <Thai text={it.thai} />
        <span className="s">{showRom && <><Rom text={it.rom} /> · </>}<Fr text={it.meaning} /> {knownOrally && m < 0.5 && <span className="tag jade" style={{ fontSize: 11 }}>connu à l’oral</span>}<KnownTag id={it.id} /></span>
        {ex && <span className="s" style={{ marginTop: 4 }}><Thai text={ex.thai} style={{ fontSize: 17 }} /> {showRom && <Rom text={ex.rom} />}<br /><Fr text={ex.meaning} /></span>}
      </span>
      <span className="end"><MasteryDot m={m} /><AudioButton text={it.say} className="sm" /></span>
    </div>
  );
}

export function TheoryBlockView({ b, knownOrally }: { b: TheoryBlock; knownOrally?: boolean }) {
  const sp = useSpeaker();
  const showModern = useStore((s) => s.settings.showModern);
  switch (b.kind) {
    case 'text': return <p className="lead" style={{ color: 'var(--ink)', marginBottom: 6 }}><Fr text={b.text} /></p>;
    case 'note': return <div className="note info"><Fr text={b.text} /></div>;
    case 'tip': return <div className="note"><b>Le point du jour.</b> <Fr text={b.text} /></div>;
    case 'pattern': return <div className="pattern" lang="th"><Fr text={b.text} /></div>;
    case 'letters': return (
      <><div className="h2">Les consonnes</div><div className="list">{(b.ids ?? []).map((id) => { const c = ITEMS[id]; if (!c || c.kind !== 'cons') return null; return (
        <div className="row" key={id}>
          <span className="lglyph" lang="th">{c.thai}</span>
          <span className="mid"><span className="t"><Thai text={c.thai + ' ' + c.ref.nameWord} /> <Rom text={c.rom} /> · {L(c.ref.nameMeaning)} <KnownTag id={id} /></span>
            <span className="s">son <b className="rom">{c.ref.initial}</b>{c.ref.final ? <> · en finale <b className="rom">-{c.ref.final}</b></> : null} · <span className={`tag ${c.ref.cls}`} style={{ fontSize: 11 }}>classe {classNameFr(c.ref.cls)}</span>{c.ref.note ? <><br />{L(c.ref.note)}</> : null}{showModern ? <> · <span className="mut">moderne : <span className="thm" lang="th" style={{ fontSize: 18, color: 'var(--ink)' }}>{c.thai}</span></span></> : null}</span></span>
          <span className="end"><AudioButton text={c.say} className="sm" /></span>
        </div>); })}</div></>);
    case 'vowels': return (
      <><div className="h2">Les voyelles</div><div className="list">{(b.ids ?? []).map((id) => { const v = ITEMS[id]; if (!v || v.kind !== 'vow') return null; const r = v.ref; return (
        <div className="row" key={id}>
          <span className="lglyph" lang="th">{vowelDisplay(r.form)}</span>
          <span className="mid"><span className="t"><Rom text={r.rom} /> · {r.length === 'S' ? 'courte' : 'longue'} <span className="ipa">/{r.ipa}/</span> <KnownTag id={id} /></span>
            <span className="s">s’écrit {[...(r.positions || '')].map((k) => POS_LABEL[k]).join(' + ') || 'autour'} de la consonne{r.closedForm ? <> · avec finale : <Thai text={r.closedForm} style={{ fontSize: 15 }} /></> : null}{r.example ? <> · <Thai text={r.example.thai} style={{ fontSize: 17 }} /> <Rom text={r.example.rom} /> « {L(r.example.meaning)} »</> : null}{r.note ? <><br />{L(r.note)}</> : null}</span></span>
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
        <div className="step"><span className="num" style={{ background: tone ? TONE_BY_ID[tone].color : undefined }}>{tone ? <ToneCurve tone={tone} className="tsvg" /> : '?'}</span><div style={{ flex: 1 }}>
          <h3>{L(ruleLabel(key))} → ton <b style={{ color: tone ? TONE_BY_ID[tone].color : undefined }}>{tone ? toneNameFr(tone) : '—'}</b></h3>
          <p style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 14px' }}>{examples.map((e) => <button key={e.id} onClick={() => sp.speak(e.say)} className="row-flex" style={{ gap: 6 }}><Thai text={e.thai} style={{ fontSize: 22 }} /><Rom text={e.rom} /><span className="xs mut">{L(e.meaning)}</span><Icon name="speaker" size={14} /></button>)}</p>
        </div></div>);
    }
    case 'tones': return (
      <>{TONES.map((t) => (
        <div key={t.id} className="step" style={{ cursor: 'pointer' }} onClick={() => sp.speak(t.example.thai)}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="tone"><ToneCurve tone={t.id} className="" /><div><h3 style={{ color: t.color }}>Ton {L(t.name)} <span className="rom">{t.mark}</span></h3><p>{L(t.desc)}</p></div></div>
            <div className="row-flex" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed var(--line)' }}><Thai text={t.example.thai} style={{ fontSize: 36 }} /><span><Rom text={t.example.rom} /><br /><span className="mut sm">{L(t.example.meaning)}</span></span><span className="sp" /><AudioButton text={t.example.thai} /><AudioButton text={t.example.thai} slow /></div>
          </div>
        </div>))}
      <div className="note">Phrase célèbre : <Thai text="ไม้ใหม่ไม่ไหม้ไหม" style={{ fontSize: 22 }} /> <Rom text="máai mài mâi mâi mái" /> — « le bois neuf ne brûle pas, n’est-ce pas ? » <button className="mini" onClick={() => sp.speak('ไม้ใหม่ไม่ไหม้ไหม')}><Icon name="speaker" /></button></div></>);
    case 'syllables': return (
      <><div className="h2">Lire des syllabes</div><p className="sm mut" style={{ margin: '-4px 2px 8px' }}>Touchez pour écouter. Le ton est donné par la classe de la consonne et la voyelle.</p>
        <div className="syls">{(b.syllables ?? []).map((s, i) => <button key={i} className="syl" onClick={() => sp.speak(s.thai)}><b lang="th">{s.thai}</b><em>{s.rom}</em></button>)}</div>
        <div className="btns" style={{ marginTop: 8 }}><button className="btn soft sm" onClick={() => { const list = (b.syllables ?? []).map((s) => s.thai); let i = 0; const next = () => { if (i < list.length) sp.speak(list[i++], { onend: () => setTimeout(next, 500) }); }; next(); }}><Icon name="play" size={16} /> Toute la série</button></div></>);
    case 'words': return (
      <><div className="h2">Les mots</div><div className="list">{(b.ids ?? []).map((id) => ITEMS[id] ? <WordRow key={id} it={ITEMS[id]} knownOrally={knownOrally} /> : null)}</div></>);
    case 'numbers': return (
      <><div className="h2">Les nombres</div><div className="list">{(b.ids ?? []).map((id) => { const n = ITEMS[id]; if (!n || n.kind !== 'num') return null; return <div className="row" key={id}><span className="lglyph" lang="th" style={{ fontSize: 24 }}>{n.digits}</span><span className="mid"><span className="t">{n.meaning.fr}</span><span className="s"><Thai text={n.thai} style={{ fontSize: 19, color: 'var(--ink)' }} /> <Rom text={n.rom} /></span></span><span className="end"><AudioButton text={n.say} className="sm" /></span></div>; })}</div></>);
    case 'classifiers': return (
      <><div className="h2">Les classificateurs</div><div className="list">{(b.ids ?? []).map((id) => { const c = ITEMS[id]; if (!c || c.kind !== 'clf') return null; return <div className="row" key={id}><span className="mid"><span className="t"><Thai text={c.thai} style={{ fontSize: 22 }} /> <Rom text={c.rom} /></span><span className="s">{L(c.ref.use)} · <Thai text={c.ref.example.thai} style={{ fontSize: 16, color: 'var(--ink)' }} /> <Rom text={c.ref.example.rom} /> « {L(c.ref.example.meaning)} »</span></span><span className="end"><AudioButton text={c.ref.example.thai} className="sm" /></span></div>; })}</div></>);
    case 'grammar': {
      const g = b.grammarId ? GRAMMAR_BY_ID[b.grammarId] : null;
      if (!g) return null;
      return (
        <><div className="h2">{g.icon} {L(g.title)} <span className="sp" /><Link to={`/explore/grammar/${encodeURIComponent(g.id)}`}>Fiche complète ›</Link></div>
          <p className="lead" style={{ color: 'var(--ink)' }}>{L(g.rule)}</p><div className="pattern" lang="th">{g.pattern}</div>
          <div className="list">{g.examples.slice(0, 3).map((e, i) => <div className="row" key={i}><span className="mid"><Thai text={e.thai} /><span className="s"><Rom text={e.rom} /><br /><Fr text={e.meaning} /></span></span><span className="end"><AudioButton text={e.thai} className="sm" /></span></div>)}</div>
          {g.tip && <div className="note sm">{L(g.tip)}</div>}</>);
    }
    case 'compare': return null;
    default: return null;
  }
}

export function TheoryStep({ step, onDone, title, subtitle }: { step: RuntimeStep & { type: 'theory' }; onDone: () => void; title: string; subtitle?: string }) {
  return (
    <>
      <h2 className="theory-title">{step.title ? L(step.title) : title}</h2>
      {subtitle && <p className="mut sm" style={{ marginBottom: 14 }}>{subtitle}</p>}
      {step.blocks.map((b, i) => <div className="theory-block" key={i}><TheoryBlockView b={b} /></div>)}
      <div className="gap" />
      <StepFooter meta={<><span>Rien à retenir par cœur : les exercices viennent tout de suite après.</span></>}>
        <ContinueButton onClick={onDone} label="Continuer" />
      </StepFooter>
    </>
  );
}
