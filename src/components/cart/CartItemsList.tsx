"use client"

import Image from "next/image"
import { Minus, Plus, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { t, type Locale } from "@/i18n"
import type { CartItem } from "@/types/cart"

function mapNumberLocale(locale: Locale) {
  return locale === "fr" ? "fr-FR" : locale === "tn" ? "ar-TN" : locale === "it" ? "it-IT" : locale === "zh" ? "zh-CN" : "en-US"
}

export function CartItemsList({
  locale,
  items,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  locale: Locale
  items: CartItem[]
  onIncrease: (item: CartItem) => void
  onDecrease: (item: CartItem) => void
  onRemove: (item: CartItem) => void
}) {
  const numberLocale = mapNumberLocale(locale)
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{t(locale, "cart.itemsTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id}>
            <div className="flex gap-4 p-4 bg-muted rounded-lg">
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={item.marble.imageurl} alt={item.marble.name} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1">{item.marble.name}</h3>
                <p className="text-muted-foreground mb-3">
                  {formatPrice(item.marble.price, { locale: numberLocale })} {t(locale, "cart.perUnit")}
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="icon" onClick={() => onDecrease(item)} disabled={item.count <= 1} className="h-8 w-8 rounded-r-none">
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">{item.count}</span>
                    <Button variant="ghost" size="icon" onClick={() => onIncrease(item)} className="h-8 w-8 rounded-l-none">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-lg font-bold">{formatPrice(item.marble.price * item.count, { locale: numberLocale })}</span>
                <Button variant="ghost" size="icon" onClick={() => onRemove(item)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {index < items.length - 1 && <Separator className="bg-border" />}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
