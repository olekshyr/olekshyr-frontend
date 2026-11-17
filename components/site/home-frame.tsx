import Link from "next/link"
import type { ReactNode } from "react"

import { LOCALE_LABEL, localePath, type Locale } from "@/lib/i18n"


import { Tok } from "./code-block"
import type { ExplorerItemProps } from "./explorer-item"
import { Gutter, LineNo } from "./line-no"
import { LangSwitch } from "./lang-switch"
import { Shell } from "./shell"
import { TabBar } from "./tab-bar"

const COPY: Record<
  Locale,
  { lc: string; h1: string; p: string; cta: string }
> = {
  en: {
    lc: "en",
    h1: "Frontend first. Full stack when it counts.",
    p: "Notes, projects and a CV.",
    cta: "read the blog",
  },
  uk: {
    lc: "uk",
    h1: "Спершу фронтенд. Повний стек, коли потрібно.",
    p: "Нотатки, проєкти та резюме.",
    cta: "читати блог",
  },
  ja: {
    lc: "ja",
    h1: "まずフロントエンド。必要ならフルスタック。",
    p: "ノート、プロジェクト、履歴書。",
    cta: "ブログを読む",
  },
}

const SP = " "

/**
 * The home page frame: the shell plus the headline block in the page's locale.
 * Everything below the fold and the split pane arrive as slots.
 */
export function HomeFrame({
  lang,
  files,
  below,
  aside,
}: {
  lang: Locale
  files: ExplorerItemProps[]
  /** content under the headline, from `// below the fold` onwards */
  below: ReactNode
  /** the split pane */
  aside: ReactNode
}) {
  const t = COPY[lang]

  return (
    <Shell
      lang={lang}
      path="~/home.tsx"
      files={files}
      status={{ branch: "main", type: "tsx", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/" />}
    >
      <div className="flex flex-1 flex-wrap items-stretch lg:min-h-0 lg:flex-nowrap">
        <div className="@container flex min-w-0 flex-[1_1_560px] flex-col lg:min-h-0">
          <TabBar name="home.tsx" />
          <div className="px-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto pt-8 pb-14 text-[19px] leading-[1.9] @xl:pt-12 @xl:pr-12 @xl:pl-10">
            <div className="flex gap-6 text-code-hero">
              <Gutter count={9} />
              <div className="min-w-0">
                <div className="whitespace-pre-wrap">
                  <Tok k>export default function</Tok> <Tok t>Home</Tok>() {"{"}
                </div>
                <div className="whitespace-pre-wrap">
                  {SP + SP}
                  <Tok k>return</Tok> (
                </div>
                <div className="whitespace-pre-wrap">
                  {SP + SP + SP + SP}&lt;<Tok t>main</Tok> <Tok n>lang</Tok>=
                  <Tok s>&quot;{t.lc}&quot;</Tok>&gt;
                </div>
                <div className="pl-8 @xl:pl-18">
                  <h1 className="m-0 text-[32px] leading-[1.15] font-bold tracking-[-0.02em] text-balance @xl:text-[42px]">
                    {t.h1}
                  </h1>
                </div>
                <div className="pl-6 @xl:pl-12">
                  &lt;<Tok t>p</Tok>&gt;
                  <span className="text-secondary">{t.p}</span>&lt;/
                  <Tok t>p</Tok>&gt;
                </div>
                <div className="pl-6 @xl:pl-12">
                  &lt;<Tok t>Link</Tok> <Tok n>href</Tok>=<Tok s>&quot;/blog&quot;</Tok>
                  &gt;
                  <Link
                    href={localePath(lang, "/blog")}
                    className="text-accent underline underline-offset-6 hover:text-accent-hover"
                  >
                    {t.cta}
                  </Link>
                  &lt;/<Tok t>Link</Tok>&gt;
                </div>
                <div className="whitespace-pre-wrap">
                  {SP + SP + SP + SP}&lt;/<Tok t>main</Tok>&gt;
                </div>
                <div className="whitespace-pre-wrap">{SP + SP})</div>
                <div>{"}"}</div>
              </div>
            </div>
            <div className="mt-6 flex gap-5 px-2">
              <LineNo n={10} />
              <Tok c>{"// below the fold"}</Tok>
            </div>
            {below}
          </div>
        </div>
        {aside}
      </div>
    </Shell>
  )
}
