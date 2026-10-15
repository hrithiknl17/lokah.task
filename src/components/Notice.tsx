import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { Icon } from './Icon';

type Tone = 'info' | 'warning' | 'success' | 'error';

const ICON = { info: 'info', warning: 'alert', success: 'approved', error: 'alert' } as const;

export function Notice({
  tone = 'info',
  children,
  onDismiss,
}: {
  tone?: Tone;
  children: ReactNode;
  onDismiss?: () => void;
}) {
  const { ts } = useI18n();
  return (
    <div className={`notice notice--${tone}`}>
      <Icon name={ICON[tone]} />
      <div className="notice__body">{children}</div>
      {onDismiss && (
        <button type="button" className="icon-button" onClick={onDismiss} aria-label={ts('common.dismiss')}>
          <Icon name="close" />
        </button>
      )}
    </div>
  );
}
