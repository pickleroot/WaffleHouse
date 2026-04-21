import type { ColumnDef } from "@tanstack/react-table"
import type { Course } from "@/lib/types"
import type { CourseEvent } from "@/components/calendar/BigCalendar"
import BigCalendar from "@/components/calendar/BigCalendar"
import { DataTable } from "@/components/data/DataTable"

interface CalendarViewProps {
    events: CourseEvent[]
    schedule: Course[]
    scheduleColumns: ColumnDef<any>[]
}

export default function CalendarView({ events, schedule, scheduleColumns }: CalendarViewProps) {
    return (
        <div className="flex-1 flex flex-col items-center max-w-2/3 mt-8">
            <BigCalendar events={events} />
            {schedule.length > 0 && (
                <div className="w-full max-w-4xl mx-auto mt-8">
                    <h2 className="text-lg font-semibold mb-3">My Schedule</h2>
                    <DataTable columns={scheduleColumns} data={schedule} />
                </div>
            )}
        </div>
    );
}
