import Link from "next/link"

/** A `-> file  note` row of the 404 page's suggestions. */
export function SuggestionRow({
  href,
  file,
  note,
}: {
  href: string
  file: string
  note: string
}) {
  return (
    <Link
      href={href}
      className="flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-3 py-2 text-[16px] text-foreground no-underline hover:bg-hover"
    >
      <span aria-hidden="true" className="text-syntax-keyword">
        -&gt;
      </span>
      <span className="min-w-0 break-words">{file}</span>
      <span className="ml-auto text-caption text-syntax-comment">{note}</span>
    </Link>
  )
}
