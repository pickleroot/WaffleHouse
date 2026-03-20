package edu.gcc.wafflehouse;

import java.time.LocalTime;

/**
 * Timeslot class used to store a class Day of week and time of day.
 * This class was created for quick comparison (as opposed to comparing times as Strings), and for faster date/time formatting
 */
public class Timeslot {
    private char day;
    private LocalTime start_time;
    private LocalTime end_time;

    // For Jackson deserialization
    public Timeslot() {}

    public Timeslot(char day, LocalTime start_time, LocalTime end_time) {
        this.day = day;
        this.start_time = start_time;
        this.end_time = end_time;
    }

    public void setDay(char day) {
        this.day = day;
    }

    public void setEnd_time(LocalTime end_time) {
        this.end_time = end_time;
    }

    public void setStart_time(LocalTime start_time) {
        this.start_time = start_time;
    }

    public char getDay() {
        return day;
    }

    public LocalTime getstart_time() {
        return start_time;
    }

    public LocalTime getend_time() {
        return end_time;
    }

    public String toString() {
        return day + " " + start_time.toString() + " " + end_time.toString();
    }
}
