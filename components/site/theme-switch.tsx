"use client"

import { useEffect, useSyncExternalStore } from "react"

import { Toggle } from "@/components/ui/toggle"
import { THEMES, THEME_KEY, type Theme } from "@/lib/theme"

const CHANGE = "themechange"
const LIGHT = "(prefers-color-scheme: light)"

function read(): Theme {
  try {
    const stored = localStorage.getItem(THEME_KEY)
    return stored === "light" || stored === "dark" ? stored : "system"
  } catch {
    return "system"
  }
}

function apply(theme: Theme) {
  const resolved =
    theme === "system"
      ? window.matchMedia(LIGHT).matches
        ? "light"
        : "dark"
      : theme
  document.documentElement.dataset.theme = resolved
}

function set(theme: Theme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_KEY)
    else localStorage.setItem(THEME_KEY, theme)
  } catch {
    // storage unavailable: the choice still applies for this page view
  }
  apply(theme)
  window.dispatchEvent(new Event(CHANGE))
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange)
  window.addEventListener("storage", onChange)
  return () => {
    window.removeEventListener(CHANGE, onChange)
    window.removeEventListener("storage", onChange)
  }
}

/** Theme choice: follow the OS, or force dark or light. Stored per browser. */
export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, read, () => "system" as Theme)

  // keep "system" in step with the OS, and other tabs in step with this one
  useEffect(() => {
    apply(theme)
    if (theme !== "system") return
    const media = window.matchMedia(LIGHT)
    const onChange = () => apply("system")
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [theme])

  return (
    <div
      role="group"
      aria-label="Theme"
      className="flex flex-wrap items-center gap-2"
    >
      {THEMES.map((option) => (
        <Toggle
          key={option}
          pressed={option === theme}
          onPressedChange={() => set(option)}
        >
          {option}
        </Toggle>
      ))}
    </div>
  )
}
