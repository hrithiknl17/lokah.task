import { describe, expect, it } from 'vitest';
import { createInitialState, reducer } from './reducer';
import {
  type KeyValueStore,
  STORAGE_KEY,
  clearState,
  loadState,
  parseStored,
  saveState,
} from './storage';

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & {
  data: Map<string, string>;
} {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
    removeItem: (key) => void data.delete(key),
  };
}

function sampleState() {
  let state = createInitialState();
  state = reducer(state, { type: 'START_TASK', taskId: 'lv-kn-01', at: '2026-10-15T09:00:00.000Z' });
  state = reducer(state, {
    type: 'SUBMIT',
    taskId: 'lv-kn-01',
    answer: { kind: 'listen_verify', choice: 'matches' },
    at: '2026-10-15T09:01:00.000Z',
  });
  return reducer(state, { type: 'SET_PROFILE', profile: { language: 'kn' } });
}

describe('storage', () => {
  it('round-trips state with a schema version', () => {
    const store = memoryStore();
    const state = sampleState();
    expect(saveState(state, store)).toBe(true);
    expect(JSON.parse(store.data.get(STORAGE_KEY) ?? '{}').schemaVersion).toBe(1);
    expect(loadState(store)).toEqual({ state, recovered: false });
  });

  it('treats missing data as a first visit', () => {
    expect(loadState(memoryStore())).toEqual({ state: createInitialState(), recovered: false });
  });

  it.each([
    ['invalid JSON', '{not json'],
    ['wrong type', '"hello"'],
    ['null', 'null'],
    ['wrong schema version', JSON.stringify({ ...createInitialState(), schemaVersion: 99 })],
    ['missing profile', JSON.stringify({ schemaVersion: 1, submissions: {} })],
    [
      'bad status',
      JSON.stringify({
        ...createInitialState(),
        submissions: {
          'lv-kn-01': { taskId: 'lv-kn-01', status: 'paid', history: [{ status: 'paid', at: '2026-10-15T09:00:00.000Z' }] },
        },
      }),
    ],
    [
      'unknown task id',
      JSON.stringify({
        ...createInitialState(),
        submissions: {
          ghost: { taskId: 'ghost', status: 'approved', history: [{ status: 'approved', at: '2026-10-15T09:00:00.000Z' }] },
        },
      }),
    ],
    [
      'status disagrees with history',
      JSON.stringify({
        ...createInitialState(),
        submissions: {
          'lv-kn-01': { taskId: 'lv-kn-01', status: 'approved', history: [{ status: 'in_progress', at: '2026-10-15T09:00:00.000Z' }] },
        },
      }),
    ],
    [
      'bad date',
      JSON.stringify({
        ...createInitialState(),
        submissions: {
          'lv-kn-01': { taskId: 'lv-kn-01', status: 'in_progress', history: [{ status: 'in_progress', at: 'yesterday' }] },
        },
      }),
    ],
  ])('falls back to fresh state on corrupt data: %s', (_label, raw) => {
    const result = parseStored(raw);
    expect(result.state).toEqual(createInitialState());
    expect(result.recovered).toBe(true);
  });

  it('never throws when the store itself throws', () => {
    const broken: KeyValueStore = {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
      removeItem: () => {
        throw new Error('denied');
      },
    };
    expect(loadState(broken).recovered).toBe(true);
    expect(saveState(createInitialState(), broken)).toBe(false);
    expect(() => clearState(broken)).not.toThrow();
  });

  it('reset clears stored data', () => {
    const store = memoryStore();
    saveState(sampleState(), store);
    clearState(store);
    expect(store.data.has(STORAGE_KEY)).toBe(false);
    expect(loadState(store).state).toEqual(createInitialState());
  });
});
