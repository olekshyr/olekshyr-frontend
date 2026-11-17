"use client"

import type { ComponentProps } from "react"

import { Toggle } from "@/components/ui/toggle"

export type ChipProps = ComponentProps<typeof Toggle>

/** A filter chip: outline control that fills with the accent when pressed. */
export function Chip(props: ChipProps) {
  return <Toggle {...props} />
}
