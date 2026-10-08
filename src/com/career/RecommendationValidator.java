package com.career;

import java.util.*;

/**
 * RecommendationValidator — checks a parsed Gemini response against the
 * contract defined in GeminiService's prompt before the server ever
 * stores or displays it. Nothing from Gemini reaches MySQL or the
 * results page without passing this.
 */
public final class RecommendationValidator {

    private RecommendationValidator() { }

    public static final class ValidationResult {
        public final boolean valid;
        public final String errorMessage;
        public final List<Object> careers;

        private ValidationResult(boolean valid, String errorMessage, List<Object> careers) {
            this.valid = valid;
            this.errorMessage = errorMessage;
            this.careers = careers;
        }

        static ValidationResult ok(List<Object> careers) {
            return new ValidationResult(true, null, careers);
        }

        static ValidationResult fail(String message) {
            return new ValidationResult(false, message, null);
        }
    }

    @SuppressWarnings("unchecked")
    public static ValidationResult validate(Object parsedResponse) {
        if (!(parsedResponse instanceof Map)) {
            return ValidationResult.fail("AI response was not a JSON object");
        }
        Map<String, Object> root = (Map<String, Object>) parsedResponse;

        List<Object> careers = JsonUtil.getArray(root, "careers");
        if (careers == null) {
            return ValidationResult.fail("AI response had no \"careers\" array");
        }
        if (careers.size() != 3) {
            return ValidationResult.fail("Expected exactly 3 careers, got " + careers.size());
        }

        Set<String> seenNames = new HashSet<>();

        for (int i = 0; i < careers.size(); i++) {
            Object item = careers.get(i);
            if (!(item instanceof Map)) {
                return ValidationResult.fail("Career #" + (i + 1) + " was not a JSON object");
            }
            Map<String, Object> career = (Map<String, Object>) item;

            String name = JsonUtil.getString(career, "careerName");
            if (name == null || name.trim().isEmpty()) {
                return ValidationResult.fail("Career #" + (i + 1) + " has an empty careerName");
            }
            String normalized = name.trim().toLowerCase();
            if (!seenNames.add(normalized)) {
                return ValidationResult.fail("Career names must be distinct — duplicate: " + name);
            }

            Double match = JsonUtil.getNumber(career, "matchPercentage");
            if (match == null || match < 0 || match > 100) {
                return ValidationResult.fail("Career #" + (i + 1) + " has an invalid matchPercentage");
            }

            String whyFits = JsonUtil.getString(career, "whyFits");
            if (whyFits == null || whyFits.trim().isEmpty()) {
                return ValidationResult.fail("Career #" + (i + 1) + " is missing whyFits");
            }

            String eduPath = JsonUtil.getString(career, "educationalPath");
            if (eduPath == null || eduPath.trim().isEmpty()) {
                return ValidationResult.fail("Career #" + (i + 1) + " is missing educationalPath");
            }

            List<Object> skills = JsonUtil.getArray(career, "skillsToDevelop");
            if (skills == null || skills.isEmpty()) {
                return ValidationResult.fail("Career #" + (i + 1) + " is missing skillsToDevelop");
            }

            Map<String, Object> roadmap = JsonUtil.getObject(career, "roadmap");
            if (roadmap == null) {
                return ValidationResult.fail("Career #" + (i + 1) + " is missing roadmap");
            }
            String shortTerm = JsonUtil.getString(roadmap, "shortTerm");
            String midTerm = JsonUtil.getString(roadmap, "midTerm");
            String longTerm = JsonUtil.getString(roadmap, "longTerm");
            if (isBlank(shortTerm) || isBlank(midTerm) || isBlank(longTerm)) {
                return ValidationResult.fail("Career #" + (i + 1) + " roadmap is missing one of the three periods");
            }
        }

        return ValidationResult.ok(careers);
    }

    private static boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }
}
