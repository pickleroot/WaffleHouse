import { useState, useRef, useEffect } from "react";
import type { Mode, Course } from "@/lib/types";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase"


interface SearchCalendarBarProps {
  hasSearched: boolean;
  setHasSearched: (value: boolean) => void;
  setResults: (results: Course[]) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}

export default function SearchCalendarBar({ hasSearched, setHasSearched, setResults, mode, setMode }: SearchCalendarBarProps) {
    const [query, setQuery] = useState("")
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input when switching to search mode
    useEffect(() => {
        if (mode === "search") {
            const timer = setTimeout(() => inputRef.current?.focus(), 50)
            return () => clearTimeout(timer)
        }
    }, [mode])

    const handleSearch = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!query.trim()) return;

        try {
            const { data, error } = await supabase
                .from('courses')
                .select('*')
                .or(`name.ilike.%${query}%,subject.ilike.%${query}%`);

            if (error) {
                console.error(`Search failed: ${error.message}`);
                return;
            }

            setResults(data as Course[]);
            setHasSearched(true);

        } catch (err) {
            console.error("Search error:", err);
        }
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <form
                onSubmit={handleSearch}
                className="pointer-events-auto mt-10"
            >
                {/*
                  Single container with border-b-2.
                  The underline shrinks/grows as content inside transitions.
                */}
                <div
                    className={cn(
                        "flex items-center border-b-2 transition-all duration-300 ease-in-out",
                        mode === "search"
                            ? "border-muted-foreground/30 focus-within:border-foreground"
                            : "border-muted-foreground/30"
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
                                ? "text-red-600 dark:text-red-400 cursor-default"
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