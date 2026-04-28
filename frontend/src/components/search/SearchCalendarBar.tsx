import { useState, useRef, useEffect } from "react";
import type { Mode } from "@/lib/types";
import { cn, formatSemester, sortSemestersDescending } from "@/lib/utils";
import { getSemesters } from "@/services/search"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import type { SearchParams } from "@/hooks/useCourseSearch"


interface SearchCalendarBarProps {
  hasSearched: boolean;
  setHasSearched: (value: boolean) => void;
  setSearchParams: (params: SearchParams) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

// Fallback list if the database call fails or returns nothing.
const FALLBACK_SEMESTERS = [
    "2026_Spring",
    "2025_Fall",
    "2025_Summer",
    "2025_Spring",
    "2024_Fall",
];

export default function SearchCalendarBar({ hasSearched, setHasSearched, setSearchParams, mode, setMode }: SearchCalendarBarProps) {
    const [query, setQuery] = useState("")
    const [semesters, setSemesters] = useState<string[]>([])
    const [selectedSemester, setSelectedSemester] = useState<string>("")
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input when switching to search mode
    useEffect(() => {
        if (mode === "search") {
            const timer = setTimeout(() => inputRef.current?.focus(), 50)
            return () => clearTimeout(timer)
        }
    }, [mode])

    // Load semesters once on mount; default to the most recent.
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const fetched = await getSemesters();
                const sorted = sortSemestersDescending(fetched.length > 0 ? fetched : FALLBACK_SEMESTERS);
                if (cancelled) return;
                setSemesters(sorted);
                if (sorted.length > 0) setSelectedSemester(sorted[0]);
            } catch (err) {
                console.error("Failed to load semesters:", err);
                const sorted = sortSemestersDescending(FALLBACK_SEMESTERS);
                if (cancelled) return;
                setSemesters(sorted);
                setSelectedSemester(sorted[0]);
            }
        })();
        return () => { cancelled = true; };
    }, [])

    // Live search: update server-backed search params as the user types.
    useEffect(() => {
        if (mode !== "search") return;

        const trimmedQuery = query.trim();
        if (!trimmedQuery) {
            setHasSearched(false);
            setSearchParams({ kind: "search", query: "", semester: selectedSemester || null });
            return;
        }

        const timer = setTimeout(() => {
            setSearchParams({ kind: "search", query: trimmedQuery, semester: selectedSemester || null });
            setHasSearched(true);
        }, 250);

        return () => clearTimeout(timer);
    }, [mode, query, selectedSemester, setHasSearched, setSearchParams]);

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        // Prevent full-page submit; live search is handled by the effect above.
        e.preventDefault();
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <form
                onSubmit={handleSearch}
                className="pointer-events-auto mt-10 flex items-center gap-3"
            >
                {/*
                  Semester selector — sits to the left of the search/calendar toggle.
                  Always visible so the user knows which semester they are searching in.
                */}
                <NativeSelect
                    size="sm"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    aria-label="Semester"
                    disabled={semesters.length === 0}
                >
                    {semesters.map((s) => (
                        <NativeSelectOption key={s} value={s}>
                            {formatSemester(s)}
                        </NativeSelectOption>
                    ))}
                </NativeSelect>

                {/*
                  Single container with border-b-2.
                  The underline shrinks/grows as content inside transitions.
                */}
                <div
                    className={cn(
                        "flex items-center border-b-2 transition-all duration-300 ease-in-out",
                        mode === "search"
                            ? "border-primary/40 focus-within:border-primary"
                            : "border-primary"
                    )}
                >
                    {/*
                      "Search" text label — visible in calendar mode.
                      In search mode it collapses to width 0 and fades out.
                    */}
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            mode === "calendar"
                                ? "max-w-24 opacity-100"
                                : "max-w-0 opacity-0"
                        )}
                    >
                        <button
                            type="button"
                            onClick={() => setMode("search")}
                            className={cn(
                                "text-sm font-medium pb-1 whitespace-nowrap",
                                "text-muted-foreground hover:text-foreground",
                                "cursor-pointer transition-colors duration-200"
                            )}
                        >
                            Search
                        </button>
                    </div>

                    {/*
                      Search input — visible in search mode.
                      In calendar mode it collapses to width 0 and fades out.
                    */}
                    {/* TODO: Disable search bar after search. Add button for "New search" */}
                    <div
                        className={cn(
                            "overflow-hidden transition-all duration-300 ease-in-out",
                            mode === "search"
                                ? "w-80 opacity-100"
                                : "w-0 opacity-0"
                        )}
                    >
                        <input
                            ref={inputRef}
                            type="search"
                            placeholder="Search courses..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={cn(
                                "w-80 bg-transparent border-0 outline-none",
                                "text-sm py-1 px-1",
                                "placeholder:text-muted-foreground/50",
                                "[&::-webkit-search-cancel-button]:appearance-none"
                            )}
                        />
                    </div>

                    {/* Animated spacer */}
                    <div
                        className={cn(
                            "transition-all duration-300 ease-in-out",
                            mode === "calendar" ? "w-6" : "w-4"
                        )}
                    />

                    {/*
                      "Calendar" button — always visible.
                      Color changes based on mode.
                    */}
                    <button
                        type="button"
                        onClick={() => setMode("calendar")}
                        className={cn(
                            "text-sm font-medium pb-1 whitespace-nowrap",
                            "transition-colors duration-300 ease-in-out",
                            mode === "calendar"
                                ? "text-primary cursor-default"
                                : "text-muted-foreground hover:text-foreground cursor-pointer"
                        )}
                    >
                        Calendar
                    </button>
                </div>

                <button type="submit" hidden />
            </form>
        </div>
    );
}
