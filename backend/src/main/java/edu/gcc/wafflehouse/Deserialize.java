package edu.gcc.wafflehouse;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.eclipse.jetty.io.ArrayRetainableByteBufferPool;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

public class Deserialize {

    ArrayList<Course> courses;

    public Deserialize() throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        InputStream is = getClass().getClassLoader().getResourceAsStream("courses.json");
        if (is == null) {
            throw new IOException("Unable to find courses.json in classpath");
        }

        try {
            ArrayList<CourseData> coursesIn = mapper.readValue(
                    is,
                    new TypeReference<ArrayList<CourseData>>() {}
            );

            // System.out.println("Loaded courses: " + courses.size());

            courses = new ArrayList<>();
            long id = 1;
            for (CourseData course : coursesIn) {
                Course c = new Course(
                        id,
                        course.getSubject(),
                        course.getCode(),
                        course.getSection(),
                        course.getName(),
                        Professor.convertProfessors(course.getFaculty()),
                        course.getCredits(),
                        course.getOpen_seats(),
                        course.getTotal_seats(),
                        course.getYearFromSemester(),
                        course.getSemesterFromSemester(),
                        course.getTimes(),
                        course.getis_lab(),
                        course.getis_open(),
                        course.getLocation()
                );
                courses.add(c);
                id++;
            }


            for (int i = 0; i < 7; i++) {
                System.out.println(courses.get(i).getSemester());
                System.out.println(courses.get(i).getSubject());
                System.out.println(courses.get(i).getCode());
                System.out.println(courses.get(i).getTotalSeats());
                System.out.println(courses.get(i).getProfessors().get(0).toString());
            }


        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public ArrayList<Course> getCourses() {
        return courses;
    }

}