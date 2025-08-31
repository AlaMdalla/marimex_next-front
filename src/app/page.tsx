import Link from "next/link"
import Image from "next/image"
import { cookies } from "next/headers"
import { Button } from "@/components/ui/button"
import { formatPrice } from "@/lib/utils"
import { t, type Locale } from "@/i18n"
import { getAllMarbles, getAllTags } from "@/services/marbles"

export default async function Home() {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("locale")?.value as Locale | undefined
  const locale: Locale = cookieLocale === "fr" || cookieLocale === "tn" || cookieLocale === "it" || cookieLocale === "zh" ? (cookieLocale as Locale) : "en"

  // Fetch data server-side
  let marbles: any[] = []
  let tags: string[] = []
  try {
    marbles = await getAllMarbles()
  } catch {}
  try {
    const raw = await getAllTags()
    const arr = Array.isArray(raw) ? (raw as any[]) : []
    // Defensive normalization: flatten one level, pick common fields, stringify safely, trim, de-dup, and drop invalids
    const norm = (arr.flat ? arr.flat() : arr)
      .map((t: any) => {
        if (typeof t === "string") return t
        if (t && typeof t === "object") {
          const candidate =
            (typeof t.tag === "string" && t.tag) ||
            (typeof t.name === "string" && t.name) ||
            (typeof t.label === "string" && t.label) ||
            (typeof t.value === "string" && t.value) ||
            (typeof t.slug === "string" && t.slug) ||
            ""
          if (candidate) return candidate
        }
        // fallback to string representation if available
        const s = t?.toString?.()
        return typeof s === "string" ? s : ""
      })
      .map((s: string) => s.trim())
      .filter((s: string) => s && s !== "[object Object]")
    tags = Array.from(new Set(norm))
  } catch {}

  const featured = marbles.slice(0, 8)

  const numberLocale =
    locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US"

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
        <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">{t(locale, "home.heroTitle")}</h1>
        <p className="text-muted-foreground text-lg mb-6">{t(locale, "home.heroSubtitle")}</p>
              <div className="flex gap-3">
                <Link href="/products">
          <Button size="lg">{t(locale, "home.ctaBrowse")}</Button>
                </Link>
                <Link href="/products">
          <Button size="lg" variant="outline">{t(locale, "home.ctaExplore")}</Button>
                </Link>
              </div>
            </div>
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
              <Image src="/images/marimex.jpg" alt="Marimex" fill className="object-cover" priority />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">{t(locale, "home.featuredTitle")}</h2>
            <Link href="/products">
              <Button variant="outline">{t(locale, "home.viewAll")}</Button>
            </Link>
          </div>
          {featured.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">{t(locale, "home.noProducts")}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p: any) => (
                <Link key={String(p._id || p.id)} href={`/products/${String(p._id || p.id)}`} className="group rounded-xl border overflow-hidden hover:shadow-md transition">
                  <div className="relative aspect-square bg-muted">
                    <Image src={p.imageurl || "/placeholder-image.jpg"} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-1">{p.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatPrice(p.price, { locale: numberLocale as any, minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Browse by Tags */}
      <section className="border-t">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold mb-4">{t(locale, "home.browseByTags")}</h2>
          {tags.length === 0 ? (
            <div className="text-sm text-muted-foreground">{t(locale, "home.noTags")}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag} href={`/products?tag=${encodeURIComponent(tag)}`} className="px-3 py-1.5 rounded-full border text-sm hover:bg-accent hover:text-accent-foreground">
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
