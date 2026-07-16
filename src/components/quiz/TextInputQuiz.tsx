import { useState } from 'react';
import type { Word } from '@/types/word';
import { ArabicText } from '@/components/ArabicText';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useAppStore } from '@/store/useAppStore';
import { checkAnswer } from '@/services/validationService';
import { playFeedback } from '@/services/audioService';

type Mode = 'ar2en' | 'en2ar';

export const TextInputQuiz = ({ word, mode, onAnswered }: { word: Word; mode: Mode; onAnswered: (c: boolean) => void }) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<null | { correct: boolean }>(null);

  const expected = mode === 'ar2en' ? word.english : word.arabic;
  const altList = (mode === 'ar2en' ? word.alternatives?.english : word.alternatives?.arabic) ?? [];

  const submit = () => {
    if (submitted) return;
    const correct = checkAnswer(expected, value, mode === 'ar2en' ? 'english' : 'arabic', altList);
    setSubmitted({ correct });
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
        Type the {mode === 'ar2en' ? 'meaning in English' : 'word in Arabic'}
      </div>

      <input
        autoFocus
        dir={mode === 'en2ar' ? 'rtl' : 'ltr'}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        className={`w-full min-h-[60px] rounded-2xl border-2 bg-[color:var(--color-surface)] px-4 text-lg outline-none transition-colors ${
          mode === 'en2ar' ? 'ar text-right' : ''
        } ${
          submitted
            ? submitted.correct
              ? 'border-[color:var(--color-correct)] bg-[color:var(--color-correct-soft)]'
              : 'border-[color:var(--color-wrong)] bg-[color:var(--color-wrong-soft)]'
            : 'border-[color:var(--color-line)] focus:border-[color:var(--color-brand)]'
        }`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') (submitted ? onAnswered(submitted.correct) : submit()); }}
        placeholder={mode === 'en2ar' ? 'اكتب هنا' : 'Type here'}
      />

      {submitted && (
        <div className={`text-center text-sm font-semibold ${submitted.correct ? 'text-[color:var(--color-correct)]' : 'text-[color:var(--color-wrong)]'}`}>
          {submitted.correct ? '✓ Correct!' : `Answer: ${expected}`}
        </div>
      )}

      <Button full onClick={() => (submitted ? onAnswered(submitted.correct) : submit())} disabled={!submitted && !value.trim()}>
        {submitted ? 'Continue' : 'Check'}
      </Button>
    </div>
  );
};
