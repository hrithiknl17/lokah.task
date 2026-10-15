import { Icon } from '../components/Icon';
import { Money } from '../components/Money';
import { TaskCard } from '../components/TaskCard';
import { useI18n } from '../i18n';
import { href } from '../router';
import { useAppState } from '../state/context';
import {
  MILESTONE_APPROVED,
  getStatus,
  selectEarnings,
  selectMilestoneReached,
  selectOpenTasks,
  selectWeeklyProgress,
} from '../state/selectors';

export function Home() {
  const { t, ts } = useI18n();
  const { state } = useAppState();
  const name = state.profile.displayName.trim();
  const weekly = selectWeeklyProgress(state, new Date());
  const earnings = selectEarnings(state);
  const milestone = selectMilestoneReached(state);
  const open = selectOpenTasks(state);
  const continuing = open.filter((task) => getStatus(state, task.id) !== 'available');

  return (
    <>
      <h1 tabIndex={-1}>{name ? t('home.helloName', { name }) : t('home.hello')}</h1>
      <p className="lede">{t('app.tagline')}</p>

      {continuing.length > 0 && (
        <section aria-labelledby="home-continue">
          <h2 id="home-continue">{t('home.continue')}</h2>
          <ul className="task-list">
            {continuing.map((task) => (
              <TaskCard key={task.id} task={task} status={getStatus(state, task.id)} />
            ))}
          </ul>
        </section>
      )}

      <section className="card" aria-labelledby="home-tasks">
        <h2 id="home-tasks">{t('nav.tasks')}</h2>
        <p>{t('home.available', { n: open.length })}</p>
        <a className="button button--primary button--block" href={href.tasks}>
          {t('home.browse')}
        </a>
      </section>

      <section className="card" aria-labelledby="home-earnings">
        <h2 id="home-earnings">{t('home.earnings')}</h2>
        <dl className="stat-list">
          <div>
            <dt>{t('earnings.approved')}</dt>
            <dd>
              <Money paise={earnings.approvedPaise} />
            </dd>
          </div>
          <div>
            <dt>{t('earnings.pending')}</dt>
            <dd>
              <Money paise={earnings.pendingPaise} />
            </dd>
          </div>
        </dl>
        <a className="text-link" href={href.earnings}>
          {t('home.viewEarnings')}
        </a>
      </section>

      <section className="card" aria-labelledby="home-week">
        <h2 id="home-week">{t('home.weekly')}</h2>
        <p>{t('home.weeklyProgress', { done: weekly.completed, goal: weekly.goal })}</p>
        <progress
          className="progress"
          max={weekly.goal}
          value={Math.min(weekly.completed, weekly.goal)}
          aria-label={ts('home.weekly')}
        />
        <p className="fine-print">{t('home.noPressure')}</p>
        <p className="milestone">
          <Icon name={milestone ? 'approved' : 'available'} size={18} />
          <span>
            {t(milestone ? 'home.milestoneReached' : 'home.milestone', { n: MILESTONE_APPROVED })}
          </span>
        </p>
      </section>
    </>
  );
}
