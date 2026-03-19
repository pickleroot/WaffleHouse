package edu.gcc.wafflehouse;

/**
 * Filter by semester
 * TODO: Change to ENUM from loaded data, like with department and professor
 * @author Ina Tang
 */
public class SemesterFilter extends Filter {
    public SemesterFilter(String semester) {
        super(semester);
    }

    /**
     * Filter by string containment
     * @param course whose semester is in the same format as "2024_Fall", "2023_Winter_Online"
     * @return true if course.getSemester contains input as a substr
     */
    @Override
    protected boolean apply(Course course) {
        return course.getSemester().contains(String.valueOf(getInput()));
    }
}
