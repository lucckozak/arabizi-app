import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArabicText } from '@/components/ArabicText';
import { SpeakerButton } from '@/components/SpeakerButton';
import { OPTION_STATE_CLASSES } from './optionStyles';
import { playFeedback, speakArabic } from '@/services/audioService';
import type { Sentence } from '@/types/sentence';
import { ALL_WORDS } from '@/data';
import { sample, shuffle } from '@/hooks/useShuffled';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  sentence: Sentence;
  onAnswered: (correct: boolean) => void;
}

interface OptionTriplet { arabic: string; arabizi: string; english: string; }

export const SentenceComplete = ({ sentence, onAnswered }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const [selected, setSelected] = useState<OptionTriplet | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;
    setSelected(null);
    setConfirmed(false);
  }, [sentence.id]);

  const options = useMemo<OptionTriplet[]>(() => {
    const distractors = sample(
      ALL_WORDS.filter((w) => w.category === sentence.distractorPool && w.arabic !== sentence.answer.arabic),
      3,
    ).map((w) => ({ arabic: w.arabic, arabizi: w.arabizi, english: w.english }));
    return shuffle([sentence.answer, ...distractors]);
  }, [sentence]);

  const isCorrect = selected ? selected.arabic === sentence.answer.arabic : false;

  const fire = (correct: boolean) => {
    if (firedRef.current) return;
    firedRef.current = true;
    onAnswered(correct);
  };

  const onPick = (opt: OptionTriplet) => {
    if (confirmed) return;
    setSelected(opt);
    speakArabic(opt.arabic);
  };

  const onConfirm = () => {
    if (confirmed || selected === null) return;
    const correct = selected.arabic === sentence.answer.arabic;
    setConfirmed(true);
    recordAnswer(sentence.id, 'ar2en', correct);
    playFeedback(correct);
  };

  const renderWithFill = (template: string, fill: string | null, kind: 'idle' | 'correct' | 'wrong') =>
    template.split(/(___+)/g).map((part, i) =>
      /^___+$/.test(part) ? (
        <span
          key={i}
          className={`inline-block min-w-[3.25rem] mx-1 px-2.5 py-0.5 rounded-md font-semibold ${
            fill
              ? kind === 'correct'
                ? 'bg-[color:var(--color-correct-soft)] text-[color:var(--color-correct)]'
                : 'bg-[color:var(--color-wrong-soft)] text-[color:var(--color-wrong)]'
              : 'border-b-2 border-dashed border-[color:var(--color-brand)] text-[color:var(--color-brand)] rounded-none px-1'
          }`}
        >
          {fill ?? '___'}
        </span>
      ) : (
        <span key={i}>{part}</span>
      ),
    );

  const fillKind: 'idle' | 'correct' | 'wrong' = confirmed ? (isCorrect ? 'correct' : 'wrong') : 'idle';
  // Arabic + arabizi previews show the user's pick so they can read it in context.
  const previewArabic = selected?.arabic ?? null;
  const previewArabizi = selected?.arabizi ?? null;
  // English preview is HIDDEN until confirmation. Otherwise the translation
  // of the picked word leaks the answer (e.g. picking "fi" auto-shows "in"
  // in the English line, which tells the user their choice is the right one).
  const previewEnglish = confirmed ? selected?.english ?? null : null;

  return (
    <div className="flex flex-col gap-3">
      <Card className="py-5">
        <div className="flex items-start justify-between gap-3 mb-1">
          <SpeakerButton
            text={selected
              ? sentence.arabic.replace(/___+/, selected.arabic)
              : sentence.arabic.replace(/___+/, '')}
            size="sm"
          />
          <p dir="rtl" className="ar text-[24px] leading-loose text-right flex-1">
            {renderWithFill(sentence.arabic, previewArabic, fillKind)}
          </p>
        </div>
        {showArabizi && (
          <p dir="ltr" className="text-xs text-[color:var(--color-muted)] mt-2 leading-relaxed">
            {renderWithFill(sentence.arabizi, previewArabizi, fillKind)}
          </p>
        )}
        <p dir="ltr" className="text-[14px] mt-2 text-[color:var(--color-ink)] leading-relaxed">
          {renderWithFill(sentence.english, previewEnglish, fillKind)}
        </p>
      </Card>

      {confirmed && !isCorrect && (
        <div className="rounded-2xl border-2 border-[color:var(--color-correct)] bg-[color:var(--color-correct-soft)] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-correct)] mb-1">Correct sentence</div>
          <p dir="rtl" className="ar text-[18px] text-right leading-snug">
            {sentence.arabic.replace(/___+/, sentence.answer.arabic)}
          </p>
          {showArabizi && (
            <p dir="ltr" className="text-xs text-[color:var(--color-muted)] mt-1">
              {sentence.arabizi.replace(/___+/, sentence.answer.arabizi)}
            </p>
          )}
          <p dir="ltr" className="text-xs mt-1">
            {sentence.english.replace(/___+/, sentence.answer.english)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-2">
        {options.map((opt) => {
          const isSelected = selected?.arabic === opt.arabic;
          let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';
          if (!selected) state = 'idle';
          else if (!confirmed) state = isSelected ? 'selected' : 'idle';
          else state = isSelected ? (opt.arabic === sentence.answer.arabic ? 'correct' : 'wrong') : 'dim';
          const stateClass = state === 'selected' ? SELECTED_CLASSES : OPTION_STATE_CLASSES[state];
          return (
            <button
              key={opt.arabic}
              onClick={() => onPick(opt)}
              disabled={confirmed}
              className={`min-h-[52px] rounded-xl border-2 px-3 py-2 text-left transition-all duration-150 ${stateClass}`}
            >
              <div className="flex items-center justify-between gap-3">
                <ArabicText arabic={opt.arabic} arabizi={opt.arabizi} showArabizi={showArabizi} size="md" noInteractive />
                {confirmed ? (
                  <span className={`text-xs font-semibold ${state === 'dim' ? 'text-[color:var(--color-muted)]' : 'opacity-95'}`}>
                    {opt.english}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {!confirmed ? (
        <Button onClick={onConfirm} full disabled={selected === null}>Confirm</Button>
      ) : (
        <Button onClick={() => fire(isCorrect)} full>Continue</Button>
      )}
    </div>
  );
};

const SELECTED_CLASSES = 'bg-[color:var(--color-accent-soft)] border-[color:var(--color-accent)] text-[color:var(--color-ink)]';
