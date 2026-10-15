import { Icon, LogoMark } from '../components/Icon';
import { DemoTag } from '../components/Money';
import { TaskCard } from '../components/TaskCard';
import { formatPaise, splitPaise } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import { useAppState } from '../state/context';
import {
  MILESTONE_APPROVED,
  getStatus,
  selectEarnings,
  selectMilestoneReached,
  selectRecommendedTasks,
  selectWeeklyProgress,
} from '../state/selectors';

export function Home() {
  const { t, ts } = useI18n();
  const { state } = useAppState();
  const name = state.profile.displayName.trim();
  const weekly = selectWeeklyProgress(state, new Date());
  const earnings = selectEarnings(state);
  const milestone = selectMilestoneReached(state);
  const picked = selectRecommendedTasks(state, 2);
  const total = splitPaise(earnings.approvedPaise);

  return (
    <>
      <div className="welcome">
        <div className="welcome__bar">
          <a className="round-link" href={href.profile} aria-label={ts('nav.profile')}>
            {name ? name.charAt(0).toUpperCase() : <Icon name="user" size={22} />}
          </a>
          <span className="welcome__mark">
            <LogoMark size={34} />
          </span>
          <a className="round-link" href={href.history} aria-label={ts('nav.history')}>
            <Icon name="bell" size={22} />
          </a>
        </div>

        <p className="welcome__kicker">
          {name ? t('home.welcomeBack', { name }) : t('home.welcome')}
        </p>
        <h1 className="welcome__title" tabIndex={-1}>
          {t('app.name')}
        </h1>
        <p className="welcome__lede">{t('app.tagline')}</p>
        <a className="button button--mint" href={href.tasks}>
          {t('home.browse')}
          <Icon name="arrowRight" size={20} />
        </a>
      </div>

      <section className="earnings-panel" aria-labelledby="home-earnings">
        <div className="earnings-panel__head">
          <div>
            <h2 id="home-earnings" className="earnings-panel__label">
              {t('home.earnings')} <DemoTag />
            </h2>
            <p className="earnings-panel__sub">{t('home.total')}</p>
          </div>
          <a className="round-link round-link--muted" href={href.earnings} aria-label={ts('home.viewEarnings')}>
            <Icon name="arrowUpRight" size={22} />
          </a>
        </div>
        <p className="earnings-panel__amount">
          <span className="earnings-panel__whole">{total.whole}</span>
          <span className="earnings-panel__fraction">{total.fraction}</span>
        </p>
        <p className="earnings-panel__pending">
          {t('home.pendingLine', { amount: formatPaise(earnings.pendingPaise) })}
        </p>
      </section>

      <section aria-labelledby="home-picked">
        <div className="section-head">
          <h2 id="home-picked">{t('home.picked')}</h2>
          <a className="text-link" href={href.tasks}>
            {t('home.viewAll')}
            <Icon name="arrowRight" size={16} />
          </a>
        </div>
        {picked.length > 0 ? (
          <ul className="task-list">
            {picked.map((task) => (
              <TaskCard key={task.id} task={task} status={getStatus(state, task.id)} />
            ))}
          </ul>
        ) : (
          <p className="empty">{t('tasks.emptyOpen')}</p>
        )}
      </section>

      <section className="panel" aria-labelledby="home-week">
        <h2 id="home-week">{t('home.weekly')}</h2>
        <p>{t('home.weeklyProgress', { done: weekly.completed, goal: weekly.goal })}</p>
        <progress
          className="progress"
          max={weekly.goal}
          value={Math.min(weekly.completed, weekly.goal)}
          aria-label={ts('home.weekly')}
        />
        <p className="milestone">
          <Icon name={milestone ? 'approved' : 'available'} size={18} />
          <span>
            {t(milestone ? 'home.milestoneReached' : 'home.milestone', { n: MILESTONE_APPROVED })}
          </span>
        </p>
        <p className="fine-print">{t('home.noPressure')}</p>
      </section>
    </>
  );
}
