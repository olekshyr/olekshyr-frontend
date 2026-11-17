import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

import { TabBar } from "./tab-bar"

/** A second editor group: its own tab, a body and an optional caption row. */
export function SplitPane({
  fileName,
  caption,
  plain = false,
  children,
}: {
  fileName: string
  caption?: string
  /** text output instead of centred media: no raised background */
  plain?: boolean
  children: ReactNode
}) {
  return (
    <aside className="flex w-full min-w-0 flex-none flex-col border-t border-frame lg:min-h-0 lg:w-[30vw] lg:max-w-240 lg:min-w-80 lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <TabBar name={fileName}>
        <span
          aria-hidden="true"
          className="px-4 text-caption text-syntax-comment"
        >
          split
        </span>
      </TabBar>
      <div
        className={cn(
          "flex flex-1 p-4 sm:p-8",
          plain ? "flex-col" : "items-start justify-center bg-raised"
        )}
      >
        {children}
      </div>
      {caption && (
        <div className="border-t border-line px-6 py-2.5 text-caption text-syntax-comment">
          {caption}
        </div>
      )}
    </aside>
  )
}
