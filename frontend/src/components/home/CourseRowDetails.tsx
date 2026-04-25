import { useEffect, useMemo, useState } from "react"
import {
    formatCourseTimes,
    formatProfessorName,
    formatSemester,
} from "@/lib/utils"
import type { Course, Professor } from "@/lib/types"
import {
    getRateMyProfessorMatches,
    type RateMyProfessorMatch,
} from "@/lib/rateMyProfessor"

interface CourseRowDetailsProps {
    course: Course
}

interface RateMyProfessorState {
    isLoading: boolean
    error: string | null
    matches: Array<{
        professor: Professor
        match: RateMyProfessorMatch
    }>
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

function formatMetric(
    value: number | null,
    formatter: (value: number) => string
): string {
    return value == null ? "Not enough ratings" : formatter(value)
}

export default function CourseRowDetails({ course }: CourseRowDetailsProps) {
    const professorNames = useMemo(
        () => course.professors.map(formatProfessorName).filter((name) => name !== "Unknown Professor"),
        [course.professors]
    )
    const professorLookupKey = professorNames.join("|")
    const professors = professorNames.length > 0
        ? professorNames.join(", ")
        : "Instructor TBD"
    const schedule = course.times.length > 0
        ? formatCourseTimes(course.times)
        : "No schedule information available"
    const seats = `${course.openSeats} / ${course.totalSeats} seats available`
    const courseLabel = `${course.subject} ${course.code}-${course.section}`
    const status = course.isOpen ? "Open" : "Closed"
    const type = course.isLab ? "Lab" : "Lecture"
    const [rateMyProfessorState, setRateMyProfessorState] = useState<RateMyProfessorState>({
        isLoading: false,
        error: null,
        matches: [],
    })

    useEffect(() => {
        let isActive = true

        if (professorNames.length === 0) {
            setRateMyProfessorState({
                isLoading: false,
                error: null,
                matches: [],
            })
            return () => {
                isActive = false
            }
        }

        setRateMyProfessorState((current) => ({
            ...current,
            isLoading: true,
            error: null,
        }))

        getRateMyProfessorMatches(course.professors)
            .then((matches) => {
                if (!isActive) return

                setRateMyProfessorState({
                    isLoading: false,
                    error: null,
                    matches,
                })
            })
            .catch((error: unknown) => {
                if (!isActive) return

                setRateMyProfessorState({
                    isLoading: false,
                    error: error instanceof Error ? error.message : "Unable to load Rate My Professors data.",
                    matches: [],
                })
            })

        return () => {
            isActive = false
        }
    }, [professorLookupKey])

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

            {(rateMyProfessorState.isLoading
                || rateMyProfessorState.error
                || rateMyProfessorState.matches.length > 0) && (
                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                            Rate My Professors
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Current Grove City College matches for instructors on this course.
                        </p>
                    </div>

                    {rateMyProfessorState.isLoading && (
                        <p className="text-sm text-muted-foreground">
                            Loading professor ratings...
                        </p>
                    )}

                    {!rateMyProfessorState.isLoading && rateMyProfessorState.error && (
                        <p className="text-sm text-muted-foreground">
                            {rateMyProfessorState.error}
                        </p>
                    )}

                    {!rateMyProfessorState.isLoading && !rateMyProfessorState.error && (
                        <div className="grid gap-3 lg:grid-cols-2">
                            {rateMyProfessorState.matches.map(({ professor, match }) => (
                                <div
                                    key={`${match.id}-${formatProfessorName(professor)}`}
                                    className="rounded-md border border-border/70 bg-background px-4 py-3"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-semibold text-foreground">
                                                {match.professorName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {match.department}
                                            </p>
                                        </div>

                                        <a
                                            href={match.profileUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                                        >
                                            View Profile
                                        </a>
                                    </div>

                                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <DetailItem
                                            label="Overall Quality"
                                            value={formatMetric(match.overallQuality, (value) => value.toFixed(1))}
                                        />
                                        <DetailItem
                                            label="Difficulty"
                                            value={formatMetric(match.difficulty, (value) => value.toFixed(1))}
                                        />
                                        <DetailItem
                                            label="Would Take Again"
                                            value={formatMetric(match.wouldTakeAgainPercent, (value) => `${Math.round(value)}%`)}
                                        />
                                        <DetailItem
                                            label="Ratings"
                                            value={`${match.ratingsCount}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
