import type { MetadataRoute } from "next"

import { LOCALES, SITE_URL, localePath } from "@/lib/i18n"

/**
 * Filtered and re-sorted blog views are kept out of crawling, as Google
 * recommends for faceted navigation. The plain list and its pages stay open.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: LOCALES.flatMap((locale) => [
        `${localePath(locale, "/blog")}/tag/`,
        `${localePath(locale, "/blog")}/sort/`,
      ]),
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
