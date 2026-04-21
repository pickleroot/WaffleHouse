import { useRef } from "react"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import { DataTable } from "@/components/data/DataTable"
import FilterGroup from "@/components/search/FilterGroup"
import { filterCourses } from "@/services/search"

interface SearchResultsViewProps {
    columns: ColumnDef<Course>[]
    results: Course[]
    setResults: (results: Course[]) => void
}

/**
 * Filter form + results table for the search view.
 * Owns its own filter form ref since it isn't shared with anything else.
 */
export default function SearchResultsView({ columns, results, setResults }: SearchResultsViewProps) {
    const filterFormRef = useRef<HTMLFormElement>(null)

    const submitFilters = async () => {
        if (!filterFormRef.current) return;
        const formData = new FormData(filterFormRef.current);

        const getString = (name: string): string | null => {
            const val = formData.get(name);
            return val && String(val).trim() ? String(val).trim() : null;
        };

        const startTime = getString("start-time");
        const endTime   = getString("end-time");
        const day       = getString("day-of-week");

        let time: Record<string, unknown> | null = null;
        if (startTime || endTime || day) {
            time = {};
            if (day)       time.day        = day;
            if (startTime) time.start_time = startTime.split(":").map(Number);
            if (endTime)   time.end_time   = endTime.split(":").map(Number);
        }

        try {
            const filterRes = await filterCourses({
                semester: getString("semester"),
                name: getString("name"),
                prof: getString("prof"),
                dept: getString("dept"),
                credits: getString("credits"),
                year: getString("year"),
                time: time as any,
            });
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
        <div className="block min-w-4/5 mt-8">
            <form ref={filterFormRef} onSubmit={handleFilter} onChange={() => submitFilters()}>
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
                    <DataTable columns={columns} data={results} />
                </div>
            </div>
        </div>
    );
}
