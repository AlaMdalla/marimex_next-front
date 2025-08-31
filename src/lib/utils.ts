import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format a numeric price as Dinars. Keeps two decimals by default.
export function formatPrice(
  amount: number | string | null | undefined,
  opts: { maximumFractionDigits?: number; minimumFractionDigits?: number; locale?: string } = {}
): string {
  if (amount == null || amount === "") return "";
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount;
  if (!Number.isFinite(num)) return "";
  const { maximumFractionDigits = 2, minimumFractionDigits = 0, locale = "en-US" } = opts;
  const formatted = num.toLocaleString(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return `${formatted} Dinars`;
}
