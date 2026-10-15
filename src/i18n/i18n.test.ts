import { describe, expect, it } from 'vitest';
import { TASKS } from '../data/tasks';
import { en } from './en';
import { lookup, lookupLocal } from './index';
import { kn } from './kn';

describe('i18n', () => {
  it('Kannada has no keys that English lacks', () => {
    const extra = Object.keys(kn).filter((key) => !(key in en));
    expect(extra).toEqual([]);
  });

  it('translates the required areas into Kannada', () => {
    const required = Object.keys(en).filter((key) =>
      /^(nav|status|task|listen|describe|reviewer|earnings)\./.test(key),
    );
    const missing = required.filter((key) => !(key in kn));
    expect(missing).toEqual([]);
  });

  it('keeps placeholders consistent between languages', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(',');
    for (const [key, value] of Object.entries(kn)) {
      expect(placeholders(value ?? ''), key).toBe(placeholders(en[key as keyof typeof en]));
    }
  });

  it('falls back to English and flags it when a Kannada key is missing', () => {
    expect(lookup('kn', 'app.notOfficial')).toEqual({ text: en['app.notOfficial'], fallback: true });
    expect(lookup('kn', 'nav.home')).toEqual({ text: kn['nav.home'], fallback: false });
    expect(lookup('en', 'nav.home')).toEqual({ text: 'Home', fallback: false });
  });

  it('interpolates variables', () => {
    expect(lookup('en', 'home.weeklyProgress', { done: 2, goal: 5 }).text).toBe(
      '2 of 5 tasks submitted',
    );
  });

  it('every task has Kannada title and instructions', () => {
    for (const task of TASKS) {
      expect(lookupLocal('kn', task.title).fallback, task.id).toBe(false);
      expect(lookupLocal('kn', task.instructions).fallback, task.id).toBe(false);
    }
  });
});
