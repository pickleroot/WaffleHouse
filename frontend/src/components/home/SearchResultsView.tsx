import { useEffect, useRef } from "react"
import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import { DataTable } from "@/components/data/DataTable"

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
