import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { MasteryTiles } from './MasteryTiles';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toArabicNumerals = (n: number): string =>
  String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);

export const StreakCard = () => {
  const [open, setOpen] = useState(false);
  const progress = useAppStore((s) => s.progress);
  const dailyGoal = useAppStore((s) => s.settings.dailyGoal);

  const today = new Date().toISOString().slice(0, 10);
  const todayStat = progress.daily.find((d) => d.date === today);
  const reviewedToday = todayStat?.reviewed ?? 0;
  const goalPct = Math.min(1, dailyGoal === 0 ? 0 : reviewedToday / dailyGoal);
  const daysPracticed = progress.daily.length;

  return (
    <div
      className={`mb-4 rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden transition-shadow ${open ? 'shadow-[var(--shadow-pop)]' : ''}`}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left px-5 py-4 flex items-center gap-4 active:scale-[0.995] transition-transform"
      >
        <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-accent-soft)] flex items-center justify-center text-2xl flex-shrink-0">
          🔥
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums tracking-tight leading-none">{progress.streak}</span>
            <span className="text-sm font-semibold text-[color:var(--color-ink-soft)]">day streak</span>
          </div>
          <div className="text-xs text-[color:var(--color-muted)] mt-1 tabular-nums">
            {reviewedToday} / {dailyGoal} cards today
          </div>
        </div>
        <span
          className={`text-[color:var(--color-muted)] text-lg transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >⌃</span>
      </button>

      <div className="px-5 pb-1">
        <div className="h-1.5 rounded-full bg-[color:var(--color-bg-soft)] overflow-hidden mb-3">
          <div className="h-full bg-[color:var(--color-brand)] transition-all duration-500" style={{ width: `${goalPct * 100}%` }} />
        </div>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-5 pt-1 pb-5 border-t border-[color:var(--color-line)]">
            <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
              <StaticTile label="Days practiced" value={daysPracticed} />
              <StaticTile label="Longest streak" value={progress.longestStreak} />
            </div>
            <MasteryTiles />
          </div>
        </div>
      </div>
    </div>
  );
};

const StaticTile = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded-xl p-3 bg-[color:var(--color-bg-soft)]">
    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">{label}</div>
    <div className="mt-1 text-xl font-bold tabular-nums tracking-tight leading-none">{value}</div>
    <div className="ar text-sm font-semibold tabular-nums text-[color:var(--color-muted)] mt-0.5 leading-none" dir="rtl">
      {toArabicNumerals(value)}
    </div>
  </div>
);
