package edu.gcc.wafflehouse;

/**
 * Helper class for handling filter requests
 * @author Ina Tang
 */
public class FilterRequest {
    public String name;
    public String prof;
    public String dept;
    public String time;
    public String credits;
    // All fields are nullable — null means "don't filter on this"
}
