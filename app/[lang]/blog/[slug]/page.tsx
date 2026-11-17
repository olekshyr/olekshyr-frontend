import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { EditorPane } from "@/components/site/editor-pane"
import {
  AUTHOR,
  JsonLd,
  absoluteUrl,
  blogPosting,
  blogRef,
} from "@/components/site/json-ld"
import { LangSwitch } from "@/components/site/lang-switch"
import { Prose, ProseMeta, ProseTitle } from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { Button } from "@/components/ui/button"
import { getPost, getPosts } from "@/lib/api"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALES,
  LOCALE_LABEL,
  hasLocale,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n"
import { withOutline, type OutlineItem } from "@/lib/post-body"

type Props = PageProps<"/[lang]/blog/[slug]">

/**
 * The whole page depends on the URL and a wrong URL must answer 404, which a
 * streamed page cannot, so it renders in one piece (no shared App Shell).
 */
export const instant = false

/**
 * A post that was not prerendered waits for its complete page on the first
 * request, so an unknown slug answers 404 instead of a 200 shell.
 */
export const ensureStatic = "navigation"

/** Cache Components needs at least one entry; this slug is never a real post. */
const NO_POSTS = "-"

/** Prerender the posts published in each locale; the rest render on demand. */
export async function generateStaticParams({
  params,
}: {
  params: { lang: string }
}) {
  if (!hasLocale(params.lang)) return [{ slug: NO_POSTS }]
  const posts = await getPosts(params.lang)
  return posts.length > 0
    ? posts.map((post) => ({ slug: post.slug }))
    : [{ slug: NO_POSTS }]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  if (!hasLocale(lang)) return {}

  const result = await getPost(slug, lang)
  if (result.status === "missing") return {}
  if (result.status === "untranslated") {
    // nothing to index in this locale
    return { robots: { index: false } }
  }

  const { post } = result
  return {
    title: `${post.metaTitle} | olekshyr.dev`,
    description: post.metaDescription,
    alternates: localeAlternates(lang, `/blog/${slug}`, post.availableLocales),
    openGraph: {
      type: "article",
      title: post.metaTitle,
      description: post.metaDescription,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      locale: HTML_LANG[lang],
    },
  }
}

export default async function BlogPost({ params }: Props) {
  const { lang, slug } = await params
  if (!hasLocale(lang)) notFound()

  const result = await getPost(slug, lang)
  if (result.status === "missing") notFound()

  const t = getDictionary(lang)
  const frame = {
    lang,
    path: `~/blog/${slug}.md`,
    files: explorerFiles(lang, "post"),
    status: { branch: "main", type: "markdown", locale: LOCALE_LABEL[lang] },
    langSwitch: <LangSwitch lang={lang} path={`/blog/${slug}`} />,
  }
  const tabs = { tab: `${slug}.md`, inactiveTabs: ["index.tsx"] }

  if (result.status === "untranslated") {
    // the post exists somewhere: ask the other locales which, and for a title
    const others = await Promise.all(
      LOCALES.filter((locale) => locale !== lang).map(async (locale) => {
        const other = await getPost(slug, locale)
        return other.status === "ok" ? { locale, title: other.post.title } : null
      })
    )
    const found = others.filter((other) => other !== null)
    const entry = {
      title: found[0]?.title,
      available: found.map((other) => other.locale),
    }
    return (
      <Shell {...frame}>
        <EditorPane {...tabs} className="flex flex-col gap-5">
          <Prose>
            <ProseTitle>{entry.title ?? slug}</ProseTitle>
            <ProseMeta>{t.notTranslated}</ProseMeta>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-label text-muted">{t.availableIn}</span>
              {entry.available.map((locale) => (
                <Button key={locale} asChild variant="ghost">
                  <Link
                    href={localePath(locale, `/blog/${slug}`)}
                    hrefLang={HTML_LANG[locale]}
                  >
                    {LOCALE_LABEL[locale]}
                  </Link>
                </Button>
              ))}
            </div>
            <PostNav lang={lang} allPosts={t.allPosts} />
          </Prose>
        </EditorPane>
      </Shell>
    )
  }

  const { post } = result
  const { html, outline } = withOutline(post.body)

  return (
    <Shell {...frame}>
      <EditorPane
        {...tabs}
        aside={<Outline label={t.outline} title={post.title} items={outline} />}
      >
        <Prose className="max-w-170">
          <ProseTitle id="top">{post.title}</ProseTitle>
          <ProseMeta>
            <time dateTime={post.publishedAt}>
              {post.publishedAt.slice(0, 10)}
            </time>
            {` | ${post.readTimeMinutes} ${t.min}`}
            {post.tags.length > 0 && " | "}
            <span className="text-syntax-type">
              {post.tags.map((tag) => `#${tag.name}`).join(" ")}
            </span>
            {` | ${post.availableLocales.map((l) => LOCALE_LABEL[l]).join(" ")}`}
          </ProseMeta>
          <div
            className="post-body"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <PostNav
            lang={lang}
            allPosts={t.allPosts}
            previous={post.previous ?? undefined}
            next={post.next ?? undefined}
          />
        </Prose>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            ...blogPosting(post, lang),
            description: post.metaDescription,
            dateModified: post.updatedAt,
            mainEntityOfPage: absoluteUrl(lang, `/blog/${slug}`),
            isPartOf: blogRef(lang),
            publisher: AUTHOR,
          }}
        />
      </EditorPane>
    </Shell>
  )
}

function PostNav({
  lang,
  allPosts,
  previous,
  next,
}: {
  lang: Locale
  allPosts: string
  previous?: { slug: string; title: string }
  next?: { slug: string; title: string }
}) {
  const link = "text-accent underline underline-offset-5 hover:text-accent-hover"
  return (
    <nav className="mt-3 flex flex-wrap justify-between gap-4 border-t border-line pt-5 text-label">
      {previous ? (
        <Link href={localePath(lang, `/blog/${previous.slug}`)} className={link}>
          &lt; {previous.title}
        </Link>
      ) : (
        <Link href={localePath(lang, "/blog")} className={link}>
          &lt; {allPosts}
        </Link>
      )}
      {next && (
        <Link href={localePath(lang, `/blog/${next.slug}`)} className={link}>
          {next.title} &gt;
        </Link>
      )}
    </nav>
  )
}

function Outline({
  label,
  title,
  items,
}: {
  label: string
  title: string
  items: OutlineItem[]
}) {
  const item =
    "flex min-h-9 items-center border-l-2 py-1 pl-3 no-underline hover:text-foreground"
  return (
    <aside className="hidden w-70 flex-none flex-col gap-1.5 border-l border-line bg-raised px-6 py-8 text-label lg:flex lg:min-h-0 lg:overflow-y-auto">
      <div className="mb-2 text-caption text-muted">{label}</div>
      <a href="#top" className={`${item} border-accent text-accent`}>
        {title}
      </a>
      {items.map(({ id, text }) => (
        <a
          key={id}
          href={`#${id}`}
          className={`${item} border-transparent text-secondary`}
        >
          {text}
        </a>
      ))}
    </aside>
  )
}
