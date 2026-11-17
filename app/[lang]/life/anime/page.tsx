import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AnimeList } from "@/components/site/anime-list"
import { Tok } from "@/components/site/code-block"
import { EditorPane } from "@/components/site/editor-pane"
import { LangSwitch } from "@/components/site/lang-switch"
import { ProseTitle } from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { getDictionary } from "@/lib/dictionary"
import { LOCALE_LABEL, hasLocale, localeAlternates } from "@/lib/i18n"
import { getAnimeList } from "@/lib/mal"

type Props = PageProps<"/[lang]/life/anime">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDictionary(lang)
  return {
    title: `${t.anime} | olekshyr.dev`,
    description: t.animeDescription,
    alternates: localeAlternates(lang, "/life/anime"),
  }
}

export default async function Anime({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDictionary(lang)

  // the page outlives MyAnimeList being down or not configured
  const entries = await getAnimeList(lang)

  return (
    <Shell
      lang={lang}
      path="~/life/anime.md"
      files={explorerFiles(lang, "anime")}
      status={{ branch: "main", type: "markdown", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/life/anime" />}
    >
      <EditorPane tab="anime.md" className="flex flex-col gap-5">
        <ProseTitle>{t.anime}</ProseTitle>
        <div className="text-label">
          <Tok c>{`// ${t.animeSource}`}</Tok>
        </div>
        {entries === null ? (
          <p className="m-0 border-t border-frame pt-5 text-label text-muted">
            {t.animeUnavailable}
          </p>
        ) : (
          <AnimeList
            entries={entries}
            labels={{
              show: t.animeShow,
              status: t.animeStatus,
              all: t.all,
              kinds: { anime: t.animeKind, manga: t.mangaKind },
              statuses: {
                watching: t.watching,
                reading: t.reading,
                completed: t.completed,
                on_hold: t.onHold,
                dropped: t.dropped,
              },
              shown: t.animeShown,
              nothing: t.animeNothing,
            }}
          />
        )}
      </EditorPane>
    </Shell>
  )
}
