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

    /**
     * Make an empty Schedule.
     */
    public Schedule() {
        this.courses = new ArrayList<Course>();
    }

    /**
     * Make a new Schedule from another Schedule.
     * @param schedule The Schedule to copy.
     */
    public Schedule(Schedule schedule) {
        this.courses = new ArrayList<>(schedule.courses);
    }

    /**
     * Set the Schedule's courses.
     * @param courses The courses to copy.
     */
    public Schedule(ArrayList<Course> courses) {
        this.courses = new ArrayList<>(courses);
    }

    /**
     * Return the courses in the Schedule.
     * @return ArrayList<Course> - The schedule.
     */
    public ArrayList<Course> getCourses() {
        return new ArrayList<>(courses);
    }

    /**
     * Return true or false depending on if the Course is in the schedule.
     * @param course The ID of the Course to find.
     * @return boolean - Whether the Course is in the schedule.
     */
    public boolean hasCourse(Course course) {
        for (Course c : courses) {
            if (c.equals(course)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Return the Course based on ID.
     * @param course The ID of the Course to find.
     * @return - The Course if found, otherwise null.
     */
    public Course getCourse(Course course) {
        for (Course c : courses) {
            if (c.equals(course)) {
                return new Course(course);
            }
        }
        return null;
    }

    /**
     * Add the Course only if it is not already present in the Schedule.
     * @param course The ID of the Course to be added.
     * @return boolean - Whether the Course was added.
     */
    public boolean addCourse(Course course) {
        if (hasCourse(course)) {
            return false;
        } else {
            courses.add(new Course(course));
            return true;
        }
    }

    /**
     * Remove a Course from courses if possible.
     * @param course - The Course to remove.
     * @return boolean - Whether the Course was removed.
     */
    public boolean removeCourse(Course course) {
        for (Course c : courses) {
            if (c.equals(course)) {
                courses.remove(c);
                return true;
            }
        }
        return false;
    }

    /**
     * Save the Schedule object to a JSON file.
     * @throws IOException Throw if ObjectMapper has issues.
     */
    public void saveSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(new File("../../resources/schedule.json"), Schedule.class);
    }

    /**
     * Load the Schedule saved in the JSON file.
     * @throws IOException Throw if the ObjectMapper has issues.
     */
    public void loadSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        Schedule temp = mapper.readValue(new File("../../resources/schedule.json"), Schedule.class);
        this.courses = temp.getCourses();
    }
}
