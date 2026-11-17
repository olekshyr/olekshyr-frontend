# API requirements: contact form

The contact page (`/contact`) has a form. The browser posts it to the site's own
route handler (`POST /api/contact`), which validates it and hands it to the API
from the server, with the API key, like every other call. The API delivers it
to the inbox. The site has no mail credentials of its own.

`mocks/handlers.mjs` implements this contract; `pnpm dev:mock` serves it.

## C1. `POST /api/v1/contact` (must)

Request, with the usual `X-API-Key` header:

```json
{
  "name": "Ada",
  "email": "ada@example.com",
  "message": "Hello",
  "locale": "en"
}
```

| Field     | Rules                                               |
| --------- | --------------------------------------------------- |
| `name`    | optional, at most 100 characters                    |
| `email`   | required, a valid address, at most 254 characters   |
| `message` | required, not blank, at most 5000 characters        |
| `locale`  | `en`, `uk` or `ja`: the language the form was in    |

Responses:

| Status | When                          | Body                                                    |
| ------ | ----------------------------- | ------------------------------------------------------- |
| `202`  | accepted for delivery         | none                                                    |
| `400`  | validation failed             | the standard error body, `details: [{field, message}]`  |
| `429`  | too many messages             | the standard error body                                 |

The site already validates the same rules, so a `400` from the API is only a
safety net.

## C2. Delivery (must)

- Send the message to the owner's inbox, with `Reply-To` set to `email`.
- Treat `name`, `email` and `message` as plain text: no HTML, and no header
  injection through `name` or `email` (reject line breaks in both).

## C3. Abuse limits (should)

- Rate limit. The site forwards the visitor's address in `X-Forwarded-For`
  only if you want it; say so and I will add it. Otherwise limit globally.
- The site drops submissions that fill its hidden honeypot field; they never
  reach the API.

## What the site does with the answer

| API answers          | The form shows                |
| -------------------- | ----------------------------- |
| `2xx`                | `201 Created`, "sent"         |
| `400`                | `400 Bad Request` and errors  |
| `429`                | `429 Too Many Requests`       |
| anything else, or no answer | `502 Bad Gateway`      |

Until the endpoint exists the form answers `502`.

## Open questions

1. Is the public key enough for a write endpoint, or should this use a
   separate key?
2. Should messages also be stored (a table), or only mailed?
