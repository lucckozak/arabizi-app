import type { GrammarStats, GrammarTopicId, GrammarTopicStats } from '@/types/progress';

/**
 * Number of CORRECT answers required to reach 100% mastery for each topic.
 * Wrong answers don't subtract — they just delay you. This makes grammar
 * mastery feel earned and slower than vocabulary "learned" (which only
 * needs one correct answer).
 *
 * Targets are calibrated to roughly: ~5 of every persona for verbs (8 personas
 * × 5 = 40), ~4 of every owner suffix (8 × 4 = 32), and ~3 reps over the
 * preposition sentence pool (~24).
 */
export const MASTERY_TARGET: Record<GrammarTopicId, number> = {
  verb: 40,
  verbPast: 40,
  owner: 32,
  prep: 24,
};

export type GrammarLevel = 'New' | 'Beginner' | 'Intermediate' | 'Advanced';

export interface GrammarProgress {
  topic: GrammarTopicId;
  total: number;
  correct: number;
  pct: number;       // 0..100
  level: GrammarLevel;
  accuracy: number;  // 0..100
  target: number;
}

const levelFor = (pct: number): GrammarLevel => {
  if (pct === 0) return 'New';
  if (pct < 40) return 'Beginner';
  if (pct < 80) return 'Intermediate';
  return 'Advanced';
};

export const computeGrammarProgress = (topic: GrammarTopicId, s: GrammarTopicStats | undefined): GrammarProgress => {
  const stats = s ?? { total: 0, correct: 0 };
  const target = MASTERY_TARGET[topic];
  const pct = Math.min(100, Math.round((stats.correct / target) * 100));
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  return {
    topic,
    total: stats.total,
    correct: stats.correct,
    pct,
    level: levelFor(pct),
    accuracy,
    target,
  };
};

export const computeAllGrammarProgress = (g: GrammarStats): Record<GrammarTopicId, GrammarProgress> => ({
  verb:     computeGrammarProgress('verb',     g.verb),
  verbPast: computeGrammarProgress('verbPast', g.verbPast),
  owner:    computeGrammarProgress('owner',    g.owner),
  prep:     computeGrammarProgress('prep',     g.prep),
});
