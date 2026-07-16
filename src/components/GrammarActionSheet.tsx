import { useEffect, useState } from 'react';
import { Modal } from './Modal';

export type GrammarTopic = 'verb' | 'verbPast' | 'owner' | 'prep';
export type GrammarMode = 'manual' | 'mcq' | 'sentence';

interface ModeDef {
  id: GrammarMode;
  icon: string;
  title: string;
  subtitle: string;
}

const TOPICS: Record<GrammarTopic, { emoji: string; label: string; modes: ModeDef[] }> = {
  verb: {
    emoji: '🔤',
    label: 'Verb conjugation',
    modes: [
      { id: 'manual', icon: '⌨️', title: 'Type the answer',  subtitle: 'Conjugate the verb yourself' },
      { id: 'mcq',    icon: '📝', title: 'Multiple choice',  subtitle: 'Pick the right form from four options' },
    ],
  },
  verbPast: {
    emoji: '⏳',
    label: 'Past tense',
    modes: [
      { id: 'manual',   icon: '⌨️', title: 'Type the answer',      subtitle: 'Conjugate the verb in the past yourself' },
      { id: 'mcq',      icon: '📝', title: 'Multiple choice',      subtitle: 'Pick the right past form from four options' },
      { id: 'sentence', icon: '✍️', title: 'Sentence completion',  subtitle: 'Fill the missing past-tense verb in context' },
    ],
  },
  owner: {
    emoji: '🏷️',
    label: 'Ownership suffixes',
    modes: [
      { id: 'manual', icon: '⌨️', title: 'Type the answer',  subtitle: 'Add the right ending yourself' },
      { id: 'mcq',    icon: '📝', title: 'Multiple choice',  subtitle: 'Pick the right form from four options' },
    ],
  },
  prep: {
    emoji: '🪧',
    label: 'Prepositions',
    modes: [
      { id: 'sentence', icon: '✍️', title: 'Sentence completion', subtitle: 'Fill the missing preposition in context' },
    ],
  },
};

interface Props {
  open: boolean;
  topic: GrammarTopic | null;
  onClose: () => void;
  onStart: (topic: GrammarTopic, mode: GrammarMode) => void;
  onViewRules: (topic: GrammarTopic) => void;
}

type View = 'main' | 'mode';

export const GrammarActionSheet = ({ open, topic, onClose, onStart, onViewRules }: Props) => {
  const [view, setView] = useState<View>('main');

  useEffect(() => {
    if (open) setView('main');
  }, [open, topic]);

  if (!topic) return null;
  const def = TOPICS[topic];

  return (
    <Modal open={open} onClose={onClose} title={`${def.emoji} ${def.label}`}>
      {view === 'main' && (
        <>
          <p className="text-[15px] text-[color:var(--color-muted)] mb-5">
            What would you like to do?
          </p>
          <div className="flex flex-col gap-3">
            <ActionCard
              icon="🎯"
              title="Start practice"
              subtitle={def.modes.length > 1 ? 'Choose a mode and begin a drill.' : `${def.modes[0].title} drill — ${def.modes[0].subtitle.toLowerCase()}.`}
              onClick={() => def.modes.length > 1 ? setView('mode') : (onStart(topic, def.modes[0].id), onClose())}
              chevron="›"
              primary
            />
            <ActionCard
              icon="📖"
              title="View rules"
              subtitle="Cheat sheet — read the rules and examples."
              onClick={() => { onViewRules(topic); onClose(); }}
            />
          </div>
        </>
      )}

      {view === 'mode' && (
        <>
          <button
            onClick={() => setView('main')}
            className="text-sm font-semibold text-[color:var(--color-muted)] flex items-center gap-1 -ml-1 mb-3"
          >
            <span>‹</span> Back
          </button>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2">
            Choose a mode
          </p>
          <div className="flex flex-col gap-2">
            {def.modes.map((m) => (
              <ActionCard
                key={m.id}
                icon={m.icon}
                title={m.title}
                subtitle={m.subtitle}
                onClick={() => { onStart(topic, m.id); onClose(); }}
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
