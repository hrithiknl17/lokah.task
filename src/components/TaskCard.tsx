import { ratePerHourPaise } from '../data/tasks';
import { formatPaise } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import type { Task, TaskStatus } from '../types';
import { Icon } from './Icon';
import { RewardLine } from './Money';
import { StatusBadge } from './StatusBadge';

export function RewardSummary({ task }: { task: Task }) {
  const { t } = useI18n();
  return (
    <RewardLine>
      <strong className="reward-line__amount">{formatPaise(task.rewardPaise)}</strong>
      <span className="reward-line__sep" aria-hidden="true">
        ·
      </span>
      <span>{t('task.perHour', { rate: formatPaise(ratePerHourPaise(task)) })}</span>
      <span className="reward-line__sep" aria-hidden="true">
        ·
      </span>
      <span>{t('task.minutes', { n: task.estMinutes })}</span>
    </RewardLine>
  );
}

export function TaskCard({ task, status }: { task: Task; status: TaskStatus }) {
  const { t, lt } = useI18n();
  return (
    <li className="card task-card">
      <a className="task-card__link" href={href.task(task.id)}>
        <div className="task-card__top">
          <span className="task-card__kind">{t(`kind.${task.kind}`)}</span>
          <StatusBadge status={status} />
        </div>
        <h3 className="task-card__title">{lt(task.title)}</h3>
        <RewardSummary task={task} />
        <Icon name="chevronRight" />
      </a>
    </li>
  );
}
