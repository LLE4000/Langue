import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-ext-400.css';
import '@fontsource/sarabun/thai-400.css';
import '@fontsource/sarabun/thai-500.css';
import '@fontsource/sarabun/thai-600.css';
import '@fontsource/kanit/thai-400.css';
import '@fontsource/kanit/thai-500.css';
import './styles/app.css';
import { App } from './app/App';
import { useStore } from './app/store';

// Accès au magasin d'état depuis la console et les tests de bout en bout.
(window as unknown as { __langueStore: typeof useStore }).__langueStore = useStore;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
