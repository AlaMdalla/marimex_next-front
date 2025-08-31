"use client"

import React, { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, initialized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!initialized) return
    if (!user || !user.isAdmin) {
      const next = encodeURIComponent(pathname || "/admin")
      router.replace(`/login?next=${next}`)
    }
  }, [initialized, user, router, pathname])

  if (!initialized) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Checking admin access…</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) return null

  return <>{children}</>
}
