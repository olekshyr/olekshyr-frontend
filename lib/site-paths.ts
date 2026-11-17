/**
 * The site's URL paths as the files the editor frame shows them as.
 * Pure: used on the server and in the browser.
 */

/** `/blog/hello` -> `~/blog/hello.md`, `/blog` -> `~/blog/`, `/` -> `~/home.tsx` */
export function fileOf(path: string): string {
  if (path === "/") return "~/home.tsx"
  if (path === "/blog" || path === "/projects") return `~${path}/`
  return `~${path}.md`
}

/** A path nobody has: shown as the markdown file it would have been. */
export function missingFileOf(path: string): string {
  const clean = path.replace(/\/+$/, "") || "/"
  // keep an extension the visitor typed
  return /\.[a-z0-9]+$/i.test(clean) ? `~${clean}` : `~${clean}.md`
}

function distance(a: string, b: string): number {
  let row = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const next = [i]
    for (let j = 1; j <= b.length; j++) {
      next[j] = Math.min(
        row[j] + 1,
        next[j - 1] + 1,
        row[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
    }
    row = next
  }
  return row[b.length]
}

/** The candidate nearest to a mistyped path, if any is near enough to be meant. */
export function closestPath(path: string, candidates: string[]): string | null {
  const wanted = path.toLowerCase().replace(/\/+$/, "") || "/"
  let best: string | null = null
  let bestDistance = Infinity
  for (const candidate of candidates) {
    const d = distance(wanted, candidate.toLowerCase())
    if (d < bestDistance) {
      best = candidate
      bestDistance = d
    }
  }
  const limit = Math.max(2, Math.floor(wanted.length / 3))
  return best !== null && bestDistance <= limit ? best : null
}
