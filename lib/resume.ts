import type { Locale } from "@/lib/i18n"

/** The resume. There is no API behind it: this file is the content. */

type Localized<T = string> = Record<Locale, T>

export type Job = {
  company: Localized
  role: Localized
  from: number
  /** null: still there */
  to: number | null
  points: Localized<string[]>
  stack: string[]
}

/**
 * Path of the PDF under `public/`, e.g. `/resume.pdf`.
 * While null the download button is disabled.
 */
export const RESUME_PDF: string | null = null

/** ISO date of the last edit; null shows a placeholder. */
export const RESUME_UPDATED: string | null = null

export const HEADLINE: Localized = {
  en: "Frontend engineer, fullstack with Java and Spring",
  uk: "Frontend-інженер, fullstack з Java і Spring",
  ja: "フロントエンドエンジニア。Java と Spring でフルスタックも。",
}

export const JOBS: Job[] = [
  {
    company: { en: "P2H", uk: "P2H", ja: "P2H" },
    role: {
      en: "fullstack engineer",
      uk: "fullstack-інженер",
      ja: "フルスタックエンジニア",
    },
    from: 2023,
    to: null,
    points: {
      en: [
        "Sole developer of a certificates app for business owners in Saudi government services.",
        "Moved a three-layer Ruby BFF to a single Java and Spring backend; explained the business logic to the migration team.",
        "Helped redesign auth: one-time token and Redis session to session data as a JWT in a cookie.",
        "Mentored a junior developer for three months with a written development plan.",
      ],
      uk: [
        "Єдиний розробник застосунку сертифікатів для власників бізнесу в державних сервісах Саудівської Аравії.",
        "Переніс тришаровий BFF на Ruby на єдиний бекенд на Java і Spring; пояснював бізнес-логіку команді міграції.",
        "Допоміг переробити автентифікацію: від одноразового токена й сесії в Redis до даних сесії у JWT в cookie.",
        "Три місяці менторив джуніор-розробника за письмовим планом розвитку.",
      ],
      ja: [
        "サウジアラビアの行政サービスで、事業者向けの証明書アプリを一人で開発。",
        "3 層構成の Ruby 製 BFF を単一の Java / Spring バックエンドへ移行し、移行チームに業務ロジックを説明。",
        "認証の再設計に参加。ワンタイムトークンと Redis セッションから、Cookie 内の JWT にセッションデータを持つ方式へ。",
        "書面の育成計画に沿って、ジュニア開発者を 3 か月間メンタリング。",
      ],
    },
    stack: ["React", "TypeScript", "Java", "Spring", "Redis"],
  },
  {
    company: { en: "SoftServe", uk: "SoftServe", ja: "SoftServe" },
    role: {
      en: "junior to middle frontend",
      uk: "frontend, від джуніора до мідла",
      ja: "フロントエンド(ジュニアからミドルへ)",
    },
    from: 2021,
    to: 2023,
    points: {
      en: [
        "Calendar feature of dental practice software for a US client.",
        "First to migrate a module from Backbone to React, with business logic in ES6 classes.",
        "Promoted to middle after nine months.",
      ],
      uk: [
        "Календар у програмі для стоматологічних клінік для клієнта зі США.",
        "Першим переніс модуль із Backbone на React, з бізнес-логікою в класах ES6.",
        "Підвищений до мідла за дев'ять місяців.",
      ],
      ja: [
        "米国クライアント向け歯科医院ソフトウェアのカレンダー機能。",
        "Backbone から React へのモジュール移行を最初に実施。業務ロジックは ES6 クラスに。",
        "9 か月でミドルに昇格。",
      ],
    },
    stack: ["React", "Backbone", "Vue"],
  },
  {
    company: {
      en: "Mobius Web Agency",
      uk: "Mobius Web Agency",
      ja: "Mobius Web Agency",
    },
    role: { en: "frontend", uk: "frontend", ja: "フロントエンド" },
    from: 2019,
    to: 2021,
    points: {
      en: [
        "Theater ticketing: admin panel, cashier UI, seat-map booking, printed tickets.",
        "Sole frontend developer for six months; mentored two new hires and chose frameworks.",
      ],
      uk: [
        "Продаж театральних квитків: адмін-панель, інтерфейс касира, бронювання на схемі залу, друк квитків.",
        "Пів року був єдиним фронтенд-розробником; менторив двох новачків і обирав фреймворки.",
      ],
      ja: [
        "劇場のチケット販売。管理画面、窓口用 UI、座席表からの予約、チケット印刷。",
        "6 か月間は唯一のフロントエンド開発者。新人 2 名のメンタリングとフレームワーク選定を担当。",
      ],
    },
    stack: ["Vue", "Nuxt", "Laravel", "WordPress"],
  },
  {
    company: {
      en: "Freight logistics",
      uk: "Вантажна логістика",
      ja: "貨物物流",
    },
    role: {
      en: "sales and account manager",
      uk: "менеджер з продажу та супроводу клієнтів",
      ja: "営業・アカウントマネージャー",
    },
    from: 2016,
    to: 2019,
    points: {
      en: [
        "Container shipping from China to Ukraine, from first cold call to delivery and invoicing.",
      ],
      uk: [
        "Контейнерні перевезення з Китаю в Україну: від першого холодного дзвінка до доставки й виставлення рахунків.",
      ],
      ja: [
        "中国からウクライナへのコンテナ輸送。最初のコールドコールから納品、請求まで。",
      ],
    },
    stack: [],
  },
]

export const SKILLS: { key: string; value: Localized }[] = [
  {
    key: "front",
    value: {
      en: "React, TypeScript, Vue, Next.js",
      uk: "React, TypeScript, Vue, Next.js",
      ja: "React, TypeScript, Vue, Next.js",
    },
  },
  {
    key: "back",
    value: {
      en: "Java, Spring, Postgres, Redis",
      uk: "Java, Spring, Postgres, Redis",
      ja: "Java, Spring, Postgres, Redis",
    },
  },
  {
    key: "languages",
    value: {
      en: "Ukrainian, English, Japanese [level]",
      uk: "українська, англійська, японська [рівень]",
      ja: "ウクライナ語、英語、日本語 [レベル]",
    },
  },
]

export const EDUCATION: { text: Localized; from: number; to: number }[] = [
  {
    text: {
      en: "BSc and MSc, Transport Logistics, Odesa National Maritime University",
      uk: "Бакалавр і магістр, транспортна логістика, Одеський національний морський університет",
      ja: "学士・修士(輸送ロジスティクス)、オデーサ国立海事大学",
    },
    from: 2011,
    to: 2016,
  },
]
