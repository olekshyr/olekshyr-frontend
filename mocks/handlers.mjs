// MSW handlers for the parts of the API that do not exist yet. They implement
// docs/api-requirements-blog-pagination.md exactly; change the doc first.
import { http, HttpResponse } from "msw"

const LOCALES = ["en", "uk", "ja"]

const TAGS = {
  java: { en: "Java", uk: "Java", ja: "Java", color: "#3366ff" },
  react: { en: "React", uk: "React", ja: "React", color: null },
  site: { en: "Site", uk: "Сайт", ja: "サイト", color: null },
  japanese: { en: "Japanese", uk: "Японська", ja: "日本語", color: "#cc3344" },
}
const TAG_SLUGS = Object.keys(TAGS)

const TOPICS = [
  ["Records in practice", "Записи на практиці", "レコードの実践"],
  [
    "Server components, slowly",
    "Серверні компоненти, повільно",
    "サーバーコンポーネント入門",
  ],
  ["How this site is built", "Як збудовано цей сайт", "このサイトの作り方"],
  [
    "Reading kanji with spaced repetition",
    "Кандзі та інтервальні повторення",
    "間隔反復で漢字を読む",
  ],
  [
    "Caching public reads",
    "Кешування публічних читань",
    "公開読み取りのキャッシュ",
  ],
  [
    "Forms without a library",
    "Форми без бібліотеки",
    "ライブラリなしのフォーム",
  ],
  [
    "A design system in tokens",
    "Дизайн-система в токенах",
    "トークンで作るデザインシステム",
  ],
  ["Particles I keep mixing up", "Частки, які я плутаю", "間違えやすい助詞"],
  [
    "Testing against a real database",
    "Тести зі справжньою базою",
    "本物のデータベースでテスト",
  ],
]

/** 27 posts, newest first; which locales each has cycles 3, 2, 1. */
const POSTS = Array.from({ length: 27 }, (_, i) => {
  const topic = TOPICS[i % TOPICS.length]
  const part = Math.floor(i / TOPICS.length) + 1
  const locales =
    i === 4 ? ["ja"] : i === 9 ? ["uk"] : LOCALES.slice(0, 3 - (i % 3))
  const date = new Date(Date.UTC(2026, 9, 28 - i * 3, 9))
  return {
    slug: `post-${String(27 - i).padStart(2, "0")}`,
    publishedAt: date.toISOString().replace(".000Z", "Z"),
    tags: [...new Set([TAG_SLUGS[i % 4], ...(i % 5 === 0 ? ["site"] : [])])],
    titles: Object.fromEntries(
      LOCALES.map((l, n) => [l, `${topic[n]}${part > 1 ? ` (${part})` : ""}`])
    ),
    locales,
  }
})

const EXCERPT = {
  en: "A short note on what worked and what did not.",
  uk: "Коротка нотатка про те, що спрацювало, а що ні.",
  ja: "うまくいったこと、いかなかったことの短いメモ。",
}

const BODY = {
  en: [
    '<p>This is mock content served by the MSW mock API. It has <a href="https://example.com">a link</a> and <code>inline code</code>.</p>',
    "<h2>What I tried</h2><p>The first approach was the obvious one.</p>",
    "<pre><code>Post get(String slug) {\n  return posts.find(slug);\n}</code></pre>",
    "<h2>What worked</h2><ul><li>Keeping it small.</li><li>Measuring first.</li></ul>",
    "<h2>Conclusion</h2><p>It depends, but less than you would think.</p>",
  ].join(""),
  uk: "<p>Це тестовий вміст із макета API.</p><h2>Що я пробував</h2><p>Перший підхід був очевидним.</p><h2>Висновок</h2><p>Залежить, але менше, ніж здається.</p>",
  ja: "<p>これはモックAPIのテスト用コンテンツです。</p><h2>試したこと</h2><p>最初の方法は当たり前のものでした。</p><h2>まとめ</h2><p>場合によりますが、思ったほどではありません。</p>",
}

const localeOf = (request) => {
  const header = (request.headers.get("accept-language") ?? "").slice(0, 2)
  return LOCALES.includes(header) ? header : "en"
}

const tagsOf = (post, locale) =>
  [...post.tags]
    .sort()
    .map((slug) => ({ slug, name: TAGS[slug][locale], color: TAGS[slug].color }))

function summary(post, locale) {
  const translated = post.locales.includes(locale)
  const shown = translated ? locale : post.locales[0]
  return {
    slug: post.slug,
    title: post.titles[shown],
    excerpt: EXCERPT[shown],
    tags: tagsOf(post, locale),
    publishedAt: post.publishedAt,
    readTimeMinutes: 3,
    translated,
    locale: shown,
    availableLocales: post.locales,
  }
}

const error = (status, code, message, request, details) =>
  HttpResponse.json(
    {
      code,
      message,
      timestamp: new Date().toISOString(),
      path: new URL(request.url).pathname,
      ...(details ? { details } : {}),
    },
    { status }
  )

/** Wraps a resolver: the mock accepts any non-empty key. */
const keyed = (resolver) => (info) =>
  info.request.headers.get("x-api-key")
    ? resolver(info)
    : new HttpResponse(null, { status: 401 })

const visible = (locale, include) =>
  POSTS.filter(
    (post) => include === "untranslated" || post.locales.includes(locale)
  )

function checkInclude(request) {
  const include = new URL(request.url).searchParams.get("include")
  if (include === null || include === "untranslated") return { include }
  return {
    invalid: error(400, "VALIDATION_FAILED", "Unknown include value", request, [
      { field: "include", code: "INVALID" },
    ]),
  }
}

/** MyAnimeList fixtures: [title, list status, score, English title, Japanese title]. */
const MAL = {
  anime: [
    ["Super no Ura de Yani Suu Futari", "watching", 0, "Smoking Behind the Supermarket with You", "スーパーの裏でヤニ吸うふたり"],
    ["Sousou no Frieren", "completed", 10, "Frieren: Beyond Journey's End", "葬送のフリーレン"],
    ["Mushishi", "completed", 9, "", "蟲師"],
    ["Planned Show", "plan_to_watch", 0, "", ""],
    ["Paused Show", "on_hold", 6, "", ""],
    ["Dropped Show", "dropped", 3, "", ""],
  ],
  manga: [
    ["Hajime no Ippo", "reading", 9, "", "はじめの一歩"],
    ["Vagabond", "completed", 10, "", "バガボンド"],
    ["Planned Manga", "plan_to_read", 0, "", ""],
  ],
}

const malList = (kind) =>
  http.get(`*/v2/users/:user/${kind}list`, ({ request, params }) => {
    if (!request.headers.get("x-mal-client-id"))
      return HttpResponse.json({ error: "invalid_client" }, { status: 400 })
    if (params.user !== "mock-user")
      return HttpResponse.json({ error: "not_found" }, { status: 404 })
    const url = new URL(request.url)
    const offset = Number(url.searchParams.get("offset") ?? 0)
    // two per page, so the client's paging is exercised
    const size = 2
    const all = MAL[kind].map(([title, status, score, en, ja], i) => ({
      node: {
        id: (kind === "anime" ? 100 : 200) + i,
        title,
        alternative_titles: { synonyms: [], en, ja },
      },
      list_status: {
        status,
        score,
        updated_at: new Date(Date.UTC(2026, 10, 15 - i, kind === "anime" ? 12 : 6)).toISOString(),
      },
    }))
    const next = new URL(url)
    next.searchParams.set("offset", String(offset + size))
    return HttpResponse.json({
      data: all.slice(offset, offset + size),
      paging: offset + size < all.length ? { next: next.href } : {},
    })
  })

export const handlers = [
  malList("anime"),
  malList("manga"),
  http.get(
    "*/api/v1/posts",
    keyed(({ request }) => {
      const params = new URL(request.url).searchParams
      const locale = localeOf(request)
      const { include, invalid } = checkInclude(request)
      if (invalid) return invalid

      const sort = params.get("sort") ?? "publishedAt,desc"
      if (sort !== "publishedAt,desc" && sort !== "publishedAt,asc") {
        return error(400, "VALIDATION_FAILED", "Unknown sort value", request, [
          { field: "sort", code: "INVALID" },
        ])
      }

      const tag = params.get("tag")
      const direction = sort.endsWith("asc") ? 1 : -1
      const list = visible(locale, include)
        .filter((post) => !tag || post.tags.includes(tag))
        .sort(
          (a, b) =>
            direction * a.publishedAt.localeCompare(b.publishedAt) ||
            a.slug.localeCompare(b.slug)
        )

      const number = Math.max(0, Number(params.get("page") ?? 0) || 0)
      const size = Math.min(
        50,
        Math.max(1, Number(params.get("size") ?? 10) || 10)
      )
      return HttpResponse.json({
        content: list
          .slice(number * size, (number + 1) * size)
          .map((post) => summary(post, locale)),
        page: {
          number,
          size,
          totalElements: list.length,
          totalPages: Math.ceil(list.length / size),
        },
      })
    })
  ),

  http.get(
    "*/api/v1/posts/:slug",
    keyed(({ request, params }) => {
      const locale = localeOf(request)
      const post = POSTS.find((p) => p.slug === params.slug)
      if (!post) return error(404, "NOT_FOUND", "Post not found", request)
      if (!post.locales.includes(locale)) {
        return error(
          404,
          "TRANSLATION_NOT_AVAILABLE",
          "Not available in this language",
          request
        )
      }

      // POSTS is newest first: the previous (older) post comes later
      const own = visible(locale, null)
      const index = own.indexOf(post)
      const neighbour = (p) =>
        p ? { slug: p.slug, title: p.titles[locale] } : null

      return HttpResponse.json({
        ...summary(post, locale),
        body: BODY[locale],
        metaTitle: post.titles[locale],
        metaDescription: EXCERPT[locale],
        updatedAt: post.publishedAt,
        previous: neighbour(own[index + 1]),
        next: neighbour(own[index - 1]),
      })
    })
  ),

  http.get(
    "*/api/v1/tags",
    keyed(({ request }) => {
      const locale = localeOf(request)
      const { include, invalid } = checkInclude(request)
      if (invalid) return invalid

      const posts = visible(locale, include)
      return HttpResponse.json(
        [...TAG_SLUGS]
          .sort()
          .map((slug) => ({
            slug,
            name: TAGS[slug][locale],
            color: TAGS[slug].color,
            postCount: posts.filter((post) => post.tags.includes(slug)).length,
          }))
          .filter((tag) => tag.postCount > 0)
      )
    })
  ),

  // docs/api-requirements-contact.md
  http.post(
    "*/api/v1/contact",
    keyed(async ({ request }) => {
      const body = await request.json().catch(() => null)
      const details = []
      if (!/^[^\s@]+@[^\s@]+$/.test(body?.email ?? ""))
        details.push({ field: "email", message: "needs a valid address" })
      if (!String(body?.message ?? "").trim())
        details.push({ field: "message", message: "cannot be empty" })
      if (details.length > 0)
        return error(400, "VALIDATION_FAILED", "Invalid message", request, details)
      console.log(`mock contact message from ${body.email}`)
      return new HttpResponse(null, { status: 202 })
    })
  ),
]
