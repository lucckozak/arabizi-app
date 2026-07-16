import { create } from 'zustand';
import { storage } from '@/services/storageService';
import { cardKey, newCard, review } from '@/services/srsService';
import type { ProgressState, SettingsState, Direction } from '@/types/progress';

export type LearnMode = 'mcq' | 'text' | 'match' | 'sentence' | 'dialogue';

export type GrammarTopicId = 'verb' | 'verbPast' | 'owner' | 'prep';

export interface PendingLaunch {
  category: string | 'all';
  mode: LearnMode;
  direction: Direction;
  /** When set, every answer in this session also counts toward grammar mastery for the topic. */
  grammarTopic?: GrammarTopicId;
  /** Route to navigate back to on exit / done. Defaults to '/'. */
  returnTo?: string;
}

interface AppState {
  progress: ProgressState;
  settings: SettingsState;
  initialised: boolean;
  /** Set by Topics page; consumed by Learn page on next mount. */
  pendingLaunch: PendingLaunch | null;

  load(): void;
  recordAnswer(wordId: string, direction: Direction, correct: boolean): void;
  recordGrammarAnswer(topic: GrammarTopicId, correct: boolean): void;
  /** Marks a class complete for today. No-op if already completed (won't push the date forward on replay). */
  recordClassComplete(classId: string): void;
  setSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]): void;
  completeOnboarding(goal: number, showArabizi: boolean): void;
  exportJSON(): string;
  importJSON(s: string): { ok: boolean; error?: string };
  resetAll(): void;
  setPendingLaunch(p: PendingLaunch | null): void;
  consumePendingLaunch(): PendingLaunch | null;
}

export const todayLocal = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const updateStreak = (p: ProgressState): ProgressState => {
  const today = todayLocal();
  if (p.lastActiveDate === today) return p;
  let streak = p.streak;
  if (!p.lastActiveDate) {
    streak = 1;
  } else {
    const last = new Date(p.lastActiveDate);
    const diff = Math.round((new Date(today).getTime() - last.getTime()) / 86400000);
    streak = diff === 1 ? streak + 1 : 1;
  }
  const longestStreak = Math.max(p.longestStreak ?? 0, streak);
  return { ...p, streak, longestStreak, lastActiveDate: today };
};

const bumpDaily = (p: ProgressState, correct: boolean): ProgressState => {
  const today = todayLocal();
  const last = p.daily[p.daily.length - 1];
  let daily = p.daily;
  if (!last || last.date !== today) {
    daily = [...p.daily, { date: today, reviewed: 1, correct: correct ? 1 : 0 }];
  } else {
    daily = [
      ...p.daily.slice(0, -1),
      { ...last, reviewed: last.reviewed + 1, correct: last.correct + (correct ? 1 : 0) },
    ];
  }
  // keep last 90 days
  if (daily.length > 90) daily = daily.slice(daily.length - 90);
  return { ...p, daily };
};

export const useAppStore = create<AppState>((set, get) => ({
  progress: storage.loadProgress(),
  settings: storage.loadSettings(),
  initialised: false,
  pendingLaunch: null,

  setPendingLaunch(p) { set({ pendingLaunch: p }); },
  consumePendingLaunch() {
    const p = get().pendingLaunch;
    if (p) set({ pendingLaunch: null });
    return p;
  },

  load() {
    set({ progress: storage.loadProgress(), settings: storage.loadSettings(), initialised: true });
  },

  recordAnswer(wordId, direction, correct) {
    const { progress } = get();
    const k = cardKey(wordId, direction);
    const existing = progress.cards[k] ?? newCard(wordId, direction);
    const updated = review(existing, correct);
    let learned = progress.totalLearned;
    if (correct && !learned.includes(wordId)) learned = [...learned, wordId];
    let mastered = progress.totalMastered;
    if (updated.bucket >= 5 && !mastered.includes(wordId)) mastered = [...mastered, wordId];

    let next: ProgressState = {
      ...progress,
      cards: { ...progress.cards, [k]: updated },
      totalLearned: learned,
      totalMastered: mastered,
    };
    next = bumpDaily(next, correct);
    next = updateStreak(next);
    storage.saveProgress(next);
    set({ progress: next });
  },

  recordGrammarAnswer(topic, correct) {
    const { progress } = get();
    const cur = progress.grammarStats[topic] ?? { total: 0, correct: 0 };
    const updated = { total: cur.total + 1, correct: cur.correct + (correct ? 1 : 0) };
    const next: ProgressState = {
      ...progress,
      grammarStats: { ...progress.grammarStats, [topic]: updated },
    };
    storage.saveProgress(next);
    set({ progress: next });
  },

  recordClassComplete(classId) {
    const { progress } = get();
    if (progress.classes[classId]) return;
    const next: ProgressState = {
      ...progress,
      classes: { ...progress.classes, [classId]: { completedDate: todayLocal() } },
    };
    storage.saveProgress(next);
    set({ progress: next });
  },

  setSetting(key, value) {
    const next = { ...get().settings, [key]: value };
    storage.saveSettings(next);
    set({ settings: next });
  },

  completeOnboarding(goal, showArabizi) {
    const settings = { ...get().settings, dailyGoal: goal, showArabizi };
    const progress = { ...get().progress, onboardingComplete: true };
    storage.saveSettings(settings);
    storage.saveProgress(progress);
    set({ settings, progress });
  },

  exportJSON() {
    return storage.exportAll();
  },

  importJSON(s) {
    const r = storage.importAll(s);
    if (r.ok) get().load();
    return r;
  },

  resetAll() {
    storage.reset();
    get().load();
  },
}));
