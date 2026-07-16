export interface Sentence {
  id: string;
  arabic: string;
  arabizi: string;
  english: string;
  answer: { arabic: string; arabizi: string; english: string };
  distractorPool: string;
}
