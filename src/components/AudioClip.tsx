import { useEffect, useState } from 'react';
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
  const [status, setStatus] = useState<MediaStatus>('checking');
  const [first, setFirst] = useState(0);
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

  // Start from the first reachable source; later ones remain as fallbacks.
  const playable = sources.slice(first);
  return (
    <audio
      className="audio"
      controls
      preload="none"
      lang={language}
      aria-label={ts('audio.label', { lang: ts(`lang.${language}`) })}
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
  );
}
