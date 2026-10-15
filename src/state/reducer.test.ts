import { describe, expect, it } from 'vitest';
import type { AppState } from '../types';
import { type Action, createInitialState, reducer } from './reducer';
import { selectEarnings, selectLedger } from './selectors';

const T0 = '2026-10-15T09:00:00.000Z';
const T1 = '2026-10-15T09:05:00.000Z';
const T2 = '2026-10-15T09:10:00.000Z';
const T3 = '2026-10-15T09:15:00.000Z';

const VALID_TEXT = 'A man stands behind a wooden cart full of tomatoes and green chillies.';

function run(actions: Action[], from: AppState = createInitialState()): AppState {
  return actions.reduce(reducer, from);
}

const startListen: Action = { type: 'START_TASK', taskId: 'lv-kn-01', at: T0 };
const submitListen: Action = {
  type: 'SUBMIT',
  taskId: 'lv-kn-01',
  answer: { kind: 'listen_verify', choice: 'matches' },
  at: T1,
};
const approveListen: Action = { type: 'REVIEW_APPROVE', taskId: 'lv-kn-01', at: T2 };

describe('submit', () => {
  it('moves the task to Pending review and records history', () => {
    const state = run([startListen, submitListen]);
    const submission = state.submissions['lv-kn-01'];
    expect(submission?.status).toBe('pending_review');
    expect(submission?.history.map((e) => e.status)).toEqual([
      'in_progress',
      'submitted',
      'pending_review',
    ]);
    expect(submission?.history.every((e) => typeof e.at === 'string')).toBe(true);
  });

  it('does not count pending rewards as approved earnings', () => {
    const earnings = selectEarnings(run([startListen, submitListen]));
    expect(earnings.approvedPaise).toBe(0);
    expect(earnings.approvedCount).toBe(0);
    expect(earnings.pendingPaise).toBe(400);
    expect(earnings.pendingCount).toBe(1);
  });

  it('rejects an image description that fails pre-checks', () => {
    const started = run([{ type: 'START_TASK', taskId: 'di-01', at: T0 }]);
    const after = reducer(started, {
      type: 'SUBMIT',
      taskId: 'di-01',
      answer: { kind: 'describe_image', text: 'too short' },
      at: T1,
    });
    expect(after).toBe(started);
  });

  it('accepts a valid image description into Pending review, never Approved', () => {
    const state = run([
      { type: 'START_TASK', taskId: 'di-01', at: T0 },
      { type: 'SUBMIT', taskId: 'di-01', answer: { kind: 'describe_image', text: VALID_TEXT }, at: T1 },
    ]);
    expect(state.submissions['di-01']?.status).toBe('pending_review');
  });
});

describe('approve', () => {
  it('creates exactly one approved reward', () => {
    const state = run([startListen, submitListen, approveListen]);
    expect(state.submissions['lv-kn-01']?.status).toBe('approved');
    const earnings = selectEarnings(state);
    expect(earnings.approvedPaise).toBe(400);
    expect(earnings.pendingPaise).toBe(0);
    expect(selectLedger(state)).toHaveLength(1);
  });

  it('ignores repeated approve and submit — no duplicate reward', () => {
    const approved = run([startListen, submitListen, approveListen]);
    const again = run(
      [approveListen, submitListen, { ...approveListen, at: T3 }, startListen],
      approved,
    );
    expect(again).toBe(approved);
    expect(selectEarnings(again).approvedPaise).toBe(400);
    expect(selectLedger(again)).toHaveLength(1);
  });
});

describe('needs revision', () => {
  const requestRevision: Action = {
    type: 'REVIEW_REQUEST_REVISION',
    taskId: 'lv-kn-01',
    at: T2,
    reason: 'The transcript matches. Listen again.',
  };

  it('gives no reward and stores a plain-language reason', () => {
    const state = run([startListen, submitListen, requestRevision]);
    const submission = state.submissions['lv-kn-01'];
    expect(submission?.status).toBe('needs_revision');
    expect(submission?.revisionReason).toBe('The transcript matches. Listen again.');
    expect(submission?.history.at(-1)?.note).toBe('The transcript matches. Listen again.');
    const earnings = selectEarnings(state);
    expect(earnings.approvedPaise).toBe(0);
    expect(earnings.pendingPaise).toBe(0);
  });

  it('requires a reason', () => {
    const pending = run([startListen, submitListen]);
    expect(reducer(pending, { ...requestRevision, reason: '   ' })).toBe(pending);
  });

  it('resubmit replaces the submission, appends history, and rewards once', () => {
    const resubmitted = run([
      startListen,
      submitListen,
      requestRevision,
      { ...submitListen, answer: { kind: 'listen_verify', choice: 'doesnt_match' }, at: T3 },
    ]);
    const submission = resubmitted.submissions['lv-kn-01'];
    expect(Object.keys(resubmitted.submissions)).toEqual(['lv-kn-01']);
    expect(submission?.status).toBe('pending_review');
    expect(submission?.answer).toEqual({ kind: 'listen_verify', choice: 'doesnt_match' });
    expect(submission?.revisionReason).toBeUndefined();
    expect(submission?.history.map((e) => e.status)).toEqual([
      'in_progress',
      'submitted',
      'pending_review',
      'needs_revision',
      'submitted',
      'pending_review',
    ]);
    expect(submission?.history[4]?.note).toBe('Resubmitted');

    const approved = reducer(resubmitted, { ...approveListen, at: T3 });
    expect(selectEarnings(approved).approvedPaise).toBe(400);
    expect(selectLedger(approved)).toHaveLength(1);
  });
});

describe('invalid transitions are ignored', () => {
  const fresh = createInitialState();

  it.each<[string, Action, AppState]>([
    ['submit before start', submitListen, fresh],
    ['approve before submit', approveListen, run([startListen])],
    [
      'request revision before submit',
      { type: 'REVIEW_REQUEST_REVISION', taskId: 'lv-kn-01', at: T1, reason: 'x' },
      run([startListen]),
    ],
    ['start twice', { ...startListen, at: T1 }, run([startListen])],
    ['unknown task', { type: 'START_TASK', taskId: 'nope', at: T0 }, fresh],
    [
      'answer type does not match task kind',
      {
        type: 'SUBMIT',
        taskId: 'lv-kn-01',
        answer: { kind: 'describe_image', text: VALID_TEXT },
        at: T1,
      },
      run([startListen]),
    ],
    [
      'revision after approval',
      { type: 'REVIEW_REQUEST_REVISION', taskId: 'lv-kn-01', at: T3, reason: 'late' },
      run([startListen, submitListen, approveListen]),
    ],
  ])('%s', (_label, action, before) => {
    expect(reducer(before, action)).toBe(before);
  });
});

describe('profile and reset', () => {
  it('updates display name and language only with valid values', () => {
    const state = run([
      { type: 'SET_PROFILE', profile: { displayName: 'Asha', language: 'kn' } },
      // Invalid language is ignored.
      { type: 'SET_PROFILE', profile: { language: 'fr' as never } },
    ]);
    expect(state.profile).toEqual({ displayName: 'Asha', language: 'kn' });
  });

  it('reset clears all state', () => {
    const busy = run([
      startListen,
      submitListen,
      approveListen,
      { type: 'SET_PROFILE', profile: { displayName: 'Asha', language: 'kn' } },
    ]);
    expect(reducer(busy, { type: 'RESET' })).toEqual(createInitialState());
  });
});
