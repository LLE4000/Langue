/** Tons : les cinq tons, séries « même syllabe », la méthode en 4 questions, le tableau des règles. */
import { useEffect, useRef, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useSpeaker } from '@/app/services/speech';
import { useStore } from '@/app/store';
import { TONE_BY_ID, TONE_BY_THAI, TONE_ITEMS, th } from '@/content/th';
import { TONES, TONE_MARKS } from '@/content/th/tones';
import { toneRule, classNameFr, toneNameFr } from '@/engine/thai/toneRule';
import { L, T } from '@/i18n';
import { AudioPair, Icon, Sheet, Thai, Rom } from '@/components/ui';
import { ToneCurve } from '@/components/ToneCurve';
import { ItemDetailSheet } from '@/components/ItemCard';
import { TheoryBlockView } from '@/features/lesson/steps/TheoryStep';
import type { ConsonantClass } from '@/content/types';

function Row({ ico, t, s, to }: { ico: string; t: string; s: string; to: string }) {
  return <Link className="row" to={to}><span className="ico">{ico}</span><span className="mid"><span className="t">{t}</span><span className="s">{s}</span></span><span className="end"><span className="chev">›</span></span></Link>;
}

function Menu() {
  const t = T();
  usePage(t.explore.tones, { back: '/explore' });
  return (
    <>
      <p className="lead">Chaque syllabe thaïe porte un des cinq tons. L’objectif : regarder un mot écrit et savoir quel ton prononcer.</p>
      <div className="h2">Écouter</div>
      <div className="list"><Row ico="🎵" t="Les cinq tons" s="Courbe, exemple en grand, écoute" to="five" /><Row ico="👯" t="Même syllabe, tons différents" s={`${th.TONE_SETS.length} séries : มา · ม้า · หมา…`} to="sets" /></div>
      <div className="h2">Comprendre</div>
      <div className="list"><Row ico="💡" t="Syllabe vivante ou morte ?" s="La notion clé avant les règles" to="livedead" /><Row ico="🧭" t="La méthode en 4 questions" s="Classe, marque, fin de syllabe, durée" to="method" /><Row ico="📋" t="Le tableau des règles" s="Tout sur un écran, avec exemples" to="table" /></div>
      <div className="h2">S’entraîner</div>
      <div className="list"><Link className="row" to="/train/tones"><span className="ico">🎯</span><span className="mid"><span className="t">S’entraîner aux tons</span><span className="s">Lire le ton, l’entendre, paires, vivante ou morte</span></span><span className="end"><span className="chev">›</span></span></Link></div>
    </>
  );
}

function Five() {
  usePage('Les cinq tons', { back: '/explore/tones' });
  return <><TheoryBlockView b={{ kind: 'tones' }} /><p className="xs mut" style={{ marginTop: 10 }}>Les noms thaïs des tons : {TONES.map((t, i) => <span key={t.id}>{i > 0 ? ' · ' : ''}<Thai text={t.thaiName} /> <Rom text={t.rom} /></span>)}</p></>;
}

function Sets() {
  usePage('Même syllabe, tons différents', { back: '/explore/tones' });
  return (
    <>
      <p className="lead">Seul le ton change, et le sens n’a plus rien à voir. Touchez une série, puis chaque mot : il s’affiche en grand pendant que vous l’écoutez.</p>
      <div className="list">{th.TONE_SETS.map((s, i) => { const ws = s.words.map((w) => TONE_BY_THAI[w]).filter(Boolean); return <Link key={i} className="row" to={`set/${i}`}><span className="mid"><span className="th" lang="th" style={{ fontSize: 25 }}>{ws.map((w) => w.thai).join('  ·  ')}</span><span className="s">{ws.map((w) => <span key={w.id} className="rom">{w.rom} · </span>)}</span></span><span className="end"><span className="chev">›</span></span></Link>; })}</div>
    </>
  );
}

function SetPlayer() {
  const { i = '0' } = useParams();
  const idx = +i;
  const nav = useNavigate();
  const set = th.TONE_SETS[idx];
  const sp = useSpeaker();
  const [k, setK] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [detail, setDetail] = useState(false);
  const token = useRef(0);
  usePage(`Série ${idx + 1} / ${th.TONE_SETS.length}`, { back: '/explore/tones/sets' });
  useEffect(() => { setK(0); setPlaying(false); token.current++; }, [idx]);
  useEffect(() => () => { token.current++; sp.cancel(); }, [sp]);
  if (!set) return null;
  const ws = set.words.map((w) => TONE_BY_THAI[w]).filter(Boolean);
  const w = ws[k];
  const tn = TONE_BY_ID[w.tone];
  const playAll = () => {
    if (playing) { token.current++; setPlaying(false); sp.cancel(); return; }
    const tok = ++token.current; setPlaying(true); let j = 0;
    const next = () => { if (tok !== token.current) return; if (j >= ws.length) { setPlaying(false); return; } setK(j); if (!sp.speak(ws[j++].say, { slow: true, onend: () => setTimeout(next, 500) })) setPlaying(false); };
    next();
  };
  return (
    <>
      <div className="stage" onClick={() => sp.speak(w.say)} style={{ cursor: 'pointer' }}><span className="tag" style={{ color: tn.color }}>ton {L(tn.name)}</span><div className="big s1" style={{ fontSize: 'clamp(76px, 28vw, 124px)' }}><Thai text={w.thai} /></div><div className="rom" style={{ color: tn.color, fontSize: 28, fontWeight: 650 }}>{w.rom}</div><div className="mut">{L(w.meaning)}</div><ToneCurve tone={w.tone} /></div>
      <div className="audio"><AudioPair text={w.say} big /><button className="ib big" onClick={() => setDetail(true)} aria-label="Pourquoi ce ton ?">💡</button></div>
      <div className="tsrow">{ws.map((x, j) => <button key={x.id} className={`tsbtn ${j === k ? 'on' : ''}`} onClick={() => { token.current++; setPlaying(false); setK(j); sp.speak(x.say); }}><span className="th" lang="th">{x.thai}</span><small style={{ color: TONE_BY_ID[x.tone].color }}>{L(TONE_BY_ID[x.tone].name)}</small></button>)}</div>
      {set.note && <div className="note">{L(set.note)}</div>}
      <div className="btns" style={{ marginTop: 12 }}><button className="btn soft sm" onClick={() => nav(`/explore/tones/set/${(idx - 1 + th.TONE_SETS.length) % th.TONE_SETS.length}`)} aria-label="Série précédente"><Icon name="back" size={18} /></button><button className="btn sm" style={{ flex: 3 }} onClick={playAll}>{playing ? '⏹ Arrêter' : '▶ Écouter toute la série'}</button><button className="btn soft sm" onClick={() => nav(`/explore/tones/set/${(idx + 1) % th.TONE_SETS.length}`)} aria-label="Série suivante"><Icon name="next" size={18} /></button></div>
      {detail && <ItemDetailSheet ids={ws.map((x) => x.id)} index={k} onClose={() => setDetail(false)} onNav={setK} />}
    </>
  );
}

function LiveDead() {
  usePage('Vivante ou morte ?', { back: '/explore/tones' });
  return (
    <>
      <p className="lead">Avant de chercher le ton, on regarde comment la syllabe se termine.</p>
      <TheoryBlockView b={{ kind: 'toneRule', ruleKey: 'rule:live-dead' }} />
      <div className="note info">Attention au son final, pas à la lettre : <Thai text="ส จ ช ด ต" />… en fin de syllabe se prononcent tous <b>t</b>, donc syllabe morte. <Thai text="ร ล ญ" /> se prononcent <b>n</b>, donc vivante. Les voyelles <Thai text="อำ ไอ ใอ เอา" /> comptent comme vivantes : elles finissent par m, i, o.</div>
      <Link className="btn" to="/train/tones">Faire l’exercice</Link>
    </>
  );
}

function Method() {
  usePage('La méthode en 4 questions', { back: '/explore/tones' });
  return (
    <>
      <div className="step"><span className="num">1</span><div><h3>Quelle est la classe de la consonne initiale ?</h3><p><b style={{ color: 'var(--c-M)' }}>Moyenne</b> <Thai text="ก จ ด ต บ ป อ ฎ ฏ" /> · <b style={{ color: 'var(--c-H)' }}>haute</b> <Thai text="ข ฉ ถ ผ ฝ ส ศ ษ ห ฐ ฃ" /> · <b style={{ color: 'var(--c-L)' }}>basse</b> : toutes les autres.</p><p>Si un <Thai text="ห" /> muet précède <Thai text="ง ญ น ม ย ร ล ว" />, la syllabe suit la classe <b>haute</b> : <Thai text="หมา" /> <Rom text="mǎa" />.</p></div></div>
      <div className="step"><span className="num">2</span><div><h3>Y a-t-il une marque de ton ?</h3><p>Si oui, elle décide avec la classe, et c’est fini.</p><p><Thai text="◌่" /> : bas — mais <b>descendant</b> en classe basse.<br /><Thai text="◌้" /> : descendant — mais <b>haut</b> en classe basse.<br /><Thai text="◌๊" /> : haut · <Thai text="◌๋" /> : montant (classe moyenne uniquement).</p></div></div>
      <div className="step"><span className="num">3</span><div><h3>Sans marque : vivante ou morte ?</h3><p><b>Vivante</b> : ton moyen — sauf classe haute : <b>montant</b>.</p><p><b>Morte</b> : ton bas pour les classes moyenne et haute. Pour la classe basse, passer à la question 4.</p></div></div>
      <div className="step"><span className="num">4</span><div><h3>Classe basse + morte : voyelle courte ou longue ?</h3><p>Courte : ton <b>haut</b> — <Thai text="รัก" /> <Rom text="rák" />.<br />Longue : ton <b>descendant</b> — <Thai text="มาก" /> <Rom text="mâak" />.</p></div></div>
      <div className="btns"><Link className="btn" to="/train/tones">M’entraîner</Link><Link className="btn ghost" to="/explore/tones/table">Voir le tableau</Link></div>
    </>
  );
}

function Table() {
  usePage('Tableau des règles', { back: '/explore/tones' });
  const [ex, setEx] = useState<{ cls: ConsonantClass; live: boolean; long: boolean; mark: number } | null>(null);
  const cell = (cls: ConsonantClass, live: boolean, long: boolean, mark: number) => { const t = toneRule(cls, live, long, mark); return t ? <td key={cls}><button style={{ color: TONE_BY_ID[t].color }} onClick={() => setEx({ cls, live, long, mark })}>{toneNameFr(t)}</button></td> : <td key={cls} className="na">—</td>; };
  const head = <tr><th /><th style={{ color: 'var(--c-M)' }}>moyenne</th><th style={{ color: 'var(--c-H)' }}>haute</th><th style={{ color: 'var(--c-L)' }}>basse</th></tr>;
  const list = ex ? TONE_ITEMS.filter((w) => w.ref.cls === ex.cls && w.ref.mark === ex.mark && (ex.mark > 0 || (w.ref.live === ex.live && (ex.live || w.ref.long === ex.long)))) : [];
  const [detail, setDetail] = useState<number | null>(null);
  return (
    <>
      <p className="lead">Touchez une case pour voir des mots d’exemple.</p>
      <div className="h2">Sans marque de ton</div>
      <div className="tbl"><table><thead>{head}</thead><tbody>{([['Syllabe vivante', true, true], ['Morte, voyelle courte', false, false], ['Morte, voyelle longue', false, true]] as const).map(([lab, live, long]) => <tr key={lab}><th>{lab}</th>{(['M', 'H', 'L'] as ConsonantClass[]).map((c) => cell(c, live, long, 0))}</tr>)}</tbody></table></div>
      <div className="h2">Avec une marque de ton</div>
      <div className="tbl"><table><thead>{head}</thead><tbody>{TONE_MARKS.map((mk) => <tr key={mk.n}><th><span className="th" style={{ fontSize: 22 }}>◌{mk.char}</span><br /><span className="xs th" lang="th">{mk.name}</span></th>{(['M', 'H', 'L'] as ConsonantClass[]).map((c) => cell(c, true, true, mk.n))}</tr>)}</tbody></table></div>
      <div className="note">À retenir : sans marque, tout est <b>moyen</b> ou <b>bas</b>, sauf la classe haute vivante (montant) et la classe basse morte (haut si courte, descendant si longue). Les marques <Thai text="◌๊ ◌๋" /> ne s’emploient qu’avec la classe moyenne.</div>
      {ex && <Sheet open onClose={() => setEx(null)} title={`Classe ${classNameFr(ex.cls)} → ton ${toneNameFr(toneRule(ex.cls, ex.live, ex.long, ex.mark) ?? 'M')}`}>
        {list.length ? <div className="list">{list.map((w, i) => <button key={w.id} className="row" onClick={() => setDetail(i)}><span className="mid"><Thai text={w.thai} /><span className="s"><Rom text={w.rom} /> · {L(w.meaning)}</span></span><span className="end"><span className="chev">›</span></span></button>)}</div> : <div className="empty">Pas de mot d’exemple dans la base pour cette case.</div>}
        {detail != null && <ItemDetailSheet ids={list.map((w) => w.id)} index={detail} onClose={() => setDetail(null)} onNav={setDetail} />}
      </Sheet>}
    </>
  );
}

export function Tones() {
  useStore((s) => s.profile);
  return (
    <Routes>
      <Route index element={<Menu />} />
      <Route path="five" element={<Five />} />
      <Route path="sets" element={<Sets />} />
      <Route path="set/:i" element={<SetPlayer />} />
      <Route path="livedead" element={<LiveDead />} />
      <Route path="method" element={<Method />} />
      <Route path="table" element={<Table />} />
    </Routes>
  );
}
