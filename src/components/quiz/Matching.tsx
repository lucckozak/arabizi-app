import { useEffect, useMemo, useRef, useState } from 'react';
import type { Word } from '@/types/word';
import { ArabicText } from '@/components/ArabicText';
import { Button } from '@/components/Button';
import { shuffle } from '@/hooks/useShuffled';
import { useAppStore } from '@/store/useAppStore';
import { playFeedback } from '@/services/audioService';

interface Props {
  pairs: Word[];
  onDone: (stats: { correctPairs: number; total: number; seconds: number; wrongAttempts: number }) => void;
}

type Side = 'L' | 'R';

export const Matching = ({ pairs, onDone }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);

  const left = useMemo(() => shuffle(pairs), [pairs]);
  const right = useMemo(() => shuffle(pairs), [pairs]);

  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrongFlash, setWrongFlash] = useState<{ side: Side; id: string } | null>(null);
  const [selected, setSelected] = useState<{ side: Side; id: string } | null>(null);
  const [startedAt] = useState(Date.now());
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    if (matched.size === pairs.length) {
      firedRef.current = true;
      onDone({
        correctPairs: matched.size,
        total: pairs.length,
        seconds: Math.round((Date.now() - startedAt) / 1000),
        wrongAttempts,
      });
    }
  }, [matched, pairs.length, onDone, startedAt, wrongAttempts]);

  const tap = (side: Side, id: string) => {
    if (matched.has(id)) return;
    if (!selected) { setSelected({ side, id }); return; }
    if (selected.side === side) { setSelected({ side, id }); return; }
    if (selected.id === id) {
      setMatched((m) => new Set(m).add(id));
      recordAnswer(id, 'ar2en', true);
      playFeedback(true);
      setSelected(null);
    } else {
      const wrongId = side === 'R' ? id : selected.id;
      recordAnswer(wrongId, 'ar2en', false);
      playFeedback(false);
      setWrongFlash({ side, id });
      setWrongAttempts((n) => n + 1);
      setTimeout(() => setWrongFlash(null), 350);
      setSelected(null);
    }
  };

  const cellClass = (side: Side, id: string) => {
    if (matched.has(id)) return 'bg-[color:var(--color-correct-soft)] border-[color:var(--color-correct)] text-[color:var(--color-correct)]';
    if (selected && selected.side === side && selected.id === id) return 'bg-[color:var(--color-accent-soft)] border-[color:var(--color-accent)] text-[color:var(--color-ink)]';
    if (wrongFlash && wrongFlash.side === side && wrongFlash.id === id) return 'bg-[color:var(--color-wrong-soft)] border-[color:var(--color-wrong)] text-[color:var(--color-wrong)]';
    return 'bg-[color:var(--color-surface)] border-[color:var(--color-line)]';
  };

  const progress = matched.size / pairs.length;

  return (
    <div>
      <div className="h-1.5 rounded-full bg-[color:var(--color-line)] overflow-hidden mb-4">
        <div className="h-full bg-[color:var(--color-brand)] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] text-center mb-4">
        Tap a word, then its meaning
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        <div className="flex flex-col gap-2.5">
          {left.map((w) => (
            <button
              key={w.id}
              onClick={() => tap('L', w.id)}
              disabled={matched.has(w.id)}
              className={`min-h-[64px] rounded-2xl border-2 p-3 transition-all duration-150 active:scale-[0.99] disabled:cursor-default ${cellClass('L', w.id)}`}
            >
              <ArabicText arabic={w.arabic} arabizi={w.arabizi} showArabizi={showArabizi} size="md" />
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-2.5">
          {right.map((w) => (
            <button
              key={w.id}
              onClick={() => tap('R', w.id)}
              disabled={matched.has(w.id)}
              className={`min-h-[64px] rounded-2xl border-2 p-3 text-left transition-all duration-150 active:scale-[0.99] disabled:cursor-default ${cellClass('R', w.id)}`}
            >
              <span className="text-[15px] font-medium">{w.english}</span>
            </button>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        full
        className="mt-6"
        onClick={() => {
          if (firedRef.current) return;
          firedRef.current = true;
          onDone({
            correctPairs: matched.size,
            total: pairs.length,
            seconds: Math.round((Date.now() - startedAt) / 1000),
            wrongAttempts,
          });
        }}
      >
        Skip
      </Button>
    </div>
  );
};
