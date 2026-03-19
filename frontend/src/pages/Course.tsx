import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Footer from "@/components/Footer.tsx"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Users, MapPin, Calendar, GraduationCap } from "lucide-react"
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

export default function Course() {
    const navigate = useNavigate()
    const params = useParams()
    const [course, setCourse] = React.useState<DisplayCourse | null>(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        const fetchCourse = async () => {
            const courseId = params.id
            if (!courseId) {
                setError("No course ID provided")
                setLoading(false)
                return
            }

            try {
                const res = await fetch(`http://localhost:7001/course/${courseId}`)
                if (!res.ok) {
                    throw new Error(`Failed to fetch course: ${res.status} ${res.statusText}`)
                }
                const data: BackendCourse = await res.json()
                const displayCourse = transformCourse(data)
                setCourse(displayCourse)
            } catch (err) {
                console.error("Error fetching course:", err)
                setError("Failed to load course details")
            } finally {
                setLoading(false)
            }
        }

        fetchCourse()
    }, [params.id])

    const handleBack = () => {
        navigate("/")
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
