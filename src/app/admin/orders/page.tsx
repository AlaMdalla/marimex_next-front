"use client"

import React from "react"
import Link from "next/link"
import Image from "next/image"
import { getAllCommandes, deleteCommande, validateCommande, getMarbleById } from "@/services/marbles"
import { toast } from "@/components/ui/toast"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

type CommandeItem = {
  marble: string | number
  count: number
}

type Commande = {
  id?: string | number
  _id?: string | number
  order_name?: string
  totalPrice?: number
  number_of_phone?: string
  status?: string
  location?: { lat?: number; lng?: number; address?: string }
  list_marbles: CommandeItem[]
}

type Marble = {
  id?: string | number
  _id?: string | number
  name?: string
  imageurl?: string
  price?: number
}

export default function AdminOrdersPage() {
  const [locale, setLocale] = React.useState<Locale>("en")
  React.useEffect(() => { setLocale(getClientLocale()) }, [])
  const [isLoading, setIsLoading] = React.useState(true)
  const [commandes, setCommandes] = React.useState<Commande[]>([])
  const [filterText, setFilterText] = React.useState("")
  const [sortField, setSortField] = React.useState<"order_name" | "totalPrice" | "location">("totalPrice")
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc")
  const [marbleMap, setMarbleMap] = React.useState<Record<string | number, Marble | null>>({})

  const load = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await getAllCommandes()
      const list: Commande[] = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []
      setCommandes(list)

      // Collect unique marble ids
      const ids = new Set<string | number>()
      for (const c of list) {
        for (const item of c.list_marbles || []) {
          if (item?.marble != null) ids.add(item.marble)
        }
      }

      const newMap: Record<string | number, Marble | null> = {}
      await Promise.all(
        Array.from(ids).map(async (id) => {
          try {
            const m = await getMarbleById(String(id))
            const marble: Marble = m?.data || m
            newMap[id] = marble || null
          } catch {
            newMap[id] = null
          }
        }),
      )
      setMarbleMap((prev) => ({ ...newMap, ...prev }))
    } catch (e: any) {
  toast.error(e?.message || t(locale, "admin.orders.toast.loadFailed"))
      setCommandes([])
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    load()
  }, [load])

  const apply = React.useCallback(
    (rows: Commande[]) => {
      let result = [...rows]
      const q = filterText.trim().toLowerCase()
    if (q) {
        result = result.filter((c) => {
          const price = c.totalPrice != null ? String(c.totalPrice) : ""
      const loc = c.location?.lat != null && c.location?.lng != null ? `${c.location.lat},${c.location.lng}`.toLowerCase() : ""
      const addr = c.location?.address ? c.location.address.toLowerCase() : ""
          const orderName = c.order_name?.toLowerCase() || ""
          const phone = c.number_of_phone ? String(c.number_of_phone) : ""
          const hasMarble = (c.list_marbles || []).some((it) => (marbleMap[it.marble]?.name || "").toLowerCase().includes(q))
      return price.includes(q) || loc.includes(q) || addr.includes(q) || orderName.includes(q) || phone.includes(q) || hasMarble
        })
      }
      result.sort((a, b) => {
        const dir = sortDirection === "asc" ? 1 : -1
        const va = sortField === "location" ? (a.location?.lat ?? 0) : (a as any)[sortField] ?? 0
        const vb = sortField === "location" ? (b.location?.lat ?? 0) : (b as any)[sortField] ?? 0
        if (va < vb) return -1 * dir
        if (va > vb) return 1 * dir
        return 0
      })
      return result
    },
    [filterText, marbleMap, sortDirection, sortField],
  )

  const filtered = React.useMemo(() => apply(commandes), [apply, commandes])

  const toggleSort = (field: typeof sortField) => {
    setSortField((prev) => (prev === field ? prev : field))
    setSortDirection((prev) => (sortField === field ? (prev === "asc" ? "desc" : "asc") : "asc"))
  }

  const onOpenMap = (lat?: number, lng?: number) => {
    if (lat == null || lng == null) return
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, "_blank")
  }

  const onValidate = async (c: Commande) => {
    const id = String(c._id ?? c.id ?? "")
    if (!id) return
    try {
      await validateCommande(id)
  toast.success(t(locale, "admin.orders.toast.validated"))
      await load()
    } catch (e: any) {
  toast.error(e?.message || t(locale, "admin.orders.toast.validateFailed"))
    }
  }

  const onReject = async (c: Commande) => {
    const id = String(c._id ?? c.id ?? "")
    if (!id) return
    try {
      await deleteCommande(id)
  toast.success(t(locale, "admin.orders.toast.deleted"))
      await load()
    } catch (e: any) {
  toast.error(e?.message || t(locale, "admin.orders.toast.deleteFailed"))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t(locale, "admin.orders.title")}</h2>
        <Link href="/admin" className="text-sm underline-offset-4 hover:underline">
          {t(locale, "admin.orders.back")}
        </Link>
      </div>

      <div className="relative max-w-xl">
        <input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder={t(locale, "admin.orders.filterPlaceholder")}
          className="w-full border rounded px-3 py-2 pr-10"
          aria-label={t(locale, "admin.orders.a11y.filterAria")}
        />
        {filterText && (
          <button
            onClick={() => setFilterText("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm px-2 py-1 rounded border"
            aria-label={t(locale, "admin.orders.a11y.clearFilter")}
            title={t(locale, "admin.orders.a11y.clearFilter")}
          >
            {t(locale, "common.retry")}
          </button>
        )}
      </div>

      {isLoading ? (
  <div className="py-20 text-center text-sm text-muted-foreground">{t(locale, "admin.orders.loading")}</div>
      ) : filtered.length === 0 ? (
  <div className="rounded border p-4 text-sm">{t(locale, "admin.orders.empty")}</div>
      ) : (
        <div className="overflow-x-auto rounded border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
    <th className="text-left p-2 cursor-pointer" onClick={() => toggleSort("order_name")}>{t(locale, "admin.orders.table.orderName")}</th>
    <th className="text-left p-2 cursor-pointer" onClick={() => toggleSort("totalPrice")}>{t(locale, "admin.orders.table.totalPrice")}</th>
    <th className="text-left p-2 cursor-pointer" onClick={() => toggleSort("location")}>{t(locale, "admin.orders.table.location")}</th>
    <th className="text-left p-2">{t(locale, "admin.orders.table.marbles")}</th>
    <th className="text-left p-2">{t(locale, "admin.orders.table.phone")}</th>
    <th className="text-left p-2">{t(locale, "admin.orders.table.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={String(c._id ?? c.id ?? i)} className="border-t">
                  <td className="p-2">{c.order_name || "N/A"}</td>
                  <td className="p-2">{c.totalPrice != null ? `${c.totalPrice.toFixed ? c.totalPrice.toFixed(2) : c.totalPrice} DT` : "N/A"}</td>
                  <td className="p-2">
                    {c.location?.lat != null && c.location?.lng != null ? (
                      <div className="flex flex-col">
                        {c.location?.address ? (
                          <div className="text-xs text-foreground/90 line-clamp-2">{c.location.address}</div>
                        ) : null}
                        <button className="underline underline-offset-2 text-left" onClick={() => onOpenMap(c.location?.lat, c.location?.lng)}>
                          {t(locale, "admin.orders.openMap")}
                        </button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-2">
                      {(c.list_marbles || []).map((item, idx) => {
                        const m = marbleMap[item.marble]
                        return (
                          <div key={idx} className="flex items-center gap-2 border rounded px-2 py-1">
                            {m?.imageurl ? (
                              <div className="relative w-10 h-10 overflow-hidden rounded">
                                <Image src={m.imageurl} alt={`${m.name || "Marble"}`} fill className="object-cover" />
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded" />
                            )}
                            <span>{m?.name || "Unknown"} × {item.count}</span>
                          </div>
                        )
                      })}
                    </div>
                  </td>
                  <td className="p-2">{c.number_of_phone || "N/A"}</td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <button
                        className="text-xs px-2 py-1 rounded border disabled:opacity-50"
                        disabled={c.status === "validated"}
                        onClick={() => onValidate(c)}
                      >
                        {t(locale, "admin.orders.validate")}
                      </button>
                      <button
                        className="text-xs px-2 py-1 rounded border border-red-500 text-red-600 disabled:opacity-50"
                        disabled={c.status === "rejected"}
                        onClick={() => onReject(c)}
                      >
                        {t(locale, "admin.orders.reject")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple chart placeholder */}
      <div className="border rounded p-4">
        <h3 className="font-medium mb-2">{t(locale, "admin.orders.chart.placeholderTitle")}</h3>
        <div className="text-sm text-muted-foreground">{t(locale, "admin.orders.chart.placeholderDesc")}</div>
      </div>
    </div>
  )
}
