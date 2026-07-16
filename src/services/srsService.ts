import type { CardState, Direction } from '@/types/progress';

/** Days for buckets 1..5. Bucket 0 = same day (10 min). */
const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30];
const MASTERED_BUCKET = 5;

const DAY_MS = 24 * 60 * 60 * 1000;

export const cardKey = (id: string, direction: Direction): string => `${id}:${direction}`;

export const newCard = (id: string, direction: Direction): CardState => ({
  id,
  direction,
  bucket: 0,
  due: Date.now(),
  correct: 0,
  incorrect: 0,
  lastSeen: 0,
});

export const review = (card: CardState, wasCorrect: boolean): CardState => {
  const bucket = wasCorrect ? Math.min(card.bucket + 1, MASTERED_BUCKET) : 0;
  const intervalDays = INTERVAL_DAYS[bucket];
  const due = bucket === 0
    ? Date.now() + 10 * 60 * 1000
    : Date.now() + intervalDays * DAY_MS;
  return {
    ...card,
    bucket,
    due,
    lastSeen: Date.now(),
    correct: card.correct + (wasCorrect ? 1 : 0),
    incorrect: card.incorrect + (wasCorrect ? 0 : 1),
  };
};

export const isDue = (card: CardState, now: number = Date.now()): boolean => card.due <= now;

export const isMastered = (card: CardState): boolean => card.bucket >= MASTERED_BUCKET;

export const dueCount = (cards: Record<string, CardState>, now: number = Date.now()): number =>
  Object.values(cards).filter((c) => isDue(c, now)).length;
