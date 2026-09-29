/**
 * La liste des conversations, la même partout (Bibliothèque › Conversations, Compréhension orale, Conversation parlée) :
 * mêmes intertitres dans le même ordre (« Courtes · pour commencer », puis A1, A2, B1), une pastille « conseillé » sur
 * le niveau de l'apprenant, les niveaux au-dessus repliés, et un bouton « au hasard » qui tire d'abord dans ce niveau.
 * Chaque page ne fournit que le lien d'une ligne, sa sous-ligne et son état (fait, meilleur score).
 */
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLevels } from '@/app/hooks';
import { th } from '@/content/th';
import type { Dialog } from '@/content/types';
import type { SkillLevels } from '@/curriculum/path';
import { dialogOtherGender } from '@/engine/speakers';
import { L } from '@/i18n';
import { GlyphIcon, Icon } from './ui';

export type DialogSection = 'short' | 'A1' | 'A2' | 'B1';
export const DIALOG_SECTIONS: readonly DialogSection[] = ['short', 'A1', 'A2', 'B1'];
export const DIALOG_SECTION_TITLE: Record<DialogSection, string> = { short: 'Courtes · pour commencer', A1: 'A1', A2: 'A2', B1: 'B1' };
export const dialogSection = (d: Dialog): DialogSection => d.level ?? 'short';

/** Section conseillée pour un niveau de compétence (0 débutant complet → courtes, 1 → A1, 2 → A2, 3 et plus → B1). */
export const advisedSection = (level: number): DialogSection => DIALOG_SECTIONS[Math.max(0, Math.min(DIALOG_SECTIONS.length - 1, Math.round(level)))];

const EPICENE = new Set(['collègue', 'propriétaire', 'réceptionniste', 'standardiste', 'architecte', 'médecin']);
const INDEFINITE = new Set(['ami', 'amie', 'collègue', 'passant', 'passante', 'voisin', 'voisine', 'nouvelle']);

/** « avec la serveuse », « avec le chauffeur », « avec une amie », « avec l’architecte » : l'interlocuteur avec son article. */
export function withWhom(d: Pick<Dialog, 'other' | 'lines'> & { otherGender?: 'm' | 'f' }): string {
  const name = L(d.other).trim();
  if (!name) return '';
  const low = name.charAt(0).toLowerCase() + name.slice(1);
  const head = low.split(/\s/)[0];
  const fem = /(euse|ière|ienne|ine|ante|ée|ie)$/.test(head) || head === 'réception' || head === 'nouvelle'
    || (EPICENE.has(head) && dialogOtherGender(d, 'm') === 'f');
  if (INDEFINITE.has(head)) return `avec ${fem ? 'une' : 'un'} ${low}`;
  if (/^[aeéèêiîoôuh]/i.test(low)) return `avec l’${low}`;
  return `avec ${fem ? 'la' : 'le'} ${low}`;
}

export interface DialogRow { sub: ReactNode; end?: ReactNode; done?: boolean }

export function DialogList({ href, row, skill, notes, tone, randomLabel = 'Une conversation au hasard' }: {
  /** lien d'une conversation */
  href: (d: Dialog) => string;
  /** sous-ligne, fin de ligne (score) et état « fait » */
  row: (d: Dialog) => DialogRow;
  /** compétence qui fixe le niveau conseillé */
  skill: keyof SkillLevels;
  /** précision en bout d'intertitre (« questions en français »…) */
  notes?: Partial<Record<DialogSection, string>>;
  tone?: 'jade';
  randomLabel?: string;
}) {
  const levels = useLevels();
  const nav = useNavigate();
  const advised = advisedSection(levels[skill] ?? 0);
  const rank = DIALOG_SECTIONS.indexOf(advised);
  const bySection = (s: DialogSection) => th.DIALOGS.filter((d) => dialogSection(d) === s);

  // au hasard : d'abord une conversation pas encore faite du niveau conseillé, puis des niveaux en dessous, puis tout
  const random = () => {
    const order = [advised, ...DIALOG_SECTIONS.slice(0, rank).reverse(), ...DIALOG_SECTIONS.slice(rank + 1)];
    let pick: Dialog | undefined;
    for (const s of order) {
      const fresh = bySection(s).filter((d) => !row(d).done);
      if (fresh.length) { pick = fresh[Math.floor(Math.random() * fresh.length)]; break; }
    }
    if (!pick) { const all = bySection(advised).length ? bySection(advised) : th.DIALOGS; pick = all[Math.floor(Math.random() * all.length)]; }
    if (pick) nav(href(pick));
  };

  const line = (d: Dialog) => {
    const r = row(d);
    return (
      <Link key={d.id} className={`row ${r.done ? 'done' : ''}`} to={href(d)}>
        <span className={`ico ${tone ?? ''}`}>{r.done ? <Icon name="check" /> : <GlyphIcon name={d.icon} />}</span>
        <span className="mid"><span className="t">{L(d.title)}</span><span className="s">{r.sub}</span></span>
        <span className="end">{r.end ?? <span className="chev">›</span>}</span>
      </Link>
    );
  };

  return (
    <>
      <button className="btn dl-random" onClick={random}><Icon name="shuffle" size={18} /> {randomLabel}</button>
      {DIALOG_SECTIONS.map((s, k) => {
        const list = bySection(s);
        if (!list.length) return null;
        const title = DIALOG_SECTION_TITLE[s];
        const badge = s === advised ? <span className="tag acc dl-advised">conseillé</span> : null;
        const body = <div className="list">{list.map(line)}</div>;
        if (k > rank) {
          return (
            <details key={s} className="fold dl-fold">
              <summary><span className="grow">{title}<span className="sub">{list.length} conversations{notes?.[s] ? ` · ${notes[s]}` : ''}</span></span></summary>
              {body}
            </details>
          );
        }
        return (
          <section key={s} aria-label={title}>
            <div className="h2 dl-h">{title}{badge}</div>
            {notes?.[s] && <p className="dl-note">{notes[s]}</p>}
            {body}
          </section>
        );
      })}
    </>
  );
}
