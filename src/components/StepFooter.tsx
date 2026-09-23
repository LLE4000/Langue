/**
 * Barre d'action fixe en bas de chaque étape (leçon, entraînement, dialogue, lecture).
 * Principe d'ergonomie : quel que soit l'exercice, l'action principale est toujours au même endroit,
 * avec le même mot (« Continuer »), accessible au pouce ; Entrée/Espace au clavier ; chiffres 1–4 pour choisir.
 */
import { useEffect, useRef, type ReactNode } from 'react';
import { useStore } from '@/app/store';
import { Icon } from './ui';

export function StepFooter({ tone = '', meta, children }: { tone?: '' | 'ok' | 'ko'; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className={`qfoot ${tone}`}>
      {meta ? <div className="meta">{meta}</div> : null}
      {children}
    </div>
  );
}

/** Touches 1…n → choix. Le gestionnaire est lu à chaque frappe (pas besoin de mémoïsation). */
export function useDigitKeys(count: number, onPick: (index: number) => void) {
  const cb = useRef(onPick);
  cb.current = onPick;
  useEffect(() => {
    if (count <= 0) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      const n = parseInt(e.key, 10);
      if (!Number.isNaN(n) && n >= 1 && n <= count) { e.preventDefault(); cb.current(n - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);
}

/**
 * Bouton principal d'une étape. `auto` : avance seule après `autoMs` (si le réglage « avance automatique »
 * est actif), avec une jauge visible — on peut toujours toucher avant. Entrée ou Espace déclenchent aussi.
 */
export function ContinueButton({ onClick, label = 'Continuer', auto = false, autoMs = 1300, className = 'btn', icon = true, autoFocus, disabled }: {
  onClick: () => void; label?: string; auto?: boolean; autoMs?: number; className?: string; icon?: boolean; autoFocus?: boolean; disabled?: boolean;
}) {
  const autoAdvance = useStore((s) => s.settings.autoAdvance !== false);
  const cb = useRef(onClick);
  cb.current = onClick;
  const run = auto && autoAdvance && !disabled;
  useEffect(() => {
    if (!run) return;
    const h = setTimeout(() => cb.current(), autoMs);
    return () => clearTimeout(h);
  }, [run, autoMs]);
  useEffect(() => {
    if (disabled) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const t = e.target as HTMLElement | null;
      // Un champ ou un bouton ayant le focus garde son comportement natif (évite un double déclenchement).
      if (t && /^(INPUT|TEXTAREA|SELECT|BUTTON|A)$/.test(t.tagName)) return;
      e.preventDefault();
      cb.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [disabled]);
  return (
    <button className={className} onClick={onClick} autoFocus={autoFocus} disabled={disabled}>
      {run && <span className="fill" aria-hidden="true" style={{ ['--d' as string]: `${autoMs}ms` }} />}
      {label}{icon && <Icon name="next" size={18} />}
    </button>
  );
}
