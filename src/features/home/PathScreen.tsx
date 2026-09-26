/** Le parcours complet, unité par unité, avec l'état de chaque leçon ; on arrive sur la leçon en cours. */
import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useNextLesson, usePath, useProgress } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { remainingLine, tierLine } from '@/engine/progress';
import { L, T } from '@/i18n';

export function PathScreen() {
  const t = T();
  usePage(t.home.path, { back: '/' });
  const path = usePath();
  const next = useNextLesson();
  const cur = curriculum();
  const prog = useProgress();
  const visible = path.filter((p) => p.status !== 'granted');
  const granted = path.length - visible.length;
  const done = visible.filter((p) => p.status === 'done').length;
  const curRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => { curRef.current?.scrollIntoView({ block: 'center' }); }, []);
  // regroupe par unité en respectant l'ordre du parcours
  const groups: { unit: (typeof cur.units)[number]; items: typeof path }[] = [];
  for (const p of visible) {
    const last = groups[groups.length - 1];
    if (last && last.unit.id === p.lesson.unit) last.items.push(p);
    else groups.push({ unit: cur.units.find((u) => u.id === p.lesson.unit)!, items: [p] });
  }
  let n = 0;
  return (
    <>
      <div className="chead">
        <div className="cring" style={{ ['--p' as string]: Math.round((done / Math.max(1, visible.length)) * 100) }}><b>{done}</b><small>/ {visible.length}</small></div>
        <div className="mid"><div style={{ fontSize: 18, fontWeight: 700 }}>{done} leçon{done > 1 ? 's' : ''} validée{done > 1 ? 's' : ''} sur {visible.length}</div><div className="sm" style={{ fontWeight: 650 }}>{tierLine(prog)} · {remainingLine(prog)}</div><div className="xs mut">{granted ? `${granted} leçon${granted > 1 ? 's' : ''} déjà acquise${granted > 1 ? 's' : ''} d’après votre niveau · ` : ''}Suivez l’ordre conseillé, ou piochez librement.</div></div>
      </div>
      {groups.map((g, gi) => {
        const unitDoneN = g.items.filter((p) => p.status === 'done').length;
        const unitDone = unitDoneN === g.items.length;
        return (
          <div key={g.unit.id + gi}>
            <div className="unit-head"><div style={{ flex: 1 }}><h3>{L(g.unit.title)}{unitDone ? ' ✓' : ''}</h3><div className="s">{L(g.unit.description)}</div></div><span className={`tag ${unitDone ? 'ok' : ''}`}>{unitDoneN} / {g.items.length}</span></div>
            <div className="list">
              {g.items.map((p) => {
                n++;
                const isNext = p.lesson.id === next?.lesson.id;
                const st = p.status === 'done' ? 'ok' : isNext ? 'cur' : p.status === 'available' ? 'avail' : 'todo';
                const sub = [L(p.lesson.subtitle), p.knownOrally ? 'déjà connu à l’oral' : '', p.lesson.minutes ? `${p.lesson.minutes} min` : ''].filter(Boolean).join(' · ');
                return (
                  <Link key={p.lesson.id} ref={isNext ? curRef : undefined} to={`/lesson/${p.lesson.id}`} className={`row lrow ${st}`} aria-current={isNext ? 'step' : undefined}>
                    <span className="ico">{st === 'ok' ? '✓' : st === 'cur' ? '▶' : n}</span>
                    <span className="mid"><span className="t">{L(p.lesson.title)}</span><span className="s">{sub}</span></span>
                    <span className="end">{st === 'cur' ? <span className="tag gold">Conseillée</span> : st === 'todo' ? <span className="xs mut">Plus tard</span> : <span className="chev">›</span>}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </>
  );
}
