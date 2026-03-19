import { useState, useRef, useEffect, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BigCalendar from "@/components/BigCalendar"
import { DataTable } from "@/components/DataTable"
import Footer from "@/components/Footer.tsx"
import { cn } from "@/lib/utils"
import * as React from "react";
import FilterGroup from "@/components/FilterGroup.tsx";


interface Course {
    id: number
    name: string
    code: number
    section: string
    department: string
    professor: string
    creditHours: number
    year: number
    semester: number
    times: Date[]
};

// TODO: Update columns to match actual API response fields
// const columns: ColumnDef<Course>[] = [
//     { accessorKey: "id", header: "ID" },
//     { accessorKey: "name", header: "Name" },
//     { accessorKey: "description", header: "Description" },
// ]

const columns: ColumnDef<Course>[] = [
    { accessorKey: "department", header: "Department" },
    { accessorKey: "code", header: "Course code" },
    { accessorKey: "section", header: "Section" },
    { accessorKey: "name", header: "Course name" },
    { accessorKey: "creditHours", header: "Credit hours" },
    { accessorKey: "professor", header: "Professor" },
    { accessorKey: "time", header: "Days & Time" },
//     { accessorKey: "capacity", header: "Capacity" },
];

// TODO: change this
const QUOTES = [
    { text: "The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.", author: "Proverbs 9:10" },
    { text: "Education is simply the soul of a society as it passes from one generation to another.", author: "G.K. Chesterton" },
    { text: "The task of the modern educator is not to cut down jungles, but to irrigate deserts.", author: "C.S. Lewis" },
    { text: "All truth is God's truth.", author: "Augustine of Hippo" },
    { text: "The heart cannot delight in what the mind does not regard as true.", author: "J. Gresham Machen" },
    { text: "Education without values, as useful as it is, seems rather to make man a more clever devil.", author: "C.S. Lewis" },
    { text: "The glory of God is a human being fully alive.", author: "Irenaeus of Lyon" },
    { text: "An educated mind is one that can entertain a thought without accepting it.", author: "Aristotle" },
]

type Mode = "search" | "calendar"

export default function Home() {
    const [mode, setMode] = useState<Mode>("search")
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Course[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const filterFormRef = useRef<HTMLFormElement>(null)
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

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
            const res = await fetch(`http://localhost:7001/search?q=${query}`);
            if (!res.ok) {
                console.error(`Search failed: ${res.status} ${res.statusText}`);
                return;
            }
            const searchRes: Course[] = await res.json();
            setResults(searchRes);
            setHasSearched(true);
        } catch (err) {
            console.error("Search error:", err);
        }
    }

    const submitFilters = async () => {
        if (!filterFormRef.current) return;
        const formData = new FormData(filterFormRef.current);

        const getString = (name: string): string | null => {
            const val = formData.get(name);
            return val && String(val).trim() ? String(val).trim() : null;
        };

        const postData = {
            name: getString("name"),
            prof: getString("prof"),
            dept: getString("dept"),
            credits: getString("credits"),
            time: null,
        };

        try {
            const res = await fetch(`http://localhost:7001/filters`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            if (!res.ok) {
                console.error(`Filter failed: ${res.status} ${res.statusText}`);
                return;
            }
            const filterRes: Course[] = await res.json();
            setResults(filterRes);
        } catch (err) {
            console.error("Filter error:", err);
        }
    }

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitFilters();
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Header */}
            <header className="relative h-16 flex items-center px-6">
                {/* Centered morphing nav — always rendered, animated */}
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

                {/* Avatar (always visible, right-aligned) */}
                <div className="ml-auto">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback>IT</AvatarFallback>
                        </Avatar>
                    </Button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 justify-center min-h-full mb-16">
                {/* Inspirational quote (shown before any search) */}
                {mode === "search" && !hasSearched && (
                    <div className="flex-1 flex flex-col items-center justify-center px-6">
                        <blockquote className="max-w-md text-center">
                            <p className="text-lg italic text-muted-foreground/60">
                                &ldquo;{quote.text}&rdquo;
                            </p>
                            <footer className="mt-3 text-sm text-muted-foreground/40">
                                &mdash; {quote.author}
                            </footer>
                        </blockquote>
                    </div>
                )}

                {/* Search results + filters */}
                {mode === "search" && hasSearched && (
                    <div className="block min-w-4/5 mt-8">
                        <form ref={filterFormRef} onSubmit={handleFilter} onChange={() => submitFilters()}>
                            <FilterGroup className="p-4 bg-neutral-50" />
                        </form>
                        <div className="flex-1 flex flex-col items-center px-6 pt-8">
                            <div className="w-full max-w-4xl mx-auto">
                                <DataTable columns={columns} data={results} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar */}
                {mode === "calendar" && (
                    <div className="flex-1 flex items-center justify-center max-w-2/3">
                        <BigCalendar />
                    </div>
                )}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
