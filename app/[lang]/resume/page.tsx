import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { EditorPane } from "@/components/site/editor-pane"
import { AUTHOR, JsonLd, absoluteUrl } from "@/components/site/json-ld"
import { LangSwitch } from "@/components/site/lang-switch"
import { ProseHeading, ProseTitle } from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { SplitPane } from "@/components/site/split-pane"
import { Button, buttonVariants } from "@/components/ui/button"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALE_LABEL,
  hasLocale,
  localeAlternates,
} from "@/lib/i18n"
import { PROFILE, displayUrl } from "@/lib/profile"
import {
  EDUCATION,
  HEADLINE,
  JOBS,
  RESUME_PDF,
  RESUME_UPDATED,
  SKILLS,
} from "@/lib/resume"

type Props = PageProps<"/[lang]/resume">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDictionary(lang)
  return {
    title: `${t.resume} | olekshyr.dev`,
    description: `${HEADLINE[lang]}. ${t.resumeDescription}`,
    alternates: localeAlternates(lang, "/resume"),
  }
}

/** A drawn stand-in for the PDF's first page. Paper is light in both themes. */
function PdfPreview() {
  const line = "h-1.5 bg-[#B9C7B0]"
  const heading = "mt-1.5 h-2 w-[30%] bg-[#276B17]"
  return (
    <div
      role="img"
      aria-label="Preview of the first page of resume.pdf"
      className="flex aspect-300/424 w-full max-w-75 flex-col gap-2.5 bg-[#F4F7F1] p-7"
    >
      <div className="h-3.5 w-[60%] bg-[#1D2B20]" />
      <div className="h-2 w-[45%] bg-[#5B6E60]" />
      <div className="my-1.5 h-px bg-[#C9D4C2]" />
      <div className={`${heading} mt-0`} />
      <div className={`${line} w-[95%]`} />
      <div className={`${line} w-[88%]`} />
      <div className={`${line} w-[92%]`} />
      <div className={heading} />
      <div className={`${line} w-[90%]`} />
      <div className={`${line} w-[80%]`} />
      <div className={heading} />
      <div className={`${line} w-[85%]`} />
      <div className={`${line} w-[70%]`} />
    </div>
  )
}

export default async function Resume({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDictionary(lang)
  const { name, surname, email, github, location } = PROFILE

  const row = "flex flex-wrap items-baseline justify-between gap-3"
  const years = "text-label text-syntax-number"

  return (
    <Shell
      lang={lang}
      path="~/resume.md"
      files={explorerFiles(lang, "resume")}
      status={{ branch: "main", type: "markdown", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/resume" />}
    >
      <EditorPane
        tab="resume.md"
        inactiveTabs={["home.tsx"]}
        aside={
          <SplitPane fileName="resume.pdf" caption="resume.pdf">
            <PdfPreview />
          </SplitPane>
        }
      >
        <article className="flex max-w-190 flex-col gap-3">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <ProseTitle className="text-title-lg">
                {name} {surname ?? "[Surname]"}
              </ProseTitle>
              <p className="mt-2 mb-0 font-sans text-body-lg text-secondary">
                {HEADLINE[lang]}
              </p>
            </div>
            {RESUME_PDF ? (
              <Button asChild>
                <a href={RESUME_PDF} download>
                  {t.downloadResume}
                </a>
              </Button>
            ) : (
              // no PDF yet (RESUME_PDF in lib/resume.ts)
              <span
                aria-disabled="true"
                className={buttonVariants({ variant: "disabled" })}
              >
                {t.downloadResume}
              </span>
            )}
          </div>
          <p className="m-0 text-label break-words text-syntax-comment">
            {[
              email ?? "[email]",
              github ? displayUrl(github) : "github.com/[profile]",
              location ?? "[city, country]",
              `${t.updated} ${RESUME_UPDATED ?? "[2026-00-00]"}`,
            ].join(" | ")}
          </p>

          <ProseHeading className="mt-6">{t.experience}</ProseHeading>
          <div className="border-t border-frame">
            {JOBS.map((job) => (
              <section
                key={job.company.en}
                className="flex flex-col gap-2 border-b border-line py-5"
              >
                <div className={row}>
                  <h3 className="m-0 font-mono text-[18px] font-bold">
                    {job.company[lang]}{" "}
                    <span className="font-normal text-syntax-comment">
                      / {job.role[lang]}
                    </span>
                  </h3>
                  <span className={years}>
                    {job.from} - {job.to ?? t.now}
                  </span>
                </div>
                <ul className="m-0 list-disc pl-5 font-sans text-[16px] leading-[1.65] text-secondary">
                  {job.points[lang].map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
                {job.stack.length > 0 && (
                  <div className="text-caption text-syntax-type">
                    {job.stack.join(", ")}
                  </div>
                )}
              </section>
            ))}
          </div>

          <ProseHeading className="mt-6">{t.skills}</ProseHeading>
          <div className="text-code leading-[2]">
            {SKILLS.map(({ key, value }) => (
              <div key={key}>
                <span className="text-syntax-number">{key}</span>:{" "}
                <span className="text-syntax-string">{value[lang]}</span>
              </div>
            ))}
          </div>

          <ProseHeading className="mt-6">{t.education}</ProseHeading>
          {EDUCATION.map((item) => (
            <div
              key={item.text.en}
              className={`${row} font-sans text-[16px] text-secondary`}
            >
              <span>{item.text[lang]}</span>
              <span className={`${years} font-mono`}>
                {item.from} - {item.to}
              </span>
            </div>
          ))}
        </article>
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "ProfilePage",
            "@id": absoluteUrl(lang, "/resume"),
            url: absoluteUrl(lang, "/resume"),
            name: `${t.resume} | olekshyr.dev`,
            inLanguage: HTML_LANG[lang],
            ...(RESUME_UPDATED ? { dateModified: RESUME_UPDATED } : {}),
            mainEntity: {
              ...AUTHOR,
              jobTitle: HEADLINE[lang],
              ...(github ? { sameAs: [github] } : {}),
            },
          }}
        />
      </EditorPane>
    </Shell>
  )
}
