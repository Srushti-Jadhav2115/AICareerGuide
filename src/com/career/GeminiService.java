package com.career;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

/**
 * GeminiService
 *
 * Server-side only service for calling the Gemini API.
 *
 * Security:
 * - API key is loaded from WEB-INF/gemini.properties.
 * - API key is never sent to the browser.
 * - This class only sends the sanitized assessment supplied by the servlet.
 * - Personal information such as name, email, phone and password should be
 *   removed by AssessmentSubmitServlet before calling this class.
 */
public class GeminiService {

    private static final String DEFAULT_MODEL = "gemini-3.6-flash";

    private static final String API_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/";

    private static final int CONNECT_TIMEOUT = 15000;
    private static final int READ_TIMEOUT = 90000;

    private final String apiKey;
    private final String model;

    public GeminiService() throws IOException {

        Properties props = loadProperties();

        this.apiKey = props.getProperty("gemini.api.key", "").trim();

        String configuredModel =
                props.getProperty("gemini.model", DEFAULT_MODEL).trim();

        this.model = configuredModel.isEmpty()
                ? DEFAULT_MODEL
                : configuredModel;

        if (apiKey.isEmpty()) {
            throw new IOException(
                    "Gemini API key is not configured. " +
                    "Set gemini.api.key in WEB-INF/gemini.properties."
            );
        }
    }

    /**
     * Loads Gemini configuration from the server-side properties file.
     */
    private Properties loadProperties() throws IOException {

        Properties props = new Properties();

        try (InputStream in =
                     GeminiService.class.getClassLoader()
                             .getResourceAsStream("gemini.properties")) {

            if (in == null) {
                throw new IOException(
                        "WEB-INF/classes/gemini.properties not found. " +
                        "Make sure gemini.properties is copied into WEB-INF/classes."
                );
            }

            props.load(in);
        }

        return props;
    }

    /**
     * Sends the sanitized assessment to Gemini.
     *
     * Only career-related assessment information should be present in
     * sanitizedAssessment.
     */
    public String generateRecommendation(
            Map<String, Object> sanitizedAssessment) throws IOException {

        if (sanitizedAssessment == null) {
            throw new IOException("Assessment data is missing.");
        }

        String prompt = buildPrompt(sanitizedAssessment);

        String requestBody = buildRequestBody(prompt);

        String endpoint =
                API_BASE
                        + model
                        + ":generateContent?key="
                        + apiKey;

        HttpURLConnection conn = null;

        try {

            URL url = new URL(endpoint);

            conn = (HttpURLConnection) url.openConnection();

            conn.setRequestMethod("POST");

            conn.setRequestProperty(
                    "Content-Type",
                    "application/json; charset=UTF-8"
            );

            conn.setRequestProperty(
                    "Accept",
                    "application/json"
            );

            conn.setDoOutput(true);

            /*
             * Connection timeout:
             * maximum time allowed to establish the connection.
             */
            conn.setConnectTimeout(CONNECT_TIMEOUT);

            /*
             * Read timeout:
             * Gemini can take some time to generate the complete
             * structured recommendation.
             */
            conn.setReadTimeout(READ_TIMEOUT);

            /*
             * Send request.
             */
            try (OutputStream os = conn.getOutputStream()) {

                byte[] data =
                        requestBody.getBytes(StandardCharsets.UTF_8);

                os.write(data);
                os.flush();
            }

            /*
             * Wait for Gemini response.
             */
            int status = conn.getResponseCode();

            InputStream stream;

            if (status >= 200 && status < 300) {
                stream = conn.getInputStream();
            } else {
                stream = conn.getErrorStream();
            }

            String responseBody = readStream(stream);

            /*
             * Gemini returned an HTTP error.
             */
            if (status < 200 || status >= 300) {

                throw new IOException(
                        "Gemini API returned HTTP "
                                + status
                                + ": "
                                + truncate(responseBody, 1000)
                );
            }

            /*
             * Extract generated text from Gemini JSON response.
             */
            return extractText(responseBody);

        } catch (java.net.SocketTimeoutException e) {

            throw new IOException(
                    "Gemini request timed out after "
                            + READ_TIMEOUT
                            + " ms. "
                            + "The server connected successfully, but Gemini "
                            + "did not return the complete response in time.",
                    e
            );

        } catch (java.net.UnknownHostException e) {

            throw new IOException(
                    "Unable to connect to Gemini. " +
                    "Please check the internet connection and DNS.",
                    e
            );

        } finally {

            if (conn != null) {
                conn.disconnect();
            }
        }
    }

    /**
     * Builds the Gemini request body.
     */
    private String buildRequestBody(String prompt) {

        Map<String, Object> content =
                new LinkedHashMap<>();

        content.put("role", "user");

        List<Object> parts =
                new ArrayList<>();

        Map<String, Object> part =
                new LinkedHashMap<>();

        part.put("text", prompt);

        parts.add(part);

        content.put("parts", parts);

        /*
         * Generation settings.
         *
         * responseMimeType ensures Gemini returns JSON.
         *
         * temperature 0.4 gives reasonably consistent
         * career recommendations while allowing some variation.
         */
        Map<String, Object> generationConfig =
                new LinkedHashMap<>();

        generationConfig.put(
                "responseMimeType",
                "application/json"
        );

        generationConfig.put(
                "temperature",
                0.4
        );

        Map<String, Object> body =
                new LinkedHashMap<>();

        body.put(
                "contents",
                Collections.singletonList(content)
        );

        body.put(
                "generationConfig",
                generationConfig
        );

        return JsonUtil.write(body);
    }

    /**
     * Extracts the generated text from Gemini's response.
     */
    @SuppressWarnings("unchecked")
    private String extractText(String responseJson)
            throws IOException {

        if (responseJson == null ||
                responseJson.trim().isEmpty()) {

            throw new IOException(
                    "Gemini returned an empty response."
            );
        }

        Object parsed;

        try {

            parsed = JsonUtil.parse(responseJson);

        } catch (Exception e) {

            throw new IOException(
                    "Unable to parse Gemini response.",
                    e
            );
        }

        if (!(parsed instanceof Map)) {

            throw new IOException(
                    "Unexpected Gemini response format."
            );
        }

        Map<String, Object> root =
                (Map<String, Object>) parsed;

        List<Object> candidates =
                JsonUtil.getArray(root, "candidates");

        if (candidates == null ||
                candidates.isEmpty()) {

            /*
             * Sometimes Gemini returns an error/block response
             * without candidates.
             */
            String errorMessage =
                    getErrorMessage(root);

            if (!errorMessage.isEmpty()) {

                throw new IOException(
                        "Gemini did not return a recommendation: "
                                + errorMessage
                );
            }

            throw new IOException(
                    "Gemini response contained no candidates."
            );
        }

        Object candidateObject =
                candidates.get(0);

        if (!(candidateObject instanceof Map)) {

            throw new IOException(
                    "Invalid Gemini candidate format."
            );
        }

        Map<String, Object> firstCandidate =
                (Map<String, Object>) candidateObject;

        Map<String, Object> contentObj =
                JsonUtil.getObject(
                        firstCandidate,
                        "content"
                );

        if (contentObj == null) {

            throw new IOException(
                    "Gemini candidate had no content."
            );
        }

        List<Object> parts =
                JsonUtil.getArray(
                        contentObj,
                        "parts"
                );

        if (parts == null ||
                parts.isEmpty()) {

            throw new IOException(
                    "Gemini content had no parts."
            );
        }

        for (Object partObject : parts) {

            if (!(partObject instanceof Map)) {
                continue;
            }

            Map<String, Object> part =
                    (Map<String, Object>) partObject;

            String text =
                    JsonUtil.getString(
                            part,
                            "text"
                    );

            if (text != null &&
                    !text.trim().isEmpty()) {

                return text.trim();
            }
        }

        throw new IOException(
                "Gemini response contained no generated text."
        );
    }

    /**
     * Attempts to extract a Gemini error message.
     */
    @SuppressWarnings("unchecked")
    private String getErrorMessage(
            Map<String, Object> root) {

        try {

            Object errorObject =
                    root.get("error");

            if (!(errorObject instanceof Map)) {
                return "";
            }

            Map<String, Object> error =
                    (Map<String, Object>) errorObject;

            String message =
                    JsonUtil.getString(
                            error,
                            "message"
                    );

            return message == null
                    ? ""
                    : message;

        } catch (Exception e) {

            return "";
        }
    }

    /**
     * Builds the career-analysis prompt.
     *
     * IMPORTANT:
     * This method intentionally uses only the career-related fields
     * supplied by the servlet.
     *
     * Name, email, phone and password should NOT exist inside
     * sanitizedAssessment.
     */
    private String buildPrompt(
            Map<String, Object> assessment) {

        StringBuilder sb =
                new StringBuilder();

        sb.append(
                "You are an expert career counselor AI "
                        + "embedded in a career guidance platform "
                        + "called Career Guide. "
                        + "Analyze the complete student profile below "
                        + "and recommend careers that are realistic "
                        + "and educationally appropriate for this student."
        );

        sb.append("\n\n");

        sb.append(
                "STUDENT PROFILE (education/background):\n"
        );

        sb.append(
                JsonUtil.write(
                        assessment.get("profile")
                )
        );

        sb.append("\n\n");

        sb.append(
                "EDUCATION-SPECIFIC INTEREST ANSWERS:\n"
        );

        sb.append(
                JsonUtil.write(
                        assessment.get("page2Answers")
                )
        );

        sb.append("\n\n");

        sb.append(
                "SELF-RATED SKILLS "
                        + "(1=Very Low, 5=Excellent):\n"
        );

        sb.append(
                JsonUtil.write(
                        assessment.get("page3Ratings")
                )
        );

        sb.append("\n\n");

        sb.append(
                "ABOUT THE STUDENT "
                        + "(dream career, strengths, weaknesses, "
                        + "anything else):\n"
        );

        sb.append(
                JsonUtil.write(
                        assessment.get("page4Responses")
                )
        );

        sb.append("\n\n");

        sb.append("REQUIREMENTS:\n");

        sb.append(
                "1. Recommend EXACTLY 3 distinct careers. "
                        + "Not 2, not 4 — exactly 3.\n"
        );

        sb.append(
                "2. Rank them: the first is the Top Match, "
                        + "the second the Strong Match, "
                        + "the third the Good Match.\n"
        );

        sb.append(
                "3. Do NOT recommend a career that is clearly "
                        + "educationally incompatible with the student's "
                        + "stated education level, stream/group, or diploma branch. "
                        + "Where a career has multiple valid routes, "
                        + "explain the route appropriate for THIS student.\n"
        );

        sb.append(
                "4. Do not use simple keyword matching. "
                        + "Reason holistically about the fit between the "
                        + "student's education, interests, skills, strengths, "
                        + "weaknesses and stated goals.\n"
        );

        sb.append(
                "5. Each career needs a personalized 3-stage roadmap "
                        + "(next 6-12 months, 1-3 years, 3-5 years). "
                        + "Roadmaps must be specific to this student, "
                        + "not generic.\n"
        );

        sb.append("\n");

        sb.append(
                "Respond with ONLY a JSON object "
                        + "(no markdown, no commentary) "
                        + "matching exactly this shape:\n"
        );

        sb.append("{\n");

        sb.append(
                "  \"careers\": [\n"
        );

        sb.append(
                "    {\n"
        );

        sb.append(
                "      \"careerName\": string,\n"
        );

        sb.append(
                "      \"matchPercentage\": number (0-100),\n"
        );

        sb.append(
                "      \"whyFits\": string (2-4 sentences),\n"
        );

        sb.append(
                "      \"educationalPath\": string (2-4 sentences),\n"
        );

        sb.append(
                "      \"skillsToDevelop\": string[] (3-6 items),\n"
        );

        sb.append(
                "      \"roadmap\": {\n"
        );

        sb.append(
                "        \"shortTerm\": string (next 6-12 months),\n"
        );

        sb.append(
                "        \"midTerm\": string (1-3 years),\n"
        );

        sb.append(
                "        \"longTerm\": string (3-5 years)\n"
        );

        sb.append(
                "      }\n"
        );

        sb.append(
                "    }\n"
        );

        sb.append(
                "  ]\n"
        );

        sb.append(
                "}\n"
        );

        sb.append(
                "The \"careers\" array must contain exactly "
                        + "3 objects, ordered Top Match, Strong Match, "
                        + "Good Match."
        );

        return sb.toString();
    }

    /**
     * Reads an InputStream safely.
     */
    private String readStream(InputStream in)
            throws IOException {

        if (in == null) {
            return "";
        }

        ByteArrayOutputStream out =
                new ByteArrayOutputStream();

        byte[] buffer =
                new byte[4096];

        int read;

        while ((read = in.read(buffer)) != -1) {

            out.write(
                    buffer,
                    0,
                    read
            );
        }

        return out.toString(
                StandardCharsets.UTF_8
        );
    }

    /**
     * Prevents huge error messages from being printed.
     */
    private String truncate(
            String text,
            int max) {

        if (text == null) {
            return "";
        }

        if (text.length() <= max) {
            return text;
        }

        return text.substring(0, max)
                + "...";
    }
}