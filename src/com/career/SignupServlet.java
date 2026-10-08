package com.career;

import java.io.*;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;

@WebServlet("/SignupServlet")
public class SignupServlet extends HttpServlet {

    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        String phone = req.getParameter("phone");
        String password = req.getParameter("password");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection con = DriverManager.getConnection(
                "jdbc:mysql://localhost:3306/careerdb", "root", ""
            );

            // ✅ CHECK IF PHONE ALREADY EXISTS
            PreparedStatement check = con.prepareStatement(
                "SELECT id FROM users WHERE phone=?"
            );
            check.setString(1, phone);

            ResultSet rs = check.executeQuery();

            if (rs.next()) {
                res.getWriter().println("Phone already exists! Please login.");
                return;
            }

            // ✅ INSERT NEW USER
            PreparedStatement ps = con.prepareStatement(
                "INSERT INTO users(phone, password) VALUES(?,?)"
            );

            ps.setString(1, phone);
            ps.setString(2, password);

            ps.executeUpdate();

            res.sendRedirect("login.jsp");

        } catch (Exception e) {
            e.printStackTrace();
            res.getWriter().println("Server error occurred!");
        }
    }
}