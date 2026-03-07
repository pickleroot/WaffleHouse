package edu.gcc.wafflehouse;

import java.util.ArrayList;


/**
 * Interface for organizing courses / wrapper class for ArrayList of Courses
 * @author Ina Tang
 */
public class Schedule {
    private ArrayList<Course> courses;

    // Constructors
    public Schedule() {
        this.courses = new ArrayList<Course>();
    }

    public Schedule(ArrayList<Course> courses) {
        this.courses = courses;
    }

    // Methods
    public ArrayList<Course> getCourses() {
        return courses;
    }

    public void addCourse(Course c) {
        courses.add(c);
    }
}
