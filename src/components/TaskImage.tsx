import { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import type { DescribeImageTask } from '../types';
import type { MediaStatus } from './AudioClip';
import { Icon } from './Icon';

export function TaskImage({
  task,
  onStatusChange,
}: {
  task: DescribeImageTask;
  onStatusChange: (status: MediaStatus) => void;
}) {
  const { t, lts } = useI18n();
  const [status, setStatus] = useState<MediaStatus>('checking');

  useEffect(() => {
    onStatusChange(status);
  }, [status, onStatusChange]);

  const ratio = `${task.imageWidth} / ${task.imageHeight}`;

  if (status === 'unavailable') {
    return (
      <div className="image-frame image-frame--error" style={{ aspectRatio: ratio }} role="alert">
        <Icon name="alert" />
        <span>{t('image.unavailable')}</span>
      </div>
    );
  }

  return (
    <div className="image-frame" style={{ aspectRatio: ratio }}>
      {status === 'checking' && (
        <span className="image-frame__loading" role="status">
          {t('image.loading')}
        </span>
      )}
      <img
        src={task.imageSrc}
        alt={lts(task.imageAlt)}
        width={task.imageWidth}
        height={task.imageHeight}
        loading="lazy"
        decoding="async"
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('unavailable')}
      />
    </div>
  );
}
