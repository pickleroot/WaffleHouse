import { Button } from "@/components/ui/button"
import type { Mode, Course } from "@/lib/types"
import type { CourseEvent } from "@/components/calendar/BigCalendar"
import { downloadScheduleIcs } from "@/lib/ical"

interface ScheduleActionsProps {
    mode: Mode
    schedule: Course[]
    setSchedule: (s: Course[]) => void
    setEvents: (e: CourseEvent[]) => void
    showToast: (message: string, ok: boolean) => void
}

/**
 * Save / Load / Export-iCal buttons that live in the page header.
 * Save and Load talk to the Java backend; Export iCal is local.
 */
export default function ScheduleActions({
    mode,
    schedule,
    setSchedule: _setSchedule,
    setEvents: _setEvents,
    showToast,
}: ScheduleActionsProps) {
    return (
        <>
            {/* Export iCal — only meaningful in calendar mode */}
            {mode === "calendar" && (
                <Button
                    variant="outline"
                    size="sm"
                    disabled={schedule.length === 0}
                    onClick={() => {
                        downloadScheduleIcs(schedule);
                        showToast("Schedule exported as iCal.", true);
                    }}
                >
                    Export iCal
                </Button>
            )}
        </>
    );
}
