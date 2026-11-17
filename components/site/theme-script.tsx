"use client"

import { THEME_SCRIPT } from "@/lib/theme"

/**
 * The inline script that sets the theme before first paint.
 *
 * In server HTML it is a normal script and runs. When React builds the document
 * in the browser instead (Next does this for 404 pages), an inline script would
 * never run and React reports it; there it is typed as a data block, which React
 * accepts silently, and `ThemeSwitch` applies the theme on mount.
 */
export function ThemeScript() {
  return (
    <script
      type={typeof window === "undefined" ? undefined : "text/plain"}
      // the type differs between server and browser on purpose
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
    />
  )
}
