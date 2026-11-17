import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { LineNo } from "./line-no"

type BaseProps = { no: number; href: string }

export type PostRowProps = BaseProps & {
  variant?: "post"
  date: string
  title: string
  excerpt: string
  tag: string
  /**
   * translation missing: title drops to text-secondary, excerpt to text-muted,
   * and the row is not a link
   */
  missing?: boolean
  /** a button label (`open`, `no UA`) shown in place of the arrow */
  action?: string
}

export type ProjectRowProps = BaseProps & {
  variant: "project"
  name: string
  description: string
  stack: string
}

export type ListRowProps = PostRowProps | ProjectRowProps

const ROW =
  "flex min-h-22 flex-wrap items-center gap-x-5 gap-y-1 border-b border-line px-2 py-2.5 text-foreground no-underline hover:bg-hover @xl:flex-nowrap"

export function ListRow(props: ListRowProps) {
  if (props.variant === "project") {
    const { no, href, name, description, stack } = props
    return (
      <Link href={href} className={ROW}>
        <LineNo n={no} />
        <span className="w-42.5 flex-none text-[17px] font-medium text-accent">
          {name}
        </span>
        <span className="min-w-0 flex-[1_1_12rem] font-sans text-body text-secondary">
          {description}
        </span>
        <span className="flex-none text-right text-caption text-syntax-string @xl:w-45">
          {stack}
        </span>
      </Link>
    )
  }

  const { no, href, date, title, excerpt, tag, missing = false, action } = props
  const cells = (
    <>
      <LineNo n={no} />
      <span className="w-30 flex-none text-label text-muted">{date}</span>
      <span className="flex min-w-0 flex-[1_1_12rem] flex-col gap-1">
        <span
          className={cn(
            "font-sans text-row-title",
            missing ? "text-secondary" : "text-foreground"
          )}
        >
          {title}
        </span>
        <span
          className={cn(
            "font-sans text-row-excerpt",
            missing ? "text-muted" : "text-secondary"
          )}
        >
          {excerpt}
        </span>
      </span>
      <span
        className={cn(
          "flex-none text-label text-syntax-type",
          action ? "@xl:w-28" : "w-20"
        )}
      >
        {tag}
      </span>
      {action ? (
        <span
          className={cn(
            buttonVariants({ variant: missing ? "disabled" : "primary" }),
            "min-h-11 w-32.5 px-3"
          )}
        >
          {action}
        </span>
      ) : (
        <span aria-hidden="true" className="flex-none text-[16px] text-accent">
          -&gt;
        </span>
      )}
    </>
  )

  if (missing) {
    return (
      <div aria-disabled="true" className={cn(ROW, "hover:bg-transparent")}>
        {cells}
      </div>
    )
  }

  return (
    <Link href={href} className={ROW}>
      {cells}
    </Link>
  )
}
