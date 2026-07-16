import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SessionHeader } from '@/components/SessionHeader';
import type { Dialogue } from '@/types/dialogue';
import { ALL_WORDS } from '@/data';
import { sample, shuffle } from '@/hooks/useShuffled';
import { useAppStore } from '@/store/useAppStore';

interface OptionTriplet { arabic: string; arabizi: string; english: string; }

interface Props {
  dialogue: Dialogue;
  onDone: (correct: number, total: number) => void;
  onExit: () => void;
}

type Token =
  | { kind: 'text'; value: string }
  | { kind: 'blank'; id: number };

const tokenize = (text: string, startId: number): { tokens: Token[]; nextId: number } => {
  const out: Token[] = [];
  let id = startId;
  for (const part of text.split(/(___+)/g)) {
    if (/^___+$/.test(part)) {
      out.push({ kind: 'blank', id });
      id++;
    } else if (part) {
      out.push({ kind: 'text', value: part });
    }
  }
  return { tokens: out, nextId: id };
};

const tokenizeLines = (lines: { arabic: string; arabizi: string; english: string }[]) => {
  let arId = 1, azId = 1, enId = 1;
  return lines.map((l) => {
    const ar = tokenize(l.arabic, arId);  arId = ar.nextId;
    const az = tokenize(l.arabizi, azId); azId = az.nextId;
    const en = tokenize(l.english, enId); enId = en.nextId;
    return { ar: ar.tokens, az: az.tokens, en: en.tokens };
  });
};

export const DialogueExercise = ({ dialogue, onDone, onExit }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);
  const recordAnswer = useAppStore((s) => s.recordAnswer);
  const [picks, setPicks] = useState<Record<number, OptionTriplet>>({});
  const [active, setActive] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const tokens = useMemo(() => tokenizeLines(dialogue.lines), [dialogue]);
  const totalBlanks = dialogue.blanks.length;
  const filledCount = Object.keys(picks).length;
  const allFilled = filledCount === totalBlanks;
  const progress = filledCount / totalBlanks;

  const optionsByBlank = useMemo(() => {
    const map: Record<number, OptionTriplet[]> = {};
    dialogue.blanks.forEach((b, i) => {
      const id = i + 1;
      const distractors = sample(
        ALL_WORDS.filter((w) => w.category === b.distractorPool && w.arabic !== b.answer.arabic),
        3,
      ).map((w) => ({ arabic: w.arabic, arabizi: w.arabizi, english: w.english }));
      map[id] = shuffle([b.answer, ...distractors]);
    });
    return map;
  }, [dialogue]);

  const isCorrectAt = (blankId: number) => {
    const pick = picks[blankId];
    return pick ? pick.arabic === dialogue.blanks[blankId - 1].answer.arabic : false;
  };

  const onPickOption = (opt: OptionTriplet) => {
    if (revealed || active === null) return;
    setPicks({ ...picks, [active]: opt });
    setActive(null);
  };

  const reveal = () => {
    setRevealed(true);
    setActive(null);
    dialogue.blanks.forEach((b, i) => {
      const id = i + 1;
      const ok = picks[id]?.arabic === b.answer.arabic;
      recordAnswer(`${dialogue.id}.b${id}`, 'ar2en', ok);
    });
  };

  const correctCount = revealed
    ? dialogue.blanks.filter((b, i) => picks[i + 1]?.arabic === b.answer.arabic).length
    : 0;

  const Blank = ({ id, script }: { id: number; script: 'ar' | 'az' | 'en' }) => {
    const pick = picks[id];
    const correct = isCorrectAt(id);
    const value = pick
      ? script === 'ar' ? pick.arabic : script === 'az' ? pick.arabizi : pick.english
      : null;
    const isActive = active === id && !revealed;
    let style = '';
    if (revealed) {
      style = correct
        ? 'bg-[color:var(--color-correct-soft)] text-[color:var(--color-correct)]'
        : 'bg-[color:var(--color-wrong-soft)] text-[color:var(--color-wrong)]';
    } else if (isActive) {
      style = 'bg-[color:var(--color-accent-soft)] text-[color:var(--color-ink)] ring-2 ring-[color:var(--color-accent)]';
    } else if (pick) {
      style = 'bg-[color:var(--color-bg-soft)] text-[color:var(--color-ink)] border border-[color:var(--color-line)]';
    } else {
      style = 'border-b-2 border-dashed border-[color:var(--color-brand)] text-[color:var(--color-brand)]';
    }
    return (
      <button
        onClick={() => !revealed && setActive(id)}
        disabled={revealed}
        className={`inline-block min-w-[3rem] mx-1 px-2 py-0.5 rounded-md font-semibold transition-colors ${style}`}
      >
        {value ?? '___'}
      </button>
    );
  };

  const renderTokens = (toks: Token[], script: 'ar' | 'az' | 'en') =>
    toks.map((t, i) => t.kind === 'text'
      ? <span key={i}>{t.value}</span>
      : <Blank key={i} id={t.id} script={script} />,
    );

  const filledArabic = (text: string, startId: number) => {
    let id = startId;
    return text.split(/(___+)/g).map((part, i) => {
      if (/^___+$/.test(part)) {
        const ans = dialogue.blanks[id - 1]?.answer.arabic ?? '___';
        id++;
        return <span key={i} className="font-semibold text-[color:var(--color-correct)]">{ans}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };
  const filledEnglish = (text: string, startId: number) => {
    let id = startId;
    return text.split(/(___+)/g).map((part, i) => {
      if (/^___+$/.test(part)) {
        const ans = dialogue.blanks[id - 1]?.answer.english ?? '___';
        id++;
        return <span key={i} className="font-semibold">{ans}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div>
      <SessionHeader
        onExit={onExit}
        label={revealed ? `${correctCount} / ${totalBlanks} correct` : `${filledCount} / ${totalBlanks} filled`}
        progress={revealed ? 1 : progress}
      />

      <div className="flex items-center gap-3 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-[color:var(--color-bg-soft)] flex items-center justify-center text-2xl flex-shrink-0">
          {dialogue.emoji}
        </div>
        <div className="min-w-0">
          <h1 className="text-lg font-bold tracking-tight leading-tight truncate">{dialogue.title}</h1>
          <p className="text-xs text-[color:var(--color-muted)] truncate">{dialogue.scenario}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-5">
        {dialogue.lines.map((line, i) => {
          const t = tokens[i];
          const sideRight = line.side === 'B';
          return (
            <div key={i} className={`flex ${sideRight ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                sideRight
                  ? 'bg-[color:var(--color-brand-soft)]'
                  : 'bg-[color:var(--color-surface)] border border-[color:var(--color-line)]'
              }`}>
                <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[color:var(--color-muted)] mb-1">{line.speaker}</div>
                <p dir="rtl" className="ar text-[20px] leading-loose text-right">{renderTokens(t.ar, 'ar')}</p>
                {showArabizi && (
                  <p dir="ltr" className="text-[11px] text-[color:var(--color-muted)] mt-1 leading-relaxed">{renderTokens(t.az, 'az')}</p>
                )}
                <p dir="ltr" className="text-[13px] text-[color:var(--color-ink-soft)] mt-1 leading-relaxed">{renderTokens(t.en, 'en')}</p>
              </div>
            </div>
          );
        })}
      </div>

      {!revealed && active !== null && (
        <Card className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-3">
            Pick word for blank #{active}
          </p>
          <div className="grid grid-cols-1 gap-2">
            {optionsByBlank[active].map((opt) => (
              <button
                key={opt.arabic + opt.arabizi}
                onClick={() => onPickOption(opt)}
                className="min-h-[56px] rounded-xl border border-[color:var(--color-line)] bg-[color:var(--color-surface)] px-4 py-2 flex items-center justify-between gap-3 active:scale-[0.99] transition-transform"
              >
                <span dir="rtl" className="ar text-xl font-semibold flex-1 text-right">{opt.arabic}</span>
                {showArabizi && (
                  <span className="text-xs text-[color:var(--color-muted)]">{opt.arabizi}</span>
                )}
              </button>
            ))}
            <button onClick={() => setActive(null)} className="text-xs text-[color:var(--color-muted)] mt-1 py-1">Cancel</button>
          </div>
        </Card>
      )}

      {!revealed && active === null && !allFilled && (
        <p className="text-center text-sm text-[color:var(--color-muted)] mb-4">Tap any blank in the dialogue to pick a word.</p>
      )}

      {revealed && (
        <>
          <div className="rounded-2xl border-2 border-[color:var(--color-correct)] bg-[color:var(--color-correct-soft)] px-5 py-4 mb-4">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-correct)] mb-3">Correct version</h3>
            {(() => {
              let arSeen = 0, enSeen = 0;
              return dialogue.lines.map((line, i) => {
                const arBlanks = (line.arabic.match(/___+/g) ?? []).length;
                const enBlanks = (line.english.match(/___+/g) ?? []).length;
                const arStart = arSeen + 1;
                const enStart = enSeen + 1;
                arSeen += arBlanks;
                enSeen += enBlanks;
                return (
                  <div key={i} className="mb-2.5 last:mb-0">
                    <div className="text-[10px] uppercase tracking-[0.12em] font-semibold text-[color:var(--color-muted)]">{line.speaker}</div>
                    <p dir="rtl" className="ar text-[18px] text-right leading-snug">{filledArabic(line.arabic, arStart)}</p>
                    <p dir="ltr" className="text-xs text-[color:var(--color-ink-soft)] leading-relaxed">{filledEnglish(line.english, enStart)}</p>
                  </div>
                );
              });
            })()}
          </div>

          {dialogue.blanks.some((b, i) => picks[i + 1]?.arabic !== b.answer.arabic) && (
            <Card className="mb-4">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-3">Your mistakes</h3>
              <ul className="flex flex-col gap-3">
                {dialogue.blanks.map((b, i) => {
                  const id = i + 1;
                  const pick = picks[id];
                  if (!pick || pick.arabic === b.answer.arabic) return null;
                  return (
                    <li key={id} className="text-sm">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-1">Blank #{id}</div>
                      <div className="flex flex-col gap-1">
                        <div>
                          <span className="text-[color:var(--color-wrong)] font-semibold">You picked: </span>
                          <span className="ar font-semibold">{pick.arabic}</span>
                          <span className="text-[color:var(--color-muted)]"> — {pick.english}</span>
                        </div>
                        <div>
                          <span className="text-[color:var(--color-correct)] font-semibold">Correct: </span>
                          <span className="ar font-semibold">{b.answer.arabic}</span>
                          <span className="text-[color:var(--color-muted)]"> — {b.answer.english}</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}

      {!revealed && allFilled && (
        <Button full onClick={reveal}>Check answers</Button>
      )}

      {revealed && (
        <Button full onClick={() => onDone(correctCount, totalBlanks)}>Continue</Button>
      )}
    </div>
  );
};
