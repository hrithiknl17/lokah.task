# Lokah Tasks — Project Guide for Claude Code

Mobile-first prototype of a platform where people complete small paid language-data tasks (speech + image) that help train AI. Portfolio assessment inspired by Kenpath Labs. **Not an official Kenpath product.**

Full product spec: `SPEC.md`. When this file and SPEC.md conflict, **this file wins**.

## Core principle

**Useful work. Fair rewards. Clear progress.**
People come back for fair pay and available work — never for points, streaks or pressure. Gamification stays secondary and minimal.

## Stack (do not add to this without asking)

- Vite + React + TypeScript (strict mode)
- State: `useReducer` + React context. No Redux/Zustand.
- Routing: hash-based, hand-rolled. No router library.
- Styling: plain CSS with CSS variables (or CSS modules). No Tailwind, no UI kit.
- Tests: Vitest (logic), Playwright (one e2e at 360px width).
- No paid APIs, no backend, no auth, no external credentials.

## Commands

```
npm install
npm run dev          # local dev server
npm run build        # production build
npm run test         # vitest
npm run test:e2e     # playwright
npm run lint
```

Run `npm run test` and `npm run build` before declaring any step done.

## Folder structure

```
src/
  types/          # all domain types
  data/
    tasks.ts      # task content, transcripts, answer keys, demo rates
  state/
    reducer.ts    # pure reducer — all status transitions live here
    selectors.ts  # derived earnings, counts, history
    storage.ts    # localStorage load/save/validate
    context.tsx
  i18n/
    en.ts
    kn.ts
  components/     # reusable UI
  screens/        # Home, Tasks, TaskDetail, Earnings, History, Profile
  App.tsx
public/
  audio/          # short compressed clips (user supplies)
  images/         # task images (user supplies)
tests/
  e2e/
```

## Data rules (non-negotiable)

1. **Single source of truth = submissions keyed by `taskId`.** One submission per task.
2. **Earnings, pending, approved, ledger and history are DERIVED** in `selectors.ts`. Never store balances separately. This makes duplicate rewards impossible by design.
3. Pending rewards are never counted as approved earnings.
4. Only the demo reviewer panel can move a task to Approved or Needs revision.
5. Only Approved creates an approved reward. Needs revision = no reward, with a plain-language reason shown.
6. Resubmitting after Needs revision replaces the submission (same `taskId`), appends to status history, never creates a second reward.

## Task lifecycle

```
Available → In progress → Submitted → Pending review → Approved
                                                      → Needs revision → (resubmit) → Pending review
```

Every transition appends `{ status, at: ISOString, note? }` to the task's status history. All transitions go through the reducer — no status mutation anywhere else. Invalid transitions are ignored (and unit-tested).

## Review logic

- **Listen & Verify:** user answer checked against the answer key on submit, but the task still goes to Pending review. The key decides what the demo reviewer *suggests*; the reviewer panel performs the approval. Wrong answer → reviewer suggestion is "Needs revision" with an explanation.
- **Describe an Image:** deterministic pre-checks only — min 40 chars, max 500, not empty/whitespace, not a copy of the instruction text. Passing moves it to Pending review. **Never auto-approve text.**
- **Demo reviewer panel:** clearly labelled *"Demo reviewer — simulated, not a real quality assessment."* Approve / Request revision buttons with a reason field.

## Rewards

- Fictional demo rates in `src/data/tasks.ts`, labelled *"Fictional example rates — not Kenpath Labs' rates."*
- Show reward per task **and estimated ₹/hour** on every task card, before starting.
- INR formatting via `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- Every amount on screen carries a "Demo data" label.
- **No withdraw/payout button.** Instead, explain that real payouts depend on the task agreement, quality review and payout policy.

## Persistence

- localStorage key `lokah:v1`, payload includes `schemaVersion`.
- Validate shape on load. On missing/corrupt data: fall back to fresh state and show a dismissible notice. Never crash.
- Reset demo requires a confirmation dialog.
- Store no personal or financial data. Profile = display name (optional) + language only.

## Assets

- Audio in `public/audio/`, images in `public/images/`. The user supplies these.
- Transcripts and answer keys in `src/data/tasks.ts` — leave `// TODO(user): fill exact transcript` markers where real text is needed.
- At least 3 Listen & Verify tasks (Kannada + English). **One transcript must be deliberately wrong** so "Doesn't match" is the correct answer.
- Never autoplay. `preload="none"`. On load error show "Audio unavailable — try again later" and disable submit for that task. Never render a broken player.
- Images: lazy-loaded, explicit width/height, alt text, fallback on error.

## i18n

- Plain dictionary objects `en.ts` / `kn.ts` with the same keys, typed from `en.ts`.
- Missing Kannada key → fall back to English and show a small "(English only)" tag.
- Translate at minimum: nav, task instructions, buttons, statuses, review outcomes, earnings disclaimers.
- Kannada text will be proofread by the user — keep strings short and simple.

## UI / design

- Mobile-first, optimised for 320–390px. **No horizontal scroll at 320px.**
- Warm white background, deep forest-green primary, charcoal text, subtle borders, soft cards.
- Touch targets ≥ 48px. Body text ≥ 16px.
- Status is never colour-only: always icon + text.
- Minimal animation, respect `prefers-reduced-motion`.
- No gradients, no hero illustrations, no confetti, no gaming look.
- Bottom nav on mobile: Home, Tasks, Earnings, History, Profile.

## Engagement (secondary, keep small)

- Weekly goal (e.g. 5 tasks), completed count, one milestone.
- Streak optional; if shown, never punishing ("No pressure — come back when tasks suit you").
- Banned: countdowns, fake scarcity, random rewards, leaderboards.

## Accessibility

Semantic HTML, labelled inputs, visible focus states, keyboard-operable everything, `aria-live` for submit results and errors.

## Out of scope

Auth, backend, real task allocation, real payouts/withdrawals, PWA/offline sync, analytics.

## Build order (commit after each)

1. Types + task data
2. Reducer + selectors + storage, with Vitest tests
3. Screens + navigation
4. Styling + mobile pass at 320px
5. i18n (en/kn)
6. Playwright e2e: browse → start → submit → pending → demo approve → earnings update → reload persists
7. README

## Tests that must exist (Vitest unless noted)

- Correct/incorrect Listen & Verify answer → correct reviewer suggestion
- Image description validation (too short, too long, copied instruction, valid)
- Submit → Pending review; pending not counted as approved
- Approve → approved reward created once; repeated approve/submit does not duplicate
- Needs revision → no reward; resubmit works
- Invalid transitions ignored
- Corrupt localStorage → safe fallback
- Reset clears state
- e2e (Playwright, 360px): full flow + persistence after reload + no horizontal scroll

## Definition of done

- All tests pass, build passes, no TypeScript errors.
- Every button does something real or is clearly labelled as simulated.
- Empty, loading, error and audio-unavailable states all exist.
- README covers: features, how to run, how data is stored, what's simulated, what production would need (server-side allocation, gold-standard + inter-annotator QA, reviewer tooling, KYC + UPI payouts, consent/data rights, offline queue with background sync).

## Working style

- Small commits with clear messages.
- Ask before adding any dependency.
- Don't invent features beyond the spec. If something is ambiguous, pick the simpler option and note it in the README.
