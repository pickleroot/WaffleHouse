package edu.gcc.wafflehouse;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.eclipse.jetty.io.ArrayRetainableByteBufferPool;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

public class Deserialize {

    ArrayList<Course> courses;

    public Deserialize() throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule()); // this line must be present

        File file = new File("backend/src/main/resources/courses.json");


        try {
            ArrayList<CourseData> coursesIn = mapper.readValue(
                    file,
                    new TypeReference<ArrayList<CourseData>>() {}
            );

            // System.out.println("Loaded courses: " + courses.size());

            courses = new ArrayList<>();
            for ( CourseData course : coursesIn) {

                Course c = new Course(
                        course.getName(),
                        course.getNumber(),
                        course.getSubject(),
                        course.getFaculty(),
                        course.getCredits(),
                        course.getTotal_seats(),
                        2026,
                        course.getSemester().substring(5),
                        course.getTimes()
                );

                courses.add(c);
            }

            /*
            for (int i = 0; i < 7; i++) {
                System.out.println(courses.get(i).getSemester());
                System.out.println(courses.get(i).getDepartment());
                System.out.println(courses.get(i).getCode());
                System.out.println(courses.get(i).getCapacity());
                System.out.println(courses.get(i).getFaculty().get(0).toString());
            }
             */

        } catch (Exception e) {
            e.printStackTrace();
        }

    }

    public ArrayList<Course> getCourses() {
        return courses;
    }

}