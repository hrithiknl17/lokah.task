import type { Lang } from './types';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

const LOCALES: Record<Lang, string> = { en: 'en-IN', kn: 'kn-IN' };

export function formatDateTime(iso: string, lang: Lang): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(LOCALES[lang], {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}
