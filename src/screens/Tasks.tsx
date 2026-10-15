import type { ReactNode } from 'react';
import { TaskCard } from '../components/TaskCard';
import { TASKS } from '../data/tasks';
import { useI18n } from '../i18n';
import { useAppState } from '../state/context';
import { getStatus } from '../state/selectors';
import type { Task, TaskStatus } from '../types';

const GROUPS: { id: string; label: 'tasks.open' | 'tasks.inReview' | 'tasks.done'; statuses: TaskStatus[] }[] = [
  { id: 'open', label: 'tasks.open', statuses: ['needs_revision', 'in_progress', 'available'] },
  { id: 'review', label: 'tasks.inReview', statuses: ['submitted', 'pending_review'] },
  { id: 'done', label: 'tasks.done', statuses: ['approved'] },
];

export function Tasks() {
  const { t } = useI18n();
  const { state } = useAppState();

  return (
    <>
      <h1 tabIndex={-1}>{t('tasks.title')}</h1>
      <p className="fine-print">{t('task.ratesNote')}</p>
      {GROUPS.map((group) => {
        // Order within a group follows the status order above, then catalogue order.
        const tasks: Task[] = group.statuses.flatMap((status) =>
          TASKS.filter((task) => getStatus(state, task.id) === status),
        );
        let body: ReactNode;
        if (tasks.length > 0) {
          body = (
            <ul className="task-list">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} status={getStatus(state, task.id)} />
              ))}
            </ul>
          );
        } else if (group.id === 'open') {
          body = <p className="empty">{t('tasks.emptyOpen')}</p>;
        } else {
          return null;
        }
        return (
          <section key={group.id} aria-labelledby={`group-${group.id}`}>
            <h2 id={`group-${group.id}`}>
              {t(group.label)} <span className="count">({tasks.length})</span>
            </h2>
            {body}
          </section>
        );
      })}
    </>
  );
}
