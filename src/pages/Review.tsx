import { useMemo, useState } from 'react';
import { SessionHeader } from '@/components/SessionHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { useAppStore } from '@/store/useAppStore';
import { ALL_WORDS } from '@/data';
import { isDue } from '@/services/srsService';
import { MultipleChoice } from '@/components/quiz/MultipleChoice';
import { MasteryTiles } from '@/components/MasteryTiles';
import { ResultsBar } from '@/components/ResultsBar';
import { ArabicText } from '@/components/ArabicText';
import { shuffle } from '@/hooks/useShuffled';
import type { Word } from '@/types/word';
import type { Direction, CardState } from '@/types/progress';

interface QueueItem { word: Word; direction: Direction }

const WEAK_LIMIT = 12;
const WEAK_SESSION_LEN = 8;

const computeDueQueue = (
  cards: Record<string, CardState>,
  wordsById: Map<string, Word>,
): QueueItem[] => {
  const items: QueueItem[] = [];
  for (const c of Object.values(cards)) {
    if (!isDue(c)) continue;
    const w = wordsById.get(c.id);
    if (w) items.push({ word: w, direction: c.direction });
  }
  return shuffle(items);
};

interface WeakItem { card: CardState; word: Word; netWrong: number; }

/**
 * A card is a "weak spot" while it has been answered wrong AT LEAST AS OFTEN
 * as it has been answered right. As soon as the user gets it right one more
 * time than they've gotten it wrong, it leaves the list.
 *
 * Sorted strictly by raw incorrect count, descending — the most-failed words
 * float to the top so the list reads as a true priority queue.
 */
const computeWeakItems = (
  cards: Record<string, CardState>,
  wordsById: Map<string, Word>,
): WeakItem[] => {
  const items: WeakItem[] = [];
  for (const c of Object.values(cards)) {
    if (c.incorrect === 0) continue;          // never wrong → never weak
    if (c.correct > c.incorrect) continue;    // more rights than wrongs → leaves the list
    const w = wordsById.get(c.id);
    if (!w) continue;
    const netWrong = c.incorrect - c.correct;
    items.push({ card: c, word: w, netWrong });
  }
  // Primary sort: most wrongs first. Tiebreaker: bigger gap (more wrongs over rights).
  items.sort((a, b) => b.card.incorrect - a.card.incorrect || b.netWrong - a.netWrong);
  return items;
};

type Mode = 'due' | 'weak';

export const Review = () => {
  const cards = useAppStore((s) => s.progress.cards);
  const wordsById = useMemo(() => new Map(ALL_WORDS.map((w) => [w.id, w])), []);

  const liveDueCount = useMemo(
    () => Object.values(cards).filter((c) => isDue(c)).length,
    [cards],
  );

  const weakItems = useMemo(() => computeWeakItems(cards, wordsById), [cards, wordsById]);

  const [sessionQueue, setSessionQueue] = useState<QueueItem[] | null>(null);
  const [sessionMode, setSessionMode] = useState<Mode>('due');
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });
  const [startedAt, setStartedAt] = useState(0);

  const startDueReview = () => {
    setSessionQueue(computeDueQueue(cards, wordsById));
    setSessionMode('due');
    setIndex(0);
    setResults({ correct: 0, wrong: 0 });
    setStartedAt(Date.now());
  };

  const startWeakReview = () => {
    const queue = weakItems
      .slice(0, WEAK_SESSION_LEN)
      .map(({ word, card }) => ({ word, direction: card.direction }));
    setSessionQueue(shuffle(queue));
    setSessionMode('weak');
    setIndex(0);
    setResults({ correct: 0, wrong: 0 });
    setStartedAt(Date.now());
  };

  const exit = () => {
    setSessionQueue(null);
    setIndex(0);
    setResults({ correct: 0, wrong: 0 });
  };

  // Entry / overview screen
  if (sessionQueue === null) {
    return (
      <div>
        <ReviewBox dueCount={liveDueCount} onStart={startDueReview} />
        <WeakSpotsSection items={weakItems} onStart={startWeakReview} />
      </div>
    );
  }

  // Active session
  if (index >= sessionQueue.length) {
    const total = sessionQueue.length;
    const accuracyPct = total === 0 ? 100 : Math.round((results.correct / total) * 100);
    const seconds = Math.round((Date.now() - startedAt) / 1000);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60svh] text-center px-2">
        <div className="text-6xl mb-5">{sessionMode === 'weak' ? '💪' : '✅'}</div>
        <h2 className="text-2xl font-bold tracking-tight mb-3">
          {sessionMode === 'weak' ? 'Weak spots done' : 'Review complete'}
        </h2>
        <ResultsBar wrong={results.wrong} accuracyPct={accuracyPct} seconds={seconds} />
        <div className="w-full max-w-xs mt-8">
          <Button onClick={exit} full>Done</Button>
        </div>
      </div>
    );
  }

  const cur = sessionQueue[index];
  return (
    <div>
      <SessionHeader
        onExit={exit}
        label={`${index + 1} / ${sessionQueue.length}${sessionMode === 'weak' ? ' · weak spots' : ''}`}
        progress={index / sessionQueue.length}
      />
      <MultipleChoice
        key={`${cur.word.id}:${cur.direction}:${index}`}
        word={cur.word}
        pool={ALL_WORDS}
        mode={cur.direction}
        onAnswered={(c) => {
          setResults((r) => ({ correct: r.correct + (c ? 1 : 0), wrong: r.wrong + (c ? 0 : 1) }));
          setIndex((i) => i + 1);
        }}
      />
    </div>
  );
};

const SectionHeader = ({ label, onInfo }: { label: string; onInfo?: () => void }) => (
  <div className="flex items-center justify-between mb-2 px-1">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)]">
      {label}
    </p>
    {onInfo && <InfoButton onClick={onInfo} label={`About ${label.toLowerCase()}`} />}
  </div>
);

const InfoButton = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    className="w-7 h-7 -my-1 -mr-1 rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)] text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)] flex items-center justify-center text-[11px] font-bold leading-none active:scale-95 transition-all"
  >?</button>
);

const ReviewBox = ({ dueCount, onStart }: { dueCount: number; onStart: () => void }) => {
  const [info, setInfo] = useState(false);
  return (
    <section className="mb-5">
      <SectionHeader label="What gets reviewed" onInfo={() => setInfo(true)} />
      <Card>
        <MasteryTiles />
        <div className="mt-4 pt-4 border-t border-[color:var(--color-line)]">
          {dueCount === 0 ? (
            <div className="text-center py-2">
              <div className="text-3xl mb-2">✨</div>
              <p className="text-sm font-semibold mb-1">All caught up</p>
              <p className="text-xs text-[color:var(--color-muted)] max-w-xs mx-auto">
                No cards due right now. Practice in Vocabulary or Grammar to schedule your next reviews.
              </p>
            </div>
          ) : (
            <Button full onClick={onStart}>Start review · {dueCount}</Button>
          )}
        </div>
      </Card>

      <Modal open={info} onClose={() => setInfo(false)} title="What's in Review?">
        <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-soft)] mb-3">
          Words you've already learned, shown again to help you remember them long-term.
        </p>
        <ul className="space-y-2 text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]">
          <li><span className="text-[color:var(--color-correct)] font-semibold mr-1">✓</span>Correct answers → shown less often</li>
          <li><span className="text-[color:var(--color-wrong)] font-semibold mr-1">✗</span>Wrong answers → shown again sooner</li>
          <li><span className="text-[color:var(--color-muted)] mr-1">·</span>Only due items appear here</li>
          <li><span className="text-[color:var(--color-muted)] mr-1">·</span>Multiple choice for quick practice</li>
        </ul>
      </Modal>
    </section>
  );
};

const WeakSpotsSection = ({ items, onStart }: { items: WeakItem[]; onStart: () => void }) => {
  const [open, setOpen] = useState(false);
  const [info, setInfo] = useState(false);
  if (items.length === 0) return null;
  const preview = items.slice(0, WEAK_LIMIT);
  const sessionSize = Math.min(items.length, WEAK_SESSION_LEN);

  return (
    <section className="mb-5">
      <SectionHeader label="My weak spots" onInfo={() => setInfo(true)} />
      <div
        className={`rounded-2xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] shadow-[var(--shadow-card)] overflow-hidden transition-shadow ${open ? 'shadow-[var(--shadow-pop)]' : ''}`}
      >
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-wrong-soft)] flex items-center justify-center text-2xl flex-shrink-0">
            💪
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold tabular-nums tracking-tight leading-none text-[color:var(--color-wrong)]">{items.length}</span>
              <span className="text-sm font-semibold text-[color:var(--color-ink-soft)]">weak spot{items.length === 1 ? '' : 's'}</span>
            </div>
            <div className="text-xs text-[color:var(--color-muted)] mt-1">Words you've missed more than you've nailed.</div>
          </div>
        </div>

        <div className="px-5 pb-4 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            full
          >
            <span>{open ? 'Hide list' : 'Show list'}</span>
            <span className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden="true">⌃</span>
          </Button>
          <Button size="sm" onClick={onStart} full>
            💪 Practice {sessionSize}
          </Button>
        </div>

        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="px-5 pt-1 pb-4 border-t border-[color:var(--color-line)]">
              <ul className="divide-y divide-[color:var(--color-line)]">
                {preview.map(({ word, card }) => (
                  <li key={`${word.id}:${card.direction}`} className="py-2.5 grid grid-cols-[1fr_auto_auto] gap-3 items-center">
                    <div className="min-w-0">
                      <div className="text-sm font-medium leading-tight truncate">{word.english}</div>
                      <div className="text-xs text-[color:var(--color-muted)] mt-0.5 truncate">{word.arabizi}</div>
                    </div>
                    <ArabicText arabic={word.arabic} arabizi="" size="sm" />
                    <span
                      className="text-[10px] font-semibold tabular-nums px-2 py-1 rounded-full bg-[color:var(--color-wrong-soft)]"
                      title={`Answered correctly ${card.correct} time${card.correct === 1 ? '' : 's'}, wrong ${card.incorrect} time${card.incorrect === 1 ? '' : 's'}`}
                    >
                      <span className="text-[color:var(--color-correct)]">✓ {card.correct}</span>
                      <span className="text-[color:var(--color-muted)] mx-1">·</span>
                      <span className="text-[color:var(--color-wrong)]">✗ {card.incorrect}</span>
                    </span>
                  </li>
                ))}
              </ul>
              {items.length > WEAK_LIMIT && (
                <p className="text-[11px] text-[color:var(--color-muted)] text-center mt-3">
                  + {items.length - WEAK_LIMIT} more
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal open={info} onClose={() => setInfo(false)} title="My weak spots">
        <p className="text-[14px] leading-relaxed text-[color:var(--color-ink-soft)] mb-3">
          A focused list of vocabulary giving you the most trouble — your priority queue for extra practice.
        </p>
        <div className="space-y-3 text-[14px] leading-relaxed text-[color:var(--color-ink-soft)]">
          <div>
            <p className="font-semibold text-[color:var(--color-ink)] mb-1">Why a word appears here</p>
            <p>You've gotten it wrong at least as often as you've gotten it right.</p>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--color-ink)] mb-1">What the badge means</p>
            <p>
              <span className="text-[color:var(--color-correct)] font-semibold">✓ N</span> = times answered correctly ·
              <span className="text-[color:var(--color-wrong)] font-semibold ml-1">✗ N</span> = times answered wrong.
              The list is sorted by most wrongs first, so the toughest words sit at the top.
            </p>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--color-ink)] mb-1">What keeps it on the list</p>
            <p>The word stays as long as your wrong attempts are equal to or greater than your right attempts.</p>
          </div>
          <div>
            <p className="font-semibold text-[color:var(--color-ink)] mb-1">How a word leaves</p>
            <p>The moment your right answers outnumber your wrongs, it drops off — automatically, no manual reset.</p>
          </div>
        </div>
      </Modal>
    </section>
  );
};
