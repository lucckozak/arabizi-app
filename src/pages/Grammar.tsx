import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SessionHeader } from '@/components/SessionHeader';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { ArabicText } from '@/components/ArabicText';
import { ResultsBar } from '@/components/ResultsBar';
import { GrammarSheet } from '@/components/GrammarSheet';
import { GrammarActionSheet } from '@/components/GrammarActionSheet';
import type { GrammarTopic, GrammarMode } from '@/components/GrammarActionSheet';
import { Transformations } from '@/components/quiz/Transformations';
import { regularVerbs, ownershipNouns } from '@/data';
import {
  PERSONS, OWNER_PERSONS, personLabel, ownerLabel,
  conjugateArabizi, conjugateArabic, conjugatePastArabizi, conjugatePastArabic,
  possessArabizi, possessArabic,
} from '@/services/conjugationService';
import type { Person, OwnerPerson } from '@/services/conjugationService';
import { useAppStore } from '@/store/useAppStore';
import { checkAnswer } from '@/services/validationService';
import { playFeedback } from '@/services/audioService';
import { computeAllGrammarProgress } from '@/services/grammarProgress';
import type { GrammarProgress } from '@/services/grammarProgress';
import { pick, shuffle } from '@/hooks/useShuffled';

type Drill =
  | { kind: 'verb-manual' }
  | { kind: 'verb-mcq' }
  | { kind: 'verbPast-manual' }
  | { kind: 'verbPast-mcq' }
  | { kind: 'owner-manual' }
  | { kind: 'owner-mcq' };

const TOPIC_CARDS: Array<{
  id: GrammarTopic;
  emoji: string;
  title: string;
  subtitle: string;
}> = [
  { id: 'verb',     emoji: '🔤', title: 'Verb conjugation',   subtitle: 'Build present-tense verbs for every person.' },
  { id: 'verbPast', emoji: '⏳', title: 'Past tense',         subtitle: 'kent, kan, kanat... conjugate verbs in the past.' },
  { id: 'owner',    emoji: '🏷️', title: 'Ownership suffixes', subtitle: 'Add endings — mine, yours, ours, theirs.' },
  { id: 'prep',     emoji: '🪧', title: 'Prepositions',       subtitle: 'fi, 3ala, ma3, min, ila, bayn — in context.' },
];

export const Grammar = () => {
  const [drill, setDrill] = useState<Drill | null>(null);
  const [actionFor, setActionFor] = useState<GrammarTopic | null>(null);
  const [sheet, setSheet] = useState<null | 'verb' | 'verbPast' | 'owner' | 'prep' | 'both'>(null);
  const setPendingLaunch = useAppStore((s) => s.setPendingLaunch);
  const grammarStats = useAppStore((s) => s.progress.grammarStats);
  const progress = useMemo(() => computeAllGrammarProgress(grammarStats), [grammarStats]);
  const navigate = useNavigate();

  if (drill?.kind === 'verb-manual')     return <VerbDrill onExit={() => setDrill(null)} />;
  if (drill?.kind === 'verbPast-manual') return <VerbDrill tense="past" onExit={() => setDrill(null)} />;
  if (drill?.kind === 'owner-manual')    return <OwnerDrill onExit={() => setDrill(null)} />;
  if (drill?.kind === 'verb-mcq')        return <TransformDrill scope="verb" onExit={() => setDrill(null)} sheetTopic="verb" />;
  if (drill?.kind === 'verbPast-mcq')    return <TransformDrill scope="verbPast" onExit={() => setDrill(null)} sheetTopic="verbPast" />;
  if (drill?.kind === 'owner-mcq')       return <TransformDrill scope="owner" onExit={() => setDrill(null)} sheetTopic="owner" />;

  const onStart = (topic: GrammarTopic, mode: GrammarMode) => {
    if (topic === 'verb' && mode === 'manual') setDrill({ kind: 'verb-manual' });
    else if (topic === 'verb' && mode === 'mcq') setDrill({ kind: 'verb-mcq' });
    else if (topic === 'verbPast' && mode === 'manual') setDrill({ kind: 'verbPast-manual' });
    else if (topic === 'verbPast' && mode === 'mcq') setDrill({ kind: 'verbPast-mcq' });
    else if (topic === 'owner' && mode === 'manual') setDrill({ kind: 'owner-manual' });
    else if (topic === 'owner' && mode === 'mcq') setDrill({ kind: 'owner-mcq' });
    else if (topic === 'prep' && mode === 'sentence') {
      setPendingLaunch({
        category: 'prepositions',
        mode: 'sentence',
        direction: 'ar2en',
        grammarTopic: 'prep',
        returnTo: '/grammar',
      });
      navigate('/play');
    } else if (topic === 'verbPast' && mode === 'sentence') {
      setPendingLaunch({
        category: 'verbs',
        mode: 'sentence',
        direction: 'ar2en',
        grammarTopic: 'verbPast',
        returnTo: '/grammar',
      });
      navigate('/play');
    }
  };

  return (
    <div>
      <div className="grid gap-3 mb-3">
        {TOPIC_CARDS.map((t) => (
          <GrammarTopicCard key={t.id} topic={t} progress={progress[t.id]} onClick={() => setActionFor(t.id)} />
        ))}
      </div>

      <Button variant="secondary" full onClick={() => setSheet('both')}>📖 Full cheat sheet</Button>

      <GrammarActionSheet
        open={actionFor !== null}
        topic={actionFor}
        onClose={() => setActionFor(null)}
        onStart={onStart}
        onViewRules={(t) => setSheet(t)}
      />

      <GrammarSheet open={sheet !== null} onClose={() => setSheet(null)} topic={sheet ?? 'both'} />
    </div>
  );
};

const HelpButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-9 h-9 rounded-full bg-[color:var(--color-bg-soft)] border border-[color:var(--color-line)] text-[color:var(--color-ink)] flex items-center justify-center font-bold"
    aria-label="Show grammar rules"
    title="Show grammar rules"
  >?</button>
);

const PromptInput = ({ value, onChange, onEnter, valid }: { value: string; onChange: (v: string) => void; onEnter: () => void; valid: 'idle' | 'correct' | 'wrong' }) => (
  <input
    autoFocus
    autoCapitalize="none"
    autoCorrect="off"
    autoComplete="off"
    spellCheck={false}
    className={`w-full min-h-[56px] rounded-2xl border-2 bg-[color:var(--color-surface)] px-4 text-lg outline-none transition-colors mb-4 ${
      valid === 'correct'
        ? 'border-[color:var(--color-correct)]'
        : valid === 'wrong'
          ? 'border-[color:var(--color-wrong)]'
          : 'border-[color:var(--color-line)] focus:border-[color:var(--color-brand)]'
    }`}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    onKeyDown={(e) => { if (e.key === 'Enter') onEnter(); }}
    placeholder="arabizi or Arabic"
  />
);

const VerbDrill = ({ tense = 'present', onExit }: { tense?: 'present' | 'past'; onExit: () => void }) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const recordGrammarAnswer = useAppStore((s) => s.recordGrammarAnswer);
  const sessionLen = useAppStore((s) => s.settings.quizSize.grammar);
  const verbs = useMemo(() => regularVerbs(), []);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });
  const [startedAt] = useState(Date.now());
  const [{ verb, person }, setProblem] = useState(() => ({ verb: pick(verbs), person: pick(PERSONS) as Person }));
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<{ correct: boolean } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const grammarTopic = tense === 'past' ? 'verbPast' : 'verb';

  const expectedArabizi = tense === 'past' ? conjugatePastArabizi(verb.root, person) : conjugateArabizi(verb.root, person);
  const expectedArabic = tense === 'past' ? conjugatePastArabic(verb.arabicRoot, person) : conjugateArabic(verb.arabicRoot, person);
  const lbl = personLabel[person];

  const submit = () => {
    if (submitted) return;
    const okEn = checkAnswer(expectedArabizi, value, 'arabizi');
    const okAr = checkAnswer(expectedArabic, value, 'arabic');
    const correct = okEn || okAr;
    setSubmitted({ correct });
    setResults((r) => ({ correct: r.correct + (correct ? 1 : 0), wrong: r.wrong + (correct ? 0 : 1) }));
    recordAnswer(verb.id, 'en2ar', correct);
    recordGrammarAnswer(grammarTopic, correct);
    playFeedback(correct);
  };

  const next = () => {
    setRound(round + 1);
    setProblem({ verb: pick(verbs), person: pick(PERSONS) as Person });
    setValue('');
    setSubmitted(null);
  };

  if (round >= sessionLen) {
    return <GrammarDone icon={tense === 'past' ? '⏳' : '🔤'} title={tense === 'past' ? 'Past tense done' : 'Verbs done'} results={results} startedAt={startedAt} onExit={onExit} />;
  }

  return (
    <div>
      <SessionHeader
        onExit={onExit}
        label={`${tense === 'past' ? 'Past tense' : 'Verbs'} · ${round + 1} / ${sessionLen}`}
        progress={round / sessionLen}
        right={<HelpButton onClick={() => setSheetOpen(true)} />}
      />

      <Card className="mb-3 py-4">
        <ArabicText arabic={verb.firstPersonArabic} arabizi={verb.firstPersonArabizi} showArabizi={showArabizi} size="md" center speak />
        <p className="text-center text-xs text-[color:var(--color-muted)] mt-1">to {verb.english}</p>
        <div className="mt-3 pt-3 border-t border-[color:var(--color-line)] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)]">Conjugate for</p>
          <p className="text-lg font-bold tracking-tight mt-0.5">{lbl.en}</p>
          <p className="text-[11px] text-[color:var(--color-muted)] mt-0.5">
            <span className="ar mr-2">{lbl.arabic}</span>· {lbl.arabizi}
          </p>
        </div>
      </Card>

      <PromptInput
        value={value}
        onChange={setValue}
        onEnter={() => submitted ? next() : submit()}
        valid={submitted ? (submitted.correct ? 'correct' : 'wrong') : 'idle'}
      />

      {submitted && (
        <div className={`text-center text-sm mb-4 ${submitted.correct ? 'text-[color:var(--color-correct)]' : 'text-[color:var(--color-wrong)]'}`}>
          {submitted.correct ? '✓ Correct!' : (
            <span>Answer: <span className="font-semibold">{expectedArabizi}</span> · <span className="ar font-semibold">{expectedArabic}</span></span>
          )}
        </div>
      )}

      <Button full onClick={() => (submitted ? next() : submit())} disabled={!submitted && !value.trim()}>
        {submitted ? (round + 1 === sessionLen ? 'Finish' : 'Continue') : 'Check'}
      </Button>

      <GrammarSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        topic={grammarTopic}
        exampleVerbRoot={{ root: verb.root, arabicRoot: verb.arabicRoot, english: verb.english }}
      />
    </div>
  );
};

const OwnerDrill = ({ onExit }: { onExit: () => void }) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const recordGrammarAnswer = useAppStore((s) => s.recordGrammarAnswer);
  const sessionLen = useAppStore((s) => s.settings.quizSize.grammar);
  const nouns = useMemo(() => shuffle(ownershipNouns()), []);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });
  const [startedAt] = useState(Date.now());
  const [{ noun, person }, setProblem] = useState(() => ({ noun: pick(nouns), person: pick(OWNER_PERSONS) as OwnerPerson }));
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState<{ correct: boolean } | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const expectedArabizi = possessArabizi(noun.arabizi, person);
  const expectedArabic = possessArabic(noun.arabic, person);
  const lbl = ownerLabel[person];

  const submit = () => {
    if (submitted) return;
    const okEn = checkAnswer(expectedArabizi, value, 'arabizi');
    const okAr = checkAnswer(expectedArabic, value, 'arabic');
    const correct = okEn || okAr;
    setSubmitted({ correct });
    setResults((r) => ({ correct: r.correct + (correct ? 1 : 0), wrong: r.wrong + (correct ? 0 : 1) }));
    recordAnswer(noun.id, 'en2ar', correct);
    recordGrammarAnswer('owner', correct);
    playFeedback(correct);
  };

  const next = () => {
    setRound(round + 1);
    setProblem({ noun: pick(nouns), person: pick(OWNER_PERSONS) as OwnerPerson });
    setValue('');
    setSubmitted(null);
  };

  if (round >= sessionLen) {
    return <GrammarDone icon="🏷️" title="Ownership done" results={results} startedAt={startedAt} onExit={onExit} />;
  }

  return (
    <div>
      <SessionHeader
        onExit={onExit}
        label={`Ownership · ${round + 1} / ${sessionLen}`}
        progress={round / sessionLen}
        right={<HelpButton onClick={() => setSheetOpen(true)} />}
      />

      <Card className="mb-3 py-4">
        <ArabicText arabic={noun.arabic} arabizi={noun.arabizi} showArabizi={showArabizi} size="md" center speak />
        <p className="text-center text-xs text-[color:var(--color-muted)] mt-1">{noun.english}</p>
        <div className="mt-3 pt-3 border-t border-[color:var(--color-line)] text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-brand-strong)]">Make it</p>
          <p className="text-lg font-bold tracking-tight mt-0.5">{lbl.en}</p>
        </div>
      </Card>

      <PromptInput
        value={value}
        onChange={setValue}
        onEnter={() => submitted ? next() : submit()}
        valid={submitted ? (submitted.correct ? 'correct' : 'wrong') : 'idle'}
      />

      {submitted && (
        <div className={`text-center text-sm mb-4 ${submitted.correct ? 'text-[color:var(--color-correct)]' : 'text-[color:var(--color-wrong)]'}`}>
          {submitted.correct ? '✓ Correct!' : (
            <span>Answer: <span className="font-semibold">{expectedArabizi}</span> · <span className="ar font-semibold">{expectedArabic}</span></span>
          )}
        </div>
      )}

      <Button full onClick={() => (submitted ? next() : submit())} disabled={!submitted && !value.trim()}>
        {submitted ? (round + 1 === sessionLen ? 'Finish' : 'Continue') : 'Check'}
      </Button>

      <GrammarSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        topic="owner"
        exampleNoun={{ arabic: noun.arabic, arabizi: noun.arabizi, english: noun.english }}
      />
    </div>
  );
};

const TransformDrill = ({ scope, sheetTopic, onExit }: { scope: 'verb' | 'verbPast' | 'owner' | 'mixed'; sheetTopic: 'verb' | 'verbPast' | 'owner' | 'both'; onExit: () => void }) => {
  const sessionLen = useAppStore((s) => s.settings.quizSize.grammar);
  const recordGrammarAnswer = useAppStore((s) => s.recordGrammarAnswer);
  const [round, setRound] = useState(0);
  const [results, setResults] = useState({ correct: 0, wrong: 0 });
  const [startedAt] = useState(Date.now());
  const [sheetOpen, setSheetOpen] = useState(false);
  const label = scope === 'verb' ? 'Verbs' : scope === 'verbPast' ? 'Past tense' : scope === 'owner' ? 'Ownership' : 'Transform';
  const icon = scope === 'verb' ? '🔤' : scope === 'verbPast' ? '⏳' : scope === 'owner' ? '🏷️' : '🔁';

  if (round >= sessionLen) {
    return <GrammarDone icon={icon} title={`${label} done`} results={results} startedAt={startedAt} onExit={onExit} />;
  }

  return (
    <div>
      <SessionHeader
        onExit={onExit}
        label={`${label} · ${round + 1} / ${sessionLen}`}
        progress={round / sessionLen}
        right={<HelpButton onClick={() => setSheetOpen(true)} />}
      />

      <Transformations
        key={round}
        scope={scope}
        onAnswered={(c) => {
          setResults((r) => ({ correct: r.correct + (c ? 1 : 0), wrong: r.wrong + (c ? 0 : 1) }));
          // Record toward the matching grammar topic. Mixed scope falls back to verb.
          const topic = scope === 'owner' ? 'owner' : scope === 'verbPast' ? 'verbPast' : 'verb';
          recordGrammarAnswer(topic, c);
          setRound((r) => r + 1);
        }}
      />

      <GrammarSheet open={sheetOpen} onClose={() => setSheetOpen(false)} topic={sheetTopic} />
    </div>
  );
};


const GrammarDone = ({ icon, title, results, startedAt, onExit }: {
  icon: string;
  title: string;
  results: { correct: number; wrong: number };
  startedAt: number;
  onExit: () => void;
}) => {
  const total = results.correct + results.wrong;
  const accuracyPct = total === 0 ? 100 : Math.round((results.correct / total) * 100);
  const seconds = Math.round((Date.now() - startedAt) / 1000);
  return (
    <div className="flex flex-col items-center justify-center min-h-[60svh] text-center px-2">
      <div className="text-6xl mb-5">{icon}</div>
      <h2 className="text-2xl font-bold tracking-tight mb-3">{title}</h2>
      <ResultsBar wrong={results.wrong} accuracyPct={accuracyPct} seconds={seconds} />
      <div className="w-full max-w-xs mt-8">
        <Button onClick={onExit} full>Done</Button>
      </div>
    </div>
  );
};

const GrammarTopicCard = ({
  topic, progress, onClick,
}: {
  topic: { id: GrammarTopic; emoji: string; title: string; subtitle: string };
  progress: GrammarProgress;
  onClick: () => void;
}) => {
  const levelTone =
    progress.level === 'Advanced'     ? 'bg-[color:var(--color-correct-soft)] text-[color:var(--color-correct)]'
  : progress.level === 'Intermediate' ? 'bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]'
  : progress.level === 'Beginner'     ? 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]'
  :                                     'bg-[color:var(--color-bg-soft)] text-[color:var(--color-muted)]';
  const barColor =
    progress.pct >= 80 ? 'var(--color-correct)'
  : progress.pct >= 40 ? 'var(--color-brand)'
  : progress.pct > 0   ? 'var(--color-accent)'
  :                      'var(--color-line-strong)';
  return (
    <button
      onClick={onClick}
      className="bg-[color:var(--color-surface)] border border-[color:var(--color-line)] shadow-[var(--shadow-card)] rounded-2xl p-5 text-left active:scale-[0.99] transition-transform hover:bg-[color:var(--color-surface-2)]"
    >
      <div className="flex items-start gap-3">
        <span className="w-12 h-12 rounded-2xl bg-[color:var(--color-bg-soft)] flex items-center justify-center text-2xl flex-shrink-0">
          {topic.emoji}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <div className="font-semibold leading-tight flex-1 min-w-0 truncate">{topic.title}</div>
            <span className={`inline-flex items-center justify-center px-2 h-5 rounded-full text-[10px] font-bold tabular-nums ${levelTone}`}>
              {progress.level}
            </span>
          </div>
          <div className="text-sm text-[color:var(--color-muted)] leading-snug">{topic.subtitle}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 rounded-full bg-[color:var(--color-bg-soft)] overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${progress.pct}%`, backgroundColor: barColor }}
              />
            </div>
            <span className="text-[10px] font-semibold tabular-nums text-[color:var(--color-muted)] min-w-[28px] text-right">
              {progress.pct}%
            </span>
          </div>
        </div>
        <span className="text-[color:var(--color-muted)]">›</span>
      </div>
    </button>
  );
};
