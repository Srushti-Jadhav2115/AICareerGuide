package com.career;

import java.io.BufferedReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * AssessmentServlet
 * ------------------
 * Receives the JSON payload posted by assessment/js/page4.js
 * (see BACKEND_SUBMIT_URL) and stores the 4-step career assessment for the
 * logged-in user in MySQL.
 *
 * This servlet ONLY collects and persists the assessment. It deliberately
 * does NOT compute or return an AI-generated recommendation yet — that is
 * expected to be added later (Servlet -> Python/Gemini service). The old
 * keyword-matching flow (CareerServlet / form.jsp / recommendation.jsp) is
 * left completely untouched and still works as a fallback.
 *
 * Expected JSON body (matches the shape documented in the assessment
 * frontend's README / assessment.js):
 * {
 *   "profile": {
 *     "name", "age", "gender", "educationLevel", "stream", "group",
 *     "nextPath", "diplomaBranchKnowledge", "diplomaStatus", "diplomaBranch"
 *   },
 *   "page2Answers": { ... arbitrary, path-dependent question -> answer ... },
 *   "page3Ratings": { "skill_xxx": 1-5, ... 12 entries ... },
 *   "page4Responses": {
 *     "essay_dream_career", "essay_strengths",
 *     "essay_weaknesses", "essay_anything_else"
 *   }
 * }
 */
@WebServlet("/AssessmentServlet")
public class AssessmentServlet extends HttpServlet {

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        // ---------------- SESSION CHECK (same session key as the rest of the app) ----------------
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("phone") == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().print("{\"error\":\"Not logged in\"}");
            return;
        }
        String phone = (String) session.getAttribute("phone");

        // ---------------- READ + PARSE THE JSON BODY ----------------
        String body = readBody(request);

        Map<String, Object> payload;
        Map<String, Object> profile;
        try {
            Object parsed = JsonUtil.parse(body);
            if (!(parsed instanceof Map)) throw new RuntimeException("Expected a JSON object");
            @SuppressWarnings("unchecked")
            Map<String, Object> payloadMap = (Map<String, Object>) parsed;
            payload = payloadMap;
            profile = JsonUtil.getMap(payload, "profile");
            if (profile == null) throw new RuntimeException("Missing 'profile'");
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().print("{\"error\":\"Invalid assessment payload\"}");
            return;
        }

        Map<String, Object> page2Answers = JsonUtil.getMap(payload, "page2Answers");
        Map<String, Object> page3Ratings = JsonUtil.getMap(payload, "page3Ratings");
        Map<String, Object> page4Responses = JsonUtil.getMap(payload, "page4Responses");

        String name = JsonUtil.getString(profile, "name");
        String ageStr = JsonUtil.getString(profile, "age");
        String gender = JsonUtil.getString(profile, "gender");
        String educationLevel = JsonUtil.getString(profile, "educationLevel");
        String stream = JsonUtil.getString(profile, "stream");
        String group = JsonUtil.getString(profile, "group");
        String nextPath = JsonUtil.getString(profile, "nextPath");
        String diplomaBranchKnowledge = JsonUtil.getString(profile, "diplomaBranchKnowledge");
        String diplomaStatus = JsonUtil.getString(profile, "diplomaStatus");
        String diplomaBranch = JsonUtil.getString(profile, "diplomaBranch");

        Integer age = null;
        if (ageStr != null) {
            try { age = (int) Double.parseDouble(ageStr); } catch (NumberFormatException ignored) {}
        }

        String dreamCareer = page4Responses != null ? JsonUtil.getString(page4Responses, "essay_dream_career") : null;
        String strengths = page4Responses != null ? JsonUtil.getString(page4Responses, "essay_strengths") : null;
        String weaknesses = page4Responses != null ? JsonUtil.getString(page4Responses, "essay_weaknesses") : null;
        String anythingElse = page4Responses != null ? JsonUtil.getString(page4Responses, "essay_anything_else") : null;

        String page2Json = page2Answers != null ? JsonUtil.stringify(page2Answers) : "{}";
        String page3Json = page3Ratings != null ? JsonUtil.stringify(page3Ratings) : "{}";

        // ---------------- PERSIST TO MYSQL ----------------
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");

            Connection con = DriverManager.getConnection(
                    "jdbc:mysql://localhost:3306/careerdb",
                    "root",
                    ""
            );

            PreparedStatement ps = con.prepareStatement(
                    "INSERT INTO assessment_responses (" +
                    "user_phone, full_name, age, gender, education_level, stream, edu_group, " +
                    "next_path, diploma_branch_knowledge, diploma_status, diploma_branch, " +
                    "consent_given, interests_json, skill_ratings_json, " +
                    "dream_career, strengths, weaknesses, anything_else, status" +
                    ") VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
            );

            ps.setString(1, phone);
            ps.setString(2, name);
            if (age != null) ps.setInt(3, age); else ps.setNull(3, java.sql.Types.INTEGER);
            ps.setString(4, gender);
            ps.setString(5, educationLevel);
            ps.setString(6, stream);
            ps.setString(7, group);
            ps.setString(8, nextPath);
            ps.setString(9, diplomaBranchKnowledge);
            ps.setString(10, diplomaStatus);
            ps.setString(11, diplomaBranch);
            ps.setBoolean(12, Boolean.TRUE.equals(payload.get("consent")));
            ps.setString(13, page2Json);
            ps.setString(14, page3Json);
            ps.setString(15, dreamCareer);
            ps.setString(16, strengths);
            ps.setString(17, weaknesses);
            ps.setString(18, anythingElse);
            ps.setString(19, "submitted");

            ps.executeUpdate();

            con.close();

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().print("{\"status\":\"success\"}");

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().print("{\"error\":\"Could not save assessment\"}");
        }
    }

    private String readBody(HttpServletRequest request) throws IOException {
        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = request.getReader()) {
            char[] buf = new char[1024];
            int read;
            while ((read = reader.read(buf)) != -1) {
                sb.append(buf, 0, read);
            }
        }
        return sb.toString();
    }
}
