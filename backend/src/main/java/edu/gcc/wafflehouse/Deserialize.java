package edu.gcc.wafflehouse;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.eclipse.jetty.io.ArrayRetainableByteBufferPool;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;

/**
 * The {@code Deserialize} class is responsible for loading and converting
 * course data from the courses.json file into a list of {@link Course} objects.
 *
 * <p>This class uses Jackson's {@link com.fasterxml.jackson.databind.ObjectMapper}
 * to deserialize a {@code courses.json} file located in the application's classpath.
 * The raw JSON data is first mapped into {@link CourseData} objects, then transformed
 * into fully constructed {@link Course} objects.</p>
 *
 * <p>Each {@code Course} is assigned a unique ID during construction.</p>
 *
 * @throws IOException if the {@code courses.json} file cannot be found or accessed
 */

public class Deserialize {

    ArrayList<Course> courses;

    /**
     * Creates a Deserialize object that will save all the courses to an ArrayList of courses
     * @throws IOException
     */
    public Deserialize() throws IOException {

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());

        // Load courses.json
        InputStream is = getClass().getClassLoader().getResourceAsStream("courses.json");
        if (is == null) {
            throw new IOException("Unable to find courses.json in classpath");
        }

        // map values from the json to the Course Data Class
        try {
            ArrayList<CourseData> coursesIn = mapper.readValue(
                    is,
                    new TypeReference<ArrayList<CourseData>>() {}
            );

            // System.out.println("Loaded courses: " + courses.size());

            // initialize courses into an arrayList
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

            /*

            ------- Initial Testing --------
            for (int i = 0; i < 7; i++) {
                System.out.println(courses.get(i).getSemester());
                System.out.println(courses.get(i).getSubject());
                System.out.println(courses.get(i).getCode());
                System.out.println(courses.get(i).getTotalSeats());
                System.out.println(courses.get(i).getProfessors().get(0).toString());
            }

             */


        } catch (Exception e) {
            e.printStackTrace();
        }

    }


    /**
     * Returns the list of deserialized {@link Course} objects.
     *
     * @return an {@link ArrayList} containing all loaded courses
     */
    public ArrayList<Course> getCourses() {
        return courses;
    }

}