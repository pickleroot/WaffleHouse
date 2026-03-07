package edu.gcc.wafflehouse;

import java.util.ArrayList;

/**
 * Filter by course name given a (sub)str, i.e., keep course if name contains substr
 */
public class CourseNameFilter extends Filter<String> {
    @Override
    public ArrayList<Course> apply(ArrayList<Course> courses, String substr) {
        ArrayList<Course> matchingCourses = new ArrayList<>();
        for (Course course : courses) {
            if (course.getName().contains(substr)) {
                matchingCourses.add(course);
            }
        }

        // NOTE: Deep copy is not needed, since Course is immutable
        //   and we want our course to reflect the latest info of the course
        return matchingCourses;
    }
}
