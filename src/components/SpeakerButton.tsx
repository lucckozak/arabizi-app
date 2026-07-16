import { useState } from 'react';
import { canPronounce, speakArabic } from '@/services/audioService';

interface Props {
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

/**
 * Circular speaker button — taps trigger device TTS for the given Arabic text.
 * Hidden entirely if the device has no Web Speech API support or no Arabic voice.
 */
export const SpeakerButton = ({ text, size = 'md', className = '' }: Props) => {
  const [speaking, setSpeaking] = useState(false);

  if (!canPronounce(text)) return null;

  const dim = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const iconDim = size === 'sm' ? 'w-4 h-4' : 'w-[18px] h-[18px]';

  const onClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!text.trim()) return;
    setSpeaking(true);
    speakArabic(text);
    // Visual feedback for ~the typical word duration; resetting on its own is fine
    // since the API itself doesn't reliably fire onend across browsers.
    window.setTimeout(() => setSpeaking(false), Math.max(700, text.length * 90));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Pronounce ${text}`}
      className={`inline-flex items-center justify-center rounded-full bg-[color:var(--color-bg-soft)] hover:bg-[color:var(--color-line)] active:scale-95 transition-all ${dim} ${
        speaking ? 'text-[color:var(--color-brand)] bg-[color:var(--color-brand-soft)]' : 'text-[color:var(--color-muted)]'
      } ${className}`}
    >
      <SpeakerIcon className={iconDim} />
    </button>
  );
};

const SpeakerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.7}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z" />
    <path d="M16 8.5a4 4 0 0 1 0 7" />
    <path d="M19 5.5a8 8 0 0 1 0 13" />
  </svg>
);
