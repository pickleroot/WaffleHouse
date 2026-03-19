import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Footer from "@/components/Footer.tsx"
import { cn } from "@/lib/utils"
import * as React from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Clock, BookOpen, Users, MapPin, Calendar, GraduationCap } from "lucide-react"

interface Course {
    id: number
    name: string
    code: number
    department: string
    professor: string
    creditHours: number
    year: number
    semester: string
    capacity: number
    currentEnrollment: number
    isOpen: boolean
    location: string
    times: Timeslot[]
    faculty: string[]
}

interface Timeslot {
    day: string
    startTime: string
    endTime: string
}

const SAMPLE_COURSE: Course = {
    id: 1,
    name: "Principles of Accounting",
    code: 201,
    department: "ACCT",
    professor: "Dr. Smith",
    creditHours: 3,
    year: 2024,
    semester: "Fall",
    capacity: 30,
    currentEnrollment: 24,
    isOpen: true,
    location: "Business Building 101",
    times: [
        { day: "Monday", startTime: "09:00 AM", endTime: "10:15 AM" },
        { day: "Wednesday", startTime: "09:00 AM", endTime: "10:15 AM" },
    ],
    faculty: ["Dr. Smith", "Dr. Johnson"],
}

export default function Course() {
    const navigate = useNavigate()
    const params = useParams()
    const [course, setCourse] = React.useState<Course | null>(null)
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
                const res = await fetch(`http://localhost:7001/course?id=${courseId}`)
                if (!res.ok) {
                    throw new Error(`Failed to fetch course: ${res.status} ${res.statusText}`)
                }
                const data: Course = await res.json()
                setCourse(data)
            } catch (err) {
                console.error("Error fetching course:", err)
                setCourse(SAMPLE_COURSE)
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
                                <div>
                                    <CardTitle className="text-2xl">{course.name}</CardTitle>
                                    <CardDescription className="text-lg mt-1">
                                        {course.department} {course.code}
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
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <GraduationCap className="h-4 w-4" />
                                <span>Professor: {course.professor}</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <BookOpen className="h-4 w-4" />
                                <span>{course.creditHours} Credit Hours</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{course.currentEnrollment} / {course.capacity} Students</span>
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
                                            <span>{slot.day}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-muted-foreground" />
                                            <span>{slot.startTime} - {slot.endTime}</span>
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

                    {course.faculty && course.faculty.length > 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Instructors</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {course.faculty.map((prof, index) => (
                                        <div key={index} className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-xs">
                                                    {prof.split(" ").map(n => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm">{prof}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    )
}
