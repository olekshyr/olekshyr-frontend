import { sendContact } from "@/lib/api"
import { DEFAULT_LOCALE, hasLocale } from "@/lib/i18n"

/**
 * The contact form's endpoint. Validates the message and hands it to the API
 * (docs/api-requirements-contact.md), so the API key stays on the server.
 */

const MAX = { name: 100, email: 254, message: 5000 }

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "")

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null

  const name = text(body?.name)
  const email = text(body?.email)
  const message = text(body?.message)
  const locale = text(body?.locale)

  const errors: string[] = []
  if (name.length > MAX.name) errors.push("name: too long")
  if (!/^[^\s@]+@[^\s@]+$/.test(email) || email.length > MAX.email)
    errors.push("email: needs a valid address")
  if (!message) errors.push("message: cannot be empty")
  if (message.length > MAX.message) errors.push("message: too long")
  if (errors.length > 0) return Response.json({ errors }, { status: 400 })

  const sent = {
    status: "sent",
    reply_to: email,
    note: "Thanks, I will get back to you.",
  }

  // the hidden field only bots fill: answer as if sent, deliver nothing
  if (text(body?.website)) return Response.json(sent, { status: 201 })

  const delivery = await sendContact(
    { name, email, message },
    hasLocale(locale) ? locale : DEFAULT_LOCALE
  ).catch(() => null)

  if (delivery?.ok) return Response.json(sent, { status: 201 })

  if (delivery?.status === 400) {
    const error = (await delivery.json().catch(() => null)) as {
      details?: { field?: string; message?: string }[]
    } | null
    const details = Array.isArray(error?.details) ? error.details : []
    return Response.json(
      {
        errors:
          details.length > 0
            ? details.map((d) => `${d.field}: ${d.message}`)
            : ["message: rejected"],
      },
      { status: 400 }
    )
  }

  if (delivery?.status === 429) {
    return Response.json(
      { status: "not_sent", note: "Too many messages. Try again later." },
      { status: 429 }
    )
  }

  return Response.json(
    {
      status: "not_sent",
      note: "Delivery is not available right now. Use the email above.",
    },
    { status: 502 }
  )
}
