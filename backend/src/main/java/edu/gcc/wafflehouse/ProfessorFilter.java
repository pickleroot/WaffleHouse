package edu.gcc.wafflehouse;

import java.util.ArrayList;

/**
 * Filter by single professor str
 * @author Ina Tang
 */
public class ProfessorFilter extends Filter {

    public ProfessorFilter(String prof) {
        super(prof);
    }

    /**
     * TODO: Support multi-select
     * @param course
     * @return true if the input matches any name of the professors in the list
     */
    @Override
    public boolean apply(Course course) {
        String search = ((String) getInput()).toLowerCase();
        ArrayList<Professor> faculty = course.getProfessors();
        if (faculty == null) return false;
        for (Professor prof : faculty) {
            String fullName = prof.toString().toLowerCase();
            if (fullName.contains(search)) return true;
        }
        return false;
    }
}
