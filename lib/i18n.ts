export const LOCALES = ["en", "uk", "ja"] as const
export type Locale = (typeof LOCALES)[number]

/** English has no URL segment: `/blog`, `/uk/blog`, `/ja/blog`. */
export const DEFAULT_LOCALE: Locale = "en"

/** BCP 47 tags for `<html lang>` and hreflang. The switch shows `UA`, the language code is `uk`. */
export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  uk: "uk",
  ja: "ja",
}

/** Codes shown in the language switch and the status bar. */
export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  uk: "UA",
  ja: "JA",
}

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://olekshyr.dev"

export const hasLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value)

/** Splits a URL path into its locale (if it has one) and the rest. */
export function splitLocale(pathname: string): {
  locale: Locale | null
  rest: string
} {
  const [, first = "", ...others] = pathname.split("/")
  if (!hasLocale(first)) return { locale: null, rest: pathname || "/" }
  return { locale: first, rest: `/${others.join("/")}` }
}

/** The public URL path of a locale-less path (`/blog`) in a locale. */
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path
  return path === "/" ? `/${locale}` : `/${locale}${path}`
}

/**
 * `alternates` metadata for a locale-less path: canonical plus hreflang links
 * for the locales the page exists in (all of them unless given).
 */
export function localeAlternates(
  locale: Locale,
  path: string,
  locales: readonly Locale[] = LOCALES
) {
  return {
    canonical: localePath(locale, path),
    languages: {
      ...Object.fromEntries(
        locales.map((l) => [HTML_LANG[l], localePath(l, path)])
      ),
      ...(locales.includes(DEFAULT_LOCALE)
        ? { "x-default": localePath(DEFAULT_LOCALE, path) }
        : {}),
    },
  }
}
