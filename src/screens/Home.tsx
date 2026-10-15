import { Icon, LogoMark } from '../components/Icon';
import { DemoTag } from '../components/Money';
import { TaskCard } from '../components/TaskCard';
import { formatPaise } from '../format';
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

/** A real local photo (also used by the "Describe a phone call" task). */
const HERO_IMAGE = { src: '/images/di-03.jpg', width: 640, height: 480 };

export function Home() {
  const { t, ts } = useI18n();
  const { state } = useAppState();
  const name = state.profile.displayName.trim();
  const weekly = selectWeeklyProgress(state, new Date());
  const earnings = selectEarnings(state);
  const milestone = selectMilestoneReached(state);
  const picked = selectRecommendedTasks(state, 2);

  return (
    <>
      <header className="home-top">
        <span className="brand">
          <LogoMark />
          <span className="brand__name">{t('app.name')}</span>
        </span>
        <a className="avatar avatar--small" href={href.profile} aria-label={ts('nav.profile')}>
          {name ? name.charAt(0).toUpperCase() : <Icon name="user" size={20} />}
        </a>
      </header>

      <section className="hero" aria-labelledby="home-title">
        <div className="hero__text">
          {name && <p className="hero__hello">{t('home.helloName', { name })}</p>}
          <h1 id="home-title" tabIndex={-1}>
            {t('home.heroTitle')}
          </h1>
          <p className="hero__lede">{t('app.tagline')}</p>
          <a className="button button--primary" href={href.tasks}>
            {t('home.browse')}
            <Icon name="arrowRight" size={18} />
          </a>
        </div>
        <img
          className="hero__img"
          src={HERO_IMAGE.src}
          alt=""
          width={HERO_IMAGE.width}
          height={HERO_IMAGE.height}
          fetchPriority="high"
        />
      </section>

      <section aria-labelledby="home-rewards">
        <div className="section-head">
          <h2 id="home-rewards">
            {t('home.rewards')} <DemoTag />
          </h2>
          <a className="text-link" href={href.earnings}>
            {t('home.viewEarnings')}
            <Icon name="arrowRight" size={16} />
          </a>
        </div>
        <div className="stat-pair">
          <div className="stat">
            <span className="stat__icon stat__icon--ok">
              <Icon name="wallet" size={22} />
            </span>
            <div>
              <p className="stat__label">{t('earnings.approved')}</p>
              <p className="stat__value">{formatPaise(earnings.approvedPaise)}</p>
              <p className="stat__meta">{t('earnings.count', { n: earnings.approvedCount })}</p>
            </div>
          </div>
          <div className="stat">
            <span className="stat__icon stat__icon--warn">
              <Icon name="pending_review" size={22} />
            </span>
            <div>
              <p className="stat__label">{t('earnings.pending')}</p>
              <p className="stat__value">{formatPaise(earnings.pendingPaise)}</p>
              <p className="stat__meta">{t('earnings.count', { n: earnings.pendingCount })}</p>
            </div>
          </div>
        </div>
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
