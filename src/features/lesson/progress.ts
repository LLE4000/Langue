/**
 * Barre unique de la leçon : chaque étape signale son avancement interne (0–1), le déroulé le combine avec
 * le poids des étapes pour faire avancer une seule barre en haut de l'écran, question après question.
 */
import { createContext, useContext, useEffect } from 'react';
import type { RuntimeStep } from './engine';

export const StepProgressCtx = createContext<((fraction: number) => void) | null>(null);

/**
 * Signale l'avancement dans l'étape en cours. Renvoie vrai quand l'étape se déroule dans une leçon (la barre du
 * haut porte alors l'avancement : l'étape n'affiche pas son propre compteur) ; faux dans un jeu à plusieurs.
 */
export function useStepProgress(fraction: number): boolean {
  const report = useContext(StepProgressCtx);
  useEffect(() => { report?.(Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0))); }, [report, fraction]);
  return !!report;
}

/** Poids d'une étape : à peu près le nombre de gestes qu'elle demande (une question, une carte, une paire…). */
export function stepWeight(s: RuntimeStep): number {
  switch (s.type) {
    case 'theory': return 1;
    case 'flashcards': return Math.max(1, s.items.length * 0.7);
    case 'questions': return Math.max(1, s.questions.length);
    case 'match': return 3;
    case 'build': return Math.max(1, s.items.length * 1.5);
    case 'dialog': case 'reading': return 3;
    case 'repeat': return Math.max(1, s.items.length);
    case 'recap': return 0;
  }
}

/** Avancement global 0–1 : étapes terminées + fraction de l'étape en cours, pondérées. */
export function lessonProgress(steps: RuntimeStep[], index: number, sub: number): number {
  if (steps[index]?.type === 'recap' || index >= steps.length) return 1;
  const w = steps.map(stepWeight);
  const total = w.reduce((a, x) => a + x, 0) || 1;
  const before = w.slice(0, index).reduce((a, x) => a + x, 0);
  return Math.max(0, Math.min(1, (before + (w[index] ?? 0) * Math.max(0, Math.min(1, sub))) / total));
}
