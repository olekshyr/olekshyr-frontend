import { notFound } from "next/navigation"

/**
 * The whole page depends on the URL and a wrong URL must answer 404, which a
 * streamed page cannot, so it renders in one piece (no shared App Shell).
 */
export const instant = false

/**
 * Every URL no other route takes. It exists so those URLs render inside the
 * `[lang]` layout and get `not-found.tsx`, with the right `<html lang>`.
 */
export const ensureStatic = "navigation"

/** Cache Components needs at least one entry. */
export function generateStaticParams() {
  return [{ rest: ["-"] }]
}

export default function CatchAll() {
  notFound()
}
