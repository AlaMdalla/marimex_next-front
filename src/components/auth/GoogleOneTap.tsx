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
        // Enable auto-select where possible; keep FedCM off for compatibility
        auto_select: true,
        use_fedcm_for_prompt: false,
        cancel_on_tap_outside: true,
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
      strategy="beforeInteractive"
      onLoad={() => setReady(true)}
    />
  )
}
