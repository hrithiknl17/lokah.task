import { useI18n } from '../i18n';
import { href } from '../router';

export function NotFound() {
  const { t } = useI18n();
  return (
    <>
      <h1 tabIndex={-1}>{t('notFound.title')}</h1>
      <a className="button button--secondary" href={href.home}>
        {t('notFound.link')}
      </a>
    </>
  );
}
