# Arabizi App

A mobile-first PWA for learning spoken Emirati Arabic (Gulf dialect), written in "chat Arabic" transliteration (Arabizi) alongside the Arabic script.

## Features

- **Vocabulary** — flashcards across categories (greetings, family, numbers, food, directions, culture, and more) with multiple-choice, typed-answer, matching, sentence-completion, and dialogue exercises.
- **Grammar** — present-tense and past-tense verb conjugation, ownership suffixes, and prepositions, each with a rules reference and drills.
- **Classes** — a guided, Duolingo-style daily curriculum: one class per day, each with an explanation, practice, and homework, building from greetings to full conversations.
- **Review** — spaced-repetition review of due and weak cards.
- Installable offline as a PWA; works fully client-side, no backend.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # typecheck + production build
npm run lint     # eslint
```

## Stack

React + TypeScript + Vite, Tailwind CSS, Zustand for state, React Router, `vite-plugin-pwa` for offline support. All content lives in `src/data/*.json`; progress and settings are stored locally (`localStorage`), no server required.
