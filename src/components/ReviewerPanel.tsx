import { useId, useState } from 'react';
import { useI18n } from '../i18n';
import { nowIso, useAppState } from '../state/context';
import { suggestReview } from '../state/review';
import type { Answer, Task } from '../types';
import { Icon } from './Icon';

export type ReviewResult = 'approved' | 'revision';

/**
 * Simulated reviewer. The only UI that can approve or request revision.
 * The answer key only shapes the suggestion; a person still presses the button.
 */
export function ReviewerPanel({
  task,
  answer,
  onResult,
}: {
  task: Task;
  answer: Answer;
  onResult: (result: ReviewResult) => void;
}) {
  const { t, lt, lts } = useI18n();
  const { dispatch } = useAppState();
  const suggestion = suggestReview(task, answer);
  const [reason, setReason] = useState(() =>
    suggestion.outcome === 'needs_revision' ? lts(suggestion.reason) : '',
  );
  const [reasonError, setReasonError] = useState(false);
  const reasonId = useId();
  const errorId = useId();

  const approve = () => {
    dispatch({ type: 'REVIEW_APPROVE', taskId: task.id, at: nowIso() });
    onResult('approved');
  };

  const requestRevision = () => {
    if (reason.trim().length === 0) {
      setReasonError(true);
      return;
    }
    dispatch({ type: 'REVIEW_REQUEST_REVISION', taskId: task.id, at: nowIso(), reason });
    onResult('revision');
  };

  return (
    <section className="reviewer" aria-labelledby={`${reasonId}-title`}>
      <h2 id={`${reasonId}-title`} className="reviewer__title">
        {t('reviewer.title')}
      </h2>
      <p className="reviewer__disclaimer">
        <Icon name="info" size={18} />
        <span>{t('reviewer.disclaimer')}</span>
      </p>

      <dl className="reviewer__facts">
        <dt>{t('reviewer.suggestion')}</dt>
        <dd data-testid="reviewer-suggestion" data-outcome={suggestion.outcome}>
          <strong>{t(`reviewer.suggest.${suggestion.outcome}`)}</strong> — {lt(suggestion.reason)}
        </dd>
      </dl>

      <div className="reviewer__actions">
        <button type="button" className="button button--primary" onClick={approve}>
          <Icon name="approved" />
          {t('reviewer.approve')}
        </button>
      </div>

      <div className="field">
        <label htmlFor={reasonId}>{t('reviewer.reasonLabel')}</label>
        <textarea
          id={reasonId}
          rows={3}
          value={reason}
          aria-invalid={reasonError || undefined}
          aria-describedby={reasonError ? errorId : undefined}
          onChange={(e) => {
            setReason(e.target.value);
            if (reasonError) setReasonError(false);
          }}
        />
        {reasonError && (
          <p id={errorId} className="field__error" role="alert">
            <Icon name="alert" size={18} />
            <span>{t('reviewer.reasonRequired')}</span>
          </p>
        )}
      </div>
      <button type="button" className="button button--secondary" onClick={requestRevision}>
        <Icon name="needs_revision" />
        {t('reviewer.requestRevision')}
      </button>
    </section>
  );
}
