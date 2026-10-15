export type Lang = 'en' | 'kn';

/** Text that may have a Kannada translation. English is always present. */
export interface LocalText {
  en: string;
  kn?: string;
}

export type TaskKind = 'listen_verify' | 'describe_image';

export const TASK_STATUSES = [
  'available',
  'in_progress',
  'submitted',
  'pending_review',
  'approved',
  'needs_revision',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

interface TaskBase {
  id: string;
  kind: TaskKind;
  title: LocalText;
  instructions: LocalText;
  /** Fictional demo reward, in paise (1 INR = 100 paise). */
  rewardPaise: number;
  /** Estimated time to complete, in minutes. Used for the ₹/hour estimate. */
  estMinutes: number;
}

export interface ListenVerifyTask extends TaskBase {
  kind: 'listen_verify';
  audioSrc: string;
  audioLanguage: Lang;
  /** Transcript shown to the user. */
  transcript: string;
  /** Answer key: does the transcript match what is spoken in the audio? */
  transcriptMatchesAudio: boolean;
  /** For mismatched transcripts: what is actually wrong, shown with a revision suggestion. */
  mismatchNote?: LocalText;
}

export interface DescribeImageTask extends TaskBase {
  kind: 'describe_image';
  imageSrc: string;
  imageAlt: LocalText;
  imageWidth: number;
  imageHeight: number;
}

export type Task = ListenVerifyTask | DescribeImageTask;

export type ListenAnswer = 'matches' | 'doesnt_match';

export type Answer =
  | { kind: 'listen_verify'; choice: ListenAnswer }
  | { kind: 'describe_image'; text: string };

export interface StatusEvent {
  status: TaskStatus;
  at: string; // ISO 8601
  note?: string;
}

/** One submission per task. The only source of truth for task progress. */
export interface Submission {
  taskId: string;
  status: TaskStatus;
  answer?: Answer;
  history: StatusEvent[];
  /** Plain-language reason, set when status is needs_revision. */
  revisionReason?: string;
}

export interface Profile {
  displayName: string;
  language: Lang;
}

export const SCHEMA_VERSION = 1;

export interface AppState {
  schemaVersion: typeof SCHEMA_VERSION;
  submissions: Record<string, Submission>;
  profile: Profile;
}

export type ReviewSuggestion =
  | { outcome: 'approve'; reason: LocalText }
  | { outcome: 'needs_revision'; reason: LocalText }
  | { outcome: 'manual'; reason: LocalText };

export type DescriptionError = 'empty' | 'too_short' | 'too_long' | 'copied';
