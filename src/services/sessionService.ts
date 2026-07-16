import { cardKey } from './srsService';
import type { CardState, Direction } from '@/types/progress';
import type { Word } from '@/types/word';

interface Identifiable { id: string; }

const HOUR = 3600000;

/**
 * Module-level memory of recent session picks per session key.
 * Each entry holds up to RECENT_HISTORY_LIMIT past sessions; their union is treated
 * as "recent" so back-to-back restarts surface fresh content for several rounds before
 * any item recurs. Resets on page reload.
 */
const recentByKey: Record<string, string[][]> = {};
const RECENT_HISTORY_LIMIT = 5;
const RECENT_PENALTY = 1e15;

const recordRecent = (sessionKey: string, ids: string[]): void => {
  const history = recentByKey[sessionKey] ?? [];
  recentByKey[sessionKey] = [...history, ids].slice(-RECENT_HISTORY_LIMIT);
};

/** Most-recently-picked ids first, deduped across the remembered session history. */
const getRecentOrdered = (sessionKey: string): string[] => {
  const history = recentByKey[sessionKey] ?? [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = history.length - 1; i >= 0; i--) {
    for (const id of history[i]) {
      if (!seen.has(id)) { seen.add(id); out.push(id); }
    }
  }
  return out;
};

/**
 * Excluding every recently-seen id can leave fewer than `n` fresh candidates
 * for small pools (e.g. a 14-word category with an 8-word session) — the
 * caller still needs `n` items, so it would be forced to reuse *some* recent
 * id anyway. Capping the exclusion set at `pool.length - n` guarantees we
 * only ever reuse a word when there's truly no fresh one left, and — since
 * `getRecentOrdered` is most-recent-first — we keep excluding the
 * newest picks and let the oldest "recent" ones resurface first.
 */
const boundedRecent = (sessionKey: string | undefined, poolSize: number, n: number): Set<string> => {
  if (!sessionKey) return new Set();
  const maxExcludable = Math.max(0, poolSize - n);
  return new Set(getRecentOrdered(sessionKey).slice(0, maxExcludable));
};

/**
 * Pick `n` items from `pool`, biased toward least-recently-seen first, with random jitter.
 * Items in any of the previous `RECENT_HISTORY_LIMIT` sessions for the same `sessionKey`
 * are pushed to the bottom — so over multiple consecutive sessions the user is exposed
 * to the entire pool before any item repeats.
 */
export const pickFreshSlice = <T extends Identifiable>(
  pool: T[],
  n: number,
  cards: Record<string, CardState>,
  direction: Direction,
  options: { sessionKey?: string; jitterHours?: number; bothDirections?: boolean } = {},
): T[] => {
  const { sessionKey, jitterHours = 6, bothDirections = false } = options;
  const jitterMs = jitterHours * HOUR;
  const recent = boundedRecent(sessionKey, pool.length, n);

  const lastSeenOf = (item: T): number => {
    if (bothDirections) {
      return Math.max(
        cards[cardKey(item.id, 'ar2en')]?.lastSeen ?? 0,
        cards[cardKey(item.id, 'en2ar')]?.lastSeen ?? 0,
      );
    }
    return cards[cardKey(item.id, direction)]?.lastSeen ?? 0;
  };

  const scored = pool.map((item) => {
    const ls = lastSeenOf(item);
    const recentPenalty = recent.has(item.id) ? RECENT_PENALTY : 0;
    const jitter = (Math.random() * 2 - 1) * jitterMs;
    return { item, score: ls + recentPenalty + jitter };
  });
  scored.sort((a, b) => a.score - b.score);
  const picked = scored.slice(0, Math.min(n, scored.length)).map((s) => s.item);

  if (sessionKey) recordRecent(sessionKey, picked.map((p) => p.id));
  return picked;
};

/**
 * Same idea for items keyed by a custom prefix (sentences, dialogues — recorded under
 * synthetic ids like `s.xxx` or `d.xxx.b1`).
 */
export const pickFreshSliceByKey = <T extends Identifiable>(
  pool: T[],
  n: number,
  cards: Record<string, CardState>,
  keyOf: (item: T) => string,
  options: { sessionKey?: string; jitterHours?: number } = {},
): T[] => {
  const { sessionKey, jitterHours = 6 } = options;
  const jitterMs = jitterHours * HOUR;
  const recent = boundedRecent(sessionKey, pool.length, n);

  const scored = pool.map((item) => {
    const matchingKeys = Object.keys(cards).filter((k) => k.startsWith(keyOf(item)));
    const lastSeen = matchingKeys.reduce((m, k) => Math.max(m, cards[k]?.lastSeen ?? 0), 0);
    const recentPenalty = recent.has(item.id) ? RECENT_PENALTY : 0;
    const jitter = (Math.random() * 2 - 1) * jitterMs;
    return { item, score: lastSeen + recentPenalty + jitter };
  });
  scored.sort((a, b) => a.score - b.score);
  const picked = scored.slice(0, Math.min(n, scored.length)).map((s) => s.item);

  if (sessionKey) recordRecent(sessionKey, picked.map((p) => p.id));
  return picked;
};

export const filterWordsByCategory = (words: Word[], category: string): Word[] =>
  category === 'all' ? words : words.filter((w) => w.category === category);
