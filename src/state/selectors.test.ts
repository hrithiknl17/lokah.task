import { describe, expect, it } from 'vitest';
import { TASKS } from '../data/tasks';
import { createInitialState, reducer } from './reducer';
import {
  selectHistory,
  selectOpenTasks,
  selectStatusCounts,
  selectWeeklyProgress,
  startOfWeek,
} from './selectors';

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
