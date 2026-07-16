import { useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { AppShell } from '@/components/AppShell';
import { Topics } from '@/pages/Topics';
import { Play } from '@/pages/Play';
import { Grammar } from '@/pages/Grammar';
import { Classes } from '@/pages/Classes';
import { Review } from '@/pages/Review';
import { Settings } from '@/pages/Settings';
import { Onboarding } from '@/pages/Onboarding';

/**
 * Block copy/cut/paste/context-menu app-wide. Combined with `user-select: none`
 * in CSS this prevents users from copying answers out, pasting answers in, or
 * triggering the iOS share/copy menu via long-press.
 */
const useDisableClipboard = () => {
  useEffect(() => {
    const block = (e: Event) => e.preventDefault();
    const events = ['copy', 'cut', 'paste', 'contextmenu'] as const;
    events.forEach((evt) => document.addEventListener(evt, block, { capture: true }));
    return () => {
      events.forEach((evt) => document.removeEventListener(evt, block, { capture: true } as EventListenerOptions));
    };
  }, []);
};

const useTheme = () => {
  const mode = useAppStore((s) => s.settings.darkMode);
  const fontSize = useAppStore((s) => s.settings.fontSize);
  useEffect(() => {
    const apply = () => {
      const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
    };
    apply();
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    mql.addEventListener('change', apply);
    return () => mql.removeEventListener('change', apply);
  }, [mode]);
  useEffect(() => {
    const sizeMap = { sm: '14px', md: '16px', lg: '18px', xl: '20px' };
    document.documentElement.style.fontSize = sizeMap[fontSize];
  }, [fontSize]);
};

const App = () => {
  const onboardingComplete = useAppStore((s) => s.progress.onboardingComplete);
  useTheme();
  useDisableClipboard();

  if (!onboardingComplete) return <Onboarding />;

  return (
    <HashRouter>
      <AppShell>
        <Routes>
          <Route path="/" element={<Topics />} />
          <Route path="/play" element={<Play />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/classes" element={<Classes />} />
          <Route path="/review" element={<Review />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell>
    </HashRouter>
  );
};

export default App;
