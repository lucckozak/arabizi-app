import type { ClassLesson } from '@/types/class';
import type { ClassRecord } from '@/types/progress';
import { todayLocal } from '@/store/useAppStore';

export type ClassStatus = 'locked' | 'available' | 'completed';

/**
 * Only one class can be *completed* per calendar day. A class is available
 * once every class before it (in order) is completed, and today's slot
 * hasn't already been used by a completion dated today.
 */
export const computeClassStates = (
  lessons: ClassLesson[],
  records: Record<string, ClassRecord>,
): Record<string, ClassStatus> => {
  const today = todayLocal();
  const sorted = [...lessons].sort((a, b) => a.order - b.order);
  const out: Record<string, ClassStatus> = {};
  let blocked = false;
  for (const c of sorted) {
    const rec = records[c.id];
    if (rec) {
      out[c.id] = 'completed';
      if (rec.completedDate === today) blocked = true;
      continue;
    }
    out[c.id] = blocked ? 'locked' : 'available';
    blocked = true;
  }
  return out;
};

export const nextAvailableClass = (
  lessons: ClassLesson[],
  records: Record<string, ClassRecord>,
): ClassLesson | null => {
  const states = computeClassStates(lessons, records);
  return lessons.slice().sort((a, b) => a.order - b.order).find((c) => states[c.id] === 'available') ?? null;
};
