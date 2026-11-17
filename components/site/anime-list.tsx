"use client"

import { useState, type ReactNode } from "react"

import { toggleVariants } from "@/components/ui/toggle-variants"
import {
  ANIME_KINDS,
  ANIME_STATUSES,
  type AnimeEntry,
  type AnimeKind,
  type AnimeStatus,
} from "@/lib/anime"
import { cn } from "@/lib/utils"

export type AnimeListLabels = {
  show: string
  status: string
  all: string
  kinds: Record<AnimeKind, string>
  statuses: Record<AnimeStatus, string>
  /** `{n}` and `{m}` are replaced by the shown and total counts */
  shown: string
  nothing: string
}

const BADGE: Record<AnimeStatus, string> = {
  watching: "bg-accent",
  reading: "bg-accent",
  completed: "bg-syntax-type",
  on_hold: "bg-syntax-string",
  dropped: "bg-(--ol-text-secondary)",
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      data-state={on ? "on" : "off"}
      onClick={onClick}
      className={cn(toggleVariants(), "font-mono")}
    >
      {children}
    </button>
  )
}

/** The cover grid with its kind and status filters. Filtering is in the browser. */
export function AnimeList({
  entries,
  labels,
}: {
  entries: AnimeEntry[]
  labels: AnimeListLabels
}) {
  const [kind, setKind] = useState<AnimeKind | null>(null)
  const [status, setStatus] = useState<AnimeStatus | null>(null)

  const rows = entries.filter(
    (entry) =>
      (kind === null || entry.kind === kind) &&
      (status === null || entry.status === status)
  )
  // only the statuses the list has
  const statuses = ANIME_STATUSES.filter((s) =>
    entries.some((entry) => entry.status === s)
  )
  const group = "flex flex-wrap items-center gap-2.5"
  const legend = "text-label text-syntax-comment"

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="group" aria-label={labels.show} className={group}>
          <span aria-hidden="true" className={legend}>
            {labels.show}
          </span>
          <Chip on={kind === null} onClick={() => setKind(null)}>
            {labels.all}
          </Chip>
          {ANIME_KINDS.map((k) => (
            <Chip key={k} on={kind === k} onClick={() => setKind(k)}>
              {labels.kinds[k]}
            </Chip>
          ))}
        </div>
        <div role="group" aria-label={labels.status} className={group}>
          <span aria-hidden="true" className={legend}>
            {labels.status}
          </span>
          <Chip on={status === null} onClick={() => setStatus(null)}>
            {labels.all}
          </Chip>
          {statuses.map((s) => (
            <Chip key={s} on={status === s} onClick={() => setStatus(s)}>
              {labels.statuses[s]}
            </Chip>
          ))}
        </div>
      </div>
      <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-x-5 gap-y-7 border-t border-frame p-0 pt-5 @xl:grid-cols-[repeat(auto-fill,minmax(190px,1fr))]">
        {rows.map((entry) => (
          <li key={entry.id}>
            <Card entry={entry} labels={labels} />
          </li>
        ))}
      </ul>
      <p aria-live="polite" className="m-0 text-label text-syntax-comment">
        {rows.length > 0
          ? labels.shown
              .replace("{n}", String(rows.length))
              .replace("{m}", String(entries.length))
          : labels.nothing}
      </p>
    </>
  )
}

function Card({
  entry,
  labels,
}: {
  entry: AnimeEntry
  labels: AnimeListLabels
}) {
  const corner = "absolute inline-flex min-h-7 items-center px-2.5"
  const content = (
    <>
      <div className="relative flex aspect-2/3 items-center justify-center overflow-hidden border border-control bg-selected group-hover:border-accent">
        {entry.cover ? (
          // covers come from the list service, in whatever size it has
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={entry.cover}
            alt=""
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden="true" className="text-caption text-syntax-comment">
            [cover]
          </span>
        )}
        <span
          className={cn(
            corner,
            "top-0 left-0 text-[12px] font-bold text-on-accent",
            BADGE[entry.status]
          )}
        >
          {labels.statuses[entry.status]}
        </span>
        <span
          className={cn(
            corner,
            "right-0 bottom-0 border-t border-l border-control bg-background text-caption text-syntax-string"
          )}
        >
          {entry.score === null ? "-" : `${entry.score}/10`}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-sans text-[17px] leading-[1.3] font-semibold group-hover:text-accent-hover">
          {entry.title}
        </span>
        <span className="text-caption text-syntax-type">
          {labels.kinds[entry.kind]}
        </span>
      </div>
    </>
  )
  const card = "group flex flex-col gap-2.5 text-foreground no-underline"

  return entry.url ? (
    <a href={entry.url} className={card}>
      {content}
    </a>
  ) : (
    <div className={card}>{content}</div>
  )
}
