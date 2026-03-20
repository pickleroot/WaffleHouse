package edu.gcc.wafflehouse;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalTime;
import java.sql.Time;
import java.util.ArrayList;


/**
 * Object for representing raw course data as read from courses.json.
 *
 * <p>{@code CourseData} is only used for deserialization via Jackson, mapping
 * JSON fields directly to Java fields before being transformed into a {@link Course}.
 * It contains all the course info like:
 * subject, course number, section, faculty, schedule, and seat availability.</p>
 *
 * <p>It also provides helper methods for extracting structured information from
 * composite fields, such as parsing the year and term from the {@code semester}
 * string.</p>
 */
public class CourseData {
    private int credits;
    private ArrayList<String> faculty; // professors teaching this specific section, NOT all professors teaching the class
    private boolean is_lab;
    private boolean is_open;
    private String location;
    private String name;
    private int code; // The number after the subject: COMP {141}, PSYC {201}, etc.
    private int open_seats;
    private char section; // COMP 141 {A}, STAT 331 {B}, etc.
    private String semester;  // e.g. "2024_Fall", "2023_Winter_Online"
    private String subject; // {COMP}, {MATH}, {PSYC}, etc.
    private ArrayList<Timeslot> times; //
    private int total_seats;

    public CourseData() {}

    public int getCredits() {
        return credits;
    }

    public void setCredits(int credits) {
        this.credits = credits;
    }

    public ArrayList<String> getFaculty() {
        return faculty;
    }

    public void setFaculty(ArrayList<String> faculty) {
        this.faculty = faculty;
    }


    public void setis_lab(boolean is_lab) {
        this.is_lab = is_lab;
    }

    public boolean getis_lab() {
        return this.is_lab;
    }

    public boolean getis_open() {
        return this.is_open;
    }

    public void setis_open(boolean is_open) {
        this.is_open = is_open;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCode() {
        return code;
    }

    @JsonProperty("number")
    public void setCode(int code) {
        this.code = code;
    }

    public int getOpen_seats() {
        return open_seats;
    }

    public void setOpen_seats(int open_seats) {
        this.open_seats = open_seats;
    }

    public char getSection() {
        return section;
    }

    public void setSection(char section) {
        this.section = section;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public ArrayList<Timeslot> getTimes() {
        return times;
    }

    public void setTimes(ArrayList<Timeslot> times) {
        this.times = times;
    }

    public int getTotal_seats() {
        return total_seats;
    }

    public void setTotal_seats(int total_seats) {
        this.total_seats = total_seats;
    }

    public int getYearFromSemester() {
        return Integer.parseInt(semester.split("_")[0]);
    }

    public String getSemesterFromSemester() {
        return semester.replaceFirst("\\d*_", "");
    }

}