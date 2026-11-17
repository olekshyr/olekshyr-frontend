import type { Locale } from "@/lib/i18n"

/**
 * The projects. There is no API behind them: this file is the content.
 * A missing value (`null`, an empty list) shows as a bracketed placeholder.
 */

/** Copy in every language, or one string used for all of them. */
export type Localized<T = string> = Record<Locale, T>

export type DiagramNode = {
  label: string
  /** drawn in the accent colour */
  accent?: boolean
  /** note on the arrow leaving this node */
  note?: string
}

export type ProjectPreview =
  /** a screenshot; without `src` a captioned placeholder box is drawn */
  | { kind: "shot"; file: string; caption: string; src?: string }
  /** boxes joined by arrows, top to bottom */
  | { kind: "diagram"; file: string; nodes: DiagramNode[] }

export type Project = {
  /** URL segment and file name: `/projects/{slug}`, `{slug}.md` */
  slug: string
  status: string | null
  stack: string[]
  repo: string | null
  /** a running instance */
  demo: string | null
  /** where to get a build, for things that are installed */
  download: string | null
  about: Localized
  what: Localized | null
  built: Localized<string[]> | null
  learned: Localized | null
  /** slugs of blog posts about the project */
  posts: string[]
  preview: ProjectPreview
}

export const PROJECTS: Project[] = [
  {
    slug: "this-site",
    status: "in progress",
    stack: ["Java 25", "Spring Boot 4", "Next.js", "PostgreSQL", "Redis"],
    repo: "https://github.com/olekshyr/olekshyr-dev-api",
    demo: "https://olekshyr.dev",
    download: null,
    about: {
      en: "A Spring API behind a Next.js frontend. This site, built in the open.",
      uk: "Spring API за фронтендом на Next.js. Цей сайт, створений відкрито.",
      ja: "Next.js のフロントエンドの裏に Spring の API。公開しながら作っているこのサイト。",
    },
    what: {
      en: "A personal site styled as a code editor: a blog in English, Ukrainian and Japanese, project pages, a resume and a contact form. The blog is served by a Spring Boot API; everything else is static content in the Next.js app.",
      uk: "Особистий сайт у вигляді редактора коду: блог англійською, українською та японською, сторінки проєктів, резюме й форма зворотного зв'язку. Блог обслуговує Spring Boot API, а все інше є статичним вмістом у застосунку Next.js.",
      ja: "コードエディタ風の個人サイトです。英語・ウクライナ語・日本語のブログ、プロジェクトのページ、履歴書、連絡フォームがあります。ブログは Spring Boot の API が配信し、それ以外は Next.js アプリ内の静的コンテンツです。",
    },
    built: {
      en: [
        "Only the Next.js server calls the API, with a key that never reaches the browser.",
        "Each language has its own URL, and each translation of a post is published on its own, with no fallback to another language.",
        "Public reads are cached in Redis and cleared after every admin write; if Redis is down, requests fall back to Postgres.",
        "Integration tests run against real PostgreSQL and Redis through Testcontainers.",
      ],
      uk: [
        "До API звертається лише сервер Next.js, з ключем, який ніколи не потрапляє в браузер.",
        "Кожна мова має власну URL-адресу, а кожен переклад допису публікується окремо, без підстановки іншої мови.",
        "Публічні читання кешуються в Redis і скидаються після кожного запису з адмінки; якщо Redis недоступний, запити йдуть у Postgres.",
        "Інтеграційні тести працюють зі справжніми PostgreSQL і Redis через Testcontainers.",
      ],
      ja: [
        "API を呼び出すのは Next.js のサーバーだけで、キーがブラウザに届くことはありません。",
        "言語ごとに独自の URL があり、記事の翻訳はそれぞれ個別に公開され、他の言語へのフォールバックはありません。",
        "公開側の読み取りは Redis にキャッシュし、管理側の書き込みのたびにクリアします。Redis が落ちていればリクエストは Postgres に切り替わります。",
        "統合テストは Testcontainers を使い、本物の PostgreSQL と Redis に対して実行します。",
      ],
    },
    learned: {
      en: "A small service still deserves the production basics: security, observability and tests against real infrastructure, with no more complexity than the problem needs. Keeping the static pages out of the API left it with one job, the blog.",
      uk: "Навіть невеликий сервіс заслуговує на основи продакшену: безпеку, спостережуваність і тести на справжній інфраструктурі, без зайвої складності. Статичні сторінки залишилися поза API, тож у нього одне завдання: блог.",
      ja: "小さなサービスにも本番運用の基本は必要です。セキュリティ、可観測性、本物のインフラに対するテスト。ただし問題が求める以上の複雑さは持ち込みません。静的ページを API の外に置いたことで、API の仕事はブログだけになりました。",
    },
    posts: [],
    preview: {
      kind: "diagram",
      file: "architecture.svg",
      nodes: [
        { label: "Browser" },
        { label: "Next.js frontend", accent: true, note: "server-side only" },
        { label: "Spring Boot API", accent: true },
        { label: "PostgreSQL + Redis" },
      ],
    },
  },
  {
    slug: "jp-dict",
    status: "live",
    stack: ["Next.js", "React", "TypeScript", "Postgres", "Drizzle", "Clerk"],
    repo: "https://github.com/olekshyr/jp-dict",
    demo: "https://jp-dict.olekshyr.dev",
    download: null,
    about: {
      en: "A Japanese and English dictionary with spaced repetition and free-form grammar notes.",
      uk: "Японсько-англійський словник з інтервальним повторенням і довільними нотатками з граматики.",
      ja: "間隔反復と自由形式の文法ノートを備えた日英辞書。",
    },
    what: {
      en: "Search the JMdict dictionary by kanji, kana or romaji, save entries to a personal list and add notes to them. Saved words come back as flashcards on an FSRS spaced-repetition schedule, and grammar rules are kept as rich-text notes.",
      uk: "Пошук у словнику JMdict за кандзі, каною або ромадзі, збереження слів до власного списку й нотатки до них. Збережені слова повертаються як картки за розкладом інтервального повторення FSRS, а граматичні правила зберігаються як нотатки з форматуванням.",
      ja: "JMdict を漢字、かな、ローマ字で検索し、項目を自分のリストに保存してメモを付けられます。保存した単語は FSRS の間隔反復スケジュールでフラッシュカードとして出題され、文法ルールはリッチテキストのノートとして残せます。",
    },
    built: {
      en: [
        "Dictionary data is shared and never changes, so it is cached into the static shell; per-user data is read at request time and streams in behind Suspense.",
        "Japanese lookup is a prefix match and English glosses use a simple tsvector, because Postgres on Neon has no Japanese tokenizer.",
        "Every per-user query and Server Action checks the signed-in user itself, and every write is scoped by user id.",
        "Scheduling is FSRS through ts-fsrs, with an append-only review log.",
      ],
      uk: [
        "Дані словника спільні й незмінні, тому кешуються в статичній оболонці; дані користувача читаються під час запиту й підвантажуються за Suspense.",
        "Японський пошук працює за префіксом, а англійські тлумачення використовують простий tsvector, бо Postgres у Neon не має японського токенізатора.",
        "Кожен запит до даних користувача й кожна Server Action самі перевіряють, хто увійшов, а кожен запис обмежений ідентифікатором користувача.",
        "Розклад будується за FSRS через ts-fsrs, з журналом повторень, у який лише додаються записи.",
      ],
      ja: [
        "辞書データは共有で不変なので静的シェルにキャッシュし、ユーザーごとのデータはリクエスト時に読み込んで Suspense の裏でストリーミングします。",
        "日本語の検索は前方一致、英語の語釈は simple の tsvector です。Neon の Postgres には日本語トークナイザーがないためです。",
        "ユーザーごとのクエリと Server Action はそれぞれ自分でサインイン中のユーザーを確認し、書き込みはすべてユーザー ID で絞り込みます。",
        "スケジューリングは ts-fsrs による FSRS で、追記専用の復習ログを持ちます。",
      ],
    },
    learned: {
      en: "A dictionary search is a lookup, not a relevance ranking, so the simplest index was the right one. Writes feel instant only when the client reflects the change itself, without waiting for a server round-trip.",
      uk: "Пошук у словнику є пошуком запису, а не ранжуванням за релевантністю, тож найпростіший індекс виявився правильним. Запис відчувається миттєвим лише тоді, коли клієнт сам показує зміну, не чекаючи відповіді сервера.",
      ja: "辞書検索は関連度のランキングではなく参照なので、最も単純なインデックスが正解でした。書き込みが一瞬に感じられるのは、サーバーの応答を待たずにクライアント自身が変更を反映するときだけです。",
    },
    posts: [],
    preview: {
      kind: "diagram",
      file: "architecture.svg",
      nodes: [
        { label: "Browser" },
        { label: "Next.js on Vercel", accent: true, note: "Clerk auth" },
        { label: "Drizzle", accent: true },
        { label: "Neon Postgres + JMdict" },
      ],
    },
  },
  {
    slug: "spotify-widget",
    status: "released",
    stack: ["C#", ".NET 8", "WPF"],
    repo: "https://github.com/olekshyr/spotify-taskbar-widget",
    demo: null,
    download:
      "https://github.com/olekshyr/spotify-taskbar-widget/releases/latest",
    about: {
      en: "A Spotify now-playing widget for the Windows 11 taskbar.",
      uk: "Віджет Spotify для панелі завдань Windows 11, що показує поточний трек.",
      ja: "Windows 11 のタスクバーに再生中の曲を表示する Spotify ウィジェット。",
    },
    what: {
      en: "Shows the current track in the taskbar: cover, title, artist, a seek bar and previous, play and next buttons. Scrolling over it changes the volume of Spotify itself, and it hides when Spotify is not running. No Spotify login or API key is needed.",
      uk: "Показує поточний трек на панелі завдань: обкладинку, назву, виконавця, смугу перемотування та кнопки «назад», «відтворити» й «далі». Прокручування над віджетом змінює гучність самого Spotify, а коли Spotify не запущено, віджет зникає. Вхід у Spotify чи ключ API не потрібні.",
      ja: "タスクバーに再生中の曲を表示します。カバー、タイトル、アーティスト、シークバー、前へ・再生・次へのボタン付きです。ウィジェット上でスクロールすると Spotify 自体の音量が変わり、Spotify が起動していないときは隠れます。Spotify のログインも API キーも不要です。",
    },
    built: {
      en: [
        "Reads Spotify through the Windows media API (Global System Media Transport Controls), not the Spotify Web API.",
        "Windows 11 has no supported API for taskbar toolbars, so the widget is a transparent child window of the taskbar, placed with positions read through UI Automation.",
        "A low-level mouse hook catches wheel turns, because wheel messages over a child of the Explorer window go to Explorer.",
      ],
      uk: [
        "Читає Spotify через медіа-API Windows (Global System Media Transport Controls), а не через Spotify Web API.",
        "У Windows 11 немає підтримуваного API для панелей на панелі завдань, тому віджет є прозорим дочірнім вікном панелі завдань, а позиції бере через UI Automation.",
        "Низькорівневий хук миші перехоплює прокручування, бо повідомлення коліщатка над дочірнім вікном Explorer потрапляють до Explorer.",
      ],
      ja: [
        "Spotify Web API ではなく、Windows のメディア API (Global System Media Transport Controls) 経由で Spotify を読み取ります。",
        "Windows 11 にはタスクバーのツールバー用のサポートされた API がないため、ウィジェットはタスクバーの透明な子ウィンドウで、位置は UI Automation から取得します。",
        "Explorer のウィンドウの子の上ではホイールのメッセージが Explorer に届くため、低レベルのマウスフックでホイール操作を拾います。",
      ],
    },
    learned: {
      en: "The media part sits on a stable public API, while the placement relies on taskbar internals that a major Windows update could break. Keeping the two apart means only one of them is fragile.",
      uk: "Медіа-частина спирається на стабільний публічний API, а розміщення залежить від внутрішньої будови панелі завдань, яку велике оновлення Windows може зламати. Розділення цих двох частин означає, що крихка лише одна з них.",
      ja: "メディア部分は安定した公開 API の上にありますが、配置はタスクバーの内部構造に依存しており、Windows の大型アップデートで壊れる可能性があります。両者を分けておけば、壊れやすいのは片方だけで済みます。",
    },
    posts: [],
    preview: {
      kind: "diagram",
      file: "architecture.svg",
      nodes: [
        { label: "Spotify" },
        { label: "Windows media API", note: "no login, no API key" },
        { label: "Widget (WPF)", accent: true, note: "child window" },
        { label: "Windows 11 taskbar" },
      ],
    },
  },
  {
    slug: "wanikani-widget",
    status: "released",
    stack: ["TypeScript", "Electron", "Vitest"],
    repo: "https://github.com/olekshyr/wanikani-win11-widget",
    demo: null,
    download:
      "https://github.com/olekshyr/wanikani-win11-widget/releases/latest",
    about: {
      en: "A Windows 11 desktop tile that shows how many WaniKani reviews are waiting.",
      uk: "Плитка на робочому столі Windows 11, що показує, скільки повторень WaniKani чекає.",
      ja: "WaniKani の待機中のレビュー数を表示する Windows 11 のデスクトップタイル。",
    },
    what: {
      en: "A small tile that sits on the desktop behind other windows and shows the number of pending WaniKani reviews. Clicking it opens the dashboard. It starts with Windows and has clear states for offline, server errors and a missing or invalid token.",
      uk: "Невелика плитка, що лежить на робочому столі за іншими вікнами й показує кількість повторень WaniKani, які чекають. Клацання відкриває дашборд. Вона запускається разом із Windows і має зрозумілі стани: офлайн, помилка сервера, відсутній або недійсний токен.",
      ja: "他のウィンドウの後ろ、デスクトップ上に置かれる小さなタイルで、待機中の WaniKani レビュー数を表示します。クリックするとダッシュボードが開きます。Windows と一緒に起動し、オフライン、サーバーエラー、トークンの未設定や無効といった状態をはっきり示します。",
    },
    built: {
      en: [
        "The core (API client, tile state machine, refresh scheduler, settings) is plain TypeScript with no Electron dependency and is fully unit tested.",
        "Win32 calls through koffi make the tile owned by the desktop: behind normal windows, above the icons, out of the taskbar and Alt+Tab.",
        "It checks just after each hour, when WaniKani releases reviews, on wake and on network changes: about 30 API calls a day.",
        "The API token is encrypted with the Windows account through the Electron safeStorage API.",
      ],
      uk: [
        "Ядро (клієнт API, автомат станів плитки, планувальник оновлень, налаштування) написане на чистому TypeScript без залежності від Electron і повністю покрите модульними тестами.",
        "Виклики Win32 через koffi роблять плитку частиною робочого стола: за звичайними вікнами, над іконками, поза панеллю завдань і Alt+Tab.",
        "Перевірка відбувається одразу після початку кожної години, коли WaniKani відкриває повторення, після виходу зі сну та зміни мережі: близько 30 викликів API на день.",
        "Токен API шифрується обліковим записом Windows через safeStorage в Electron.",
      ],
      ja: [
        "コア（API クライアント、タイルの状態機械、更新スケジューラー、設定）は Electron に依存しない素の TypeScript で、すべて単体テスト済みです。",
        "koffi 経由の Win32 呼び出しでタイルをデスクトップの所有にします。通常のウィンドウの後ろ、アイコンの上にあり、タスクバーと Alt+Tab には出ません。",
        "WaniKani がレビューを解放する毎時直後と、スリープ復帰時、ネットワーク変化時に確認します。API 呼び出しは 1 日およそ 30 回です。",
        "API トークンは Electron の safeStorage を通じて Windows アカウントで暗号化します。",
      ],
    },
    learned: {
      en: "Polling on the schedule of the service beats polling often. Keeping the logic free of Electron made it testable without opening a window.",
      uk: "Опитувати за розкладом самого сервісу краще, ніж опитувати часто. Логіка без залежності від Electron тестується без відкриття вікна.",
      ja: "頻繁にポーリングするより、サービス側のスケジュールに合わせる方が優れています。ロジックを Electron から切り離したことで、ウィンドウを開かずにテストできました。",
    },
    posts: [],
    preview: {
      kind: "diagram",
      file: "architecture.svg",
      nodes: [
        { label: "api.wanikani.com", note: "about 30 calls a day" },
        { label: "Core: scheduler + state", accent: true },
        { label: "Electron main", accent: true, note: "Win32 via koffi" },
        { label: "Tile on the desktop" },
      ],
    },
  },
]

export const getProject = (slug: string) =>
  PROJECTS.find((project) => project.slug === slug)

/** The projects before and after one, wrapping around the ends. */
export function projectNeighbours(slug: string) {
  const i = PROJECTS.findIndex((project) => project.slug === slug)
  const at = (offset: number) =>
    PROJECTS[(i + offset + PROJECTS.length) % PROJECTS.length]
  return { previous: at(-1), next: at(1) }
}
