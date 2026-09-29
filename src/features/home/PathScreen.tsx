/**
 * Le parcours complet, par étapes de huit leçons (la dernière peut en compter jusqu'à onze), avec l'état de chaque leçon ;
 * on arrive sur la leçon en cours. Les séances « Lire à voix haute » (et la grille de lecture) se rangent juste après la
 * leçon qui enseigne leurs dernières lettres, verrouillées jusque-là. En haut à droite, la série de jours seule : le
 * palier est déjà dans le grand bandeau.
 */
import { Fragment, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { usePage } from '@/app/Shell';
import { useKnown, useNextLesson, usePath, useProgress } from '@/app/hooks';
import { useStore, emptyReadAloud } from '@/app/store';
import { curriculum } from '@/content/packs';
import { L, T, frTypo } from '@/i18n';
import { Bar, Icon, ThInl } from '@/components/ui';
import { LessonRow, PathActivityRow } from '@/components/LessonCard';
import { TierHero } from '@/components/Progress';
import { raProgram, type RaSession } from '@/engine/readaloud/program';
import { isUnlocked, PASS, unlockIndex, unlockLesson } from '@/features/readaloud/data';
import { StreakChip } from './Home';

const STREAK = <StreakChip />;
const range = (a: number, b: number) => (a === b ? `séance ${a}` : b === a + 1 ? `séances ${a} et ${b}` : `séances ${a} à ${b}`);

export function PathScreen() {
  const t = T();
  usePage(t.home.path, { back: '/', right: STREAK });
  const path = usePath();
  const next = useNextLesson();
  const cur = curriculum();
  const prog = useProgress();
  const known = useKnown().concepts;
  const ra = useStore((s) => s.readAloud) ?? emptyReadAloud();
  const visible = path.filter((p) => p.status !== 'granted');
  const granted = path.length - visible.length;

  // Lire à voix haute : les séances regroupées par leçon qui les débloque, rangées après la dernière leçon visible
  // à cette place du parcours (ou en tête si elle est déjà acquise d'après le profil).
  const lessons = useMemo(() => path.map((p) => p.lesson), [path]);
  const raAfter = useMemo(() => {
    const at = unlockIndex(lessons);
    const byIdx = new Map<number, RaSession[]>();
    for (const s of raProgram()) { const i = at.get(s.id) ?? -1; if (i >= 0) byIdx.set(i, [...(byIdx.get(i) ?? []), s]); }
    const out = new Map<string, RaSession[][]>(); // id de la leçon visible (ou '' : en tête) → groupes de séances
    let lastVisible = '';
    path.forEach((p, i) => {
      if (p.status !== 'granted') lastVisible = p.lesson.id;
      const g = byIdx.get(i);
      if (g) out.set(lastVisible, [...(out.get(lastVisible) ?? []), g]);
    });
    return out;
  }, [path, lessons]);
  const firstGroup = [...raAfter.values()].flat()[0];
  const raRows = (key: string): ReactNode => raAfter.get(key)?.map((g) => {
    const target = g.find((s) => (ra.sessions[s.id]?.best ?? 0) < PASS) ?? g[0];
    const firstOpen = isUnlocked(g[0], known);
    const locked = g.find((s) => !isUnlocked(s, known));
    const until = locked && unlockLesson(locked, lessons, known);
    const after = until ? [<ThInl key="after" text={frTypo(`après « ${L(until.title)} »`)} />] : [];
    const passedN = g.filter((s) => (ra.sessions[s.id]?.best ?? 0) >= PASS).length;
    const best = ra.sessions[target.id]?.best;
    const meta = !firstOpen ? after : g.length > 1 ? [`${passedN} / ${g.length} réussie${passedN > 1 ? 's' : ''}`, ...after] : best != null ? [`meilleur ${best} %`] : [`${target.items.length} lectures`];
    return (
      <Fragment key={g[0].id}>
        <PathActivityRow to={`/read/${target.id}`} icon="mic" title="Lire à voix haute" part={range(g[0].n, g[g.length - 1].n)} sub={<ThInl text={`${target.title} · ${target.sub}`} />}
          label="Lecture au micro" meta={meta} minutes={target.minutes} state={passedN === g.length ? 'done' : !firstOpen ? 'lock' : undefined} />
        {g === firstGroup && (
          <PathActivityRow to="/read/grid" icon="grid" title="Grille de lecture" sub={<>Consonnes × voyelles au hasard : <ThInl text="ขา ขี ขู เข…" /></>} label="Lecture au micro" meta={!firstOpen ? after : ['à volonté']} state={!firstOpen ? 'lock' : undefined} />
        )}
      </Fragment>
    );
  });
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
  // Une dernière étape de une à trois leçons rejoint la précédente (pas d'« Étape 21 · leçons 161 à 161 » qui coupe une série)
  if (groups.length > 1 && groups[groups.length - 1].items.length <= 3) {
    const last = groups.pop()!;
    const prev = groups[groups.length - 1];
    prev.items.push(...last.items);
    last.units.forEach((u) => { if (!prev.units.includes(u)) prev.units.push(u); });
  }
  return (
    <>
      {/* En tête : le palier et sa jauge, calculés sur la maîtrise réelle ; pas de total de leçons (il grandit avec les mises à jour) */}
      <TierHero p={prog} />
      {granted > 0 && <p className="note-under mt-2">{granted} leçon{granted > 1 ? 's' : ''} déjà acquise{granted > 1 ? 's' : ''} d’après votre niveau. Suivez l’ordre conseillé, ou piochez librement.</p>}
      {raAfter.has('') && <div className="list mt-3">{raRows('')}</div>}
      {groups.map((g) => {
        const unitDoneN = g.items.filter((p) => p.status === 'done').length;
        const unitDone = unitDoneN === g.items.length;
        const from = (g.n - 1) * STEP + 1;
        return (
          <section key={g.n} aria-label={`Étape ${g.n}`}>
            <div className="unit-head"><div className="grow"><h3>Étape {g.n} <span className="range">· {g.items.length === 1 ? `leçon ${from}` : `leçons ${from} à ${from + g.items.length - 1}`}</span></h3><div className="s">{g.units.map((u) => <span key={u} className="u">{u}</span>)}</div></div><span className={`tag ${unitDone ? 'ok' : ''}`}>{unitDone && <Icon name="check" />}{unitDoneN} / {g.items.length}</span></div>
            <div className="unit-bar"><Bar p={unitDoneN / Math.max(1, g.items.length)} thin /></div>
            <div className="list">
              {g.items.map((p) => {
                const isNext = p.lesson.id === next?.lesson.id;
                const state = p.status === 'done' ? 'done' : isNext ? 'cur' : p.status === 'locked' ? 'lock' : undefined;
                return (
                  <Fragment key={p.lesson.id}>
                    <LessonRow lesson={p.lesson} state={state} current={isNext} rowRef={isNext ? curRef : undefined} extra={p.knownOrally ? 'déjà connu à l’oral' : undefined} />
                    {raRows(p.lesson.id)}
                  </Fragment>
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
