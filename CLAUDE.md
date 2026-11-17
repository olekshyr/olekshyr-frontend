# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 (App Router, Cache Components, Turbopack) + React 19 + Tailwind 4 personal site for olekshyr.dev. Uses many APIs newer than training data (`proxy.ts` instead of middleware, `"use cache"`, `export const instant`, `ensureStatic`, global `PageProps<"/route">` / `LayoutProps` types). Check `node_modules/next/dist/docs/` before relying on memory.

This is a public repository: everything committed, including `docs/`, `mocks/` and the content in `lib/profile.ts`, is published. Keep keys in `.env.local` (git-ignored); `.env.example` only lists names.

## Commands

Package manager is pnpm.

- `pnpm dev` — dev server; needs a running API (`API_URL`, default `http://localhost:8080`) and `PUBLIC_API_KEY` in `.env.local` (see `.env.example`).
- `pnpm dev:mock` — starts the MSW-backed mock API on :8081 (`MOCK_API_PORT`) and runs `next dev` against it, with MyAnimeList mocked too. Use this when no backend is running.
- `pnpm build:mock` — `next build` against the mock API (the build prerenders blog pages, so it needs an API).
- `pnpm mock:api` — mock API alone.
- `pnpm lint` — ESLint (flat config, `eslint-config-next`).
- Type check: `pnpm exec tsc --noEmit`.

There is no test suite.

## Architecture

**Locale routing.** Every page lives under `app/[lang]` (locales `en`, `uk`, `ja` in `lib/i18n.ts`). `proxy.ts` rewrites unprefixed URLs to `/en/...` and 308-redirects `/en/...` back to unprefixed, so English has no URL segment. Build links with `localePath(lang, path)` and metadata alternates with `localeAlternates`; never hardcode `/en`. `app/[lang]/layout.tsx` is the root layout (sets `<html lang>`). `app/[lang]/[...rest]` exists only so unknown URLs get `not-found.tsx` inside the locale layout. UI strings are in `lib/dictionary.ts` (`getDictionary(locale)`); the `uk`/`ja` objects are typed against `en`, so add every key to all three.

**Data sources.**
- `lib/api.ts` — server-only client for the separate Spring API ([olekshyr-dev-api](https://github.com/olekshyr/olekshyr-dev-api)). Sends the key header and `Accept-Language`; functions use `"use cache"` + `cacheLife("minutes")` + `cacheTag(POSTS_TAG)`. Post bodies come back as sanitized HTML; `lib/post-body.ts` adds h2 ids/outline.
- `lib/mal.ts` — server-only MyAnimeList v2 client for `/life/anime` (`MAL_CLIENT_ID`, `MAL_USERNAME`, overridable `MAL_API_URL`), cache tag `ANIME_TAG`.
- `lib/projects.ts`, `lib/resume.ts`, `lib/profile.ts` — static content, no API. `null`/empty values render as bracketed placeholders.
- `app/api/contact/route.ts` — the contact form posts here; it validates and forwards to the API's `/api/v1/contact` server-side.

**API contracts not yet implemented by the backend** are specified in `docs/api-requirements-*.md`, and `mocks/handlers.mjs` implements them exactly. Change the doc first, then the mock, then the client. Fields added by those docs are optional in `lib/api.ts` types, and missing endpoints degrade gracefully (e.g. `getTags` returns `[]` on 404).

**Blog list URLs.** `lib/blog-view.ts` defines one canonical URL per view: `/blog[/tag/{tag}][/sort/oldest][/page/{n}]`. Defaults are never written; `parseBlogView` returns `null` (→ 404) for non-canonical forms. Build links with `blogViewPath`.

**Rendering pattern for URL-dependent pages.** Routes whose validity depends on the URL (`blog/[...view]`, `blog/[slug]`, `projects/[slug]`, the catch-all) set `export const instant = false` and `ensureStatic = "navigation"` so they render in one piece and can return a real 404 instead of a streamed 200 shell. Cache Components requires `generateStaticParams` to return at least one entry, hence placeholder entries.

**UI.** The site is styled as a code editor: `components/site/shell.tsx` (top bar, file explorer, status bar with breadcrumbs), with pages mapped to fake files via `components/site/site-files.ts` (explorer list) and `lib/site-paths.ts` (`fileOf`, plus `closestPath` for 404 suggestions). `components/ui/` are shadcn (new-york, Radix) primitives; `components/site/` are site components.

**Styling.** Tailwind 4 configured in CSS only (`app/globals.css`, no tailwind config file; loaded via the `@tailwindcss/turbopack` loader in `next.config.ts`). Design tokens are `--ol-*` variables exposed as Tailwind colors (`accent`, `line`, `raised`, `syntax-*`, etc.) — use those rather than raw colors; shadcn's `secondary`/`muted` colors are intentionally not exposed. Theme (`system`/`dark`/`light`) is set as `data-theme` on `<html>` by an inline head script (`lib/theme.ts`) before paint; dark is the default.
