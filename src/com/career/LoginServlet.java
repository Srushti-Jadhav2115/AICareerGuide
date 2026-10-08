package com.career;

import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {

    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws ServletException, IOException {

        String phone = req.getParameter("phone");
        String password = req.getParameter("password");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/careerdb",
                    "root",
                    ""
            );

            PreparedStatement ps = con.prepareStatement(
                    "SELECT * FROM users WHERE phone=? AND password=?"
            );

            ps.setString(1, phone);
            ps.setString(2, password);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {

                HttpSession session = req.getSession(true);

                // IMPORTANT: SAME KEY USED EVERYWHERE
                session.setAttribute("phone", phone);

                session.setMaxInactiveInterval(30 * 60);

                res.sendRedirect("index.jsp");

            } else {
                res.getWriter().println("Invalid login credentials");
            }

            con.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}