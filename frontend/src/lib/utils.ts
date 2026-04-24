import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Professor, Course } from "@/lib/types"

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