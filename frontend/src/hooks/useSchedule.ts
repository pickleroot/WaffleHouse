import { useCallback, useEffect, useState } from "react"
import type { Course } from "@/lib/types"
import type { CourseEvent } from "@/components/calendar/BigCalendar"
import { supabase } from "@/lib/supabase"
import { getSchedule } from "@/services/schedule"
import { toEvents } from "@/lib/courseEvents"

/**
 * Owns the user's saved schedule plus the derived calendar events.
 * `fetchSchedule` re-pulls from the backend; `setSchedule` / `setEvents`
 * are exposed so callers can apply server responses directly (e.g., after
 * the Load Schedule button).
 */
export function useSchedule() {
    const [schedule, setSchedule] = useState<Course[]>([])
    const [events, setEvents] = useState<CourseEvent[]>([])

    const fetchSchedule = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                console.error("User not authenticated");
                return;
            }
            const data = await getSchedule(user.id);
            setSchedule(data || []);
            setEvents(toEvents(data || []));
        } catch (err) {
            console.error("Failed to fetch schedule:", err);
        }
    }, []);

    useEffect(() => {
        fetchSchedule();
    }, [fetchSchedule]);

    return { schedule, events, setSchedule, setEvents, fetchSchedule };
}
