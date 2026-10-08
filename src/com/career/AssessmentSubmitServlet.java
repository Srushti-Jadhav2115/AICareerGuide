package com.career;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.*;

/**
 * AssessmentSubmitServlet — receives the completed 4-step assessment
 * (posted as JSON from assessment/js/page4.js), stores it, calls Gemini
 * for a Top-3 career recommendation, validates that response, and stores
 * the validated result. Nothing here is called again on a results-page
 * reload — see AssessmentResultServlet, which just reads the stored row.
 */
@WebServlet("/AssessmentSubmitServlet")
public class AssessmentSubmitServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {

        response.setContentType("application/json; charset=UTF-8");

        // ---------------- SESSION CHECK (same mechanism as the rest of the app) ----------------
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("phone") == null) {
            writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED,
                    "You need to be logged in to submit the assessment.");
            return;
        }
        String phone = (String) session.getAttribute("phone");

        // ---------------- PARSE + VALIDATE INPUT ----------------
        Map<String, Object> payload;
        try {
            String body = readBody(request);
            Object parsed = JsonUtil.parse(body);
            if (!(parsed instanceof Map)) throw new RuntimeException("Payload was not a JSON object");
            payload = castToMap(parsed);
        } catch (Exception e) {
            e.printStackTrace();
            writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Your assessment data could not be read. Please try submitting again.");
            return;
        }

        Map<String, Object> profile = JsonUtil.getObject(payload, "profile");
        Map<String, Object> page2Answers = JsonUtil.getObject(payload, "page2Answers");
        Map<String, Object> page3Ratings = JsonUtil.getObject(payload, "page3Ratings");
        Map<String, Object> page4Responses = JsonUtil.getObject(payload, "page4Responses");

        if (profile == null || page2Answers == null || page3Ratings == null || page4Responses == null) {
            writeJsonError(response, HttpServletResponse.SC_BAD_REQUEST,
                    "Your assessment is incomplete. Please complete all four steps before submitting.");
            return;
        }

        // ---------------- CONSENT CHECK (server-side) ----------------
        // The browser enforces the consent checkbox, but the browser can be bypassed, so the
        // server must verify it too. Without an explicit consent === true nothing is stored
        // and nothing is ever sent to Gemini.
        if (!Boolean.TRUE.equals(payload.get("consent"))) {
            writeJsonError(response, HttpServletResponse.SC_FORBIDDEN,
                    "Consent is required before your responses can be processed by AI. "
                  + "Please go back to Step 1 and accept the privacy notice.");
            return;
        }

        // ---------------- STORE THE SUBMISSION ----------------
        long assessmentId;
        try (Connection con = DBUtil.getConnection()) {
            assessmentId = insertAssessment(con, phone, payload);
        } catch (SQLException e) {
            e.printStackTrace();
            writeJsonError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "We couldn't save your assessment right now. Please try again in a moment.");
            return;
        }

        // ---------------- CALL GEMINI ----------------
        Map<String, Object> sanitized = sanitizeForGemini(payload, phone);
        String rawText;
        try {
            GeminiService gemini = new GeminiService();
            rawText = gemini.generateRecommendation(sanitized);
        } catch (Exception e) {
            e.printStackTrace();
            markAssessmentFailed(phone, assessmentId);
            writeJsonError(response, HttpServletResponse.SC_BAD_GATEWAY,
                    "Our AI career advisor is temporarily unavailable. Please try again shortly.");
            return;
        }

        // ---------------- VALIDATE + STORE THE AI RESULT ----------------
        Object parsedAi;
        try {
            rawText = stripMarkdownFences(rawText);
            parsedAi = JsonUtil.parse(rawText);
        } catch (Exception e) {
            e.printStackTrace();
            markAssessmentFailed(phone, assessmentId);
            writeJsonError(response, HttpServletResponse.SC_BAD_GATEWAY,
                    "We couldn't generate valid recommendations this time. Please try again.");
            return;
        }

        RecommendationValidator.ValidationResult validation = RecommendationValidator.validate(parsedAi);
        if (!validation.valid) {
            System.err.println("Gemini output failed validation: " + validation.errorMessage);
            markAssessmentFailed(phone, assessmentId);
            writeJsonError(response, HttpServletResponse.SC_BAD_GATEWAY,
                    "We couldn't generate valid recommendations this time. Please try again.");
            return;
        }

        Map<String, Object> resultDoc = new LinkedHashMap<>();
        resultDoc.put("careers", validation.careers);

        try (Connection con = DBUtil.getConnection()) {
            markAssessmentCompleted(con, phone, assessmentId, JsonUtil.write(resultDoc));
        } catch (SQLException e) {
            e.printStackTrace();
            markAssessmentFailed(phone, assessmentId);
            writeJsonError(response, HttpServletResponse.SC_SERVICE_UNAVAILABLE,
                    "Your recommendations were generated but couldn't be saved. Please try again.");
            return;
        }

        Map<String, Object> ok = new LinkedHashMap<>();
        ok.put("status", "success");
        ok.put("assessmentId", assessmentId);
        response.setStatus(HttpServletResponse.SC_OK);
        response.getWriter().write(JsonUtil.write(ok));
    }

    // ---------------- helpers ----------------

    @SuppressWarnings("unchecked")
    private Map<String, Object> castToMap(Object o) {
        return (Map<String, Object>) o;
    }

    private String readBody(HttpServletRequest request) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[2048];
        int read;
        try (InputStream in = request.getInputStream()) {
            while ((read = in.read(buffer)) != -1) {
                out.write(buffer, 0, read);
            }
        }
        return out.toString(StandardCharsets.UTF_8.name());
    }

    /** Strips ```json / ``` fences some models still add despite responseMimeType=application/json. */
    private String stripMarkdownFences(String text) {
        if (text == null) return null;
        String trimmed = text.trim();
        if (trimmed.startsWith("```")) {
            int firstNewline = trimmed.indexOf('\n');
            if (firstNewline != -1) trimmed = trimmed.substring(firstNewline + 1);
            if (trimmed.endsWith("```")) trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        return trimmed.trim();
    }

    // ------------------------------------------------------------------
    // Gemini privacy sanitizer (allow-list)
    // ------------------------------------------------------------------

    /** Only these profile fields are career-relevant. name/age/gender are deliberately NOT sent. */
    private static final Set<String> PROFILE_ALLOWED = new LinkedHashSet<>(Arrays.asList(
            "educationLevel", "stream", "group", "nextPath",
            "diplomaBranchKnowledge", "diplomaStatus", "diplomaBranch"));

    /** The four free-text questions defined in assessment/js/questions-data.js (ESSAY_BANK). */
    private static final Set<String> ESSAY_ALLOWED = new LinkedHashSet<>(Arrays.asList(
            "essay_dream_career", "essay_strengths", "essay_weaknesses", "essay_anything_else"));

    private static final java.util.regex.Pattern SAFE_KEY =
            java.util.regex.Pattern.compile("^[A-Za-z0-9_]{1,64}$");
    private static final int MAX_PROFILE_VALUE = 120;
    private static final int MAX_CHOICE_VALUE = 200;
    private static final int MAX_ESSAY_VALUE = 500;   // same limit the page-4 form enforces
    private static final int MAX_CHOICES = 20;

    private static final java.util.regex.Pattern RE_CONTROL =
            java.util.regex.Pattern.compile("[\\u0000-\\u0008\\u000B-\\u001F\\u007F]");
    private static final java.util.regex.Pattern RE_EMAIL =
            java.util.regex.Pattern.compile("[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}");
    private static final java.util.regex.Pattern RE_URL =
            java.util.regex.Pattern.compile("(?i)\\b(?:https?://|www\\.)\\S+");
    private static final java.util.regex.Pattern RE_SOCIAL =
            java.util.regex.Pattern.compile(
                    "(?i)\\b(?:linkedin|github|instagram|facebook|twitter|telegram|whatsapp|snapchat)" +
                    "(?:\\.com)?\\s*[:@/]\\s*[A-Za-z0-9_./\\-]+");
    private static final java.util.regex.Pattern RE_HANDLE =
            java.util.regex.Pattern.compile("(?<![\\w.])@[A-Za-z0-9_.]{2,}");
    private static final java.util.regex.Pattern RE_PAN =
            java.util.regex.Pattern.compile("\\b[A-Z]{5}[0-9]{4}[A-Z]\\b");
    // phone-style numbers written with spaces/dashes/brackets: 9+ digits
    private static final java.util.regex.Pattern RE_SPACED_DIGITS =
            java.util.regex.Pattern.compile("(?<!\\d)\\+?\\d(?:[\\s\\-.()]?\\d){8,}(?!\\d)");
    // any unbroken run of 6+ digits (PIN codes, Aadhaar chunks, IDs, phone numbers)
    private static final java.util.regex.Pattern RE_LONG_DIGITS =
            java.util.regex.Pattern.compile("\\d{6,}");

    /**
     * Builds the ONLY object that is allowed to leave the server for Gemini.
     *
     * Allow-list approach: fields are copied across one by one; anything not
     * explicitly listed (name, age, gender, consent, phone, ids, unknown keys)
     * is dropped. Free-text values are additionally scrubbed for contact
     * details and for the student's own name, because people sometimes type
     * those into an essay box.
     *
     * Package-private + static so it can be unit-tested without a servlet container.
     */
    static Map<String, Object> sanitizeForGemini(Map<String, Object> payload, String sessionPhone) {
        Map<String, Object> sanitized = new LinkedHashMap<>();

        Map<String, Object> rawProfile = JsonUtil.getObject(payload, "profile");
        List<String> nameTokens = extractNameTokens(rawProfile);

        // ---- profile (education details only) ----
        Map<String, Object> profile = new LinkedHashMap<>();
        if (rawProfile != null) {
            for (String key : PROFILE_ALLOWED) {
                Object v = rawProfile.get(key);
                if (v instanceof String) {
                    profile.put(key, scrub((String) v, nameTokens, sessionPhone, MAX_PROFILE_VALUE));
                }
            }
        }
        sanitized.put("profile", profile);

        // ---- page 2: choice answers (string or list of strings) ----
        Map<String, Object> page2 = new LinkedHashMap<>();
        Map<String, Object> rawPage2 = JsonUtil.getObject(payload, "page2Answers");
        if (rawPage2 != null) {
            for (Map.Entry<String, Object> e : rawPage2.entrySet()) {
                if (!SAFE_KEY.matcher(e.getKey()).matches()) continue;
                Object v = e.getValue();
                if (v instanceof String) {
                    page2.put(e.getKey(), scrub((String) v, nameTokens, sessionPhone, MAX_CHOICE_VALUE));
                } else if (v instanceof List) {
                    List<Object> cleaned = new ArrayList<>();
                    for (Object item : (List<?>) v) {
                        if (cleaned.size() >= MAX_CHOICES) break;
                        if (item instanceof String) {
                            cleaned.add(scrub((String) item, nameTokens, sessionPhone, MAX_CHOICE_VALUE));
                        }
                    }
                    page2.put(e.getKey(), cleaned);
                }
            }
        }
        sanitized.put("page2Answers", page2);

        // ---- page 3: numeric skill ratings 1-5 ----
        Map<String, Object> page3 = new LinkedHashMap<>();
        Map<String, Object> rawPage3 = JsonUtil.getObject(payload, "page3Ratings");
        if (rawPage3 != null) {
            for (Map.Entry<String, Object> e : rawPage3.entrySet()) {
                if (!SAFE_KEY.matcher(e.getKey()).matches()) continue;
                if (e.getValue() instanceof Number) {
                    int rating = (int) Math.round(((Number) e.getValue()).doubleValue());
                    page3.put(e.getKey(), Math.max(1, Math.min(5, rating)));
                }
            }
        }
        sanitized.put("page3Ratings", page3);

        // ---- page 4: the four known free-text answers only ----
        Map<String, Object> page4 = new LinkedHashMap<>();
        Map<String, Object> rawPage4 = JsonUtil.getObject(payload, "page4Responses");
        if (rawPage4 != null) {
            for (String key : ESSAY_ALLOWED) {
                Object v = rawPage4.get(key);
                if (v instanceof String) {
                    page4.put(key, scrub((String) v, nameTokens, sessionPhone, MAX_ESSAY_VALUE));
                }
            }
        }
        sanitized.put("page4Responses", page4);

        return sanitized;
    }

    /** Words of the student's own name (3+ letters), used only to redact them from free text. */
    private static List<String> extractNameTokens(Map<String, Object> profile) {
        List<String> tokens = new ArrayList<>();
        if (profile == null) return tokens;
        Object name = profile.get("name");
        if (!(name instanceof String)) return tokens;
        for (String t : ((String) name).split("[^\\p{L}]+")) {
            if (t.length() >= 3) tokens.add(t);
        }
        return tokens;
    }

    /** Removes contact details / identifiers / the student's own name from a free-text value. */
    static String scrub(String text, List<String> nameTokens, String sessionPhone, int maxLen) {
        if (text == null) return "";
        String s = RE_CONTROL.matcher(text).replaceAll(" ");

        s = RE_EMAIL.matcher(s).replaceAll("[removed]");
        s = RE_URL.matcher(s).replaceAll("[removed]");
        s = RE_SOCIAL.matcher(s).replaceAll("[removed]");
        s = RE_HANDLE.matcher(s).replaceAll("[removed]");
        s = RE_PAN.matcher(s).replaceAll("[removed]");
        s = RE_SPACED_DIGITS.matcher(s).replaceAll("[removed]");
        s = RE_LONG_DIGITS.matcher(s).replaceAll("[removed]");

        if (sessionPhone != null && !sessionPhone.trim().isEmpty()) {
            s = s.replace(sessionPhone.trim(), "[removed]");
        }
        if (nameTokens != null) {
            for (String token : nameTokens) {
                s = java.util.regex.Pattern
                        .compile("(?iu)(?<![\\p{L}\\p{N}])" + java.util.regex.Pattern.quote(token) + "(?![\\p{L}\\p{N}])")
                        .matcher(s).replaceAll("[name]");
            }
        }

        s = s.replaceAll("\\s+", " ").trim();
        if (s.length() > maxLen) s = s.substring(0, maxLen).trim();
        return s;
    }

    private long insertAssessment(Connection con, String phone, Map<String, Object> payload) throws SQLException {
        String sql = "INSERT INTO assessments " +
                "(user_phone, profile_json, consent, page2_json, page3_json, page4_json, status, created_at) " +
                "VALUES (?, ?, ?, ?, ?, ?, 'processing', NOW())";
        try (PreparedStatement ps = con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            Object consentVal = payload.get("consent");
            boolean consent = Boolean.TRUE.equals(consentVal);
            ps.setString(1, phone);
            ps.setString(2, JsonUtil.write(payload.get("profile")));
            ps.setBoolean(3, consent);
            ps.setString(4, JsonUtil.write(payload.get("page2Answers")));
            ps.setString(5, JsonUtil.write(payload.get("page3Ratings")));
            ps.setString(6, JsonUtil.write(payload.get("page4Responses")));
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return keys.getLong(1);
            }
        }
        throw new SQLException("Could not obtain generated assessment id");
    }

    private void markAssessmentCompleted(Connection con, String phone, long assessmentId, String aiResultJson) throws SQLException {
        // Ownership-scoped: an assessment id alone is never enough to update a row.
        String sql = "UPDATE assessments SET ai_result_json = ?, status = 'completed', completed_at = NOW() " +
                "WHERE id = ? AND user_phone = ?";
        try (PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, aiResultJson);
            ps.setLong(2, assessmentId);
            ps.setString(3, phone);
            int updated = ps.executeUpdate();
            if (updated != 1) throw new SQLException("Assessment row was not updated for the current user");
        }
    }

    private void markAssessmentFailed(String phone, long assessmentId) {
        String sql = "UPDATE assessments SET status = 'failed' WHERE id = ? AND user_phone = ?";
        try (Connection con = DBUtil.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setLong(1, assessmentId);
            ps.setString(2, phone);
            ps.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    private void writeJsonError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        Map<String, Object> err = new LinkedHashMap<>();
        err.put("status", "error");
        err.put("message", message);
        response.getWriter().write(JsonUtil.write(err));
    }
}
