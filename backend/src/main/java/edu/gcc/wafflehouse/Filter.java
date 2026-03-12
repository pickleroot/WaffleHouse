package edu.gcc.wafflehouse;

/**
 * Abstract class for all filters to extend
 * @author Ina Tang
 */
public abstract class Filter {
    private Object input;

    /**
     * Save the input in the Filter itself, instead of as a parameter to apply
     * @param input is an Object because we need compatibility with String, Integer, Professor, and Timeslot
     */
    public Filter(Object input) {
        this.input = input;
    }

    /**
     * Safe getter function for getting input in (right now) child classes
     * @return input, as is. Type cast/convert in the specific classes
     */
    public Object getInput() { return input; }

    /**
     * Allow frontend to update backend filters
     * @param input from the frontend
     */
    public void setInput(Object input) { this.input = input; }

    /**
     * Handle the case where input is null (no input to filter)
     * Take care of the NullPointerException here so that we don't have to worry about it in the specific classes
     * @param course
     * @return everything when input is null, filtered results with input is not null
     */
    public boolean matches(Course course) {
        if (input == null) return true;
        return apply(course);
    }

    /**
     * Apply filter using a predicate approached (use with .stream().filter())
     * This is what the specific filters will implement and override
     * @param course
     * @return true if course matches input
     */
    protected abstract boolean apply(Course course);
}
