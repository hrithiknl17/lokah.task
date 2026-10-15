import { Icon } from '../components/Icon';
import { Money } from '../components/Money';
import { formatDateTime } from '../format';
import { useI18n } from '../i18n';
import { href } from '../router';
import { useAppState } from '../state/context';
import { selectEarnings, selectLedger } from '../state/selectors';

export function Earnings() {
  const { t, lt, lang } = useI18n();
  const { state } = useAppState();
  const earnings = selectEarnings(state);
  const ledger = selectLedger(state);

  return (
    <>
      <h1 tabIndex={-1}>{t('earnings.title')}</h1>

      <div className="summary-grid">
        <section className="card summary" aria-labelledby="earn-approved" data-testid="approved-total">
          <h2 id="earn-approved" className="summary__label">
            <Icon name="approved" size={18} />
            {t('earnings.approved')}
          </h2>
          <Money paise={earnings.approvedPaise} large />
          <p className="fine-print">{t('earnings.count', { n: earnings.approvedCount })}</p>
        </section>
        <section className="card summary" aria-labelledby="earn-pending" data-testid="pending-total">
          <h2 id="earn-pending" className="summary__label">
            <Icon name="pending_review" size={18} />
            {t('earnings.pending')}
          </h2>
          <Money paise={earnings.pendingPaise} large />
          <p className="fine-print">{t('earnings.count', { n: earnings.pendingCount })}</p>
        </section>
      </div>
      <p className="fine-print">{t('earnings.pendingNote')}</p>

      <section aria-labelledby="earn-ledger">
        <h2 id="earn-ledger">{t('earnings.ledger')}</h2>
        {ledger.length === 0 ? (
          <p className="empty">{t('earnings.empty')}</p>
        ) : (
          <ul className="ledger">
            {ledger.map((entry) => (
              <li key={entry.taskId} className="ledger__row">
                <div>
                  <a href={href.task(entry.taskId)}>{lt(entry.task.title)}</a>
                  <p className="fine-print">
                    <time dateTime={entry.approvedAt}>{formatDateTime(entry.approvedAt, lang)}</time>
                  </p>
                </div>
                <Money paise={entry.rewardPaise} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card" aria-labelledby="earn-payout">
        <h2 id="earn-payout">{t('earnings.payoutTitle')}</h2>
        <p>{t('earnings.payoutBody')}</p>
        <p className="fine-print">{t('task.ratesNote')}</p>
      </section>
    </>
  );
}
