import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { TabBar } from "./tab-bar"

/**
 * The open file: a tab strip over the only scrolling area of the frame, with
 * an optional second pane (outline, split view) to its right.
 */
export function EditorPane({
  tab,
  inactiveTabs,
  aside,
  className,
  children,
}: {
  /** the open file's tab */
  tab: ReactNode
  /** other tabs shown before it, not selected */
  inactiveTabs?: string[]
  aside?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-wrap items-stretch lg:min-h-0 lg:flex-nowrap">
      <div className="@container flex min-w-0 flex-[1_1_560px] flex-col lg:min-h-0">
        <TabBar name={tab} inactive={inactiveTabs} />
        <div
          className={cn(
            "p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto @xl:p-10",
            className
          )}
        >
          {children}
        </div>
      </div>
      {aside}
    </div>
  )
}
