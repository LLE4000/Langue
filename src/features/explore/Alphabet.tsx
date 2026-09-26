/** Alphabet : grille des 44 consonnes par classe ; un toucher = le son (et un aperçu), un second = la fiche. */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useKnown } from '@/app/hooks';
import { useStore } from '@/app/store';
import { useSpeaker } from '@/app/services/speech';
import { CONS_ITEMS, CONS_BY_CHAR, ITEMS, th, type LearnItem } from '@/content/th';
import { mastery } from '@/engine/srs';
import { L, T } from '@/i18n';
import { Icon, Thai, Rom, MasteryDot } from '@/components/ui';
import { ItemDetailSheet } from '@/components/ItemCard';
import type { ConsonantClass } from '@/content/types';

export function LetterCell({ it, onClick, locked, active }: { it: LearnItem & { kind: 'cons' }; onClick: () => void; locked?: boolean; active?: boolean }) {
  const m = useStore((s) => mastery(s.srs[it.id]));
  return <button className={`cell ${it.ref.cls} ${locked ? 'locked' : ''} ${active ? 'sel' : ''}`} onClick={onClick} lang="th" aria-label={`${it.thai} ${it.ref.nameWord}`} aria-pressed={active}>{it.thai}<MasteryDot m={m} /><small>{it.ref.initial === '(muet)' ? '–' : it.ref.initial}</small></button>;
}

/**
 * Bandeau d'aperçu, collé en bas : ce qu'on vient de toucher, à réécouter (nom entier, son seul, lentement),
 * avec l'accès à la fiche complète et à l'écoute en boucle. Le son est déjà parti au toucher.
 */
export function PeekBar({ it, onDetail, onClose }: { it: LearnItem; onDetail: () => void; onClose: () => void }) {
  const sp = useSpeaker();
  const sound = it.kind === 'cons' ? it.ref.audioBase + 'อ' : it.say;
  const title = it.kind === 'cons' ? `${it.thai} ${it.ref.nameWord}` : it.thai;
  return (
    <div className="peek" role="region" aria-label="Aperçu de la lettre">
      <button className="peek-main" onClick={onDetail} aria-label="Ouvrir la fiche">
        <span className={`glyph ${it.kind === 'cons' ? it.ref.cls : ''}`} lang="th">{it.thai}</span>
        <span className="txt"><b><Thai text={title} /> <Rom text={it.rom} /></b><span className="sm mut">{L(it.meaning)}{it.kind === 'cons' ? ` · classe ${it.ref.cls === 'M' ? 'moyenne' : it.ref.cls === 'H' ? 'haute' : 'basse'}` : ''} · <u>Fiche</u></span></span>
      </button>
      <div className="peek-acts">
        <button className="ib" onClick={() => sp.speak(it.say)} aria-label="Réécouter"><Icon name="speaker" /></button>
        {it.kind === 'cons' && <button className="ib" onClick={() => sp.speak(sound)} aria-label="Le son seul" title="Le son seul"><span lang="th" className="th" style={{ fontSize: 17 }}>{sound}</span></button>}
        <button className="ib" onClick={() => sp.speak(it.say, { slow: true })} aria-label="Lentement"><Icon name="turtle" /></button>
        <Link className="ib" to={`/explore/listen?ids=${encodeURIComponent(it.id)}`} aria-label="Écouter en boucle" title="Écouter en boucle"><Icon name="repeat" /></Link>
        <button className="ib" onClick={onClose} aria-label="Fermer l’aperçu"><Icon name="close" size={18} /></button>
      </div>
    </div>
  );
}

export function Alphabet() {
  const t = T();
  const nav = useNavigate();
  const sp = useSpeaker();
  usePage(t.explore.alphabet, { back: '/explore' });
  const [filter, setFilter] = useState<'all' | ConsonantClass>('all');
  const [detail, setDetail] = useState<{ ids: string[]; i: number } | null>(null);
  const [peek, setPeek] = useState<{ ids: string[]; i: number } | null>(null);
  const known = useKnown();
  const list = CONS_ITEMS.filter((c) => filter === 'all' || c.ref.cls === filter);
  const ids = list.map((c) => c.id);
  const peekItem = peek ? ITEMS[peek.ids[peek.i]] : null;
  // Un toucher : le son part tout de suite (geste utilisateur, indispensable sur Android) et l'aperçu s'affiche.
  // Un second toucher sur la même lettre ouvre la fiche.
  const tap = (c: LearnItem & { kind: 'cons' }, group: string[]) => {
    if (peekItem?.id === c.id) { setDetail({ ids: group, i: group.indexOf(c.id) }); return; }
    sp.speak(c.say);
    setPeek({ ids: group, i: group.indexOf(c.id) });
  };
  return (
    <>
      <div className="chips">{([['all', 'Toutes · 44'], ['M', 'Classe moyenne · 9'], ['H', 'Classe haute · 11'], ['L', 'Classe basse · 24']] as const).map(([f, lab]) => <button key={f} className={`chip ${filter === f ? 'on' : ''} ${f !== 'all' ? 'cls-' + f : ''}`} onClick={() => setFilter(f)}>{f !== 'all' && <i className="dot" aria-hidden="true" />}{lab}</button>)}</div>
      <div className="btns" style={{ marginBottom: 12 }}><button className="btn soft sm" onClick={() => nav('/explore/listen?set=cons')}><Icon name="repeat" size={18} /> Écouter l’alphabet en boucle</button></div>
      <p className="xs mut" style={{ margin: '-4px 2px 10px' }}>Touchez une lettre pour l’entendre ; touchez-la encore pour ouvrir sa fiche.</p>
      <div className="lgrid">{list.map((c) => <LetterCell key={c.id} it={c} locked={!known.concepts.has(c.id)} active={peekItem?.id === c.id} onClick={() => tap(c, ids)} />)}</div>
      <p className="xs mut" style={{ margin: '12px 2px 0' }}>Les lettres estompées n’ont pas encore été enseignées dans votre parcours ; vous pouvez tout de même les écouter et les consulter.</p>
      <details className="fold">
        <summary>Sons voisins à l’oreille <span className="sm mut">· ป / พ, ต / ท, ก / ค…</span></summary>
        <p className="sm mut" style={{ margin: '6px 2px 10px' }}>La deuxième lettre est <b>aspirée</b> (un souffle après la consonne). Écoutez-les l’une après l’autre, en boucle.</p>
        <div className="chips">{th.NEAR_SOUNDS.map(([lab, chars]) => <Link key={lab} className="chip" to={`/explore/listen?ids=${encodeURIComponent([...chars].map((c) => 'c:' + c).join(','))}`}><b className="rom">{lab}</b> <Thai text={[...chars].join(' ')} style={{ fontSize: 17, color: 'var(--ink)' }} /> <Icon name="repeat" size={14} /></Link>)}</div>
      </details>
      <details className="fold">
        <summary>Lettres qui se ressemblent <span className="sm mut">· {th.LOOKALIKES.length} groupes</span></summary>
        <p className="sm mut" style={{ margin: '6px 2px 10px' }}>Comparez la place de la petite boucle (dedans, dehors, en haut, en bas) et la fin du trait.</p>
        {th.LOOKALIKES.map((g, k) => {
          const gi = g.map((y) => 'c:' + y);
          return (
            <div key={k} className="lgrid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: 10 }}>
              {g.map((x) => { const c = CONS_ITEMS.find((it) => it.thai === x)!; return <LetterCell key={x} it={c} active={peekItem?.id === c.id} onClick={() => tap(c, gi)} />; })}
              <Link className="cell" style={{ fontFamily: 'var(--f-ui)', fontSize: 20, background: 'var(--jade-soft)', border: 0, color: 'var(--jade)' }} to={`/explore/listen?ids=${encodeURIComponent(gi.join(','))}`} aria-label="Écouter ce groupe en boucle"><Icon name="repeat" /></Link>
            </div>
          );
        })}
      </details>
      <details className="fold">
        <summary>Pour retenir et tracer</summary>
        <div className="note info" style={{ marginTop: 8 }}>Les 9 consonnes de classe moyenne : <Thai text="ไก่จิกเด็กตายบนปากโอ่ง" /> <Rom text="kài jìk dèk taai bon pàak òong" /> — « le poulet picore l’enfant mort sur le bord de la jarre ».</div>
        <div className="note sm">On commence par la petite boucle (la « tête », <Thai text="หัว" />), puis on trace le reste d’un seul geste, en général de gauche à droite. Seules <Thai text="ก" /> et <Thai text="ธ" /> n’ont pas de tête. Le mot du nom de chaque lettre (ก ไก่ « poulet ») est la façon dont un Thaï épelle.</div>
      </details>
      {peekItem && !detail && <PeekBar it={peekItem} onDetail={() => setDetail(peek)} onClose={() => setPeek(null)} />}
      {detail && <ItemDetailSheet ids={detail.ids} index={detail.i} onClose={() => setDetail(null)} onNav={(i) => setDetail({ ...detail, i })} />}
    </>
  );
}

export { CONS_BY_CHAR };
