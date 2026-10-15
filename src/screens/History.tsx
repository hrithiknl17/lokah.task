import { useState } from 'react';
import { DemoTag } from '../components/Money';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { TaskThumb } from '../components/TaskCard';
import { formatDateTime, formatPaise } from '../format';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { href } from '../router';
import { useAppState } from '../state/context';
import { selectTaskTimelines } from '../state/selectors';
import type { TaskStatus } from '../types';

type Filter = 'all' | 'approved' | 'pending' | 'needs_revision';
const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: 'all', label: 'tasks.filterAll' },
  { value: 'approved', label: 'status.approved' },
  { value: 'pending', label: 'history.pending' },
  { value: 'needs_revision', label: 'status.needs_revision' },
];

function matches(filter: Filter, status: TaskStatus): boolean {
  if (filter === 'all') return true;
  if (filter === 'pending') return status === 'submitted' || status === 'pending_review';
  return status === filter;
}

export function History() {
  const { t, ts, lt, lang } = useI18n();
  const { state } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const rows = selectTaskTimelines(state);
  const visible = rows.filter((row) => matches(filter, row.status));

  return (
    <>
      <PageHeader title={t('history.title')} />

      {rows.length === 0 ? (
        <p className="empty">{t('history.empty')}</p>
      ) : (
        <>
          <div className="chips" role="group" aria-label={ts('history.filterLabel')}>
            {FILTERS.map((option) => (
              <button
                key={option.value}
                type="button"
                className="chip"
                aria-pressed={filter === option.value}
                onClick={() => setFilter(option.value)}
              >
                {t(option.label)}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <p className="empty">{t('history.emptyFilter')}</p>
          ) : (
            <ul className="row-list">
              {visible.map((row) => (
                <li key={row.task.id} className="row row--history">
                  <TaskThumb task={row.task} />
                  <div className="row__body">
                    <a className="row__title" href={href.task(row.task.id)}>
                      {lt(row.task.title)}
                    </a>
                    <p className="row__meta">
                      <time dateTime={row.lastAt}>{formatDateTime(row.lastAt, lang)}</time>
                    </p>
                    <p className="row__reward">
                      <strong>{formatPaise(row.task.rewardPaise)}</strong> <DemoTag />
                    </p>
                  </div>
                  <StatusBadge status={row.status} />
                  <details className="row__details">
                    <summary>{t('history.timeline')}</summary>
                    <ol className="timeline">
                      {row.events.map((event, index) => (
                        <li key={`${event.at}-${event.status}-${index}`} className="timeline__item">
                          <StatusBadge status={event.status} />
                          <time className="fine-print" dateTime={event.at}>
                            {formatDateTime(event.at, lang)}
                          </time>
                          {event.note && (
                            <p className="timeline__note">
                              {event.note === 'Resubmitted' ? t('history.resubmitted') : event.note}
                            </p>
                          )}
                        </li>
                      ))}
                    </ol>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
