import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { Icon, TabIcon } from '@/components/ui';
import { ProgressPill } from '@/components/Progress';
import { useProgressLog } from './hooks';
import { useStore } from './store';
import { useSpeaker } from './services/speech';
import { T } from '@/i18n';

/** Un titre d'écran peut porter son équivalent thaï (petit, à côté) : un toucher le fait entendre. */
export interface ThaiLabel { th: string; rom: string }
interface TopBarState { title: string; back?: boolean | string; right?: ReactNode; hidden?: boolean; avatar?: boolean; thai?: ThaiLabel }
const TopBarCtx = createContext<{ set(s: TopBarState): void }>({ set: () => {} });

/**
 * Déclare le titre et la barre supérieure de l'écran courant. `avatar` : écran racine d'un onglet (le prénom, en haut
 * à gauche, mène au profil) ; `thai` : le mot thaï du titre, affiché à côté (exposition discrète, jamais à la place).
 */
export function usePage(title: string, opts: { back?: boolean | string; right?: ReactNode; hidden?: boolean; avatar?: boolean; thai?: ThaiLabel } = {}) {
  const { set } = useContext(TopBarCtx);
  const { back, right, hidden, avatar, thai } = opts;
  const th = thai?.th, rom = thai?.rom;
  useEffect(() => { set({ title, back, right, hidden, avatar, thai: th && rom ? { th, rom } : undefined }); document.title = title ? `${title} · Langue` : 'Langue'; }, [title, back, right, hidden, avatar, th, rom, set]);
}

/** Le mot thaï d'un titre : petit, à côté du français ; un toucher le prononce. */
export function ThaiKicker({ label }: { label: ThaiLabel }) {
  const sp = useSpeaker();
  return <button className="thk" lang="th" onClick={() => sp.speak(label.th)} aria-label={`Écouter ${label.th} (${label.rom})`} title={label.rom}>{label.th}</button>;
}

/** Pastille du profil : l'initiale du prénom, en haut à gauche des écrans principaux. */
export function ProfileChip({ withName, greeting }: { withName?: boolean; greeting?: string }) {
  const name = useStore((s) => s.profile?.name ?? '');
  return (
    <Link to="/profile" className={`mechip ${withName ? 'named' : ''}`} aria-label={`Mon profil${name ? ` : ${name}` : ''}`}>
      <span className="av" aria-hidden="true">{(name.trim()[0] ?? '?').toUpperCase()}</span>
      {withName && <span className="who">{greeting && <span className="th hi" lang="th">{greeting}</span>}<b>{name}</b></span>}
    </Link>
  );
}

export function TopBar({ state }: { state: TopBarState }) {
  const nav = useNavigate();
  if (state.hidden) return null;
  return (
    <header className="topbar">
      {state.back ? <button className="tb" aria-label="Retour" onClick={() => (typeof state.back === 'string' ? nav(state.back) : nav(-1))}><Icon name="back" /></button> : state.avatar ? <ProfileChip /> : <span className="tb-pad" />}
      <h1>{state.title}{state.thai && <ThaiKicker label={state.thai} />}</h1>
      {state.right ?? <ProgressPill />}
    </header>
  );
}

/**
 * Les quatre onglets : Leçons (la prochaine leçon et le parcours), Réviser (ce qu'on sait), Défis (à plusieurs),
 * Bibliothèque (tout le contenu, librement). Chacun a sa couleur de rubrique quand il est actif.
 * Le profil n'est pas un onglet (on y va rarement) : on l'ouvre en touchant son prénom, en haut à gauche.
 */
const TABS = [
  { to: '/', icon: 'lessons', key: 'learn' as const, tone: 'acc', end: true, also: ['/path'] },
  { to: '/review', icon: 'review', key: 'review' as const, tone: 'jade', also: ['/train'] },
  { to: '/play', icon: 'challenge', key: 'play' as const, tone: 'plum', also: [] },
  { to: '/explore', icon: 'library', key: 'explore' as const, tone: 'indigo', also: [] },
];

export function Shell() {
  const [bar, setBar] = useState<TopBarState>({ title: '' });
  const loc = useLocation();
  const navType = useNavigationType();
  const t = T();
  useProgressLog(); // trace quotidienne pour la courbe d'évolution
  // Nouvelle page : on repart du haut. Retour arrière : on garde la position (longues listes du parcours, de la bibliothèque).
  useEffect(() => { if (navType !== 'POP') window.scrollTo(0, 0); }, [loc.pathname, navType]);
  // Valeur de contexte stable : sinon chaque rendu de la coque ferait re-rendre tous les écrans (boucle avec usePage)
  const ctx = useMemo(() => ({ set: setBar }), []);
  return (
    <TopBarCtx.Provider value={ctx}>
      <div className="app">
        <TopBar state={bar} />
        <main className="view"><Outlet /></main>
        <nav className="tabbar" aria-label="Navigation principale">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => `t-${tab.tone} ${isActive || (!tab.end && loc.pathname.startsWith(tab.to)) || tab.also.some((p) => loc.pathname.startsWith(p)) ? 'on' : ''}`}>
              <span className="pill"><TabIcon name={tab.icon} /></span>{t.nav[tab.key]}
            </NavLink>
          ))}
        </nav>
      </div>
    </TopBarCtx.Provider>
  );
}

/**
 * Coque sans onglets (leçon en cours, onboarding). Avec `progress` (0–1), l'en-tête devient celui d'une leçon :
 * une croix pour quitter et une seule barre de progression, sans titre.
 */
export function FullScreen({ title, onBack, right, children, fit, progress }: { title: string; onBack?: () => void; right?: ReactNode; children: ReactNode; fit?: boolean; progress?: number }) {
  useEffect(() => { document.title = `${title} · Langue`; }, [title]);
  const pct = progress == null ? 0 : Math.round(Math.max(0, Math.min(1, progress)) * 100);
  return (
    <div className="app">
      {progress != null ? (
        <header className="ltop">
          <button className="tb" aria-label="Quitter" onClick={onBack}><Icon name="close" /></button>
          <div className="lbar" role="progressbar" aria-label={`Progression : ${title}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><i style={{ width: `${pct}%` }} /></div>
          {right}
        </header>
      ) : (
        <header className="topbar">
          {onBack ? <button className="tb" aria-label="Retour" onClick={onBack}><Icon name="back" /></button> : <span className="tb-pad" />}
          <h1>{title}</h1>
          {right}
        </header>
      )}
      <main className={`view no-tabs ${fit ? 'fit' : ''}`}>{children}</main>
    </div>
  );
}
