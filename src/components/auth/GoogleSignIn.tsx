"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Script from "next/script"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

declare global {
  interface Window {
    google?: any
  }
}

export function GoogleSignIn() {
  const { googleLogin, loading } = useAuth()
  const router = useRouter()
  const btnRef = useRef<HTMLDivElement | null>(null)
  const [scriptReady, setScriptReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
  // If the script was already loaded earlier in the app, mark ready immediately
  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.accounts?.id) {
      setScriptReady(true)
    }
  }, [])


  const onCredential = useCallback(
    async (response: any) => {
      const token = response?.credential as string | undefined
      if (!token) return
      try {
        await googleLogin(token)
        router.replace("/")
      } catch (e: any) {
        setErr(e?.response?.data?.message || e?.message || "Google sign-in failed")
      }
    },
    [googleLogin, router]
  )

  useEffect(() => {
    if (!scriptReady) return
    if (!clientId) {
      setErr("Missing NEXT_PUBLIC_GOOGLE_CLIENT_ID env var")
      return
    }

    let cancelled = false
    let timeoutId: number | undefined
    let resizeObserver: ResizeObserver | undefined

    const computeWidth = () => {
      const el = btnRef.current
      if (!el) return 320
      const container = el.parentElement || el
      const rect = container.getBoundingClientRect()
      const w = Math.max(240, Math.min(600, Math.round(rect.width)))
      return w
    }

    const render = (g: any) => {
      if (!btnRef.current) return
      // Clear previous renders before re-rendering
      btnRef.current.innerHTML = ""
      g.renderButton(btnRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        width: computeWidth(),
      })
    }

    const tryInit = () => {
      if (cancelled) return
      const g = window.google?.accounts?.id
      if (!g) {
        timeoutId = window.setTimeout(tryInit, 100)
        return
      }
      try {
        g.initialize({ client_id: clientId, callback: onCredential, use_fedcm_for_prompt: false })
        render(g)
        // Re-render on container resize to fit width
        if (btnRef.current && "ResizeObserver" in window) {
          resizeObserver = new ResizeObserver(() => render(g))
          resizeObserver.observe(btnRef.current.parentElement || btnRef.current)
        }
      } catch (e: any) {
        setErr(e?.message || "Failed to initialize Google Sign-In")
      }
    }

    tryInit()

    return () => {
      cancelled = true
      if (timeoutId) window.clearTimeout(timeoutId)
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [scriptReady, clientId, onCredential])

  return (
    <div className="space-y-3">
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <div ref={btnRef} className="w-full" aria-busy={loading} aria-label="Sign in with Google" />
      {err ? <p className="text-sm text-red-600" role="alert">{err}</p> : null}
    </div>
  )
}
