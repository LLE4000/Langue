import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/ui';
import { T } from '@/i18n';

interface TopBarState { title: string; back?: boolean | string; right?: ReactNode; hidden?: boolean }
const TopBarCtx = createContext<{ set(s: TopBarState): void }>({ set: () => {} });

/** Déclare le titre et la barre supérieure de l'écran courant. */
export function usePage(title: string, opts: { back?: boolean | string; right?: ReactNode; hidden?: boolean } = {}) {
  const { set } = useContext(TopBarCtx);
  const { back, right, hidden } = opts;
  useEffect(() => { set({ title, back, right, hidden }); document.title = title ? `${title} · Langue` : 'Langue'; }, [title, back, right, hidden, set]);
}

export function TopBar({ state }: { state: TopBarState }) {
  const nav = useNavigate();
  if (state.hidden) return null;
  return (
    <header className="topbar">
      {state.back ? <button className="tb" aria-label="Retour" onClick={() => (typeof state.back === 'string' ? nav(state.back) : nav(-1))}><Icon name="back" /></button> : <span style={{ width: 8 }} />}
      <h1>{state.title}</h1>
      {state.right ?? <NavLink to="/explore/search" className="tb" aria-label="Rechercher"><Icon name="search" /></NavLink>}
    </header>
  );
}

const TABS = [
  { to: '/', icon: 'home', key: 'learn' as const, end: true },
  { to: '/review', icon: 'repeat', key: 'review' as const },
  { to: '/explore', icon: 'compass', key: 'explore' as const },
  { to: '/profile', icon: 'user', key: 'profile' as const },
];

export function Shell() {
  const [bar, setBar] = useState<TopBarState>({ title: '' });
  const loc = useLocation();
  const t = T();
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);
  return (
    <TopBarCtx.Provider value={{ set: setBar }}>
      <div className="app">
        <TopBar state={bar} />
        <main className="view"><Outlet /></main>
        <nav className="tabbar" aria-label="Navigation principale">
          {TABS.map((tab) => (
            <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => (isActive || (!tab.end && loc.pathname.startsWith(tab.to)) ? 'on' : '')}>
              <Icon name={tab.icon} />{t.nav[tab.key]}
            </NavLink>
          ))}
        </nav>
      </div>
    </TopBarCtx.Provider>
  );
}

/** Coque sans onglets (leçon en cours, onboarding). */
export function FullScreen({ title, onBack, right, children, fit }: { title: string; onBack?: () => void; right?: ReactNode; children: ReactNode; fit?: boolean }) {
  useEffect(() => { document.title = `${title} · Langue`; }, [title]);
  return (
    <div className="app">
      <header className="topbar">
        {onBack ? <button className="tb" aria-label="Retour" onClick={onBack}><Icon name="back" /></button> : <span style={{ width: 8 }} />}
        <h1>{title}</h1>
        {right}
      </header>
      <main className={`view no-tabs ${fit ? 'fit' : ''}`}>{children}</main>
    </div>
  );
}
