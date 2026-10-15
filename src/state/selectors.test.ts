import { describe, expect, it } from 'vitest';
import { TASKS } from '../data/tasks';
import { createInitialState, reducer } from './reducer';
import type { Action } from './reducer';
import {
  selectApprovedByDay,
  selectHistory,
  selectOpenTasks,
  selectRecommendedTasks,
  selectStatusCounts,
  selectTaskTimelines,
  selectWeeklyProgress,
  startOfWeek,
} from './selectors';

function submitListen(taskId: string, at: string): Action[] {
  return [
    { type: 'START_TASK', taskId, at },
    { type: 'SUBMIT', taskId, answer: { kind: 'listen_verify', choice: 'matches' }, at },
  ];
}

function approveListen(taskId: string, at: string): Action[] {
  return [...submitListen(taskId, at), { type: 'REVIEW_APPROVE', taskId, at }];
}

const run = (actions: Action[]) => actions.reduce(reducer, createInitialState());

describe('redesign selectors', () => {
  it('recommends started tasks before untouched ones', () => {
    const state = run([{ type: 'START_TASK', taskId: 'di-02', at: '2026-10-15T09:00:00.000Z' }]);
    expect(selectRecommendedTasks(state, 2).map((t) => t.id)).toEqual(['di-02', 'lv-kn-01']);
    expect(selectRecommendedTasks(createInitialState(), 10)).toHaveLength(TASKS.length);
  });

  it('gives one history row per task, latest change first, events newest first', () => {
    const rows = selectTaskTimelines(
      run([
        ...approveListen('lv-kn-01', '2026-10-14T09:00:00.000Z'),
        { type: 'START_TASK', taskId: 'di-01', at: '2026-10-15T09:00:00.000Z' },
      ]),
    );
    expect(rows.map((r) => [r.task.id, r.status])).toEqual([
      ['di-01', 'in_progress'],
      ['lv-kn-01', 'approved'],
    ]);
    expect(rows[1]?.events.map((e) => e.status)).toEqual([
      'approved',
      'pending_review',
      'submitted',
      'in_progress',
    ]);
  });

  it('sums approved rewards per local day for the last 7 days', () => {
    const now = new Date(2026, 9, 15, 18);
    const days = selectApprovedByDay(
      run([
        ...approveListen('lv-kn-01', new Date(2026, 9, 15, 10).toISOString()), // today, ₹4
        ...approveListen('lv-kn-02', new Date(2026, 9, 15, 11).toISOString()), // today, ₹5
        ...approveListen('lv-en-01', new Date(2026, 9, 12, 10).toISOString()), // 3 days ago, ₹4
        ...approveListen('lv-en-02', new Date(2026, 9, 1, 10).toISOString()), // too old
      ]),
      now,
    );
    expect(days).toHaveLength(7);
    expect(days[0]?.day.getDate()).toBe(9);
    expect(days[6]?.day.getDate()).toBe(15);
    expect(days.map((d) => d.approvedPaise)).toEqual([0, 0, 0, 400, 0, 0, 900]);
  });

  it('never puts pending rewards in the per-day chart', () => {
    const now = new Date();
    const days = selectApprovedByDay(run(submitListen('lv-kn-01', now.toISOString())), now);
    expect(days.every((d) => d.approvedPaise === 0)).toBe(true);
  });
});

describe('selectors', () => {
  it('counts every task as available on a fresh state', () => {
    const counts = selectStatusCounts(createInitialState());
    expect(counts.available).toBe(TASKS.length);
    expect(selectOpenTasks(createInitialState())).toHaveLength(TASKS.length);
  });

  it('lists history newest first, keeping same-time events in reverse recorded order', () => {
    let state = createInitialState();
    state = reducer(state, { type: 'START_TASK', taskId: 'lv-kn-01', at: '2026-10-15T09:00:00.000Z' });
    state = reducer(state, {
      type: 'SUBMIT',
      taskId: 'lv-kn-01',
      answer: { kind: 'listen_verify', choice: 'matches' },
      at: '2026-10-15T09:01:00.000Z',
    });
    expect(selectHistory(state).map((e) => e.status)).toEqual([
      'pending_review',
      'submitted',
      'in_progress',
    ]);
  });

  it('weeks start on Monday', () => {
    // 2026-10-15 is a Thursday.
    const start = startOfWeek(new Date(2026, 9, 15, 14, 30));
    expect(start.getDay()).toBe(1);
    expect(start.getDate()).toBe(12);
    expect(startOfWeek(new Date(2026, 9, 18)).getDate()).toBe(12); // Sunday
  });

  it('weekly progress counts tasks submitted this week, once each', () => {
    const now = new Date(2026, 9, 15, 12);
    const thisWeek = new Date(2026, 9, 14, 10).toISOString();
    const lastWeek = new Date(2026, 9, 8, 10).toISOString();
    let state = createInitialState();
    state = reducer(state, { type: 'START_TASK', taskId: 'lv-kn-01', at: lastWeek });
    state = reducer(state, {
      type: 'SUBMIT',
      taskId: 'lv-kn-01',
      answer: { kind: 'listen_verify', choice: 'matches' },
      at: lastWeek,
    });
    expect(selectWeeklyProgress(state, now).completed).toBe(0);

    state = reducer(state, { type: 'START_TASK', taskId: 'lv-en-01', at: thisWeek });
    state = reducer(state, {
      type: 'SUBMIT',
      taskId: 'lv-en-01',
      answer: { kind: 'listen_verify', choice: 'matches' },
      at: thisWeek,
    });
    expect(selectWeeklyProgress(state, now)).toEqual({ goal: 5, completed: 1 });
  });
});
