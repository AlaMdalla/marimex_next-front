import type { Metadata } from "next";
// Use a single, consistent font across the app (Lexend). Variable import includes all weights/styles.
import "./globals.css";
import { Header } from "./header/Header";
import { cookies } from "next/headers";
import type { Locale } from "@/i18n";
import { Providers } from "./providers";
import { GoogleOneTap } from "@/components/auth/GoogleOneTap";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:4200"),
  title: {
    default: "Marimex — Premium Marble in Tunisia",
    template: "%s — Marimex"
  },
  description: "Premium marble products, expert craft, and reliable service in Tunisia. Browse, review, and order with fast SSO login.",
  keywords: ["Marimex", "marble", "Tunisia", "premium marble", "tiles", "granite"],
  openGraph: {
    title: "Marimex — Premium Marble in Tunisia",
    description: "Premium marble products, expert craft, and reliable service in Tunisia.",
    url: "https://marimex.vercel.app/",
    siteName: "Marimex",
    images: [{ url: "/images/marimex.jpg" }],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Marimex — Premium Marble",
    description: "Premium marble products and expert craft.",
    images: ["/images/marimex.jpg"]
  },
  // Using default favicon.ico
  alternates: {
    canonical: "/"
  }
};

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
              url: process.env.NEXT_PUBLIC_SITE_URL || "https://marimex.vercel.app",
              logo: (process.env.NEXT_PUBLIC_SITE_URL || "https://marimex.vercel.app") + "/images/marimex.jpg",
              sameAs: []
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
