import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  ContactForm,
  ContactProvider,
  ContactResponse,
} from "@/components/site/contact-form"
import { EditorPane } from "@/components/site/editor-pane"
import { AUTHOR, JsonLd, absoluteUrl } from "@/components/site/json-ld"
import { LangSwitch } from "@/components/site/lang-switch"
import { ProseP, ProseTitle } from "@/components/site/prose"
import { Shell } from "@/components/site/shell"
import { explorerFiles } from "@/components/site/site-files"
import { SplitPane } from "@/components/site/split-pane"
import { getDictionary } from "@/lib/dictionary"
import {
  HTML_LANG,
  LOCALE_LABEL,
  hasLocale,
  localeAlternates,
} from "@/lib/i18n"
import { PROFILE, displayUrl } from "@/lib/profile"

type Props = PageProps<"/[lang]/contact">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = getDictionary(lang)
  return {
    title: `${t.contact} | olekshyr.dev`,
    description: t.contactIntro,
    alternates: localeAlternates(lang, "/contact"),
  }
}

/** `key: value` with the value as a link, or a placeholder while unknown. */
function Detail({
  name,
  href,
  text,
  placeholder,
}: {
  name: string
  href: string | null
  text: string | null
  placeholder: string
}) {
  return (
    <div>
      <span className="text-syntax-number">{name}</span>:{" "}
      {href && text ? (
        <a
          href={href}
          className="text-accent underline underline-offset-5 hover:text-accent-hover"
        >
          {text}
        </a>
      ) : (
        <span className="text-syntax-type">{placeholder}</span>
      )}
    </div>
  )
}

export default async function Contact({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const t = getDictionary(lang)
  const { email, github, linkedin } = PROFILE

  return (
    <Shell
      lang={lang}
      path="~/contact.md"
      files={explorerFiles(lang, "contact")}
      status={{ branch: "main", type: "markdown", locale: LOCALE_LABEL[lang] }}
      langSwitch={<LangSwitch lang={lang} path="/contact" />}
    >
      <ContactProvider>
        <EditorPane
          tab="contact.md"
          aside={
            <SplitPane fileName="response" plain>
              <ContactResponse
                labels={{
                  waiting: t.waiting,
                  fillForm: t.fillForm,
                  sending: t.sending,
                  noResponse: t.noResponse,
                }}
              />
            </SplitPane>
          }
        >
          <div className="flex max-w-170 flex-col gap-5">
            <ProseTitle>{t.contact}</ProseTitle>
            <ProseP>{t.contactIntro}</ProseP>
            <div className="text-[16px] leading-[2.2] break-words">
              <Detail
                name="email"
                href={email && `mailto:${email}`}
                text={email}
                placeholder="[your email]"
              />
              <Detail
                name="github"
                href={github}
                text={github && displayUrl(github)}
                placeholder="github.com/[profile]"
              />
              <Detail
                name="linkedin"
                href={linkedin}
                text={linkedin && displayUrl(linkedin)}
                placeholder="[profile]"
              />
            </div>
            <div className="mt-3 text-label text-syntax-comment">
              {`// ${t.contactFormHint}`}
            </div>
            <ContactForm
              lang={lang}
              labels={{
                replyHint: t.replyHint,
                sendRequest: t.sendRequest,
                sending: t.sending,
                noTracking: t.noTracking,
              }}
            />
          </div>
          <JsonLd
            data={{
              "@context": "https://schema.org",
              "@type": "ContactPage",
              "@id": absoluteUrl(lang, "/contact"),
              url: absoluteUrl(lang, "/contact"),
              name: `${t.contact} | olekshyr.dev`,
              inLanguage: HTML_LANG[lang],
              mainEntity: AUTHOR,
            }}
          />
        </EditorPane>
      </ContactProvider>
    </Shell>
  )
}
