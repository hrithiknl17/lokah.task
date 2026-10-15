import { useI18n } from '../i18n';
import type { TaskStatus } from '../types';
import { Icon } from './Icon';

/** Status is shown as icon + text, never colour alone. */
export function StatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useI18n();
  return (
    <span className={`status status--${status}`} data-status={status}>
      <Icon name={status} size={16} />
      <span>{t(`status.${status}`)}</span>
    </span>
  );
}
