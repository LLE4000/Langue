/** Le parcours complet, unité par unité, avec l'état de chaque leçon. */
import { Link } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { usePath } from '@/app/hooks';
import { curriculum } from '@/content/packs';
import { L, T } from '@/i18n';
import { Icon } from '@/components/ui';

export function PathScreen() {
  const t = T();
  usePage(t.home.path, { back: '/' });
  const path = usePath();
  const cur = curriculum();
  const visible = path.filter((p) => p.status !== 'granted');
  const granted = path.length - visible.length;
  const done = visible.filter((p) => p.status === 'done').length;
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
        <div className="mid"><div className="ct" style={{ fontSize: 13, fontWeight: 700, color: 'var(--jade)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Parcours</div><div style={{ fontSize: 18, fontWeight: 700 }}>{done} leçon{done > 1 ? 's' : ''} validée{done > 1 ? 's' : ''}</div><div className="xs mut">{granted ? `${granted} leçons considérées acquises d’après votre niveau · ` : ''}Les pistes s’entrelacent selon vos besoins.</div></div>
      </div>
      <p className="lead" style={{ marginTop: 12 }}>Chaque leçon débloque la suivante. Vous pouvez en faire autant que vous voulez dans la journée.</p>
      {groups.map((g, gi) => (
        <div key={g.unit.id + gi}>
          <div className="unit-head"><div><h3>{L(g.unit.title)}</h3><div className="s">{L(g.unit.description)}</div></div></div>
          <div className="list">
            {g.items.map((p) => {
              n++;
              const st = p.status === 'done' ? 'ok' : p.status === 'available' ? 'cur' : 'todo';
              return (
                <Link key={p.lesson.id} to={`/lesson/${p.lesson.id}`} className={`row lrow ${st}`}>
                  <span className="ico">{st === 'ok' ? '✓' : st === 'cur' ? '▶' : n}</span>
                  <span className="mid"><span className="t">{n}. {L(p.lesson.title)}</span><span className="s">{L(p.lesson.subtitle)}{p.knownOrally ? ' · déjà connu à l’oral' : ''} · {p.lesson.minutes} min</span></span>
                  <span className="end">{st === 'todo' ? <Icon name="lock" size={16} /> : <span className="chev">›</span>}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}
