package edu.gcc.wafflehouse;

import java.util.ArrayList;
import java.util.stream.Collectors;

/**
 * Fake database, search function, cached search results, filter functions
 * @author Ina Tang
 */
public class Search {
    private ArrayList<Course> courses;  // temporary db
    private ArrayList<Course> results;  // results from searching the query; "cache"

    // Filters: Hardcoded one-by-one so we have easy access to each type of filter (not all in one list w/o clear order)
    public SemesterFilter semeFilter;
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
        this.semeFilter = new SemesterFilter(null);
        this.nameFilter = new CourseNameFilter(null);
        this.profFilter = new ProfessorFilter(null);
        this.deptFilter = new DepartmentFilter(null);
        this.timeFilter = new TimeFilter(null);
        this.credFilter = new CreditHourFilter(null);
    }

    /**
     * Search the database for matching courses
     *
     * @param query user input
     * @return courses with at least one field from name, code, dept, or faculty containing query as a substr
     */
    public ArrayList<Course> search(String query) {
        ArrayList<Course> results = new ArrayList<>();

        if (query == null) {
            this.results = results;
            return results;
        }

        String q = query.toLowerCase();

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

    public Course searchByID(long id) {
        for (Course course : courses) {
            if (course.getID() == id) {
                return course;
            }
        }
        return null;
    }

    /**
     * Apply the filters one-by-one, using a predicate approach
     *
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
