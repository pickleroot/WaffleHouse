package edu.gcc.wafflehouse;

import java.util.ArrayList;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.IOException;
import java.io.File;

/**
 * Interface for organizing courses / wrapper class for ArrayList of Courses
 * @author Ina Tang
 */
public class Schedule {

    private ArrayList<Course> courses;

    // Constructors
    // Do we need to make a new ArrayList?
    public Schedule() {
        this.courses = new ArrayList<Course>();
    }

    public Schedule(ArrayList<Course> courses) {
        this.courses = courses;
    }

    // Methods
    public ArrayList<Course> getCourses() {
        return new ArrayList<>(courses);
    }

    public void addCourse(Course c) {
        courses.add(c);
    }

    public void removeCourse(Course c) {
        courses.remove(c);
    }

    // This should work.
    public void saveSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(new File("../../resources/schedule.csv"), Schedule.class);
    }

    // Not great, but it'll get the job done.
    // It makes a new Schedule object, but then only uses the courses from it. Ideally we would overwrite the
    // Schedule object calling, or just save the courses and only import that.
    public void loadSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Schedule temp = mapper.readValue(new File("../../resources/schedule.csv"), Schedule.class);
        this.courses = temp.courses;
    }
}
