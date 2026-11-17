import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { getTags, listPosts } from "@/lib/api"
import {
  PAGE_SIZE,
  blogViewPath,
  isFiltered,
  type BlogView,
} from "@/lib/blog-view"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALE_LABEL,
  localeAlternates,
  localePath,
  type Locale,
} from "@/lib/i18n"

import { BlogList, type BlogListRow } from "./blog-list"
import { Tok } from "./code-block"
import { EditorPane } from "./editor-pane"
import { AUTHOR, JsonLd, absoluteUrl, blogPosting } from "./json-ld"
import { LangSwitch } from "./lang-switch"
import { Shell } from "./shell"
import { explorerFiles } from "./site-files"

/**
 * Metadata of a blog list view. Each page of the plain list is its own
 * indexable document: self-canonical, with the same page in the other
 * languages as its alternates. Filtered and re-sorted views are not indexed.
 */
export function blogListMetadata(lang: Locale, view: BlogView): Metadata {
  const t = getDictionary(lang)
  const title = [t.blog, view.page > 1 && `${t.page} ${view.page}`]
    .filter(Boolean)
    .join(", ")

  return {
    title: `${title} | olekshyr.dev`,
    description: t.blogDescription,
    ...(isFiltered(view)
      ? { robots: { index: false, follow: true } }
      : { alternates: localeAlternates(lang, blogViewPath(view)) }),
  }
}

/** One view of the blog list: `/blog`, `/blog/page/2`, `/blog/tag/java`, ... */
export async function BlogListPage({
  lang,
  view,
}: {
  lang: Locale
  view: BlogView
}) {
  const t = getDictionary(lang)
  const [posts, tags] = await Promise.all([
    listPosts(lang, view),
    getTags(lang),
  ])
  const { totalPages } = posts.page

  // a tag nobody uses, or a page past the end, is not a page of this site
  if (view.tag && !tags.some((tag) => tag.slug === view.tag)) notFound()
  if (view.page > Math.max(totalPages, 1)) notFound()

  const path = blogViewPath(view)
  const rows: BlogListRow[] = posts.content.map((post) => {
    const translated = post.translated ?? true
    return {
      slug: post.slug,
      href: localePath(lang, `/blog/${post.slug}`),
      date: post.publishedAt.slice(0, 10),
      title: post.title,
      excerpt: translated ? post.excerpt : t.notTranslated,
      tags: post.tags.map(({ slug, name }) => ({ slug, name })),
      translated,
    }
  })

  return (
    <Shell
      lang={lang}
      path="~/blog/index.tsx"
      files={explorerFiles(lang, "blog")}
      status={{ branch: "main", type: "tsx", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path={path} />}
    >
      <EditorPane
        tab="index.tsx"
        inactiveTabs={["home.tsx"]}
        className="flex flex-col gap-5"
      >
        <Tok c>{"// blog/index.tsx"}</Tok>
        <h1 className="m-0 text-title-xl">{t.blog}</h1>
        <BlogList
          lang={lang}
          view={view}
          rows={rows}
          tags={tags.map(({ slug, name }) => ({ slug, name }))}
          totalPages={totalPages}
          firstNo={(view.page - 1) * PAGE_SIZE + 1}
          labels={{
            filter: t.filter,
            all: t.all,
            newestFirst: t.newestFirst,
            oldestFirst: t.oldestFirst,
            date: t.date,
            title: t.title,
            tag: t.tag,
            open: t.open,
            noLocale: t.noLocale,
            noPosts: t.noPosts,
            pages: t.pages,
            previous: t.previous,
            next: t.next,
          }}
        />
        {rows.some((row) => !row.translated) && (
          <p className="m-0 text-caption text-syntax-comment">
            {t.missingNote}
          </p>
        )}
        {!isFiltered(view) && (
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "Blog",
              "@id": absoluteUrl(lang, "/blog"),
              url: absoluteUrl(lang, path),
              name: `${t.blog} | olekshyr.dev`,
              description: t.blogDescription,
              inLanguage: HTML_LANG[lang],
              author: AUTHOR,
              // only this page's posts that exist in this language
              blogPost: posts.content
                .filter((post) => post.translated ?? true)
                .map((post) => blogPosting(post, lang)),
            }}
          />
        )}
      </EditorPane>
    </Shell>
  )
}
