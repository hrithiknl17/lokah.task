import { TASKS, getTask } from '../data/tasks';
import type { AppState, StatusEvent, Task, TaskStatus } from '../types';

/*
 * Everything money-related is derived from submissions here.
 * Nothing in state stores a balance, so a reward cannot be counted twice.
 */

export const WEEKLY_GOAL = 5;
export const MILESTONE_APPROVED = 5;

export function getStatus(state: AppState, taskId: string): TaskStatus {
  return state.submissions[taskId]?.status ?? 'available';
}

const PENDING: ReadonlySet<TaskStatus> = new Set(['submitted', 'pending_review']);

export interface EarningsSummary {
  approvedPaise: number;
  approvedCount: number;
  pendingPaise: number;
  pendingCount: number;
}

export function selectEarnings(state: AppState): EarningsSummary {
  const summary: EarningsSummary = {
    approvedPaise: 0,
    approvedCount: 0,
    pendingPaise: 0,
    pendingCount: 0,
  };
  for (const submission of Object.values(state.submissions)) {
    const task = getTask(submission.taskId);
    if (!task) continue;
    if (submission.status === 'approved') {
      summary.approvedPaise += task.rewardPaise;
      summary.approvedCount += 1;
    } else if (PENDING.has(submission.status)) {
      summary.pendingPaise += task.rewardPaise;
      summary.pendingCount += 1;
    }
  }
  return summary;
}

export interface LedgerEntry {
  taskId: string;
  task: Task;
  rewardPaise: number;
  approvedAt: string;
}

/** One entry per approved task, newest first. */
export function selectLedger(state: AppState): LedgerEntry[] {
  const entries: LedgerEntry[] = [];
  for (const submission of Object.values(state.submissions)) {
    if (submission.status !== 'approved') continue;
    const task = getTask(submission.taskId);
    if (!task) continue;
    const approvedEvent = [...submission.history].reverse().find((e) => e.status === 'approved');
    entries.push({
      taskId: submission.taskId,
      task,
      rewardPaise: task.rewardPaise,
      approvedAt: approvedEvent?.at ?? '',
    });
  }
  return entries.sort((a, b) => b.approvedAt.localeCompare(a.approvedAt));
}

export interface HistoryEntry extends StatusEvent {
  taskId: string;
  task: Task;
}

/** Every status change across all tasks, newest first. */
export function selectHistory(state: AppState): HistoryEntry[] {
  const entries: HistoryEntry[] = [];
  for (const submission of Object.values(state.submissions)) {
    const task = getTask(submission.taskId);
    if (!task) continue;
    for (const event of submission.history) {
      entries.push({ ...event, taskId: submission.taskId, task });
    }
  }
  // Stable sort keeps same-timestamp events in recorded order; reverse for newest first.
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => a.entry.at.localeCompare(b.entry.at) || a.index - b.index)
    .reverse()
    .map(({ entry }) => entry);
}

export function selectStatusCounts(state: AppState): Record<TaskStatus, number> {
  const counts: Record<TaskStatus, number> = {
    available: 0,
    in_progress: 0,
    submitted: 0,
    pending_review: 0,
    approved: 0,
    needs_revision: 0,
  };
  for (const task of TASKS) counts[getStatus(state, task.id)] += 1;
  return counts;
}

/** Start of the current week (Monday 00:00, local time). */
export function startOfWeek(now: Date): Date {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const daysSinceMonday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

export interface WeeklyProgress {
  goal: number;
  completed: number;
}

/** Tasks submitted at least once this week. Counts each task once. */
export function selectWeeklyProgress(state: AppState, now: Date): WeeklyProgress {
  const since = startOfWeek(now).getTime();
  let completed = 0;
  for (const submission of Object.values(state.submissions)) {
    const submittedThisWeek = submission.history.some(
      (e) => e.status === 'submitted' && new Date(e.at).getTime() >= since,
    );
    if (submittedThisWeek) completed += 1;
  }
  return { goal: WEEKLY_GOAL, completed };
}

export function selectMilestoneReached(state: AppState): boolean {
  return selectEarnings(state).approvedCount >= MILESTONE_APPROVED;
}

/** Tasks the user can act on now: available, in progress, or needing revision. */
export function selectOpenTasks(state: AppState): Task[] {
  return TASKS.filter((task) => {
    const status = getStatus(state, task.id);
    return status === 'available' || status === 'in_progress' || status === 'needs_revision';
  });
}
