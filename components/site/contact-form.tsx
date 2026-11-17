"use client"

import {
  createContext,
  useContext,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"

import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import type { Locale } from "@/lib/i18n"
import { cn } from "@/lib/utils"

type Exchange =
  | { state: "idle" }
  | { state: "pending" }
  /** status 0: the request never got an answer */
  | { state: "done"; status: number; body: string }

const ExchangeContext = createContext<{
  exchange: Exchange
  setExchange: (exchange: Exchange) => void
} | null>(null)

function useExchange() {
  const value = useContext(ExchangeContext)
  if (!value) throw new Error("ContactProvider is missing")
  return value
}

/** Shares the request's state between the form and the response pane. */
export function ContactProvider({ children }: { children: ReactNode }) {
  const [exchange, setExchange] = useState<Exchange>({ state: "idle" })
  return (
    <ExchangeContext value={{ exchange, setExchange }}>
      {children}
    </ExchangeContext>
  )
}

export type ContactFormLabels = {
  replyHint: string
  sendRequest: string
  sending: string
  noTracking: string
}

/**
 * The contact form. Validation is the server's: an invalid message comes back
 * as a 400 in the response pane, like any other API call.
 */
export function ContactForm({
  lang,
  labels,
}: {
  lang: Locale
  labels: ContactFormLabels
}) {
  const { exchange, setExchange } = useExchange()
  const pending = exchange.state === "pending"

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return
    const form = event.currentTarget
    const data = Object.fromEntries(new FormData(form))
    setExchange({ state: "pending" })
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale: lang }),
      })
      const body = await res.json().catch(() => null)
      setExchange({
        state: "done",
        status: res.status,
        body: body ? JSON.stringify(body, null, 2) : "",
      })
      if (res.ok) form.reset()
    } catch {
      setExchange({ state: "done", status: 0, body: "" })
    }
  }

  const field = "flex flex-col gap-1.5 text-label"
  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      <div className="text-label text-syntax-comment">
        <span className="text-syntax-keyword">POST</span> /api/contact
      </div>
      <div className={field}>
        <label htmlFor="contact-name" className="text-syntax-number">
          name
        </label>
        <Input
          id="contact-name"
          name="name"
          type="text"
          autoComplete="name"
          maxLength={100}
        />
      </div>
      <div className={field}>
        <label htmlFor="contact-email">
          <span className="text-syntax-number">email</span>{" "}
          <span className="text-syntax-comment">{labels.replyHint}</span>
        </label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          maxLength={254}
        />
      </div>
      <div className={field}>
        <label htmlFor="contact-message" className="text-syntax-number">
          message
        </label>
        <Textarea id="contact-message" name="message" maxLength={5000} />
      </div>
      {/* only bots fill this one */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="contact-website">website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" aria-disabled={pending || undefined}>
          {pending ? labels.sending : labels.sendRequest}
        </Button>
        <span className="text-caption text-syntax-comment">
          {labels.noTracking}
        </span>
      </div>
    </form>
  )
}

const STATUS_TEXT: Record<number, string> = {
  201: "Created",
  400: "Bad Request",
  429: "Too Many Requests",
  502: "Bad Gateway",
}

export type ContactResponseLabels = {
  waiting: string
  fillForm: string
  sending: string
  noResponse: string
}

/** The response pane: status line and JSON body of the last request. */
export function ContactResponse({ labels }: { labels: ContactResponseLabels }) {
  const { exchange } = useExchange()
  const badge =
    "inline-flex min-h-9 items-center self-start border px-3 text-label font-bold"

  let line = labels.waiting
  let body = `// ${labels.fillForm}`
  let tone = "border-dashed border-control text-muted"

  if (exchange.state === "pending") {
    line = `${labels.sending}...`
    body = ""
  } else if (exchange.state === "done") {
    const { status } = exchange
    line =
      status === 0
        ? labels.noResponse
        : [status, STATUS_TEXT[status]].filter(Boolean).join(" ")
    body = exchange.body
    tone =
      status >= 200 && status < 300
        ? "border-accent bg-accent text-on-accent"
        : "border-syntax-number bg-syntax-number text-on-accent"
  }

  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      <div className={cn(badge, tone)}>{line}</div>
      <pre className="m-0 font-mono text-code leading-[1.9] whitespace-pre-wrap text-secondary">
        {body}
      </pre>
    </div>
  )
}
