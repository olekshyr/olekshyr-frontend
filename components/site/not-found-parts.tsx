"use client"

import { useParams, usePathname } from "next/navigation"
import type { ReactNode } from "react"

import {
  DEFAULT_LOCALE,
  hasLocale,
  localePath,
  splitLocale,
  type Locale,
} from "@/lib/i18n"
import { closestPath, fileOf, missingFileOf } from "@/lib/site-paths"

import { SuggestionRow } from "./suggestion-row"

/**
 * `not-found` gets no params, so the parts of the 404 page that depend on the
 * URL read it here. The path is taken without its locale segment: English is
 * served by a rewrite, and that part is the same on the server and in the
 * browser.
 */
function useMissingPath() {
  return splitLocale(usePathname()).rest
}

/** Shows the view of the URL's locale. */
export function LocalePick({ views }: { views: Record<Locale, ReactNode> }) {
  const { lang } = useParams<{ lang?: string }>()
  return views[lang && hasLocale(lang) ? lang : DEFAULT_LOCALE]
}

/** The requested path as a file: `~/blgo/helo-world.md`. */
export function MissingPath() {
  return missingFileOf(useMissingPath())
}

/** The existing page whose path is nearest to the requested one, if any. */
export function ClosestMatch({
  lang,
  candidates,
  note,
}: {
  lang: Locale
  /** locale-less paths of pages that exist */
  candidates: string[]
  note: string
}) {
  const match = closestPath(useMissingPath(), candidates)
  if (!match) return null
  return (
    <SuggestionRow
      href={localePath(lang, match)}
      file={fileOf(match)}
      note={note}
    />
  )
}
