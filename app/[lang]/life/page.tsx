import { notFound, redirect } from "next/navigation"

import { hasLocale, localePath } from "@/lib/i18n"

/** `life/` is a folder, not a page: open its first file. */
export default async function Life({ params }: PageProps<"/[lang]/life">) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  redirect(localePath(lang, "/life/anime"))
}
