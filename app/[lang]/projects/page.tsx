import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { Tok } from "@/components/site/code-block"
import { EditorPane } from "@/components/site/editor-pane"
import { AUTHOR, JsonLd, absoluteUrl } from "@/components/site/json-ld"
import { LangSwitch } from "@/components/site/lang-switch"
import { LineNo } from "@/components/site/line-no"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALE_LABEL,
  hasLocale,
  localeAlternates,
  localePath,
} from "@/lib/i18n"
import { PROJECTS } from "@/lib/projects"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[lang]/projects">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDictionary(lang)
  return {
    title: `${t.projects} | olekshyr.dev`,
    description: t.projectsDescription,
    alternates: localeAlternates(lang, "/projects"),
  }
}

const INDENT = ["", "pl-[2ch]", "pl-[4ch]"] as const

/** One line of the source listing, with its number. */
function Line({
  n,
  indent = 0,
  children,
}: {
  n: number
  indent?: 0 | 1 | 2
  children: ReactNode
}) {
  return (
    <div className="flex items-baseline gap-6">
      <LineNo n={n} />
      <div className={cn("min-w-0 break-words", INDENT[indent])}>
        {children}
      </div>
    </div>
  )
}

/** Lines each project takes in the listing. */
const LINES = 6

/** The project list, written as the array it would be in source. */
export default async function Projects({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDictionary(lang)

  return (
    <Shell
      lang={lang}
      path="~/projects/index.tsx"
      files={explorerFiles(lang, "projects")}
      status={{ branch: "main", type: "tsx", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/projects" />}
    >
      <EditorPane tab="index.tsx" inactiveTabs={["home.tsx"]}>
        <h1 className="sr-only">{t.projects}</h1>
        <div className="flex max-w-240 flex-col text-code-hero leading-[1.9]">
          <Line n={1}>
            <Tok c>{`// projects/index.tsx, ${t.projectsHint}`}</Tok>
          </Line>
          <Line n={2}>
            <Tok k>export const</Tok> projects = [
          </Line>
          {PROJECTS.map((project, i) => {
            const n = 3 + i * LINES
            return (
              <div key={project.slug}>
                <Line n={n} indent={1}>
                  {"{"}
                </Line>
                <Line n={n + 1} indent={2}>
                  <Tok n>name</Tok>:{" "}
                  <Link
                    href={localePath(lang, `/projects/${project.slug}`)}
                    className="inline-flex min-h-9 items-center text-accent underline underline-offset-6 hover:text-accent-hover"
                  >
                    &quot;{project.slug}&quot;
                  </Link>
                  ,
                </Line>
                <Line n={n + 2} indent={2}>
                  <Tok n>about</Tok>: <Tok s>&quot;{project.about[lang]}&quot;</Tok>,
                </Line>
                <Line n={n + 3} indent={2}>
                  <Tok n>stack</Tok>:{" "}
                  <Tok s>
                    {project.stack.length > 0
                      ? `[${project.stack.map((s) => `"${s}"`).join(", ")}]`
                      : `["[stack]"]`}
                  </Tok>
                  ,
                </Line>
                <Line n={n + 4} indent={2}>
                  <Tok n>status</Tok>:{" "}
                  <Tok s>&quot;{project.status ?? "[status]"}&quot;</Tok>,
                </Line>
                <Line n={n + 5} indent={1}>
                  {"},"}
                </Line>
              </div>
            )
          })}
          <Line n={3 + PROJECTS.length * LINES}>];</Line>
        </div>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "@id": absoluteUrl(lang, "/projects"),
            url: absoluteUrl(lang, "/projects"),
            name: `${t.projects} | olekshyr.dev`,
            description: t.projectsDescription,
            inLanguage: HTML_LANG[lang],
            author: AUTHOR,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: PROJECTS.map((project, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: project.slug,
                url: absoluteUrl(lang, `/projects/${project.slug}`),
              })),
            },
          }}
        />
      </EditorPane>
    </Shell>
  )
}
