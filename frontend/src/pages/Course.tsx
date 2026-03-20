import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Footer from "@/components/Footer.tsx"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Users, MapPin, Calendar, GraduationCap, CheckCircle, AlertTriangle } from "lucide-react"
import type { Professor, Timeslot } from "@/lib/types"

interface BackendCourse {
    id: number
    subject: string
    code: number
    section: string
    name: string
    professors: Professor[]
    creditHours: number
    openSeats: number
    totalSeats: number
    year: number
    semester: string
    times: Timeslot[]
    isLab: boolean
    isOpen: boolean
    location: string
}

interface DisplayCourse {
    id: number
    subject: string
    code: number
    section: string
    name: string
    professors: Professor[]
    creditHours: number
    openSeats: number
    totalSeats: number
    year: number
    semester: string
    times: Timeslot[]
    isLab: boolean
    isOpen: boolean
    location: string
}

function transformCourse(data: BackendCourse): DisplayCourse {
    return {
        id: data.id,
        subject: data.subject,
        code: data.code,
        section: data.section,
        name: data.name,
        professors: data.professors,
        creditHours: data.creditHours,
        openSeats: data.openSeats,
        totalSeats: data.totalSeats,
        year: data.year,
        semester: data.semester,
        times: data.times,
        isLab: data.isLab,
        isOpen: data.isOpen,
        location: data.location,
    }
}

function formatDay(day: string): string {
    const days: Record<string, string> = {
        "M": "Monday",
        "T": "Tuesday",
        "W": "Wednesday",
        "TH": "Thursday",
        "F": "Friday",
        "SA": "Saturday",
        "SU": "Sunday"
    }
    return days[day] || day
}

function formatTime(time: string | number[]): string {
    let hours: number, minutes: number
    if (Array.isArray(time)) {
        [hours = 0, minutes = 0] = time
    } else {
        [hours, minutes] = time.split(":").map(Number)
    }
    const period = hours >= 12 ? "PM" : "AM"
    const displayHours = hours % 12 || 12
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

function formatProfessorName(prof: Professor): string {
    if (prof.firstName && prof.lastName) {
        return `${prof.firstName} ${prof.lastName}`
    }
    return prof.firstName || prof.lastName || "Unknown Professor"
}

/** Convert a time value (array or string) to total minutes for overlap comparison */
function toMinutes(time: number[] | string): number {
    if (Array.isArray(time)) {
        const [h = 0, m = 0] = time;
        return h * 60 + m;
    }
    const [h = 0, m = 0] = time.split(":").map(Number);
    return h * 60 + m;
}

/**
 * Returns all courses in the schedule that have a timeslot overlapping with
 * the candidate course. Used to show the user which specific courses conflict.
 */
function getConflictingCourses(candidate: DisplayCourse, schedule: any[]): any[] {
    const conflicts: any[] = [];
    for (const scheduled of schedule) {
        // Don't flag the course as conflicting with itself
        if (scheduled.id === candidate.id) continue;
        let found = false;
        for (const candidateSlot of (candidate.times || [])) {
            if (found) break;
            for (const scheduledSlot of (scheduled.times || [])) {
                if (String(candidateSlot.day) !== String(scheduledSlot.day)) continue;

                const candStart  = toMinutes(candidateSlot.start_time);
                const candEnd    = toMinutes(candidateSlot.end_time);
                const schedStart = toMinutes(scheduledSlot.start_time);
                const schedEnd   = toMinutes(scheduledSlot.end_time);

                if (candStart < schedEnd && candEnd > schedStart) {
                    conflicts.push(scheduled);
                    found = true;
                    break;
                }
            }
        }
    }
    return conflicts;
}

export default function Course() {
    const navigate = useNavigate()
    const params = useParams()
    const [course, setCourse] = React.useState<DisplayCourse | null>(null)
    const [schedule, setSchedule] = React.useState<any[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchData = async () => {
            const courseId = params.id
            if (!courseId) {
                setError("No course ID provided")
                setLoading(false)
                return
            }

            try {
                // Fetch both the course and the user's schedule in parallel
                const [courseRes, scheduleRes] = await Promise.all([
                    fetch(`http://localhost:7001/course/${courseId}`),
                    fetch("http://localhost:7001/schedule"),
                ]);

                if (!courseRes.ok) {
                    throw new Error(`Failed to fetch course: ${courseRes.status} ${courseRes.statusText}`)
                }

                const courseData: BackendCourse = await courseRes.json()
                setCourse(transformCourse(courseData))

                if (scheduleRes.ok) {
                    const scheduleData = await scheduleRes.json()
                    setSchedule(scheduleData)
                }
            } catch (err) {
                console.error("Error fetching data:", err)
                setError("Failed to load course details")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [params.id])

    const handleBack = () => {
        navigate("/")
    }

    const handleAdd = async () => {
        if (!course) return;
        try {
            const res = await fetch("http://localhost:7001/course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course),
            });
            if (!res.ok) {
                console.error(`Failed to add course: ${res.status} ${res.statusText}`);
                return;
            }
            const added: boolean = await res.json();
            if (added) {
                // Re-fetch both schedule (to flip isInSchedule) and the course itself
                // (to get the updated openSeats from the backend)
                const [scheduleRes, courseRes] = await Promise.all([
                    fetch("http://localhost:7001/schedule"),
                    fetch(`http://localhost:7001/course/${course.id}`),
                ]);
                if (scheduleRes.ok) setSchedule(await scheduleRes.json());
                if (courseRes.ok) setCourse(transformCourse(await courseRes.json()));
            }
        } catch (err) {
            console.error("Error adding course:", err);
        }
    }

    const handleRemove = async () => {
        if (!course) return;
        try {
            const res = await fetch("http://localhost:7001/course", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(course),
            });
            if (!res.ok) {
                console.error(`Failed to remove course: ${res.status} ${res.statusText}`);
                return;
            }
            const removed: boolean = await res.json();
            if (removed) {
                // Re-fetch both schedule (to flip isInSchedule) and the course itself
                // (to get the updated openSeats from the backend)
                const [scheduleRes, courseRes] = await Promise.all([
                    fetch("http://localhost:7001/schedule"),
                    fetch(`http://localhost:7001/course/${course.id}`),
                ]);
                if (scheduleRes.ok) setSchedule(await scheduleRes.json());
                if (courseRes.ok) setCourse(transformCourse(await courseRes.json()));
            }
        } catch (err) {
            console.error("Error removing course:", err);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex flex-1 items-center justify-center">
                    <p className="text-muted-foreground">Loading course details...</p>
                </main>
                <Footer />
            </div>
        )
    }

    if (error || !course) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <main className="flex flex-1 items-center justify-center">
                    <Card className="max-w-md">
                        <CardHeader>
                            <CardTitle>Error</CardTitle>
                            <CardDescription>{error || "Course not found"}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button onClick={handleBack}>Return to Search</Button>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }

    const closedSeats = course.totalSeats - course.openSeats
    const seatPercentage = course.totalSeats > 0
        ? Math.round((closedSeats / course.totalSeats) * 100)
        : 0

    // Determine schedule status for this course
    const isInSchedule = schedule.some((c: any) => c.id === course.id)
    const conflictingCourses = isInSchedule ? [] : getConflictingCourses(course, schedule)
    const hasConflicts = conflictingCourses.length > 0

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="relative h-16 flex items-center px-6">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBack}
                    className={cn(
                        "flex items-center gap-2",
                        "text-muted-foreground hover:text-foreground"
                    )}
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </header>

            <main className="flex flex-1 justify-center px-6 pb-16">
                <div className="w-full max-w-3xl mt-8 space-y-6">

                    {/* Schedule status banner — shown only if relevant */}
                    {isInSchedule && (
                        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-200 border border-green-200 dark:border-green-800">
                            <div className="flex items-center gap-3">
                                <CheckCircle className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium">This course is in your schedule.</span>
                            </div>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                            >
                                Remove
                            </Button>
                        </div>
                    )}

                    {hasConflicts && (
                        <div className="px-4 py-3 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="h-5 w-5 shrink-0" />
                                <span className="text-sm font-medium">
                                    This course has a time conflict with the following course{conflictingCourses.length > 1 ? "s" : ""} in your schedule:
                                </span>
                            </div>
                            <ul className="ml-8 space-y-1">
                                {conflictingCourses.map((c: any) => (
                                    <li key={c.id} className="text-sm">
                                        {c.subject} {c.code} – {c.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Add button — only shown when the course is not in the schedule and has no conflicts */}
                    {!isInSchedule && !hasConflicts && (
                        <div className="flex justify-end">
                            <Button onClick={handleAdd}>
                                Add to Schedule
                            </Button>
                        </div>
                    )}

                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-2xl">{course.name || "Untitled Course"}</CardTitle>
                                        {course.isLab && (
                                            <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100 rounded">
                                                Lab
                                            </span>
                                        )}
                                    </div>
                                    <CardDescription className="text-lg">
                                        {course.subject} {course.code} - Section {course.section}
                                    </CardDescription>
                                </div>
                                <div className={cn(
                                    "px-3 py-1 rounded-full text-sm font-medium",
                                    course.isOpen
                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                                )}>
                                    {course.isOpen ? "Open" : "Closed"}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {course.professors && course.professors.length > 0 && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <GraduationCap className="h-4 w-4" />
                                    <span>
                                        {course.professors.length === 1
                                            ? "Instructor"
                                            : "Instructors"
                                        }: {course.professors.map(formatProfessorName).join(", ")}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.creditHours} Credit Hour{course.creditHours !== 1 ? "s" : ""}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{course.semester} {course.year}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{course.openSeats} / {course.totalSeats} Seats Available</span>
                                <span className="text-sm text-muted-foreground/70">
                                    ({seatPercentage}% full)
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Schedule</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {course.times && course.times.length > 0 ? (
                                course.times.map((slot, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 min-w-[140px] text-muted-foreground">
                                            <Calendar className="h-4 w-4" />
                                            <span>{formatDay(slot.day)}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{formatTime(slot.start_time)} - {formatTime(slot.end_time)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-muted-foreground">No schedule information available</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Location</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>{course.location || "Location TBD"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <Footer />
        </div>
    )
}
