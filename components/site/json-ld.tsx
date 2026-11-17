import { HTML_LANG, SITE_URL, localePath, type Locale } from "@/lib/i18n"

/** A schema.org JSON-LD block. `<` is escaped so content cannot close the script. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  )
}

/** Absolute URL of a locale-less path in a locale. */
export const absoluteUrl = (lang: Locale, path: string) =>
  `${SITE_URL}${localePath(lang, path)}`.replace(/\/$/, "")

export const AUTHOR = {
  "@type": "Person",
  name: "Oleksandr",
  url: SITE_URL,
}

type PostLike = {
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  readTimeMinutes: number
  tags: { name: string }[]
}

/** The fields a post has both in the list and on its own page. */
export function blogPosting(post: PostLike, lang: Locale) {
  const url = absoluteUrl(lang, `/blog/${post.slug}`)
  return {
    "@type": "BlogPosting",
    "@id": url,
    url,
    headline: post.title,
    description: post.excerpt,
    datePublished: post.publishedAt,
    inLanguage: HTML_LANG[lang],
    timeRequired: `PT${post.readTimeMinutes}M`,
    ...(post.tags.length > 0
      ? { keywords: post.tags.map((tag) => tag.name).join(", ") }
      : {}),
    author: AUTHOR,
  }
}

/** The blog in a locale; posts and the list page point at it. */
export function blogRef(lang: Locale) {
  const url = absoluteUrl(lang, "/blog")
  return { "@type": "Blog", "@id": url, url }
}
