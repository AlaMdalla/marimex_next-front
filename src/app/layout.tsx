import type { Metadata } from "next";
// Use a single, consistent font across the app (Lexend). Variable import includes all weights/styles.
import "./globals.css";
import { Header } from "./header/Header";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n";
import { Providers } from "./providers";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

export async function generateMetadata(): Promise<Metadata> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com";
  // Localize base metadata using cookie locale (best-effort in root)
  // Note: We can't read cookies here reliably without making this function async/server. It's async already.
  // We'll mirror the html lang selection done in the RootLayout body.
  const defaultTitle = "Marimex — Premium Marble in Tunisia";
  const defaultDesc = "Premium marble products, expert craft, and reliable service in Tunisia. Browse, review, and order with fast SSO login.";
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: defaultTitle,
      template: "%s — Marimex",
    },
    description: defaultDesc,
    keywords: [
      "Marimex",
      "marbre",
      "marble",
      "Tunisie",
      "Tunisia",
      "marbre Tunisie",
      "vente marbre",
      "premium marble",
      "tiles",
      "granite",
    ],
    openGraph: {
      title: defaultTitle,
      description: defaultDesc,
      url: siteUrl,
      siteName: "Marimex",
      images: [{ url: "/images/marimex.jpg" }],
      locale: "fr_TN",
      alternateLocale: ["en_US", "it_IT", "ar_TN", "zh_CN"],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Marimex — Premium Marble",
      description: "Premium marble products and expert craft.",
      images: ["/images/marimex.jpg"],
    },
    alternates: {
      canonical: "/",
      languages: {
        "en": "/",
        "fr": "/",
        "it": "/",
        "ar-TN": "/",
        "zh-CN": "/",
      },
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side locale for html lang attribute
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined;
  const locale: Locale = (cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh") ? (cookieLocale as Locale) : "en";
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://accounts.google.com" />
        <link rel="preconnect" href="https://ssl.gstatic.com" crossOrigin="anonymous" />
        {process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? (
          <meta name="google-site-verification" content={process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION} />
        ) : null}
        {/* Organization structured data for better knowledge panel & branding */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Marimex",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com",
              logo: (process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com") + "/images/marimex.jpg",
              sameAs: []
            })
          }}
        />
        {/* WebSite schema with SearchAction for sitelinks search box */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Marimex",
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com",
              potentialAction: {
                "@type": "SearchAction",
                target: `${process.env.NEXT_PUBLIC_SITE_URL || "https://marimexste.com"}/products?search={search_term_string}`,
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </head>
      <body className="font-sans antialiased bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <Providers>
          {/* Global SSO prompt for fast sign-in */}
          <GoogleOneTap />
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
