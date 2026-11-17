import { cacheLife, cacheTag } from "next/cache"

import type { AnimeEntry, AnimeKind, AnimeStatus } from "@/lib/anime"
import type { Locale } from "@/lib/i18n"

/**
 * Client for the MyAnimeList API v2, called from the server only: the client
 * id never reaches the browser. A public list needs no user login, only the
 * `X-MAL-CLIENT-ID` header.
 *
 * https://myanimelist.net/apiconfig/references/api/v2
 */

/** Tag for on-demand revalidation of the list. */
export const ANIME_TAG = "anime"

type MalStatus =
  | "watching"
  | "reading"
  | "completed"
  | "on_hold"
  | "dropped"
  | "plan_to_watch"
  | "plan_to_read"

type MalItem = {
  node: {
    id: number
    title: string
    main_picture?: { medium?: string; large?: string }
    alternative_titles?: { en?: string; ja?: string }
  }
  list_status: {
    status: MalStatus
    /** 0: not scored */
    score: number
    updated_at: string
  }
}

type MalPage = { data: MalItem[]; paging?: { next?: string } }

/** Planned titles are not on the page: nothing to say about them yet. */
const STATUS: Partial<Record<MalStatus, AnimeStatus>> = {
  watching: "watching",
  reading: "reading",
  completed: "completed",
  on_hold: "on_hold",
  dropped: "dropped",
}

/** A list is at most this many requests of 1000 entries. */
const MAX_PAGES = 5

async function fetchList(kind: AnimeKind): Promise<MalItem[]> {
  const base = process.env.MAL_API_URL || "https://api.myanimelist.net/v2"
  const clientId = process.env.MAL_CLIENT_ID
  const user = process.env.MAL_USERNAME
  if (!clientId || !user) {
    throw new Error("MAL_CLIENT_ID and MAL_USERNAME must be set (see .env.example)")
  }

  const query = new URLSearchParams({
    fields: "list_status,alternative_titles",
    sort: "list_updated_at",
    limit: "1000",
  })
  let url: string | undefined =
    `${base}/users/${encodeURIComponent(user)}/${kind}list?${query}`

  const items: MalItem[] = []
  for (let page = 0; url && page < MAX_PAGES; page++) {
    const res = await fetch(url, { headers: { "X-MAL-CLIENT-ID": clientId } })
    if (!res.ok) throw new Error(`MAL ${kind}list failed: ${res.status}`)
    const data = (await res.json()) as MalPage
    items.push(...data.data)
    url = data.paging?.next
  }
  return items
}

/** The title in the page's language where MAL has one. */
function titleOf(node: MalItem["node"], locale: Locale): string {
  const alt = node.alternative_titles
  if (locale === "ja") return alt?.ja || node.title
  return alt?.en || node.title
}

/**
 * The anime and manga lists as one, most recently updated first.
 *
 * Null when MAL is not configured or does not answer. It must not throw: an
 * error inside `use cache` fails the prerender, and with it the build. A
 * failure is cached for minutes, a list for hours.
 */
export async function getAnimeList(
  locale: Locale
): Promise<AnimeEntry[] | null> {
  "use cache"
  cacheTag(ANIME_TAG)

  let lists
  try {
    lists = await Promise.all(
      (["anime", "manga"] as const).map(async (kind) =>
        (await fetchList(kind)).map((item) => ({ kind, ...item }))
      )
    )
  } catch (error) {
    console.error(error)
    cacheLife("minutes")
    return null
  }
  cacheLife("hours")

  return lists
    .flat()
    .sort((a, b) =>
      b.list_status.updated_at.localeCompare(a.list_status.updated_at)
    )
    .flatMap(({ kind, node, list_status }) => {
      const status = STATUS[list_status.status]
      if (!status) return []
      return {
        id: `${kind}-${node.id}`,
        kind,
        title: titleOf(node, locale),
        status,
        score: list_status.score > 0 ? list_status.score : null,
        cover: node.main_picture?.medium ?? null,
        url: `https://myanimelist.net/${kind}/${node.id}`,
      }
    })
}
