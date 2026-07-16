interface Props {
  wrong: number;
  accuracyPct: number;
  seconds: number;
}

const formatSeconds = (s: number): string => {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r === 0 ? `${m}m` : `${m}m ${r}s`;
};

export const ResultsBar = ({ wrong, accuracyPct, seconds }: Props) => (
  <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
    <Tile icon="✗" label="Wrong" value={String(wrong)} tone={wrong === 0 ? 'good' : 'bad'} />
    <Tile icon="◎" label="Accuracy" value={`${accuracyPct}%`} tone={accuracyPct === 100 ? 'good' : accuracyPct >= 70 ? 'neutral' : 'bad'} />
    <Tile icon="⏱" label="Time" value={formatSeconds(seconds)} tone="neutral" />
  </div>
);

const Tile = ({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: 'good' | 'bad' | 'neutral' }) => {
  const color =
    tone === 'good' ? 'text-[color:var(--color-correct)]'
  : tone === 'bad'  ? 'text-[color:var(--color-wrong)]'
  :                   'text-[color:var(--color-ink)]';
  return (
    <div className="bg-[color:var(--color-bg-soft)] rounded-xl px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-muted)] mb-1">
        <span className="mr-1" aria-hidden="true">{icon}</span>{label}
      </div>
      <div className={`text-xl font-bold tabular-nums tracking-tight leading-none ${color}`}>{value}</div>
    </div>
  );
};
