/**
 * Composants d'interface réutilisables : boutons, texte thaï, audio, feuilles, toasts, icônes.
 */
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { create } from 'zustand';
import { useStore } from '@/app/store';
import { useSpeaker, useVoices } from '@/app/services/speech';
import { resolveTokens } from '@/engine/tokens';
import { visualLength } from '@/engine/thai/script';
import { isReadable } from '@/engine/thai/reading';
import { useKnown, useGoals } from '@/app/hooks';
import { L, frTypo } from '@/i18n';

/** Typographie française d'affichage (espaces insécables, apostrophe ’, traits d'union liés) : voir @/i18n. */
export { frTypo };
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
  // Tortue de profil (lecture lente) : carapace à écailles, deux pattes, la tête à droite (dessin d'après Lucide, ISC)
  turtle: <g transform="translate(0 2)"><path d="M12 10l2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4z" /><path d="M4.8 7.9L8 10M15.2 7.9L12 10" /><path d="M16.9 10H20a2 2 0 0 1 0 4H2" /></g>,
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
  flame: <path d="M12 22c4 0 7-2.8 7-7 0-3-1.5-5-3-7-.3 2-1.2 3-2.5 3.5C13 8.5 12.5 5 9.5 2c.3 3-.8 5-2.3 7C5.8 10.8 5 12.5 5 15c0 4.2 3 7 7 7z" />,
  trend: <><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></>,
  // Apprentissage et entraînement
  cards: <><rect x="3" y="7" width="13" height="14" rx="2" /><path d="M8 3h11a2 2 0 0 1 2 2v12" /></>,
  headphones: <><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z" /></>,
  clock: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 2.5M10 2h4M12 2v3" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.1 0l3-3a5 5 0 0 0-7.1-7.1l-1.5 1.5" /><path d="M14 11a5 5 0 0 0-7.1 0l-3 3a5 5 0 0 0 7.1 7.1l1.5-1.5" /></>,
  music: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  shuffle: <><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.2" /></>,
  ear: <><path d="M6 8.5a6 6 0 0 1 12 0c0 3.5-3 4.5-3.5 7.5A3.5 3.5 0 0 1 8 16.5" /><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-1.5 2-1.5 3" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.4A8 8 0 1 1 21 12z" />,
  bookOpen: <><path d="M2 5h6a4 4 0 0 1 4 4v11a3 3 0 0 0-3-3H2z" /><path d="M22 5h-6a4 4 0 0 0-4 4v11a3 3 0 0 1 3-3h7z" /></>,
  layers: <><path d="M12 3l9 5-9 5-9-5z" /><path d="M3 13l9 5 9-5" /></>,
  cube: <><path d="M12 2l9 5v10l-9 5-9-5V7z" /><path d="M3 7l9 5 9-5M12 12v10" /></>,
  type: <path d="M4 7V5h16v2M12 5v14M9 19h6" />,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></>,
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  bulb: <><path d="M9 18h6M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" /></>,
  clipboard: <><rect x="5" y="4" width="14" height="18" rx="2" /><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h4" /></>,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  sparkles: <><path d="M12 3l1.8 4.7 4.7 1.8-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" /><path d="M19 15l.8 2.2 2.2.8-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>,
  checkCircle: <><circle cx="12" cy="12" r="9" /><path d="M8 12.5l2.5 2.5L16 9.5" /></>,
  // Défis, profil
  swords: <><path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2" /><path d="M14.5 6.5L18 3h3v3l-3.5 3.5M5 14l4 4M7 17l-3 3M3 19l2 2" /></>,
  users: <><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.8-5 6.5-5s5.5 1.5 6.5 5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 15c1.8.6 3 2.2 3.5 5" /></>,
  send: <><path d="M21 3L10 14" /><path d="M21 3l-7 18-4-7-7-4z" /></>,
  phone: <><rect x="6" y="2" width="12" height="20" rx="2.5" /><path d="M11 18h2" /></>,
  trophy: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" /></>,
  equal: <path d="M5 9h14M5 15h14" />,
  chart: <><path d="M3 21h18" /><rect x="5" y="11" width="3" height="7" rx="1" /><rect x="10.5" y="6" width="3" height="12" rx="1" /><rect x="16" y="13" width="3" height="5" rx="1" /></>,
  sliders: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  archive: <><rect x="3" y="4" width="18" height="5" rx="1.5" /><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" /></>,
  dice: <><rect x="3" y="3" width="18" height="18" rx="4.5" /><circle cx="8.5" cy="8.5" r=".9" /><circle cx="15.5" cy="8.5" r=".9" /><circle cx="12" cy="12" r=".9" /><circle cx="8.5" cy="15.5" r=".9" /><circle cx="15.5" cy="15.5" r=".9" /></>,
  // Types de leçon
  tone: <><path d="M3 14.5c2.2 0 3-6 5.5-6s3.3 9 6 9 3-11 6.5-11" /><circle cx="3" cy="14.5" r=".6" /><circle cx="21" cy="6.5" r=".6" /></>,
  word: <><path d="M20.5 11.5a8.5 8 0 0 1-12.3 7.1L3.5 20l1.3-4.1a8 8 0 0 1-1.3-4.4 8.5 8 0 0 1 17 0z" /><path d="M8.5 10h7M8.5 13.5h4.5" /></>,
  dialog: <><path d="M14.5 9A6 5.5 0 0 0 3 11.3c0 1.2.4 2.3 1.1 3.2L3.5 17l2.9-.9A6 5.5 0 0 0 14.5 9z" /><path d="M9.8 17.3a6 5.5 0 0 0 7.8 1.3l2.9.9-.6-2.5a5.3 5.3 0 0 0 1.1-3.2 5.6 5.6 0 0 0-4-5.2" /></>,
  // Thèmes de vocabulaire et badges (à la place des émojis)
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></>,
  hash: <path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16" />,
  help: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 0 1 4.8 1c0 1.7-2.3 2-2.3 3.5M12 17h.01" /></>,
  hourglass: <path d="M6.5 3h11M6.5 21h11M8 3v3.5l4 5.5 4-5.5V3M8 21v-3.5l4-5.5 4 5.5V21" />,
  bowl: <><path d="M3 11h18a9 9 0 0 1-18 0z" /><path d="M8.5 7.5c0-1.5 1-2 1-3.5M12.5 7.5c0-1.5 1-2 1-3.5" /></>,
  cup: <><path d="M5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" /><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8.5 2.5v2.5M12.5 2.5v2.5" /></>,
  bag: <><path d="M5 8h14l-1 12H6z" /><path d="M9 10V6a3 3 0 0 1 6 0v4" /></>,
  coin: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5c-.4-1-1.3-1.5-2.5-1.5-1.4 0-2.5.8-2.5 2 0 2.6 5 1.4 5 4 0 1.2-1.1 2-2.5 2-1.2 0-2.1-.5-2.5-1.5M12 6.5V8M12 16v1.5" /></>,
  car: <><path d="M4 16v-4.5L6.3 6.8A1.5 1.5 0 0 1 7.6 6h8.8a1.5 1.5 0 0 1 1.3.8L20 11.5V16z" /><path d="M4 11.5h16M6.5 16v2M17.5 16v2M7.5 13.8h.01M16.5 13.8h.01" /></>,
  plane: <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />,
  bed: <><path d="M3 5v14M3 15h18v4M21 15v-2.5A2.5 2.5 0 0 0 18.5 10H11v5" /><circle cx="7" cy="12" r="2" /></>,
  briefcase: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M3 13h18" /></>,
  heart: <path d="M12 20s-7-4.4-9-8.5C1.6 8.6 3.5 5 7 5c2 0 3.3 1.2 5 3 1.7-1.8 3-3 5-3 3.5 0 5.4 3.6 4 6.5-2 4.1-9 8.5-9 8.5z" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" /></>,
  leaf: <><path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15z" /><path d="M5 19l8-8" /></>,
  pin: <><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></>,
  alert: <><path d="M10.3 4.3L2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" /><path d="M12 9.5v4M12 17h.01" /></>,
  shirt: <path d="M8.5 3L3 6l2 4.5 2-1V21h10V9.5l2 1L21 6l-5.5-3c-.5 1.6-1.8 2.5-3.5 2.5S9 4.6 8.5 3z" />,
  train: <><rect x="5" y="3" width="14" height="14" rx="3" /><path d="M5 10h14M8.5 21l2-4M15.5 21l-2-4M9 13.5h.01M15 13.5h.01" /></>,
  building: <><path d="M4 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M14 9h5a1 1 0 0 1 1 1v11M2.5 21h19" /><path d="M8 8h2M8 12h2M8 16h2M17 13h.01M17 17h.01" /></>,
  palette: <><path d="M12 3a9 9 0 0 0 0 18c1.2 0 2-.8 2-1.8 0-1-1-1.4-1-2.4s.8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" /><path d="M7.5 11h.01M10 7h.01M15 7.5h.01" /></>,
  medical: <><rect x="3" y="3" width="18" height="18" rx="4" /><path d="M12 8v8M8 12h8" /></>,
  ball: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5l4 3-1.5 4.5h-5L8 10.5z" /></>,
  paw: <><circle cx="6.5" cy="10" r="1.5" /><circle cx="10" cy="6" r="1.5" /><circle cx="14" cy="6" r="1.5" /><circle cx="17.5" cy="10" r="1.5" /><path d="M12 11.5c-2.6 0-5 3-5 5.5 0 1.5 1.1 2.5 2.5 2.5.9 0 1.6-.5 2.5-.5s1.6.5 2.5.5c1.4 0 2.5-1 2.5-2.5 0-2.5-2.4-5.5-5-5.5z" /></>,
  apple: <><path d="M12 7.5c-1.6-1-5.2-1.4-6.5 1.6-1.3 3-.6 7 1.4 9.6 1.5 2 3.5 2.4 5.1 1.5 1.6.9 3.6.5 5.1-1.5 2-2.6 2.7-6.6 1.4-9.6-1.3-3-4.9-2.6-6.5-1.6z" /><path d="M12 7.5c0-2 1-3.6 3-4.5" /></>,
};

/**
 * Icônes des quatre onglets, dessinées pour la barre du bas : même grille, même trait, et une surface
 * (classe `f`) qui se remplit d'une teinte quand l'onglet est actif.
 */
const TAB_PATHS: Record<string, ReactNode> = {
  // Leçons : un livre ouvert au signet
  lessons: <><path className="f" d="M12 6.5C10 5 7.4 4.5 4 4.5v13c3.4 0 6 .5 8 2 2-1.5 4.6-2 8-2v-13c-3.4 0-6 .5-8 2z" /><path d="M12 6.5v13" /><path d="M15.5 4.9V10l1.5-1 1.5 1V4.6" /></>,
  // Réviser : une boucle qui revient, validée
  review: <><path className="f" d="M19.4 12.6A7.5 7.5 0 1 1 17.3 6.7" /><path d="M19.8 4.2v3.6h-3.6" /><path d="M8.8 12.3l2.2 2.2 4.2-4.4" /></>,
  // Défis : une coupe
  challenge: <><path className="f" d="M7.5 4h9v5.5a4.5 4.5 0 0 1-9 0z" /><path d="M16.5 5.5h2.2a.8.8 0 0 1 .8.9 4 4 0 0 1-3.3 3.6M7.5 5.5H5.3a.8.8 0 0 0-.8.9 4 4 0 0 0 3.3 3.6" /><path d="M12 14v3.5M8.5 20h7M9.5 17.5h5" /></>,
  // Bibliothèque : des livres sur l'étagère
  library: <><path className="f" d="M4.5 4.5h3.5v15H4.5zM10 6.5h3.5v13H10z" /><path className="f" d="M15.4 7.3l3.3-.9 3.1 12-3.3.9z" /><path d="M3 19.5h18" /></>,
};
export function TabIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" width={24} height={24} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{TAB_PATHS[name] ?? null}</svg>;
}
export function Icon({ name, size = 22, style }: { name: keyof typeof PATHS | string; size?: number; style?: CSSProperties }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" style={style} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{PATHS[name] ?? null}</svg>;
}
/**
 * Icône dans son conteneur de ligne ou de tuile (`.ico`). Teinte à sens : '' neutre, 'acc' action, 'ok' / 'ko' juste / faux,
 * ou la couleur d'une rubrique : 'jade' Réviser, 'plum' Défis, 'indigo' Bibliothèque.
 */
export const Ico = ({ name, tone = '' }: { name: string; tone?: '' | 'acc' | 'ok' | 'jade' | 'ko' | 'plum' | 'indigo' }) => <span className={`ico ${tone}`}><Icon name={name} /></span>;

/* ---------- Texte thaï ---------- */
export function useTokens() {
  const profile = useStore((s) => s.profile);
  return useMemo(() => ({ gender: profile?.gender ?? 'm' as const, name: profile?.name ?? '' }), [profile?.gender, profile?.name]);
}
export function Thai({ text, className = '', size, style, modern }: { text: string; className?: string; size?: number; style?: CSSProperties; modern?: boolean }) {
  const tok = useTokens();
  return <span lang="th" className={`th ${modern ? 'thm' : ''} ${className}`} style={{ ...(size ? { fontSize: size } : {}), ...style }}>{resolveTokens(text, tok)}</span>;
}
/**
 * Texte dont les mots à trait d'union ne se coupent jamais au trait d'union (« excusez-moi », « sa-wàt-dii ») :
 * chaque mot composé est posé dans un `.nowrap`. Seules les espaces ordinaires séparent les mots ; une espace
 * insécable (frTypo) garde la ponctuation avec son mot. Le texte lui-même n'est pas modifié.
 */
function keepHyphens(s: string, max = 24): ReactNode {
  if (!s.includes('-')) return s;
  return s.split(/( +|\n)/).map((w, i) => (w.length <= max && /\p{L}-\p{L}/u.test(w) ? <span key={i} className="nowrap">{w}</span> : <Fragment key={i}>{w}</Fragment>));
}
export function Rom({ text, className = '', style }: { text: string; className?: string; style?: CSSProperties }) {
  const tok = useTokens();
  return <span className={`rom ${className}`} style={style}>{keepHyphens(resolveTokens(text, tok))}</span>;
}
/** Texte localisé résolu avec les jetons, en typographie française (espaces insécables avant ? ! : ; et dans « », apostrophe ’). */
export function Fr({ text }: { text: Localized | string | undefined }) {
  const tok = useTokens();
  if (!text) return null;
  return <>{keepHyphens(frTypo(resolveTokens(typeof text === 'string' ? text : L(text), tok)), 20)}</>;
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
  const [speaking, setSpeaking] = useState(false);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = sp.speak(text, { slow, onend: () => { if (alive.current) setSpeaking(false); } });
    if (!ok && !quiet) toast(sp.status === 'unsupported' ? 'Ce navigateur ne propose pas la synthèse vocale.' : 'Aucune voix thaïlandaise détectée. Voir Profil › Réglages › Voix.');
    if (ok) { setSpeaking(true); setTimeout(() => { if (alive.current) setSpeaking(false); }, 8000); }
  };
  const name = label ?? (slow ? 'Écouter lentement' : 'Écouter');
  return <button className={`ib ${big ? 'big' : ''} ${slow ? 'slow' : ''} ${speaking ? 'speaking' : ''} ${className}`} onClick={onClick} aria-label={name} title={name} aria-pressed={speaking || undefined}><Icon name={slow ? 'turtle' : 'speaker'} /></button>;
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
/**
 * Feuille du bas. Le bouton « retour » du téléphone la ferme (une entrée d'historique est ajoutée à l'ouverture),
 * Échap aussi. `footer` : une action de bas de feuille (par défaut « Fermer »), pour ne jamais laisser sans issue.
 */
export function Sheet({ open, onClose, title, children, footer, closeLabel = 'Fermer' }: { open: boolean; onClose: () => void; title?: ReactNode; children: ReactNode; footer?: ReactNode | null; closeLabel?: string }) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    let byPop = false;
    const onPop = () => { byPop = true; close.current(); };
    try { window.history.pushState({ ...(window.history.state ?? {}), sheet: true }, ''); } catch { /* ignore */ }
    window.addEventListener('popstate', onPop);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('popstate', onPop);
      // Fermée par un bouton : on retire l'entrée d'historique ajoutée (sauf si on a navigué ailleurs entre-temps)
      if (!byPop && window.history.state?.sheet) { try { window.history.back(); } catch { /* ignore */ } }
    };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="scrim" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true">
        <div className="shead">{typeof title === 'string' ? <b>{title}</b> : title}<span className="sp" /><button className="ib sm" onClick={onClose} aria-label="Fermer"><Icon name="close" size={18} /></button></div>
        {children}
        {footer === null ? null : footer ?? <button className="btn soft sheet-foot" onClick={onClose}>{closeLabel}</button>}
      </section>
    </>
  );
}

/* ---------- Divers ---------- */
export const Bar = ({ p, thin }: { p: number; thin?: boolean }) => <div className={`bar ${thin ? 'thin' : ''}`}><i style={{ width: `${Math.round(Math.max(0, Math.min(1, p)) * 100)}%` }} /></div>;
/** Pastille de maîtrise : anneau vide tant que l'élément n'est pas travaillé, puis safran, vert, vert cerclé. */
export const MasteryDot = ({ m }: { m: number }) => {
  const label = m > 0 ? `Maîtrise ${Math.round(m * 100)}\u00a0%` : 'Pas encore travaillé';
  return <i className={`dot mdot ${m >= 0.8 ? 'm3' : m >= 0.5 ? 'm2' : m > 0 ? 'm1' : 'm0'}`} role="img" aria-label={label} title={label} />;
};
/**
 * Pictogramme d'un badge, d'un thème… : un nom du jeu d'icônes (SVG), sinon un glyphe thaï (ก, า),
 * sinon le texte tel quel (repli pour un ancien émoji).
 */
export function GlyphIcon({ name, size = 22 }: { name: string; size?: number }) {
  if (PATHS[name]) return <Icon name={name} size={size} />;
  if (/[\u0e00-\u0e7f]/.test(name)) return <span className="th" lang="th">{name}</span>;
  return <>{name}</>;
}
/** État vide : une icône (nom du jeu d'icônes) ou, à défaut, un caractère ; puis le message. */
export const Empty = ({ e, icon, children }: { e?: string; icon?: string; children: ReactNode }) => <div className="empty"><span className="e" aria-hidden="true">{icon ? <Icon name={icon} /> : e}</span>{children}</div>;
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
