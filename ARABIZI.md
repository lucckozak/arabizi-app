# Arabizi convention

The app uses the chat-alphabet style throughout. One consistent scheme so quizzes can validate input.

| Numeral | Arabic | Sound |
|---|---|---|
| 2 | ء | hamza (glottal stop) |
| 3 | ع | ayn |
| 5 | خ | kha (also "kh") |
| 6 | ط | emphatic t (also "t") |
| 7 | ح | ha |
| 8 | غ | ghain (also "gh") |
| 9 | ص | emphatic s (also "s") |

Other conventions
- `dh` for ذ and ض
- `th` for ث
- `q` written as `g` for the Emirati pronunciation of ق (e.g. *gahwa*, not *qahwa*)
- `j` for ج, but `ch` for the Gulf affricate variant of ج/ك (*chai*, *baitch*)
- Doubled letters preserved: *7alawah*, *sayyaarah*
- Long vowels written as double letters: *aa*, *ee*, *oo*

The `validationService.normalizeArabizi()` function ignores apostrophes and hyphens, so *meta'kher* and *metakher* both validate. Case-insensitive.
