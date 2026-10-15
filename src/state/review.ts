import type {
  Answer,
  DescriptionError,
  LocalText,
  ReviewSuggestion,
  Task,
} from '../types';

export const DESCRIPTION_MIN = 40;
export const DESCRIPTION_MAX = 500;

/** Count user-visible characters by code point, not UTF-16 unit. */
function length(text: string): number {
  return [...text].length;
}

/** Lowercase, collapse whitespace and punctuation, so copies are caught despite small edits. */
function normalize(text: string): string {
  return text
    .normalize('NFC')
    .toLowerCase()
    .replace(/[\s\p{P}\p{S}]+/gu, ' ')
    .trim();
}

function texts(value: LocalText): string[] {
  return [value.en, value.kn].filter((s): s is string => typeof s === 'string' && s.length > 0);
}

/** Either text contains the other, after normalising. */
function contains(a: string, b: string): boolean {
  return a.includes(b) || b.includes(a);
}

function wordPairs(normalized: string): string[] {
  const words = normalized.split(' ').filter(Boolean);
  return words.slice(1).map((word, i) => `${words[i]} ${word}`);
}

/**
 * Share of the answer's consecutive word pairs that also appear in the
 * source. A pasted text with a word or two changed still scores high; an
 * honest description that reuses a few words ("auto rickshaw") does not.
 */
function pairOverlap(answer: string, source: string): number {
  const pairs = wordPairs(answer);
  if (pairs.length === 0) return 0;
  const sourcePairs = new Set(wordPairs(source));
  return pairs.filter((pair) => sourcePairs.has(pair)).length / pairs.length;
}

/** At or above this share of word pairs from the alt text, the answer counts as copied. */
export const ALT_OVERLAP_LIMIT = 0.75;

/**
 * Deterministic pre-checks for an image description.
 * Returns null when the text may go to review. Passing never means approved.
 */
export function validateDescription(
  text: string,
  instructions: LocalText,
  imageAlt?: LocalText,
): DescriptionError | null {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 'empty';
  if (length(trimmed) < DESCRIPTION_MIN) return 'too_short';
  if (length(trimmed) > DESCRIPTION_MAX) return 'too_long';

  const answer = normalize(trimmed);
  for (const source of texts(instructions)) {
    if (contains(answer, normalize(source))) return 'copied';
  }
  // The alt text is readable by anyone (screen readers, page source), so a
  // pasted or lightly edited copy of it is not the worker's own description.
  for (const source of imageAlt ? texts(imageAlt) : []) {
    const alt = normalize(source);
    if (contains(answer, alt) || pairOverlap(answer, alt) >= ALT_OVERLAP_LIMIT) {
      return 'copied_alt';
    }
  }
  return null;
}

/** Append a task-specific note to a generic reason, per language. */
function withNote(reason: LocalText, note: LocalText | undefined): LocalText {
  if (!note) return reason;
  const kn = reason.kn && note.kn ? `${reason.kn} ${note.kn}` : undefined;
  return { en: `${reason.en} ${note.en}`, ...(kn ? { kn } : {}) };
}

/**
 * What the demo reviewer is told before deciding. The reviewer panel still
 * makes the final call; nothing here approves a task on its own.
 */
export function suggestReview(task: Task, answer: Answer): ReviewSuggestion {
  if (task.kind === 'listen_verify' && answer.kind === 'listen_verify') {
    const expected = task.transcriptMatchesAudio ? 'matches' : 'doesnt_match';
    if (answer.choice === expected) {
      return {
        outcome: 'approve',
        reason: {
          en: 'Answer agrees with the answer key.',
          kn: 'ಉತ್ತರವು ಉತ್ತರ ಕೀಲಿಗೆ ಹೊಂದುತ್ತದೆ.',
        },
      };
    }
    return {
      outcome: 'needs_revision',
      reason: task.transcriptMatchesAudio
        ? {
            en: 'The transcript matches the audio, but the answer said it does not. Listen again.',
            kn: 'ಬರಹವು ಧ್ವನಿಗೆ ಹೊಂದುತ್ತದೆ, ಆದರೆ ಉತ್ತರ ಹೊಂದುವುದಿಲ್ಲ ಎಂದಿದೆ. ಮತ್ತೆ ಕೇಳಿ.',
          }
        : withNote(
            {
              en: 'The transcript has a mistake, but the answer said it matches. Listen again and compare each word.',
              kn: 'ಬರಹದಲ್ಲಿ ತಪ್ಪಿದೆ, ಆದರೆ ಉತ್ತರ ಹೊಂದುತ್ತದೆ ಎಂದಿದೆ. ಮತ್ತೆ ಕೇಳಿ, ಪ್ರತಿ ಪದ ಹೋಲಿಸಿ.',
            },
            task.mismatchNote,
          ),
    };
  }
  return {
    outcome: 'manual',
    reason: {
      en: 'Passed basic checks. Read the description and decide.',
      kn: 'ಮೂಲ ಪರಿಶೀಲನೆ ಪಾಸಾಗಿದೆ. ವಿವರಣೆ ಓದಿ ನಿರ್ಧರಿಸಿ.',
    },
  };
}

/** True when the answer is well-formed for this task and passes pre-checks. */
export function isAnswerAcceptable(task: Task, answer: Answer): boolean {
  if (task.kind !== answer.kind) return false;
  if (answer.kind === 'listen_verify') {
    return answer.choice === 'matches' || answer.choice === 'doesnt_match';
  }
  if (task.kind !== 'describe_image') return false;
  return validateDescription(answer.text, task.instructions, task.imageAlt) === null;
}
