import type { Metadata } from "next"
import Link from "next/link"
import { AdminGuard } from "@/components/admin/AdminGuard"
import { t, type Locale } from "@/i18n"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "Admin — Marimex",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value
  const locale: Locale = cookieLocale === "en" || cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh" ? (cookieLocale as Locale) : "en"
  return (
    <AdminGuard>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t(locale, "admin.nav.title")}</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin" className="underline-offset-4 hover:underline">{t(locale, "admin.nav.overview")}</Link>
            <Link href="/admin/products" className="underline-offset-4 hover:underline">{t(locale, "admin.nav.products")}</Link>
            <Link href="/admin/orders" className="underline-offset-4 hover:underline">{t(locale, "admin.nav.orders")}</Link>
            <Link href="/products" className="underline-offset-4 hover:underline">{t(locale, "admin.nav.store")}</Link>
          </nav>
        </div>
        {children}
      </div>
    </AdminGuard>
  )
}
