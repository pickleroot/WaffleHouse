import { supabase } from "@/lib/supabase"
import type { Course } from "@/lib/types"

interface RawCourseData {
    id: number
    subject: string
    course_number: number
    section: string
    name: string
    faculty: string | null
    credits: number
    open_seats: number
    total_seats: number
    semester: string
    is_lab: boolean
    is_open: boolean
    location: string
}

// --- infinite-scroll change ---
// Shared pagination input + page-shaped return type.
// `hasMore` is based on raw row count (not filtered), so time-based client
// filtering in filterCourses doesn't confuse the infinite-scroll terminator.
export interface PaginationOpts {
    offset?: number
    limit?: number
}

export interface SearchPage {
    courses: Course[]
    hasMore: boolean
}

export const DEFAULT_PAGE_SIZE = 25
// --- /infinite-scroll change ---

function transformRawCourse(raw: RawCourseData): Course {
    // Extract year from semester (e.g., "2025_Spring" -> 2025)
    const year = parseInt(raw.semester.split('_')[0], 10);

    return {
        id: raw.id,
        subject: raw.subject,
        code: raw.course_number,
        section: raw.section,
        name: raw.name,
        professors: raw.faculty ? [{ firstName: raw.faculty, lastName: "" }] : [],
        creditHours: raw.credits,
        openSeats: raw.open_seats,
        totalSeats: raw.total_seats,
        year,
        semester: raw.semester,
        times: [],
        isLab: raw.is_lab,
        isOpen: raw.is_open,
        location: raw.location,
    };
}

async function attachTimes(courses: Course[]): Promise<void> {
    if (courses.length === 0) return;
    const courseIds = courses.map(c => c.id);
    const { data: timesData, error: timesError } = await supabase
        .from('course_times')
        .select('*')
        .in('course_id', courseIds);

    if (timesError || !timesData) return;

    const timesMap = new Map<number, any[]>();
    (timesData as any[]).forEach(time => {
        if (!timesMap.has(time.course_id)) timesMap.set(time.course_id, []);
        timesMap.get(time.course_id)!.push(time);
    });

    courses.forEach(course => {
        const slots = timesMap.get(course.id) || [];
        course.times = slots.map(t => ({
            day: t.day,
            start_time: t.start_time,
            end_time: t.end_time,
        }));
    });
}

// --- infinite-scroll change ---
// Now accepts PaginationOpts and returns SearchPage instead of Course[].
// Uses `.order('id')` so that `.range()` produces stable, non-overlapping
// pages across calls (Postgres doesn't guarantee row order without ORDER BY).
export async function searchCourses(
    query: string,
    opts: PaginationOpts = {}
): Promise<SearchPage> {
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;

    if (!query.trim()) {
        return { courses: [], hasMore: false };
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
            .order('id', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error(`Search failed: ${error.message}`);
            return { courses: [], hasMore: false };
        }

        const raw = data as RawCourseData[];
        const courses = raw.map(transformRawCourse);
        await attachTimes(courses);

        return { courses, hasMore: raw.length === limit };
    } catch (err) {
        console.error("Search error:", err);
        throw err;
    }
}
// --- /infinite-scroll change ---

export interface FilterParams {
    semester?: string | null;
    name?: string | null;
    prof?: string | null;
    dept?: string | null;
    credits?: string | null;
    year?: string | null;
    time?: {
        day?: string;
        start_time?: number[];
        end_time?: number[];
    } | null;
}

// --- infinite-scroll change ---
// Same pagination shape as searchCourses. `hasMore` is derived from the raw
// Supabase row count *before* the client-side time filter, since the time
// filter can drop rows but that doesn't mean we've exhausted the result set.
export async function filterCourses(
    filters: FilterParams,
    opts: PaginationOpts = {}
): Promise<SearchPage> {
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    try {
        let query = supabase.from('courses').select('*');

        if (filters.dept)     query = query.eq('subject', filters.dept.toUpperCase());
        if (filters.semester) query = query.eq('semester', filters.semester);
        if (filters.credits)  query = query.eq('credits', parseInt(filters.credits, 10));
        if (filters.year) {
            const yearStr = parseInt(filters.year, 10).toString();
            query = query.ilike('semester', `${yearStr}%`);
        }
        if (filters.name) query = query.ilike('name', `%${filters.name}%`);
        if (filters.prof) query = query.ilike('faculty', `%${filters.prof}%`);

        const { data, error } = await query
            .order('id', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error(`Filter failed: ${error.message}`);
            return { courses: [], hasMore: false };
        }

        const raw = data as RawCourseData[];
        let courses = raw.map(transformRawCourse);
        await attachTimes(courses);

        if (filters.time) {
            courses = courses.filter(course =>
                course.times.some(slot => {
                    if (filters.time?.day && String(slot.day) !== String(filters.time.day)) {
                        return false;
                    }
                    if (filters.time?.start_time && filters.time?.end_time) {
                        const slotStart = Array.isArray(slot.start_time)
                            ? slot.start_time[0] * 60 + slot.start_time[1]
                            : 0;
                        const filterStart = filters.time.start_time[0] * 60 + filters.time.start_time[1];
                        const slotEnd = Array.isArray(slot.end_time)
                            ? slot.end_time[0] * 60 + slot.end_time[1]
                            : 24 * 60;
                        const filterEnd = filters.time.end_time[0] * 60 + filters.time.end_time[1];
                        return slotStart >= filterStart && slotEnd <= filterEnd;
                    }
                    return true;
                })
            );
        }

        return { courses, hasMore: raw.length === limit };
    } catch (err) {
        console.error("Filter error:", err);
        throw err;
    }
}
// --- /infinite-scroll change ---
