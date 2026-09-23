/**
 * Composants d'interface réutilisables : boutons, texte thaï, audio, feuilles, toasts, icônes.
 */
import { useEffect, useMemo, useState, type ReactNode, type CSSProperties } from 'react';
import { create } from 'zustand';
import { useStore } from '@/app/store';
import { useSpeaker, useVoices } from '@/app/services/speech';
import { resolveTokens } from '@/engine/tokens';
import { visualLength } from '@/engine/thai/script';
import { isReadable } from '@/engine/thai/reading';
import { useKnown, useGoals } from '@/app/hooks';
import { L } from '@/i18n';
import type { Localized } from '@/content/types';

/* ---------- Icônes (SVG, trait) ---------- */
const PATHS: Record<string, ReactNode> = {
  home: <path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  repeat: <><path d="M17 2l4 4-4 4" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5z" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" /></>,
  back: <path d="M15 5l-7 7 7 7" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.8-3.8" /></>,
  speaker: <><path d="M4 9v6h4l5 4V5L8 9z" /><path d="M16 9a4 4 0 0 1 0 6" /><path d="M18.5 6.5a8 8 0 0 1 0 11" /></>,
  turtle: <><path d="M4 14c0-3 3-6 8-6s8 3 8 6H4z" /><path d="M2 14h20" /><path d="M6 14l-1 3M18 14l1 3M12 8V6a2 2 0 0 1 4 0" /></>,
  mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></>,
  play: <path d="M7 5l12 7-12 7z" />,
  pause: <path d="M8 5v14M16 5v14" />,
  check: <path d="M5 12l5 5 9-11" />,
  star: <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" />,
  pen: <><path d="M4 20l4-1 11-11-3-3L5 16z" /><path d="M13 7l3 3" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
  share: <><path d="M12 3v12" /><path d="M8 7l4-4 4 4" /><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>,
  next: <path d="M9 5l7 7-7 7" />,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></>,
  flag: <path d="M5 21V4h11l-1.5 4L16 12H5" />,
  book: <path d="M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14" />,
  bolt: <path d="M13 2L4 14h7l-1 8 9-12h-7z" />,
  download: <><path d="M12 3v12" /><path d="M8 11l4 4 4-4" /><path d="M5 19h14" /></>,
  upload: <><path d="M12 15V3" /><path d="M8 7l4-4 4 4" /><path d="M5 19h14" /></>,
  trash: <><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></>,
  rotate: <><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /></>,
};
export function Icon({ name, size = 22, style }: { name: keyof typeof PATHS | string; size?: number; style?: CSSProperties }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{PATHS[name] ?? null}</svg>;
}

/* ---------- Texte thaï ---------- */
export function useTokens() {
  const profile = useStore((s) => s.profile);
  return useMemo(() => ({ gender: profile?.gender ?? 'm' as const, name: profile?.name ?? '' }), [profile?.gender, profile?.name]);
}
export function Thai({ text, className = '', size, style, modern }: { text: string; className?: string; size?: number; style?: CSSProperties; modern?: boolean }) {
  const tok = useTokens();
  return <span lang="th" className={`th ${modern ? 'thm' : ''} ${className}`} style={{ ...(size ? { fontSize: size } : {}), ...style }}>{resolveTokens(text, tok)}</span>;
}
export function Rom({ text, className = '', style }: { text: string; className?: string; style?: CSSProperties }) {
  const tok = useTokens();
  return <span className={`rom ${className}`} style={style}>{resolveTokens(text, tok)}</span>;
}
/** Texte localisé résolu avec les jetons. */
export function Fr({ text }: { text: Localized | string | undefined }) {
  const tok = useTokens();
  if (!text) return null;
  return <>{resolveTokens(typeof text === 'string' ? text : L(text), tok)}</>;
}
/** Classe de taille pour un texte thaï en grand. */
export const sizeClass = (s: string) => { const n = visualLength(s.replace(/\{[^}]*\}/g, 'xx')); return n <= 2 ? 's1' : n <= 5 ? 's2' : n <= 9 ? 's3' : n <= 16 ? 's4' : 's5'; };
export function BigThai({ text, modern }: { text: string; modern?: boolean }) {
  const showModern = useStore((s) => s.settings.showModern);
  return (
    <>
      <div className={`big ${sizeClass(text)}`}><Thai text={text} /></div>
      {modern && showModern && <div className="modern"><span>forme moderne</span><Thai text={text} modern /></div>}
    </>
  );
}

/** Faut-il afficher la translittération pour ce texte thaï ? (réglage : toujours / apprentissage / masquée) */
export function useShowRom(thai?: string, force?: boolean): boolean {
  const mode = useStore((s) => s.settings.translit);
  const known = useKnown();
  if (force) return true;
  if (mode === 'always') return true;
  if (mode === 'hidden') return false;
  if (!thai) return true;
  // apprentissage : on masque quand le mot est lisible avec ce que l'apprenant a appris ET que ses signes sont bien maîtrisés
  return !(isReadable(thai, known.readable));
}

/**
 * Ce thaï doit-il être présenté « à l'oral d'abord » (phonétique en grand, écriture en petit) ?
 * Vrai tant que l'apprenant ne sait pas le lire : jamais de lecture imposée avant l'alphabet.
 */
export function useOral(thai?: string): boolean {
  const goals = useGoals();
  const known = useKnown();
  if (!thai) return false;
  if (!goals.read) return true;
  return !isReadable(thai, known.concepts);
}

/* ---------- Audio ---------- */
export function AudioButton({ text, slow, big, className = '', quiet, label }: { text: string; slow?: boolean; big?: boolean; className?: string; quiet?: boolean; label?: string }) {
  const sp = useSpeaker();
  const toast = useToast((s) => s.show);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = sp.speak(text, { slow });
    if (!ok && !quiet) toast(sp.status === 'unsupported' ? 'Ce navigateur ne propose pas la synthèse vocale.' : 'Aucune voix thaïlandaise détectée. Voir Profil › Réglages › Voix.');
  };
  return <button className={`ib ${big ? 'big' : ''} ${className}`} onClick={onClick} aria-label={label ?? (slow ? 'Écouter lentement' : 'Écouter')}><Icon name={slow ? 'turtle' : 'speaker'} /></button>;
}
export function AudioPair({ text, big }: { text: string; big?: boolean }) {
  return <><AudioButton text={text} big={big} /><AudioButton text={text} slow big={big} /></>;
}

/* ---------- Toast ---------- */
interface ToastState { msg: string; route?: string; show(msg: string, route?: string): void; hide(): void }
export const useToast = create<ToastState>((set) => ({ msg: '', show: (msg, route) => set({ msg, route }), hide: () => set({ msg: '' }) }));
export function ToastHost() {
  const { msg, hide } = useToast();
  useEffect(() => { if (!msg) return; const t = setTimeout(hide, 3200); return () => clearTimeout(t); }, [msg, hide]);
  if (!msg) return null;
  return <div className="toast" role="status" aria-live="polite" onClick={hide}>{msg}</div>;
}

/* ---------- Feuille du bas ---------- */
export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true">
        <div className="shead">{typeof title === 'string' ? <b>{title}</b> : title}<span className="sp" /><button className="ib sm" onClick={onClose} aria-label="Fermer"><Icon name="close" size={18} /></button></div>
        {children}
      </section>
    </>
  );
}

/* ---------- Divers ---------- */
export const Bar = ({ p, thin }: { p: number; thin?: boolean }) => <div className={`bar ${thin ? 'thin' : ''}`}><i style={{ width: `${Math.round(Math.max(0, Math.min(1, p)) * 100)}%` }} /></div>;
export const MasteryDot = ({ m }: { m: number }) => <i className={`dot ${m >= 0.8 ? 'm3' : m >= 0.5 ? 'm2' : m > 0 ? 'm1' : ''}`} aria-label={`maîtrise ${Math.round(m * 100)} %`} />;
export const Empty = ({ e, children }: { e: string; children: ReactNode }) => <div className="empty"><span className="e">{e}</span>{children}</div>;
export function Segmented<T extends string | number | boolean>({ value, options, onChange }: { value: T; options: { v: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return <div className="seg">{options.map((o) => <button key={String(o.v)} className={o.v === value ? 'on' : ''} onClick={() => onChange(o.v)}>{o.label}</button>)}</div>;
}
export function VoiceStatusNote() {
  const { status } = useVoices();
  if (status === 'ok' || status === 'searching') return null;
  return <div className="note warn sm">{status === 'unsupported' ? 'Ce navigateur ne propose pas la synthèse vocale : l’audio est indisponible.' : status === 'none' ? 'Aucune voix thaïlandaise n’est installée sur cet appareil. Voir Profil › Réglages › Voix pour l’installer.' : 'Le navigateur n’a pas encore communiqué ses voix : touchez un bouton audio pour les réveiller.'}</div>;
}
export function useNow(ms = 30_000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), ms); return () => clearInterval(t); }, [ms]);
  return now;
}
