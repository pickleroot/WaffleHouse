package edu.gcc.wafflehouse;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Fake database, search function, cached search results, filter functions
 * @author TODO
 */
public class Search {
    private ArrayList<Course> courses;  // temporary db
    private ArrayList<Course> results;  // results from searching the query; "cache"

    // Filters: Hardcoded one-by-one so we have easy access to each type of filter (not all in one list w/o clear order)
    public CourseNameFilter nameFilter;
    public ProfessorFilter profFilter;
    public DepartmentFilter deptFilter;
    public TimeFilter timeFilter;
    public CreditHourFilter credFilter;

    /**
     * Initialize the fake database, cached results, and filters
     */
    public Search() {
        this.courses = new ArrayList<>();
        this.results = new ArrayList<>();

        // Initialize filters with null input (null = no filtering)
        this.nameFilter = new CourseNameFilter(null);
        this.profFilter = new ProfessorFilter(null);
        this.timeFilter = new TimeFilter(null);
        this.credFilter = new CreditHourFilter(null);

        // Populate with test data
        AddTestCourses();
    }

    /**
     * Search the database for matching courses
     * @param query user input
     * @return courses with at least one field matching the entire query
     */
    public ArrayList<Course> search(String query) {
        ArrayList<Course> results = new ArrayList<>();

        // TODO: search through each field of each course in the db and try to match query and save results to this.results
        // This might look like, hardcoding a str.contains for every field of a course
        // This should return all the results that matches from at least one (NOT all) of the filters
        // I.e., this is a OR, not AND gate, as opposed to getFilteredResults

        this.results = results;
//        return results;
        return courses;
    }

    /**
     * Apply the filters one-by-one, using a predicate approach
     * @return filtered results
     */
    public ArrayList<Course> getFilteredResults() {
        return (ArrayList<Course>) results.stream()
                .filter(course -> nameFilter.matches(course))
                .filter(course -> profFilter.matches(course))
                // TODO: uncomment deptFilter once it's implemented
//                    .filter(course -> deptFilter.matches(course))
                .filter(course -> timeFilter.matches(course))
                .filter(course -> credFilter.matches(course))
                .collect(Collectors.toList());
    }


    /**
     * Mostly for testing
     * @return
     */
    public ArrayList<Course> getResults() {
        return results;
    }

    /**
     * Mostly for testing
     * @return
     */
    public ArrayList<Course> getCourses() {
        return courses;
    }

    public Course getCourseByID (int courseID) {

        // TODO: make the course search algorithm more efficient.
        for (Course c : courses) {
            if (c.getId() == courseID) {
                return c;
            }
        }
        return null;
    }

    public void AddTestCourses() {
        ArrayList<Timeslot> csTimes = new ArrayList<>();
        csTimes.add(new Timeslot('M', LocalTime.of(9, 0), LocalTime.of(10, 15)));
        csTimes.add(new Timeslot('W', LocalTime.of(9, 0), LocalTime.of(10, 15)));
        Course cs101 = new Course(
                "Introduction to Computer Science",
                101,
                "CS",
                new Professor("Dr. Smith"),
                3,
                30,
                2025,
                1,
                csTimes
        );
        courses.add(cs101);

        ArrayList<Timeslot> mathTimes = new ArrayList<>();
        mathTimes.add(new Timeslot('T', LocalTime.of(11, 0), LocalTime.of(12, 15)));
        mathTimes.add(new Timeslot('R', LocalTime.of(11, 0), LocalTime.of(12, 15)));

        Course math201 = new Course(
                "Calculus II",
                201,
                "MATH",
                new Professor("Dr. Johnson"),
                4,
                35,
                2025,
                1,
                mathTimes
        );
        courses.add(math201);

        ArrayList<Timeslot> histTimes = new ArrayList<>();
        histTimes.add(new Timeslot('M', LocalTime.of(14, 0), LocalTime.of(15, 15)));
        histTimes.add(new Timeslot('W', LocalTime.of(14, 0), LocalTime.of(15, 15)));

        Course hist150 = new Course(
                "World History",
                150,
                "HIST",
                new Professor("Dr. Lee"),
                3,
                40,
                2025,
                1,
                histTimes
        );
        courses.add(hist150);

    }}
