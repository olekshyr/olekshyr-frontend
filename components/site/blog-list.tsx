import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { toggleVariants } from "@/components/ui/toggle-variants"
import { blogViewPath, type BlogView } from "@/lib/blog-view"
import { localePath, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { ListRow } from "./list-row"

export type BlogListRow = {
  slug: string
  href: string
  date: string
  title: string
  excerpt: string
  tags: { slug: string; name: string }[]
  /** false: no translation in the current locale */
  translated: boolean
}

export type BlogListLabels = {
  filter: string
  all: string
  newestFirst: string
  oldestFirst: string
  date: string
  title: string
  tag: string
  open: string
  noLocale: string
  noPosts: string
  pages: string
  previous: string
  next: string
}

/**
 * One page of the post table, with its tag filter, sort toggle and page links.
 * Every control is a plain link to another view's URL, so the list works
 * without JavaScript. Links to filtered or re-sorted views are `nofollow`:
 * they repeat posts the plain list already shows.
 */
export function BlogList({
  lang,
  view,
  rows,
  tags,
  totalPages,
  firstNo,
  labels,
}: {
  lang: Locale
  view: BlogView
  rows: BlogListRow[]
  tags: { slug: string; name: string }[]
  totalPages: number
  /** line number of the first row */
  firstNo: number
  labels: BlogListLabels
}) {
  const target = (next: Partial<BlogView>) => {
    const to = { ...view, ...next }
    return {
      href: localePath(lang, blogViewPath(to)),
      rel: to.tag !== null || to.oldest ? "nofollow" : undefined,
    }
  }

  const chip = (tag: string | null, label: string) => {
    const current = view.tag === tag
    return (
      <Link
        key={tag ?? ""}
        {...target({ tag, page: 1 })}
        aria-current={current ? "true" : undefined}
        data-state={current ? "on" : "off"}
        className={toggleVariants()}
      >
        {label}
      </Link>
    )
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="text-label text-syntax-comment">{labels.filter}</span>
        {chip(null, labels.all)}
        {tags.map((tag) => chip(tag.slug, tag.name))}
        <Link
          {...target({ oldest: !view.oldest, page: 1 })}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "ml-auto min-h-10 px-4 text-caption"
          )}
        >
          {view.oldest ? labels.oldestFirst : labels.newestFirst}
        </Link>
      </div>
      <div className="flex flex-col border-t border-frame">
        <div
          aria-hidden="true"
          className="hidden min-h-10 items-center gap-5 border-b border-line px-2 text-caption text-muted @xl:flex"
        >
          <span className="w-7 flex-none" />
          <span className="w-30 flex-none">{labels.date}</span>
          <span className="flex-1">{labels.title}</span>
          <span className="w-28 flex-none">{labels.tag}</span>
          <span className="w-32.5 flex-none" />
        </div>
        {rows.length === 0 ? (
          <p className="m-0 border-b border-line px-2 py-6 text-label text-muted">
            {labels.noPosts}
          </p>
        ) : (
          rows.map((row, i) => (
            <ListRow
              key={row.slug}
              no={firstNo + i}
              href={row.href}
              date={row.date}
              title={row.title}
              excerpt={row.excerpt}
              tag={row.tags.map((t) => `#${t.name}`).join(" ")}
              missing={!row.translated}
              action={row.translated ? labels.open : labels.noLocale}
            />
          ))
        )}
      </div>
      {totalPages > 1 && (
        <Pagination
          page={view.page}
          totalPages={totalPages}
          target={(page) => target({ page })}
          labels={labels}
        />
      )}
    </>
  )
}

/** Page numbers to show: the ends, the current page and its neighbours. */
function pageNumbers(page: number, totalPages: number): (number | null)[] {
  const numbers = [...new Set([1, totalPages, page - 1, page, page + 1])]
    .filter((n) => n >= 1 && n <= totalPages)
    .sort((a, b) => a - b)
  // null marks a gap
  return numbers.flatMap((n, i) =>
    i > 0 && n - numbers[i - 1] > 1 ? [null, n] : [n]
  )
}

function Pagination({
  page,
  totalPages,
  target,
  labels,
}: {
  page: number
  totalPages: number
  target: (page: number) => { href: string; rel: string | undefined }
  labels: Pick<BlogListLabels, "pages" | "previous" | "next">
}) {
  const cell =
    "inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-label no-underline"
  const link = `${cell} border-control text-foreground hover:border-accent hover:text-accent`
  const off = `${cell} border-dashed border-control text-secondary`

  return (
    <nav aria-label={labels.pages} className="flex flex-wrap items-center gap-2">
      {page > 1 ? (
        <Link {...target(page - 1)} className={link}>
          &lt; {labels.previous}
        </Link>
      ) : (
        <span aria-disabled="true" className={off}>
          &lt; {labels.previous}
        </span>
      )}
      {pageNumbers(page, totalPages).map((n, i) =>
        n === null ? (
          <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-muted">
            ..
          </span>
        ) : n === page ? (
          <span
            key={n}
            aria-current="page"
            className={`${cell} border-accent bg-accent text-on-accent`}
          >
            {n}
          </span>
        ) : (
          <Link key={n} {...target(n)} className={link}>
            {n}
          </Link>
        )
      )}
      {page < totalPages ? (
        <Link {...target(page + 1)} className={link}>
          {labels.next} &gt;
        </Link>
      ) : (
        <span aria-disabled="true" className={off}>
          {labels.next} &gt;
        </span>
      )}
    </nav>
  )
}
