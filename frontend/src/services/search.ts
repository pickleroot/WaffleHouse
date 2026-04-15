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

export async function searchCourses(query: string): Promise<Course[]> {
    if (!query.trim()) {
        return [];
    }

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User is not authenticated");
    }

    try {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .or(`name.ilike.%${query}%,subject.ilike.%${query}%`);

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
