package edu.gcc.wafflehouse;


/**
 * Filter based on specific credit hour, e.g., 1, 2, 3, 4
 * @author Ina Tang
 */
public class CreditHourFilter extends Filter {

    public CreditHourFilter(Object credit) {
        super(credit);
    }

    /**
     * Returns the courses with the given number of credit hours
     */
    @Override
    protected boolean apply(Course course) {
        return course.getCreditHours() == (int) getInput();
    }
}
