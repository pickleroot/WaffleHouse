package edu.gcc.wafflehouse;

import java.util.ArrayList;
import java.io.File;
import java.io.FileWriter;
import java.util.Scanner;
import java.io.IOException;

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

    public void removeCourse(Course c) {
        courses.remove(c);
    }
  
    public void saveSchedule() {
        try (FileWriter quill = new FileWriter("../../resources/schedule.csv")) {
            quill.write("Course ID\n");
            for (Course c : courses) {
                quill.write(c.getId() + "\n");
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void loadSchedule() {
        File scheduleFile = new File("../../resources/schedule.csv");
        try (Scanner papyrus = new Scanner(scheduleFile)) {
            if (papyrus.hasNextLine()) {
                papyrus.nextLine(); // reads header of CSV file
                while (papyrus.hasNextLine()) {
                    addCourse(/*make a course from the course code*/);
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
