/**
 * Présentation d'une leçon, la même partout : un badge à la couleur de son type (le signe étudié ou une icône),
 * un titre court, un sous-titre en français et un indicateur de contenu. Voir curriculum/card.
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LessonDef } from '@/curriculum/types';
import { lessonCard, type LessonCard } from '@/curriculum/card';
import { Icon } from './ui';

/** Classe de couleur d'un type (règles et textes partagent la teinte « lecture », nombres et classificateurs « compter »). */
export const kindClass = (c: LessonCard) => `k-${c.kind}`;

export function LessonBadge({ card, state, size }: { card: LessonCard; state?: 'done' | 'lock' | 'cur'; size?: 'sm' | 'lg' }) {
  const g = card.badge.glyph;
  const len = g ? [...g.replace(/[ัิ-ฺ็-๎]/g, '')].length : 0; // largeur visible (sans les signes suscrits)
  return (
    <span className={`lbadge ${kindClass(card)} ${size ?? ''}`} aria-hidden="true">
      {g ? <span className={`g len${Math.min(3, len)}`} lang="th">{g}</span> : <Icon name={card.badge.icon ?? 'book'} />}
      {state && <span className={`st ${state}`}><Icon name={state === 'done' ? 'check' : state === 'lock' ? 'lock' : 'play'} size={11} /></span>}
    </span>
  );
}

/** Titre d'une carte : court, sur une ligne ; la partie d'une série (« 1/2 ») en petit à côté. */
export const CardTitle = ({ card }: { card: LessonCard }) => <>{card.title}{card.part && <span className="part">{card.part}</span>}</>;

/**
 * Une leçon dans une liste (accueil « Ensuite », parcours) : badge et durée, titre, sous-titre, puis le type et l'indicateur.
 * `state` : faite, verrouillée ou conseillée (`current` : la leçon conseillée, signalée dans la ligne) ; `end` : un élément à droite.
 */
export function LessonRow({ lesson, state, end, extra, rowRef, current }: { lesson: LessonDef; state?: 'done' | 'lock' | 'cur'; end?: ReactNode; extra?: string; rowRef?: React.Ref<HTMLAnchorElement>; current?: boolean }) {
  const c = lessonCard(lesson);
  return (
    <Link ref={rowRef} to={`/lesson/${lesson.id}`} className={`row lrow ${kindClass(c)} ${state ?? ''}`} aria-current={current ? 'step' : undefined}>
      <span className="lcol"><LessonBadge card={c} state={state} /><span className="min">{lesson.minutes} min</span></span>
      <span className="mid">
        <span className="t"><CardTitle card={c} /></span>
        <span className="s">{c.sub}</span>
        <span className="meta">{current && <span className="now">Conseillée</span>}<span className="kl">{c.label}</span><span>{c.count}</span>{extra && <span>{extra}</span>}</span>
      </span>
      {end && <span className="end">{end}</span>}
    </Link>
  );
}
