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
    | { kind: "search"; query: string; semester?: string | null }
    | { kind: "filter"; filters: FilterParams }
    | null

export function useCourseSearch(params: SearchParams) {
    return useInfiniteQuery<SearchPage, Error, InfiniteData<SearchPage, number>, readonly unknown[], number>({
        queryKey: ["courses", params],
        enabled: params !== null,
        initialPageParam: 0,
        queryFn: ({ pageParam }) => {
            const opts = { offset: pageParam, limit: DEFAULT_PAGE_SIZE }
            if (params!.kind === "search") {
                return searchCourses(params!.query, opts, params!.semester)
            }
            return filterCourses(params!.filters, opts)
        },
        getNextPageParam: (lastPage, _all, lastPageParam) =>
            lastPage.hasMore ? lastPageParam + DEFAULT_PAGE_SIZE : undefined,
    })
}

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
