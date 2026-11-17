import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex min-h-button shrink-0 items-center justify-center border px-6 text-label whitespace-nowrap no-underline",
  {
    variants: {
      variant: {
        primary:
          "cursor-pointer border-accent bg-accent font-bold text-on-accent hover:border-accent-hover hover:bg-accent-hover",
        ghost:
          "cursor-pointer border-control bg-transparent text-foreground hover:border-accent hover:text-accent",
        disabled:
          "cursor-not-allowed border-dashed border-control bg-transparent text-secondary",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
)

function Button({
  className,
  variant = "primary",
  asChild = false,
  onClick,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"
  const isDisabled = variant === "disabled"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      aria-disabled={isDisabled ? true : undefined}
      onClick={
        isDisabled
          ? (event: React.MouseEvent<HTMLButtonElement>) =>
              event.preventDefault()
          : onClick
      }
      className={cn(buttonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Button, buttonVariants }
