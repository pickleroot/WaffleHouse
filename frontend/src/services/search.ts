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

export async function getSemesters(): Promise<string[]> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

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

export async function searchCourses(query: string, semester?: string | null): Promise<Course[]> {
    if (!query.trim()) {
        return [];
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    try {
        let builder = supabase
            .from('courses')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`);

        if (semester) {
            builder = builder.eq('semester', semester);
        }

        const { data, error } = await builder;

        if (error) {
            console.error(`Search failed: ${error.message}`);
            return [];
        }

        // Fetch course times for all returned courses
        const courses = (data as RawCourseData[]).map(transformRawCourse);
        const courseIds = courses.map(c => c.id);

        if (courseIds.length > 0) {
            const { data: timesData, error: timesError } = await supabase
                .from('course_times')
                .select('*')
                .in('course_id', courseIds);

            if (!timesError && timesData) {
                // Map times to their respective courses
                const timesMap = new Map<number, typeof timesData>();
                (timesData as any[]).forEach(time => {
                    if (!timesMap.has(time.course_id)) {
                        timesMap.set(time.course_id, []);
                    }
                    timesMap.get(time.course_id)!.push(time);
                });

                // Attach times to courses
                courses.forEach(course => {
                    const courseTimes = timesMap.get(course.id) || [];
                    course.times = courseTimes.map(t => ({
                        day: t.day,
                        start_time: t.start_time,
                        end_time: t.end_time
                    }));
                });
            }
        }

        return courses;
    } catch (err) {
        console.error("Search error:", err);
        throw err;
    }
}

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

export async function filterCourses(filters: FilterParams): Promise<Course[]> {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    try {
        let query = supabase.from('courses').select('*');

        // Build base query with simple filters
        if (filters.dept) {
            query = query.eq('subject', filters.dept.toUpperCase());
        }
        if (filters.semester) {
            query = query.eq('semester', filters.semester);
        }
        if (filters.credits) {
            query = query.eq('credits', parseInt(filters.credits, 10));
        }
        if (filters.year) {
            const yearStr = parseInt(filters.year, 10).toString();
            query = query.ilike('semester', `${yearStr}%`);
        }
        if (filters.name) {
            query = query.ilike('name', `%${filters.name}%`);
        }
        if (filters.prof) {
            query = query.ilike('faculty', `%${filters.prof}%`);
        }

        const { data, error } = await query;

        if (error) {
            console.error(`Filter failed: ${error.message}`);
            return [];
        }

        // Transform courses
        let courses = (data as RawCourseData[]).map(transformRawCourse);
        const courseIds = courses.map(c => c.id);

        // Fetch course times
        if (courseIds.length > 0) {
            const { data: timesData, error: timesError } = await supabase
                .from('course_times')
                .select('*')
                .in('course_id', courseIds);

            if (!timesError && timesData) {
                const timesMap = new Map<number, typeof timesData>();
                (timesData as any[]).forEach(time => {
                    if (!timesMap.has(time.course_id)) {
                        timesMap.set(time.course_id, []);
                    }
                    timesMap.get(time.course_id)!.push(time);
                });

                courses.forEach(course => {
                    const courseTimes = timesMap.get(course.id) || [];
                    course.times = courseTimes.map(t => ({
                        day: t.day,
                        start_time: t.start_time,
                        end_time: t.end_time
                    }));
                });

                // Apply time filters if specified
                if (filters.time) {
                    courses = courses.filter(course => {
                        return course.times.some(slot => {
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
                        });
                    });
                }
            }
        }

        return courses;
    } catch (err) {
        console.error("Filter error:", err);
        throw err;
    }
}
