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
        ArrayList<Course> courses = schedule.getCourses();

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
        app.get("/schedule", ctx -> ctx.json(courses));

        // Get course (for viewing course info)
        app.get("/course/{id}", ctx -> {
            String id = ctx.pathParam("id");
            // Handle cases where the path parameter is missing or empty
            if (id == null || id.isEmpty()) {
                ctx.status(400); // Bad Request
                ctx.result("Missing 'id' path parameter");
                return;
            }
            Course result = search.searchByID(id);  // Search
            ctx.json(result);  // return results in JSON
        });

        // Add course to schedule
        app.post("/course", ctx -> {
            Course course = ctx.bodyAsClass(Course.class);
            schedule.addCourse(course);
            ctx.json(courses);  // return updated schedule
        });

        // Remove course from schedule
        app.delete("/course", ctx -> {
            Course course = ctx.bodyAsClass(Course.class);
            schedule.removeCourse(course);
            ctx.json(courses);  // return updated schedule
        });
    }

}
