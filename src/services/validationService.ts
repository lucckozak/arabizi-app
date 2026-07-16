/** Strip Arabic tashkeel (diacritics). */
const TASHKEEL = /[ً-ْٰـ]/g;

export const normalizeArabic = (s: string): string =>
  s
    .normalize('NFKC')
    .replace(TASHKEEL, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه') // lenient ta-marbuta -> ha
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeEnglish = (s: string): string =>
  s
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/[’'`]/g, "'")
    .replace(/[.,!?;:()]/g, '')
    .replace(/\s*\/\s*/g, ' ')
    .replace(/\b(i|to|the|a|an)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export const normalizeArabizi = (s: string): string =>
  s
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    .replace(/['’`\-_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Light-touch: lowercase + collapse whitespace + drop apostrophes/hyphens. */
const lite = (s: string): string =>
  s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[’'`\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/** Standard Levenshtein edit distance — iterative two-row implementation. */
const editDistance = (a: string, b: string): number => {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array(b.length + 1);
  let curr = new Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1,    // insertion
        prev[j] + 1,        // deletion
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
};

/**
 * Allow N typos based on word length:
 *   ≤ 3 chars → exact match required
 *   4–7 chars → 1 typo
 *   8–14 chars → 2 typos
 *   ≥ 15 chars → 3 typos
 * Capped to never exceed 25% of the answer's length.
 */
const typoBudget = (s: string): number => {
  const len = s.length;
  if (len <= 3) return 0;
  if (len <= 7) return 1;
  if (len <= 14) return 2;
  return Math.min(3, Math.floor(len * 0.25));
};

const fuzzyMatches = (expected: string, actual: string): boolean => {
  const budget = typoBudget(expected);
  if (budget === 0) return expected === actual;
  return editDistance(expected, actual) <= budget;
};

export const checkAnswer = (
  expected: string,
  actual: string,
  mode: 'arabic' | 'english' | 'arabizi',
  alternatives: string[] = [],
): boolean => {
  const a = actual.normalize('NFKC').trim();
  if (!a) return false;
  const candidates = [expected, ...alternatives];

  // 1) Strict-but-case-insensitive match. Catches answers that are *just* stop-words
  //    like "I" / "the", which the lenient normalizer would reduce to an empty string.
  const aLite = lite(a);
  if (candidates.some((c) => lite(c) === aLite)) return true;

  // 2) Fuzzy match on the lite-normalized form — accepts minor typos and missing
  //    apostrophes ("dont" ≈ "don't"), wrong case ("I Don't Want" ≈ "i dont want").
  if (candidates.some((c) => fuzzyMatches(lite(c), aLite))) return true;

  // 3) Lenient normalized match — strips stop-words, punctuation, articles, etc.
  //    so "drink" matches expected "I drink".
  const norm = mode === 'arabic' ? normalizeArabic : mode === 'english' ? normalizeEnglish : normalizeArabizi;
  const aNorm = norm(a);
  if (!aNorm) return false;
  if (candidates.some((c) => {
    const cNorm = norm(c);
    return cNorm !== '' && cNorm === aNorm;
  })) return true;

  // 4) Fuzzy on the lenient form — final safety net for typos within partial answers.
  return candidates.some((c) => {
    const cNorm = norm(c);
    return cNorm !== '' && fuzzyMatches(cNorm, aNorm);
  });
};
