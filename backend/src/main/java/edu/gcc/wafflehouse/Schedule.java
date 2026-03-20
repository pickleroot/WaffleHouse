package edu.gcc.wafflehouse;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import java.io.IOException;
import java.io.File;

/**
 * Interface for organizing courses / wrapper class for ArrayList of Courses
 * @author Ina Tang
 * @author pickleroot
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
     * [AI Code] Add the Course only if it is not already present in the Schedule.
     * Stores a reference to the Course object that is in Search so that the user's schedule reflects
     * changes to courses in the Search object.
     * @param course The Course to add. This is a reference to the Course object in Search.
     * @return boolean - Whether the Course was added.
     */
    public boolean addCourse(Course course) {
        if (hasCourse(course)) {
            return false;
        } else {
            courses.add(course);
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
     * [AI Code] Save the user's schedule to a JSON file.
     * Saves the course IDs to a JSON file, that way when they are
     * retrieved a lookup is required, and the user's schedule
     * will accurately reflect any state changes in the backend since
     * last save.
     * @throws IOException If ObjectMapper struggles?
     */
    public void saveSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        List<Long> ids = courses.stream()
                .map(Course::getID)
                .collect(Collectors.toList());
        // Ensures the filepath is the same no matter where this is run from.
        File file = new File(System.getProperty("user.dir"), "schedule.json");
        file.getParentFile().mkdirs(); // ensure parent dirs exist
        mapper.writeValue(file, ids);
    }

    /**
     * [AI Code] Load the schedule from the JSON file.
     * Loads the course IDs from the file and searches for the course
     * in Search, and adds it to the schedule if it exists.
     * @throws IOException If ObjectMapper struggles?
     */
    public void loadSchedule(Search search) throws IOException {
        File file = new File(System.getProperty("user.dir"), "schedule.json");
        // Returns null if the file does not exist (avoids an error thrown by ObjectMapper).
        if (!file.exists()) return;
        ObjectMapper mapper = new ObjectMapper();
        List<Long> ids = mapper.readValue(file, new TypeReference<List<Long>>() {});
        this.courses = new ArrayList<>();
        for (long id : ids) {
            Course course = search.searchByID(id);
            if (course != null) {
                courses.add(course);
            }
        }
    }
}
