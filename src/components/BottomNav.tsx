import { NavLink, useLocation } from 'react-router-dom';
import type { ComponentType } from 'react';
import { VocabularyIcon, GrammarIcon, ReviewIcon, SettingsIcon, ClassesIcon } from './NavIcons';

interface Tab {
  to: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { to: '/',         label: 'Vocabulary', Icon: VocabularyIcon },
  { to: '/classes',  label: 'Classes',    Icon: ClassesIcon },
  { to: '/grammar',  label: 'Grammar',    Icon: GrammarIcon },
  { to: '/review',   label: 'Review',     Icon: ReviewIcon },
  { to: '/settings', label: 'Settings',   Icon: SettingsIcon },
];

export const BottomNav = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith('/play')) return null;

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 bg-[color:var(--color-surface)]/85 backdrop-blur-xl border-t border-[color:var(--color-line)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5 max-w-xl mx-auto px-3">
        {tabs.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-2 mx-1 my-1 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]'
                    : 'text-[color:var(--color-muted)]'
                }`
              }
            >
              <Icon className="w-[22px] h-[22px]" />
              <span className="text-[11px] font-semibold tracking-tight">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
