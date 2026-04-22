// --- infinite-scroll change ---
// useInfiniteQuery wrapper that unifies the two entry points (text search and
// filter form) behind a single cache key. The component tree only needs to set
// SearchParams; the hook handles fetching, pagination, and cache coherence.
import { useInfiniteQuery, useQueryClient, type InfiniteData } from "@tanstack/react-query"
import {
    searchCourses,
    filterCourses,
    DEFAULT_PAGE_SIZE,
    type FilterParams,
    type SearchPage,
} from "@/services/search"
import type { Course } from "@/lib/types"

export type SearchParams =
    | { kind: "search"; query: string }
    | { kind: "filter"; filters: FilterParams }
    | null

export function useCourseSearch(params: SearchParams) {
    return useInfiniteQuery<SearchPage, Error, InfiniteData<SearchPage, number>, readonly unknown[], number>({
        queryKey: ["courses", params],
        enabled: params !== null,
        initialPageParam: 0,
        queryFn: ({ pageParam }) => {
            const opts = { offset: pageParam, limit: DEFAULT_PAGE_SIZE }
            // params is guaranteed non-null because `enabled` gates the fetch.
            if (params!.kind === "search") return searchCourses(params!.query, opts)
            return filterCourses(params!.filters, opts)
        },
        // Advance by the raw page size regardless of client-side filtering,
        // so offsets stay aligned with Supabase rows.
        getNextPageParam: (lastPage, _all, lastPageParam) =>
            lastPage.hasMore ? lastPageParam + DEFAULT_PAGE_SIZE : undefined,
    })
}

// After add/remove, the single refreshed course is spliced into every cached
// page. Avoids re-fetching all pages and preserves scroll position.
export function useUpdateCourseInCache() {
    const qc = useQueryClient()
    return (updated: Course) => {
        qc.setQueriesData<InfiniteData<SearchPage, number>>(
            { queryKey: ["courses"] },
            (old) => {
                if (!old) return old
                return {
                    ...old,
                    pages: old.pages.map((page) => ({
                        ...page,
                        courses: page.courses.map((c) => (c.id === updated.id ? updated : c)),
                    })),
                }
            },
        )
    }
}
// --- /infinite-scroll change ---
