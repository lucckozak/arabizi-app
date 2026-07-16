/**
 * Emirati Gulf — regular present-tense Form I conjugation.
 * Rules are intentionally data, not code, so future dialects can be added.
 */

export type Person = 'I' | 'youF' | 'youM' | 'youP' | 'we' | 'she' | 'he' | 'they';

export const PERSONS: Person[] = ['I', 'youM', 'youF', 'youP', 'we', 'he', 'she', 'they'];

export const personLabel: Record<Person, { en: string; arabizi: string; arabic: string }> = {
  I:    { en: 'I',         arabizi: 'ana',   arabic: 'أنا' },
  youM: { en: 'You (m)',   arabizi: 'enta',  arabic: 'إنت' },
  youF: { en: 'You (f)',   arabizi: 'enty',  arabic: 'إنتي' },
  youP: { en: 'You (pl)',  arabizi: 'entoo', arabic: 'إنتوا' },
  we:   { en: 'We',        arabizi: 'ne7an', arabic: 'نحن' },
  he:   { en: 'He',        arabizi: 'hoo',   arabic: 'هو' },
  she:  { en: 'She',       arabizi: 'hee',   arabic: 'هي' },
  they: { en: 'They',      arabizi: 'hum',   arabic: 'هم' },
};

interface Affix { prefix: string; suffix: string; }

const VERB_ARABIZI: Record<Person, Affix> = {
  I:    { prefix: 'a',  suffix: '' },
  youM: { prefix: 'te', suffix: '' },
  youF: { prefix: 'te', suffix: 'een' },
  youP: { prefix: 'te', suffix: 'oon' },
  we:   { prefix: 'ne', suffix: '' },
  he:   { prefix: 'ye', suffix: '' },
  she:  { prefix: 'te', suffix: '' },
  they: { prefix: 'ye', suffix: 'oon' },
};

const VERB_ARABIC: Record<Person, Affix> = {
  I:    { prefix: 'أ', suffix: '' },
  youM: { prefix: 'ت', suffix: '' },
  youF: { prefix: 'ت', suffix: 'ين' },
  youP: { prefix: 'ت', suffix: 'ون' },
  we:   { prefix: 'ن', suffix: '' },
  he:   { prefix: 'ي', suffix: '' },
  she:  { prefix: 'ت', suffix: '' },
  they: { prefix: 'ي', suffix: 'ون' },
};

export const conjugateArabizi = (root: string, person: Person): string => {
  const { prefix, suffix } = VERB_ARABIZI[person];
  return `${prefix}${root}${suffix}`;
};

export const conjugateArabic = (root: string, person: Person): string => {
  const { prefix, suffix } = VERB_ARABIC[person];
  return `${prefix}${root}${suffix}`;
};

/**
 * Past tense (الماضي) is suffix-only — no prefix, attached straight to the
 * root. Written Arabic doesn't mark short vowels, so the bare root letters
 * already double as the "he" form (e.g. درس = daras = "he studied").
 */
const PAST_SUFFIX_ARABIZI: Record<Person, string> = {
  I:    't',
  youM: 't',
  youF: 'tee',
  youP: 'too',
  we:   'na',
  he:   '',
  she:  'at',
  they: 'aw',
};

const PAST_SUFFIX_ARABIC: Record<Person, string> = {
  I:    'ت',
  youM: 'ت',
  youF: 'تي',
  youP: 'توا',
  we:   'نا',
  he:   '',
  she:  'ت',
  they: 'وا',
};

export const conjugatePastArabizi = (root: string, person: Person): string => `${root}${PAST_SUFFIX_ARABIZI[person]}`;
export const conjugatePastArabic = (arabicRoot: string, person: Person): string => `${arabicRoot}${PAST_SUFFIX_ARABIC[person]}`;

export type OwnerPerson = 'mine' | 'yourF' | 'yourM' | 'yourP' | 'our' | 'her' | 'his' | 'their';

export const OWNER_PERSONS: OwnerPerson[] = ['mine', 'yourM', 'yourF', 'yourP', 'our', 'his', 'her', 'their'];

export const ownerLabel: Record<OwnerPerson, { en: string }> = {
  mine:  { en: 'Mine' },
  yourM: { en: 'Your (m)' },
  yourF: { en: 'Your (f)' },
  yourP: { en: 'Your (pl)' },
  our:   { en: 'Our' },
  his:   { en: 'His' },
  her:   { en: 'Her' },
  their: { en: 'Their' },
};

const OWN_ARABIZI: Record<OwnerPerson, string> = {
  mine: 'y', yourF: 'ch', yourM: 'k', yourP: 'kum', our: 'na', her: 'ha', his: 'ah', their: 'hum',
};

const OWN_ARABIC: Record<OwnerPerson, string> = {
  mine: 'ي', yourF: 'ج', yourM: 'ك', yourP: 'كم', our: 'نا', her: 'ها', his: 'ه', their: 'هم',
};

/** ta-marbuta → ت before adding a suffix (e.g. سيارة → سيارت + ك). */
const prepareArabicNoun = (n: string): string => n.replace(/ة$/, 'ت');

export const possessArabizi = (noun: string, person: OwnerPerson): string => `${noun}${OWN_ARABIZI[person]}`;
export const possessArabic = (noun: string, person: OwnerPerson): string => `${prepareArabicNoun(noun)}${OWN_ARABIC[person]}`;

/** Generate plausible distractor blocks for the block-builder UI. */
export const allVerbAffixes = (script: 'arabizi' | 'arabic'): { prefixes: string[]; suffixes: string[] } => {
  const tab = script === 'arabizi' ? VERB_ARABIZI : VERB_ARABIC;
  const prefixes = Array.from(new Set(Object.values(tab).map((a) => a.prefix)));
  const suffixes = Array.from(new Set(Object.values(tab).map((a) => a.suffix).filter(Boolean)));
  return { prefixes, suffixes };
};

export const allOwnerAffixes = (script: 'arabizi' | 'arabic'): string[] => {
  const tab = script === 'arabizi' ? OWN_ARABIZI : OWN_ARABIC;
  return Array.from(new Set(Object.values(tab)));
};
