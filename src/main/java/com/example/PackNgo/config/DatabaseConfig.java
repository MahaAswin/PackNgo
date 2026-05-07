package com.example.PackNgo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Bean
    public DataSource dataSource() {
        try {
            // Extract the database name and the base URL (e.g., jdbc:postgresql://localhost:5432)
            String dbName = dbUrl.substring(dbUrl.lastIndexOf("/") + 1);
            String baseUrl = dbUrl.substring(0, dbUrl.lastIndexOf("/"));

            // Connect to the default 'postgres' database to check/create our target database
            try (Connection connection = DriverManager.getConnection(baseUrl + "/postgres", username, password);
                 Statement statement = connection.createStatement()) {
                
                // Check if the database exists
                ResultSet resultSet = statement.executeQuery("SELECT count(*) FROM pg_database WHERE datname = '" + dbName + "'");
                if (resultSet.next() && resultSet.getInt(1) == 0) {
                    // Create the database if it doesn't exist
                    statement.executeUpdate("CREATE DATABASE \"" + dbName + "\"");
                    System.out.println("✅ Automatically created database: " + dbName);
                } else {
                    System.out.println("✅ Database " + dbName + " already exists.");
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Database auto-creation check failed: " + e.getMessage());
        }

        // Return the configured DataSource for Spring Boot to use
        return DataSourceBuilder.create()
                .url(dbUrl)
                .username(username)
                .password(password)
                .build();
    }
}
