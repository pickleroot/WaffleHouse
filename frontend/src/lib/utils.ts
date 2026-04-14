import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Professor, Timeslot } from "@/lib/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface BackendCourse {
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

export interface DisplayCourse {
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

export function transformCourse(data: BackendCourse): DisplayCourse {
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
        "F": "Friday",
        "SA": "Saturday",
        "SU": "Sunday"
    }
    return days[day] || day
}

export function formatTime(time: string | number[]): string {
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

export function formatProfessorName(prof: Professor): string {
    if (prof.firstName && prof.lastName) {
        return `${prof.firstName} ${prof.lastName}`
    }
    return prof.firstName || prof.lastName || "Unknown Professor"
}

/** Convert a time value (array or string) to total minutes for overlap comparison */
export function toMinutes(time: number[] | string): number {
    if (Array.isArray(time)) {
        const [h = 0, m = 0] = time;
        return h * 60 + m;
    }
    const [h = 0, m = 0] = time.split(":").map(Number);
    return h * 60 + m;
}