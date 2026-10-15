import { describe, expect, it } from 'vitest';
import { TASKS, getTask } from '../data/tasks';
import type { DescribeImageTask, ListenAnswer, ListenVerifyTask } from '../types';
import { DESCRIPTION_MAX, suggestReview, validateDescription } from './review';

const imageTask = getTask('di-01') as DescribeImageTask;

function listenTask(id: string): ListenVerifyTask {
  const task = getTask(id);
  if (task?.kind !== 'listen_verify') throw new Error(`${id} is not a Listen & Verify task`);
  return task;
}

// Answer key, as recorded in the supplied clips.
const ANSWER_KEY: [id: string, clip: string, correct: ListenAnswer, wrong: ListenAnswer][] = [
  ['lv-kn-01', 'kn-1', 'matches', 'doesnt_match'],
  ['lv-kn-02', 'kn-2', 'doesnt_match', 'matches'],
  ['lv-en-01', 'en-1', 'matches', 'doesnt_match'],
  ['lv-en-02', 'en-2', 'matches', 'doesnt_match'],
];

// Lists files only; nothing is imported.
const AUDIO_FILES = Object.keys(import.meta.glob('/public/audio/*')).map((path) =>
  path.replace('/public', ''),
);

describe('Listen & Verify answer key', () => {
  it('covers every Listen & Verify task, with kn-2 as the only mismatch', () => {
    const listenIds = TASKS.filter((t) => t.kind === 'listen_verify').map((t) => t.id);
    expect(listenIds.sort()).toEqual(ANSWER_KEY.map(([id]) => id).sort());
    const mismatches = ANSWER_KEY.filter(([id]) => !listenTask(id).transcriptMatchesAudio);
    expect(mismatches.map(([id]) => id)).toEqual(['lv-kn-02']);
  });

  it.each(ANSWER_KEY)('%s uses %s.ogg first, then %s.mp3', (id, clip) => {
    expect(listenTask(id).audioSources).toEqual([
      { src: `/audio/${clip}.ogg`, type: 'audio/ogg; codecs=opus' },
      { src: `/audio/${clip}.mp3`, type: 'audio/mpeg' },
    ]);
  });

  it.each(ANSWER_KEY)('%s: every audio file exists in public/audio', (id) => {
    for (const { src } of listenTask(id).audioSources) {
      expect(AUDIO_FILES).toContain(src);
    }
  });

  it.each(ANSWER_KEY)('%s: correct answer "%s" → suggest approve', (id, _audio, correct) => {
    const suggestion = suggestReview(listenTask(id), { kind: 'listen_verify', choice: correct });
    expect(suggestion.outcome).toBe('approve');
  });

  it.each(ANSWER_KEY)(
    '%s: wrong answer → suggest needs revision with an explanation',
    (id, _audio, _correct, wrong) => {
      const suggestion = suggestReview(listenTask(id), { kind: 'listen_verify', choice: wrong });
      expect(suggestion.outcome).toBe('needs_revision');
      expect(suggestion.reason.en.length).toBeGreaterThan(0);
      expect(suggestion.reason.kn?.length).toBeGreaterThan(0);
    },
  );

  it('kn-2 explains what was actually said when someone answers "Matches"', () => {
    const suggestion = suggestReview(listenTask('lv-kn-02'), {
      kind: 'listen_verify',
      choice: 'matches',
    });
    expect(suggestion.reason.en).toContain('The speaker said ಹತ್ತು (ten), not ಒಂಬತ್ತು (nine).');
    expect(suggestion.reason.kn).toContain('ಹತ್ತು');
  });

  it('never auto-suggests approval for image descriptions', () => {
    const suggestion = suggestReview(imageTask, {
      kind: 'describe_image',
      text: 'A man stands behind a wooden cart full of tomatoes and green chillies.',
    });
    expect(suggestion.outcome).toBe('manual');
  });
});

describe('validateDescription', () => {
  const { instructions } = imageTask;

  it('rejects empty and whitespace-only text', () => {
    expect(validateDescription('', instructions)).toBe('empty');
    expect(validateDescription('   \n\t ', instructions)).toBe('empty');
  });

  it('rejects text shorter than 40 characters', () => {
    expect(validateDescription('A vegetable stall.', instructions)).toBe('too_short');
    // Padding with whitespace does not help.
    expect(validateDescription(`   ${'a'.repeat(39)}   `, instructions)).toBe('too_short');
  });

  it('rejects text longer than 500 characters', () => {
    expect(validateDescription('word '.repeat(101), instructions)).toBe('too_long');
    expect(validateDescription('a'.repeat(DESCRIPTION_MAX), instructions)).toBeNull();
  });

  it('rejects a copy of the instruction text, in either language', () => {
    expect(validateDescription(instructions.en, instructions)).toBe('copied');
    expect(validateDescription(instructions.en.toUpperCase(), instructions)).toBe('copied');
    expect(validateDescription(`${instructions.en} Okay.`, instructions)).toBe('copied');
    expect(validateDescription(instructions.kn ?? '', instructions)).toBe('copied');
  });

  it('accepts a valid description', () => {
    expect(
      validateDescription(
        'A man stands behind a wooden cart full of tomatoes and green chillies.',
        instructions,
      ),
    ).toBeNull();
  });

  it('counts Kannada characters by code point', () => {
    const kannada = 'ಒಬ್ಬ ವ್ಯಕ್ತಿ ಟೊಮೇಟೊ ಮತ್ತು ಹಸಿರು ಮೆಣಸಿನಕಾಯಿ ತುಂಬಿದ ಗಾಡಿಯ ಹಿಂದೆ ನಿಂತಿದ್ದಾನೆ.';
    expect(validateDescription(kannada, instructions)).toBeNull();
  });
});
