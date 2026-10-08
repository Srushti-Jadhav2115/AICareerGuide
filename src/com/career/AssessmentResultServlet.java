package com.career;

import java.io.IOException;
import java.sql.*;
import java.util.LinkedHashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

/**
 * AssessmentResultServlet — GET-only. Returns the logged-in user's most
 * recent assessment result as JSON:
 *   { "status": "success", "careers": [ ... ] }   completed + valid
 *   { "status": "pending" }                       still processing / last attempt failed validation
 *   { "status": "not_found" }                      no assessment on record for this user
 *   { "status": "error", "message": "..." }        request/DB failure
 *
 * A logged-in user can only ever see their OWN latest result — the query
 * is always scoped to the session's phone number, so there is no way to
 * reach another user's results by guessing an id.
 */
@WebServlet("/AssessmentResultServlet")
public class AssessmentResultServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json; charset=UTF-8");

        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("phone") == null) {
            writeJson(response, HttpServletResponse.SC_UNAUTHORIZED,
                    status("error", "You need to be logged in to view your recommendations."));
            return;
        }
        String phone = (String) session.getAttribute("phone");

        String sql = "SELECT status, ai_result_json, profile_json FROM assessments " +
                "WHERE user_phone = ? ORDER BY created_at DESC LIMIT 1";

        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, phone);
            try (ResultSet rs = ps.executeQuery()) {
                if (!rs.next()) {
                    writeJson(response, HttpServletResponse.SC_OK, status("not_found", null));
                    return;
                }

                String rowStatus = rs.getString("status");
                String aiResultJson = rs.getString("ai_result_json");

                if (!"completed".equals(rowStatus) || aiResultJson == null) {
                    writeJson(response, HttpServletResponse.SC_OK, status("pending", null));
                    return;
                }

                Object parsed = JsonUtil.parse(aiResultJson);
                Map<String, Object> resultMap = castToMap(parsed);
                Map<String, Object> out = new LinkedHashMap<>();
                out.put("status", "success");
                out.put("careers", resultMap == null ? null : resultMap.get("careers"));
                // Display name for the header chip. It comes from the user's OWN stored row, so the
                // results page no longer needs the (now cleared) browser copy of the assessment.
                String displayName = readDisplayName(rs.getString("profile_json"));
                if (displayName != null) out.put("userName", displayName);
                writeJson(response, HttpServletResponse.SC_OK, out);
            }

        } catch (SQLException e) {
            e.printStackTrace();
            writeJson(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    status("error", "We couldn't load your recommendations right now."));
        } catch (Exception e) {
            e.printStackTrace();
            writeJson(response, HttpServletResponse.SC_INTERNAL_SERVER_ERROR,
                    status("error", "We couldn't load your recommendations right now."));
        }
    }

    private String readDisplayName(String profileJson) {
        try {
            Map<String, Object> profile = castToMap(JsonUtil.parse(profileJson));
            if (profile == null) return null;
            Object name = profile.get("name");
            return (name instanceof String && !((String) name).trim().isEmpty()) ? ((String) name).trim() : null;
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> castToMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    private Map<String, Object> status(String status, String message) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("status", status);
        if (message != null) map.put("message", message);
        return map;
    }

    private void writeJson(HttpServletResponse response, int httpStatus, Map<String, Object> body) throws IOException {
        response.setStatus(httpStatus);
        response.getWriter().write(JsonUtil.write(body));
    }
}
