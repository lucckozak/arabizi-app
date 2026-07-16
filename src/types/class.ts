import type { GrammarTopicId } from './progress';

export type ClassVocabMode = 'mcq' | 'text' | 'match' | 'sentence';
export type ClassDirection = 'ar2en' | 'en2ar';

export type ClassBlockSpec =
  | { kind: 'vocab'; categories: string[]; mode: ClassVocabMode; direction: ClassDirection; length: number }
  | { kind: 'grammar'; topic: 'verb' | 'verbPast' | 'owner'; length: number }
  | { kind: 'grammarSentence'; category: string; topic: GrammarTopicId; length: number }
  | { kind: 'dialogue'; dialogueId: string };

export interface ClassLesson {
  id: string;
  order: number;
  emoji: string;
  title: string;
  subtitle: string;
  /** Short teaching text shown on the explanation screen. */
  intro: string;
  /** Word ids showcased as flashcards before practice starts. */
  vocabPreview?: string[];
  /** When set, an explanation screen shows a "View grammar rules" button for this topic. */
  grammarTopic?: GrammarTopicId;
  practice: ClassBlockSpec;
  homework: ClassBlockSpec;
}
