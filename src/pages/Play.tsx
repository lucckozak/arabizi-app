import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wordsByCategory, VOCAB_WITH_VERBS, SENTENCES, DIALOGUES } from '@/data';
import { Button } from '@/components/Button';
import { ResultsBar } from '@/components/ResultsBar';
import { SessionHeader } from '@/components/SessionHeader';
import { MultipleChoice } from '@/components/quiz/MultipleChoice';
import { TextInputQuiz } from '@/components/quiz/TextInputQuiz';
import { Matching } from '@/components/quiz/Matching';
import { SentenceComplete } from '@/components/quiz/SentenceComplete';
import { DialogueExercise } from '@/components/quiz/DialogueExercise';
import { useAppStore } from '@/store/useAppStore';
import { pickFreshSlice, pickFreshSliceByKey } from '@/services/sessionService';
import type { Word } from '@/types/word';
import type { Sentence } from '@/types/sentence';
import type { Dialogue } from '@/types/dialogue';
import type { LearnMode, PendingLaunch } from '@/store/useAppStore';
import type { CardState } from '@/types/progress';

interface Session {
  category: string | 'all';
  mode: LearnMode;
  direction: 'ar2en' | 'en2ar';
  queue: Word[];
  pool: Word[];
  sentenceQueue: Sentence[];
  dialogue: Dialogue | null;
  dialogueResult: { correct: number; total: number; seconds: number } | null;
  index: number;
  results: { correct: number; wrong: number };
  matchDone: { correctPairs: number; total: number; seconds: number; wrongAttempts: number } | null;
  startedAt: number;
  grammarTopic?: PendingLaunch['grammarTopic'];
  returnTo: string;
}

const buildPool = (category: string | 'all'): Word[] => {
  if (category === 'all') return VOCAB_WITH_VERBS;
  return wordsByCategory(category).filter((w) => w.type !== 'phrase');
};

const filterSentences = (cat: string | 'all'): Sentence[] =>
  cat === 'all' ? SENTENCES : SENTENCES.filter((s) => s.distractorPool === cat);

const filterDialogues = (cat: string | 'all'): Dialogue[] =>
  cat === 'all' ? DIALOGUES : DIALOGUES.filter((d) => d.topics.includes(cat));

const lengthFor = (mode: LearnMode, qs: { mcq: number; text: number; match: number; sentence: number }): number => {
  switch (mode) {
    case 'mcq': return qs.mcq;
    case 'text': return qs.text;
    case 'match': return qs.match;
    case 'sentence': return qs.sentence;
    case 'dialogue': return 1; // a dialogue is a single multi-blank scenario
  }
};

const buildSession = (p: PendingLaunch, cards: Record<string, CardState>, qs: { mcq: number; text: number; match: number; sentence: number }): Session => {
  const pool = buildPool(p.category);
  const baseLen = lengthFor(p.mode, qs);
  const sessionKey = `${p.mode}:${p.category}`;

  let queue: Word[] = [];
  if (p.mode === 'match') {
    // Matching has no "direction" concept and can repeat heavily on small topics.
    // Use direction-agnostic lastSeen + previous-session memory + larger jitter.
    queue = pickFreshSlice(pool, baseLen, cards, p.direction, {
      sessionKey,
      bothDirections: true,
      jitterHours: 12,
    });
  } else if (p.mode !== 'sentence' && p.mode !== 'dialogue') {
    queue = pickFreshSlice(pool, baseLen, cards, p.direction, { sessionKey });
  }

  const sentenceQueue = p.mode === 'sentence'
    ? pickFreshSliceByKey(filterSentences(p.category), baseLen, cards, (s) => `${s.id}:`, { sessionKey })
    : [];

  let dialogue: Dialogue | null = null;
  if (p.mode === 'dialogue') {
    const eligible = filterDialogues(p.category);
    if (eligible.length > 0) {
      dialogue = pickFreshSliceByKey(eligible, 1, cards, (d) => `${d.id}.`, { sessionKey })[0] ?? null;
    }
  }

  return {
    category: p.category,
    mode: p.mode,
    direction: p.direction,
    queue,
    pool,
    sentenceQueue,
    dialogue,
    dialogueResult: null,
    index: 0,
    results: { correct: 0, wrong: 0 },
    matchDone: null,
    startedAt: Date.now(),
    grammarTopic: p.grammarTopic,
    returnTo: p.returnTo ?? '/',
  };
};

export const Play = () => {
  const consumePendingLaunch = useAppStore((s) => s.consumePendingLaunch);
  const initialCards = useAppStore.getState().progress.cards;
  const initialQuizSize = useAppStore.getState().settings.quizSize;
  const navigate = useNavigate();

  const launchRef = useRef<PendingLaunch | null | undefined>(undefined);
  if (launchRef.current === undefined) {
    launchRef.current = consumePendingLaunch();
  }
  const launch = launchRef.current;

  const [session, setSession] = useState<Session | null>(() =>
    launch ? buildSession(launch, initialCards, initialQuizSize) : null,
  );

  const returnTo = session?.returnTo ?? '/';
  const backLabel = returnTo === '/grammar' ? 'Back to Grammar' : 'Back to Vocabulary';
  const exit = () => navigate(returnTo, { replace: true });

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] text-center">
        <div className="text-6xl mb-5">🤷</div>
        <h2 className="text-2xl font-bold tracking-tight mb-2">Nothing to play</h2>
        <p className="text-[color:var(--color-muted)] mb-8 max-w-xs">Pick a topic from Vocabulary to start a session.</p>
        <div className="w-full max-w-xs"><Button onClick={() => navigate('/', { replace: true })} full>Back to Vocabulary</Button></div>
      </div>
    );
  }

  if (session.mode === 'dialogue') {
    if (!session.dialogue) {
      return <Done icon="💬" title="No dialogue for this topic yet" message="Try a different topic, or pick Mix all topics for a wider set." onAgain={exit} backLabel={backLabel} />;
    }
    if (session.dialogueResult) {
      const { correct, total, seconds } = session.dialogueResult;
      const wrong = total - correct;
      const accuracyPct = total === 0 ? 100 : Math.round((correct / total) * 100);
      return <Done icon="💬" title="Dialogue complete" stats={{ wrong, accuracyPct, seconds }} onAgain={exit} backLabel={backLabel} />;
    }
    return (
      <DialogueExercise
        dialogue={session.dialogue}
        onExit={exit}
        onDone={(correct, total) => setSession({
          ...session,
          dialogueResult: { correct, total, seconds: Math.round((Date.now() - session.startedAt) / 1000) },
        })}
      />
    );
  }

  if (session.mode === 'match') {
    if (session.matchDone) {
      const { total, seconds, wrongAttempts } = session.matchDone;
      const accuracyPct = total + wrongAttempts === 0 ? 100 : Math.round((total / (total + wrongAttempts)) * 100);
      return <Done icon="🔗" title="Matching done" stats={{ wrong: wrongAttempts, accuracyPct, seconds }} onAgain={exit} backLabel={backLabel} />;
    }
    return (
      <div>
        <SessionHeader onExit={exit} label="Matching" />
        <Matching
          pairs={session.queue}
          onDone={(stats) => setSession({ ...session, matchDone: stats })}
        />
      </div>
    );
  }

  const total = session.mode === 'sentence' ? session.sentenceQueue.length : session.queue.length;
  if (total === 0) {
    return <Done icon="🤷" title="Nothing to practise" message="Try a different topic." onAgain={exit} backLabel={backLabel} />;
  }
  if (session.index >= total) {
    const wrong = session.results.wrong;
    const accuracyPct = total === 0 ? 100 : Math.round((session.results.correct / total) * 100);
    const seconds = Math.round((Date.now() - session.startedAt) / 1000);
    return <Done icon="🎉" title="Done!" stats={{ wrong, accuracyPct, seconds }} onAgain={exit} backLabel={backLabel} />;
  }

  const recordGrammarAnswer = useAppStore.getState().recordGrammarAnswer;
  const next = (correct: boolean) => {
    if (session.grammarTopic) recordGrammarAnswer(session.grammarTopic, correct);
    setSession({
      ...session,
      index: session.index + 1,
      results: {
        correct: session.results.correct + (correct ? 1 : 0),
        wrong: session.results.wrong + (correct ? 0 : 1),
      },
    });
  };

  return (
    <div>
      <SessionHeader
        onExit={exit}
        label={`${session.index + 1} / ${total}`}
        progress={session.index / total}
      />
      {session.mode === 'sentence' ? (
        (() => {
          const s = session.sentenceQueue[session.index];
          return <SentenceComplete key={s.id} sentence={s} onAnswered={next} />;
        })()
      ) : session.mode === 'mcq' ? (
        (() => {
          const word = session.queue[session.index];
          return <MultipleChoice key={word.id} word={word} pool={session.pool} mode={session.direction} onAnswered={next} />;
        })()
      ) : (
        (() => {
          const word = session.queue[session.index];
          return <TextInputQuiz key={word.id} word={word} mode={session.direction} onAnswered={next} />;
        })()
      )}
    </div>
  );
};

interface DoneStats { wrong: number; accuracyPct: number; seconds: number }

const Done = ({ icon, title, message, stats, onAgain, backLabel }: { icon: string; title: string; message?: string; stats?: DoneStats; onAgain: () => void; backLabel: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60svh] text-center px-2">
    <div className="text-6xl mb-5">{icon}</div>
    <h2 className="text-2xl font-bold tracking-tight mb-3">{title}</h2>
    {stats ? (
      <ResultsBar wrong={stats.wrong} accuracyPct={stats.accuracyPct} seconds={stats.seconds} />
    ) : message ? (
      <p className="text-[color:var(--color-muted)] mb-8 max-w-xs">{message}</p>
    ) : null}
    <div className="w-full max-w-xs mt-8">
      <Button onClick={onAgain} full>{backLabel}</Button>
    </div>
  </div>
);
