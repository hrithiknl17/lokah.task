import { StatusBadge } from '../components/StatusBadge';
import { formatDateTime } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import { useAppState } from '../state/context';
import { selectHistory } from '../state/selectors';

export function History() {
  const { t, lt, lang } = useI18n();
  const { state } = useAppState();
  const entries = selectHistory(state);

  return (
    <>
      <h1 tabIndex={-1}>{t('history.title')}</h1>
      {entries.length === 0 ? (
        <p className="empty">{t('history.empty')}</p>
      ) : (
        <ol className="timeline">
          {entries.map((entry, index) => (
            <li key={`${entry.taskId}-${entry.at}-${entry.status}-${index}`} className="timeline__item">
              <div className="timeline__top">
                <StatusBadge status={entry.status} />
                <time className="fine-print" dateTime={entry.at}>
                  {formatDateTime(entry.at, lang)}
                </time>
              </div>
              <a href={href.task(entry.taskId)}>{lt(entry.task.title)}</a>
              {entry.note && (
                <p className="timeline__note">
                  {entry.note === 'Resubmitted' ? t('history.resubmitted') : entry.note}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </>
  );
}
