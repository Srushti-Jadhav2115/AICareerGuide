-- ============================================================
-- Career Guide — Assessment feature schema
-- ============================================================
-- Additive only: does NOT modify the existing `users`, `careers`,
-- or `feedback` tables used by the original portal.
--
-- Run this against the existing `careerdb` database:
--   mysql -u root careerdb < sql/assessment_schema.sql
-- ============================================================

USE careerdb;

CREATE TABLE IF NOT EXISTS assessments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Associates the assessment with the logged-in user. Matches the
    -- existing session convention (LoginServlet stores session
    -- attribute "phone", and `users.phone` is already the unique login
    -- key), so no second identity system is introduced.
    user_phone       VARCHAR(20) NOT NULL,

    -- Step 1: education/profile (JSON — see assessment/js/assessment.js
    -- "profile shape" for the exact fields). Name is stored here for
    -- display purposes only; it is stripped before anything is sent to
    -- Gemini (see AssessmentSubmitServlet#sanitizeForGemini).
    profile_json     TEXT NOT NULL,

    -- AI-processing consent, captured on Page 1 (required before a
    -- student can continue the assessment).
    consent          BOOLEAN NOT NULL DEFAULT FALSE,

    -- Step 2: education-specific interest answers (JSON, keyed by question id)
    page2_json       TEXT NOT NULL,

    -- Step 3: the 12 skill ratings, 1-5 (JSON, keyed by skill id)
    page3_json       TEXT NOT NULL,

    -- Step 4: the four free-text responses (dream career, strengths,
    -- weaknesses, anything else)
    page4_json       TEXT NOT NULL,

    -- The validated AI recommendation (JSON: { "careers": [ ...exactly 3... ] }).
    -- NULL until Gemini has returned a response that passed validation.
    ai_result_json   MEDIUMTEXT NULL,

    -- processing -> completed (valid AI result stored)
    --            -> failed     (Gemini/validation failed; student can retry)
    status           VARCHAR(20) NOT NULL DEFAULT 'processing',

    created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at     DATETIME NULL,

    INDEX idx_assessments_user_phone_created (user_phone, created_at)
);
