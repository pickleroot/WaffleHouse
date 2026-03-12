package edu.gcc.wafflehouse;
import java.util.ArrayList;

/**
 * Abstract class for all filters to extend
 * @author Ina Tang (Last edit)
 */
public abstract class Filter {
    protected Object input;

    public Filter(Object input) {
        this.input = input;
    }

    public Object getInput() { return input; }

    public void setInput(Object input) { this.input = input; }

    public abstract ArrayList<Course> apply(ArrayList<Course> courses);
}
