import { NextResponse, type NextRequest } from "next/server"

import { DEFAULT_LOCALE, splitLocale } from "@/lib/i18n"

/**
 * Locale routing. Every page lives under `app/[lang]`, but the default locale
 * has no URL segment:
 *   /blog     -> rendered from /en/blog (rewrite, URL unchanged)
 *   /en/blog  -> redirected to /blog
 *   /uk/blog  -> served as is
 */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone()
  const { locale, rest } = splitLocale(url.pathname)

  if (locale === DEFAULT_LOCALE) {
    url.pathname = rest
    return NextResponse.redirect(url, 308)
  }

  if (locale) return

  url.pathname = `/${DEFAULT_LOCALE}${url.pathname === "/" ? "" : url.pathname}`
  return NextResponse.rewrite(url)
}

export const config = {
  // skip Next internals, API routes and anything with a file extension
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
