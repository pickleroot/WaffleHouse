import { Button } from "@/components/ui/button"
import type { Mode, Course } from "@/lib/types"
import type { CourseEvent } from "@/components/calendar/BigCalendar"
import { downloadScheduleIcs } from "@/lib/ical"
import { toEvents } from "@/lib/courseEvents"

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
    setSchedule,
    setEvents,
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
            <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                    try {
                        const res = await fetch("http://localhost:7001/schedule/save", {
                            method: "POST",
                        });
                        if (!res.ok) {
                            showToast("Failed to save schedule.", false);
                            console.error("Failed to save schedule:", await res.text());
                        } else {
                            showToast("Schedule saved successfully.", true);
                        }
                    } catch (err) {
                        showToast("Failed to save schedule.", false);
                        console.error("Error saving schedule:", err);
                    }
                }}
            >
                Save Schedule
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                    try {
                        const res = await fetch("http://localhost:7001/schedule/load", {
                            method: "POST",
                        });
                        if (!res.ok) {
                            showToast("Failed to load schedule.", false);
                            console.error("Failed to load schedule:", await res.text());
                            return;
                        }
                        const data = await res.json();
                        setSchedule(data);
                        setEvents(toEvents(data));
                        showToast("Schedule loaded successfully.", true);
                    } catch (err) {
                        showToast("Failed to load schedule.", false);
                        console.error("Error loading schedule:", err);
                    }
                }}
            >
                Load Schedule
            </Button>
        </>
    );
}
