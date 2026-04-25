import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Professor, Course, Timeslot } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function transformCourse(data: any): Course {
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

export function formatDay(day: string): string {
    const days: Record<string, string> = {
        "M": "Monday",
        "T": "Tuesday",
        "W": "Wednesday",
        "TH": "Thursday",
        "R": "Thursday",
        "F": "Friday",
        "SA": "Saturday",
        "SU": "Sunday"
    }
    return days[day] || day
}

function parseTimeParts(time: string | number[]): [number, number] {
    if (Array.isArray(time)) {
        const [hours = 0, minutes = 0] = time
        return [hours, minutes]
    }

    const [hours = 0, minutes = 0] = time.split(":").map(Number)
    return [hours, minutes]
}

function getPeriod(hours: number): "AM" | "PM" {
    return hours >= 12 ? "PM" : "AM"
}

export function formatTime(
    time: string | number[],
    options: { padHour?: boolean; showPeriod?: boolean } = {}
): string {
    const { padHour = false, showPeriod = true } = options
    const [hours, minutes] = parseTimeParts(time)

    const period = getPeriod(hours)
    const displayHours = hours % 12 || 12
    const hourText = padHour
        ? displayHours.toString().padStart(2, "0")
        : displayHours.toString()
    const base = `${hourText}:${minutes.toString().padStart(2, "0")}`

    return showPeriod ? `${base} ${period}` : base
}

export function formatProfessorName(prof: Professor): string {
    if (prof.firstName && prof.lastName) {
        return `${prof.firstName} ${prof.lastName}`
    }
    return prof.firstName || prof.lastName || "Unknown Professor"
}

/** Convert a time value (array or string) to total minutes for overlap comparison */
export function toMinutes(time: number[] | string): number {
    const [h = 0, m = 0] = parseTimeParts(time);
    return h * 60 + m;
}

export interface GroupedTimeslot {
    days: string[]
    start_time: Timeslot["start_time"]
    end_time: Timeslot["end_time"]
}

const DAY_ORDER = ["M", "T", "W", "TH", "R", "F", "SA", "SU"] as const

function formatCompactDay(day: string): string {
    const compactDays: Record<string, string> = {
        M: "M",
        T: "T",
        W: "W",
        TH: "R",
        R: "R",
        F: "F",
        SA: "Sa",
        SU: "Su",
    }

    return compactDays[day] || day
}

export function groupCourseTimes(times: Timeslot[]): GroupedTimeslot[] {
    const grouped = new Map<string, GroupedTimeslot>()

    for (const slot of times) {
        const key = `${toMinutes(slot.start_time)}-${toMinutes(slot.end_time)}`
        const existing = grouped.get(key)

        if (existing) {
            if (!existing.days.includes(slot.day)) {
                existing.days.push(slot.day)
            }
            continue
        }

        grouped.set(key, {
            days: [slot.day],
            start_time: slot.start_time,
            end_time: slot.end_time,
        })
    }

    return Array.from(grouped.values())
        .map((group) => ({
            ...group,
            days: [...group.days].sort(
                (a, b) => DAY_ORDER.indexOf(a as (typeof DAY_ORDER)[number]) - DAY_ORDER.indexOf(b as (typeof DAY_ORDER)[number])
            ),
        }))
        .sort((a, b) => {
            const startDiff = toMinutes(a.start_time) - toMinutes(b.start_time)
            if (startDiff !== 0) return startDiff

            return toMinutes(a.end_time) - toMinutes(b.end_time)
        })
}

export function formatTimeslotDays(days: string[], options: { compact?: boolean } = {}): string {
    if (options.compact) {
        return days.map(formatCompactDay).join("")
    }

    return days.map(formatDay).join(", ")
}

export function formatTimeRange(
    start: string | number[],
    end: string | number[],
    options: { padHour?: boolean } = {}
): string {
    const [startHours] = parseTimeParts(start)
    const [endHours] = parseTimeParts(end)
    const samePeriod = getPeriod(startHours) === getPeriod(endHours)

    if (samePeriod) {
        return `${formatTime(start, { ...options, showPeriod: false })}-${formatTime(end, { ...options, showPeriod: false })} ${getPeriod(endHours)}`
    }

    return `${formatTime(start, { ...options, showPeriod: true })}-${formatTime(end, { ...options, showPeriod: true })}`
}

export function formatCourseTimes(
    times: Timeslot[],
    options: { compactDays?: boolean } = {}
): string {
    if (!times.length) return ""

    return groupCourseTimes(times)
        .map((group) => {
            const dayLabel = formatTimeslotDays(group.days, { compact: options.compactDays })
            const timeLabel = formatTimeRange(group.start_time, group.end_time, { padHour: options.compactDays })
            return `${dayLabel} ${timeLabel}`
        })
        .join(", ")
}

/**
 * Format a backend semester key like "2025_Spring" or "2024_Winter_Online"
 * into a human-readable label like "Spring 2025" or "Winter Online 2024".
 */
export function formatSemester(raw: string): string {
    const parts = raw.split("_");
    if (parts.length < 2) return raw;
    const [year, ...rest] = parts;
    return `${rest.join(" ")} ${year}`;
}

/**
 * Sort backend semester keys from most recent to oldest. Within a year,
 * order by season: Winter > Fall > Summer > Spring (the most recent term first).
 */
export function sortSemestersDescending(semesters: string[]): string[] {
    const seasonOrder: Record<string, number> = {
        Winter: 4,
        Fall: 3,
        Summer: 2,
        Spring: 1,
    };
    return [...semesters].sort((a, b) => {
        const [yearA, seasonA = ""] = a.split("_");
        const [yearB, seasonB = ""] = b.split("_");
        const yearDiff = parseInt(yearB, 10) - parseInt(yearA, 10);
        if (yearDiff !== 0) return yearDiff;
        const sa = seasonOrder[seasonA] ?? 0;
        const sb = seasonOrder[seasonB] ?? 0;
        if (sb !== sa) return sb - sa;
        // Stable order for modifiers (e.g., "_Online" vs base) — base before modifier
        return a.length - b.length;
    });
}
