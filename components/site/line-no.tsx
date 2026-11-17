import { cn } from "@/lib/utils"

/** A single decorative line number in the 28px gutter. */
export function LineNo({ n, className }: { n: number; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "w-7 flex-none text-right text-code text-gutter select-none",
        className
      )}
    >
      {n}
    </span>
  )
}

/** A multi-line gutter counting from `start` for `count` lines. */
export function Gutter({
  start = 1,
  count,
  className,
}: {
  start?: number
  count: number
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "w-7 flex-none pt-0.5 text-right text-code leading-[1.9] text-gutter select-none",
        className
      )}
    >
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="block">
          {start + i}
        </span>
      ))}
    </div>
  )
}
