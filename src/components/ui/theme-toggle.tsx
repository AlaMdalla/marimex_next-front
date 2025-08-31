"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeToggleProps = {
  mode?: "icon" | "label";
  className?: string;
};

export function ThemeToggle({ mode = "label", className }: ThemeToggleProps) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("theme");
      if (stored) setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const isDark = theme === "dark";

  if (mode === "icon") {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className={className}
      >
        <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
      </Button>
    );
  }

  return (
    <Button type="button" variant="outline" onClick={toggleTheme} className={className}>
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </Button>
  );
}
