import type { Lang } from './types';

const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' });

const inrWhole = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatPaise(paise: number): string {
  return inr.format(paise / 100);
}

/** Split a formatted amount into the rupee part and the paise part, for two-tone display. */
export function splitPaise(paise: number): { whole: string; fraction: string } {
  let whole = '';
  let fraction = '';
  for (const part of inr.formatToParts(paise / 100)) {
    if (part.type === 'decimal' || part.type === 'fraction') fraction += part.value;
    else whole += part.value;
  }
  return { whole, fraction };
}

/** Whole rupees, for estimates such as ₹/hour where paise imply false precision. */
export function formatPaiseRounded(paise: number): string {
  return inrWhole.format(Math.round(paise / 100));
}

const LOCALES: Record<Lang, string> = { en: 'en-IN', kn: 'kn-IN' };

export function formatWeekday(date: Date, lang: Lang): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'short' }).format(date);
}

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
