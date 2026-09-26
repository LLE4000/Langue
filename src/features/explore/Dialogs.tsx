/** Conversations : liste et lecteur. */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { DIALOG_BY_ID, th } from '@/content/th';
import { L, T } from '@/i18n';
import { DialogView } from '@/components/DialogView';
import { Empty, Icon } from '@/components/ui';

export function Dialogs() {
  const t = T();
  usePage(t.explore.conversations, { back: '/explore' });
  const hist = useStore((s) => s.history);
  const done = new Set(hist.filter((h) => h.kind === 'dialog').map((h) => h.label));
  return (
    <>
      <p className="lead">Des situations réelles. La traduction est masquée au départ : essayez d’abord de comprendre seul.</p>
      <div className="btns mb-3"><Link className="btn soft sm" to="/explore/comprehension"><Icon name="headphones" size={16} /> Tester ma compréhension orale</Link></div>
      <div className="list">{th.DIALOGS.map((d) => <Link key={d.id} className={`row ${done.has(d.id) ? 'done' : ''}`} to={`/explore/dialogs/${encodeURIComponent(d.id)}`}><span className="ico">{done.has(d.id) ? <Icon name="check" /> : d.icon}</span><span className="mid"><span className="t">{L(d.title)}</span><span className="s">{d.lines.length} répliques · avec : {L(d.other).toLowerCase()}</span></span><span className="end"><span className="chev">›</span></span></Link>)}</div>
    </>
  );
}

export function DialogScreen() {
  const { id = '' } = useParams();
  const d = DIALOG_BY_ID[decodeURIComponent(id)];
  const nav = useNavigate();
  const log = useStore((s) => s.logHistory);
  const recordActivity = useStore((s) => s.recordActivity);
  const addXp = useStore((s) => s.addXp);
  usePage(d ? L(d.title) : 'Conversation', { back: '/explore/dialogs' });
  if (!d) return <Empty icon="search">Conversation introuvable.</Empty>;
  return <><div className="btns mb-3"><Link className="btn ghost sm" to={`/explore/comprehension/${encodeURIComponent(d.id)}`}><Icon name="headphones" size={16} /> L’écouter sans le texte, puis répondre</Link></div><DialogView id={d.id} onDone={() => { log('dialog', d.id); recordActivity('dialog:' + d.id); addXp(5); nav('/explore/dialogs'); }} /></>;
}
