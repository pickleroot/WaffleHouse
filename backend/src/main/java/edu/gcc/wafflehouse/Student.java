package edu.gcc.wafflehouse;

/**
 * @author Ina Tang
 */
public class Student extends Profile {
    private String firstName;
    private String lastName;
    private String major;
    private Advisor advisor;

    private Schedule schedule;

    public Schedule getSchedule() {
        if (schedule == null) {
            schedule = new Schedule();
        }
        return schedule;
    }

}
