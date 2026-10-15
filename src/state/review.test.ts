import { describe, expect, it } from 'vitest';
import { getTask } from '../data/tasks';
import type { DescribeImageTask, ListenVerifyTask } from '../types';
import { DESCRIPTION_MAX, suggestReview, validateDescription } from './review';

const matchingTask = getTask('lv-kn-01') as ListenVerifyTask;
const wrongTranscriptTask = getTask('lv-en-02') as ListenVerifyTask;
const imageTask = getTask('di-01') as DescribeImageTask;

describe('Listen & Verify reviewer suggestion', () => {
  it('test data includes a deliberately wrong transcript', () => {
    expect(matchingTask.transcriptMatchesAudio).toBe(true);
    expect(wrongTranscriptTask.transcriptMatchesAudio).toBe(false);
  });

  it('suggests approve when the answer agrees with the key', () => {
    expect(suggestReview(matchingTask, { kind: 'listen_verify', choice: 'matches' }).outcome).toBe(
      'approve',
    );
    expect(
      suggestReview(wrongTranscriptTask, { kind: 'listen_verify', choice: 'doesnt_match' }).outcome,
    ).toBe('approve');
  });

  it('suggests needs revision with an explanation when the answer is wrong', () => {
    const wrongOnMatch = suggestReview(matchingTask, {
      kind: 'listen_verify',
      choice: 'doesnt_match',
    });
    expect(wrongOnMatch.outcome).toBe('needs_revision');
    expect(wrongOnMatch.reason.en.length).toBeGreaterThan(0);

    const wrongOnMismatch = suggestReview(wrongTranscriptTask, {
      kind: 'listen_verify',
      choice: 'matches',
    });
    expect(wrongOnMismatch.outcome).toBe('needs_revision');
    expect(wrongOnMismatch.reason.en).toMatch(/mistake/);
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
