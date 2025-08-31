"use client"

import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"
import { ShoppingCart } from "lucide-react"
import { t, type Locale } from "@/i18n"

type Props = {
  product: { id: string | number; name: string; price: number; imageurl: string; description?: string }
  locale: Locale
  size?: "sm" | "default" | "lg"
}

export function AddToCartButton({ product, locale, size = "lg" }: Props) {
  const { addItem } = useCart()
  return (
    <Button size={size} className="h-12" onClick={() => addItem(product, 1)}>
      <ShoppingCart className="h-5 w-5 mr-2" />
      {t(locale, "common.addToCart")}
    </Button>
  )
}
