/** Conversations : liste et lecteur. */
import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePage } from '@/app/Shell';
import { useStore } from '@/app/store';
import { DIALOG_BY_ID } from '@/content/th';
import { L, T } from '@/i18n';
import { DialogView } from '@/components/DialogView';
import { DialogList, withWhom } from '@/components/DialogList';
import { Empty, Icon } from '@/components/ui';

export function Dialogs() {
  const t = T();
  usePage(t.explore.conversations, { back: '/explore' });
  const hist = useStore((s) => s.history);
  const done = new Set(hist.filter((h) => h.kind === 'dialog').map((h) => h.label));
  return (
    <>
      <p className="lead">Des situations réelles. La traduction est masquée au départ&nbsp;: essayez d’abord de comprendre seul.</p>
      <div className="btns mb-3"><Link className="btn soft sm" to="/explore/comprehension"><Icon name="headphones" size={16} /> Tester ma compréhension orale</Link><Link className="btn soft sm" to="/talk"><Icon name="mic" size={16} /> Jouer mon rôle au micro</Link></div>
      <DialogList skill="listening" href={(d) => `/explore/dialogs/${encodeURIComponent(d.id)}`} row={(d) => ({ sub: `${d.lines.length} répliques · ${withWhom(d)}`, done: done.has(d.id) })} />
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
  return <><div className="btns mb-3"><Link className="btn ghost sm" to={`/explore/comprehension/${encodeURIComponent(d.id)}`}><Icon name="headphones" size={16} /> L’écouter sans le texte, puis répondre</Link><Link className="btn ghost sm" to={`/talk/${encodeURIComponent(d.id)}`}><Icon name="mic" size={16} /> Jouer mon rôle</Link></div><DialogView id={d.id} onDone={() => { log('dialog', d.id); recordActivity('dialog:' + d.id); addXp(5); nav('/explore/dialogs'); }} /></>;
}
