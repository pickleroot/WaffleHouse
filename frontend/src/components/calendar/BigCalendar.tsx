import { cn } from "@/lib/utils"

// TODO: Replace with actual type from Java API once available
export interface CourseEvent {
    daysOfWeek: string[]      // e.g. ["M", "W", "F"]
    startTime: string         // e.g. "15:00:00"
    endTime: string           // e.g. "16:45:00"
    courseName: string        // e.g. "Principles of Accounting"
    courseCode: string         // e.g. "300"
    courseDepartment: string  // e.g. "ACCT"
    courseSection: string      // e.g. "D"
    courseLocation: string     // e.g. "HAL 201"
}

const DAYS = ["M", "T", "W", "R", "F"] as const
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const
const START_TIME = 7.5   // 7:30 AM
const END_TIME = 21.5    // 9:30 PM
const FIRST_HOUR = 8     // First whole-hour marker
const LAST_HOUR = 21     // Last whole-hour marker (9 PM)
const HOUR_HEIGHT = 60   // pixels per hour

const COLORS = [
    "bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300",
    "bg-green-500/20 border-green-500 text-green-700 dark:text-green-300",
    "bg-pink-500/20 border-pink-500 text-pink-700 dark:text-pink-300",
    "bg-purple-500/20 border-purple-500 text-purple-700 dark:text-purple-300",
    "bg-orange-500/20 border-orange-500 text-orange-700 dark:text-orange-300",
    "bg-teal-500/20 border-teal-500 text-teal-700 dark:text-teal-300",
] as const

/** Parse "HH:MM:SS" into a decimal hour (e.g. "15:30:00" → 15.5) */
function parseTime(time: string): number {
    const [h, m] = time.split(":").map(Number)
    return h + m / 60
}

/** Deterministic color index from a string */
function hashColor(str: string): number {
    return str.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % COLORS.length
}

function formatHour(hour: number): string {
    const h = hour % 12 === 0 ? 12 : hour % 12
    const period = hour < 12 ? "AM" : "PM"
    return `${h}:00 ${period}`
}

interface BigCalendarProps {
    events?: CourseEvent[]
}

export default function BigCalendar({ events = [] }: BigCalendarProps) {
    const totalHeight = (END_TIME - START_TIME) * HOUR_HEIGHT
    const hourMarkers = Array.from(
        { length: LAST_HOUR - FIRST_HOUR + 1 },
        (_, i) => FIRST_HOUR + i
    ) // [8, 9, 10, ..., 21]

    return (
        <div className="flex flex-col w-full max-h-[70vh] overflow-auto">
            {/* Day-of-week header (sticky) */}
            <div className="flex border-b sticky top-0 bg-background z-10">
                <div className="w-20 shrink-0" />
                {DAY_LABELS.map((label, i) => (
                    <div
                        key={DAYS[i]}
                        className="flex-1 text-center py-2 text-sm font-medium text-muted-foreground"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Time grid (absolute positioning within fixed-height container) */}
            <div className="flex flex-1">
                {/* Time labels */}
                <div className="w-20 shrink-0 relative" style={{ height: totalHeight }}>
                    {hourMarkers.map((hour) => (
                        <div
                            key={hour}
                            className="absolute w-full pr-2 text-right text-xs text-muted-foreground/60"
                            style={{ top: (hour - START_TIME) * HOUR_HEIGHT }}
                        >
                            <span className="block -translate-y-1/2">
                                {formatHour(hour)}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Day columns */}
                {DAYS.map((day) => (
                    <div
                        key={day}
                        className="flex-1 border-l relative"
                        style={{ height: totalHeight }}
                    >
                        {/* Hour grid lines at whole hours */}
                        {hourMarkers.map((hour) => (
                            <div
                                key={hour}
                                className="absolute left-0 right-0 border-t"
                                style={{ top: (hour - START_TIME) * HOUR_HEIGHT }}
                            />
                        ))}

                        {/* Course events for this day */}
                        {events
                            .filter((event) => event.daysOfWeek.includes(day))
                            .map((event, idx) => {
                                const startDecimal = parseTime(event.startTime)
                                const endDecimal = parseTime(event.endTime)
                                const top = (startDecimal - START_TIME) * HOUR_HEIGHT
                                const height = (endDecimal - startDecimal) * HOUR_HEIGHT
                                const colorIndex = hashColor(
                                    `${event.courseDepartment}${event.courseCode}`
                                )

                                return (
                                    <div
                                        key={`${event.courseDepartment}-${event.courseCode}-${event.courseSection}-${idx}`}
                                        className={cn(
                                            "absolute left-0.5 right-0.5 rounded border-l-4 px-1.5 py-1 overflow-hidden text-xs cursor-default",
                                            COLORS[colorIndex]
                                        )}
                                        style={{ top, height }}
                                    >
                                        <p className="font-bold truncate">
                                            {event.courseDepartment} {event.courseCode}-{event.courseSection}
                                        </p>
                                        <p className="truncate">{event.courseName}</p>
                                        <p className="truncate opacity-70">{event.courseLocation}</p>
                                    </div>
                                )
                            })}
                    </div>
                ))}
            </div>
        </div>
    )
}
