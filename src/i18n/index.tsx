import { type ReactNode, useCallback, useMemo } from 'react';
import { useAppState } from '../state/context';
import type { Lang, LocalText } from '../types';
import { type Dictionary, type MessageKey, en } from './en';
import { kn } from './kn';

const DICTIONARIES: Record<Lang, Partial<Dictionary>> = { en, kn };

export type Vars = Record<string, string | number>;

function interpolate(template: string, vars?: Vars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match,
  );
}

export interface Lookup {
  text: string;
  /** True when the current language lacks this string and English was used. */
  fallback: boolean;
}

export function lookup(lang: Lang, key: MessageKey, vars?: Vars): Lookup {
  const local = DICTIONARIES[lang][key];
  if (local !== undefined) return { text: interpolate(local, vars), fallback: false };
  return { text: interpolate(en[key], vars), fallback: lang !== 'en' };
}

export function lookupLocal(lang: Lang, value: LocalText): Lookup {
  const local = lang === 'kn' ? value.kn : value.en;
  if (local) return { text: local, fallback: false };
  return { text: value.en, fallback: lang !== 'en' };
}

function EnglishOnly({ lang }: { lang: Lang }) {
  return (
    <span className="en-only" lang="en">
      {' '}
      {lookup(lang, 'common.englishOnly').text}
    </span>
  );
}

function render(lang: Lang, result: Lookup): ReactNode {
  if (!result.fallback) return result.text;
  return (
    <>
      <span lang="en">{result.text}</span>
      <EnglishOnly lang={lang} />
    </>
  );
}

export interface I18n {
  lang: Lang;
  /** Plain string, for attributes like aria-label and placeholder. */
  ts: (key: MessageKey, vars?: Vars) => string;
  /** Renderable text, tagged "(English only)" when the translation is missing. */
  t: (key: MessageKey, vars?: Vars) => ReactNode;
  /** Render task content that carries its own translations. */
  lt: (value: LocalText) => ReactNode;
  lts: (value: LocalText) => string;
}

export function useI18n(): I18n {
  const { state } = useAppState();
  const lang = state.profile.language;
  const ts = useCallback((key: MessageKey, vars?: Vars) => lookup(lang, key, vars).text, [lang]);
  const t = useCallback((key: MessageKey, vars?: Vars) => render(lang, lookup(lang, key, vars)), [lang]);
  const lt = useCallback((value: LocalText) => render(lang, lookupLocal(lang, value)), [lang]);
  const lts = useCallback((value: LocalText) => lookupLocal(lang, value).text, [lang]);
  return useMemo(() => ({ lang, ts, t, lt, lts }), [lang, ts, t, lt, lts]);
}
