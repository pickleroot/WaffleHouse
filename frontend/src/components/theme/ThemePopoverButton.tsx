import { CheckIcon, MoonIcon, PaletteIcon, SunIcon } from "lucide-react"

import {
    COLOR_THEME_OPTIONS,
    FONT_THEME_OPTIONS,
    type ColorTheme,
    type FontTheme,
    useThemeSettings,
} from "@/components/theme/theme"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    NativeSelect,
    NativeSelectOption,
} from "@/components/ui/native-select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export default function ThemePopoverButton() {
    const {
        fontTheme,
        customFontFamily,
        colorTheme,
        mode,
        setFontTheme,
        setCustomFontFamily,
        setColorTheme,
        setMode,
    } = useThemeSettings()
    const isDark = mode === "dark"

    return (
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Theme settings"
                        >
                            <PaletteIcon />
                        </Button>
                    </PopoverTrigger>
                </TooltipTrigger>
                <TooltipContent>Theme settings</TooltipContent>
            </Tooltip>

            <PopoverContent align="end" className="space-y-4">
                <div className="space-y-1">
                    <h2 className="text-sm font-medium leading-none">Appearance</h2>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="font-theme">Font/style</Label>
                    <NativeSelect
                        id="font-theme"
                        value={fontTheme}
                        onChange={(event) =>
                            setFontTheme(event.target.value as FontTheme)
                        }
                        className="min-w-60"
                    >
                        {FONT_THEME_OPTIONS.map((option) => (
                            <NativeSelectOption
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </NativeSelectOption>
                        ))}
                    </NativeSelect>
                </div>

                {fontTheme === "custom" && (
                    <div className="space-y-2">
                        <Label htmlFor="custom-font">Local font</Label>
                        <Input
                            id="custom-font"
                            value={customFontFamily}
                            onChange={(event) =>
                                setCustomFontFamily(event.target.value)
                            }
                            placeholder='Aptos, "IBM Plex Sans"'
                            className="min-w-60"
                        />
                    </div>
                )}

                <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex items-center gap-2">
                        {COLOR_THEME_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                aria-label={`${option.label} color theme`}
                                aria-pressed={colorTheme === option.value}
                                title={option.label}
                                onClick={() =>
                                    setColorTheme(option.value as ColorTheme)
                                }
                                className={cn(
                                    "relative flex size-8 items-center justify-center rounded-full border border-border shadow-xs outline-none transition hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50",
                                    colorTheme === option.value &&
                                        "ring-2 ring-ring ring-offset-2 ring-offset-background"
                                )}
                                style={{ backgroundColor: option.swatch }}
                            >
                                {colorTheme === option.value && (
                                    <CheckIcon
                                        className={cn(
                                            "size-4",
                                            option.value === "amber"
                                                ? "text-black"
                                                : "text-white"
                                        )}
                                    />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-between rounded-md border px-3 py-2">
                    <Label htmlFor="dark-mode" className="gap-2">
                        {isDark ? <MoonIcon /> : <SunIcon />}
                        Dark mode
                    </Label>
                    <Switch
                        id="dark-mode"
                        checked={isDark}
                        onCheckedChange={(checked) =>
                            setMode(checked ? "dark" : "light")
                        }
                        aria-label="Toggle dark mode"
                    />
                </div>
            </PopoverContent>
        </Popover>
    )
}
