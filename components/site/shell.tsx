import Link from "next/link"
import type { ReactNode } from "react"

import { localePath, type Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

import { ThemeSwitch } from "./theme-switch"
import { ExplorerItem, type ExplorerItemProps } from "./explorer-item"

export type ShellStatus = {
  branch: string
  type: string
  locale: string
}

export type ShellProps = {
  lang: Locale
  /** path shown in the top bar, e.g. `~/home.tsx` */
  path: string
  files: ExplorerItemProps[]
  status: ShellStatus
  /**
   * the 404 state: the missing path, shown in place of `path`. The status bar
   * turns to the error colour and has no breadcrumbs.
   */
  error?: ReactNode
  /** the LangSwitch, rendered at the right of the top bar */
  langSwitch: ReactNode
  children: ReactNode
}

export function Shell({
  lang,
  path,
  files,
  status,
  error,
  langSwitch,
  children,
}: ShellProps) {
  // `~/blog/index.tsx` -> olekshyr > blog > index.tsx; folders link to their page
  const parts = path.split("/").filter(Boolean)
  const crumbs = parts.map((part, i) => ({
    label: part === "~" ? "olekshyr" : part,
    href:
      i === parts.length - 1
        ? null
        : localePath(lang, `/${parts.slice(1, i + 1).join("/")}`),
  }))

  return (
    <div className="flex min-h-dvh flex-col bg-background lg:h-dvh lg:overflow-hidden text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line px-4 py-3.5 text-label text-muted sm:px-8">
        <div>
          <span className="text-accent">olekshyr</span>.dev
        </div>
        {error ? (
          <div className="text-syntax-number">{error}</div>
        ) : (
          <div>{path}</div>
        )}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <ThemeSwitch />
          {langSwitch}
        </div>
      </header>
      <div className="flex flex-1 flex-wrap lg:min-h-0 lg:flex-nowrap">
        <nav
          aria-label="Files"
          className="flex w-full flex-none flex-col border-b border-line py-4 text-label lg:w-explorer lg:overflow-y-auto lg:border-r lg:border-b-0"
        >
          <div className="px-6 pb-3 text-caption text-muted">explorer</div>
          {files.map((file) => (
            <ExplorerItem key={`${file.name}:${file.href}`} {...file} />
          ))}
        </nav>
        <main className="@container flex min-w-0 flex-[1_1_640px] flex-col lg:min-h-0">
          {children}
        </main>
      </div>
      <footer
        className={cn(
          "flex min-h-8 items-center justify-between gap-4 px-6 text-caption font-medium text-on-accent",
          error ? "bg-syntax-number" : "bg-accent"
        )}
      >
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex-none">{status.branch}</span>
          {!error && (
            <>
          <span aria-hidden="true" className="flex-none">
            |
          </span>
          <nav aria-label="Breadcrumb" className="min-w-0 truncate">
            <ol
              className="m-0 flex list-none gap-2 p-0"
              itemScope
              itemType="https://schema.org/BreadcrumbList"
            >
              {crumbs.map((crumb, i) => (
                <li
                  key={`${i}:${crumb.label}`}
                  className="flex gap-2"
                  aria-current={crumb.href ? undefined : "page"}
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {i > 0 && <span aria-hidden="true">&gt;</span>}
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      itemProp="item"
                      className="text-on-accent underline-offset-4 outline-on-accent hover:underline"
                    >
                      <span itemProp="name">{crumb.label}</span>
                    </Link>
                  ) : (
                    // the current page: last in the list, named but not linked
                    <span itemProp="name">{crumb.label}</span>
                  )}
                  <meta itemProp="position" content={String(i + 1)} />
                </li>
              ))}
            </ol>
          </nav>
            </>
          )}
        </div>
        <span className="flex-none">{status.type}</span>
        <span className="flex-none">UTF-8 | {status.locale}</span>
      </footer>
    </div>
  )
}
