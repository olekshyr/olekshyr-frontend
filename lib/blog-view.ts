/**
 * A view of the blog list: which tag, which order, which page. Each view has
 * exactly one URL, with its parts always in the same order:
 *
 *   /blog[/tag/{tag}][/sort/oldest][/page/{n}]
 *
 * Defaults are never written (`/page/1`, `/sort/newest`), so two URLs never
 * show the same view.
 */
export type BlogView = {
  tag: string | null
  oldest: boolean
  /** 1-based */
  page: number
}

export const PAGE_SIZE = 10

export const DEFAULT_VIEW: BlogView = { tag: null, oldest: false, page: 1 }

const TAG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const PAGE = /^[1-9][0-9]*$/

/** Parses the segments after `/blog`; `null` for anything not canonical. */
export function parseBlogView(segments: string[]): BlogView | null {
  const view = { ...DEFAULT_VIEW }
  let rest = segments

  if (rest[0] === "tag") {
    if (!TAG.test(rest[1] ?? "")) return null
    view.tag = rest[1]
    rest = rest.slice(2)
  }
  if (rest[0] === "sort") {
    if (rest[1] !== "oldest") return null
    view.oldest = true
    rest = rest.slice(2)
  }
  if (rest[0] === "page") {
    if (!PAGE.test(rest[1] ?? "")) return null
    view.page = Number(rest[1])
    if (view.page < 2) return null
    rest = rest.slice(2)
  }

  return rest.length === 0 ? view : null
}

/** The locale-less path of a view. */
export function blogViewPath(view: BlogView): string {
  return [
    "/blog",
    view.tag && `tag/${view.tag}`,
    view.oldest && "sort/oldest",
    view.page > 1 && `page/${view.page}`,
  ]
    .filter(Boolean)
    .join("/")
}

/** Filtered or re-sorted views repeat posts the plain list already shows. */
export const isFiltered = (view: BlogView) => view.tag !== null || view.oldest
