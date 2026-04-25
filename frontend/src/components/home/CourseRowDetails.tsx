import type { Course } from "@/lib/types"
import {
    formatCourseTimes,
    formatProfessorName,
    formatSemester,
} from "@/lib/utils"

interface CourseRowDetailsProps {
    course: Course
}

function DetailItem({
    label,
    value,
    className,
}: {
    label: string
    value: string
    className?: string
}) {
    return (
        <div className={className}>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </p>
            <p className="mt-1 text-sm text-foreground">
                {value}
            </p>
        </div>
    )
}

export default function CourseRowDetails({ course }: CourseRowDetailsProps) {
    const professors = course.professors.length > 0
        ? course.professors.map(formatProfessorName).join(", ")
        : "Instructor TBD"
    const schedule = course.times.length > 0
        ? formatCourseTimes(course.times)
        : "No schedule information available"
    const seats = `${course.openSeats} / ${course.totalSeats} seats available`
    const courseLabel = `${course.subject} ${course.code}-${course.section}`
    const status = course.isOpen ? "Open" : "Closed"
    const type = course.isLab ? "Lab" : "Lecture"

    return (
        <div className="space-y-5">
            <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">
                    {course.name}
                </p>
                <p className="text-sm text-muted-foreground">
                    {courseLabel}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <DetailItem
                    label="Department"
                    value={course.subject}
                />
                <DetailItem
                    label="Course Number"
                    value={String(course.code)}
                />
                <DetailItem
                    label="Section"
                    value={course.section}
                />
                <DetailItem
                    label="Type"
                    value={type}
                />
                <DetailItem
                    label="Status"
                    value={status}
                />
                <DetailItem
                    label="Credits"
                    value={`${course.creditHours} credit hour${course.creditHours === 1 ? "" : "s"}`}
                />
                <DetailItem
                    label="Open Seats"
                    value={String(course.openSeats)}
                />
                <DetailItem
                    label="Total Seats"
                    value={String(course.totalSeats)}
                />
                <DetailItem
                    label="Seats"
                    value={seats}
                />
                <DetailItem
                    label="Instructor"
                    value={professors}
                />
                <DetailItem
                    label="Semester"
                    value={formatSemester(course.semester)}
                />
                <DetailItem
                    label="Year"
                    value={String(course.year)}
                />
                <DetailItem
                    label="Location"
                    value={course.location || "Location TBD"}
                />
                <DetailItem
                    label="Schedule"
                    value={schedule}
                    className="sm:col-span-2 xl:col-span-3"
                />
            </div>
        </div>
    )
}
