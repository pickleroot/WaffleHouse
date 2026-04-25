import * as React from "react"

import {
    COLOR_THEME_OPTIONS,
    DEFAULT_THEME_SETTINGS,
    FONT_THEME_OPTIONS,
    ThemeContext,
    type ColorTheme,
    type FontTheme,
    type ThemeContextValue,
    type ThemeMode,
    type ThemeSettings,
} from "@/components/theme/theme"

const STORAGE_KEY = "wafflehouse-theme-settings"

function isFontTheme(value: unknown): value is FontTheme {
    return FONT_THEME_OPTIONS.some((option) => option.value === value)
}

function isColorTheme(value: unknown): value is ColorTheme {
    return COLOR_THEME_OPTIONS.some((option) => option.value === value)
}

function isThemeMode(value: unknown): value is ThemeMode {
    return value === "light" || value === "dark"
}

function getCustomFontFamily(value: unknown): string {
    return typeof value === "string" ? value.trim() : ""
}

function getInitialSettings(): ThemeSettings {
    if (typeof window === "undefined") return DEFAULT_THEME_SETTINGS

    try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (!stored) return DEFAULT_THEME_SETTINGS

        const parsed = JSON.parse(stored) as Partial<ThemeSettings>

        return {
            fontTheme: isFontTheme(parsed.fontTheme)
                ? parsed.fontTheme
                : DEFAULT_THEME_SETTINGS.fontTheme,
            customFontFamily: getCustomFontFamily(parsed.customFontFamily),
            colorTheme: isColorTheme(parsed.colorTheme)
                ? parsed.colorTheme
                : DEFAULT_THEME_SETTINGS.colorTheme,
            mode: isThemeMode(parsed.mode)
                ? parsed.mode
                : DEFAULT_THEME_SETTINGS.mode,
        }
    } catch {
        return DEFAULT_THEME_SETTINGS
    }
}

function applyTheme(settings: ThemeSettings) {
    const root = document.documentElement

    root.classList.toggle("dark", settings.mode === "dark")
    root.dataset.fontTheme = settings.fontTheme
    root.dataset.colorTheme = settings.colorTheme

    if (settings.fontTheme === "custom" && settings.customFontFamily) {
        root.style.setProperty("--app-font-family", settings.customFontFamily)
    } else {
        root.style.removeProperty("--app-font-family")
    }
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = React.useState<ThemeSettings>(getInitialSettings)

    React.useEffect(() => {
        applyTheme(settings)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    }, [settings])

    const value = React.useMemo<ThemeContextValue>(
        () => ({
            ...settings,
            setFontTheme: (fontTheme) =>
                setSettings((current) => ({ ...current, fontTheme })),
            setCustomFontFamily: (customFontFamily) =>
                setSettings((current) => ({
                    ...current,
                    customFontFamily,
                })),
            setColorTheme: (colorTheme) =>
                setSettings((current) => ({ ...current, colorTheme })),
            setMode: (mode) => setSettings((current) => ({ ...current, mode })),
            toggleMode: () =>
                setSettings((current) => ({
                    ...current,
                    mode: current.mode === "dark" ? "light" : "dark",
                })),
        }),
        [settings]
    )

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
