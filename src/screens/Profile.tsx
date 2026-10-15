import { useId, useState } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Notice } from '../components/Notice';
import { useI18n } from '../i18n';
import { useAppState } from '../state/context';
import { DISPLAY_NAME_MAX } from '../state/reducer';
import type { Lang } from '../types';

const LANGS: Lang[] = ['en', 'kn'];
/** Language names are shown in their own script so people can find theirs. */
const NATIVE_NAME: Record<Lang, string> = { en: 'English', kn: 'ಕನ್ನಡ' };

export function Profile() {
  const { t } = useI18n();
  const { state, dispatch, resetDemo } = useAppState();
  const [confirming, setConfirming] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const nameId = useId();
  const nameHintId = useId();

  return (
    <>
      <h1 tabIndex={-1}>{t('profile.title')}</h1>

      <div className="live-region" role="status" aria-live="polite">
        {resetDone && (
          <Notice tone="success" onDismiss={() => setResetDone(false)}>
            {t('reset.done')}
          </Notice>
        )}
      </div>

      <section className="card">
        <div className="field">
          <label htmlFor={nameId}>{t('profile.name')}</label>
          <input
            id={nameId}
            type="text"
            autoComplete="nickname"
            maxLength={DISPLAY_NAME_MAX}
            value={state.profile.displayName}
            aria-describedby={nameHintId}
            onChange={(e) => dispatch({ type: 'SET_PROFILE', profile: { displayName: e.target.value } })}
          />
          <p id={nameHintId} className="field__hint">
            {t('profile.nameHint')}
          </p>
        </div>

        <fieldset className="field">
          <legend>{t('profile.language')}</legend>
          <div className="choice-group">
            {LANGS.map((lang) => (
              <label key={lang} className="choice" lang={lang}>
                <input
                  type="radio"
                  name="language"
                  value={lang}
                  checked={state.profile.language === lang}
                  onChange={() => dispatch({ type: 'SET_PROFILE', profile: { language: lang } })}
                />
                <span>{NATIVE_NAME[lang]}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <p className="fine-print">{t('profile.privacy')}</p>
      </section>

      <section className="card">
        <h2>{t('profile.about')}</h2>
        <p>{t('app.tagline')}</p>
        <p className="fine-print">{t('app.notOfficial')}</p>
      </section>

      <section className="card">
        <h2>{t('profile.reset')}</h2>
        <p>{t('profile.resetHint')}</p>
        <button
          type="button"
          className="button button--danger button--block"
          onClick={() => {
            setResetDone(false);
            setConfirming(true);
          }}
        >
          {t('profile.reset')}
        </button>
      </section>

      <ConfirmDialog
        open={confirming}
        title={t('reset.title')}
        confirmLabel={t('reset.confirm')}
        cancelLabel={t('common.cancel')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          resetDemo();
          setConfirming(false);
          setResetDone(true);
        }}
      >
        <p>{t('reset.body')}</p>
      </ConfirmDialog>
    </>
  );
}
