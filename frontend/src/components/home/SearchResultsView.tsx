import { useEffect, useRef } from "react"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import { DataTable } from "@/components/data/DataTable"
import CourseRowDetails from "@/components/home/CourseRowDetails"

interface SearchResultsViewProps {
    columns: ColumnDef<Course>[]
    courses: Course[]
    fetchNextPage: () => void
    hasNextPage: boolean
    isFetchingNextPage: boolean
}

function SearchResultsViewInner({
    columns,
    courses,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
}: SearchResultsViewProps) {
    const loadMoreRef = useRef<HTMLTableRowElement>(null)

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

    return (
        <div className="flex-1 flex flex-col px-3 pt-5">
            <div className="w-full max-w-6xl mx-auto">
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
                <DataTable
                    columns={columns}
                    data={results}
                    getRowId={(course) => String(course.id)}
                    renderExpandedContent={(course) => <CourseRowDetails course={course} />}
                    density="compact"
        <div className="flex-1 flex flex-col items-center px-6 pt-8">
            <div className="w-full max-w-4xl mx-auto">
                <DataTable
                    columns={columns}
                    data={courses}
                    loadMoreRef={hasNextPage ? loadMoreRef : undefined}
                    isFetchingMore={isFetchingNextPage}
                />
            </div>
        </div>
    )
}

export default React.memo(SearchResultsViewInner)
