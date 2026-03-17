package edu.gcc.wafflehouse;

import java.time.LocalTime;

/**
 * Filter by day of the week, earliest start time, and latest end time
 * @author Ina Tang
 */
public class TimeFilter extends Filter {

    /**
     * Initialize timeslot
     * @param timeslot Day of the week, earliest start time, latest end time
     */
    public TimeFilter(Timeslot timeslot) {
        super(timeslot);
    }

    /**
     * Filter by timeslot
     * @param course What you expect
     * @return true if course **contains** a timeslot that sits inside the given timeslot
     */
    @Override
    public boolean apply(Course course) {
        Timeslot thisTs = (Timeslot) getInput();
        for (Timeslot ts : course.getTimes()) {
            // If the course has a slot on one of the desired day of the week
            if (ts.getDay() == thisTs.getDay()) {
                // If that slot is in between the desired start and end time
                LocalTime desiredStart = thisTs.getstart_time();
                LocalTime desiredEnd = thisTs.getend_time();
                if (!ts.getstart_time().isAfter(desiredStart) &&
                        !ts.getend_time().isBefore(desiredEnd)) {
                    return true;
                }
            }
        }
        return false;
    }
}
