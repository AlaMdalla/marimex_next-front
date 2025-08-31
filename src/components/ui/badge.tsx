import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  const variants: Record<NonNullable<BadgeProps["variant"]>, string> = {
    default: "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900",
    secondary: "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-100",
    outline: "border border-neutral-300 text-neutral-800 dark:border-neutral-700 dark:text-neutral-200",
    destructive: "bg-red-600 text-white",
  };

  return <span className={cn(base, variants[variant], className)} {...props} />;
}
