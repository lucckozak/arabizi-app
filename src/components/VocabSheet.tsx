import { useMemo } from 'react';
import { Modal } from './Modal';
import type { Word } from '@/types/word';
import { CATEGORIES } from '@/data';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  words: Word[];
  /** Optional definition shown at the top of the sheet. */
  description?: string;
  /** When true, words are grouped under their category headings. */
  groupByCategory?: boolean;
}

export const VocabSheet = ({ open, onClose, title, words, description, groupByCategory }: Props) => {
  const showArabizi = useAppStore((s) => s.settings.showArabizi);

  const groups = useMemo(() => {
    if (!groupByCategory) return null;
    const byCat = new Map<string, Word[]>();
    for (const w of words) {
      const arr = byCat.get(w.category) ?? [];
      arr.push(w);
      byCat.set(w.category, arr);
    }
    // Render in the canonical CATEGORIES order, then any unknown categories alphabetically.
    const known = CATEGORIES.filter((c) => byCat.has(c.id)).map((c) => ({
      id: c.id,
      label: c.label,
      emoji: c.emoji,
      words: byCat.get(c.id)!,
    }));
    const unknownIds = [...byCat.keys()].filter((id) => !CATEGORIES.find((c) => c.id === id)).sort();
    const unknown = unknownIds.map((id) => ({ id, label: id, emoji: '·', words: byCat.get(id)! }));
    return [...known, ...unknown];
  }, [words, groupByCategory]);

  return (
    <Modal open={open} onClose={onClose} title={`${title} · ${words.length}`}>
      {description && (
        <div className="rounded-xl bg-[color:var(--color-bg-soft)] px-4 py-3 mb-4 text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">
          {description}
        </div>
      )}

      {words.length === 0 ? (
        <p className="text-sm text-[color:var(--color-muted)] text-center py-10">No words here yet.</p>
      ) : groups ? (
        <div className="flex flex-col gap-5">
          {groups.map((g) => (
            <section key={g.id}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-2 px-1 flex items-center justify-between">
                <span><span className="mr-1.5">{g.emoji}</span>{g.label}</span>
                <span className="tabular-nums">{g.words.length}</span>
              </h3>
              <ul className="divide-y divide-[color:var(--color-line)] rounded-xl bg-[color:var(--color-bg-soft)]/50 px-3">
                {g.words.map((w) => (
                  <Row key={w.id} arabic={w.arabic} arabizi={w.arabizi} english={w.english} showArabizi={showArabizi} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <ul className="divide-y divide-[color:var(--color-line)]">
          {words.map((w) => (
            <Row key={w.id} arabic={w.arabic} arabizi={w.arabizi} english={w.english} showArabizi={showArabizi} />
          ))}
        </ul>
      )}
    </Modal>
  );
};

const Row = ({ arabic, arabizi, english, showArabizi }: { arabic: string; arabizi: string; english: string; showArabizi: boolean }) => (
  <li className="py-3 grid grid-cols-[1fr_auto] gap-4 items-center">
    <div className="min-w-0">
      <div className="text-sm font-medium leading-tight">{english}</div>
      {showArabizi && (
        <div className="text-xs text-[color:var(--color-muted)] mt-0.5 truncate">{arabizi}</div>
      )}
    </div>
    <div className="ar text-2xl text-right font-semibold leading-none" dir="rtl">{arabic}</div>
  </li>
);
