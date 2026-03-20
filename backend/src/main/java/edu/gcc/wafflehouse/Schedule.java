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
     * Stores a reference to the passed-in object rather than a copy, so that
     * mutations on the Course (e.g. seat count changes) are immediately visible
     * through the Schedule without any extra synchronization.
     * @param course The Course to add. Should be the live object from Search.
     * @return boolean - Whether the Course was added.
     */
    public boolean addCourse(Course course) {
        if (hasCourse(course)) {
            return false;
        } else {
            courses.add(course);   // store reference, not a copy
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
     * Save the schedule as a list of course IDs to a JSON file in the
     * working directory (wherever the server process is running from).
     * IDs are saved rather than full Course objects so that on load we can
     * look up live references in Search — keeping seat counts in sync.
     * @throws IOException Thrown if ObjectMapper has issues writing the file.
     */
    public void saveSchedule() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        List<Long> ids = courses.stream()
                .map(Course::getID)
                .collect(Collectors.toList());
        // Anchor to the JVM working directory so the path is predictable
        // regardless of how the server is launched.
        File file = new File(System.getProperty("user.dir"), "schedule.json");
        file.getParentFile().mkdirs(); // ensure parent dirs exist
        mapper.writeValue(file, ids);
    }

    /**
     * Load the schedule from a JSON file in the working directory.
     * Reads the saved course IDs and looks each one up in Search to get the
     * live Course reference — so seat counts remain shared with Search.
     * Courses whose IDs no longer exist in Search are silently skipped.
     * If the save file does not exist yet, this is a no-op (schedule stays empty).
     * @param search The Search instance holding the live course objects.
     * @throws IOException Thrown if the file exists but cannot be read or parsed.
     */
    public void loadSchedule(Search search) throws IOException {
        File file = new File(System.getProperty("user.dir"), "schedule.json");
        // No save file yet — nothing to load, leave the schedule as-is
        if (!file.exists()) return;
        ObjectMapper mapper = new ObjectMapper();
        List<Long> ids = mapper.readValue(file, new TypeReference<List<Long>>() {});
        this.courses = new ArrayList<>();
        for (long id : ids) {
            Course course = search.searchByID(id);
            if (course != null) {
                courses.add(course);  // store live reference, same as addCourse
            }
        }
    }
}
