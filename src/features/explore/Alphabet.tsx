/** Alphabet : grille des 44 consonnes par classe, lettres sosies, écoute en boucle, fiche détaillée. */
import { useEffect, useRef, useState } from 'react';
import { usePage } from '@/app/Shell';
import { useKnown } from '@/app/hooks';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { CONS_ITEMS, CONS_BY_CHAR, th, type LearnItem } from '@/content/th';
import { mastery } from '@/engine/srs';
import { T } from '@/i18n';
import { Icon, Sheet, Thai, Rom, MasteryDot, Segmented } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import type { ConsonantClass } from '@/content/types';

export function LetterCell({ it, onClick, locked }: { it: LearnItem & { kind: 'cons' }; onClick: () => void; locked?: boolean }) {
  const m = useStore((s) => mastery(s.srs[it.id]));
  return <button className={`cell ${it.ref.cls} ${locked ? 'locked' : ''}`} onClick={onClick} lang="th" aria-label={`${it.thai} ${it.ref.nameWord}`}>{it.thai}<MasteryDot m={m} /><small>{it.ref.initial === '(muet)' ? '–' : it.ref.initial}</small></button>;
}

/** Écoute en boucle : plusieurs lettres lues l'une après l'autre, pour exercer l'oreille. */
export function LoopSheet({ ids, onClose }: { ids: string[]; onClose: () => void }) {
  const sp = useSpeaker();
  const [sel, setSel] = useState<string[]>(ids);
  const [mode, setMode] = useState<'sound' | 'name'>('sound');
  const [slow, setSlow] = useState(false);
  const [hide, setHide] = useState(false);
  const [on, setOn] = useState(false);
  const [i, setI] = useState(0);
  const [reveal, setReveal] = useState(true);
  const token = useRef(0);
  const cur = CONS_ITEMS.find((c) => c.id === sel[i]);
  const text = (c: LearnItem & { kind: 'cons' }) => (mode === 'name' ? c.say : c.ref.audioBase + 'อ');
  const stop = () => { token.current++; setOn(false); sp.cancel(); };
  const step = (tok: number, k: number) => {
    if (tok !== token.current || !sel.length) return;
    const c = CONS_ITEMS.find((x) => x.id === sel[k % sel.length])!;
    setI(k % sel.length); setReveal(!hide);
    let done = false;
    const after = () => { if (done || tok !== token.current) return; done = true; setReveal(true); setTimeout(() => step(tok, k + 1), hide ? 1400 : 900); };
    if (!sp.speak(text(c), { slow, onend: after })) { setOn(false); return; }
    setTimeout(after, 6000);
  };
  const play = () => { if (sel.length < 2) return; token.current++; setOn(true); step(token.current, i); };
  useEffect(() => () => { token.current++; sp.cancel(); }, [sp]);
  return (
    <Sheet open onClose={() => { stop(); onClose(); }} title="Écoute en boucle">
      <div className="stage compact" style={{ minHeight: 150 }}><div className="big s1" style={{ fontSize: 96 }}>{cur ? (reveal || !on ? <Thai text={cur.thai} /> : '?') : '…'}</div>{cur && (reveal || !on) && <span><Thai text={cur.thai + ' ' + cur.ref.nameWord} /> <Rom text={cur.rom} /></span>}</div>
      <div className="audio"><button className="ib" onClick={() => { stop(); setI((i - 1 + sel.length) % sel.length); }} aria-label="Précédent"><Icon name="back" /></button><button className={`ib big pri`} onClick={on ? stop : play} aria-label={on ? 'Pause' : 'Lire'}><Icon name={on ? 'pause' : 'play'} /></button><button className="ib" onClick={() => { stop(); setI((i + 1) % sel.length); }} aria-label="Suivant"><Icon name="next" /></button></div>
      <div className="btns" style={{ marginBottom: 8 }}><Segmented value={mode} options={[{ v: 'sound', label: 'Son seul' }, { v: 'name', label: 'Nom entier' }]} onChange={(v) => { stop(); setMode(v); }} /><Segmented value={slow} options={[{ v: false, label: 'Normal' }, { v: true, label: '🐢 Lent' }]} onChange={(v) => { stop(); setSlow(v); }} /></div>
      <button className="btn ghost sm" aria-pressed={hide} onClick={() => { stop(); setHide(!hide); }}>🙈 Deviner d’abord</button>
      <div className="h2">Lettres de la boucle <span className="sp" /><span className="sm mut">{sel.length}</span></div>
      <p className="sm mut" style={{ margin: '0 2px 6px' }}>Sons voisins à distinguer</p>
      <div className="chips">{th.NEAR_SOUNDS.map(([lab, chars]) => <button key={lab} className="chip" onClick={() => { stop(); setSel([...chars].map((c) => 'c:' + c)); setI(0); }}><b className="rom">{lab}</b> <Thai text={[...chars].join(' ')} style={{ fontSize: 17, color: 'var(--ink)' }} /></button>)}</div>
      <div className="lgrid">{CONS_ITEMS.filter((c) => !c.ref.obsolete).map((c) => <button key={c.id} className={`cell ${c.ref.cls} ${sel.includes(c.id) ? 'sel' : ''}`} lang="th" aria-pressed={sel.includes(c.id)} onClick={() => { stop(); setSel(sel.includes(c.id) ? sel.filter((x) => x !== c.id) : [...sel, c.id]); }}>{c.thai}<small>{c.ref.initial === '(muet)' ? '–' : c.ref.initial}</small></button>)}</div>
      <div className="note info sm" style={{ marginTop: 14 }}>Dans un groupe « même son », les lettres se prononcent <b>exactement pareil</b> en début de syllabe : ce qui change, c’est la classe, donc le ton. On l’entend quand on récite la lettre : classe haute sur un ton montant (ข khɔ̌ɔ), classes moyenne et basse sur un ton moyen (ค khɔɔ).</div>
    </Sheet>
  );
}

export function Alphabet() {
  const t = T();
  usePage(t.explore.alphabet, { back: '/explore' });
  const [filter, setFilter] = useState<'all' | ConsonantClass>('all');
  const [detail, setDetail] = useState<{ ids: string[]; i: number } | null>(null);
  const [loop, setLoop] = useState<string[] | null>(null);
  const known = useKnown();
  const list = CONS_ITEMS.filter((c) => filter === 'all' || c.ref.cls === filter);
  const ids = list.map((c) => c.id);
  return (
    <>
      <div className="chips">{([['all', 'Toutes · 44'], ['M', 'Moyenne · 9'], ['H', 'Haute · 11'], ['L', 'Basse · 24']] as const).map(([f, lab]) => <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>{lab}</button>)}</div>
      <div className="btns" style={{ marginBottom: 12 }}><button className="btn soft sm" onClick={() => setLoop(['c:ก', 'c:ข', 'c:ค'])}>🔁 Écoute en boucle</button></div>
      <div className="lgrid">{list.map((c) => <LetterCell key={c.id} it={c} locked={!known.concepts.has(c.id)} onClick={() => setDetail({ ids, i: ids.indexOf(c.id) })} />)}</div>
      <div className="note info" style={{ marginTop: 14 }}>La couleur indique la classe : <b style={{ color: 'var(--c-M)' }}>moyenne</b>, <b style={{ color: 'var(--c-H)' }}>haute</b>, <b style={{ color: 'var(--c-L)' }}>basse</b>. Les lettres grisées n’ont pas encore été enseignées dans votre parcours (vous pouvez tout de même les consulter). Pour retenir les 9 moyennes : <Thai text="ไก่จิกเด็กตายบนปากโอ่ง" /> <Rom text="kài jìk dèk taai bon pàak òong" /> — « le poulet picore l’enfant mort sur le bord de la jarre ».</div>
      <div className="h2">Lettres qui se ressemblent</div>
      <p className="sm mut" style={{ margin: '0 2px 10px' }}>Comparez la place de la petite boucle (dedans, dehors, en haut, en bas) et la fin du trait.</p>
      {th.LOOKALIKES.map((g, k) => (
        <div key={k} className="lgrid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 10 }}>
          {g.map((x) => { const c = CONS_ITEMS.find((it) => it.thai === x)!; return <LetterCell key={x} it={c} onClick={() => { const gi = g.map((y) => 'c:' + y); setDetail({ ids: gi, i: gi.indexOf(c.id) }); }} />; })}
          <button className="cell" style={{ fontFamily: 'var(--f-ui)', fontSize: 20, background: 'var(--jade-soft)', border: 0, color: 'var(--jade)' }} onClick={() => setLoop(g.map((y) => 'c:' + y))} aria-label="Écouter ce groupe en boucle">🔁</button>
        </div>
      ))}
      <div className="note sm">On commence par la petite boucle (la « tête », <Thai text="หัว" />), puis on trace le reste d’un seul geste, en général de gauche à droite. Seules <Thai text="ก" /> et <Thai text="ธ" /> n’ont pas de tête. Le mot du nom de chaque lettre (ก ไก่ « poulet ») est la façon dont un Thaï épelle.</div>
      {detail && <ItemDetailSheet ids={detail.ids} index={detail.i} onClose={() => setDetail(null)} onNav={(i) => setDetail({ ...detail, i })} />}
      {loop && <LoopSheet ids={loop} onClose={() => setLoop(null)} />}
    </>
  );
}

export { CONS_BY_CHAR };
