package edu.gcc.wafflehouse;

public class Profile {
    private String firstName;
    private String lastName;

    // Getters and setters to make the class JSON-serializable
    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
}
