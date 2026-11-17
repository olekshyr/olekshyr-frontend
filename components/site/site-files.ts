import { localePath, type Locale } from "@/lib/i18n"
import { PROJECTS } from "@/lib/projects"

import type { ExplorerItemProps } from "./explorer-item"

export type SiteFile =
  | "home"
  | "blog"
  | "post"
  | "projects"
  /** a project's page */
  | `project:${string}`
  | "about"
  | "resume"
  | "anime"
  | "contact"

const FILES: (Omit<ExplorerItemProps, "current"> & { id?: SiteFile })[] = [
  { id: "home", name: "home.tsx", href: "/" },
  { name: "blog/", href: "/blog", dir: true },
  { id: "blog", name: "index.tsx", href: "/blog", level: 1 },
  { id: "post", name: "[slug].md", href: "/blog", level: 1 },
  { name: "projects/", href: "/projects", dir: true },
  { id: "projects", name: "index.tsx", href: "/projects", level: 1 },
  ...PROJECTS.map(({ slug }) => ({
    id: `project:${slug}` as const,
    name: `${slug}.md`,
    href: `/projects/${slug}`,
    level: 1 as const,
  })),
  { id: "about", name: "about.md", href: "/about" },
  { id: "resume", name: "resume.md", href: "/resume" },
  { name: "life/", href: "/life/anime", dir: true },
  { id: "anime", name: "anime.md", href: "/life/anime", level: 1 },
  { id: "contact", name: "contact.md", href: "/contact" },
]

/** The explorer's file list in a locale, with the open file marked. */
export function explorerFiles(
  lang: Locale,
  /** null: no file is open (404) */
  current: SiteFile | null
): ExplorerItemProps[] {
  return FILES.map(({ id, ...file }) => ({
    ...file,
    href: localePath(lang, file.href),
    current: id === current,
  }))
}
