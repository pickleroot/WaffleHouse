import * as React from "react"

export type FontTheme = "minimal" | "classic" | "mono" | "analog" | "custom"
export type ColorTheme = "neutral" | "blue" | "green" | "rose" | "amber"
export type ThemeMode = "light" | "dark"

export type ThemeSettings = {
    fontTheme: FontTheme
    customFontFamily: string
    colorTheme: ColorTheme
    mode: ThemeMode
}

export type ThemeContextValue = ThemeSettings & {
    setFontTheme: (theme: FontTheme) => void
    setCustomFontFamily: (fontFamily: string) => void
    setColorTheme: (theme: ColorTheme) => void
    setMode: (mode: ThemeMode) => void
    toggleMode: () => void
}

export const FONT_THEME_OPTIONS: Array<{ value: FontTheme; label: string }> = [
    { value: "minimal", label: "Minimal" },
    { value: "classic", label: "Classic" },
    { value: "mono", label: "Mono" },
    { value: "analog", label: "Analog" },
    { value: "custom", label: "Custom" },
]

export const COLOR_THEME_OPTIONS: Array<{
    value: ColorTheme
    label: string
    swatch: string
}> = [
    { value: "neutral", label: "Neutral", swatch: "oklch(0.205 0 0)" },
    { value: "blue", label: "Blue", swatch: "oklch(0.55 0.18 255)" },
    { value: "green", label: "Green", swatch: "oklch(0.52 0.15 150)" },
    { value: "rose", label: "Rose", swatch: "oklch(0.58 0.22 20)" },
    { value: "amber", label: "Amber", swatch: "oklch(0.68 0.16 80)" },
]

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    fontTheme: "minimal",
    customFontFamily: "",
    colorTheme: "neutral",
    mode: "light",
}

export const ThemeContext =
    React.createContext<ThemeContextValue | null>(null)

export function useThemeSettings() {
    const context = React.useContext(ThemeContext)

    if (!context) {
        throw new Error("useThemeSettings must be used within ThemeProvider")
    }

    return context
}
