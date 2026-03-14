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
    private Professor prof;
    private int creditHours;
    private int capacity;
    private int year;
    private int semester;
    private long id;
    private ArrayList<Timeslot> times;

    public Course(String name, int code, String department, Professor prof, int creditHours, int capacity, int year, int semester, ArrayList<Timeslot> times) {
        this.name = name;
        this.code = code;
        this.department = department;
        this.prof = prof;
        this.creditHours = creditHours;
        this.capacity = capacity;
        this.year = year;
        this.semester = semester;
        this.times = times;
        this.id = nextId++;
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

    public Professor getProf() {
        return prof;
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

    public int getSemester() {
        return semester;
    }

    public ArrayList<Timeslot> getTimes() {
        return times;
    }

    public long getId() {
        return id;
    }
}
