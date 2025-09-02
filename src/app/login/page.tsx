"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { GoogleSignIn } from "@/components/auth/GoogleSignIn"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

export default function LoginPage() {
  const { login, logout, loading, error, user } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    setLocale(getClientLocale())
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login({ email, password })
      router.push("/")
    } catch {
      // error is surfaced via context state
    }
  }

  const alreadyLoggedIn = Boolean(user)

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border bg-card text-card-foreground shadow-sm">
        <div className="px-6 pt-6">
          <h1 className="text-2xl font-semibold tracking-tight text-center">{t(locale, "auth.login.title")}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t(locale, "auth.login.subtitle")}</p>
        </div>
        <div className="p-6 space-y-5">
        {alreadyLoggedIn && (
          <div className="rounded border p-3 text-sm bg-accent text-accent-foreground">
            {t(locale, "auth.login.alreadySigned")}
            <div className="mt-3 flex gap-2">
              <Button variant="outline" onClick={() => router.push("/")}>{t(locale, "auth.common.goHome")}</Button>
              <Button variant="destructive" onClick={() => logout()}>{t(locale, "auth.common.logout")}</Button>
            </div>
          </div>
        )}
        <form className="space-y-4" onSubmit={onSubmit} aria-disabled={alreadyLoggedIn}>
          <div className="space-y-2">
            <Label htmlFor="email">{t(locale, "auth.fields.email")}</Label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground">@</span>
              <Input className="pl-8" id="email" type="email" placeholder={t(locale, "auth.placeholders.email")} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t(locale, "auth.fields.password")}</Label>
            <Input id="password" type="password" placeholder={t(locale, "auth.placeholders.password")} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={alreadyLoggedIn} />
          </div>
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || alreadyLoggedIn}>{loading ? t(locale, "auth.login.loading") : t(locale, "auth.common.login")}</Button>
        </form>
        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">{t(locale, "auth.common.or")}</span>
          </div>
        </div>
  {!alreadyLoggedIn && <GoogleSignIn />}
        {!alreadyLoggedIn && (
          <p className="text-sm text-center text-muted-foreground">
            {t(locale, "auth.login.noAccount")} {" "}
            <Link href="/register" className="underline underline-offset-4 hover:text-foreground">{t(locale, "auth.common.register")}</Link>
          </p>
        )}
        </div>
      </div>
    </div>
  )
}
