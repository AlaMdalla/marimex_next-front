"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const { user, initialized, logout } = useAuth()
  const router = useRouter()

  // Redirect after render to avoid updating Router during render
  useEffect(() => {
    if (!initialized) return
    if (!user) router.replace("/login")
  }, [initialized, user, router])

  if (!initialized) return null
  if (!user) return null

  return (
    <div className="max-w-xl mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="rounded border p-4 space-y-2">
        <div><span className="font-medium">Name:</span> {user.name}</div>
        <div><span className="font-medium">Email:</span> {user.email}</div>
        <div><span className="font-medium">Admin:</span> {user.isAdmin ? "Yes" : "No"}</div>
      </div>
      <div className="mt-6 flex gap-3">
        <Button variant="outline" onClick={() => router.push("/")}>Home</Button>
        <Button variant="destructive" onClick={() => { logout(); router.push("/login") }}>Logout</Button>
      </div>
    </div>
  )
} 
