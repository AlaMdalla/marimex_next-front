"use client"

import React from "react"

export type ProductMinimal = {
  id: string | number
  name: string
  price: number
  imageurl: string
  description?: string
}

export type CartItem = {
  marble: ProductMinimal
  count: number
}

type CartState = {
  items: CartItem[]
}

type CartContextValue = {
  items: CartItem[]
  totalCount: number
  totalPrice: number
  addItem: (marble: ProductMinimal, count?: number) => void
  removeItem: (marbleId: string | number) => void
  updateQuantity: (marbleId: string | number, count: number) => void
  clear: () => void
}

const CartContext = React.createContext<CartContextValue | undefined>(undefined)

const STORAGE_KEY = "Cart"

function loadFromStorage(): CartState {
  if (typeof window === "undefined") return { items: [] }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { items: [] }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed?.cartItems)) {
      // Accept Angular-like shape { cartItems: [{ marbel, count }], ... }
      const mapped = parsed.cartItems
        .map((i: any) =>
          i?.marbel
            ? ({ marble: i.marbel, count: Number(i.count) || 1 } as CartItem)
            : i?.marble
            ? ({ marble: i.marble, count: Number(i.count) || 1 } as CartItem)
            : null,
        )
        .filter(Boolean)
      return { items: mapped }
    }
    if (Array.isArray(parsed?.items)) return { items: parsed.items }
    return { items: [] }
  } catch {
    return { items: [] }
  }
}

function saveToStorage(state: CartState) {
  if (typeof window === "undefined") return
  // Save with a shape compatible with the Angular app: { cartItems, totalPrice, totalCount }
  const totalPrice = state.items.reduce((sum, i) => sum + i.marble.price * i.count, 0)
  const totalCount = state.items.reduce((sum, i) => sum + i.count, 0)
  const payload = {
    cartItems: state.items.map((i) => ({ marbel: i.marble, count: i.count })),
    totalPrice,
    totalCount,
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])

  // Hydrate from storage once
  React.useEffect(() => {
    const stored = loadFromStorage()
    setItems(stored.items)
  }, [])

  // Persist to storage
  React.useEffect(() => {
    saveToStorage({ items })
  }, [items])

  const addItem = React.useCallback((marble: ProductMinimal, count: number = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.marble.id === marble.id)
      if (idx >= 0) {
        const clone = [...prev]
        clone[idx] = { ...clone[idx], count: clone[idx].count + count }
        return clone
      }
      return [...prev, { marble, count }]
    })
  }, [])

  const removeItem = React.useCallback((marbleId: string | number) => {
    setItems((prev) => prev.filter((i) => i.marble.id !== marbleId))
  }, [])

  const updateQuantity = React.useCallback((marbleId: string | number, count: number) => {
    const newCount = Math.max(1, Math.floor(count || 0))
    setItems((prev) => prev.map((i) => (i.marble.id === marbleId ? { ...i, count: newCount } : i)))
  }, [])

  const clear = React.useCallback(() => setItems([]), [])

  const totalCount = items.reduce((sum, i) => sum + i.count, 0)
  const totalPrice = items.reduce((sum, i) => sum + i.marble.price * i.count, 0)

  const value: CartContextValue = {
    items,
    totalCount,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
