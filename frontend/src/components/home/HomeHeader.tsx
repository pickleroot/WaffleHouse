import SearchCalendarBar from "@/components/search/SearchCalendarBar"
import ScheduleActions from "@/components/home/ScheduleActions"
import ThemePopoverButton from "@/components/theme/ThemePopoverButton"
import UserAvatarButton from "@/components/home/UserAvatarButton"
import type { Mode, Course } from "@/lib/types"
import type { CourseEvent } from "@/components/calendar/BigCalendar"

interface HomeHeaderProps {
    hasSearched: boolean
    setHasSearched: (v: boolean) => void
    setResults: (results: Course[]) => void
    mode: Mode
    setMode: (mode: Mode) => void
    schedule: Course[]
    setSchedule: (s: Course[]) => void
    setEvents: (e: CourseEvent[]) => void
    showToast: (message: string, ok: boolean) => void
}

export default function HomeHeader(props: HomeHeaderProps) {
    return (
        <header className="relative h-16 flex items-center px-6 gap-2">
            <SearchCalendarBar
                hasSearched={props.hasSearched}
                setHasSearched={props.setHasSearched}
                setResults={props.setResults}
                mode={props.mode}
                setMode={props.setMode}
            />
            <div className="ml-auto flex items-center gap-2">
                <ScheduleActions
                    mode={props.mode}
                    schedule={props.schedule}
                    setSchedule={props.setSchedule}
                    setEvents={props.setEvents}
                    showToast={props.showToast}
                />
                <ThemePopoverButton />
                <UserAvatarButton />
            </div>
        </header>
    );
}
