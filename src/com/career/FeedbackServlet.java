package com.career;

import java.io.IOException;
import java.sql.*;
import javax.servlet.*;
import javax.servlet.http.*;
import javax.servlet.annotation.WebServlet;

@WebServlet("/FeedbackServlet")
public class FeedbackServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        String feedback = request.getParameter("feedback");

        HttpSession session = request.getSession(false);

        if (session == null || session.getAttribute("phone") == null) {
            response.sendRedirect("login.jsp");
            return;
        }

        String phone = (String) session.getAttribute("phone");

        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/careerdb",
                    "root",
                    ""
            );

            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO feedback(phone, feedback) VALUES(?, ?)"
            );

            ps.setString(1, phone);
            ps.setString(2, feedback);

            ps.executeUpdate();

            con.close();

            response.sendRedirect("index.jsp");

        } catch (Exception e) {
            e.printStackTrace();
            response.getWriter().println("Error saving feedback");
        }
    }
}