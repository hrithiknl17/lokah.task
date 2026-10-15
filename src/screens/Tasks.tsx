import { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { TaskCard } from '../components/TaskCard';
import { TASKS } from '../data/tasks';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { useAppState } from '../state/context';
import { getStatus } from '../state/selectors';
import type { Task, TaskKind, TaskStatus } from '../types';

const GROUPS: { id: string; label: MessageKey; statuses: TaskStatus[] }[] = [
  { id: 'open', label: 'tasks.open', statuses: ['needs_revision', 'in_progress', 'available'] },
  { id: 'review', label: 'tasks.inReview', statuses: ['submitted', 'pending_review'] },
  { id: 'done', label: 'tasks.done', statuses: ['approved'] },
];

type Filter = 'all' | TaskKind;
const FILTERS: { value: Filter; label: MessageKey }[] = [
  { value: 'all', label: 'tasks.filterAll' },
  { value: 'listen_verify', label: 'kind.listen_verify' },
  { value: 'describe_image', label: 'kind.describe_image' },
];

export function Tasks() {
  const { t, ts } = useI18n();
  const { state } = useAppState();
  const [filter, setFilter] = useState<Filter>('all');
  const visible = TASKS.filter((task) => filter === 'all' || task.kind === filter);

  return (
    <>
      <PageHeader title={t('tasks.title')} />

      <div className="chips" role="group" aria-label={ts('tasks.filterLabel')}>
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
      <p className="fine-print">{t('task.ratesNote')}</p>

      {visible.length === 0 && <p className="empty">{t('tasks.emptyFilter')}</p>}

      {GROUPS.map((group) => {
        // Order within a group follows the status order above, then catalogue order.
        const tasks: Task[] = group.statuses.flatMap((status) =>
          visible.filter((task) => getStatus(state, task.id) === status),
        );
        if (tasks.length === 0) {
          if (group.id !== 'open' || visible.length === 0) return null;
          return (
            <section key={group.id} aria-labelledby={`group-${group.id}`}>
              <h2 id={`group-${group.id}`}>{t(group.label)}</h2>
              <p className="empty">{t('tasks.emptyOpen')}</p>
            </section>
          );
        }
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`}>
              {t(group.label)} <span className="count">({tasks.length})</span>
            </h2>
            <ul className="task-list">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} status={getStatus(state, task.id)} />
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
