package com.career;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * DBUtil — small shared connection helper for the NEW assessment servlets.
 *
 * The existing servlets (LoginServlet, SignupServlet, CareerServlet,
 * FeedbackServlet) already open their own connections inline and are left
 * exactly as they were — this class is not retrofitted into them, to keep
 * the change surface minimal. It simply reuses the same JDBC URL /
 * credentials convention (jdbc:mysql://localhost:3306/careerdb, root, no
 * password) so the new code fits the existing project setup.
 *
 * If you deploy against a MySQL instance with different credentials,
 * update the three constants below.
 */
public final class DBUtil {

    private static final String URL = "jdbc:mysql://localhost:3306/careerdb";
    private static final String USER = "root";
    private static final String PASSWORD = "";

    private DBUtil() { }

    public static Connection getConnection() throws SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new SQLException("MySQL JDBC driver not found on classpath", e);
        }
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }
}
