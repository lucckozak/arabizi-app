import vocabulary from './vocabulary.json';
import phrases from './phrases.json';
import verbsRaw from './verbs.json';
import categories from './categories.json';
import sentences from './sentences.json';
import dialogues from './dialogues.json';
import classesRaw from './classes.json';
import type { Word, VerbRoot, Category } from '@/types/word';
import type { Sentence } from '@/types/sentence';
import type { Dialogue } from '@/types/dialogue';
import type { ClassLesson } from '@/types/class';

export const SENTENCES = sentences as Sentence[];
export const DIALOGUES = dialogues as Dialogue[];
export const CLASSES = (classesRaw as ClassLesson[]).slice().sort((a, b) => a.order - b.order);

export const VOCABULARY = vocabulary as Word[];
export const PHRASES = phrases as Word[];
export const VERBS = verbsRaw as VerbRoot[];
export const CATEGORIES = categories as Category[];

/** Verbs surfaced as Word entries so they appear in vocabulary games. */
export const VERB_WORDS: Word[] = VERBS.map((v) => ({
  id: v.id,
  arabic: v.firstPersonArabic,
  arabizi: v.firstPersonArabizi,
  english: `I ${v.english}`,
  category: 'verbs',
  type: 'verb',
}));

/** All single-word entries (vocab + verbs). Phrases stay separate. */
export const VOCAB_WITH_VERBS: Word[] = [...VOCABULARY, ...VERB_WORDS];

/** All entries (vocab + verbs + phrases). */
export const ALL_WORDS: Word[] = [...VOCAB_WITH_VERBS, ...PHRASES];

export const wordsByCategory = (cat: string): Word[] => ALL_WORDS.filter((w) => w.category === cat);
export const ownershipNouns = (): Word[] => VOCABULARY.filter((w) => w.ownership);
export const regularVerbs = (): VerbRoot[] => VERBS.filter((v) => v.regular);
