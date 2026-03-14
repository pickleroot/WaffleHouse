package edu.gcc.wafflehouse;

public class ProfessorFilter extends Filter {

    public ProfessorFilter(String prof) {
        super(prof);
    }

    @Override
    public boolean apply(Course course) {
        return true;
    }
}
