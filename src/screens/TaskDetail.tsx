import {
  type FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { type MediaStatus, AudioClip } from '../components/AudioClip';
import { Icon } from '../components/Icon';
import { Notice } from '../components/Notice';
import { type ReviewResult, ReviewerPanel } from '../components/ReviewerPanel';
import { StatusBadge } from '../components/StatusBadge';
import { RewardSummary } from '../components/TaskCard';
import { TaskImage } from '../components/TaskImage';
import { TASKS, getTask } from '../data/tasks';
import { selectRecommendedTasks } from '../state/selectors';
import { useI18n } from '../i18n';
import type { MessageKey } from '../i18n/en';
import { href } from '../router';
import { nowIso, useAppState } from '../state/context';
import { DESCRIPTION_MAX, DESCRIPTION_MIN, validateDescription } from '../state/review';
import type {
  Answer,
  DescribeImageTask,
  DescriptionError,
  ListenAnswer,
  ListenVerifyTask,
  Submission,
  Task,
  TaskStatus,
} from '../types';

export function TaskDetail({ taskId }: { taskId: string }) {
  const { t } = useI18n();
  const task = getTask(taskId);

  if (!task) {
    return (
      <>
        <BackLink />
        <h1 tabIndex={-1}>{t('notFound.title')}</h1>
        <p>{t('task.notFound')}</p>
      </>
    );
  }
  return <TaskView task={task} />;
}

function BackLink({ status }: { status?: TaskStatus }) {
  const { ts } = useI18n();
  return (
    <div className="task-topbar">
      <a className="icon-link" href={href.tasks} aria-label={ts('common.backToTasks')}>
        <Icon name="chevronLeft" size={22} />
      </a>
      {status && <StatusBadge status={status} />}
    </div>
  );
}

function TaskView({ task }: { task: Task }) {
  const { t, lt } = useI18n();
  const { state, dispatch } = useAppState();
  const submission = state.submissions[task.id];
  const status = submission?.status ?? 'available';
  const [liveMessage, setLiveMessage] = useState<ReactNode>(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const next = selectRecommendedTasks(state, TASKS.length).find((other) => other.id !== task.id);

  const onReviewed = useCallback(
    (result: ReviewResult) => {
      setJustSubmitted(false);
      setLiveMessage(t(result === 'approved' ? 'reviewer.approvedMsg' : 'reviewer.revisionMsg'));
    },
    [t],
  );

  return (
    <>
      <BackLink status={status} />
      <header className="task-header">
        <p className="eyebrow">{t(`kind.${task.kind}`)}</p>
        <h1 tabIndex={-1}>{lt(task.title)}</h1>
        <RewardSummary task={task} />
        <p className="fine-print">{t('task.ratesNote')}</p>
      </header>

      {/* Announces submit and review results; stays mounted across status changes. */}
      <div className="live-region" role="status" aria-live="polite">
        {justSubmitted && status === 'pending_review' ? (
          <SubmittedCard next={next} />
        ) : (
          liveMessage && (
            <Notice tone="success" onDismiss={() => setLiveMessage(null)}>
              {liveMessage}
            </Notice>
          )
        )}
      </div>

      <section className="panel panel--mint instructions">
        <Icon name="info" size={22} />
        <div>
          <h2>{t('task.instructions')}</h2>
          <p>{lt(task.instructions)}</p>
        </div>
      </section>

      {status === 'available' && (
        <button
          type="button"
          className="button button--primary button--block"
          onClick={() => dispatch({ type: 'START_TASK', taskId: task.id, at: nowIso() })}
        >
          {t('task.start')}
        </button>
      )}

      {submission && (
        <StartedTask
          task={task}
          submission={submission}
          justSubmitted={justSubmitted}
          onSubmitted={() => {
            setJustSubmitted(true);
            setLiveMessage(t('task.submitted'));
          }}
          onReviewed={onReviewed}
        />
      )}
    </>
  );
}

/** Shown once, right after submitting. Takes focus so the result is seen and heard. */
function SubmittedCard({ next }: { next: Task | undefined }) {
  const { t } = useI18n();
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section className="panel submitted" aria-labelledby="submitted-title">
      <span className="submitted__icon">
        <Icon name="approved" size={34} />
      </span>
      <h2 id="submitted-title" ref={heading} tabIndex={-1}>
        {t('task.submittedTitle')}
      </h2>
      <p>{t('task.pendingInfo')}</p>
      <div className="submitted__actions">
        {next && (
          <a className="button button--primary button--block" href={href.task(next.id)}>
            {t('task.nextTask')}
          </a>
        )}
        <a className="button button--secondary button--block" href={href.tasks}>
          {t('common.backToTasks')}
        </a>
      </div>
    </section>
  );
}

function StartedTask({
  task,
  submission,
  justSubmitted,
  onSubmitted,
  onReviewed,
}: {
  task: Task;
  submission: Submission;
  justSubmitted: boolean;
  onSubmitted: () => void;
  onReviewed: (result: ReviewResult) => void;
}) {
  const { t } = useI18n();
  const [media, setMedia] = useState<MediaStatus>('checking');
  const { status, answer } = submission;
  const working = status === 'in_progress' || status === 'needs_revision';

  return (
    <>
      {status === 'needs_revision' && (
        <Notice tone="warning">
          <p>{t('task.revisionInfo')}</p>
          <p className="revision-reason">{submission.revisionReason}</p>
          <p>{t('task.revisionAgain')}</p>
        </Notice>
      )}
      {status === 'pending_review' && !justSubmitted && (
        <Notice tone="info">{t('task.pendingInfo')}</Notice>
      )}
      {status === 'approved' && <Notice tone="success">{t('task.approvedInfo')}</Notice>}

      <section className="card">
        {task.kind === 'listen_verify' ? (
          <ListenMedia task={task} onStatusChange={setMedia} />
        ) : (
          <TaskImage task={task} onStatusChange={setMedia} />
        )}
      </section>

      {working ? (
        task.kind === 'listen_verify' ? (
          <ListenForm
            task={task}
            initial={answer?.kind === 'listen_verify' ? answer.choice : null}
            resubmit={status === 'needs_revision'}
            mediaReady={media === 'ready'}
            onSubmitted={onSubmitted}
          />
        ) : (
          <DescribeForm
            task={task}
            initial={answer?.kind === 'describe_image' ? answer.text : ''}
            resubmit={status === 'needs_revision'}
            mediaReady={media === 'ready'}
            onSubmitted={onSubmitted}
          />
        )
      ) : (
        answer && <AnswerSummary answer={answer} />
      )}

      {status === 'pending_review' && answer && (
        <ReviewerPanel task={task} answer={answer} onResult={onReviewed} />
      )}
    </>
  );
}

function ListenMedia({
  task,
  onStatusChange,
}: {
  task: ListenVerifyTask;
  onStatusChange: (status: MediaStatus) => void;
}) {
  const { t } = useI18n();
  return (
    <>
      <AudioClip
        sources={task.audioSources}
        language={task.audioLanguage}
        onStatusChange={onStatusChange}
      />
      <h2 className="transcript-heading">{t('listen.transcript')}</h2>
      <blockquote className="transcript" lang={task.audioLanguage}>
        {task.transcript}
      </blockquote>
    </>
  );
}

function SubmitButton({
  resubmit,
  disabled,
  disabledReason,
}: {
  resubmit: boolean;
  disabled: boolean;
  disabledReason: ReactNode;
}) {
  const { t } = useI18n();
  const reasonId = useId();
  return (
    <>
      <button
        type="submit"
        className="button button--primary button--block"
        disabled={disabled}
        aria-describedby={disabled ? reasonId : undefined}
      >
        {t(resubmit ? 'task.resubmit' : 'task.submit')}
      </button>
      {disabled && (
        <p id={reasonId} className="fine-print">
          {disabledReason}
        </p>
      )}
    </>
  );
}

function ListenForm({
  task,
  initial,
  resubmit,
  mediaReady,
  onSubmitted,
}: {
  task: ListenVerifyTask;
  initial: ListenAnswer | null;
  resubmit: boolean;
  mediaReady: boolean;
  onSubmitted: () => void;
}) {
  const { t } = useI18n();
  const { dispatch } = useAppState();
  const [choice, setChoice] = useState<ListenAnswer | null>(initial);
  const [error, setError] = useState(false);
  const errorId = useId();
  const name = useId();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!choice) {
      setError(true);
      return;
    }
    dispatch({
      type: 'SUBMIT',
      taskId: task.id,
      answer: { kind: 'listen_verify', choice },
      at: nowIso(),
    });
    onSubmitted();
  };

  const options: { value: ListenAnswer; label: ReactNode; icon: 'approved' | 'close' }[] = [
    { value: 'matches', label: t('listen.matches'), icon: 'approved' },
    { value: 'doesnt_match', label: t('listen.doesntMatch'), icon: 'close' },
  ];

  return (
    <form className="card task-form" onSubmit={submit} noValidate>
      <fieldset aria-describedby={error ? errorId : undefined}>
        <legend>{t('listen.question')}</legend>
        <div className="choice-group">
          {options.map((option) => (
            <label key={option.value} className="choice">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={choice === option.value}
                onChange={() => {
                  setChoice(option.value);
                  setError(false);
                }}
              />
              <Icon name={option.icon} />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {error && (
        <p id={errorId} className="field__error" role="alert">
          <Icon name="alert" size={18} />
          <span>{t('listen.chooseFirst')}</span>
        </p>
      )}
      <SubmitButton resubmit={resubmit} disabled={!mediaReady} disabledReason={t('audio.submitDisabled')} />
    </form>
  );
}

const DESCRIPTION_ERRORS: Record<DescriptionError, MessageKey> = {
  empty: 'describe.error.empty',
  too_short: 'describe.error.too_short',
  too_long: 'describe.error.too_long',
  copied: 'describe.error.copied',
  copied_alt: 'describe.error.copied_alt',
};

function DescribeForm({
  task,
  initial,
  resubmit,
  mediaReady,
  onSubmitted,
}: {
  task: DescribeImageTask;
  initial: string;
  resubmit: boolean;
  mediaReady: boolean;
  onSubmitted: () => void;
}) {
  const { t } = useI18n();
  const { dispatch } = useAppState();
  const [text, setText] = useState(initial);
  const [error, setError] = useState<DescriptionError | null>(null);
  const inputId = useId();
  const hintId = useId();
  const errorId = useId();
  const count = [...text.trim()].length;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const problem = validateDescription(text, task.instructions, task.imageAlt);
    if (problem) {
      setError(problem);
      return;
    }
    dispatch({
      type: 'SUBMIT',
      taskId: task.id,
      answer: { kind: 'describe_image', text: text.trim() },
      at: nowIso(),
    });
    onSubmitted();
  };

  return (
    <form className="card task-form" onSubmit={submit} noValidate>
      <div className="field">
        <label htmlFor={inputId}>{t('describe.label')}</label>
        <p id={hintId} className="field__hint">
          {t('describe.hint', { min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })}
        </p>
        <textarea
          id={inputId}
          rows={5}
          value={text}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${hintId} ${errorId}` : hintId}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
        />
        <p className={count > DESCRIPTION_MAX ? 'field__count field__count--over' : 'field__count'}>
          {t('describe.count', { n: count, max: DESCRIPTION_MAX })}
        </p>
        {error && (
          <p id={errorId} className="field__error" role="alert">
            <Icon name="alert" size={18} />
            <span>{t(DESCRIPTION_ERRORS[error], { min: DESCRIPTION_MIN, max: DESCRIPTION_MAX })}</span>
          </p>
        )}
      </div>
      <SubmitButton resubmit={resubmit} disabled={!mediaReady} disabledReason={t('image.submitDisabled')} />
    </form>
  );
}

function AnswerSummary({ answer }: { answer: Answer }) {
  const { t } = useI18n();
  return (
    <section className="card">
      <h2>{t('answer.yours')}</h2>
      {answer.kind === 'listen_verify' ? (
        <p className="answer-choice">
          <Icon name={answer.choice === 'matches' ? 'approved' : 'close'} />
          {t(answer.choice === 'matches' ? 'listen.matches' : 'listen.doesntMatch')}
        </p>
      ) : (
        <blockquote className="answer-text">{answer.text}</blockquote>
      )}
    </section>
  );
}
