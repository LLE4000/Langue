/** Le parcours complet, par étapes de huit leçons, avec l'état de chaque leçon ; on arrive sur la leçon en cours. */
import { useEffect, useRef } from 'react';
import { usePage } from '@/app/Shell';
import { useNextLesson, usePath, useProgress } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { remainingLine, tierLine } from '@/engine/progress';
import { L, T } from '@/i18n';
import { Bar, Icon } from '@/components/ui';
import { LessonRow } from '@/components/LessonCard';

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
  // Le parcours entrelace les pistes : on le découpe en étapes de huit leçons, chacune nommée par les unités qu'elle parcourt
  const STEP = 8;
  const groups: { n: number; units: string[]; items: typeof path }[] = [];
  visible.forEach((p, i) => {
    if (i % STEP === 0) groups.push({ n: groups.length + 1, units: [], items: [] });
    const g = groups[groups.length - 1];
    g.items.push(p);
    const u = L(cur.units.find((x) => x.id === p.lesson.unit)?.title);
    if (u && !g.units.includes(u)) g.units.push(u);
  });
  return (
    <>
      <div className="chead">
        <div className="cring" style={{ ['--p' as string]: Math.round((done / Math.max(1, visible.length)) * 100) }}><b>{done}</b><small>/ {visible.length}</small></div>
        <div className="mid"><div className="name">{done} leçon{done > 1 ? 's' : ''} validée{done > 1 ? 's' : ''} sur {visible.length}</div><div className="sm b">{tierLine(prog)}</div><div className="sm mut">{remainingLine(prog)}</div><div className="xs mut">{granted ? `${granted} leçon${granted > 1 ? 's' : ''} déjà acquise${granted > 1 ? 's' : ''} d’après votre niveau · ` : ''}Suivez l’ordre conseillé, ou piochez librement.</div></div>
      </div>
      {groups.map((g) => {
        const unitDoneN = g.items.filter((p) => p.status === 'done').length;
        const unitDone = unitDoneN === g.items.length;
        const from = (g.n - 1) * STEP + 1;
        return (
          <section key={g.n} aria-label={`Étape ${g.n}`}>
            <div className="unit-head"><div className="grow"><h3>Étape {g.n} <span className="range">· leçons {from} à {from + g.items.length - 1}</span></h3><div className="s">{g.units.join(' · ')}</div></div><span className={`tag ${unitDone ? 'ok' : ''}`}>{unitDone && <Icon name="check" />}{unitDoneN} / {g.items.length}</span></div>
            <div className="unit-bar"><Bar p={unitDoneN / Math.max(1, g.items.length)} thin /></div>
            <div className="list">
              {g.items.map((p) => {
                const isNext = p.lesson.id === next?.lesson.id;
                const state = p.status === 'done' ? 'done' : isNext ? 'cur' : p.status === 'locked' ? 'lock' : undefined;
                return <LessonRow key={p.lesson.id} lesson={p.lesson} state={state} current={isNext} rowRef={isNext ? curRef : undefined} extra={p.knownOrally ? 'déjà connu à l’oral' : undefined} />;
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
