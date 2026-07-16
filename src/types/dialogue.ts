export interface DialogueLine {
  /** Display name (e.g. "Driver", "You", "Boss"). */
  speaker: string;
  /** "A" / "B" — used for left/right alignment to make the conversation easier to follow. */
  side: 'A' | 'B';
  /** Sentence template; ___ tokens mark blanks. The Nth ___ across the whole dialogue is blank N. */
  arabic: string;
  arabizi: string;
  english: string;
}

export interface DialogueBlank {
  answer: { arabic: string; arabizi: string; english: string };
  distractorPool: string;
}

export interface Dialogue {
  id: string;
  title: string;
  scenario: string;
  emoji: string;
  /** Categories this dialogue covers — used to filter by selected topic. */
  topics: string[];
  lines: DialogueLine[];
  /** In occurrence order — index 0 = blank #1. */
  blanks: DialogueBlank[];
}
