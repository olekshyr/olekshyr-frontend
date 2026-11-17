import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  BlogListPage,
  blogListMetadata,
} from "@/components/site/blog-list-page"
import { listPosts } from "@/lib/api"
import { parseBlogView } from "@/lib/blog-view"
import { hasLocale } from "@/lib/i18n"

type Props = PageProps<"/[lang]/blog/[...view]">

/**
 * The whole page depends on the URL and a wrong URL must answer 404, which a
 * streamed page cannot, so it renders in one piece (no shared App Shell).
 */
export const instant = false

/**
 * A view that was not prerendered waits for its complete page, so a page past
 * the end or an unknown tag answers 404 instead of a 200 shell.
 */
export const ensureStatic = "navigation"

/**
 * Prerender the pages of the plain list; tag and sort views render on demand.
 * Cache Components needs at least one entry, so a one-page blog lists page 2,
 * which is a 404.
 */
export async function generateStaticParams({
  params,
}: {
  params: { lang: string }
}) {
  const totalPages = hasLocale(params.lang)
    ? (await listPosts(params.lang, { page: 1 })).page.totalPages
    : 1
  return Array.from({ length: Math.max(totalPages - 1, 1) }, (_, i) => ({
    view: ["page", String(i + 2)],
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, view: segments } = await params
  const view = parseBlogView(segments)
  return hasLocale(lang) && view ? blogListMetadata(lang, view) : {}
}

/**
 * Every blog list view but the first page:
 * `/blog[/tag/{tag}][/sort/oldest][/page/{n}]`. A single segment after
 * `/blog` is a post (`[slug]/page.tsx`), so these always have two or more.
 */
export default async function BlogView({ params }: Props) {
  const { lang, view: segments } = await params
  const view = parseBlogView(segments)
  if (!hasLocale(lang) || !view) notFound()
  return <BlogListPage lang={lang} view={view} />
}
