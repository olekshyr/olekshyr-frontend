export const THEMES = ["system", "dark", "light"] as const
export type Theme = (typeof THEMES)[number]

export const THEME_KEY = "theme"

/**
 * Runs in <head> before first paint: resolves the stored preference (or the
 * OS setting for "system") to `data-theme="dark|light"` on <html>, so the page
 * never flashes the wrong theme. Without JS the page stays dark, the default.
 */
export const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_KEY}");var l=matchMedia("(prefers-color-scheme: light)").matches;document.documentElement.dataset.theme=t==="light"||t==="dark"?t:l?"light":"dark"}catch(e){}})()`
