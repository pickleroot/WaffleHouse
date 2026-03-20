package edu.gcc.wafflehouse;

import io.javalin.Javalin;
import java.util.ArrayList;

/**
 * Controller / Router
 * @author Ina Tang
 */
public class Driver {
    /**
     * Register routes / API endpoints for the app
     * @param app Javalin app
     * @param search Search class with all available courses loaded inside
     */
    public static void registerRoutes(Javalin app, Search search) {

        // Create objects for student and schedule
        Student student = new Student();
        Schedule schedule = student.getSchedule();

        // Search database
        app.get("/search", ctx -> {
            String query = ctx.queryParam("q");  // get query

            // Handle cases where the query parameter is missing or empty
            if (query == null || query.isEmpty()) {
                ctx.status(400); // Bad Request
                ctx.result("Missing 'query' parameter");
                return;
            }

            ArrayList<Course> results = search.search(query);  // Search
            ctx.json(results);  // return results in JSON
        });

        // Update filters in the backend and returns the up-to-date filtered cached results
        app.post("/filters", ctx -> {
            // Receive and parse the request body
            FilterRequest req = ctx.bodyAsClass(FilterRequest.class);

            // Hardcoding all the filter names and parsing their queryParams one by one
            // NOTE: this is actually easier than using a List of filters
            //       b/c we need 1-1 correspondence btw data and the specific filter

            // Set all inputs for the filters
            search.semeFilter.setInput(req.semester);
            search.nameFilter.setInput(req.name);
            search.profFilter.setInput(req.prof);
            search.deptFilter.setInput(req.dept);
            search.timeFilter.setInput(req.time);
            search.credFilter.setInput(req.credits);

            // TODO: (sprint 2) make it more secure by switching search filters to private variables? IDK

            // Send filtered results back
            // NOTE: We don't have to worry about updating the frontend, since it's state will save (hopefully)
            ArrayList<Course> results = search.getFilteredResults();
            ctx.json(results);
        });

        // Get (courses in user's) schedule
        app.get("/schedule", ctx -> ctx.json(schedule.getCourses()));

        // Get course from path. Returns null if course ID
        // does not exist.
        app.get("/course/{id}", ctx -> {
            String query = ctx.pathParam("id");
            // Handle cases where the path parameter is missing or empty
            if (query.isEmpty() || query.matches("[^0-9]+")) {
                ctx.status(400); // Bad Request
                ctx.result("Missing proper 'id' path parameter");
                return;
            }
            long id = Long.parseLong(query);
            ctx.json(search.searchByID(id));  // return results in JSON
        });

        // Add a Course to the Schedule, and return success or failure.
        // Looks up the live Course object in Search by ID so that Schedule stores
        // a reference to the same object — meaning seat count changes are reflected
        // everywhere that holds a reference to that Course.
        // Seat count is only adjusted for open courses — closed courses may still be
        // added to the schedule, but their seat count is left unchanged.
        app.post("/course", ctx -> {
            Course incoming = ctx.bodyAsClass(Course.class);
            Course actual = search.searchByID(incoming.getID());
            if (actual == null) {
                ctx.status(404);
                ctx.result("Course not found");
                return;
            }
            boolean added = schedule.addCourse(actual);
            if (added && actual.getIsOpen()) {
                actual.decrementOpenSeats();
            }
            ctx.json(added);
        });

        // Remove a Course from the Schedule, and return success or failure.
        // Uses the live reference stored in Schedule so the same object whose
        // seat count was decremented on add is incremented on remove.
        // Seat count is only restored for open courses, matching the add behaviour.
        app.delete("/course", ctx -> {
            Course incoming = ctx.bodyAsClass(Course.class);
            Course actual = search.searchByID(incoming.getID());
            if (actual == null) {
                ctx.status(404);
                ctx.result("Course not found");
                return;
            }
            boolean removed = schedule.removeCourse(actual);
            if (removed && actual.getIsOpen()) {
                actual.incrementOpenSeats();
            }
            ctx.json(removed);
        });

        // Save the current schedule to disk as a list of course IDs.
        app.post("/schedule/save", ctx -> {
            try {
                schedule.saveSchedule();
                ctx.status(200);
                ctx.result("Schedule saved");
            } catch (Exception e) {
                ctx.status(500);
                ctx.result("Failed to save schedule: " + e.getMessage());
            }
        });

        // Load the schedule from disk, rehydrating live Course references from Search.
        // Returns the loaded schedule so the frontend can update its state.
        app.post("/schedule/load", ctx -> {
            try {
                schedule.loadSchedule(search);
                ctx.json(schedule.getCourses());
            } catch (Exception e) {
                ctx.status(500);
                ctx.result("Failed to load schedule: " + e.getMessage());
            }
        });
    }

}
