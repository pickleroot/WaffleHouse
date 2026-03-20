package edu.gcc.wafflehouse;

import java.util.ArrayList;
import java.time.format.DateTimeFormatter;

public class Course {

    // Some extra data
    private static final DateTimeFormatter format = DateTimeFormatter.ofPattern("hh:mm a");

    // Member variables. These *should* mirror closely the member
    // variables in Deserialize.java, just renamed to be more
    // intuitive
    private long id;
    private String subject;
    private int code;
    private char section;
    private String name;
    private ArrayList<Professor> professors;
    private int creditHours;
    private int openSeats;
    private int totalSeats;
    private int year;
    private String semester; // {Fall}, {Spring}, etc.
    private ArrayList<Timeslot> times;
    private boolean isLab;
    private boolean isOpen;
    private String location;

    // For Jackson deserialization
    public Course() {}

    public Course(long id,
                  String subject,
                  int code,
                  char section,
                  String name,
                  ArrayList<Professor> professors,
                  int creditHours,
                  int openSeats,
                  int totalSeats,
                  int year,
                  String semester,
                  ArrayList<Timeslot> times,
                  boolean isLab,
                  boolean isOpen,
                  String location) {
        this.id = id;
        this.subject = subject;
        this.code = code;
        this.section = section;
        this.name = name;
        this.professors = professors;
        this.creditHours = creditHours;
        this.openSeats = openSeats;
        this.totalSeats = totalSeats;
        this.year = year;
        this.semester = semester;
        this.times = times;
        this.isLab = isLab;
        this.isOpen = isOpen;
        this.location = location;
    }
    public Course(Course course) {
        this.id = course.id;
        this.subject = course.subject;
        this.code = course.code;
        this.section = course.section;
        this.name = course.name;
        this.professors = course.professors;
        this.creditHours = course.creditHours;
        this.openSeats = course.openSeats;
        this.totalSeats = course.totalSeats;
        this.year = course.year;
        this.semester = course.semester;
        this.times = course.times;
        this.isLab = course.isLab;
        this.isOpen = course.isOpen;
        this.location = course.location;
    }

    public long getID() {
        return id;
    }
    public String getSubject() {
        return subject;
    }
    public int getCode() {
        return code;
    }
    public char getSection() {
        return section;
    }
    public String getName() {
        return name;
    }
    public ArrayList<Professor> getProfessors() {
        return professors;
    }
    public int getCreditHours() {
        return creditHours;
    }
    public int getOpenSeats() {
        return openSeats;
    }
    public int getTotalSeats() {
        return totalSeats;
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
    public boolean getIsLab() {
        return isLab;
    }
    public boolean getIsOpen() {
        return isOpen;
    }
    public String getLocation() {
        return location;
    }

    // Setters (needed for Jackson deserialization)
    public void setId(long id) {
        this.id = id;
    }
    public void setSubject(String subject) {
        this.subject = subject;
    }
    public void setCode(int code) {
        this.code = code;
    }
    public void setSection(char section) {
        this.section = section;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setProfessors(ArrayList<Professor> professors) {
        this.professors = professors;
    }
    public void setCreditHours(int creditHours) {
        this.creditHours = creditHours;
    }
    public void setOpenSeats(int openSeats) {
        this.openSeats = openSeats;
    }
    public void setTotalSeats(int totalSeats) {
        this.totalSeats = totalSeats;
    }
    public void setYear(int year) {
        this.year = year;
    }
    public void setSemester(String semester) {
        this.semester = semester;
    }
    public void setTimes(ArrayList<Timeslot> times) {
        this.times = times;
    }
    public void setIsLab(boolean isLab) {
        this.isLab = isLab;
    }
    public void setIsOpen(boolean isOpen) {
        this.isOpen = isOpen;
    }
    public void setLocation(String location) {
        this.location = location;
    }

    public boolean equals(Course course) {
        return this.id == course.id;
    }

    public String timesToString() {
        StringBuilder sb = new StringBuilder();
        for (Timeslot time : times) {
            sb.append(time.toString());
        }
        return sb.toString();
    }

    public String professorsToString() {
        StringBuilder sb = new StringBuilder();
        for (Professor prof : professors) {
            sb.append(prof.toString());
        }
        return sb.toString();
    }
}
