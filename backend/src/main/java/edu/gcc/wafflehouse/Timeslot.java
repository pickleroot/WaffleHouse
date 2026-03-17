package edu.gcc.wafflehouse;

import java.time.LocalTime;

public class Timeslot {
    private char day;
    private LocalTime start_time;
    private LocalTime end_time;


    public Timeslot() {}
    public Timeslot(char day, LocalTime start_time, LocalTime end_time) {
        this.day = day;
        this.start_time = start_time;
        this.end_time = end_time;
    }

    public void setDay(char day) {
        this.day = day;
    }

    public void setend_time(LocalTime end_time) {
        this.end_time = end_time;
    }

    public void setstart_time(LocalTime start_time) {
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
}
