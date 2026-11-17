import { Tok } from "./code-block"
import { Gutter } from "./line-no"

export type FrontmatterEntry = {
  key: string
  value: string
  /** coloured as a link; with `href` it is one */
  link?: boolean
  href?: string
}

/** `key: value` lines between `---` rules, with a gutter line number per line. */
export function Frontmatter({ entries }: { entries: FrontmatterEntry[] }) {
  return (
    <div className="flex gap-6 border-y border-line py-4 text-[16px] leading-[1.9]">
      <Gutter count={entries.length + 2} className="pt-0" />
      <div className="min-w-0">
        <div>
          <Tok c>---</Tok>
        </div>
        {entries.map(({ key, value, link, href }) => (
          <div key={key} className="break-words">
            <Tok n>{key}</Tok>:{" "}
            {href ? (
              <a
                href={href}
                className="text-syntax-type underline underline-offset-5 hover:text-accent"
              >
                {value}
              </a>
            ) : link ? (
              <Tok t>{value}</Tok>
            ) : (
              <Tok s>{value}</Tok>
            )}
          </div>
        ))}
        <div>
          <Tok c>---</Tok>
        </div>
      </div>
    </div>
  )
}
