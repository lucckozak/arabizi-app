import { useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArabicText } from '@/components/ArabicText';
import { OPTION_STATE_CLASSES } from './optionStyles';
import { useAppStore } from '@/store/useAppStore';
import { playFeedback, speakArabic } from '@/services/audioService';
import { regularVerbs, ownershipNouns } from '@/data';
import {
  PERSONS, OWNER_PERSONS, personLabel, ownerLabel,
  conjugateArabizi, conjugateArabic, conjugatePastArabizi, conjugatePastArabic,
  possessArabizi, possessArabic,
} from '@/services/conjugationService';
import type { Person, OwnerPerson } from '@/services/conjugationService';
import { pick, shuffle } from '@/hooks/useShuffled';

type Kind = 'verb' | 'verbPast' | 'owner';

interface Problem {
  kind: Kind;
  promptArabic: string;
  promptArabizi: string;
  promptEnglish: string;
  taskLabel: string;
  answer: { arabic: string; arabizi: string };
  options: Array<{ arabic: string; arabizi: string }>;
  recordId: string;
}

/**
 * Builds N unique distractors. Two persons can produce the same conjugation
 * (e.g. youM and she both → te + root for verbs), so we dedupe on the rendered
 * Arabic string and skip past collisions.
 */
const collectDistinct = <P,>(
  candidates: P[],
  toForm: (p: P) => { arabic: string; arabizi: string },
  taken: Set<string>,
  n: number,
): { arabic: string; arabizi: string }[] => {
  const out: { arabic: string; arabizi: string }[] = [];
  for (const p of shuffle(candidates)) {
    const form = toForm(p);
    if (taken.has(form.arabic)) continue;
    taken.add(form.arabic);
    out.push(form);
    if (out.length === n) break;
  }
  return out;
};

const buildVerbProblem = (): Problem => {
  const verb = pick(regularVerbs());
  const targetPerson = pick(PERSONS) as Person;
  const lbl = personLabel[targetPerson];
  const correct = { arabic: conjugateArabic(verb.arabicRoot, targetPerson), arabizi: conjugateArabizi(verb.root, targetPerson) };
  const taken = new Set([correct.arabic]);
  const distractors = collectDistinct(
    PERSONS.filter((p) => p !== targetPerson),
    (p) => ({ arabic: conjugateArabic(verb.arabicRoot, p), arabizi: conjugateArabizi(verb.root, p) }),
    taken,
    3,
  );
  return {
    kind: 'verb',
    promptArabic: verb.firstPersonArabic,
    promptArabizi: verb.firstPersonArabizi,
    promptEnglish: `to ${verb.english}`,
    taskLabel: `Conjugate for: ${lbl.en}`,
    answer: correct,
    options: shuffle([correct, ...distractors]),
    recordId: verb.id,
  };
};

const buildVerbPastProblem = (): Problem => {
  const verb = pick(regularVerbs());
  const targetPerson = pick(PERSONS) as Person;
  const lbl = personLabel[targetPerson];
  const correct = { arabic: conjugatePastArabic(verb.arabicRoot, targetPerson), arabizi: conjugatePastArabizi(verb.root, targetPerson) };
  const taken = new Set([correct.arabic]);
  const distractors = collectDistinct(
    PERSONS.filter((p) => p !== targetPerson),
    (p) => ({ arabic: conjugatePastArabic(verb.arabicRoot, p), arabizi: conjugatePastArabizi(verb.root, p) }),
    taken,
    3,
  );
  return {
    kind: 'verbPast',
    promptArabic: verb.firstPersonArabic,
    promptArabizi: verb.firstPersonArabizi,
    promptEnglish: `to ${verb.english}`,
    taskLabel: `Conjugate for: ${lbl.en}`,
    answer: correct,
    options: shuffle([correct, ...distractors]),
    recordId: verb.id,
  };
};

const buildOwnerProblem = (): Problem => {
  const noun = pick(ownershipNouns());
  const targetPerson = pick(OWNER_PERSONS) as OwnerPerson;
  const lbl = ownerLabel[targetPerson];
  const correct = { arabic: possessArabic(noun.arabic, targetPerson), arabizi: possessArabizi(noun.arabizi, targetPerson) };
  const taken = new Set([correct.arabic]);
  const distractors = collectDistinct(
    OWNER_PERSONS.filter((p) => p !== targetPerson),
    (p) => ({ arabic: possessArabic(noun.arabic, p), arabizi: possessArabizi(noun.arabizi, p) }),
    taken,
    3,
  );
  return {
    kind: 'owner',
    promptArabic: noun.arabic,
    promptArabizi: noun.arabizi,
    promptEnglish: noun.english,
    taskLabel: `Make it: ${lbl.en}`,
    answer: correct,
    options: shuffle([correct, ...distractors]),
    recordId: noun.id,
  };
};

interface Props {
  scope: 'verb' | 'verbPast' | 'owner' | 'mixed';
  onAnswered: (correct: boolean) => void;
}

export const Transformations = ({ scope, onAnswered }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    const p = scope === 'verb' ? buildVerbProblem()
      : scope === 'verbPast' ? buildVerbPastProblem()
      : scope === 'owner' ? buildOwnerProblem()
      : Math.random() < 0.5 ? buildVerbProblem() : buildOwnerProblem();
    setProblem(p);
    firedRef.current = false;
    setSelected(null);
    setConfirmed(false);
  }, [scope]);

  const fire = useMemo(() => (correct: boolean) => {
    if (firedRef.current) return;
    firedRef.current = true;
    onAnswered(correct);
  }, [onAnswered]);

  if (!problem) return null;

  const onPick = (arabic: string) => {
    if (confirmed) return;
    setSelected(arabic);
    // Speak the chosen word so the user can hear it before committing.
    speakArabic(arabic);
  };

  const onConfirm = () => {
    if (confirmed || selected === null) return;
    const correct = selected === problem.answer.arabic;
    setConfirmed(true);
    recordAnswer(problem.recordId, 'en2ar', correct);
    playFeedback(correct);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Combined prompt + task label in one tight card. */}
      <Card className="py-4">
        <ArabicText arabic={problem.promptArabic} arabizi={problem.promptArabizi} showArabizi={showArabizi} size="lg" center speak />
        <p className="text-center text-xs text-[color:var(--color-muted)] mt-1">{problem.promptEnglish}</p>
        <div className="mt-3 pt-3 border-t border-[color:var(--color-line)] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)]">
            {problem.kind === 'owner' ? 'Make it' : 'Conjugate for'}
          </p>
          <p className="text-base font-bold tracking-tight mt-0.5">{problem.taskLabel.replace(/^(Conjugate for: |Make it: )/, '')}</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-2">
        {problem.options.map((opt) => {
          const isSelected = selected === opt.arabic;
          // Three visual phases:
          //   not picked yet     → idle for everything
          //   picked, not confirmed → 'selected' on the picked one (accent), idle on others
          //   confirmed          → correct/wrong on picked, dim on rest
          let state: 'idle' | 'selected' | 'correct' | 'wrong' | 'dim';
          if (!selected) state = 'idle';
          else if (!confirmed) state = isSelected ? 'selected' : 'idle';
          else state = isSelected ? (opt.arabic === problem.answer.arabic ? 'correct' : 'wrong') : 'dim';

          const stateClass = state === 'selected' ? SELECTED_CLASSES : OPTION_STATE_CLASSES[state];

          return (
            <button
              key={opt.arabic + opt.arabizi}
              onClick={() => onPick(opt.arabic)}
              disabled={confirmed}
              className={`min-h-[52px] rounded-xl border-2 px-3 py-2 transition-all duration-150 ${stateClass}`}
            >
              <ArabicText arabic={opt.arabic} arabizi={opt.arabizi} showArabizi={showArabizi} size="md" noInteractive />
            </button>
          );
        })}
      </div>

      {confirmed && (
        <div className={`text-center text-xs font-semibold ${selected === problem.answer.arabic ? 'text-[color:var(--color-correct)]' : 'text-[color:var(--color-wrong)]'}`}>
          {selected === problem.answer.arabic ? '✓ Correct!' : (
            <span>Answer: <span className="font-semibold">{problem.answer.arabizi}</span> · <span className="ar font-semibold">{problem.answer.arabic}</span></span>
          )}
        </div>
      )}

      {!confirmed ? (
        <Button onClick={onConfirm} full disabled={selected === null}>Confirm</Button>
      ) : (
        <Button onClick={() => fire(selected === problem.answer.arabic)} full>Continue</Button>
      )}
    </div>
  );
};

// Accent style for the "selected but not yet confirmed" intermediate state.
const SELECTED_CLASSES = 'bg-[color:var(--color-accent-soft)] border-[color:var(--color-accent)] text-[color:var(--color-ink)]';
