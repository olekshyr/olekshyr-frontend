import type { MetadataRoute } from "next"

import { getPosts, listPosts } from "@/lib/api"
import { blogViewPath, DEFAULT_VIEW } from "@/lib/blog-view"
import { LOCALES, SITE_URL, localePath, type Locale } from "@/lib/i18n"
import { PROJECTS } from "@/lib/projects"

const url = (locale: Locale, path: string) =>
  `${SITE_URL}${localePath(locale, path)}`.replace(/\/$/, "") || SITE_URL

/**
 * Canonical URLs only: each page once per language it exists in, including
 * every page of the blog list (but no tag or sort views). Translations are
 * tied together by the hreflang links in each page's <head>, so they are not
 * repeated here (Google treats the methods as equivalent).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const perLocale = await Promise.all(
    LOCALES.map(async (locale) => ({
      locale,
      posts: await getPosts(locale),
      totalPages: (await listPosts(locale, { page: 1 })).page.totalPages,
    }))
  )

  return perLocale.flatMap(({ locale, posts, totalPages }) => [
    { url: url(locale, "/") },
    ...Array.from({ length: Math.max(totalPages, 1) }, (_, i) => ({
      url: url(locale, blogViewPath({ ...DEFAULT_VIEW, page: i + 1 })),
      lastModified: posts[0]?.publishedAt,
    })),
    ...posts.map((post) => ({
      url: url(locale, `/blog/${post.slug}`),
      lastModified: post.publishedAt,
    })),
    { url: url(locale, "/resume") },
    { url: url(locale, "/contact") },
    { url: url(locale, "/life/anime") },
    { url: url(locale, "/projects") },
    ...PROJECTS.map((project) => ({
      url: url(locale, `/projects/${project.slug}`),
    })),
  ])
}
