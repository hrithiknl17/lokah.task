import { getTask } from '../data/tasks';
import type { Answer, AppState, StatusEvent, Submission } from '../types';
import { SCHEMA_VERSION, TASK_STATUSES } from '../types';
import { createInitialState } from './reducer';

export const STORAGE_KEY = 'lokah:v1';

/** The subset of the Web Storage API we use; lets tests pass an in-memory store. */
export interface KeyValueStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface LoadResult {
  state: AppState;
  /** True when saved data existed but could not be used. */
  recovered: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStatus(value: unknown): value is StatusEvent['status'] {
  return typeof value === 'string' && (TASK_STATUSES as readonly string[]).includes(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function isEvent(value: unknown): value is StatusEvent {
  return (
    isRecord(value) &&
    isStatus(value.status) &&
    isIsoDate(value.at) &&
    (value.note === undefined || typeof value.note === 'string')
  );
}

function isAnswer(value: unknown, taskKind: string): value is Answer {
  if (!isRecord(value) || value.kind !== taskKind) return false;
  if (value.kind === 'listen_verify') {
    return value.choice === 'matches' || value.choice === 'doesnt_match';
  }
  return typeof value.text === 'string';
}

function isSubmission(key: string, value: unknown): value is Submission {
  if (!isRecord(value)) return false;
  const task = getTask(key);
  if (!task || value.taskId !== key) return false;
  if (!isStatus(value.status) || value.status === 'available') return false;
  if (!Array.isArray(value.history) || value.history.length === 0) return false;
  if (!value.history.every(isEvent)) return false;
  const last = value.history[value.history.length - 1] as StatusEvent;
  if (last.status !== value.status) return false;
  if (value.answer !== undefined && !isAnswer(value.answer, task.kind)) return false;
  if (value.revisionReason !== undefined && typeof value.revisionReason !== 'string') return false;
  return true;
}

/** Validate an unknown parsed value. Returns null if anything is off. */
export function validateState(value: unknown): AppState | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== SCHEMA_VERSION) return null;

  const { submissions, profile } = value;
  if (!isRecord(submissions) || !isRecord(profile)) return null;
  for (const [key, submission] of Object.entries(submissions)) {
    if (!isSubmission(key, submission)) return null;
  }
  if (typeof profile.displayName !== 'string') return null;
  if (profile.language !== 'en' && profile.language !== 'kn') return null;

  return {
    schemaVersion: SCHEMA_VERSION,
    submissions: submissions as Record<string, Submission>,
    profile: { displayName: profile.displayName, language: profile.language },
  };
}

/** Parse a raw stored string. Missing data is a first visit, not an error. */
export function parseStored(raw: string | null): LoadResult {
  if (raw === null) return { state: createInitialState(), recovered: false };
  try {
    const state = validateState(JSON.parse(raw));
    if (state) return { state, recovered: false };
  } catch {
    // fall through to fresh state
  }
  return { state: createInitialState(), recovered: true };
}

export function loadState(store: KeyValueStore | null = getBrowserStore()): LoadResult {
  if (!store) return { state: createInitialState(), recovered: false };
  let raw: string | null;
  try {
    raw = store.getItem(STORAGE_KEY);
  } catch {
    return { state: createInitialState(), recovered: true };
  }
  return parseStored(raw);
}

/** Returns false if the browser refused the write (quota, private mode). */
export function saveState(state: AppState, store: KeyValueStore | null = getBrowserStore()): boolean {
  if (!store) return false;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearState(store: KeyValueStore | null = getBrowserStore()): void {
  try {
    store?.removeItem(STORAGE_KEY);
  } catch {
    // nothing to clear
  }
}

function getBrowserStore(): KeyValueStore | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    return null;
  }
}
