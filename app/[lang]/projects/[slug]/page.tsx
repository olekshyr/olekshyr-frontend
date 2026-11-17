import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Fragment, type ReactNode } from "react"

import { EditorPane } from "@/components/site/editor-pane"
import { Frontmatter } from "@/components/site/frontmatter"
import { AUTHOR, JsonLd, absoluteUrl } from "@/components/site/json-ld"
import { LangSwitch } from "@/components/site/lang-switch"
import { LineNo } from "@/components/site/line-no"
import {
  ProseHeading,
  ProseP,
  ProseTitle,
} from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { SplitPane } from "@/components/site/split-pane"
import { getPost } from "@/lib/api"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALE_LABEL,
  hasLocale,
  localeAlternates,
  localePath,
} from "@/lib/i18n"
import { displayUrl } from "@/lib/profile"
import {
  PROJECTS,
  getProject,
  projectNeighbours,
  type ProjectPreview,
} from "@/lib/projects"
import { cn } from "@/lib/utils"

type Props = PageProps<"/[lang]/projects/[slug]">

/** An unknown slug answers 404 instead of a 200 shell. */
export const ensureStatic = "navigation"

export function generateStaticParams() {
  return PROJECTS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params
  const project = getProject(slug)
  if (!hasLocale(lang) || !project) return {}
  return {
    title: `${project.slug} | olekshyr.dev`,
    description: project.about[lang],
    alternates: localeAlternates(lang, `/projects/${slug}`),
  }
}

/** One block of the document with the line number it starts on. */
function Numbered({ n, children }: { n: number; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-6">
      <LineNo n={n} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

export default async function ProjectPage({ params }: Props) {
  const { lang, slug } = await params
  const project = getProject(slug)
  if (!hasLocale(lang) || !project) notFound()

  const t = getDictionary(lang)
  const { previous, next } = projectNeighbours(slug)
  const built = project.built?.[lang] ?? [
    "[Key technical decision one]",
    "[Key technical decision two]",
  ]

  // posts that exist in this language; the others are left out
  const posts = (
    await Promise.all(
      project.posts.map(async (post) => {
        const result = await getPost(post, lang)
        return result.status === "ok" ? result.post : null
      })
    )
  ).filter((post) => post !== null)

  const entries = [
    { key: "name", value: project.slug },
    { key: "status", value: project.status ?? "[status]" },
    {
      key: "stack",
      value: project.stack.length > 0 ? project.stack.join(", ") : "[stack]",
    },
    {
      key: "repo",
      value: project.repo ? displayUrl(project.repo) : "[github link]",
      href: project.repo ?? undefined,
      link: true,
    },
    // a demo, a download, or both; a placeholder only when there is neither
    ...(project.demo || !project.download
      ? [
          {
            key: "demo",
            value: project.demo ? displayUrl(project.demo) : "[live link]",
            href: project.demo ?? undefined,
            link: true,
          },
        ]
      : []),
    ...(project.download
      ? [
          {
            key: "download",
            value: displayUrl(project.download),
            href: project.download,
            link: true,
          },
        ]
      : []),
  ]
  // the frontmatter takes a line per entry plus its two rules
  let line = entries.length + 2
  const link = "text-secondary no-underline hover:text-accent"

  return (
    <Shell
      lang={lang}
      path={`~/projects/${slug}.md`}
      files={explorerFiles(lang, `project:${slug}`)}
      status={{ branch: "main", type: "markdown", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path={`/projects/${slug}`} />}
    >
      <EditorPane
        tab={`${slug}.md`}
        inactiveTabs={["index.tsx"]}
        aside={
          <SplitPane
            fileName={project.preview.file}
            caption={project.preview.file}
          >
            <Preview preview={project.preview} />
          </SplitPane>
        }
      >
        <article className="flex flex-col gap-4.5">
          <Frontmatter entries={entries} />
          <Numbered n={++line}>
            <ProseTitle>{project.slug}</ProseTitle>
          </Numbered>
          <Numbered n={++line}>
            <ProseP className="max-w-160">{project.about[lang]}</ProseP>
          </Numbered>
          <Numbered n={++line}>
            <ProseHeading className="mt-0">{t.whatItDoes}</ProseHeading>
          </Numbered>
          <Numbered n={++line}>
            <ProseP className="max-w-160">
              {project.what?.[lang] ??
                "[A short description of what this project does appears here.]"}
            </ProseP>
          </Numbered>
          <Numbered n={++line}>
            <ProseHeading className="mt-0">{t.howBuilt}</ProseHeading>
          </Numbered>
          <Numbered n={++line}>
            <ul className="m-0 flex max-w-160 list-none flex-col gap-1.5 p-0 font-sans text-body-lg text-secondary">
              {built.map((item) => (
                <li key={item}>
                  <span
                    aria-hidden="true"
                    className="font-mono text-syntax-keyword"
                  >
                    -{" "}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Numbered>
          <Numbered n={++line}>
            <ProseHeading className="mt-0">{t.learned}</ProseHeading>
          </Numbered>
          <Numbered n={++line}>
            <ProseP className="max-w-160">
              {project.learned?.[lang] ??
                "[A few honest lines about what went well and what you would change.]"}
            </ProseP>
          </Numbered>
          {posts.length > 0 && (
            <>
              <Numbered n={++line}>
                <ProseHeading className="mt-0">{t.relatedPosts}</ProseHeading>
              </Numbered>
              <Numbered n={++line}>
                <div className="flex max-w-160 flex-col border-t border-frame">
                  {posts.map((post) => (
                    <Link
                      key={post.slug}
                      href={localePath(lang, `/blog/${post.slug}`)}
                      className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-2 py-2 text-foreground no-underline hover:bg-hover"
                    >
                      <time
                        dateTime={post.publishedAt}
                        className="w-30 flex-none text-label text-muted"
                      >
                        {post.publishedAt.slice(0, 10)}
                      </time>
                      <span className="min-w-0 flex-[1_1_10rem] font-sans text-body-lg">
                        {post.title}
                      </span>
                      <span aria-hidden="true" className="text-accent">
                        -&gt;
                      </span>
                    </Link>
                  ))}
                </div>
              </Numbered>
            </>
          )}
          <nav className="mt-8 ml-13 flex max-w-175 flex-wrap justify-between gap-4 border-t border-line pt-5 text-label">
            <Link
              href={localePath(lang, `/projects/${previous.slug}`)}
              className={cn("inline-flex min-h-11 items-center", link)}
            >
              &lt; {previous.slug}
            </Link>
            <Link
              href={localePath(lang, `/projects/${next.slug}`)}
              className={cn("inline-flex min-h-11 items-center", link)}
            >
              {next.slug} &gt;
            </Link>
          </nav>
        </article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "SoftwareSourceCode",
            "@id": absoluteUrl(lang, `/projects/${slug}`),
            url: absoluteUrl(lang, `/projects/${slug}`),
            name: project.slug,
            description: project.about[lang],
            inLanguage: HTML_LANG[lang],
            author: AUTHOR,
            ...(project.stack.length > 0
              ? { keywords: project.stack.join(", ") }
              : {}),
            ...(project.repo ? { codeRepository: project.repo } : {}),
          }}
        />
      </EditorPane>
    </Shell>
  )
}

/** The split pane's content: a screenshot, its placeholder, or a diagram. */
function Preview({ preview }: { preview: ProjectPreview }) {
  if (preview.kind === "shot") {
    return preview.src ? (
      <Image
        src={preview.src}
        alt={preview.caption}
        width={1600}
        height={1000}
        sizes="(min-width: 1024px) 30vw, 100vw"
        className="block h-auto w-full border border-frame"
      />
    ) : (
      <div className="flex aspect-16/10 w-full items-center justify-center border border-control bg-selected p-6 text-center text-label text-muted">
        {preview.caption}
      </div>
    )
  }

  const box = "w-full border bg-selected px-4.5 py-3.5 text-center"
  return (
    <div
      role="img"
      aria-label={preview.nodes.map((node) => node.label).join(" -> ")}
      className="flex w-full flex-col items-center text-label"
    >
      {preview.nodes.map((node, i) => (
        <Fragment key={node.label}>
          <div
            className={cn(
              box,
              node.accent ? "border-accent text-accent" : "border-control"
            )}
          >
            {node.label}
          </div>
          {i < preview.nodes.length - 1 && (
            <div className="text-center leading-[1.6] text-syntax-comment">
              <span className="relative">
                |
                {node.note && (
                  <span className="absolute left-full ml-2 whitespace-nowrap">
                    {node.note}
                  </span>
                )}
              </span>
              <br />v
            </div>
          )}
        </Fragment>
      ))}
    </div>
  )
}
