"use client"

import { useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

declare global {
  interface Window {
    google?: any
  }
}

// Lightweight, global One Tap SSO. Loads early and prompts when possible.
export function GoogleOneTap() {
  const { user, googleLogin } = useAuth()
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const prompted = useRef(false)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const isProd = typeof window === "undefined" ? Boolean(siteUrl && !siteUrl.includes("localhost")) : window.location.hostname.endsWith("marimexste.com")

  // If script already present (e.g., from other components), mark ready
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) setReady(true)
  }, [])

  useEffect(() => {
    if (user) return // don't prompt when signed in
    if (!ready || !clientId) return
    if (prompted.current) return
    // Only in top-level browsing context
    if (typeof window !== "undefined" && window.top !== window.self) return

    const g = window.google?.accounts?.id
    if (!g) return

    try {
      g.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const token = response?.credential as string | undefined
          if (!token) return
          try {
            await googleLogin(token)
            router.replace("/")
          } catch {
            // Ignore; user can use button fallback on /login
          }
        },
        // Enable auto-select where possible
        auto_select: true,
        // Prefer FedCM in production; fallback off in dev for compatibility
        use_fedcm_for_prompt: isProd,
        cancel_on_tap_outside: true,
        // Enable Safari ITP support if available (ignored if unsupported)
        itp_support: true as any,
      })
      prompted.current = true
      g.prompt()
    } catch {
      // swallow
    }
  }, [ready, clientId, googleLogin, router, user])

  return (
    <Script
      id="google-one-tap"
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setReady(true)}
    />
  )
}
