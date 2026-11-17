import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP, Onest } from "next/font/google";
import { notFound } from "next/navigation";

import { HTML_LANG, LOCALES, SITE_URL, hasLocale } from "@/lib/i18n";

import { THEME_SCRIPT } from "@/lib/theme";

import "../globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  weight: ["400", "700"],
  preload: false,
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "olekshyr.dev",
};

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={HTML_LANG[lang]}
      className={`${jetbrainsMono.variable} ${onest.variable} ${notoSansJP.variable}`}
      // the theme script sets data-theme before hydration
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
