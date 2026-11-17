import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

const FIELD =
  "box-border w-full border border-control bg-raised text-foreground placeholder:text-muted hover:border-accent"

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(FIELD, "min-h-12 px-3.5 font-mono text-[15px]", className)}
      {...props}
    />
  )
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        FIELD,
        "min-h-40 resize-y px-3.5 py-3 font-sans text-[16px] leading-[1.6]",
        className
      )}
      {...props}
    />
  )
}
