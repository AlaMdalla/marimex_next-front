"use client"

import React, { useCallback, useEffect, useMemo, useState } from "react"
import { uploadImage, addMarble, getAllMarbles, deleteMarble, updateMarble, getAllTags } from "@/services/marbles"
import type { Marble, NewMarble } from "@/types/marble"
import { toast } from "@/components/ui/toast"
import Image from "next/image"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

type FormState = {
  name: string
  price: string
  favorite: boolean
  stars: string
  imageurl: string
  descriptions: string
}

const emptyForm: FormState = {
  name: "",
  price: "0",
  favorite: false,
  stars: "0",
  imageurl: "",
  descriptions: "",
}

export default function AdminProductsPage() {
  const [locale, setLocale] = useState<Locale>("en")
  const [form, setForm] = useState<FormState>(emptyForm)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [items, setItems] = useState<Marble[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  // Filters and pagination
  const [search, setSearch] = useState("")
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [minStars, setMinStars] = useState("0")
  const [maxStars, setMaxStars] = useState("5")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(9)
  const [tags, setTags] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const load = useCallback(async () => {
    setLoadingList(true)
    try {
      const data = await getAllMarbles()
      setItems(Array.isArray(data) ? data : [])
    } catch (e: any) {
  toast.error(e?.message || t(locale, "admin.products.toast.loadFailed"), "Error")
    } finally {
      setLoadingList(false)
    }
  }, [])

  useEffect(() => {
  setLocale(getClientLocale())
    load()
  }, [load])

  useEffect(() => {
    ;(async () => {
      try {
        const t = await getAllTags()
        const arr = Array.isArray(t) ? (t as any[]).map(String) : []
        setTags(arr)
      } catch {
        setTags([])
      }
    })()
  }, [])

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1)
  }, [search, favoriteOnly, minStars, maxStars, minPrice, maxPrice, selectedTags, items.length])

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? Boolean(checked) : value }))
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadImage(file)
      const secureUrl = res?.data?.secure_url || res?.secure_url || res?.url
      if (secureUrl) {
        setForm((f) => ({ ...f, imageurl: String(secureUrl) }))
        toast.success(t(locale, "admin.products.toast.imageUploaded"), "Success")
      } else {
        toast.error(t(locale, "admin.products.toast.uploadNoUrl"), "Upload")
      }
    } catch (e: any) {
      toast.error(e?.message || t(locale, "admin.products.toast.imageUploadFailed"), "Upload Failed")
    } finally {
      setUploading(false)
    }
  }

  const reset = () => {
    setForm(emptyForm)
    setEditId(null)
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.imageurl) {
  toast.error(t(locale, "admin.products.toast.validationMissing"), "Validation")
      return
    }
    const payload: NewMarble = {
      name: form.name.trim(),
      price: Number(form.price),
      favorite: Boolean(form.favorite),
      stars: Math.max(0, Math.min(5, Number(form.stars) || 0)),
      imageurl: form.imageurl,
      descriptions: form.descriptions,
      description: form.descriptions,
    }
    setSubmitting(true)
    try {
      if (editId) {
        await updateMarble(editId, payload)
        toast.success(t(locale, "admin.products.toast.productUpdated"), "Success")
      } else {
        await addMarble(payload)
        toast.success(t(locale, "admin.products.toast.productAdded"), "Success")
      }
      reset()
      await load()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || t(locale, "admin.products.toast.saveFailed"), "Error")
    } finally {
      setSubmitting(false)
    }
  }

  const onDelete = async (id: string) => {
    if (!confirm(t(locale, "admin.products.form.confirmDelete"))) return
    try {
      await deleteMarble(id)
      toast.success(t(locale, "admin.products.toast.productDeleted"), "Done")
      await load()
    } catch (e: any) {
      toast.error(e?.message || t(locale, "admin.products.toast.deleteFailed"), "Error")
    }
  }

  const startEdit = (m: Marble) => {
    setEditId(String(m._id || m.id))
    setForm({
      name: m.name || "",
      price: String(m.price ?? 0),
      favorite: Boolean((m as any).favorite),
      stars: String((m as any).stars ?? 0),
      imageurl: m.imageurl || "",
      descriptions: (m as any).descriptions || m.description || "",
    })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const minS = Math.max(0, Math.min(5, Number(minStars) || 0))
    const maxS = Math.max(minS, Math.min(5, Number(maxStars) || 5))
    const minP = minPrice === "" ? -Infinity : Number(minPrice)
    const maxP = maxPrice === "" ? Infinity : Number(maxPrice)
    return (items || []).filter((m) => {
      const name = (m.name || "").toLowerCase()
      const desc = ((m as any).descriptions || m.description || "").toLowerCase()
      const priceNum = Number(m.price || 0)
      const starsNum = Number((m as any).stars || 0)
      if (q && !name.includes(q) && !desc.includes(q)) return false
      if (favoriteOnly && !(m as any).favorite) return false
      if (starsNum < minS || starsNum > maxS) return false
      if (!(priceNum >= minP && priceNum <= maxP)) return false
      if (selectedTags.length > 0) {
        const mtags: string[] = Array.isArray(m.tags) ? (m.tags as any[]).map(String) : []
        const hasAny = selectedTags.some((t) => mtags.includes(t))
        if (!hasAny) return false
      }
      return true
    })
  }, [items, search, favoriteOnly, minStars, maxStars, minPrice, maxPrice, selectedTags])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const sliceStart = (currentPage - 1) * pageSize
  const pageItems = filtered.slice(sliceStart, sliceStart + pageSize)

  const changePage = (p: number) => {
    const np = Math.max(1, Math.min(totalPages, p))
    setPage(np)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8">
      {/* Filters */}
      <section className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">{t(locale, "admin.products.filters.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm">{t(locale, "admin.products.filters.searchLabel")}</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="border rounded px-3 py-2" placeholder={t(locale, "admin.products.filters.searchPlaceholder")} />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.filters.priceMin")}</span>
            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.filters.priceMax")}</span>
            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={favoriteOnly} onChange={(e) => setFavoriteOnly(e.target.checked)} />
            <span className="text-sm">{t(locale, "admin.products.filters.favoritesOnly")}</span>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.filters.starsMin")}</span>
            <input type="number" min={0} max={5} value={minStars} onChange={(e) => setMinStars(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.filters.starsMax")}</span>
            <input type="number" min={0} max={5} value={maxStars} onChange={(e) => setMaxStars(e.target.value)} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.filters.perPage")}</span>
            <select className="border rounded px-3 py-2" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
              {[6, 9, 12, 18, 24].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        </div>
        {/* Tags selection */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">{t(locale, "admin.products.filters.tagsTitle")}</div>
          {tags.length === 0 ? (
            <div className="text-xs text-muted-foreground">{t(locale, "admin.products.filters.noTags")}</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const active = selectedTags.includes(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
                    }}
                    className={`px-3 py-1 rounded-full border text-xs ${active ? "bg-foreground text-background" : ""}`}
                  >
                    {tag}
                  </button>
                )
              })}
              {selectedTags.length > 0 && (
                <button type="button" onClick={() => setSelectedTags([])} className="px-3 py-1 rounded-full border text-xs">{t(locale, "admin.products.filters.clear")}</button>
              )}
            </div>
          )}
        </div>
  <div className="mt-3 text-xs text-muted-foreground">{t(locale, "admin.products.filters.showing").replace("{count}", String(filtered.length)).replace("{of}", filtered.length !== items.length ? ` ${t(locale, "common.of")} ${items.length}` : "")}</div>
      </section>
      <section className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">{editId ? t(locale, "admin.products.form.titleUpdate") : t(locale, "admin.products.form.titleAdd")}</h2>
        <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.form.name")}</span>
            <input name="name" value={form.name} onChange={onChange} className="border rounded px-3 py-2" required />
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.form.price")}</span>
            <input name="price" type="number" step="0.01" value={form.price} onChange={onChange} className="border rounded px-3 py-2" required />
          </label>
          <label className="flex items-center gap-2">
            <input name="favorite" type="checkbox" checked={form.favorite} onChange={onChange} />
            <span className="text-sm">{t(locale, "admin.products.form.favorite")}</span>
          </label>
          <label className="grid gap-1">
            <span className="text-sm">{t(locale, "admin.products.form.stars")}</span>
            <input name="stars" type="number" min={0} max={5} value={form.stars} onChange={onChange} className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm">{t(locale, "admin.products.form.image")}</span>
            <div className="flex items-center gap-3">
              <input type="file" accept="image/*" onChange={onFile} />
              {uploading ? <span className="text-xs text-muted-foreground">{t(locale, "admin.products.form.uploading")}</span> : null}
              {form.imageurl ? <a className="text-xs text-primary underline" href={form.imageurl} target="_blank" rel="noreferrer">{t(locale, "admin.products.form.open")}</a> : null}
            </div>
            {form.imageurl ? (
              <div className="mt-2 relative w-40 h-40 border rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imageurl} alt="preview" className="object-cover w-full h-full" />
              </div>
            ) : null}
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-sm">{t(locale, "admin.products.form.description")}</span>
            <textarea name="descriptions" rows={4} value={form.descriptions} onChange={onChange} className="border rounded px-3 py-2" />
          </label>
          <div className="md:col-span-2 flex gap-3">
            <button disabled={submitting} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
              {editId ? t(locale, "admin.products.form.update") : t(locale, "admin.products.form.submit")}
            </button>
            <button type="button" onClick={reset} className="px-4 py-2 rounded border">{t(locale, "admin.products.form.reset")}</button>
          </div>
        </form>
      </section>

      <section className="border rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">{t(locale, "admin.products.list.existingTitle")}</h3>
        {loadingList ? (
          <div className="text-sm text-muted-foreground">{t(locale, "admin.products.list.loading")}</div>
        ) : filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">{t(locale, "admin.products.list.empty")}</div>
        ) : (
          <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pageItems.map((m) => {
              const id = String(m._id || m.id)
              return (
                <div key={id} className="border rounded-lg overflow-hidden">
                  <div className="relative aspect-square bg-muted">
                    <Image src={m.imageurl || "/placeholder-image.jpg"} alt={m.name} fill className="object-cover" />
                  </div>
                  <div className="p-3 space-y-2">
                    <div className="font-medium line-clamp-1">{m.name}</div>
                    <div className="text-sm text-muted-foreground">${Number(m.price || 0).toFixed(2)}</div>
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(m)} className="text-xs px-3 py-1 rounded border">{t(locale, "admin.products.list.edit")}</button>
                      <button onClick={() => onDelete(id)} className="text-xs px-3 py-1 rounded border border-red-500 text-red-600">{t(locale, "admin.products.list.delete")}</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between gap-3">
            <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => changePage(page - 1)} disabled={currentPage === 1}>{t(locale, "admin.products.list.prev")}</button>
            <div className="flex flex-wrap items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 7).map((p) => (
                <button
                  key={p}
                  onClick={() => changePage(p)}
                  className={`px-3 py-2 border rounded ${p === currentPage ? "bg-foreground text-background" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button className="px-3 py-2 border rounded disabled:opacity-50" onClick={() => changePage(page + 1)} disabled={currentPage === totalPages}>{t(locale, "admin.products.list.next")}</button>
          </div>
          </>
        )}
      </section>
    </div>
  )
}
