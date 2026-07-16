export type WordType = 'noun' | 'verb' | 'adjective' | 'pronoun' | 'particle' | 'phrase' | 'expression' | 'number';

export interface Word {
  id: string;
  arabic: string;
  arabizi: string;
  english: string;
  category: string;
  type: WordType;
  /** Alternate spellings/dialect variants accepted on text-input quizzes. */
  alternatives?: { arabic?: string[]; arabizi?: string[]; english?: string[] };
  /** True if this single noun is suitable for ownership-suffix drills. */
  ownership?: boolean;
  /** Free-form note (e.g., "loanword", "Emirati slang"). */
  note?: string;
}

export interface VerbRoot {
  id: string;
  /** Stripped 1st-person form (e.g. "shrab" from "ashrab"). */
  root: string;
  arabicRoot: string;
  english: string;
  /** First-person Arabic form, used as display lemma. */
  firstPersonArabic: string;
  firstPersonArabizi: string;
  /** True if regular present-tense Form I — eligible for conjugation drills. */
  regular: boolean;
  category: 'verbs';
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
}
