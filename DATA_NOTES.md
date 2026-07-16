# Data import notes

The first vocabulary import included automatic fixes to the source list. Review and tell me if any should revert.

## Arabic spelling fixes
| English | Source Arabic | Imported as | Why |
|---|---|---|---|
| Coffee (gahwa) | شهوة | قهوة | Source said "lust"; expected coffee. |
| Fish (semach) | سمح | سمج (alt: سمچ) | Source = "permission"; Emirati pronunciation uses چ/ج. |
| Water (mai) | مأي | ماي | Source had stray hamza. |
| Sweets (7alawah) | حالوة | حلاوة | Standard form. |
| Now (el7een) | الحي | الحين | Source missing the ن. |
| Husband (rayel) | زوج/رجل | رجل (alt: زوج) | Reordered so primary matches arabizi. |
| Children (3yaal) | عيل | عيال | Source missing alif. |
| Coffee phrase (aba…) | الكلاس | كلاس | Source had Arabic letter ل instead of ك at start. |
| Late f (meta'kherah) | متأخرة | متأخرة | Already correct (was duplicated under m). |
| Pleasant f beautiful | حلوة | كept as alt | Used 7elwah as alt of jameelah. |
| Tea (chai) | جأي | چاي (alts: جاي, شاي) | All three are seen in UAE; primary uses چ. |
| Chicken (deyay) | ديأي | دياي | Source had stray hamza. |
| Lunch (ghada) | الغدا | غدا | Stripped definite article for the lemma; phrases keep it. |
| Phone (telifoon) | تلفون | تلفون | Kept as-is. |
| Pronoun "you (f)" enty | إنني | إنتي | Source said "that I". Arabic should be إنتي for the feminine 2nd person. |

## Arabizi fixes
| English | Source | Imported as | Why |
|---|---|---|---|
| How old are you? | kam 30mrek? | kam 3omrek? | The 0 in "30" was a typo for the o in 3omrek. |
| (numerous "I ___" verbs) | various | unchanged | Loanwords like akancel/achayyek tagged as irregular and excluded from conjugation drills. |

## Ownership table
The source `bait` (house) ownership column had `بيت` repeated for every form (suffixes missing). I did **not** import that as-is. The conjugation engine generates `بيتي / بيتك / بيتج / ...` programmatically from the noun + suffix rule, so it's still tested against the **car** table you provided (which is correct in the source).

## Verb tagging
Out of ~150 first-person verbs in your list, the regular present-tense Form-I rule (the one in your spec: a/te/ye + root, with -een/-oon endings) cleanly applies to about 70%. The other 30% are Form II/III/V/VIII or weak-final/hollow verbs that need exception rules. For MVP I imported a curated subset of ~45 verbs and tagged each with `regular: true|false`. Only the regular ones appear in the conjugation drill; all of them appear as vocabulary entries.

This is the limit of what the simple rule supports. Adding the irregular forms means either (a) per-verb override tables, or (b) accepting that the drill skips ~30% of verbs. Let me know which way you want to go post-MVP.

## What I did NOT touch
- Anything I wasn't confident about — left as the source had it.
- Dialect alternatives (a/b separated by `/`) preserved via `alternatives` field.
- Capitalization in arabizi normalised lower-case throughout.

If anything in the table above should revert, tell me which row and I'll change it back.
