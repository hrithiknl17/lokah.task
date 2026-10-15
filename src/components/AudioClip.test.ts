import { describe, expect, it } from 'vitest';
import type { AudioSource } from '../types';
import { type AudioProbe, findPlayableSource } from './AudioClip';

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
