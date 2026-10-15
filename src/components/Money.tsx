import type { ReactNode } from 'react';
import { formatPaise } from '../format';
import { useI18n } from '../i18n';

export function DemoTag() {
  const { t } = useI18n();
  return <span className="demo-tag">{t('common.demoData')}</span>;
}

/** An amount of fictional money, always labelled as demo data. */
export function Money({ paise, large = false }: { paise: number; large?: boolean }) {
  return (
    <span className={large ? 'money money--large' : 'money'}>
      <span className="money__value">{formatPaise(paise)}</span> <DemoTag />
    </span>
  );
}

/** A row of reward details that shares one demo-data label. */
export function RewardLine({ children }: { children: ReactNode }) {
  return (
    <p className="reward-line">
      {children} <DemoTag />
    </p>
  );
}
