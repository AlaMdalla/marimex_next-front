"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"

export default function RegisterPage() {
  const { register, loading, error, user } = useAuth()
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")

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
          <h1 className="text-2xl font-semibold tracking-tight text-center">Create your account</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">It only takes a minute</p>
        </div>
        <div className="p-6 space-y-5">
          <form className="space-y-4" onSubmit={onSubmit} aria-disabled={alreadyLoggedIn}>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" type="text" placeholder="Your name" required value={name} onChange={(e) => setName(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Create a password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={alreadyLoggedIn} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm Password</Label>
              <Input id="confirm" type="password" placeholder="Repeat your password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={alreadyLoggedIn} />
              {password && confirm && password !== confirm ? (
                <p className="text-xs text-destructive">Passwords do not match</p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading || alreadyLoggedIn || password !== confirm}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground">
            Already have an account? {" "}
            <Link href="/login" className="underline underline-offset-4 hover:text-foreground">Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
