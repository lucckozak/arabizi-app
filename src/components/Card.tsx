import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  /** Removes the default surface bg/border for tinted variants. */
  flat?: boolean;
  /** Shrinks padding for compact lists. */
  compact?: boolean;
}

export const Card = ({ children, className = '', flat = false, compact = false }: Props) => (
  <div
    className={`rounded-2xl ${
      flat ? '' : 'bg-[color:var(--color-surface)] border border-[color:var(--color-line)] shadow-[var(--shadow-card)]'
    } ${compact ? 'p-4' : 'p-5'} ${className}`}
  >
    {children}
  </div>
);
