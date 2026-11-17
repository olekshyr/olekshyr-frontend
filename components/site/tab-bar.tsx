import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

/** Static editor tab strip for the open file. Not interactive. */
export function TabBar({
  name,
  inactive = [],
  className,
  children,
}: {
  name: ReactNode
  /** other open tabs, shown before it and not selected */
  inactive?: string[]
  className?: string
  /** optional trailing content, e.g. a pane label */
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b border-line bg-raised",
        className
      )}
    >
      <div className="flex min-w-0 overflow-x-auto">
        {inactive.map((tab) => (
          <span
            key={tab}
            className="inline-flex min-h-12 flex-none items-center border-t-2 border-r border-t-transparent border-r-line px-6 text-label text-muted"
          >
            {tab}
          </span>
        ))}
        <span className="inline-flex min-h-12 flex-none items-center border-t-2 border-r border-t-accent border-r-line bg-background px-6 text-label text-foreground">
          {name}
        </span>
      </div>
      {children}
    </div>
  )
}
