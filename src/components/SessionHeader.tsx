import type { ReactNode } from 'react';

interface Props {
  onExit: () => void;
  /** Center label, e.g. "3 / 8" or "Verbs · #2". */
  label?: string;
  /** Right-side action (e.g. help button). */
  right?: ReactNode;
  /** 0..1 progress fraction; renders a slim bar under the row. */
  progress?: number;
}

export const SessionHeader = ({ onExit, label, right, progress }: Props) => (
  <div className="mb-3">
    <div className="flex items-center justify-between gap-3">
      <button
        onClick={onExit}
        className="w-8 h-8 -ml-2 rounded-full text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg-soft)] flex items-center justify-center text-xl"
        aria-label="Exit"
      >×</button>
      {label !== undefined && (
        <span className="text-xs font-semibold tabular-nums text-[color:var(--color-muted)] truncate">{label}</span>
      )}
      <div className="-mr-2 min-w-[32px] flex justify-end">{right}</div>
    </div>
    {progress !== undefined && (
      <div className="mt-2 h-1 rounded-full bg-[color:var(--color-line)] overflow-hidden">
        <div
          className="h-full bg-[color:var(--color-brand)] transition-all duration-300"
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      </div>
    )}
  </div>
);
