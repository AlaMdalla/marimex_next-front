"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { t, type Locale } from "@/i18n"
import { getClientLocale } from "@/i18n/client"

export default function RegisterPage() {
  const { register, loading, error, user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [locale, setLocale] = useState<Locale>("en")

  useEffect(() => {
    setLocale(getClientLocale())
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return
    try {
      await register({ name, email, password, ConfirmPassword: confirm })
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
          <h1 className="text-2xl font-semibold tracking-tight text-center">{t(locale, "auth.register.title")}</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">{t(locale, "auth.register.subtitle")}</p>
        </div>
        <div className="p-6 space-y-5">
          <form className="space-y-4" onSubmit={onSubmit} aria-disabled={alreadyLoggedIn}>
            <div className="space-y-2">
              <Label htmlFor="name">{t(locale, "auth.fields.name")}</Label>
              <Input id="name" type="text" placeholder={t(locale, "auth.placeholders.name")} required value={name} onChange={(e) => setName(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t(locale, "auth.fields.email")}</Label>
              <Input id="email" type="email" placeholder={t(locale, "auth.placeholders.email")} required value={email} onChange={(e) => setEmail(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t(locale, "auth.fields.password")}</Label>
              <Input id="password" type="password" placeholder={t(locale, "auth.placeholders.password")} required value={password} onChange={(e) => setPassword(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">{t(locale, "auth.fields.confirmPassword")}</Label>
              <Input id="confirm" type="password" placeholder={t(locale, "auth.placeholders.confirmPassword")} required value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={alreadyLoggedIn} />
              {password && confirm && password !== confirm ? (
                <p className="text-xs text-destructive">{t(locale, "auth.errors.passwordMismatch")}</p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading || alreadyLoggedIn || password !== confirm}>
              {loading ? t(locale, "auth.register.loading") : t(locale, "auth.register.submit")}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            {t(locale, "auth.register.haveAccount")} {" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">{t(locale, "auth.common.login")}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
