import Link from "next/link"

import { cn } from "@/lib/utils"

export type ExplorerItemProps = {
  name: string
  href: string
  /** nesting level; 1 indents by one level */
  level?: 0 | 1
  /** folder row (name ends with `/`) */
  dir?: boolean
  /** the open file */
  current?: boolean
}

export function ExplorerItem({
  name,
  href,
  level = 0,
  dir = false,
  current = false,
}: ExplorerItemProps) {
  return (
    <Link
      href={href}
      aria-current={current ? "true" : undefined}
      className={cn(
        "flex min-h-10 items-center border-l-2 border-transparent pr-6 text-label no-underline hover:bg-hover",
        level === 1 ? "pl-11" : "pl-6",
        dir ? "text-secondary" : "text-foreground",
        current && "border-accent bg-selected text-accent hover:bg-selected"
      )}
    >
      {name}
    </Link>
  )
}
