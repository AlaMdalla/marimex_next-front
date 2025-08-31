"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { t, type Locale } from "@/i18n"

export function CartHeader({ locale, count }: { locale: Locale; count: number }) {
  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(locale, "cart.back")}
            </Link>
            <h1 className="text-3xl font-bold">{t(locale, "cart.yourCart")}</h1>
            <p className="text-muted-foreground mt-1">
              {count} {count === 1 ? t(locale, "common.item") : t(locale, "common.items")} {t(locale, "cart.inYourCart")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
