export type OutlineItem = { id: string; text: string }

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
}

function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .trim()
}

/**
 * Gives every `<h2>` of a post body an id and returns the outline built from
 * them. The body is already sanitized by the API; only the id is added.
 */
export function withOutline(body: string): {
  html: string
  outline: OutlineItem[]
} {
  const outline: OutlineItem[] = []
  const html = body.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_match, attrs: string | undefined, inner: string) => {
      const id = `section-${outline.length + 1}`
      outline.push({ id, text: plainText(inner) })
      const rest = (attrs ?? "").replace(/\sid="[^"]*"/i, "")
      return `<h2 id="${id}"${rest}>${inner}</h2>`
    }
  )
  return { html, outline }
}
