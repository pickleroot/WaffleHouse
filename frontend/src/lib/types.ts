/* Shared types and interfaces */

// Track state of SearchBarCalendar
export type Mode = "search" | "calendar"

export interface Professor {
    firstName: string
    lastName: string
}

export interface Timeslot {
    day: string
    start_time: string
    end_time: string
}

// Wrapper for Course class in frontend
export interface Course {
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

export interface SearchCalendarBarProps {
  hasSearched: boolean;
  setHasSearched: (value: boolean) => void;
  setResults: (results: Course[]) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
}