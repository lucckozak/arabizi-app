import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { SessionHeader } from '@/components/SessionHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArabicText } from '@/components/ArabicText';
import { ResultsBar } from '@/components/ResultsBar';
import { GrammarSheet } from '@/components/GrammarSheet';
import { ClassRunner } from '@/components/ClassRunner';
import { CLASSES, ALL_WORDS } from '@/data';
import { useAppStore } from '@/store/useAppStore';
import { computeClassStates } from '@/services/classProgress';
import { todayLocal } from '@/store/useAppStore';
import type { ClassLesson } from '@/types/class';
import type { ClassStatus } from '@/services/classProgress';

export const Classes = () => {
  const classRecords = useAppStore((s) => s.progress.classes);
  const recordClassComplete = useAppStore((s) => s.recordClassComplete);
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const [activeId, setActiveId] = useState<string | null>(null);

  const states = useMemo(() => computeClassStates(CLASSES, classRecords), [classRecords]);
  const completedCount = Object.values(states).filter((s) => s === 'completed').length;

  if (activeId) {
    const lesson = CLASSES.find((c) => c.id === activeId);
    if (!lesson) { setActiveId(null); return null; }
    const wasAlreadyCompleted = states[lesson.id] === 'completed';
    return (
      <ClassFlow
        lesson={lesson}
        wasAlreadyCompleted={wasAlreadyCompleted}
        showArabizi={showArabizi}
        onExit={() => setActiveId(null)}
        onComplete={() => recordClassComplete(lesson.id)}
      />
    );
  }

  const today = todayLocal();

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle={`${completedCount} / ${CLASSES.length} completed · one new class unlocks each day`}
      />
      <div className="relative pl-2">
        <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-[color:var(--color-line)]" aria-hidden="true" />
        <div className="flex flex-col gap-3">
          {CLASSES.map((lesson, i) => {
            const status = states[lesson.id];
            const prev = CLASSES[i - 1];
            const dailyLocked = status === 'locked' && prev && classRecords[prev.id]?.completedDate === today;
            return (
              <ClassNode
                key={lesson.id}
                lesson={lesson}
                status={status}
                dailyLocked={!!dailyLocked}
                onClick={() => status !== 'locked' && setActiveId(lesson.id)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ClassNode = ({ lesson, status, dailyLocked, onClick }: {
  lesson: ClassLesson; status: ClassStatus; dailyLocked: boolean; onClick: () => void;
}) => {
  const badgeCls =
    status === 'completed' ? 'bg-[color:var(--color-brand)] text-white'
    : status === 'available' ? 'bg-[color:var(--color-surface)] border-2 border-[color:var(--color-brand)] text-2xl'
    : 'bg-[color:var(--color-bg-soft)] text-[color:var(--color-muted)]';

  return (
    <button
      onClick={onClick}
      disabled={status === 'locked'}
      className={`relative z-10 flex items-center gap-4 text-left rounded-2xl p-3 transition-transform ${
        status === 'locked' ? 'opacity-60' : 'active:scale-[0.99]'
      }`}
    >
      <span className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-[var(--shadow-card)] ${badgeCls}`}>
        {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : lesson.emoji}
      </span>
      <div className="flex-1 min-w-0 bg-[color:var(--color-surface)] border border-[color:var(--color-line)] rounded-2xl px-4 py-3 shadow-[var(--shadow-card)]">
        <div className="font-semibold leading-tight truncate">{lesson.title}</div>
        <div className="text-xs text-[color:var(--color-muted)] mt-0.5 leading-snug truncate">{lesson.subtitle}</div>
        {status === 'locked' && (
          <div className="text-[11px] font-semibold text-[color:var(--color-accent)] mt-1">
            {dailyLocked ? '⏳ Unlocks tomorrow' : '🔒 Finish earlier classes first'}
          </div>
        )}
        {status === 'available' && (
          <div className="text-[11px] font-semibold text-[color:var(--color-brand-strong)] mt-1">Today's class — tap to start</div>
        )}
      </div>
    </button>
  );
};

type FlowStep = 'explanation' | 'practice' | 'homework' | 'done';
type BlockResult = { correct: number; total: number; seconds: number };

const ClassFlow = ({ lesson, wasAlreadyCompleted, showArabizi, onExit, onComplete }: {
  lesson: ClassLesson;
  wasAlreadyCompleted: boolean;
  showArabizi: boolean;
  onExit: () => void;
  onComplete: () => void;
}) => {
  const [step, setStep] = useState<FlowStep>('explanation');
  const [practiceResult, setPracticeResult] = useState<BlockResult | null>(null);
  const [homeworkResult, setHomeworkResult] = useState<BlockResult | null>(null);
  const [startedAt, setStartedAt] = useState(Date.now());
  const [sheetOpen, setSheetOpen] = useState(false);
  // Captured once at mount — `wasAlreadyCompleted` is recomputed live from the
  // store on every render, so it flips true the instant this session's own
  // completion is recorded. We need the value from *before* this session.
  const [initiallyCompleted] = useState(wasAlreadyCompleted);

  const previewWords = (lesson.vocabPreview ?? [])
    .map((id) => ALL_WORDS.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => !!w);

  if (step === 'explanation') {
    return (
      <div>
        <SessionHeader onExit={onExit} label={lesson.title} />
        <div className="text-5xl mb-3">{lesson.emoji}</div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">{lesson.title}</h1>
        <p className="text-sm text-[color:var(--color-muted)] mb-4">{lesson.subtitle}</p>
        <Card className="mb-4">
          <p className="text-[15px] leading-relaxed">{lesson.intro}</p>
        </Card>

        {previewWords.length > 0 && (
          <>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2 px-1">
              New this class
            </div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {previewWords.map((w) => (
                <Card key={w.id} compact className="flex flex-col items-center text-center gap-1">
                  <ArabicText arabic={w.arabic} arabizi={w.arabizi} showArabizi={showArabizi} size="md" center speak />
                  <div className="text-xs text-[color:var(--color-muted)]">{w.english}</div>
                </Card>
              ))}
            </div>
          </>
        )}

        {lesson.grammarTopic && (
          <Button variant="secondary" full className="mb-3" onClick={() => setSheetOpen(true)}>📖 View grammar rules</Button>
        )}

        <Button full onClick={() => { setStartedAt(Date.now()); setStep('practice'); }}>
          {initiallyCompleted ? '🔁 Review this class' : '🎯 Start practice'}
        </Button>

        {lesson.grammarTopic && (
          <GrammarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} topic={lesson.grammarTopic} />
        )}
      </div>
    );
  }

  if (step === 'practice') {
    if (practiceResult) {
      return (
        <StepDone
          icon="🎯"
          title="Practice done"
          result={practiceResult}
          continueLabel="Start homework"
          onExit={onExit}
          onContinue={() => { setStartedAt(Date.now()); setStep('homework'); }}
        />
      );
    }
    return (
      <ClassRunner
        spec={lesson.practice}
        label="Practice"
        onExit={onExit}
        onDone={(correct, total) => setPracticeResult({ correct, total, seconds: Math.round((Date.now() - startedAt) / 1000) })}
      />
    );
  }

  if (step === 'homework') {
    if (homeworkResult) {
      return (
        <StepDone
          icon="🏁"
          title="Homework done"
          result={homeworkResult}
          continueLabel="Finish class"
          onExit={onExit}
          onContinue={() => { onComplete(); setStep('done'); }}
        />
      );
    }
    return (
      <ClassRunner
        spec={lesson.homework}
        label="Homework"
        onExit={onExit}
        onDone={(correct, total) => setHomeworkResult({ correct, total, seconds: Math.round((Date.now() - startedAt) / 1000) })}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60svh] text-center px-2">
      <div className="text-6xl mb-5">🎉</div>
      <h2 className="text-2xl font-bold tracking-tight mb-2">Class complete!</h2>
      <p className="text-[color:var(--color-muted)] mb-8 max-w-xs">
        {initiallyCompleted ? "Nice review! Come back tomorrow for the next class." : "Great work — tomorrow's class unlocks after midnight."}
      </p>
      <div className="w-full max-w-xs"><Button onClick={onExit} full>Back to classes</Button></div>
    </div>
  );
};

const StepDone = ({ icon, title, result, continueLabel, onExit, onContinue }: {
  icon: string; title: string; result: BlockResult; continueLabel: string; onExit: () => void; onContinue: () => void;
}) => {
  const accuracyPct = result.total === 0 ? 100 : Math.round((result.correct / result.total) * 100);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60svh] text-center px-2">
      <div className="text-6xl mb-5">{icon}</div>
      <h2 className="text-2xl font-bold tracking-tight mb-3">{title}</h2>
      <ResultsBar wrong={result.total - result.correct} accuracyPct={accuracyPct} seconds={result.seconds} />
      <div className="w-full max-w-xs mt-8 flex flex-col gap-2">
        <Button onClick={onContinue} full>{continueLabel}</Button>
        <Button onClick={onExit} full variant="ghost">Exit class</Button>
      </div>
    </div>
  );
};
