"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu"

import { t, type Locale } from "@/i18n";
import { getClientLocale, setClientLocale } from "@/i18n/client";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navItems = (locale: Locale) => ([
  { href: "/products", label: t(locale, "common.products") },
  { href: "/about", label: t(locale, "nav.about") },
  { href: "/contact", label: t(locale, "nav.contact") },
]);

export function Header() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)
  const [locale, setLocale] = React.useState<Locale>("en")
  const [langOpen, setLangOpen] = React.useState(false)
  const { totalCount } = useCart()
  const { user } = useAuth()

  React.useEffect(() => {
    setLocale(getClientLocale())
  }, [])

  const items = navItems(locale)

  const allLocales: { code: Locale; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "🇬🇧" },
    { code: "fr", label: "Français", flag: "🇫🇷" },
    { code: "tn", label: "تونسي", flag: "🇹🇳" },
    { code: "it", label: "Italiano", flag: "🇮🇹" },
    { code: "zh", label: "中文", flag: "🇨🇳" },
  ]

  function selectLocale(next: Locale) {
    setClientLocale(next)
    setLocale(next)
    setLangOpen(false)
    // refresh so server components (html lang, server pages) use new locale
    window.location.reload()
  }

  function localeFlag(loc: Locale) {
    switch (loc) {
      case "fr":
        return "🇫🇷";
      case "tn":
        return "🇹🇳";
      case "it":
        return "🇮🇹";
      case "zh":
        return "🇨🇳";
      case "en":
      default:
        return "🇬🇧";
    }
  }

  return (
  <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto h-16 max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center">
        {/* Mobile Bar */}
        <div className="flex w-full items-center justify-between md:hidden">
          {/* Left: Burger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-accent hover:text-accent-foreground rounded-full"
                aria-label="Open menu"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-80 bg-background/95 backdrop-blur-xl border-r border-border/50"
            >
              <SheetTitle className="sr-only">Main navigation</SheetTitle>
              {/* Mobile Logo */}
              <div className="flex items-center gap-3 pb-6 border-b border-border/50">
                <Image src="/images/marimex.jpg" alt="Marimex logo" width={32} height={32} className="rounded-lg" />
                <span className="text-lg font-bold">{t(locale, "brand")}</span>
              </div>
              {/* Mobile Navigation */}
              <nav className="mt-6 flex flex-col space-y-2">
                {items.map((item) => {
                  const active = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center px-4 py-3 text-base font-medium rounded-xl transition-colors ${active ? "bg-accent text-accent-foreground shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                    >
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              {/* Mobile Footer */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="text-xs text-muted-foreground text-center">© 2025 Marimex</div>
              </div>
            </SheetContent>
          </Sheet>
          {/* Center: Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image src="/images/marimex.jpg" alt="Marimex logo" width={32} height={32} className="rounded-lg" />
            <span className="text-base font-bold">{t(locale, "brand")}</span>
          </Link>
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {user ? (
              <Link href="/profile" aria-label="Profile">
                <div className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-bold uppercase">
                  {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                </div>
              </Link>
            ) : (
              <Link href="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label="Open cart">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 min-w-[1.1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                  {totalCount}
                </span>
              )}
            </Link>
            <ThemeToggle mode="icon" />
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setLangOpen((v) => !v)}
                aria-haspopup="listbox"
                aria-expanded={langOpen}
                aria-label={`Select language (current: ${locale.toUpperCase()})`}
                className="inline-flex items-center justify-center"
              >
                <span className="text-lg leading-none">{localeFlag(locale)}</span>
              </Button>
              {langOpen && (
                <div role="listbox" tabIndex={-1} className="absolute right-0 mt-2 w-44 max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md z-50">
                  {allLocales.map((l) => (
                    <button key={l.code} role="option" aria-selected={locale === l.code} onClick={() => selectLocale(l.code)} className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-accent hover:text-accent-foreground ${locale === l.code ? "bg-accent/50" : ""}`}>
                      <span className="text-lg leading-none">{l.flag}</span>
                      <span className="text-sm font-medium">{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex w-full items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-105 duration-200">
            <div className="relative">
              <Image src="/images/marimex.jpg" alt="Marimex logo" width={40} height={40} className="rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200" priority />
            </div>
            <span className="text-xl font-bold text-foreground">{t(locale, "brand")}</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu>
            <NavigationMenuList className="flex items-center gap-2">
              {items.map((item) => {
                const active = pathname === item.href
                return (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} aria-current={active ? "page" : undefined} className={`relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        {item.label}
                        {active && <span className="absolute bottom-0 left-1/2 h-0.5 w-6 -translate-x-1/2 bg-foreground rounded-full" />}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )
              })}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Auth + Cart + Language */}
          <div className="flex items-center gap-3">
          {user ? (
            <Link href="/profile" className="relative" aria-label="Profile">
              <div className="h-9 w-9 rounded-full bg-foreground text-background flex items-center justify-center font-bold uppercase">
                {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
              </div>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label="Open cart">
              <ShoppingCart className="h-5 w-5" />
            </Button>
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 min-w-[1.1rem] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                {totalCount}
              </span>
            )}
          </Link>
          <ThemeToggle mode="icon" />
          <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLangOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={langOpen}
            aria-label={`Select language (current: ${locale.toUpperCase()})`}
            className="inline-flex items-center gap-2"
          >
            <span className="text-lg leading-none">{localeFlag(locale)}</span>
            <span className="font-medium">{locale.toUpperCase()}</span>
          </Button>
          {langOpen && (
            <div
              role="listbox"
              tabIndex={-1}
              className="absolute right-0 mt-2 w-44 max-h-60 overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md z-50"
              onMouseLeave={() => setLangOpen(false)}
            >
              {allLocales.map((l) => (
                <button
                  key={l.code}
                  role="option"
                  aria-selected={locale === l.code}
                  onClick={() => selectLocale(l.code)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-accent hover:text-accent-foreground ${
                    locale === l.code ? "bg-accent/50" : ""
                  }`}
                >
                  <span className="text-lg leading-none">{l.flag}</span>
                  <span className="text-sm font-medium">{l.label}</span>
                </button>
              ))}
            </div>
          )}
          </div>
          </div>
        </div>
      </div>
    </header>
  )
}