import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export const AppShell = ({ children }: { children: ReactNode }) => {
  const { pathname } = useLocation();
  // Bottom nav is hidden inside the player — no need to reserve 84px below it.
  const inSession = pathname.startsWith('/play');
  return (
    <div
      className="min-h-svh max-w-xl mx-auto"
      style={{
        paddingTop: 'env(safe-area-inset-top)',
        paddingBottom: inSession
          ? 'env(safe-area-inset-bottom)'
          : 'calc(env(safe-area-inset-bottom) + 84px)',
      }}
    >
      <main className={`px-5 ${inSession ? 'pt-3 pb-3' : 'pt-5 pb-4'}`}>{children}</main>
      <BottomNav />
    </div>
  );
};
