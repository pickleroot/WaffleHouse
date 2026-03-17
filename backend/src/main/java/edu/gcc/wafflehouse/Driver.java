package edu.gcc.wafflehouse;

import io.javalin.Javalin;
import java.util.ArrayList;

/**
 * Controller / Router
 * @author Ina Tang
 */
public class Driver {

    public static void registerRoutes(Javalin app) {

        // Create objects for search, student, and schedule
        Search search = new Search();
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
            search.nameFilter.setInput(req.name);
            search.profFilter.setInput(req.prof);
            // TODO: uncomment this after deptFilter is implemented
//            search.deptFilter.setInput(req.dept);
            search.timeFilter.setInput(req.time);
            search.credFilter.setInput(req.credits);

            // TODO: (sprint 2) make it more secure by switching search filters to private variables? IDK

            // Send filtered results back
            // NOTE: We don't have to worry about updating the frontend, since it's state will save (hopefully)
            ArrayList<Course> results = search.getFilteredResults();
            ctx.json(results);
        });

        // Mostly testing
        app.get("/courses", ctx -> ctx.json(search.getCourses()));

        // Get schedule
        app.get("/schedule", ctx -> ctx.json(schedule));

        // Get all courses in user's schedule
        app.get("/schedule/courses", ctx -> ctx.json(schedule.getCourses()));

        // Get course (for viewing course info)
        app.get("/course", ctx -> {
            String courseID = ctx.queryParam("id");
            // TODO: Find course with ID, then send it back with ctx.json(course)
        });

        // Add course to schedule
        app.post("/course", ctx -> {
            Course course = ctx.bodyAsClass(Course.class);
            schedule.addCourse(course);
        });

        // TODO: Delete course from schedule
        // This should call a function in Schedule (you probably also need to create the function in Schedule)

    }

}
