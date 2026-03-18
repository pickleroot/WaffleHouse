package edu.gcc.wafflehouse;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalTime;
import java.sql.Time;
import java.util.ArrayList;


public class CourseData {
    private int credits;
    private ArrayList<String> faculty;
    private boolean is_lab;
    private boolean is_open;
    private String location;
    private String name;
    private int number;
    private int open_seats;
    private char section;
    private String semester;
    private String subject;
    private ArrayList<Timeslot> times;
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

    public int getNumber() {
        return number;
    }

    public void setNumber(int number) {
        this.number = number;
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



}