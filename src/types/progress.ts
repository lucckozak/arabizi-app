export type Direction = 'ar2en' | 'en2ar';

export interface CardState {
  /** wordId */
  id: string;
  direction: Direction;
  /** Leitner bucket: 0 = new/wrong, 1..5 mapped to interval ladder. */
  bucket: number;
  /** Epoch ms when this card is next due. */
  due: number;
  correct: number;
  incorrect: number;
  lastSeen: number;
}

export interface DailyStat {
  /** YYYY-MM-DD (local) */
  date: string;
  reviewed: number;
  correct: number;
}

export type GrammarTopicId = 'verb' | 'verbPast' | 'owner' | 'prep';

export interface GrammarTopicStats {
  /** All answers ever submitted for this topic (correct + wrong). */
  total: number;
  /** Correct answers only — drives the mastery percentage. */
  correct: number;
}

export type GrammarStats = Record<GrammarTopicId, GrammarTopicStats>;

export interface ClassRecord {
  /** YYYY-MM-DD (local) the class was first completed. */
  completedDate: string;
}

export interface ProgressState {
  schemaVersion: number;
  cards: Record<string, CardState>; // key: `${id}:${direction}`
  daily: DailyStat[];
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalLearned: string[];   // word ids ever answered correctly
  totalMastered: string[];  // word ids that reached top bucket
  weakIds: string[];        // top N mistaken (derived; cached)
  onboardingComplete: boolean;
  grammarStats: GrammarStats;
  classes: Record<string, ClassRecord>; // classId -> completion record
}

export interface QuizSize {
  mcq: number;
  text: number;
  match: number;
  sentence: number;
  grammar: number;
}

export interface SettingsState {
  schemaVersion: number;
  showArabizi: boolean;
  dailyGoal: number;
  darkMode: 'light' | 'dark' | 'system';
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  quizSize: QuizSize;
  /** Play a chime on correct / buzz on wrong. */
  soundEffects: boolean;
  /** Tap any Arabic word to hear its pronunciation. */
  tapToPronounce: boolean;
}
