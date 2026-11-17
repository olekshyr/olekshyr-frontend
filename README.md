# olekshyr-frontend

The frontend of [olekshyr.dev](https://olekshyr.dev): a personal site with a blog, projects, resume, an anime/manga list and a contact form, styled as a code editor. Available in English, Ukrainian and Japanese.

Built with Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS 4 and shadcn/ui (Radix).

## Getting started

Requires Node.js and [pnpm](https://pnpm.io).

```bash
pnpm install
```

### Without the backend

Runs a mock API (MSW, on port 8081) and the dev server against it. MyAnimeList is mocked too, so no env vars are needed.

```bash
pnpm dev:mock
```

### With the backend

The blog and contact form need the [olekshyr.dev API](https://github.com/olekshyr/olekshyr-dev-api) (Spring). Copy `.env.example` to `.env.local` and fill it in:

| Variable | Purpose |
| --- | --- |
| `PUBLIC_API_KEY` | the API's public key (server-side only) |
| `API_URL` | API base URL, defaults to `http://localhost:8080` |
| `MAL_CLIENT_ID` | MyAnimeList client id, for `/life/anime` ([create one](https://myanimelist.net/apiconfig)) |
| `MAL_USERNAME` | the account whose public lists are shown |

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | What it does |
| --- | --- |
| `pnpm dev` | dev server |
| `pnpm dev:mock` | mock API + dev server |
| `pnpm build` | production build (prerenders blog pages, so the API must be reachable) |
| `pnpm build:mock` | production build against the mock API |
| `pnpm start` | serve the production build |
| `pnpm mock:api` | mock API only |
| `pnpm lint` | ESLint |

## Project layout

- `app/[lang]/` — every page, one per locale. `proxy.ts` serves English without a URL prefix (`/blog`) and the other locales prefixed (`/uk/blog`, `/ja/blog`).
- `app/api/contact/` — the contact form endpoint, which forwards messages to the API.
- `components/site/` — site components; `components/ui/` — shadcn primitives.
- `lib/` — API and MyAnimeList clients, i18n and UI strings, static content (projects, resume, profile).
- `mocks/` — the mock API.
- `docs/` — API requirements the backend does not implement yet. The mock implements them exactly.
