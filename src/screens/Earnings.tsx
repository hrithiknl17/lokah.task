import { Icon } from '../components/Icon';
import { DemoTag, Money } from '../components/Money';
import { PageHeader } from '../components/PageHeader';
import { TaskThumb } from '../components/TaskCard';
import { formatDateTime, formatPaise, formatWeekday } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import { useAppState } from '../state/context';
import { type DayTotal, selectApprovedByDay, selectEarnings, selectLedger } from '../state/selectors';

/** Approved rewards per day. Built from real approvals only; pending never appears. */
function WeekChart({ days }: { days: DayTotal[] }) {
  const { t, lang } = useI18n();
  const max = Math.max(...days.map((d) => d.approvedPaise));

  return (
    <section className="panel" aria-labelledby="earn-week">
      <h2 id="earn-week">
        {t('earnings.week')} <DemoTag />
      </h2>
      {max === 0 ? (
        <p className="empty empty--quiet">{t('earnings.weekEmpty')}</p>
      ) : (
        <ol className="chart">
          {days.map((d) => (
            <li key={d.day.toISOString()} className="chart__day">
              <span className="chart__value">
                {d.approvedPaise > 0 ? formatPaise(d.approvedPaise) : ''}
              </span>
              <span className="chart__track" aria-hidden="true">
                <span
                  className="chart__bar"
                  style={{ height: `${Math.max(4, (d.approvedPaise / max) * 100)}%` }}
                  data-empty={d.approvedPaise === 0 || undefined}
                />
              </span>
              <span className="chart__label">{formatWeekday(d.day, lang)}</span>
              {d.approvedPaise === 0 && <span className="visually-hidden">{formatPaise(0)}</span>}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

export function Earnings() {
  const { t, lt, lang } = useI18n();
  const { state } = useAppState();
  const earnings = selectEarnings(state);
  const ledger = selectLedger(state);
  const week = selectApprovedByDay(state, new Date());

  return (
    <>
      <PageHeader title={t('earnings.title')} />

      <div className="stat-pair">
        <section className="stat stat--column" aria-labelledby="earn-approved" data-testid="approved-total">
          <span className="stat__icon stat__icon--ok">
            <Icon name="wallet" size={22} />
          </span>
          <h2 id="earn-approved" className="stat__label">
            {t('earnings.approved')}
          </h2>
          <Money paise={earnings.approvedPaise} large />
          <p className="stat__meta">{t('earnings.count', { n: earnings.approvedCount })}</p>
        </section>
        <section className="stat stat--column" aria-labelledby="earn-pending" data-testid="pending-total">
          <span className="stat__icon stat__icon--warn">
            <Icon name="pending_review" size={22} />
          </span>
          <h2 id="earn-pending" className="stat__label">
            {t('earnings.pending')}
          </h2>
          <Money paise={earnings.pendingPaise} large />
          <p className="stat__meta">{t('earnings.count', { n: earnings.pendingCount })}</p>
        </section>
      </div>
      <p className="fine-print">{t('earnings.pendingNote')}</p>

      <WeekChart days={week} />

      <section aria-labelledby="earn-ledger">
        <h2 id="earn-ledger">{t('earnings.ledger')}</h2>
        {ledger.length === 0 ? (
          <p className="empty">{t('earnings.empty')}</p>
        ) : (
          <ul className="row-list">
            {ledger.map((entry) => (
              <li key={entry.taskId} className="row">
                <TaskThumb task={entry.task} />
                <div className="row__body">
                  <a className="row__title" href={href.task(entry.taskId)}>
                    {lt(entry.task.title)}
                  </a>
                  <p className="row__meta">
                    <time dateTime={entry.approvedAt}>{formatDateTime(entry.approvedAt, lang)}</time>
                  </p>
                </div>
                <Money paise={entry.rewardPaise} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="panel panel--mint" aria-labelledby="earn-payout">
        <h2 id="earn-payout">{t('earnings.payoutTitle')}</h2>
        <p>{t('earnings.payoutBody')}</p>
        <p className="fine-print">{t('task.ratesNote')}</p>
      </section>
    </>
  );
}
