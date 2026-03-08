package edu.gcc.wafflehouse;
import java.util.ArrayList;

/**
 * Abstract class for all filters to extend
 * @author Ina Tang (Last edit)
 * @param <T> Type for pattern. E.g. String for CourseNameFilter, Integer for CreditHourFilter, Professor for ProfessorFilter
 */
public abstract class Filter<T> {
    public abstract ArrayList<Course> apply(ArrayList<Course> courses, T pattern);
}
