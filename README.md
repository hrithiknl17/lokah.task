# Lokah Tasks

A mobile-first prototype of a platform where people complete small paid language-data tasks
(speech and image) that help train AI.

**Useful work. Fair rewards. Clear progress.**

> Portfolio assessment inspired by Kenpath Labs. **Not an official Kenpath product.**
> All rates and amounts are fictional demo data.

## Features

- **Two task types**
  - **Listen & Verify** — play a short clip and say whether the transcript matches. Kannada and
    English clips; one transcript is deliberately wrong, so "Doesn't match" is the right answer.
  - **Describe an Image** — write 40–500 characters in your own words.
- **Clear rewards before you start** — every task card shows the reward, an estimated ₹/hour and
  the time it takes, all labelled "Demo data".
- **Honest lifecycle** — Available → In progress → Submitted → Pending review → Approved or
  Needs revision → resubmit. Every change is recorded with a timestamp.
- **Demo reviewer panel** — clearly labelled as simulated. It shows a suggestion (from the answer
  key for Listen & Verify; "decide manually" for descriptions) and lets you approve or request
  revision with a plain-language reason.
- **Earnings** — approved and pending totals kept separate, a ledger of approved rewards, and an
  explanation of how real payouts work. There is no withdraw button.
- **History** — every status change across all tasks, newest first.
- **Light engagement** — a weekly goal (5 tasks) and one milestone (5 approved). No streak
  pressure, countdowns, leaderboards or random rewards.
- **English and Kannada** — switch in Profile. Missing Kannada strings fall back to English with
  an "(English only)" tag.
- **Accessible, mobile-first** — works from 320px wide with no horizontal scroll, 48px touch
  targets, 16px body text, visible focus, status shown as icon + text, `aria-live` announcements,
  and `prefers-reduced-motion` respected.

## Run it

Requires Node 22.12+ (Vitest 5 needs it).

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # type-check + production build into dist/
npm run test         # unit tests (Vitest)
npm run test:e2e     # end-to-end test at 360px (Playwright)
npm run lint
```

First e2e run: `npx playwright install chromium`.

### Media you need to add

The app runs without these, showing "Audio unavailable" / "Image unavailable" and disabling
submit for those tasks.

| File | What it should contain |
| --- | --- |
| `public/audio/lv-kn-01.mp3` | Kannada: "ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?" |
| `public/audio/lv-kn-02.mp3` | Kannada: "ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?" |
| `public/audio/lv-en-01.mp3` | English: "The market opens at nine in the morning." |
| `public/audio/lv-en-02.mp3` | English: "Please close the **window** before it rains." (transcript says "door" on purpose) |
| `public/images/di-01.jpg` | A market vegetable stall (640×480) |
| `public/images/di-02.jpg` | A busy street (640×480) |
| `public/images/di-03.jpg` | A home kitchen (640×480) |

Keep clips short and compressed. If you change what a clip says, update the transcript in
`src/data/tasks.ts` (look for `TODO(user)`). Update alt text there if images differ.

## How data is stored

- Everything lives in the browser's `localStorage` under the key `lokah:v1`, with a
  `schemaVersion` field.
- The only stored data is: one submission per task (status, answer, status history, revision
  reason) and a profile (optional display name + language). No personal or financial data.
- **Earnings, pending totals, the ledger and history are never stored.** They are derived from
  submissions in `src/state/selectors.ts`. Because each task has exactly one submission and only
  an Approved status produces a reward, a reward cannot be counted twice.
- On load the payload is validated. If it is corrupt, the app starts fresh and shows a dismissible
  notice. It never crashes on bad data.
- **Reset demo** (Profile) asks for confirmation, then clears everything.

## Code map

```
src/
  types/          domain types
  data/tasks.ts   task content, transcripts, answer keys, demo rates
  state/
    reducer.ts    pure reducer — every status transition happens here
    review.ts     description pre-checks + reviewer suggestions
    selectors.ts  derived earnings, ledger, history, weekly progress
    storage.ts    localStorage load/save/validate
    context.tsx   React context + persistence
  i18n/           en.ts (source of keys), kn.ts, lookup + fallback
  components/     reusable UI
  screens/        Home, Tasks, TaskDetail, Earnings, History, Profile
tests/e2e/        Playwright flow at 360px
```

## What's simulated

- **Review.** The demo reviewer panel is you, pressing buttons. Its suggestion comes from a
  fixed answer key (Listen & Verify) or nothing at all (descriptions). Text is never
  auto-approved.
- **Rates and earnings.** Fictional example rates — not Kenpath Labs' rates. No money moves.
- **Task supply.** A fixed set of seven tasks bundled with the app.
- **Identity.** No accounts; progress belongs to this browser only.

## What production would need

- **Server-side task allocation** — assignment, expiry and fair distribution of work, not a
  bundled list.
- **Quality assurance** — gold-standard (known-answer) items mixed into real work, and
  inter-annotator agreement across several workers per item.
- **Reviewer tooling** — queues, sampling, calibration, appeals and audit logs.
- **KYC and UPI payouts** — identity verification, tax handling, and payouts governed by the task
  agreement, quality review and payout policy.
- **Consent and data rights** — clear consent for how contributions are used, plus access,
  correction and deletion rights.
- **Offline queue with background sync** — so work done on patchy connections is not lost.

## Decisions made where the spec was open

- **First visit vs corrupt data.** A missing `lokah:v1` key is treated as a first visit (no
  notice). Only unreadable or invalid data shows the "started fresh" notice.
- **Submitted → Pending review.** Both statuses are recorded on submit, at the same timestamp,
  so the lifecycle stays visible in History without an extra manual step.
- **Reviewer can override the suggestion.** The suggestion guides; the reviewer decides.
- **Reset clears language too.** Reset returns the whole demo to its first-visit state.
- **Image unavailable also disables submit,** matching the audio rule, so nobody describes an
  image they could not see.
- **Audio availability** is checked with a `HEAD` request (status + `audio/*` content type)
  before the player is shown. No audio is downloaded until the user presses play.
- **Weekly goal** counts tasks submitted at least once since Monday 00:00 local time.
- **No streak** is shown; the spec made it optional.
- **"(English only)" example.** The "Not an official Kenpath product" line is intentionally left
  untranslated so the fallback tag can be seen in Kannada mode.
- **Kannada strings** need proofreading by a native speaker (`TODO(user)` in `src/i18n/kn.ts`).
