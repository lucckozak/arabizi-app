import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  /** Optional small eyebrow above the title (e.g. "Lesson 3"). */
  eyebrow?: string;
}

export const PageHeader = ({ title, subtitle, right, eyebrow }: Props) => (
  <header className="flex items-start justify-between gap-3 mb-6">
    <div className="min-w-0 flex-1">
      {eyebrow && (
        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)] mb-1">
          {eyebrow}
        </div>
      )}
      <h1 className="text-[28px] leading-[1.1] font-bold tracking-tight text-[color:var(--color-ink)]">{title}</h1>
      {subtitle && <p className="text-sm text-[color:var(--color-muted)] mt-1.5 leading-snug">{subtitle}</p>}
    </div>
    {right && <div className="flex-shrink-0">{right}</div>}
  </header>
);
