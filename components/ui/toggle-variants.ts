import { cva } from "class-variance-authority"

/** The Chip look. Kept out of the client file so server components can use it. */
export const toggleVariants = cva(
  "inline-flex min-h-10 min-w-12 cursor-pointer items-center justify-center border border-control bg-transparent px-4 text-caption text-secondary whitespace-nowrap hover:border-accent hover:text-foreground data-[state=on]:border-accent data-[state=on]:bg-accent data-[state=on]:text-on-accent"
)
