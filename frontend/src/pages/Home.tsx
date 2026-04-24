import { useCallback, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Mode, Course } from "@/lib/types"
import { supabase } from "@/lib/supabase"
import { courseConflicts } from "@/lib/conflicts"
import {
    addCourseToSchedule,
    removeCourseFromSchedule,
    getCourse,
} from "@/services/schedule"
import { useAuthRedirect } from "@/hooks/useAuthRedirect"
import { useToast } from "@/hooks/useToast"
import { useSchedule } from "@/hooks/useSchedule"
// --- infinite-scroll change ---
// Replaces local `results` state + manual single-course refresh. The hook
// owns paginated fetching via useInfiniteQuery; the cache updater splices
// refreshed course rows into every loaded page so openSeats reflects the
// latest add/remove without re-fetching.
import { useCourseSearch, useUpdateCourseInCache, type SearchParams } from "@/hooks/useCourseSearch"
// --- /infinite-scroll change ---
import Footer from "@/components/layout/Footer"
import Toast from "@/components/home/Toast"
import HomeHeader from "@/components/home/HomeHeader"
import QuoteDisplay from "@/components/home/QuoteDisplay"
import SearchResultsView from "@/components/home/SearchResultsView"
import CalendarView from "@/components/home/CalendarView"
import { FiltersSidebar } from "@/components/search/FiltersSidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { buildSearchColumns } from "@/components/home/columns/searchColumns"
import { buildScheduleColumns } from "@/components/home/columns/scheduleColumns"

export default function Home() {
    const navigate = useNavigate()
    useAuthRedirect()

    // --- infinite-scroll change ---
    // searchParams replaces the old `results` array. When it changes, react-query
    // re-keys and fetches page 0; the hook handles every subsequent page.
    const [searchParams, setSearchParams] = useState<SearchParams>(null)
    const [hasSearched, setHasSearched] = useState(false)
    const [mode, setMode] = useState<Mode>("search")

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useCourseSearch(searchParams)

    // Flatten the paged data into a single array for the table / conflict logic.
    const results = useMemo<Course[]>(
        () => data?.pages.flatMap((p) => p.courses) ?? [],
        [data],
    )

    const updateCourseInCache = useUpdateCourseInCache()
    // --- /infinite-scroll change ---

    const { toast, showToast } = useToast()
    const { schedule, events, setSchedule, setEvents, fetchSchedule } = useSchedule()

    /**
     * Fetch a single course by ID and replace its entry in the cached pages.
     * Called after add/remove so that openSeats updates in the search table
     * without re-fetching the entire paginated result set.
     */
    const refreshCourseInResults = useCallback(async (id: number) => {
        try {
            const courseData = await getCourse(String(id));
            const year = parseInt((courseData as any).semester.split('_')[0], 10);
            const updatedCourse: Course = {
                id: (courseData as any).id,
                subject: (courseData as any).subject,
                code: (courseData as any).course_number,
                section: (courseData as any).section,
                name: (courseData as any).name,
                professors: (courseData as any).faculty ? [{ firstName: (courseData as any).faculty, lastName: "" }] : [],
                creditHours: (courseData as any).credits,
                openSeats: (courseData as any).open_seats,
                totalSeats: (courseData as any).total_seats,
                year,
                semester: (courseData as any).semester,
                times: (courseData as any).times || [],
                isLab: (courseData as any).is_lab,
                isOpen: (courseData as any).is_open,
                location: (courseData as any).location,
            };
            // --- infinite-scroll change ---
            updateCourseInCache(updatedCourse);
            // --- /infinite-scroll change ---
        } catch (err) {
            console.error("Failed to refresh course in results:", err);
        }
    }, [updateCourseInCache]);

    /**
     * IDs of courses already in the user's schedule.
     * Checked before conflict detection — a course should not be flagged
     * as conflicting with itself.
     */
    const scheduledIds = useMemo<Set<number>>(() => {
        return new Set(schedule.map((c: any) => c.id));
    }, [schedule]);

    /**
     * IDs of courses that conflict with the schedule but are NOT already in it.
     * Courses already in the schedule get a Remove button instead of being
     * flagged as conflicts.
     */
    const conflictingIds = useMemo<Set<number>>(() => {
        const ids = new Set<number>();
        for (const course of results) {
            if (scheduledIds.has(course.id)) continue;
            if (courseConflicts(course, schedule)) {
                ids.add(course.id);
            }
        }
        return ids;
    }, [results, schedule, scheduledIds]);

    const handleAdd = useCallback(async (course: Course) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            await addCourseToSchedule(user.id, String(course.id));
            console.log("Course added successfully:", course.name);
            fetchSchedule();
            refreshCourseInResults(course.id);
        } catch (err) {
            console.error("Error adding course:", err);
        }
    }, [fetchSchedule, refreshCourseInResults]);

    const handleRemove = useCallback(async (course: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            await removeCourseFromSchedule(user.id, String(course.id));
            console.log("Course removed successfully:", course.name);
            fetchSchedule();
            refreshCourseInResults(course.id);
        } catch (err) {
            console.error("Error removing course:", err);
        }
    }, [fetchSchedule, refreshCourseInResults]);

    const onNavigateToCourse = useCallback((id: number) => navigate(`/course/${id}`), [navigate]);

    const searchColumns = useMemo(
        () => buildSearchColumns({
            scheduledIds,
            conflictingIds,
            onAdd: handleAdd,
            onRemove: handleRemove,
            onNavigate: onNavigateToCourse,
        }),
        [scheduledIds, conflictingIds, handleAdd, handleRemove, onNavigateToCourse],
    );

    const scheduleColumns = useMemo(
        () => buildScheduleColumns({
            onRemove: handleRemove,
            onNavigate: onNavigateToCourse,
        }),
        [handleRemove, onNavigateToCourse],
    );

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Toast toast={toast} />

            <HomeHeader
                hasSearched={hasSearched}
                setHasSearched={setHasSearched}
                // --- infinite-scroll change ---
                setSearchParams={setSearchParams}
                // --- /infinite-scroll change ---
                mode={mode}
                setMode={setMode}
                schedule={schedule}
                setSchedule={setSchedule}
                setEvents={setEvents}
                showToast={showToast}
            />

            <main className="flex flex-1 justify-center min-h-full mb-16">
                {mode === "search" && !hasSearched && <QuoteDisplay />}

                {/*
                  * Sidebar is mounted only after the user's first search, so it
                  * starts hidden and appears (open) once results exist. The
                  * SidebarProvider keeps open/collapsed state internal, so
                  * toggling never re-renders Home or the memoized results view.
                  */}
                {mode === "search" && hasSearched && (
                    <SearchResultsView
                        columns={searchColumns}
                        // --- infinite-scroll change ---
                        courses={results}
                        setSearchParams={setSearchParams}
                        fetchNextPage={fetchNextPage}
                        hasNextPage={!!hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        // --- /infinite-scroll change ---
                    />
                )}

                {mode === "calendar" && (
                    <CalendarView
                        events={events}
                        schedule={schedule}
                        scheduleColumns={scheduleColumns}
                    />
                )}
            </main>

            <Footer />
        </div>
    )
}
