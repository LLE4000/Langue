import { useEffect, useState } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useStore } from './store';
import { Shell } from './Shell';
import { ToastHost } from '@/components/ui';
import { Onboarding } from '@/features/onboarding/Onboarding';
import { Home } from '@/features/home/Home';
import { PathScreen } from '@/features/home/PathScreen';
import { LessonRunner } from '@/features/lesson/LessonRunner';
import { Review } from '@/features/review/Review';
import { TrainingStart } from '@/features/review/TrainingStart';
import { Explore } from '@/features/explore/Explore';
import { Alphabet } from '@/features/explore/Alphabet';
import { Vowels } from '@/features/explore/Vowels';
import { Tones } from '@/features/explore/Tones';
import { Numbers } from '@/features/explore/Numbers';
import { Vocabulary, VocabTheme } from '@/features/explore/Vocabulary';
import { Dialogs, DialogScreen } from '@/features/explore/Dialogs';
import { Readings, ReadingScreen } from '@/features/explore/Readings';
import { Grammar, GrammarScreen } from '@/features/explore/Grammar';
import { Classifiers } from '@/features/explore/Classifiers';
import { Phrasebook, PhrasebookSection } from '@/features/explore/Phrasebook';
import { Writing } from '@/features/explore/Writing';
import { Transcription } from '@/features/explore/Transcription';
import { Search } from '@/features/explore/Search';
import { Profile } from '@/features/profile/Profile';
import { Settings } from '@/features/profile/Settings';
import { DataScreen } from '@/features/profile/DataScreen';
import { LevelsScreen } from '@/features/profile/LevelsScreen';
import { ShareScreen } from '@/features/profile/ShareScreen';
import { StatsScreen } from '@/features/profile/StatsScreen';
import { PeopleScreen } from '@/features/profile/PeopleScreen';
import { PlayHub } from '@/features/play/PlayHub';
import { Duel } from '@/features/play/Duel';
import { Turns } from '@/features/play/Turns';
import { ChallengeHub, ChallengeNew, ChallengePlay } from '@/features/play/Challenge';

function useHydrated() {
  const [h, setH] = useState(useStore.persist.hasHydrated());
  useEffect(() => {
    const un = useStore.persist.onFinishHydration(() => setH(true));
    if (useStore.persist.hasHydrated()) setH(true);
    return un;
  }, []);
  return h;
}

function ThemeApplier() {
  const theme = useStore((s) => s.settings.theme);
  const size = useStore((s) => s.settings.thaiSize);
  useEffect(() => {
    const r = document.documentElement;
    if (theme === 'auto') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', theme);
    r.style.setProperty('--ths', String(size));
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.setAttribute('content', getComputedStyle(r).getPropertyValue('--bg').trim() || '#0B6B5A');
  }, [theme, size]);
  return null;
}

function UpdatePrompt() {
  const { needRefresh: [needRefresh, setNeedRefresh], updateServiceWorker } = useRegisterSW({ onRegisteredSW(_url, r) { if (r) setInterval(() => r.update(), 60 * 60 * 1000); } });
  if (!needRefresh) return null;
  return <div className="update-banner"><span>Nouvelle version disponible.</span><button onClick={() => updateServiceWorker(true)}>Mettre à jour</button><button onClick={() => setNeedRefresh(false)} style={{ background: 'transparent', color: 'inherit' }}>Plus tard</button></div>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const profile = useStore((s) => s.profile);
  const loc = useLocation();
  if (!profile) return <Navigate to="/onboarding" replace state={{ from: loc.pathname }} />;
  return <>{children}</>;
}

export function App() {
  const hydrated = useHydrated();
  useEffect(() => { if (hydrated) useStore.getState().touch(); }, [hydrated]);
  if (!hydrated) return <div className="app"><div className="view ctr mut" style={{ paddingTop: 80 }}>Chargement…</div></div>;
  return (
    <HashRouter>
      <ThemeApplier />
      <Routes>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<RequireProfile><Shell /></RequireProfile>}>
          <Route index element={<Home />} />
          <Route path="path" element={<PathScreen />} />
          <Route path="review" element={<Review />} />
          <Route path="explore" element={<Explore />} />
          <Route path="explore/alphabet" element={<Alphabet />} />
          <Route path="explore/vowels" element={<Vowels />} />
          <Route path="explore/tones/*" element={<Tones />} />
          <Route path="explore/numbers" element={<Numbers />} />
          <Route path="explore/vocab" element={<Vocabulary />} />
          <Route path="explore/vocab/:id" element={<VocabTheme />} />
          <Route path="explore/dialogs" element={<Dialogs />} />
          <Route path="explore/dialogs/:id" element={<DialogScreen />} />
          <Route path="explore/readings" element={<Readings />} />
          <Route path="explore/readings/:id" element={<ReadingScreen />} />
          <Route path="explore/grammar" element={<Grammar />} />
          <Route path="explore/grammar/:id" element={<GrammarScreen />} />
          <Route path="explore/classifiers" element={<Classifiers />} />
          <Route path="explore/phrasebook" element={<Phrasebook />} />
          <Route path="explore/phrasebook/:id" element={<PhrasebookSection />} />
          <Route path="explore/writing" element={<Writing />} />
          <Route path="explore/transcription" element={<Transcription />} />
          <Route path="explore/search" element={<Search />} />
          <Route path="profile" element={<Profile />} />
          <Route path="profile/settings" element={<Settings />} />
          <Route path="profile/data" element={<DataScreen />} />
          <Route path="profile/levels" element={<LevelsScreen />} />
          <Route path="profile/share" element={<ShareScreen />} />
          <Route path="profile/stats" element={<StatsScreen />} />
          <Route path="profile/people" element={<PeopleScreen />} />
          <Route path="play" element={<PlayHub />} />
          <Route path="play/defi" element={<ChallengeHub />} />
        </Route>
        <Route path="/play/duel" element={<RequireProfile><Duel /></RequireProfile>} />
        <Route path="/play/turns" element={<RequireProfile><Turns /></RequireProfile>} />
        <Route path="/play/defi/new" element={<RequireProfile><ChallengeNew /></RequireProfile>} />
        <Route path="/play/defi/:code" element={<RequireProfile><ChallengePlay /></RequireProfile>} />
        <Route path="/lesson/:id" element={<RequireProfile><LessonRunner /></RequireProfile>} />
        <Route path="/train/:mode" element={<RequireProfile><TrainingStart /></RequireProfile>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
      <UpdatePrompt />
    </HashRouter>
  );
}
