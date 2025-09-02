"use client"

import Link from "next/link"
import * as React from "react"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

export default function AdminHomePage() {
  const [locale, setLocale] = React.useState<Locale>("en")
  React.useEffect(() => { setLocale(getClientLocale()) }, [])
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">{t(locale, "admin.overview.welcome")}</p>
      <ul className="list-disc pl-6 space-y-2">
        <li>
          <Link className="text-primary underline underline-offset-4" href="/admin/products">{t(locale, "admin.overview.manageProducts")}</Link>
        </li>
      </ul>
    </div>
  )
}
