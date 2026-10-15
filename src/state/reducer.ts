import { getTask } from '../data/tasks';
import type { Answer, AppState, Profile, StatusEvent, Submission } from '../types';
import { SCHEMA_VERSION } from '../types';
import { isAnswerAcceptable } from './review';

export type Action =
  | { type: 'START_TASK'; taskId: string; at: string }
  | { type: 'SUBMIT'; taskId: string; answer: Answer; at: string }
  | { type: 'REVIEW_APPROVE'; taskId: string; at: string; note?: string }
  | { type: 'REVIEW_REQUEST_REVISION'; taskId: string; at: string; reason: string }
  | { type: 'SET_PROFILE'; profile: Partial<Profile> }
  | { type: 'RESET' };

export const DISPLAY_NAME_MAX = 40;

export function createInitialState(): AppState {
  return {
    schemaVersion: SCHEMA_VERSION,
    submissions: {},
    profile: { displayName: '', language: 'en' },
  };
}

function withSubmission(state: AppState, submission: Submission): AppState {
  return {
    ...state,
    submissions: { ...state.submissions, [submission.taskId]: submission },
  };
}

function appendEvents(
  submission: Submission,
  events: StatusEvent[],
  patch: Partial<Submission> = {},
): Submission {
  const last = events[events.length - 1];
  return {
    ...submission,
    ...patch,
    status: last ? last.status : submission.status,
    history: [...submission.history, ...events],
  };
}

/**
 * The only place task status changes. Invalid transitions return the
 * existing state object unchanged.
 */
export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'START_TASK': {
      if (!getTask(action.taskId)) return state;
      if (state.submissions[action.taskId]) return state; // already started
      return withSubmission(state, {
        taskId: action.taskId,
        status: 'in_progress',
        history: [{ status: 'in_progress', at: action.at }],
      });
    }

    case 'SUBMIT': {
      const task = getTask(action.taskId);
      const current = state.submissions[action.taskId];
      if (!task || !current) return state;
      if (current.status !== 'in_progress' && current.status !== 'needs_revision') return state;
      if (!isAnswerAcceptable(task, action.answer)) return state;

      const resubmit = current.status === 'needs_revision';
      const { revisionReason: _dropped, ...rest } = current;
      void _dropped;
      return withSubmission(
        state,
        appendEvents(
          rest,
          [
            { status: 'submitted', at: action.at, ...(resubmit ? { note: 'Resubmitted' } : {}) },
            { status: 'pending_review', at: action.at },
          ],
          { answer: action.answer },
        ),
      );
    }

    case 'REVIEW_APPROVE': {
      const current = state.submissions[action.taskId];
      if (!current || current.status !== 'pending_review') return state;
      const note = action.note?.trim();
      return withSubmission(
        state,
        appendEvents(current, [{ status: 'approved', at: action.at, ...(note ? { note } : {}) }]),
      );
    }

    case 'REVIEW_REQUEST_REVISION': {
      const current = state.submissions[action.taskId];
      const reason = action.reason.trim();
      if (!current || current.status !== 'pending_review' || reason.length === 0) return state;
      return withSubmission(
        state,
        appendEvents(current, [{ status: 'needs_revision', at: action.at, note: reason }], {
          revisionReason: reason,
        }),
      );
    }

    case 'SET_PROFILE': {
      const { displayName, language } = action.profile;
      const next: Profile = { ...state.profile };
      if (typeof displayName === 'string') next.displayName = displayName.slice(0, DISPLAY_NAME_MAX);
      if (language === 'en' || language === 'kn') next.language = language;
      return { ...state, profile: next };
    }

    case 'RESET':
      return createInitialState();

    default:
      return state;
  }
}
