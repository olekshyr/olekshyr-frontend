# API requirements: paginated blog list

What the Next.js site needs from `olekshyr-dev-api` to paginate the blog list.
Written against the API as of commit `b62c858` (grouped OpenAPI specs, Phase 6).

## Why the API has to change

Today the site fetches every post in all three locales and does everything in
the browser: tag filter, sort, and the dimmed "not translated" rows. That only
works while one request can hold the whole blog. Once the list is split into
pages, each of those has to be answered by the API, because the site only ever
holds one page.

| The site needs to | Today | Blocked by |
| --- | --- | --- |
| Show page N of the list | works (`page`, `size`) | nothing |
| Filter the list by tag | filters the full list in the browser | no `tag` parameter |
| Sort oldest first | reverses the full list in the browser | `sort` is ignored |
| Show posts that are not translated into the current locale | merges three full lists | the list only returns posts visible in the locale |
| Show the tag filter chips | collects tags from the full list | no tag list endpoint |
| Link to the previous and next post | finds neighbours in the full list | detail has no neighbours |

## Summary

| # | Requirement | Priority |
| --- | --- | --- |
| R1 | `tag` filter on `GET /api/v1/posts` | must |
| R2 | `sort` on `GET /api/v1/posts` | must |
| R3 | `include=untranslated` on `GET /api/v1/posts`, plus `translated`, `locale` and `availableLocales` on each item | must (see R3 for the fallback) |
| R4 | `GET /api/v1/tags` | must |
| R5 | `previous` and `next` on `GET /api/v1/posts/{slug}` | should |
| R6 | Paging, validation and caching rules for the above | must |

Nothing existing changes shape. Every addition is a new optional parameter, a
new field, or a new endpoint, so the current site keeps working while this is
built.

Conventions that stay as they are: the `X-API-Key` header, the locale from
`Accept-Language` (`en`, `uk`, `ja`; default `en`), the `PageResponse` envelope
(`content` + `page { number, size, totalElements, totalPages }`), zero-based
`page`, default `size` 10 and maximum 50, and the `ApiErrorResponse` envelope.

## R1. Filter by tag

```
GET /api/v1/posts?tag={tagSlug}
```

- `tag` is one tag slug, matched exactly (the stable slug, not the localized
  name).
- Returns only posts that carry that tag. All other rules of the list apply
  unchanged.
- `page.totalElements` and `page.totalPages` count the filtered list.
- A slug that matches no tag, or a tag with no post in the list, returns `200`
  with an empty `content` and `totalElements: 0`. It is not an error. The site
  decides whether a tag exists from R4.
- One tag is enough. The site never combines tags.

## R2. Sort

```
GET /api/v1/posts?sort=publishedAt,desc
GET /api/v1/posts?sort=publishedAt,asc
```

- Two accepted values. `publishedAt,desc` is the default and is today's order.
- Ties are broken by `slug` ascending, so the order is stable across pages. A
  post must never appear on two pages or be skipped because of a tie.
- Any other value returns `400 VALIDATION_FAILED`. Today a `sort` parameter is
  silently ignored; a silent ignore would make the site show the wrong order
  without anyone noticing.

If the Spring `property,direction` form is awkward to whitelist, `order=newest`
and `order=oldest` is equally fine. Tell me which and I will switch the client;
it is one line.

## R3. Include posts that are not translated into the locale

The design lists every post in every locale. A post with no translation in the
current locale is shown dimmed, reads "Not translated into UA yet.", and is not
a link. The site must not silently fall back to another language, but it does
need to know the post exists.

```
GET /api/v1/posts?include=untranslated
```

- Without the parameter the list is exactly as today: only posts with a
  published translation in the resolved locale.
- With `include=untranslated` the list holds every post that is visible in at
  least one locale. Drafts and deleted posts still never appear.
- Because the set no longer depends on the locale, `totalElements` and
  `totalPages` are the same in `en`, `uk` and `ja`. The site relies on this:
  page 3 in English and page 3 in Ukrainian are the same posts, so they can be
  linked as translations of each other.
- `tag` (R1) and `sort` (R2) apply to this list too.

Three new fields on every item of `PostSummaryResponse`, with or without the
parameter:

| Field | Type | Meaning |
| --- | --- | --- |
| `translated` | boolean | `true` when the item is published in the resolved locale. Always `true` without `include=untranslated`. |
| `locale` | `en` \| `uk` \| `ja` | The locale that `title`, `excerpt`, `publishedAt`, `readTimeMinutes` and the tag names of this item are in. Equals the resolved locale when `translated` is `true`. |
| `availableLocales` | array of locales | Every locale the post is visible in, in `en, uk, ja` order. Same meaning as on the detail response. |

For an untranslated item (`translated: false`):

- `title`, `excerpt`, `publishedAt` and `readTimeMinutes` come from the first
  locale in `en, uk, ja` order that the post is visible in, and `locale` names
  it. The site shows the title and date, and replaces the excerpt with its own
  "not translated" text.
- Tag names follow the existing rule (name in the resolved locale, the slug
  when it has none).

Sorting uses the `publishedAt` that is returned for the item.

**Fallback if this is not wanted in the API.** Drop `include=untranslated` and
the `translated` and `locale` fields, keep `availableLocales`. The site then
lists only translated posts, the dimmed rows disappear, and page counts differ
between locales. That is a design change, so say so before building it.

## R4. List the tags

The filter chips need every tag that would return at least one post, with its
name in the locale. A page of ten posts cannot provide that.

```
GET /api/v1/tags
GET /api/v1/tags?include=untranslated
```

Response: a plain JSON array, not paged (the tag set is small).

```json
[
  { "slug": "java", "name": "Java", "color": "#3366ff", "postCount": 7 },
  { "slug": "site", "name": "Site", "color": null, "postCount": 2 }
]
```

- `slug`, `name`, `color`: exactly as `TagResponse` today.
- `postCount`: the number of posts `GET /api/v1/posts?tag={slug}` would return
  with the same `include` value and locale. This must agree with R1, because
  the site computes the number of pages for a tag view from it only indirectly
  (it trusts `page.totalPages`), but shows a chip only for tags listed here.
- Tags with `postCount` 0 are left out.
- Sorted by `slug`, as tags are everywhere else.

## R5. Previous and next post

Two new nullable fields on `PostDetailResponse`:

```json
{
  "previous": { "slug": "hello-world", "title": "Hello world" },
  "next": null
}
```

- Neighbours among the posts published in the resolved locale, ordered by
  `publishedAt` then `slug` (the R2 order). `previous` is the older post,
  `next` the newer one.
- `null` at either end.
- `title` in the resolved locale.

Priority is "should": until it exists the post page shows only an "all posts"
link. The site will not page through the whole list to find neighbours.

## R6. Rules that apply to all of the above

**Paging**

- A `page` past the last one keeps returning `200` with empty `content`, as
  today. The site turns that into its own 404.
- `page.totalElements` and `page.totalPages` always describe the filtered list.
- The site requests `size=10` for the list and `size=3` for the home page. The
  sitemap still walks the unfiltered list with `size=50`.

**Validation**

- An unknown `sort` or `include` value returns `400 VALIDATION_FAILED`, with the
  parameter named in `details`.
- `tag` is never a validation error (see R1).

**Caching** (ADR-002)

- `tag`, `sort`, `include`, `page`, `size` and the locale are all part of the
  cache key for the list. The tag list is keyed by `include` and locale.
- Everything here is evicted by the same events that evict the public post
  reads today (publish, unpublish, edit, delete, tag changes). `previous` and
  `next` on a cached detail must not go stale when a neighbouring post is
  published or removed.

**Documentation**

- The new parameters, fields and the tag endpoint appear in the public OpenAPI
  group, with the error cases above.

## Examples

Page 2 of the Ukrainian list, including untranslated posts:

```
GET /api/v1/posts?include=untranslated&page=1&size=10
Accept-Language: uk
```

```json
{
  "content": [
    {
      "slug": "hello-world",
      "title": "Привіт, світе",
      "excerpt": "Перший допис.",
      "tags": [{ "slug": "java", "name": "Java", "color": "#3366ff" }],
      "publishedAt": "2026-01-12T09:00:00Z",
      "readTimeMinutes": 1,
      "translated": true,
      "locale": "uk",
      "availableLocales": ["en", "uk"]
    },
    {
      "slug": "second-post",
      "title": "Second post",
      "excerpt": "English excerpt.",
      "tags": [],
      "publishedAt": "2026-01-10T09:00:00Z",
      "readTimeMinutes": 2,
      "translated": false,
      "locale": "en",
      "availableLocales": ["en"]
    }
  ],
  "page": { "number": 1, "size": 10, "totalElements": 27, "totalPages": 3 }
}
```

Oldest first, one tag:

```
GET /api/v1/posts?include=untranslated&tag=java&sort=publishedAt,asc
```

## How the site uses it

Site URL to API call, so the contract can be checked end to end. `{l}` is the
locale prefix (none for English).

| Site URL | API call |
| --- | --- |
| `{l}/blog` | `GET /posts?include=untranslated&page=0&size=10` |
| `{l}/blog/page/3` | `GET /posts?include=untranslated&page=2&size=10` |
| `{l}/blog/tag/java` | `GET /posts?include=untranslated&tag=java&page=0&size=10` |
| `{l}/blog/sort/oldest/page/2` | `GET /posts?include=untranslated&sort=publishedAt,asc&page=1&size=10` |
| every list page | `GET /tags?include=untranslated` |
| `{l}/blog/{slug}` | `GET /posts/{slug}` (reads `previous`, `next`) |
| `/sitemap.xml` | `GET /posts?page=N&size=50` per locale, as today |

Until the API has this, the site runs against a mock that implements exactly
this document (`pnpm dev:mock`, handlers in `mocks/handlers.ts`). If the real
API has to differ from the document, change the document first; the mock and
the client follow it.

## Open questions

1. R2: `sort=publishedAt,asc` or `order=oldest`?
2. R3: is listing untranslated posts acceptable in the public API, or should
   the site take the fallback and drop the dimmed rows?
3. R5: fine to add neighbours to the detail response, or would you rather a
   separate `GET /posts/{slug}/neighbours`?
