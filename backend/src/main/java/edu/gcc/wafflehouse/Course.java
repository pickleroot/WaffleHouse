/**
 * @author Sam Mayfield (pickleroot)
 */

package edu.gcc.wafflehouse;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.FileReader;
import java.lang.reflect.Type;
import java.time.DateTimeException;
import java.time.format.DateTimeFormatterBuilder;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

public class Course {
    private static long nextId;

    private static final DateTimeFormatter format = DateTimeFormatter.ofPattern("hh:mm a");
    private String name;
    private int code;
    private String department;
    private ArrayList<Professor> faculty;
    private int creditHours;
    private int capacity;
    private int year;
    private String semester;
    private long id;
    private boolean isLab;
    private boolean isOpen;
    private String location;

    private ArrayList<Timeslot> times;
    private int currentEnrollment;

    public Course(String name, int code, String department, ArrayList<String> faculty, int creditHours, int capacity, int year, String semester, ArrayList<Timeslot> times) {
        this.name = name;
        this.code = code;
        this.department = department;
        this.creditHours = creditHours;
        this.capacity = capacity;
        this.year = year;
        this.semester = semester;
        this.times = times;
        this.currentEnrollment = 0;
        this.id = nextId++;
        this.faculty = new ArrayList<>();

        try {
            for (String prof : faculty) {
                Professor p = new Professor(prof);
                this.faculty.add(p);
            }
        } catch (Exception e) {
            System.out.println(e);
            this.faculty = null;
        }

    }

    public String getName() {
        return name;
    }

    public int getCode() {
        return code;
    }

    public String getDepartment() {
        return department;
    }

    public ArrayList<Professor> getFaculty() {
        return faculty;
    }

    public int getCreditHours() {
        return creditHours;
    }

    public int getCapacity() {
        return capacity;
    }

    public int getYear() {
        return year;
    }

    public String getSemester() {
        return semester;
    }

    public ArrayList<Timeslot> getTimes() {
        return times;
    }

    public int getCurrentEnrollment() {
        return currentEnrollment;
    }

    public long getId() {
        return id;
    }
}
