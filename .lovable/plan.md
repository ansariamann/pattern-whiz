# Predict the Next — Pattern Game

A single-page game where the player sees a sequence (numbers, letters, shapes, emojis) and must guess the next item. Each round uses a different pattern type.

## Gameplay
- Show a series of 4–6 items with a `?` placeholder for the next one.
- Player types or picks an answer, submits, gets instant feedback.
- Score: +1 per correct, streak counter, lives (3 wrong = game over).
- "Next round" button generates a fresh pattern.
- Optional: hint button (reveals pattern category, costs streak).

## Pattern Generators (rotated randomly)
1. Arithmetic — `2, 5, 8, 11, ?` (+3)
2. Geometric — `3, 6, 12, 24, ?` (×2)
3. Squares / cubes — `1, 4, 9, 16, ?`
4. Fibonacci-like — `1, 1, 2, 3, 5, ?`
5. Alternating ops — `2, 4, 3, 6, 5, ?` (+2, -1, +3, -1…)
6. Alphabet step — `A, C, E, G, ?`
7. Letter + number mix — `A1, B2, C3, ?`
8. Emoji/shape cycle — `🔴 🔵 🟢 🔴 🔵 ?`
9. Prime sequence — `2, 3, 5, 7, ?`
10. Difference-of-differences — `1, 3, 6, 10, ?`

Each generator returns `{ series, answer, acceptableAnswers, patternName }`.

## UI / Design
- Single route `/` (homepage = game).
- Bold playful aesthetic: large display font for the series, soft card background, animated reveal on correct/incorrect.
- Header: score · streak · lives.
- Series rendered as pill cards in a row, `?` card pulses.
- Input area: text field + Submit, plus a "Skip / New pattern" button.
- Feedback toast and color flash (green/red) on submit.
- Game-over modal with final score and "Play again".

## Files
- `src/routes/index.tsx` — game page (replaces placeholder).
- `src/lib/patterns.ts` — all generator functions + random picker.
- `src/components/game/SeriesDisplay.tsx`, `AnswerInput.tsx`, `Scoreboard.tsx`, `GameOverDialog.tsx`.
- `src/styles.css` — add a couple of accent tokens + gradient.

## Tech
- Pure client-side, no backend. State via `useState`.
- Shadcn `Button`, `Input`, `Dialog`, `Card`, `sonner` toast.
- Framer-motion for series reveal + shake on wrong answer.

## Out of scope
- Persistent high scores (no Cloud unless requested).
- Multiplayer / difficulty levels (can add later).
