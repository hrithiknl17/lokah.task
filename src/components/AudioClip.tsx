import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import type { Lang } from '../types';
import { Icon } from './Icon';

export type MediaStatus = 'checking' | 'ready' | 'unavailable';

/**
 * Checks the clip exists before rendering a player, so a broken player is
 * never shown. The check is a HEAD request: no audio is downloaded until the
 * user presses play (preload="none", never autoplay).
 */
export function AudioClip({
  src,
  language,
  onStatusChange,
}: {
  src: string;
  language: Lang;
  onStatusChange: (status: MediaStatus) => void;
}) {
  const { t, ts } = useI18n();
  const [status, setStatus] = useState<MediaStatus>('checking');

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('checking');
    fetch(src, { method: 'HEAD', signal: controller.signal })
      .then((res) => {
        const type = res.headers.get('content-type') ?? '';
        // Dev servers answer missing files with index.html, so check the type too.
        setStatus(res.ok && type.startsWith('audio/') ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus('unavailable');
      });
    return () => controller.abort();
  }, [src]);

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

  return (
    <audio
      className="audio"
      controls
      preload="none"
      src={src}
      lang={language}
      aria-label={ts('audio.label', { lang: ts(`lang.${language}`) })}
      onError={() => setStatus('unavailable')}
    />
  );
}
