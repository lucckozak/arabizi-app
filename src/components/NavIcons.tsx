/**
 * Bottom-nav icons — minimalist line-art, monochrome via currentColor.
 * 24x24 viewBox, 1.7 stroke, round joins. Designed to read at 22-26px display size.
 */

interface IconProps { className?: string }

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/** Open book — vocabulary / words to study. */
export const VocabularyIcon = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M12 6.5v13" />
    <path d="M3.5 5.5h5a3.5 3.5 0 0 1 3.5 3.5v10a2.5 2.5 0 0 0-2.5-2.5h-6V5.5z" />
    <path d="M20.5 5.5h-5A3.5 3.5 0 0 0 12 9v10a2.5 2.5 0 0 1 2.5-2.5h6V5.5z" />
  </svg>
);

/** Speech bubble with two text lines — grammar / how the language is built. */
export const GrammarIcon = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M4 11.5C4 7.36 7.58 4 12 4s8 3.36 8 7.5-3.58 7.5-8 7.5c-.94 0-1.85-.15-2.69-.43L5 20.5l1-3.55A7.18 7.18 0 0 1 4 11.5z" />
    <path d="M9 11h6" />
    <path d="M9 14h4" />
  </svg>
);

/** Circular refresh arrow — review / spaced repetition. */
export const ReviewIcon = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M3.5 12a8.5 8.5 0 0 1 14.6-5.95L20 8" />
    <path d="M20 3.5V8h-4.5" />
    <path d="M20.5 12a8.5 8.5 0 0 1-14.6 5.95L4 16" />
    <path d="M4 20.5V16h4.5" />
  </svg>
);

/** Settings gear — preferences. Six-spoke minimalist. */
export const SettingsIcon = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4L5.3 5.3" />
  </svg>
);

/** Winding checkpoint path — classes / the daily course road. */
export const ClassesIcon = ({ className }: IconProps) => (
  <svg {...baseProps} className={className}>
    <path d="M5.5 20C5.5 20 5.5 13 9 13s3.5-6 7-6 3.5 7 3.5 7" />
    <circle cx="5.5" cy="20" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="1.8" fill="currentColor" stroke="none" />
    <circle cx="19.5" cy="15" r="1.8" fill="currentColor" stroke="none" />
  </svg>
);

/** @deprecated Use SettingsIcon. Kept temporarily for any external imports. */
export const YouIcon = SettingsIcon;
