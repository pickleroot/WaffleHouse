package edu.gcc.wafflehouse;

import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.javalin.Javalin;
import io.javalin.json.JavalinJackson;

import java.io.IOException;


//TIP To <b>Run</b> code, press <shortcut actionId="Run"/> or
// click the <icon src="AllIcons.Actions.Execute"/> icon in the gutter.

/**
 * Entrance to the app and nothing else.
 * @author Ina Tang
 */
public class Main {
    public static void main(String[] args) throws IOException {


        System.out.println(System.getProperty("user.dir"));
        Deserialize ds = new Deserialize();
        Search search = new Search();
        search.setCourses(ds.getCourses());


        Javalin app = Javalin.create(config -> {
            // Enable CORS (allow requests from React dev server)
            config.bundledPlugins.enableCors(cors -> {
                cors.addRule(it -> {
                    it.allowHost("http://localhost:5173");
                });
            });

            // Register Jackson module for Java 8 time types (LocalTime, etc.)
            config.jsonMapper(new JavalinJackson().updateMapper(mapper -> {
                mapper.registerModule(new JavaTimeModule());
            }));
        });

        // Log exceptions to help with debugging
        app.exception(Exception.class, (e, ctx) -> {
            e.printStackTrace();
            ctx.status(500);
            ctx.result("Error: " + e.getClass().getName() + " - " + e.getMessage());
        });

        Driver.registerRoutes(app);

        // Start after we register routes, in case registering throws errors
        app.start(7001);
    }
}

// WaffleHouse is the best :D