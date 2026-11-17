import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"

import { Tok } from "@/components/site/code-block"
import { HomeFrame } from "@/components/site/home-frame"
import { LineNo } from "@/components/site/line-no"
import { explorerFiles } from "@/components/site/site-files"
import { ListRow, type ListRowProps } from "@/components/site/list-row"
import { SplitPane } from "@/components/site/split-pane"
import { hasLocale, localeAlternates, localePath, type Locale } from "@/lib/i18n"
import { PROJECTS } from "@/lib/projects"

const POSTS: ListRowProps[] = [
  {
    no: 12,
    href: "/blog",
    date: "[2026-00-00]",
    title: "[Post title one]",
    excerpt: "[A one-line excerpt appears here.]",
    tag: "#java",
  },
  {
    no: 13,
    href: "/blog",
    date: "[2026-00-00]",
    title: "[Post title two]",
    excerpt: "[A one-line excerpt appears here.]",
    tag: "#react",
  },
  {
    no: 14,
    href: "/blog",
    date: "[2026-00-00]",
    title: "[Post title three]",
    excerpt: "[A one-line excerpt appears here.]",
    tag: "#site",
  },
]

/** The first three projects, as rows 19 to 21. */
const featuredProjects = (lang: Locale): ListRowProps[] =>
  PROJECTS.slice(0, 3).map((project, i) => ({
    variant: "project",
    no: 19 + i,
    href: `/projects/${project.slug}`,
    name: project.slug,
    description: project.about[lang],
    stack: project.stack.length > 0 ? project.stack.join(", ") : "[stack]",
  }))

function Section({
  lang,
  no,
  tag,
  props,
  heading,
  rows,
  moreNo,
  moreHref,
  moreLabel,
}: {
  lang: Locale
  no: number
  tag: string
  props?: ReactNode
  heading: string
  rows: ListRowProps[]
  moreNo: number
  moreHref: string
  moreLabel: string
}) {
  return (
    <section className="mt-14 flex flex-col gap-3.5">
      <div className="flex gap-5 px-2 text-code">
        <LineNo n={no} />
        <span>
          <Tok c>&lt;</Tok>
          <Tok t>{tag}</Tok>
          {props}
          <Tok c> /&gt;</Tok>
        </span>
      </div>
      <h2 className="m-0 ml-14 text-[30px] leading-[1.2] font-bold tracking-[-0.01em]">
        {heading}
      </h2>
      <div className="flex flex-col border-t border-frame">
        {rows.map((row) => (
          <ListRow key={row.no} {...row} href={localePath(lang, row.href)} />
        ))}
      </div>
      <div className="flex gap-5 px-2">
        <LineNo n={moreNo} />
        <Link
          href={localePath(lang, moreHref)}
          className="text-code text-accent underline underline-offset-5 hover:text-accent-hover"
        >
          {moreLabel}
        </Link>
      </div>
    </section>
  )
}

const below = (lang: Locale) => (
  <>
    <Section
      lang={lang}
      no={11}
      tag="LatestPosts"
      props={
        <>
          {" "}
          <Tok n>limit</Tok>={"{"}
          <Tok n>3</Tok>
          {"}"}
        </>
      }
      heading="Latest writing"
      rows={POSTS}
      moreNo={15}
      moreHref="/blog"
      moreLabel="all posts"
    />
    <Section
      lang={lang}
      no={18}
      tag="FeaturedProjects"
      heading="Selected projects"
      rows={featuredProjects(lang)}
      moreNo={22}
      moreHref="/projects"
      moreLabel="all projects"
    />
    <footer className="mt-16 flex flex-col gap-1.5 border-t border-frame pt-6 text-code leading-[1.9]">
      <div className="flex gap-5 px-2">
        <LineNo n={26} />
        <span>
          <Tok c>&lt;</Tok>
          <Tok t>Footer</Tok>
          <Tok c> /&gt;</Tok>
        </span>
      </div>
      <div className="flex gap-5 px-2">
        <LineNo n={27} />
        <span className="text-secondary">
          email <Tok t>[your email]</Tok> | github <Tok t>[your profile]</Tok> |{" "}
          <Tok t>resume.pdf</Tok>
        </span>
      </div>
      <div className="flex gap-5 px-2">
        <LineNo n={28} />
        <Tok c>{"// built with Spring and Next.js, source on GitHub"}</Tok>
      </div>
    </footer>
  </>
)

const ASIDE = (
  <SplitPane fileName="photo.jpg" caption="photo.jpg | image/jpeg">
    <Image
      src="/photo.png"
      alt="Oleksandr outdoors, with pine trees behind him"
      width={953}
      height={1271}
      sizes="(min-width: 1024px) 30vw, 100vw"
      className="block h-auto max-h-[80dvh] w-auto lg:max-h-[calc(100dvh-17rem)] max-w-full border border-frame object-contain"
    />
  </SplitPane>
)

const DESCRIPTION: Record<Locale, string> = {
  en: "Notes, projects and a CV.",
  uk: "Нотатки, проєкти та резюме.",
  ja: "ノート、プロジェクト、履歴書。",
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  return {
    description: DESCRIPTION[lang],
    alternates: localeAlternates(lang, "/"),
  }
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()

  return (
    <HomeFrame
      lang={lang}
      files={explorerFiles(lang, "home")}
      below={below(lang)}
      aside={ASIDE}
    />
  )
}
