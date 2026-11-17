import Link from "next/link"

import { toggleVariants } from "@/components/ui/toggle-variants"
import {
  HTML_LANG,
  LOCALES,
  LOCALE_LABEL,
  localePath,
  type Locale,
} from "@/lib/i18n"

/**
 * The language switch. Each chip is a real link to the current page in that
 * locale, so every language has its own crawlable URL.
 */
export function LangSwitch({
  lang,
  path,
}: {
  lang: Locale
  /** the current page without its locale segment, e.g. `/blog` */
  path: string
}) {
  return (
    <nav aria-label="Language" className="flex flex-wrap items-center gap-2">
      {LOCALES.map((code) => (
        <Link
          key={code}
          href={localePath(code, path)}
          hrefLang={HTML_LANG[code]}
          aria-current={code === lang ? "true" : undefined}
          data-state={code === lang ? "on" : "off"}
          className={toggleVariants()}
        >
          {LOCALE_LABEL[code]}
        </Link>
      ))}
    </nav>
  )
}
