"use client";

import type { Locale } from "./index";

const COOKIE_NAME = "locale";

export function getClientLocale(): Locale {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return (value === "fr" || value === "en" || value === "tn" || value === "it" || value === "zh") ? (value as Locale) : "en";
}

export function setClientLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  // 1 year expiry
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(locale)}; Path=/; Max-Age=${maxAge}`;
}
