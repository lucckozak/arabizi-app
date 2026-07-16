import { SpeakerButton } from './SpeakerButton';
import { useAppStore } from '@/store/useAppStore';
import { canPronounce, speakArabic } from '@/services/audioService';

interface Props {
  arabic: string;
  arabizi?: string;
  showArabizi?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  /** Centers content (used in prompt cards). */
  center?: boolean;
  /** Show a speaker button next to the Arabic text. */
  speak?: boolean;
  /**
   * Disable the inline tap-to-pronounce handler. Use this when ArabicText is
   * nested inside another interactive element (e.g. an option button) — the
   * outer element should own the tap.
   */
  noInteractive?: boolean;
}

const SIZE: Record<NonNullable<Props['size']>, string> = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-[30px]',
  xl: 'text-[36px]',
  '2xl': 'text-[44px]',
};

export const ArabicText = ({ arabic, arabizi, showArabizi, size = 'lg', className = '', center = false, speak = false, noInteractive = false }: Props) => {
  const tapToPronounce = useAppStore((s) => s.settings.tapToPronounce);
  const interactive = !noInteractive && tapToPronounce && canPronounce(arabic);

  const onTap = (e: React.MouseEvent) => {
    if (!interactive) return;
    e.stopPropagation();
    speakArabic(arabic);
  };

  const ArabicEl = (
    <div
      dir="rtl"
      onClick={onTap}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? `Pronounce ${arabic}` : undefined}
      className={`ar font-semibold leading-tight tracking-tight text-[color:var(--color-ink)] ${SIZE[size]} ${
        interactive ? 'cursor-pointer select-none active:opacity-70 transition-opacity' : ''
      }`}
    >
      {arabic}
    </div>
  );

  return (
    <div className={`flex flex-col ${center ? 'items-center' : 'items-end'} gap-1 w-full ${className}`}>
      <div className={`flex items-center gap-2 ${center ? 'justify-center' : 'justify-end'} w-full`}>
        {speak && <SpeakerButton text={arabic} size={size === 'sm' || size === 'md' ? 'sm' : 'md'} />}
        {ArabicEl}
      </div>
      {showArabizi && arabizi ? (
        <div dir="ltr" className="text-xs text-[color:var(--color-muted)] tracking-wide font-medium">
          {arabizi}
        </div>
      ) : null}
    </div>
  );
};
