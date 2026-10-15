import { useState } from 'react';
import { ratePerHourPaise } from '../data/tasks';
import { formatPaise, formatPaiseRounded } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import type { Task, TaskStatus } from '../types';
import { Icon } from './Icon';
import { DemoTag } from './Money';
import { StatusBadge } from './StatusBadge';

/**
 * Small visual for a task. Image tasks show their real photo; audio tasks
 * have no photo, so they get a plain tile with the clip's language.
 */
export function TaskThumb({ task }: { task: Task }) {
  const [failed, setFailed] = useState(false);
  if (task.kind === 'describe_image' && !failed) {
    return (
      <span className="thumb">
        {/* Decorative here: the card title already names the task. */}
        <img
          src={task.imageSrc}
          alt=""
          width={task.imageWidth}
          height={task.imageHeight}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      </span>
    );
  }
  return (
    <span className="thumb thumb--tile" aria-hidden="true">
      <Icon name={task.kind === 'listen_verify' ? 'headphones' : 'image'} size={26} />
      {task.kind === 'listen_verify' && (
        <span className="thumb__lang">{task.audioLanguage.toUpperCase()}</span>
      )}
    </span>
  );
}

/** Time, reward and ₹/hour estimate, shown before a task is started. */
export function RewardSummary({ task }: { task: Task }) {
  const { t } = useI18n();
  return (
    <p className="reward-line">
      <span className="reward-line__time">
        <Icon name="clock" size={15} />
        {t('task.minutes', { n: task.estMinutes })}
      </span>
      <strong className="reward-line__amount">{formatPaise(task.rewardPaise)}</strong>
      <span className="reward-line__rate">
        {t('task.perHour', { rate: formatPaiseRounded(ratePerHourPaise(task)) })}
      </span>
      <DemoTag />
    </p>
  );
}

export function TaskCard({ task, status }: { task: Task; status: TaskStatus }) {
  const { t, lt } = useI18n();
  return (
    <li className="task-card">
      <a className="task-card__link" href={href.task(task.id)}>
        <TaskThumb task={task} />
        <div className="task-card__body">
          <div className="task-card__top">
            <span className="kind-pill">{t(`kind.${task.kind}`)}</span>
            {status !== 'available' && <StatusBadge status={status} />}
          </div>
          <h3 className="task-card__title">{lt(task.title)}</h3>
          <RewardSummary task={task} />
        </div>
        <span className="task-card__chevron">
          <Icon name="chevronRight" size={18} />
        </span>
      </a>
    </li>
  );
}
