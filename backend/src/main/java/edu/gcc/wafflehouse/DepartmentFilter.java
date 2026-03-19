package edu.gcc.wafflehouse;

/**
 * Filter by department
 * @author Ina Tang
 */
public class DepartmentFilter extends Filter {
    public DepartmentFilter(Object dept) {
        super(dept);
    }

    /**
     * Filter by containment
     * TODO: make department an ENUM based on loaded data and implement as selection instead of input in frontend
     * @param course the Course to filter
     * @return true if input is a substr of dept
     */
    @Override
    protected boolean apply(Course course) {
        return course.getSubject().contains(String.valueOf(getInput()));
    }
}
