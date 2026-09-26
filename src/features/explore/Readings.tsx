/** Lectures : textes par niveau, avec indication de lisibilité selon le parcours. */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { useKnown } from '@/app/hooks';
import { READING_BY_ID, th } from '@/content/th';
import { isReadable } from '@/engine/thai/reading';
import { L, T } from '@/i18n';
import { ReadingView } from '@/components/ReadingView';
import { Empty } from '@/components/ui';

export function Readings() {
  const t = T();
  usePage(t.explore.readings, { back: '/explore' });
  const hist = useStore((s) => s.history);
  const known = useKnown();
  const done = new Set(hist.filter((h) => h.kind === 'reading').map((h) => h.label));
  const readable = (rid: string) => READING_BY_ID[rid].sentences.every((s) => s.tokens.every((tk) => /\{/.test(tk.thai) || isReadable(tk.thai, known.concepts)));
  return (
    <>
      <p className="lead">Lisez d’abord sans aide. Les textes marqués « lisible » n’utilisent que des signes déjà vus dans votre parcours.</p>
      {[1, 2, 3, 4, 5].map((lvl) => (
        <div key={lvl}><div className="h2">Niveau {lvl}</div><div className="list">{th.READINGS.filter((r) => r.level === lvl).map((r) => <Link key={r.id} className={`row ${done.has(r.id) ? 'done' : ''}`} to={`/explore/readings/${encodeURIComponent(r.id)}`}><span className="ico">{done.has(r.id) ? '✓' : '📖'}</span><span className="mid"><span className="t">{L(r.title)}</span><span className="s">{r.sentences.length} phrases{readable(r.id) ? ' · lisible avec ce que vous savez' : ''}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div></div>
      ))}
    </>
  );
}

export function ReadingScreen() {
  const { id = '' } = useParams();
  const r = READING_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const log = useStore((s) => s.logHistory);
  const recordActivity = useStore((s) => s.recordActivity);
  const addXp = useStore((s) => s.addXp);
  usePage(r ? L(r.title) : 'Lecture', { back: '/explore/readings' });
  if (!r) return <Empty e="🔍">Texte introuvable.</Empty>;
  return <ReadingView id={r.id} onDone={() => { log('reading', r.id); recordActivity('reading:' + r.id); addXp(5); nav('/explore/readings'); }} />;
}
