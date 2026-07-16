import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ALL_WORDS } from '@/data';
import { VocabSheet } from './VocabSheet';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const toArabicNumerals = (n: number): string =>
  String(n).replace(/\d/g, (d) => ARABIC_DIGITS[Number(d)]);

const LEARNING_DESC =
  "Words you've answered correctly at least once. They're recognized — but not yet locked in. Keep practicing them in Review or Vocabulary to push them toward Mastered.";
const MASTERED_DESC =
  "Words you've answered correctly across many spaced reviews — they've reached the 30-day SRS interval. This is real long-term retention, not just first-time recognition.";

type ListView = 'learning' | 'mastered' | null;

export const MasteryTiles = () => {
  const [list, setList] = useState<ListView>(null);
  const totalLearned = useAppStore((s) => s.progress.totalLearned);
  const totalMastered = useAppStore((s) => s.progress.totalMastered);

  const learningWords = useMemo(() => {
    const set = new Set(totalLearned);
    return ALL_WORDS.filter((w) => set.has(w.id));
  }, [totalLearned]);
  const masteredWords = useMemo(() => {
    const set = new Set(totalMastered);
    return ALL_WORDS.filter((w) => set.has(w.id));
  }, [totalMastered]);

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Tile label="Learning" value={totalLearned.length} onClick={() => setList('learning')} />
        <Tile label="Mastered" value={totalMastered.length} onClick={() => setList('mastered')} tone="brand" />
      </div>

      <VocabSheet
        open={list === 'learning'}
        onClose={() => setList(null)}
        title="Learning"
        words={learningWords}
        groupByCategory
        description={LEARNING_DESC}
      />
      <VocabSheet
        open={list === 'mastered'}
        onClose={() => setList(null)}
        title="Mastered"
        words={masteredWords}
        groupByCategory
        description={MASTERED_DESC}
      />
    </>
  );
};

const Tile = ({
  label, value, onClick, tone = 'default',
}: {
  label: string;
  value: number;
  onClick: () => void;
  tone?: 'default' | 'brand';
}) => {
  const baseBg = tone === 'brand' ? 'bg-[color:var(--color-brand-soft)]' : 'bg-[color:var(--color-bg-soft)]';
  const valueColor = tone === 'brand' ? 'text-[color:var(--color-brand-strong)]' : 'text-[color:var(--color-ink)]';
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl p-3 transition-all active:scale-[0.98] hover:brightness-95 ${baseBg}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
          {label}
        </div>
        <span className="text-[color:var(--color-muted)] text-sm leading-none" aria-hidden="true">›</span>
      </div>
      <div className={`mt-1 text-xl font-bold tabular-nums tracking-tight leading-none ${valueColor}`}>
        {value}
      </div>
      <div className="ar text-sm font-semibold tabular-nums text-[color:var(--color-muted)] mt-0.5 leading-none" dir="rtl">
        {toArabicNumerals(value)}
      </div>
    </button>
  );
};
