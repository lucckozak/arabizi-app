import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { TopicActionSheet } from '@/components/TopicActionSheet';
import { StreakCard } from '@/components/StreakCard';
import { CATEGORIES, ALL_WORDS, VOCAB_WITH_VERBS, wordsByCategory } from '@/data';
import { useAppStore } from '@/store/useAppStore';
import type { Category } from '@/types/word';
import type { LearnMode } from '@/store/useAppStore';

const ALL_CATEGORY: Category = { id: 'all', label: 'Mix all topics', emoji: '✨' };

export const Topics = () => {
  const [actionFor, setActionFor] = useState<Category | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const setPendingLaunch = useAppStore((s) => s.setPendingLaunch);
  const navigate = useNavigate();

  const counts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const c of CATEGORIES) m[c.id] = wordsByCategory(c.id).length;
    return m;
  }, []);

  const totalLearned = useAppStore((s) => s.progress.totalLearned);
  const totalMastered = useAppStore((s) => s.progress.totalMastered);

  /**
   * 3-state model:
   *   NEW       — never answered correctly       (totalLearned ✗ AND totalMastered ✗)
   *   LEARNING  — answered correctly at least 1× (totalLearned ✓)
   *   MASTERED  — SRS bucket ≥ 5                 (totalMastered ✓)
   * Mastered words are a subset of Learning words.
   */
  const progress = useMemo(() => {
    const m: Record<string, { learning: number; mastered: number; total: number; learningPct: number; masteredPct: number }> = {};
    const learningSet = new Set(totalLearned);
    const masteredSet = new Set(totalMastered);
    const compute = (words: { id: string }[]) => {
      const learning = words.filter((w) => learningSet.has(w.id)).length;
      const mastered = words.filter((w) => masteredSet.has(w.id)).length;
      const total = words.length;
      const learningPct = total === 0 ? 0 : Math.round((learning / total) * 100);
      const masteredPct = total === 0 ? 0 : Math.round((mastered / total) * 100);
      return { learning, mastered, total, learningPct, masteredPct };
    };
    for (const c of CATEGORIES) m[c.id] = compute(wordsByCategory(c.id));
    m['all'] = compute(VOCAB_WITH_VERBS);
    return m;
  }, [totalLearned, totalMastered]);

  const startPractice = (cat: Category, mode: LearnMode, direction: 'ar2en' | 'en2ar') => {
    setPendingLaunch({ category: cat.id, mode, direction });
    navigate('/play');
  };

  const onVocabulary = (cat: Category) => {
    if (cat.id === 'all') setShowAll(true);
    else setSelected(cat.id);
  };

  const wordCountFor = (cat: Category) =>
    cat.id === 'all' ? VOCAB_WITH_VERBS.length : (counts[cat.id] ?? 0);

  if (selected) {
    const cat = CATEGORIES.find((c) => c.id === selected);
    const words = ALL_WORDS.filter((w) => w.category === selected);

    return (
      <div>
        <header className="flex items-center justify-between gap-3 mb-5">
          <button
            onClick={() => setSelected(null)}
            className="text-sm font-semibold text-[color:var(--color-muted)] flex items-center gap-1 -ml-1"
          >
            <span>‹</span> Vocabulary
          </button>
          <span className="text-xs font-semibold text-[color:var(--color-muted)] tabular-nums">{words.length} words</span>
        </header>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-[color:var(--color-bg-soft)] flex items-center justify-center text-3xl">
            {cat?.emoji}
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{cat?.label}</h1>
            <p className="text-xs text-[color:var(--color-muted)]">Vocabulary list</p>
          </div>
        </div>

        <Card compact className="mb-4">
          <ul className="divide-y divide-[color:var(--color-line)]">
            {words.map((w) => (
              <WordRow key={w.id} arabic={w.arabic} arabizi={w.arabizi} english={w.english} showArabizi={showArabizi} />
            ))}
          </ul>
        </Card>

        {cat && (
          <Button full onClick={() => setActionFor(cat)}>🎯 Practice this topic</Button>
        )}
        <TopicActionSheet
          open={actionFor !== null}
          category={actionFor}
          wordCount={actionFor ? wordCountFor(actionFor) : 0}
          onClose={() => setActionFor(null)}
          onPickPractice={(mode, dir) => actionFor && startPractice(actionFor, mode, dir)}
          onPickVocabulary={() => actionFor && onVocabulary(actionFor)}
          modeOnly
        />
      </div>
    );
  }

  if (showAll) {
    return (
      <div>
        <header className="flex items-center justify-between gap-3 mb-5">
          <button
            onClick={() => setShowAll(false)}
            className="text-sm font-semibold text-[color:var(--color-muted)] flex items-center gap-1 -ml-1"
          >
            <span>‹</span> Vocabulary
          </button>
          <span className="text-xs font-semibold text-[color:var(--color-muted)] tabular-nums">{ALL_WORDS.length} words</span>
        </header>
        <h1 className="text-2xl font-bold tracking-tight mb-5">All vocabulary</h1>
        {CATEGORIES.map((c) => {
          const list = ALL_WORDS.filter((w) => w.category === c.id);
          if (list.length === 0) return null;
          return (
            <section key={c.id} className="mb-5">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2 px-1">
                {c.emoji} {c.label} · {list.length}
              </h2>
              <Card compact>
                <ul className="divide-y divide-[color:var(--color-line)]">
                  {list.map((w) => (
                    <WordRow key={w.id} arabic={w.arabic} arabizi={w.arabizi} english={w.english} showArabizi={showArabizi} />
                  ))}
                </ul>
              </Card>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      <StreakCard />

      <button
        onClick={() => setActionFor(ALL_CATEGORY)}
        className="w-full text-left rounded-2xl p-5 mb-4 bg-gradient-to-br from-[color:var(--color-brand)] to-[color:var(--color-brand-strong)] text-white shadow-[var(--shadow-card)] active:scale-[0.99] transition-transform"
      >
        <div className="flex items-center gap-4 mb-3">
          <span className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl flex-shrink-0">✨</span>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-lg leading-tight">Mix all topics</div>
            <div className="text-xs text-white/85 mt-1 tabular-nums">
              <span className="font-semibold">{progress.all.learning}</span> learning ·
              <span className="font-semibold ml-1">{progress.all.mastered}</span> mastered ·
              <span className="ml-1">{progress.all.total} total</span>
            </div>
          </div>
        </div>
        <StackedBar
          total={progress.all.total}
          learning={progress.all.learning}
          mastered={progress.all.mastered}
          tone="onBrand"
        />
      </button>

      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2 px-1">
        Categories
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        {CATEGORIES.filter((c) => counts[c.id] > 0).map((c) => {
          const p = progress[c.id];
          return (
            <button
              key={c.id}
              onClick={() => setActionFor(c)}
              className="bg-[color:var(--color-surface)] border border-[color:var(--color-line)] shadow-[var(--shadow-card)] rounded-2xl p-5 text-left active:scale-[0.98] transition-transform hover:bg-[color:var(--color-surface-2)] flex flex-col"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="text-3xl leading-none">{c.emoji}</div>
                <StateBadge mastered={p.mastered} learning={p.learning} total={p.total} />
              </div>
              <div className="font-semibold leading-tight">{c.label}</div>
              <div className="text-[11px] text-[color:var(--color-muted)] mt-1 tabular-nums leading-snug">
                <span className="text-[color:var(--color-brand-strong)] font-semibold">{p.mastered}</span> mastered ·
                <span className="ml-1 text-[color:var(--color-ink-soft)] font-semibold">{p.learning}</span> learning
              </div>
              <div className="mt-3">
                <StackedBar total={p.total} learning={p.learning} mastered={p.mastered} />
              </div>
            </button>
          );
        })}
      </div>
      <Button variant="secondary" full onClick={() => setShowAll(true)}>📑 View entire vocabulary</Button>

      <TopicActionSheet
        open={actionFor !== null}
        category={actionFor}
        wordCount={actionFor ? wordCountFor(actionFor) : 0}
        onClose={() => setActionFor(null)}
        onPickPractice={(mode, dir) => actionFor && startPractice(actionFor, mode, dir)}
        onPickVocabulary={() => actionFor && onVocabulary(actionFor)}
      />
    </div>
  );
};

/**
 * Compact badge showing the dominant state for a topic at a glance.
 * - All mastered → bright "Mastered" pill
 * - Some mastered → mastered count over total
 * - All learning, none mastered → "Learning" pill
 * - Some learning → learning count over total
 * - Nothing started → "New"
 */
const StateBadge = ({ mastered, learning, total }: { mastered: number; learning: number; total: number }) => {
  if (total === 0) return null;
  if (mastered === total) {
    return <Badge tone="mastered">Mastered</Badge>;
  }
  if (learning === 0) {
    return <Badge tone="new">New</Badge>;
  }
  if (mastered > 0) {
    return <Badge tone="mastered">{mastered}/{total}</Badge>;
  }
  return <Badge tone="learning">{learning}/{total}</Badge>;
};

const Badge = ({ tone, children }: { tone: 'mastered' | 'learning' | 'new'; children: React.ReactNode }) => {
  const cls =
    tone === 'mastered' ? 'bg-[color:var(--color-correct-soft)] text-[color:var(--color-correct)]'
    : tone === 'learning' ? 'bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]'
    : 'bg-[color:var(--color-bg-soft)] text-[color:var(--color-muted)]';
  return (
    <span className={`inline-flex items-center justify-center px-2 h-6 rounded-full text-[11px] font-bold tabular-nums ${cls}`}>
      {children}
    </span>
  );
};

/**
 * Three-state stacked bar: New (track), Learning (light fill from left), Mastered (dark overlay from left).
 * Mastered ⊆ Learning, so mastered always sits inside the learning fill.
 */
const StackedBar = ({ total, learning, mastered, tone = 'default' }: { total: number; learning: number; mastered: number; tone?: 'default' | 'onBrand' }) => {
  const learningPct = total === 0 ? 0 : (learning / total) * 100;
  const masteredPct = total === 0 ? 0 : (mastered / total) * 100;
  const trackBg = tone === 'onBrand' ? 'bg-white/25' : 'bg-[color:var(--color-bg-soft)]';
  const learningBg = tone === 'onBrand' ? 'bg-white/65' : 'bg-[color:var(--color-brand-soft)]';
  const masteredBg = tone === 'onBrand' ? 'bg-white' : 'bg-[color:var(--color-brand)]';
  return (
    <div className={`relative h-1.5 rounded-full overflow-hidden ${trackBg}`}>
      <div className={`absolute inset-y-0 left-0 transition-all duration-500 ${learningBg}`} style={{ width: `${learningPct}%` }} />
      <div className={`absolute inset-y-0 left-0 transition-all duration-500 ${masteredBg}`} style={{ width: `${masteredPct}%` }} />
    </div>
  );
};

const WordRow = ({ arabic, arabizi, english, showArabizi }: { arabic: string; arabizi: string; english: string; showArabizi: boolean }) => (
  <li className="py-3 grid grid-cols-[1fr_auto] gap-4 items-center first:pt-1 last:pb-1">
    <div className="min-w-0">
      <div className="text-sm font-medium leading-tight">{english}</div>
      {showArabizi && (
        <div className="text-xs text-[color:var(--color-muted)] mt-0.5 truncate">{arabizi}</div>
      )}
    </div>
    <div className="ar text-2xl text-right font-semibold leading-none" dir="rtl">{arabic}</div>
  </li>
);
