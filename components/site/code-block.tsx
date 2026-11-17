import type { ComponentProps, ReactNode } from "react"

import { cn } from "@/lib/utils"

const TOKEN = {
  k: "text-syntax-keyword",
  s: "text-syntax-string",
  t: "text-syntax-type",
  n: "text-syntax-number",
  c: "text-syntax-comment",
} as const

type TokProps = { children: ReactNode } & {
  [K in keyof typeof TOKEN]?: boolean
}

/** Syntax token span: pass exactly one of k (keyword), s (string), t (type), n (number), c (comment). */
export function Tok({ children, ...kinds }: TokProps) {
  const kind = (Object.keys(TOKEN) as (keyof typeof TOKEN)[]).find(
    (key) => kinds[key]
  )
  return <span className={kind ? TOKEN[kind] : undefined}>{children}</span>
}

export function CodeBlock({ className, ...props }: ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "m-0 overflow-auto border border-frame bg-raised px-6 py-5 text-code text-foreground",
        className
      )}
      {...props}
    />
  )
}
