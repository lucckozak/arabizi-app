import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import type { Category } from '@/types/word';
import type { LearnMode } from '@/store/useAppStore';

type Direction = 'ar2en' | 'en2ar';

interface Props {
  open: boolean;
  category: Category | null;
  wordCount: number;
  onClose: () => void;
  onPickPractice: (mode: LearnMode, direction: Direction) => void;
  onPickVocabulary: () => void;
  /**
   * Skip the Practice / View Vocabulary chooser and go straight to the mode picker.
   * Used when the user is already viewing the vocabulary list — there's no point
   * offering "View vocabulary" again from there.
   */
  modeOnly?: boolean;
}

type View = 'main' | 'mode';

const MODES: Array<{ id: LearnMode; icon: string; title: string; subtitle: string }> = [
  { id: 'mcq',      icon: '📝', title: 'Multiple choice',     subtitle: 'Pick the right meaning' },
  { id: 'text',     icon: '⌨️', title: 'Type the answer',     subtitle: 'Spell it out yourself' },
  { id: 'match',    icon: '🔗', title: 'Matching pairs',      subtitle: 'Connect Arabic to English' },
  { id: 'sentence', icon: '✍️', title: 'Sentence completion', subtitle: 'Fill the missing word' },
  { id: 'dialogue', icon: '💬', title: 'Dialogue practice',   subtitle: 'Real-life UAE conversations' },
];

export const TopicActionSheet = ({ open, category, wordCount, onClose, onPickPractice, onPickVocabulary, modeOnly = false }: Props) => {
  const [view, setView] = useState<View>(modeOnly ? 'mode' : 'main');
  const [direction, setDirection] = useState<Direction>('ar2en');

  useEffect(() => {
    if (open) setView(modeOnly ? 'mode' : 'main');
  }, [open, category?.id, modeOnly]);

  if (!category) return null;

  return (
    <Modal open={open} onClose={onClose} title={`${category.emoji} ${category.label}`}>
      {view === 'main' && !modeOnly && (
        <>
          <p className="text-[15px] text-[color:var(--color-muted)] mb-5">
            What would you like to do?
          </p>
          <div className="flex flex-col gap-3">
            <ActionCard
              icon="🎯"
              title="Start practice"
              subtitle={`Run a quiz with ${wordCount} word${wordCount === 1 ? '' : 's'}.`}
              onClick={() => setView('mode')}
              chevron="›"
              primary
            />
            <ActionCard
              icon="📖"
              title="View vocabulary"
              subtitle="Browse the full word list — no quiz, just study."
              onClick={() => { onPickVocabulary(); onClose(); }}
            />
          </div>
        </>
      )}

      {view === 'mode' && (
        <>
          {!modeOnly && (
            <button
              onClick={() => setView('main')}
              className="text-sm font-semibold text-[color:var(--color-muted)] flex items-center gap-1 -ml-1 mb-3"
            >
              <span>‹</span> Back
            </button>
          )}

          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2">
            Direction
          </p>
          <div className="grid grid-cols-2 gap-1 p-1 bg-[color:var(--color-bg-soft)] rounded-xl mb-5">
            <SegBtn active={direction === 'ar2en'} onClick={() => setDirection('ar2en')}>Arabic → English</SegBtn>
            <SegBtn active={direction === 'en2ar'} onClick={() => setDirection('en2ar')}>English → Arabic</SegBtn>
          </div>

          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2">
            Mode
          </p>
          <div className="flex flex-col gap-2">
            {MODES.map((m) => (
              <ActionCard
                key={m.id}
                icon={m.icon}
                title={m.title}
                subtitle={m.subtitle}
                onClick={() => { onPickPractice(m.id, direction); onClose(); }}
                chevron="›"
                compact
              />
            ))}
          </div>
        </>
      )}
    </Modal>
  );
};

const SegBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
  <button
    onClick={onClick}
    className={`min-h-[40px] rounded-lg text-sm font-semibold transition-colors ${
      active ? 'bg-[color:var(--color-surface)] text-[color:var(--color-ink)] shadow-[var(--shadow-button)]' : 'text-[color:var(--color-muted)]'
    }`}
  >{children}</button>
);

const ActionCard = ({ icon, title, subtitle, onClick, chevron, primary, compact }: {
  icon: string; title: string; subtitle: string; onClick: () => void; chevron?: string; primary?: boolean; compact?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 text-left rounded-2xl ${compact ? 'px-3.5 py-3' : 'px-4 py-4'} transition-all active:scale-[0.99] ${
      primary
        ? 'bg-[color:var(--color-brand)] text-white shadow-[var(--shadow-button)]'
        : 'bg-[color:var(--color-surface)] border border-[color:var(--color-line)] text-[color:var(--color-ink)] hover:bg-[color:var(--color-surface-2)]'
    }`}
  >
    <span className={`${compact ? 'w-10 h-10 text-xl' : 'w-11 h-11 text-2xl'} rounded-xl flex items-center justify-center flex-shrink-0 ${
      primary ? 'bg-white/20' : 'bg-[color:var(--color-bg-soft)]'
    }`}>{icon}</span>
    <span className="flex-1 min-w-0">
      <span className="block font-semibold leading-tight">{title}</span>
      <span className={`block text-xs mt-0.5 ${primary ? 'text-white/80' : 'text-[color:var(--color-muted)]'}`}>{subtitle}</span>
    </span>
    {chevron && <span className={primary ? 'text-white/70' : 'text-[color:var(--color-muted)]'}>{chevron}</span>}
  </button>
);
