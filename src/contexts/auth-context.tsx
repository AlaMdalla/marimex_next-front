"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import axios from "axios"
import type { IUserLogin, IUserRegister, User } from "@/types/auth"
import { loginApi, registerApi, googleLoginApi } from "@/services/auth"
import { toast } from "@/components/ui/toast"

type AuthContextType = {
  user: User | null
  initialized: boolean
  loading: boolean
  error: string | null
  login: (payload: IUserLogin) => Promise<User>
  register: (payload: IUserRegister) => Promise<User>
  googleLogin: (token: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = "USER"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return
      // Prefer new key
      let raw = localStorage.getItem(STORAGE_KEY)
      // Migrate from legacy key "User" if present
      if (!raw) {
        const legacy = localStorage.getItem("User")
        if (legacy) {
          raw = legacy
          // copy to new key and remove old
          localStorage.setItem(STORAGE_KEY, legacy)
          localStorage.removeItem("User")
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw) as User
        setUser(parsed)
        if (parsed?.token) {
          axios.defaults.headers.common["Authorization"] = `Bearer ${parsed.token}`
        }
      }
  setInitialized(true)
    } catch {
      // ignore parse errors
  setInitialized(true)
    }
  }, [])

  // Persist to localStorage whenever user changes
  useEffect(() => {
    if (typeof window === "undefined") return
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      if (user.token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`
      }
    } else {
      localStorage.removeItem(STORAGE_KEY)
      // Also remove legacy key if it exists
      localStorage.removeItem("User")
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [user])

  const login = useCallback(async (payload: IUserLogin) => {
    setLoading(true)
    setError(null)
    try {
      const u = await loginApi(payload)
      setUser(u)
  toast.success(`Welcome back ${u.name}!`, "Login Successful")
      return u
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "Login failed"
      setError(message)
  toast.error(message, "Login Failed")
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (payload: IUserRegister) => {
    setLoading(true)
    setError(null)
    try {
      const u = await registerApi(payload)
      setUser(u)
  toast.success(`Welcome to Marimex ${u.name}!`, "Register Successful")
      return u
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "Register failed"
      setError(message)
  toast.error(message, "Register Failed")
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const googleLogin = useCallback(async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const u = await googleLoginApi(token)
      setUser(u)
  toast.success(`Welcome ${u.name}!`, "Login Successful")
      return u
    } catch (e: any) {
      const message = e?.response?.data?.message || e?.message || "Google login failed"
      setError(message)
  toast.error(message, "Google Login Failed")
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  const value = useMemo(
  () => ({ user, initialized, loading, error, login, register, googleLogin, logout }),
  [user, initialized, loading, error, login, register, googleLogin, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
