import type { ComponentProps } from "react"

import { cn } from "@/lib/utils"

export function Prose({ className, ...props }: ComponentProps<"article">) {
  return (
    <article
      className={cn("flex max-w-prose flex-col gap-4.5", className)}
      {...props}
    />
  )
}

export function ProseTitle({
  className,
  children,
  ...props
}: ComponentProps<"h1">) {
  return (
    <h1
      className={cn("m-0 font-mono text-title-lg text-balance", className)}
      {...props}
    >
      <span className="text-syntax-keyword"># </span>
      {children}
    </h1>
  )
}

export function ProseHeading({
  className,
  children,
  ...props
}: ComponentProps<"h2">) {
  return (
    <h2
      className={cn("mt-2 mb-0 font-mono text-heading", className)}
      {...props}
    >
      <span className="text-syntax-keyword">## </span>
      {children}
    </h2>
  )
}

export function ProseMeta({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("m-0 text-label text-muted", className)} {...props} />
}

export function ProseP({ className, ...props }: ComponentProps<"p">) {
  return (
    <p
      className={cn("m-0 font-sans text-body-lg text-secondary", className)}
      {...props}
    />
  )
}
