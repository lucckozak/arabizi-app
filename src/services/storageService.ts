import type { ProgressState, SettingsState } from '@/types/progress';

const KEY_PROGRESS = 'arabicapp.progress.v1';
const KEY_SETTINGS = 'arabicapp.settings.v1';

export const SCHEMA_VERSION = 1;

export const defaultProgress = (): ProgressState => ({
  schemaVersion: SCHEMA_VERSION,
  cards: {},
  daily: [],
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  totalLearned: [],
  totalMastered: [],
  weakIds: [],
  onboardingComplete: false,
  grammarStats: {
    verb:     { total: 0, correct: 0 },
    verbPast: { total: 0, correct: 0 },
    owner:    { total: 0, correct: 0 },
    prep:     { total: 0, correct: 0 },
  },
  classes: {},
});

export const defaultSettings = (): SettingsState => ({
  schemaVersion: SCHEMA_VERSION,
  showArabizi: true,
  dailyGoal: 20,
  darkMode: 'system',
  fontSize: 'md',
  quizSize: { mcq: 8, text: 8, match: 5, sentence: 6, grammar: 10 },
  soundEffects: true,
  tapToPronounce: true,
});

interface Adapter {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
}

const localStorageAdapter: Adapter = {
  get<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota or unavailable — silently ignore for now */
    }
  },
  remove(key: string) {
    try { localStorage.removeItem(key); } catch { /* noop */ }
  },
};

const adapter: Adapter = localStorageAdapter;

export const storage = {
  loadProgress(): ProgressState {
    const v = adapter.get<Partial<ProgressState>>(KEY_PROGRESS);
    if (!v) return defaultProgress();
    const defaults = defaultProgress();
    const merged: ProgressState = { ...defaults, ...v };
    // Deep-merge known nested objects so newly-added subfields land on existing users.
    merged.grammarStats = { ...defaults.grammarStats, ...(v.grammarStats ?? {}) };
    merged.classes = { ...defaults.classes, ...(v.classes ?? {}) };
    if (merged.longestStreak < merged.streak) merged.longestStreak = merged.streak;
    return merged;
  },
  saveProgress(p: ProgressState): void {
    adapter.set(KEY_PROGRESS, p);
  },
  loadSettings(): SettingsState {
    const v = adapter.get<Partial<SettingsState>>(KEY_SETTINGS);
    if (!v) return defaultSettings();
    const defaults = defaultSettings();
    const merged: SettingsState = { ...defaults, ...v };
    merged.quizSize = { ...defaults.quizSize, ...(v.quizSize ?? {}) };
    return merged;
  },
  saveSettings(s: SettingsState): void {
    adapter.set(KEY_SETTINGS, s);
  },
  exportAll(): string {
    return JSON.stringify(
      {
        schemaVersion: SCHEMA_VERSION,
        exportedAt: new Date().toISOString(),
        progress: storage.loadProgress(),
        settings: storage.loadSettings(),
      },
      null,
      2,
    );
  },
  importAll(json: string): { ok: true } | { ok: false; error: string } {
    try {
      const data = JSON.parse(json) as { progress?: ProgressState; settings?: SettingsState };
      if (data.progress) adapter.set(KEY_PROGRESS, data.progress);
      if (data.settings) adapter.set(KEY_SETTINGS, data.settings);
      return { ok: true };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  },
  reset(): void {
    adapter.remove(KEY_PROGRESS);
    adapter.remove(KEY_SETTINGS);
  },
};
