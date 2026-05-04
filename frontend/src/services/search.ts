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

export interface PaginationOpts {
    offset?: number
    limit?: number
}

export interface SearchPage {
    courses: Course[]
    hasMore: boolean
}

export const DEFAULT_PAGE_SIZE = 25

function transformRawCourse(raw: RawCourseData): Course {
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

export async function getSemesters(): Promise<string[]> {
    const { data, error } = await supabase
        .from('courses')
        .select('semester');

    if (error) {
        console.error(`Failed to load semesters: ${error.message}`);
        return [];
    }

    const unique = new Set<string>();
    (data as { semester: string }[]).forEach(row => {
        if (row.semester) unique.add(row.semester);
    });
    return Array.from(unique);
}

export async function searchCourses(
    query: string,
    opts: PaginationOpts = {},
    semester?: string | null,
): Promise<SearchPage> {
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;

    if (!query.trim()) {
        return { courses: [], hasMore: false };
    }

    try {
        let builder = supabase
            .from('courses')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`)
            .order('id', { ascending: true })
            .range(offset, offset + limit - 1);

        if (semester) {
            builder = builder.eq('semester', semester);
        }

        const { data, error } = await builder;

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

export interface FilterParams {
    semester?: string | null;
    name?: string | null;
    prof?: string[] | null;
    dept?: string | null;
    credits?: { min: number; max: number } | null;
    year?: string | null;
    time?: {
        days?: string[];
        start_time?: number[];
        end_time?: number[];
    } | null;
}

export async function fetchFilterOptions(): Promise<{ subjects: string[]; faculty: string[] }> {
    const { data, error } = await supabase.from('courses').select('subject, faculty');
    if (error || !data) {
        console.error("Failed to fetch filter options:", error?.message);
        return { subjects: [], faculty: [] };
    }
    const subjectSet = new Set<string>();
    const facultySet = new Set<string>();
    for (const row of data as { subject: string | null; faculty: string | null }[]) {
        if (row.subject) subjectSet.add(row.subject);
        if (row.faculty) facultySet.add(row.faculty);
    }
    return {
        subjects: [...subjectSet].sort(),
        faculty: [...facultySet].sort(),
    };
}

export async function filterCourses(
    filters: FilterParams,
    opts: PaginationOpts = {},
): Promise<SearchPage> {
    const offset = opts.offset ?? 0;
    const limit = opts.limit ?? DEFAULT_PAGE_SIZE;

    try {
        let query = supabase.from('courses').select('*');

        if (filters.dept)     query = query.eq('subject', filters.dept.toUpperCase());
        if (filters.semester) query = query.eq('semester', filters.semester);
        if (filters.credits)  query = query.gte('credits', filters.credits.min).lte('credits', filters.credits.max);
        if (filters.year) {
            const yearStr = parseInt(filters.year, 10).toString();
            query = query.ilike('semester', `${yearStr}%`);
        }
        if (filters.name) query = query.ilike('name', `%${filters.name}%`);
        if (filters.prof && filters.prof.length > 0) query = query.in('faculty', filters.prof);

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
                    if (filters.time?.days && filters.time.days.length > 0) {
                        if (!filters.time.days.includes(String(slot.day))) return false;
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
