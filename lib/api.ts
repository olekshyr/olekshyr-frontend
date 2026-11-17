import { cacheLife, cacheTag } from "next/cache"

import { PAGE_SIZE } from "@/lib/blog-view"
import type { Locale } from "@/lib/i18n"

/**
 * Client for the olekshyr.dev API (Spring). Server-side only: the API key
 * never reaches the browser. Content comes back in the `Accept-Language` locale.
 *
 * The list parameters `tag`, `sort` and `include`, the fields `translated`,
 * `locale`, `availableLocales`, `previous` and `next`, and `GET /tags` are
 * specified in docs/api-requirements-blog-pagination.md. Until the API has
 * them they are optional here, and `pnpm dev:mock` serves them from a mock.
 */

export type ApiTag = { slug: string; name: string; color: string | null }

export type TagWithCount = ApiTag & { postCount: number }

export type PostSummary = {
  slug: string
  title: string
  excerpt: string
  tags: ApiTag[]
  publishedAt: string
  readTimeMinutes: number
  /** false: not published in the requested locale; title is from `locale` */
  translated?: boolean
  locale?: Locale
  availableLocales?: Locale[]
}

export type PostNeighbour = { slug: string; title: string }

export type PostDetail = PostSummary & {
  /** sanitized HTML, safe to render as is */
  body: string
  metaTitle: string
  metaDescription: string
  updatedAt: string
  availableLocales: Locale[]
  /** the older post */
  previous?: PostNeighbour | null
  /** the newer post */
  next?: PostNeighbour | null
}

export type Page<T> = {
  content: T[]
  page: {
    number: number
    size: number
    totalElements: number
    totalPages: number
  }
}

export type PostResult =
  | { status: "ok"; post: PostDetail }
  /** the post exists, but not in this locale */
  | { status: "untranslated" }
  | { status: "missing" }

/** Tag for on-demand revalidation of everything blog-related. */
export const POSTS_TAG = "posts"

async function api(
  path: string,
  locale: Locale,
  /** a JSON body turns the request into a POST */
  body?: unknown
): Promise<Response> {
  const base = process.env.API_URL || "http://localhost:8080"
  const key = process.env.PUBLIC_API_KEY
  if (!key) throw new Error("PUBLIC_API_KEY must be set (see .env.example)")
  return fetch(`${base}${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      [process.env.API_KEY_HEADER ?? "X-API-Key"]: key,
      "Accept-Language": locale,
      Accept: "application/json",
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
}

export type ContactMessage = { name: string; email: string; message: string }

/**
 * Hands a contact form message to the API, which delivers it.
 * Specified in docs/api-requirements-contact.md.
 */
export function sendContact(
  message: ContactMessage,
  locale: Locale
): Promise<Response> {
  return api("/api/v1/contact", locale, { ...message, locale })
}

/**
 * One page of the blog list: every post visible in any locale (untranslated
 * ones are marked), optionally one tag, newest or oldest first.
 */
export async function listPosts(
  locale: Locale,
  {
    page,
    tag = null,
    oldest = false,
    size = PAGE_SIZE,
  }: {
    /** 1-based */
    page: number
    tag?: string | null
    oldest?: boolean
    size?: number
  }
): Promise<Page<PostSummary>> {
  "use cache"
  cacheLife("minutes")
  cacheTag(POSTS_TAG)

  const query = new URLSearchParams({
    include: "untranslated",
    page: String(page - 1),
    size: String(size),
  })
  if (tag) query.set("tag", tag)
  if (oldest) query.set("sort", "publishedAt,asc")

  const res = await api(`/api/v1/posts?${query}`, locale)
  if (!res.ok) throw new Error(`GET /api/v1/posts failed: ${res.status}`)
  return (await res.json()) as Page<PostSummary>
}

/** Tags that have at least one post in the blog list, with names in the locale. */
export async function getTags(locale: Locale): Promise<TagWithCount[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag(POSTS_TAG)

  const res = await api("/api/v1/tags?include=untranslated", locale)
  // an API without the endpoint yet: no tag filter, the list still works
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`GET /api/v1/tags failed: ${res.status}`)
  return (await res.json()) as TagWithCount[]
}

/** Every post published in the locale, newest first. For the sitemap and prerendering. */
export async function getPosts(locale: Locale): Promise<PostSummary[]> {
  "use cache"
  cacheLife("minutes")
  cacheTag(POSTS_TAG)

  const posts: PostSummary[] = []
  for (let number = 0; ; number++) {
    const res = await api(`/api/v1/posts?page=${number}&size=50`, locale)
    if (!res.ok) throw new Error(`GET /api/v1/posts failed: ${res.status}`)
    const data = (await res.json()) as Page<PostSummary>
    posts.push(...data.content)
    if (number + 1 >= data.page.totalPages) break
  }
  return posts
}

export async function getPost(
  slug: string,
  locale: Locale
): Promise<PostResult> {
  "use cache"
  cacheLife("minutes")
  cacheTag(POSTS_TAG)

  const res = await api(`/api/v1/posts/${encodeURIComponent(slug)}`, locale)
  if (res.ok) return { status: "ok", post: (await res.json()) as PostDetail }
  if (res.status === 404) {
    const error = (await res.json().catch(() => null)) as {
      code?: string
    } | null
    return error?.code === "TRANSLATION_NOT_AVAILABLE"
      ? { status: "untranslated" }
      : { status: "missing" }
  }
  throw new Error(`GET /api/v1/posts/${slug} failed: ${res.status}`)
}
