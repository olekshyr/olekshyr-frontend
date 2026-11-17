import type { Metadata } from "next"
import { notFound } from "next/navigation"

import {
  BlogListPage,
  blogListMetadata,
} from "@/components/site/blog-list-page"
import { DEFAULT_VIEW } from "@/lib/blog-view"
import { hasLocale } from "@/lib/i18n"

type Props = PageProps<"/[lang]/blog">

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params
  return hasLocale(lang) ? blogListMetadata(lang, DEFAULT_VIEW) : {}
}

/** The first page of the blog list. Other views: `[...view]/page.tsx`. */
export default async function BlogIndex({ params }: Props) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  return <BlogListPage lang={lang} view={DEFAULT_VIEW} />
}
