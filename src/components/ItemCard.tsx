/**
 * Fiche d'un élément d'apprentissage : recto (scène) et verso (détails), réutilisés par les flashcards,
 * la feuille de détail et l'exploration.
 */
import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '@/app/store';
import { useMastery, useKnown } from '@/app/hooks';
import { ITEMS, TONE_BY_ID, THEME_BY_ID, vowelDisplay, type LearnItem } from '@/content/th';
import { TONE_MARKS } from '@/content/th/tones';
import { romToIPA, romToRTGS, parseSyl } from '@/engine/thai/transcription';
import { explainTone, classNameFr, toneNameFr } from '@/engine/thai/toneRule';
import { isReadable, missingRequirements } from '@/engine/thai/reading';
import { resolveTokens } from '@/engine/tokens';
import { L } from '@/i18n';
import { AudioButton, BigThai, Icon, MasteryDot, Sheet, Thai, Rom, useTokens } from './ui';
import { ToneCurve } from './ToneCurve';
import { WordByWord } from './WordByWord';
import { MicPanel } from './MicPanel';

const POS_LABEL: Record<string, string> = { L: 'avant', T: 'au-dessus', R: 'après', B: 'en dessous' };
const IPA_CODA: Record<string, string> = { k: 'k̚', t: 't̚', p: 'p̚', ng: 'ŋ' };

/** Tons d'un mot, syllabe par syllabe, calculés à partir de la transcription. */
export function ToneChips({ rom }: { rom: string }) {
  const tok = useTokens();
  const parts = resolveTokens(rom, tok).replace(/\.\.\./g, ' ').split(/[\s-]+/).filter(Boolean);
  const out = parts.map((p) => ({ p, y: parseSyl(p) })).filter((x) => x.y);
  if (!out.length || out.length > 8) return null;
  return <div className="tchips" aria-label="Tons syllabe par syllabe">{out.map((x, i) => { const t = TONE_BY_ID[x.y!.tone]; return <span key={i} className="tchip" style={{ ['--c' as string]: t.color }}><ToneCurve tone={t.id} /><b>{x.p}</b><i>{L(t.name)}</i></span>; })}</div>;
}

export function ItemFront({ it, hideClass, modern = true, oral }: { it: LearnItem; hideClass?: boolean; modern?: boolean; oral?: boolean }) {
  const shown = it.kind === 'num' ? it.digits : it.thai;
  if (oral && (it.kind === 'word' || it.kind === 'tone' || it.kind === 'clf')) {
    return (
      <>
        <span className="tag">À l’oral</span>
        <Rom text={it.rom} className="oral-main" />
        <div className="big s4 oral-sub"><Thai text={it.thai} /></div>
      </>
    );
  }
  return (
    <>
      {it.kind === 'cons' && !hideClass ? <span className={`tag ${it.ref.cls}`}>classe {classNameFr(it.ref.cls)}</span> : <span className="tag">{L({ fr: { cons: 'Consonne', vow: 'Voyelle', word: 'Mot', tone: 'Ton', num: 'Nombre', clf: 'Classificateur', rule: 'Règle', grammar: 'Grammaire' }[it.kind] })}</span>}
      <BigThai text={shown} modern={modern && (it.kind === 'cons' || it.kind === 'vow')} />
      {it.kind === 'num' && <div className="mut b">{it.meaning.fr}</div>}
    </>
  );
}

export function ItemBack({ it }: { it: LearnItem }) {
  const tok = useTokens();
  const rows: [string, ReactNode][] = [];
  let head: ReactNode = null;
  if (it.kind === 'cons') {
    head = <><div className="l1"><Thai text={it.thai + ' ' + it.ref.nameWord} /><Rom text={it.rom} /></div><div className="fr">{L(it.ref.nameMeaning)}</div></>;
    rows.push(['Classe', <span className={`tag ${it.ref.cls}`}>{classNameFr(it.ref.cls)}</span>]);
    rows.push(['Son initial', <><b className="rom">{it.ref.initial}</b> <span className="ipa">/{it.ref.initialIPA}/</span></>]);
    rows.push(['Son final', it.ref.final ? <><b className="rom">-{it.ref.final}</b> <span className="ipa">/{IPA_CODA[it.ref.final] ?? it.ref.final}/</span></> : 'jamais en fin de syllabe']);
    rows.push(['API du nom', <span className="ipa">{romToIPA(it.rom)}</span>]);
    rows.push(['RTGS', <span className="ipa">{romToRTGS(it.rom)}</span>]);
    if (it.ref.note) rows.push(['Note', L(it.ref.note)]);
  } else if (it.kind === 'vow') {
    const v = it.ref;
    head = <><div className="l1"><Thai text={vowelDisplay(v.form)} /><Rom text={v.rom} /><span className="ipa">/{v.ipa}/</span></div><div className="fr">Voyelle {v.length === 'S' ? 'courte' : 'longue'}</div></>;
    if (v.positions) rows.push(['Position', <><div className="posmap">{['x', 'T', 'x', 'L', 'c', 'R', 'x', 'B', 'x'].map((k, i) => k === 'x' ? <i key={i} className="x" /> : k === 'c' ? <i key={i} className="c">C</i> : <i key={i} className={v.positions.includes(k) ? 'on' : ''}>{v.positions.includes(k) ? '●' : ''}</i>)}</div><span className="sm">{[...v.positions].map((k) => POS_LABEL[k]).join(' + ')} de la consonne (C)</span></>]);
    if (v.closedForm) rows.push(['Avec finale', <Thai text={v.closedForm} />]);
    if (v.note) rows.push(['Note', L(v.note)]);
  } else if (it.kind === 'tone') {
    head = <><div className="l1"><Thai text={it.thai} /><Rom text={it.rom} /></div><div className="fr">{L(it.meaning)}</div></>;
    rows.push(['Ton', <span className="tone"><ToneCurve tone={it.tone} /><b>{toneNameFr(it.tone)}</b></span>]);
    rows.push(['Pourquoi', <ol style={{ margin: 0, paddingLeft: 18 }}>{explainTone(it.ref).map((s, i) => <li key={i}>{L(s.text)}</li>)}</ol>]);
  } else if (it.kind === 'num') {
    head = <><div className="l1"><Thai text={it.thai} /><Rom text={it.rom} /></div><div className="fr">{it.meaning.fr} · <Thai text={it.digits} /></div></>;
    rows.push(['API', <span className="ipa">{romToIPA(it.rom)}</span>]);
  } else if (it.kind === 'clf') {
    head = <><div className="l1"><Thai text={it.thai} /><Rom text={it.rom} /></div><div className="fr">{L(it.ref.use)}</div></>;
  } else if (it.kind === 'word') {
    head = <><div className="l1"><Thai text={it.thai} /><Rom text={it.rom} /></div><div className="fr">{resolveTokens(L(it.meaning), tok)}</div></>;
    rows.push(['API', <span className="ipa">{romToIPA(resolveTokens(it.rom, tok).replace(/\.\.\./g, ''))}</span>]);
    rows.push(['RTGS', <span className="ipa">{romToRTGS(resolveTokens(it.rom, tok))}</span>]);
    if (it.ref.themes.length) rows.push(['Thème', it.ref.themes.map((t) => L(THEME_BY_ID[t]?.name)).filter(Boolean).join(', ')]);
  } else {
    head = <div className="fr">{L(it.meaning)}</div>;
  }
  const ex = it.kind === 'word' ? it.ref.example : it.kind === 'clf' ? it.ref.example : it.kind === 'vow' ? it.ref.example : null;
  const wbw = it.kind === 'word' && /[\s]|.{6,}/.test(it.thai);
  // Les notations savantes (API, RTGS) vont dans un repli : utiles, mais pas au premier regard.
  const isTech = (k: string) => /^(API|RTGS)/.test(k);
  const main = rows.filter(([k]) => !isTech(k)), tech = rows.filter(([k]) => isTech(k));
  return (
    <>
      {head}
      {it.kind !== 'vow' && it.kind !== 'tone' && it.rom && <ToneChips rom={it.rom} />}
      {wbw && <><div className="xs mut b" style={{ marginTop: 12 }}>Mot à mot</div><WordByWord thai={it.thai} rom={it.rom} /></>}
      {main.length > 0 && <dl className="kv">{main.map(([k, v], i) => <div key={i} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
      {ex && <div className="ex"><span className="mid"><Thai text={ex.thai} /><Rom text={ex.rom} /><br /><span className="sm mut">{resolveTokens(L(ex.meaning), tok)}</span></span><AudioButton text={ex.thai} className="sm" /></div>}
      {tech.length > 0 && <details className="fold sm" style={{ marginTop: 10 }}><summary>Notations API et RTGS</summary><dl className="kv">{tech.map(([k, v], i) => <div key={i} style={{ display: 'contents' }}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></details>}
    </>
  );
}

export function MasteryLine({ id }: { id: string }) {
  const m = useMastery(id);
  return <span className="row-flex sm mut"><MasteryDot m={m} /> maîtrise {Math.round(m * 100)} %</span>;
}

/** Feuille de détail d'un élément, avec navigation dans une liste. */
export function ItemDetailSheet({ ids, index, onClose, onNav }: { ids: string[]; index: number; onClose: () => void; onNav: (i: number) => void }) {
  const it = ITEMS[ids[index]];
  const [mic, setMic] = useState(false);
  const [rated, setRated] = useState<number | null>(null);
  const rateItem = useStore((s) => s.rateItem);
  const fav = useStore((s) => s.favorites[ids[index]]);
  const toggleFav = useStore((s) => s.toggleFavorite);
  const known = useKnown();
  const m = useMastery(ids[index]);
  if (!it) return null;
  const n = ids.length;
  const readable = it.kind === 'word' || it.kind === 'tone' ? isReadable(it.thai, known.concepts) : true;
  const missing = readable ? [] : missingRequirements(it.thai, known.concepts).filter((r) => !r.startsWith('ch:'));
  // Ce qui manque, montré tel qu'on le lit : la lettre et son nom (pas le sens du nom), la voyelle, le mot
  const missingLabel = (r: string) => { const x = ITEMS[r]; if (!x) return r.replace(/^(c:|v:|m:)/, ''); if (x.kind === 'cons') return `${x.thai} ${x.ref.nameWord}`; if (x.kind === 'vow') return vowelDisplay(x.ref.form); return x.thai; };
  const writeChar = it.kind === 'cons' ? it.thai : it.kind === 'vow' ? vowelDisplay(it.ref.form) : it.kind === 'num' && it.value < 10 ? it.digits : '';
  const rate = (q: 0 | 1 | 2 | 3) => { rateItem(it.id, q); setRated(q); };
  const act = (label: string, node: ReactNode) => <span className="act">{node}<small>{label}</small></span>;
  return (
    <Sheet open onClose={onClose} title={<div className="row-flex">{n > 1 && <button className="ib sm" onClick={() => { setRated(null); onNav((index - 1 + n) % n); }} aria-label="Précédent"><Icon name="back" size={18} /></button>}<b>{n > 1 ? `${index + 1} / ${n}` : L({ fr: 'Détail' })}</b>{n > 1 && <button className="ib sm" onClick={() => { setRated(null); onNav((index + 1) % n); }} aria-label="Suivant"><Icon name="next" size={18} /></button>}</div>}
      footer={n > 1 && index + 1 < n ? <div className="btns" style={{ marginTop: 16 }}><button className="btn soft" onClick={onClose}>Fermer</button><button className="btn" onClick={() => { setRated(null); onNav(index + 1); }}>Suivant <Icon name="next" size={18} /></button></div> : undefined}>
      <div className="stage" style={{ minHeight: 150 }}><span className="corner"><button className={`ib sm fav ${fav ? 'on' : ''}`} onClick={() => toggleFav(it.id)} aria-label="Favori" aria-pressed={!!fav}><Icon name="star" size={18} /></button></span><ItemFront it={it} /></div>
      <div className="audio acts">
        {it.say && act('Écouter', <AudioButton text={it.say} big />)}
        {it.say && act('Lentement', <AudioButton text={it.say} slow big />)}
        {it.say && act('Prononcer', <button className="ib big" onClick={() => setMic(true)} aria-label="Vérifier ma prononciation"><Icon name="mic" /></button>)}
        {writeChar && act('Écrire', <Link to={`/explore/writing?c=${encodeURIComponent(writeChar)}`} className="ib big" aria-label="S'entraîner à l'écrire" onClick={onClose}><Icon name="pen" /></Link>)}
      </div>
      <div className="ans" style={{ marginTop: 0 }}><ItemBack it={it} /></div>
      {!readable && missing.length > 0 && <div className="note sm" style={{ marginTop: 10 }}>📖 Pas encore lisible avec ce que vous avez appris : il manque <span lang="th" className="th" style={{ fontSize: 17 }}>{missing.slice(0, 4).map(missingLabel).join(' · ')}</span>{missing.length > 4 ? '…' : ''}. Le parcours y viendra.</div>}
      <div className="h2">Mon niveau sur cet élément <span className="sp" /><span className="sm mut">{Math.round(m * 100)} %</span></div>
      <div className="rate" style={{ marginTop: 0 }} role="radiogroup" aria-label="Mon niveau">
        {[[0, '❌', 'Inconnu'], [1, '🟠', 'Difficile'], [2, '🟡', 'Presque'], [3, '🟢', 'Connu']].map(([q, e, lab]) => <button key={q} data-q={q} className={rated === q ? 'cur' : ''} role="radio" aria-checked={rated === q} onClick={() => rate(q as 0 | 1 | 2 | 3)}><span>{e}</span>{lab}</button>)}
      </div>
      {rated !== null && <p className="xs mut ctr" style={{ margin: '8px 0 0' }}>Noté · la révision en tiendra compte.</p>}
      {mic && <MicPanel item={it} onClose={() => setMic(false)} />}
    </Sheet>
  );
}

export const TONE_MARK_NAMES = TONE_MARKS;
