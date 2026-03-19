import { useState, useRef, useMemo } from "react"
import type { ColumnDef } from "@tanstack/react-table"  // use "import type" when what you're importing is a TS-only type
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import BigCalendar from "@/components/BigCalendar"
import { DataTable } from "@/components/DataTable"
import Footer from "@/components/Footer.tsx"
import type { Mode, Course } from "@/lib/types"         // same here
import { cn } from "@/lib/utils"
import * as React from "react";
import SearchCalendarBar from "@/components/SearchCalendarBar.tsx";
import FilterGroup from "@/components/FilterGroup.tsx";
import { useNavigate } from "react-router-dom";


// TODO: Update columns to match actual API response fields
// const columns: ColumnDef<Course>[] = [
//     { accessorKey: "id", header: "ID" },
//     { accessorKey: "name", header: "Name" },
//     { accessorKey: "description", header: "Description" },
// ]

// Columns / headers for table of search results
const columns: ColumnDef<Course>[] = [
    { accessorKey: "department", header: "Department" },
    { accessorKey: "code", header: "Course code" },
    { accessorKey: "name", header: "Course name", cell: ({ row }) => (
        <button
            onClick={() => navigate(`/course/${row.original.id}`)}
            className="text-left hover:underline cursor-pointer text-foreground"
        >
            {row.original.name}
        </button>
    )},
    { accessorKey: "section", header: "Section" },
    { accessorKey: "creditHours", header: "Credit hours" },
    { accessorKey: "professor", header: "Professor" },
    { accessorKey: "time", header: "Days & Time" },
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

export default function Home() {
    const navigate = useNavigate()
    const [results, setResults] = useState<Course[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [mode, setMode] = useState<Mode>("search")
    const filterFormRef = useRef<HTMLFormElement>(null)
    const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], [])

    const submitFilters = async () => {
        if (!filterFormRef.current) return;
        const formData = new FormData(filterFormRef.current);

        const getString = (name: string): string | null => {
            const val = formData.get(name);
            return val && String(val).trim() ? String(val).trim() : null;
        };

        // Build time filter object from start-time, end-time, and day-of-week fields
        const startTime = getString("start-time");
        const endTime = getString("end-time");
        const day = getString("day-of-week");

        let time: Record<string, unknown> | null = null;
        if (startTime || endTime || day) {
            time = {};
            // Only include day if set — Timeslot.day is a primitive char, can't be null
            if (day) time.day = day;
            if (startTime) time.start_time = startTime.split(":").map(Number);
            if (endTime) time.end_time = endTime.split(":").map(Number);
        }

        const postData = {
            semester: getString("semester"),
            name: getString("name"),
            prof: getString("prof"),
            dept: getString("dept"),
            credits: getString("credits"),
            time,
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

                {/* Search Bar, with Calendar Button */}
                <SearchCalendarBar hasSearched={hasSearched} setHasSearched={setHasSearched} setResults={setResults} mode={mode} setMode={setMode} />

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
