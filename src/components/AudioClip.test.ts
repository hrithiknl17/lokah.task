import { describe, expect, it } from 'vitest';
import type { AudioSource } from '../types';
import { type AudioProbe, computePeaks, findPlayableSource, formatClock } from './AudioClip';

describe('computePeaks', () => {
  it('takes the loudest sample per slice and scales to the loudest slice', () => {
    const samples = new Float32Array([0.1, -0.5, 0.2, 0.25, -1, 0.3]);
    expect(computePeaks(samples, 3)).toEqual([0.5, 0.25, 1]);
  });

  it('keeps quiet slices visible with a floor', () => {
    const samples = new Float32Array([0, 0, 0.01, 0.01, 1, 1]);
    expect(computePeaks(samples, 3)).toEqual([0.12, 0.12, 1]);
  });

  it('handles silence and empty input', () => {
    expect(computePeaks(new Float32Array(8), 4)).toEqual([0.12, 0.12, 0.12, 0.12]);
    expect(computePeaks(new Float32Array(0), 4)).toEqual([]);
  });
});

describe('formatClock', () => {
  it('formats seconds as m:ss', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(4.34)).toBe('0:04');
    expect(formatClock(75)).toBe('1:15');
  });

  it('shows a placeholder until the duration is known', () => {
    expect(formatClock(Number.NaN)).toBe('-:--');
    expect(formatClock(Number.POSITIVE_INFINITY)).toBe('-:--');
  });
});

const SOURCES: AudioSource[] = [
  { src: '/audio/kn-1.ogg', type: 'audio/ogg; codecs=opus' },
  { src: '/audio/kn-1.mp3', type: 'audio/mpeg' },
];

const canPlayBoth = () => true;
const canPlayMp3Only = (type: string) => type === 'audio/mpeg';

/** A probe that answers from a fixed set of existing files and records calls. */
function fakeProbe(existing: string[]): AudioProbe & { calls: string[] } {
  const calls: string[] = [];
  const probe = async (src: string) => {
    calls.push(src);
    return existing.includes(src);
  };
  return Object.assign(probe, { calls });
}

const signal = () => new AbortController().signal;

describe('findPlayableSource', () => {
  it('prefers ogg when the browser plays it and it exists', async () => {
    const probe = fakeProbe(['/audio/kn-1.ogg', '/audio/kn-1.mp3']);
    expect(await findPlayableSource(SOURCES, canPlayBoth, probe, signal())).toBe(0);
    expect(probe.calls).toEqual(['/audio/kn-1.ogg']);
  });

  it('falls back to mp3 when the ogg file is missing', async () => {
    const probe = fakeProbe(['/audio/kn-1.mp3']);
    expect(await findPlayableSource(SOURCES, canPlayBoth, probe, signal())).toBe(1);
  });

  it('skips ogg without requesting it when the browser cannot play Opus', async () => {
    const probe = fakeProbe(['/audio/kn-1.ogg', '/audio/kn-1.mp3']);
    expect(await findPlayableSource(SOURCES, canPlayMp3Only, probe, signal())).toBe(1);
    expect(probe.calls).toEqual(['/audio/kn-1.mp3']);
  });

  it('tries the next source after a network error', async () => {
    const probe: AudioProbe = async (src) => {
      if (src.endsWith('.ogg')) throw new TypeError('Failed to fetch');
      return true;
    };
    expect(await findPlayableSource(SOURCES, canPlayBoth, probe, signal())).toBe(1);
  });

  it('returns -1 when nothing can play', async () => {
    expect(await findPlayableSource(SOURCES, canPlayBoth, fakeProbe([]), signal())).toBe(-1);
    expect(await findPlayableSource(SOURCES, () => false, fakeProbe([]), signal())).toBe(-1);
  });

  it('stops once aborted', async () => {
    const controller = new AbortController();
    const probe: AudioProbe = async () => {
      controller.abort();
      return false;
    };
    expect(await findPlayableSource(SOURCES, canPlayBoth, probe, controller.signal)).toBe(-1);
  });
});
