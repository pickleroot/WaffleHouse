package edu.gcc.wafflehouse;

import java.util.ArrayList;

/**
 * Represents a professor entity, extending the {@link Profile} class.
 *
 * <p>This class is used to model instructor data associated with courses.
 * It supports both manual instantiation and Jackson-based deserialization.</p>
 *
 * <p>When constructed with a single {@code String} name,
 * the input is parsed into first and last name components and stored via
 * inherited {@link Profile} fields. If only one name is provided, it is
 * treated as the first name.</p>
 *
 * <p>This class has a method to convert a list of
 * professor name strings into a list of {@code Professor} objects,</p>
 */
public class Professor extends Profile {

    // For Jackson deserialization
    public Professor() {}

    public Professor(String name) {
        super();
        // Parse "Dr. Smith" style names into first/last
        String[] parts = name.trim().split("\\s+", 2);
        if (parts.length == 2) {
            setFirstName(parts[0]);
            setLastName(parts[1]);
        } else {
            setFirstName(name);
        }
    }

    /**
     * Converts a list of Strings into Professor objects.
     * @param professorsString
     * @return
     */
    public static ArrayList<Professor> convertProfessors(ArrayList<String> professorsString) {
        ArrayList<Professor> professors = new ArrayList<>();
        for (String professor :  professorsString) {
            professors.add(new Professor(professor));
        }
        return professors;
    }

    public String toString() {
        return getFirstName() + " " + getLastName();
    }
}
