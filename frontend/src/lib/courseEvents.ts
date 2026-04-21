import type { CourseEvent } from "@/components/calendar/BigCalendar"
import { formatTime } from "@/lib/utils"

/** Transform backend Course objects into CourseEvents for BigCalendar */
export function toEvents(courses: any[]): CourseEvent[] {
    console.log(courses);

    return courses.flatMap((course) =>
        (course.times || []).map((slot: any) => ({
            daysOfWeek: [String(slot.day)],
            startTime: Array.isArray(slot.start_time) ? formatTime(slot.start_time) : String(slot.start_time),
            endTime: Array.isArray(slot.end_time) ? formatTime(slot.end_time) : String(slot.end_time),
            courseName: course.name,
            courseCode: String(course.code),
            courseDepartment: course.subject,
            courseSection: typeof course.section === 'string' ? course.section : String.fromCharCode(course.section),
            courseLocation: course.location || '',
        }))
    );
}
