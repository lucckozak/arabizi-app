import { useEffect, useMemo, useRef, useState } from 'react';
import type { Word } from '@/types/word';
import { ArabicText } from '@/components/ArabicText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { sample, shuffle } from '@/hooks/useShuffled';
import { useAppStore } from '@/store/useAppStore';
import { playFeedback, speakArabic } from '@/services/audioService';

import { OPTION_STATE_CLASSES } from './optionStyles';

type PromptMode = 'ar2en' | 'en2ar';

interface Props {
  word: Word;
  pool: Word[];
  mode: PromptMode;
  onAnswered: (correct: boolean) => void;
}

export const MultipleChoice = ({ word, pool, mode, onAnswered }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    setSelected(null);
    setConfirmed(false);
  }, [word.id]);

  const options = useMemo(() => {
    const distractors = sample(pool.filter((p) => p.id !== word.id), 3);
    return shuffle([word, ...distractors]);
  }, [word, pool]);

  const correctValue = mode === 'ar2en' ? word.english : word.arabic;
  const isCorrect = selected === correctValue;

  const fire = (correct: boolean) => {
    if (firedRef.current) return;
    firedRef.current = true;
    onAnswered(correct);
  };

  const onPick = (value: string, opt: Word) => {
    if (confirmed) return;
    setSelected(value);
    // For en2ar mode the option *is* the Arabic word — speak it.
    // For ar2en the option is English; the prompt's Arabic was already audible.
    if (mode === 'en2ar') speakArabic(opt.arabic);
  };

  const onConfirm = () => {
    if (confirmed || selected === null) return;
    const correct = selected === correctValue;
    setConfirmed(true);
    recordAnswer(word.id, mode, correct);
    playFeedback(correct);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="py-6">
        {mode === 'ar2en' ? (
          <ArabicText arabic={word.arabic} arabizi={word.arabizi} showArabizi={showArabizi} size="xl" center speak />
        ) : (
          <div className="text-[24px] font-bold leading-tight tracking-tight text-center">{word.english}</div>
        )}
      </Card>

      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] text-center -mb-1">
        Choose the {mode === 'ar2en' ? 'meaning' : 'word'}
      </div>

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt, i) => {
          const value = mode === 'ar2en' ? opt.english : opt.arabic;
          const isSelected = selected === value;
          let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';
          if (!selected) state = 'idle';
          else if (!confirmed) state = isSelected ? 'selected' : 'idle';
          else state = isSelected ? (value === correctValue ? 'correct' : 'wrong') : 'dim';
          const stateClass = state === 'selected' ? SELECTED_CLASSES : OPTION_STATE_CLASSES[state];
          return (
            <button
              key={opt.id}
              onClick={() => onPick(value, opt)}
              disabled={confirmed}
              className={`min-h-[52px] rounded-xl border-2 px-3 py-2.5 text-left flex items-center gap-3 transition-all duration-150 ${stateClass}`}
            >
              <span className={`w-7 h-7 flex-shrink-0 rounded-full border-2 flex items-center justify-center text-[11px] font-bold tabular-nums ${
                state === 'correct'
                  ? 'border-[color:var(--color-correct)] bg-[color:var(--color-correct)] text-white'
                  : state === 'wrong'
                    ? 'border-[color:var(--color-wrong)] bg-[color:var(--color-wrong)] text-white'
                    : state === 'selected'
                      ? 'border-[color:var(--color-accent)] bg-[color:var(--color-accent)] text-white'
                      : 'border-[color:var(--color-line-strong)] text-[color:var(--color-muted)]'
              }`}>
                {state === 'correct' ? '✓' : state === 'wrong' ? '✗' : String.fromCharCode(65 + i)}
              </span>
              {mode === 'ar2en' ? (
                <span className="text-[15px] font-medium flex-1">{value}</span>
              ) : (
                <ArabicText arabic={opt.arabic} arabizi={opt.arabizi} showArabizi={showArabizi} size="md" noInteractive />
              )}
            </button>
          );
        })}
      </div>

      {confirmed && (
        <div className={`text-center text-sm font-semibold mt-1 ${isCorrect ? 'text-[color:var(--color-correct)]' : 'text-[color:var(--color-wrong)]'}`}>
          {isCorrect ? 'Correct!' : `Answer: ${correctValue}`}
        </div>
      )}

      {!confirmed ? (
        <Button onClick={onConfirm} full disabled={selected === null}>Confirm</Button>
      ) : (
        <Button onClick={() => fire(isCorrect)} full>Continue</Button>
      )}
    </div>
  );
};

const SELECTED_CLASSES = 'bg-[color:var(--color-accent-soft)] border-[color:var(--color-accent)] text-[color:var(--color-ink)]';
