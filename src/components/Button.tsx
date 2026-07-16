import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'md' | 'sm';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

const styles: Record<Variant, string> = {
  primary:   'bg-[color:var(--color-brand)] text-white hover:bg-[color:var(--color-brand-strong)] shadow-[var(--shadow-button)]',
  secondary: 'bg-[color:var(--color-surface)] text-[color:var(--color-ink)] border border-[color:var(--color-line)] hover:bg-[color:var(--color-surface-2)]',
  ghost:     'bg-transparent text-[color:var(--color-muted)] hover:text-[color:var(--color-ink)]',
  danger:    'bg-[color:var(--color-wrong)] text-white hover:opacity-90',
};

const sizing: Record<Size, string> = {
  md: 'min-h-[52px] px-5 text-[15px]',
  sm: 'min-h-[40px] px-4 text-sm',
};

export const Button = ({ children, variant = 'primary', size = 'md', full, className = '', ...rest }: Props) => (
  <button
    {...rest}
    className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight active:scale-[0.985] transition-[transform,background-color,opacity] duration-150 disabled:opacity-50 disabled:active:scale-100 ${
      full ? 'w-full' : ''
    } ${sizing[size]} ${styles[variant]} ${className}`}
  >
    {children}
  </button>
);
