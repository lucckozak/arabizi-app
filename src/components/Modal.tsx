import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ open, onClose, title, children }: Props) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-[color:var(--color-overlay)] animate-[fadein_120ms_ease-out]" />
      <div
        className="relative bg-[color:var(--color-surface)] rounded-t-[28px] sm:rounded-[28px] w-full sm:max-w-lg max-h-[88svh] flex flex-col shadow-[var(--shadow-pop)] animate-[slideup_180ms_ease-out]"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2 sm:hidden">
          <span className="block w-10 h-1.5 rounded-full bg-[color:var(--color-line-strong)]" />
        </div>
        <header className="flex items-center justify-between px-5 pb-3 sm:pt-5 border-b border-[color:var(--color-line)]">
          <h2 className="text-[17px] font-bold tracking-tight">{title}</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 -mr-2 rounded-full text-[color:var(--color-muted)] hover:bg-[color:var(--color-bg-soft)] flex items-center justify-center text-2xl leading-none"
            aria-label="Close"
          >×</button>
        </header>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
      <style>{`
        @keyframes fadein { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideup { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};
