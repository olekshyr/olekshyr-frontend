/** The anime and manga list as the page shows it. Loaded by lib/mal.ts. */

export type AnimeKind = "anime" | "manga"

export type AnimeStatus =
  | "watching"
  | "reading"
  | "completed"
  | "on_hold"
  | "dropped"

export const ANIME_KINDS: AnimeKind[] = ["anime", "manga"]

/** In the order the filter shows them. */
export const ANIME_STATUSES: AnimeStatus[] = [
  "watching",
  "reading",
  "completed",
  "on_hold",
  "dropped",
]

export type AnimeEntry = {
  id: string
  kind: AnimeKind
  title: string
  status: AnimeStatus
  /** out of 10; null: not scored */
  score: number | null
  /** cover image URL; null draws a placeholder */
  cover: string | null
  /** the entry's page on the list service; null: the card is not a link */
  url: string | null
}
