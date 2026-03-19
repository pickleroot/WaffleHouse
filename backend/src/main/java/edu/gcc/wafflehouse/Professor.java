package edu.gcc.wafflehouse;

import java.util.ArrayList;

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
