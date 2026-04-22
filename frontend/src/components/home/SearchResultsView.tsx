import { useEffect, useRef } from "react"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import { DataTable } from "@/components/data/DataTable"
import FilterGroup from "@/components/search/FilterGroup"
// --- infinite-scroll change ---
// Filter form no longer calls filterCourses() directly; it constructs a
// FilterParams object and hands it up to Home.tsx, which drives the
// useInfiniteQuery cache. This avoids duplicating fetch + pagination logic.
import type { FilterParams } from "@/services/search"
import type { SearchParams } from "@/hooks/useCourseSearch"
// --- /infinite-scroll change ---

interface SearchResultsViewProps {
    columns: ColumnDef<Course>[]
    // --- infinite-scroll change ---
    courses: Course[]
    setSearchParams: (params: SearchParams) => void
    fetchNextPage: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
    // --- /infinite-scroll change ---
}

export default function SearchResultsView({
    columns,
    courses,
    setSearchParams,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: SearchResultsViewProps) {
    const filterFormRef = useRef<HTMLFormElement>(null)
    // --- infinite-scroll change ---
    // Ref attached to a sentinel row inside DataTable. The IntersectionObserver
    // below watches it and calls fetchNextPage() when it enters the viewport.
    const loadMoreRef = useRef<HTMLTableRowElement>(null)
    // --- /infinite-scroll change ---

    const submitFilters = () => {
        if (!filterFormRef.current) return;
        const formData = new FormData(filterFormRef.current);

        const getString = (name: string): string | null => {
            const val = formData.get(name);
            return val && String(val).trim() ? String(val).trim() : null;
        };

        const startTime = getString("start-time");
        const endTime   = getString("end-time");
        const day       = getString("day-of-week");

        let time: FilterParams["time"] = null;
        if (startTime || endTime || day) {
            time = {};
            if (day)       time.day        = day;
            if (startTime) time.start_time = startTime.split(":").map(Number);
            if (endTime)   time.end_time   = endTime.split(":").map(Number);
        }

        const filters: FilterParams = {
            semester: getString("semester"),
            name: getString("name"),
            prof: getString("prof"),
            dept: getString("dept"),
            credits: getString("credits"),
            year: getString("year"),
            time,
        }

        // --- infinite-scroll change ---
        // Hand the filter params up; the hook re-keys and fetches page 0.
        setSearchParams({ kind: "filter", filters })
        // --- /infinite-scroll change ---
    }

    const handleFilter = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        submitFilters();
    }

    // --- infinite-scroll change ---
    // IntersectionObserver: triggers fetchNextPage when the sentinel comes
    // within 200px of the viewport. Re-binds whenever the callback identity
    // or availability flags change so we don't trigger after pagination ends.
    useEffect(() => {
        const el = loadMoreRef.current
        if (!el) return
        if (!hasNextPage || isFetchingNextPage) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) fetchNextPage()
            },
            { rootMargin: "200px" },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [fetchNextPage, hasNextPage, isFetchingNextPage, courses.length])
    // --- /infinite-scroll change ---

    return (
        <div className="block min-w-4/5 mt-8">
            <form ref={filterFormRef} onSubmit={handleFilter} onChange={submitFilters}>
                <FilterGroup className="p-4 bg-neutral-50" />
            </form>
            <div className="flex-1 flex flex-col items-center px-6 pt-8">
                <div className="w-full max-w-4xl mx-auto">
                    {/*
                      * Dimming is handled per-cell inside each column's cell renderer
                      * using opacity-30 on a wrapping <span>, so Tailwind always sees
                      * the class as a static string and includes it in the build.
                      *
                      * The action column uses meta: { sticky: true }. To make it pin
                      * to the right edge during horizontal scroll, add this to DataTable.tsx
                      * wherever <th> and <td> are rendered:
                      *   const isSticky = (column.columnDef.meta as any)?.sticky;
                      *   className={cn("...", isSticky && "sticky right-0 bg-background")}
                      */}
                    {/* --- infinite-scroll change ---
                        loadMoreRef is only passed while there are more pages to
                        fetch; once exhausted the sentinel disappears so no more
                        observer callbacks fire. */}
                    <DataTable
                        columns={columns}
                        data={courses}
                        loadMoreRef={hasNextPage ? loadMoreRef : undefined}
                        isFetchingMore={isFetchingNextPage}
                    />
                    {/* --- /infinite-scroll change --- */}
                </div>
            </div>
        </div>
    );
}
