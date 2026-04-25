import * as React from "react"
import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import { DataTable } from "@/components/data/DataTable"
import CourseRowDetails from "@/components/home/CourseRowDetails"

interface SearchResultsViewProps {
    columns: ColumnDef<Course>[]
    results: Course[]
}

/**
 * Results table for the search view. Filter inputs now live in
 * `FiltersSidebar`; this component is only responsible for rendering the
 * data table. Memoized so sidebar toggles don't trigger a re-render.
 */
function SearchResultsViewInner({ columns, results }: SearchResultsViewProps) {
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
                />
            </div>
        </div>
    )
}

export default React.memo(SearchResultsViewInner)
