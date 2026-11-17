import { Tok } from "@/components/site/code-block"
import { EditorPane } from "@/components/site/editor-pane"
import { LangSwitch } from "@/components/site/lang-switch"
import {
  ClosestMatch,
  LocalePick,
  MissingPath,
} from "@/components/site/not-found-parts"
import { ProseP } from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { SuggestionRow } from "@/components/site/suggestion-row"
import { getPosts } from "@/lib/api"
import { getDictionary } from "@/lib/dictionary"
import { LOCALES, LOCALE_LABEL, localePath, type Locale } from "@/lib/i18n"
import { PROJECTS } from "@/lib/projects"

/** Paths of the pages that exist, for the closest-match suggestion. */
async function existingPaths(): Promise<string[]> {
  // the 404 page must not fail with the API
  const posts = await Promise.all(
    LOCALES.map((locale) => getPosts(locale).catch(() => []))
  )
  const slugs = new Set(posts.flat().map((post) => post.slug))
  return [
    "/",
    "/blog",
    "/projects",
    "/resume",
    "/contact",
    "/life/anime",
    ...PROJECTS.map((project) => `/projects/${project.slug}`),
    ...[...slugs].map((slug) => `/blog/${slug}`),
  ]
}

function NotFoundView({
  lang,
  candidates,
}: {
  lang: Locale
  candidates: string[]
}) {
  const t = getDictionary(lang)
  return (
    <Shell
      lang={lang}
      path="~"
      error={<MissingPath />}
      files={explorerFiles(lang, null)}
      status={{ branch: "main", type: "1 error", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/" />}
    >
      {/* `metadata` is not read from a nested not-found; React hoists this */}
      <title>404 | olekshyr.dev</title>
      <EditorPane tab={<span className="text-syntax-number">404</span>}>
        <div className="flex max-w-190 flex-col gap-6 @xl:py-6">
          <pre className="m-0 font-mono text-[16px] leading-[1.9] break-words whitespace-pre-wrap">
            <Tok c>$</Tok> open <MissingPath />
            {"\n"}
            <Tok n>ENOENT: no such file or directory</Tok>
          </pre>
          <h1 className="m-0 text-[56px] leading-[1.05] font-bold tracking-[-0.02em]">
            404
          </h1>
          <ProseP>{t.notFoundText}</ProseP>
          <div className="mt-2 text-label text-syntax-comment">
            {t.didYouMean}
          </div>
          <div className="flex flex-col border-t border-frame">
            <ClosestMatch
              lang={lang}
              candidates={candidates}
              note={t.closestMatch}
            />
            <SuggestionRow
              href={localePath(lang, "/blog")}
              file="~/blog/"
              note={t.allPosts}
            />
            <SuggestionRow
              href={localePath(lang, "/")}
              file="~/home.tsx"
              note={t.startOver}
            />
          </div>
        </div>
      </EditorPane>
    </Shell>
  )
}

/**
 * The 404 page. `not-found` receives no params, so every locale's view is
 * rendered and the browser-side `LocalePick` shows the one of the URL.
 */
export default async function NotFound() {
  const candidates = await existingPaths()
  return (
    <LocalePick
      views={{
        en: <NotFoundView lang="en" candidates={candidates} />,
        uk: <NotFoundView lang="uk" candidates={candidates} />,
        ja: <NotFoundView lang="ja" candidates={candidates} />,
      }}
    />
  )
}
