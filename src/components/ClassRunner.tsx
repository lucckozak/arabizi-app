import { useMemo, useState, type ReactNode } from 'react';
import { SessionHeader } from '@/components/SessionHeader';
import { MultipleChoice } from '@/components/quiz/MultipleChoice';
import { TextInputQuiz } from '@/components/quiz/TextInputQuiz';
import { Matching } from '@/components/quiz/Matching';
import { SentenceComplete } from '@/components/quiz/SentenceComplete';
import { DialogueExercise } from '@/components/quiz/DialogueExercise';
import { Transformations } from '@/components/quiz/Transformations';
import { Button } from '@/components/Button';
import { wordsByCategory, SENTENCES, DIALOGUES } from '@/data';
import { sample, shuffle } from '@/hooks/useShuffled';
import { useAppStore } from '@/store/useAppStore';
import type { ClassBlockSpec } from '@/types/class';
import type { Word } from '@/types/word';
import type { Sentence } from '@/types/sentence';

interface Props {
  spec: ClassBlockSpec;
  label: string;
  onDone: (correct: number, total: number) => void;
  onExit: () => void;
}

/** Shuffles and cycles a pool up to `length` items so small pools still fill a full session. */
const buildQueue = <T,>(pool: T[], length: number): T[] => {
  if (pool.length === 0) return [];
  const out: T[] = [];
  while (out.length < length) out.push(...shuffle(pool));
  return out.slice(0, length);
};

const EmptyBlock = ({ onExit }: { onExit: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[40svh] text-center px-2">
    <div className="text-5xl mb-4">🤷</div>
    <p className="text-[color:var(--color-muted)] mb-6">Nothing to practise here yet.</p>
    <Button onClick={onExit}>Back</Button>
  </div>
);

const RoundLoop = ({
  total, index, label, onExit, children,
}: { total: number; index: number; label: string; onExit: () => void; children: ReactNode }) => (
  <div>
    <SessionHeader onExit={onExit} label={`${label} · ${index + 1} / ${total}`} progress={index / total} />
    {children}
  </div>
);

export const ClassRunner = ({ spec, label, onDone, onExit }: Props) => {
  const recordGrammarAnswer = useAppStore((s) => s.recordGrammarAnswer);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const vocabPool = useMemo<Word[]>(() => {
    if (spec.kind !== 'vocab') return [];
    return spec.categories.flatMap((c) => wordsByCategory(c)).filter((w) => w.type !== 'phrase');
  }, [spec]);

  const sentencePool = useMemo<Sentence[]>(() => {
    if (spec.kind === 'vocab' && spec.mode === 'sentence') {
      return SENTENCES.filter((s) => spec.categories.includes(s.distractorPool));
    }
    if (spec.kind === 'grammarSentence') {
      return SENTENCES.filter((s) => s.distractorPool === spec.category);
    }
    return [];
  }, [spec]);

  const wordQueue = useMemo(() => (spec.kind === 'vocab' && spec.mode !== 'match' && spec.mode !== 'sentence'
    ? buildQueue(vocabPool, spec.length)
    : []), [spec, vocabPool]);

  const sentenceQueue = useMemo(() => (
    (spec.kind === 'vocab' && spec.mode === 'sentence') || spec.kind === 'grammarSentence'
      ? buildQueue(sentencePool, spec.length)
      : []
  ), [spec, sentencePool]);

  const advance = (wasCorrect: boolean, total: number) => {
    const nextCorrect = correct + (wasCorrect ? 1 : 0);
    setCorrect(nextCorrect);
    if (index + 1 >= total) {
      onDone(nextCorrect, total);
    } else {
      setIndex(index + 1);
    }
  };

  if (spec.kind === 'dialogue') {
    const dialogue = DIALOGUES.find((d) => d.id === spec.dialogueId);
    if (!dialogue) return <EmptyBlock onExit={onExit} />;
    return <DialogueExercise dialogue={dialogue} onExit={onExit} onDone={onDone} />;
  }

  if (spec.kind === 'vocab' && spec.mode === 'match') {
    const pairs = sample(vocabPool, Math.min(spec.length, vocabPool.length));
    if (pairs.length < 2) return <EmptyBlock onExit={onExit} />;
    return (
      <div>
        <SessionHeader onExit={onExit} label={label} />
        <Matching pairs={pairs} onDone={(stats) => onDone(stats.correctPairs, stats.total)} />
      </div>
    );
  }

  if (spec.kind === 'grammar') {
    return (
      <RoundLoop total={spec.length} index={index} label={label} onExit={onExit}>
        <Transformations
          key={index}
          scope={spec.topic}
          onAnswered={(c) => {
            recordGrammarAnswer(spec.topic, c);
            advance(c, spec.length);
          }}
        />
      </RoundLoop>
    );
  }

  if (spec.kind === 'grammarSentence') {
    if (sentenceQueue.length === 0) return <EmptyBlock onExit={onExit} />;
    const s = sentenceQueue[index];
    return (
      <RoundLoop total={spec.length} index={index} label={label} onExit={onExit}>
        <SentenceComplete
          key={s.id + index}
          sentence={s}
          onAnswered={(c) => { recordGrammarAnswer(spec.topic, c); advance(c, spec.length); }}
        />
      </RoundLoop>
    );
  }

  // spec.kind === 'vocab', mode is mcq | text | sentence
  if (spec.mode === 'sentence') {
    if (sentenceQueue.length === 0) return <EmptyBlock onExit={onExit} />;
    const s = sentenceQueue[index];
    return (
      <RoundLoop total={spec.length} index={index} label={label} onExit={onExit}>
        <SentenceComplete key={s.id + index} sentence={s} onAnswered={(c) => advance(c, spec.length)} />
      </RoundLoop>
    );
  }

  if (wordQueue.length === 0) return <EmptyBlock onExit={onExit} />;
  const word = wordQueue[index];
  return (
    <RoundLoop total={spec.length} index={index} label={label} onExit={onExit}>
      {spec.mode === 'mcq' ? (
        <MultipleChoice key={word.id + index} word={word} pool={vocabPool} mode={spec.direction} onAnswered={(c) => advance(c, spec.length)} />
      ) : (
        <TextInputQuiz key={word.id + index} word={word} mode={spec.direction} onAnswered={(c) => advance(c, spec.length)} />
      )}
    </RoundLoop>
  );
};
