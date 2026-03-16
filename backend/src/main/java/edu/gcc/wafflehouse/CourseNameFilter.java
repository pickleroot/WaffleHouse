package edu.gcc.wafflehouse;

import java.util.ArrayList;

/**
 * Filter by course name given a (sub)str, i.e., keep course if name contains substr
 * @author Ina Tang
 */
public class CourseNameFilter extends Filter {
    public CourseNameFilter(String substr) {
        super(substr);
    }

    /**
     * Checks if course name matches the input
     * @param course
     * @return true if course name contains the input as a substr
     */
    @Override
    public boolean apply(Course course) {
        return course.getName().contains(String.valueOf(getInput()));
    }
}
