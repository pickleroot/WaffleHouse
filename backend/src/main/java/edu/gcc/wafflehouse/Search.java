package edu.gcc.wafflehouse;

import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Implements a pseudo database,
 * @author Ina Tang
 */
public class Search {

    // The main member variables.
    private ArrayList<Course> courses;  // temporary db
    private ArrayList<Course> results;  // results from searching the query; "cache"

    // Filters: Hardcoded one-by-one so we have easy access to each
    // type of filter (not all in one list w/o clear order)
    public SemesterFilter semeFilter;
    public CourseNameFilter nameFilter;
    public ProfessorFilter profFilter;
    public DepartmentFilter deptFilter;
    public TimeFilter timeFilter;
    public CreditHourFilter credFilter;

    /**
     * Initialize the pseudo database, cached results, and filters.
     */
    public Search() {
        this.courses = new ArrayList<>();
        this.results = new ArrayList<>();

        // Initialize filters with null input (null = no filtering)
        this.semeFilter = new SemesterFilter(null);
        this.nameFilter = new CourseNameFilter(null);
        this.profFilter = new ProfessorFilter(null);
        this.deptFilter = new DepartmentFilter(null);
        this.timeFilter = new TimeFilter(null);
        this.credFilter = new CreditHourFilter(null);
    }

    /**
     * Search the database for courses where the query string
     * matches either the course ID, name, subject, code, full code,
     * and professors. Fields are converted to strings so that the substring
     * can be searched in them.
     * @param query The user's input.
     * @return ArrayList<Course> - Courses with at least one field from name,
     * code, dept, or faculty containing query as a substring.
     */
    public ArrayList<Course> search(String query) {
        ArrayList<Course> results = new ArrayList<>();

        // Return null if the query is empty.
        if (query == null) {
            this.results = results;
            return results;
        }

        // Convert to lowercase for more general search.
        String q = query.toLowerCase();

        // Loop through the courses loaded in the pseudo-database
        // and add any course that matches the if statements.
        for (Course c : courses) {

            boolean match = false;

            if (c.getName().toLowerCase().contains(q)) {
                match = true;
            }

            if (c.getSubject().toLowerCase().contains(q)) {
                match = true;
            }

            if (String.valueOf(c.getCode()).toLowerCase().contains(q)) {
                match = true;
            }

            // Combine the subject (COMP) and code (141) so that a search for
            // the combination returns correctly.
            String fullCode = (c.getSubject() + " " + c.getCode()).toLowerCase();
            if (fullCode.contains(q)) {
                match = true;
            }

            if (c.getProfessors() != null &&
                    c.getProfessors().toString().toLowerCase().contains(q)) {
                match = true;
            }

            try {
                if (c.getID() == Long.parseLong(q)) {
                    match = true;
                }
            } catch (NumberFormatException ignored) {
            }

            // open next semester NOT IMPLEMENTED YET

            if (match) {
                results.add(c);
            }
        }

        this.results = results;
        return results;
    }

    /**
     * Search the pseudo-database for the course identified by the ID.
     * @param id The course ID to search for.
     * @return Course - The reference to the course.
     */
    public Course searchByID(long id) {
        for (Course course : courses) {
            if (course.getID() == id) {
                return course;
            }
        }
        return null;
    }

    /**
     * Apply the filters one-by-one, using a predicate approach.
     * @return filtered results
     */
    public ArrayList<Course> getFilteredResults() {
        return (ArrayList<Course>) results.stream()
                .filter(course -> semeFilter.matches(course))
                .filter(course -> nameFilter.matches(course))
                .filter(course -> profFilter.matches(course))
                .filter(course -> deptFilter.matches(course))
                .filter(course -> timeFilter.matches(course))
                .filter(course -> credFilter.matches(course))
                .collect(Collectors.toList());
    }

    public void setCourses(ArrayList<Course> courses ) {
        this.courses = courses;
    }
}
