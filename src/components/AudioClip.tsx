import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useI18n } from '../i18n';
import type { AudioSource, Lang } from '../types';
import { Icon } from './Icon';

export type MediaStatus = 'checking' | 'ready' | 'unavailable';

/** Returns true when a file exists and is served as audio. */
export type AudioProbe = (src: string, signal: AbortSignal) => Promise<boolean>;

export const headProbe: AudioProbe = async (src, signal) => {
  const res = await fetch(src, { method: 'HEAD', signal });
  // Dev servers answer missing files with index.html, so check the type too.
  return res.ok && (res.headers.get('content-type') ?? '').startsWith('audio/');
};

/**
 * Index of the first source this browser can decode and the server actually
 * has, or -1. Sources are tried in order, so the preferred format wins.
 */
export async function findPlayableSource(
  sources: readonly AudioSource[],
  canPlay: (type: string) => boolean,
  probe: AudioProbe,
  signal: AbortSignal,
): Promise<number> {
  for (const [index, source] of sources.entries()) {
    if (!canPlay(source.type)) continue;
    try {
      if (await probe(source.src, signal)) return index;
    } catch {
      // Network error: try the next format.
    }
    if (signal.aborted) return -1;
  }
  return -1;
}

const FLOOR = 0.12;
const BAR_COUNT = 48;
/** Shown until the clip has played once; nothing is downloaded before that. */
const FLAT = Array.from({ length: BAR_COUNT }, () => FLOOR);

/** Loudest sample per slice, scaled to 0..1, with a floor so quiet slices stay visible. */
export function computePeaks(samples: Float32Array, count: number): number[] {
  if (samples.length === 0 || count <= 0) return [];
  const slice = Math.max(1, Math.floor(samples.length / count));
  const peaks: number[] = [];
  for (let i = 0; i < count; i++) {
    let max = 0;
    const end = Math.min(samples.length, (i + 1) * slice);
    for (let j = i * slice; j < end; j++) {
      const value = Math.abs(samples[j] ?? 0);
      if (value > max) max = value;
    }
    peaks.push(max);
  }
  const loudest = Math.max(...peaks);
  if (loudest === 0) return peaks.map(() => FLOOR);
  return peaks.map((p) => Math.max(FLOOR, p / loudest));
}

/** Decode a clip the player has already fetched, to draw its real waveform. */
async function decodePeaks(src: string): Promise<number[] | null> {
  if (typeof OfflineAudioContext === 'undefined') return null;
  try {
    const data = await (await fetch(src)).arrayBuffer();
    const buffer = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(data);
    return computePeaks(buffer.getChannelData(0), BAR_COUNT);
  } catch {
    return null; // Keep the flat line; playback is unaffected.
  }
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '-:--';
  const whole = Math.floor(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

function browserCanPlay(type: string): boolean {
  return document.createElement('audio').canPlayType(type) !== '';
}

/**
 * Checks a clip exists before rendering a player, so a broken player is never
 * shown. The check is a HEAD request: no audio is downloaded until the user
 * presses play (preload="none", never autoplay).
 */
export function AudioClip({
  sources,
  language,
  onStatusChange,
}: {
  sources: readonly AudioSource[];
  language: Lang;
  onStatusChange: (status: MediaStatus) => void;
}) {
  const { t, ts } = useI18n();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [status, setStatus] = useState<MediaStatus>('checking');
  const [first, setFirst] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(Number.NaN);
  const [peaks, setPeaks] = useState<number[] | null>(null);
  const sourcesKey = sources.map((s) => s.src).join('|');

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('checking');
    void findPlayableSource(sources, browserCanPlay, headProbe, controller.signal).then((index) => {
      if (controller.signal.aborted) return;
      setFirst(Math.max(index, 0));
      setStatus(index >= 0 ? 'ready' : 'unavailable');
    });
    return () => controller.abort();
    // sourcesKey stands in for `sources`, whose identity may change between renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcesKey]);

  if (status === 'checking') {
    return (
      <p className="media-state" role="status">
        {t('audio.checking')}
      </p>
    );
  }

  if (status === 'unavailable') {
    return (
      <p className="media-state media-state--error" role="alert">
        <Icon name="alert" />
        <span>{t('audio.unavailable')}</span>
      </p>
    );
  }

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    audio
      .play()
      .then(() => {
        if (!peaks && audio.currentSrc) void decodePeaks(audio.currentSrc).then(setPeaks);
      })
      .catch((error: unknown) => {
        // No playable source after all. Other rejections (e.g. an interrupted
        // play) leave the player as it is.
        if (error instanceof DOMException && error.name === 'NotSupportedError') {
          setStatus('unavailable');
        }
      });
  };

  const known = Number.isFinite(duration) && duration > 0;
  const progress = known ? current / duration : 0;
  const bars = peaks ?? FLAT;
  const playable = sources.slice(first);

  return (
    <div className="player">
      <audio
        ref={audioRef}
        className="player__media"
        preload="none"
        lang={language}
        aria-label={ts('audio.label', { lang: ts(`lang.${language}`) })}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onDurationChange={(e) => setDuration(e.currentTarget.duration)}
        onError={() => setStatus('unavailable')}
      >
        {playable.map((source, index) => (
          <source
            key={source.src}
            src={source.src}
            type={source.type}
            // With <source> children, load failures fire on the source, not the
            // <audio>. Only the last one failing means nothing can play.
            onError={index === playable.length - 1 ? () => setStatus('unavailable') : undefined}
          />
        ))}
      </audio>

      <button
        type="button"
        className="player__play"
        aria-label={ts(playing ? 'audio.pause' : 'audio.play')}
        onClick={toggle}
      >
        <Icon name={playing ? 'pause' : 'play'} size={26} />
      </button>

      <div className="player__track">
        <div className="waveform" aria-hidden="true">
          {bars.map((height, i) => (
            <span
              key={i}
              className={(i + 0.5) / bars.length <= progress ? 'is-played' : undefined}
              style={{ '--h': height } as CSSProperties}
            />
          ))}
        </div>
        <input
          type="range"
          className="player__seek"
          min={0}
          max={known ? duration : 0}
          step={0.01}
          value={known ? current : 0}
          disabled={!known}
          aria-label={ts('audio.seek')}
          aria-valuetext={ts('audio.timeOf', {
            current: formatClock(current),
            total: formatClock(duration),
          })}
          onChange={(e) => {
            const audio = audioRef.current;
            if (audio) audio.currentTime = Number(e.target.value);
          }}
        />
      </div>

      <span className="player__time" aria-hidden="true">
        {formatClock(current)} / {formatClock(duration)}
      </span>
    </div>
  );
}
