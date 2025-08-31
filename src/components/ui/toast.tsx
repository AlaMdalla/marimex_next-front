"use client"

import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"

type Variant = "default" | "success" | "error"

type ToastItem = {
  id: number
  title?: string
  message: string
  variant: Variant
  duration?: number
}

type ToastInput = Omit<ToastItem, "id"> & { id?: number }

let externalAdd: ((t: ToastInput) => void) | null = null

export const toast = Object.assign(
  (input: ToastInput) => {
    externalAdd?.(input)
  },
  {
    success(message: string, title?: string, duration = 4000) {
      externalAdd?.({ message, title, variant: "success", duration })
    },
    error(message: string, title?: string, duration = 5000) {
      externalAdd?.({ message, title, variant: "error", duration })
    },
    show(message: string, title?: string, duration = 3500) {
      externalAdd?.({ message, title, variant: "default", duration })
    },
  }
)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const idRef = useRef(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
  setMounted(true)
    externalAdd = (input: ToastInput) => {
      const id = input.id ?? idRef.current++
      const item: ToastItem = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant ?? "default",
        duration: input.duration ?? 3500,
      }
      setToasts((prev) => [...prev, item])
      if (item.duration && item.duration > 0) {
        window.setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id))
        }, item.duration)
      }
    }
    return () => {
      externalAdd = null
    }
  }, [])

  return (
    <>
      {children}
      {mounted && typeof document !== "undefined"
        ? createPortal(
            <div className="pointer-events-none fixed top-4 right-4 z-[60] flex w-auto max-w-sm flex-col gap-2">
              {toasts.map((t) => (
                <div
                  key={t.id}
                  className={cn(
                    "pointer-events-auto rounded-lg border p-4 shadow-md bg-card text-card-foreground",
                    t.variant === "success" && "border-green-500/40 bg-green-500/10",
                    t.variant === "error" && "border-red-500/40 bg-red-500/10"
                  )}
                  role="status"
                  aria-live="polite"
                >
                  {t.title ? (
                    <div className="mb-1 text-sm font-semibold">
                      {t.title}
                    </div>
                  ) : null}
                  <div className="text-sm text-foreground/90">{t.message}</div>
                </div>
              ))}
            </div>,
            document.body
          )
        : null}
    </>
  )
}
