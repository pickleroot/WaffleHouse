import { toMinutes } from "@/lib/utils"

/**
 * Returns true if the candidate course has a timeslot that overlaps with any
 * timeslot of any course already in the schedule.
 *
 * Two timeslots overlap if they share a day AND one starts before the other ends:
 *   A overlaps B  iff  A.start < B.end  &&  A.end > B.start
 *
 * NOTE: callers are responsible for excluding the candidate from the schedule
 * before calling this, otherwise a course will appear to conflict with itself.
 */
export function courseConflicts(candidate: any, schedule: any[]): boolean {
    for (const scheduled of schedule) {
        for (const candidateSlot of (candidate.times || [])) {
            for (const scheduledSlot of (scheduled.times || [])) {
                if (String(candidateSlot.day) !== String(scheduledSlot.day)) continue;

                const candStart  = toMinutes(candidateSlot.start_time);
                const candEnd    = toMinutes(candidateSlot.end_time);
                const schedStart = toMinutes(scheduledSlot.start_time);
                const schedEnd   = toMinutes(scheduledSlot.end_time);

                if (candStart < schedEnd && candEnd > schedStart) return true;
            }
        }
    }
    return false;
}
