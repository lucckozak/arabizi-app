import { useMemo } from 'react';

export const shuffle = <T,>(arr: T[]): T[] => {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

export const useShuffled = <T,>(arr: T[], salt: unknown): T[] => useMemo(() => shuffle(arr), [arr, salt]);

export const sample = <T,>(arr: T[], n: number, exclude: Set<unknown> = new Set()): T[] => {
  const pool = arr.filter((x) => !exclude.has(x));
  return shuffle(pool).slice(0, n);
};

export const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
