/**
 * Shared visual states for any option-style button across MCQ / Sentence / Transformations.
 *
 * - Idle: white surface + line border. Explicitly NOT tinted so it can never be
 *   mistaken for a pre-selection.
 * - Correct / Wrong: only applied to the option the user actually picked.
 * - Dim: any non-picked option after a pick — fades to ~40% opacity.
 */
export const OPTION_STATE_CLASSES = {
  idle:    'bg-[color:var(--color-surface)] border-[color:var(--color-line-strong)] hover:bg-[color:var(--color-surface-2)] active:scale-[0.99]',
  correct: 'bg-[color:var(--color-correct-soft)] border-[color:var(--color-correct)] text-[color:var(--color-correct)]',
  wrong:   'bg-[color:var(--color-wrong-soft)] border-[color:var(--color-wrong)] text-[color:var(--color-wrong)]',
  dim:     'bg-[color:var(--color-surface)] border-[color:var(--color-line)] opacity-40',
} as const;

export type OptionState = keyof typeof OPTION_STATE_CLASSES;
