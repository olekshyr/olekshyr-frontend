/**
 * Personal details shown on the resume and contact pages.
 * A `null` shows as a bracketed placeholder and is not a link.
 */
export const PROFILE: {
  name: string
  surname: string | null
  email: string | null
  /** profile URL, e.g. `https://github.com/name` */
  github: string | null
  linkedin: string | null
  /** city, country */
  location: string | null
} = {
  name: "Oleksandr",
  surname: null,
  email: null,
  github: null,
  linkedin: null,
  location: null,
}

/** A URL as shown in text: no scheme, no trailing slash. */
export const displayUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")
