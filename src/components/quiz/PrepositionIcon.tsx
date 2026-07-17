import type { ReactElement } from 'react';

const BOX = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5 } as const;
const DOT = { fill: 'currentColor', stroke: 'none' } as const;

const ICONS: Record<string, () => ReactElement> = {
  fi: () => (
    <>
      <rect x="5" y="9" width="14" height="11" rx="2" {...BOX} />
      <circle cx="12" cy="14.5" r="2.25" {...DOT} />
    </>
  ),
  '3ala': () => (
    <>
      <rect x="5" y="12" width="14" height="8" rx="2" {...BOX} />
      <circle cx="12" cy="10" r="2.25" {...DOT} />
    </>
  ),
  foog: () => (
    <>
      <rect x="5" y="14" width="14" height="6" rx="2" {...BOX} />
      <circle cx="12" cy="6.5" r="2.25" {...DOT} />
    </>
  ),
  ta7t: () => (
    <>
      <rect x="5" y="4" width="14" height="6" rx="2" {...BOX} />
      <circle cx="12" cy="17.5" r="2.25" {...DOT} />
    </>
  ),
  wara: () => (
    <>
      <circle cx="16.5" cy="11" r="2.25" {...DOT} />
      <rect x="4" y="10" width="12" height="10" rx="2" fill="var(--icon-bg, var(--color-surface-2))" stroke="currentColor" strokeWidth={1.5} />
    </>
  ),
  jeddaam: () => (
    <>
      <rect x="7" y="10" width="12" height="10" rx="2" {...BOX} />
      <circle cx="6" cy="15" r="2.25" {...DOT} />
    </>
  ),
  bayn: () => (
    <>
      <rect x="2" y="9" width="6" height="11" rx="1.5" {...BOX} />
      <rect x="16" y="9" width="6" height="11" rx="1.5" {...BOX} />
      <circle cx="12" cy="14.5" r="2.25" {...DOT} />
    </>
  ),
  ma3: () => (
    <>
      <circle cx="9.5" cy="13" r="3" {...DOT} />
      <circle cx="14.5" cy="13" r="3" {...DOT} />
    </>
  ),
  min: () => (
    <>
      <rect x="12" y="9" width="9" height="10" rx="2" {...BOX} />
      <path d="M11 14 H3 M6 10.5 L2.5 14 L6 17.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  ila: () => (
    <>
      <rect x="3" y="9" width="9" height="10" rx="2" {...BOX} />
      <path d="M13 14 H21 M18 10.5 L21.5 14 L18 17.5" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  '3ind': () => (
    <>
      <rect x="3" y="10" width="10" height="10" rx="2" {...BOX} />
      <circle cx="18.5" cy="15" r="2.25" {...DOT} />
    </>
  ),
  be: () => (
    <>
      <rect x="3" y="10" width="10" height="10" rx="2" {...BOX} />
      <circle cx="18.5" cy="15" r="2.25" {...DOT} />
    </>
  ),
  mal: () => (
    <path
      d="M4 5 H13 L20 12 L13 19 H4 Z M9 9 h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export const PrepositionIcon = ({ arabizi, className }: { arabizi: string; className?: string }) => {
  const Icon = ICONS[arabizi];
  if (!Icon) return null;
  return (
    <svg viewBox="0 0 24 24" className={className ?? 'w-6 h-6 shrink-0'} aria-hidden="true">
      <Icon />
    </svg>
  );
};
