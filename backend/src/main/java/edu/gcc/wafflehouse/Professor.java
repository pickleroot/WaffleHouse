package edu.gcc.wafflehouse;

public class Professor extends Profile {

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

    public String toString() {
        return getFirstName() + " " + getLastName();
    }
}
