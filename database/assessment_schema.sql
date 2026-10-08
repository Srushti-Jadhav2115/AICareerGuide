-- =====================================================================
-- assessment_schema.sql
--
-- New table added to support the 4-step Career Assessment integration.
-- Run this once against the existing `careerdb` database.
--
--   mysql -u root -p careerdb < database/assessment_schema.sql
--
-- This does NOT modify, rename, or drop any existing table (`users`,
-- `careers`, `feedback`, etc.). It only adds one new table.
-- =====================================================================

USE careerdb;

CREATE TABLE IF NOT EXISTS assessment_responses (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Links this submission back to the logged-in user. The rest of the
    -- app identifies a user by phone number (see LoginServlet /
    -- SignupServlet, which key the session on "phone"), so this table
    -- follows the same convention rather than assuming a `users.id`
    -- column exists. No FK constraint is declared here because the
    -- existing `users` table's exact keys/indexes aren't guaranteed --
    -- add one yourself if `users.phone` is UNIQUE/PRIMARY in your schema:
    --   ALTER TABLE assessment_responses
    --     ADD CONSTRAINT fk_assessment_user
    --     FOREIGN KEY (user_phone) REFERENCES users(phone);
    user_phone                  VARCHAR(20)  NOT NULL,

    -- ---- Step 1: profile / education journey ----
    full_name                   VARCHAR(150),
    age                         INT,
    gender                      VARCHAR(20),
    education_level             VARCHAR(40),   -- "After 10th" | "After 12th" | "Diploma"
    stream                      VARCHAR(40),   -- After 12th only
    edu_group                   VARCHAR(40),   -- After 12th, Science only ("group" is a reserved word)
    next_path                   VARCHAR(40),   -- After 10th only: diploma | school | unsure
    diploma_branch_knowledge    VARCHAR(40),   -- After 10th -> Diploma only
    diploma_status               VARCHAR(40),  -- planning | studying | completed
    diploma_branch               VARCHAR(150),
    consent_given                TINYINT(1) NOT NULL DEFAULT 0,

    -- ---- Step 2: education-specific interest answers ----
    -- Stored as JSON because the question set (and therefore the keys)
    -- differs per education path/branch -- see questions-data.js.
    interests_json                JSON NULL,

    -- ---- Step 3: 12 skill ratings (1-5 each) ----
    skill_ratings_json            JSON NULL,

    -- ---- Step 4: written responses ----
    dream_career                  TEXT,
    strengths                     TEXT,
    weaknesses                    TEXT,
    anything_else                 TEXT,

    -- 'submitted' until the (not-yet-built) AI recommendation step
    -- processes it, then flip to 'processed'.
    status                         VARCHAR(20) NOT NULL DEFAULT 'submitted',

    created_at                     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_assessment_user_phone (user_phone),
    INDEX idx_assessment_status (status)
);

-- Note on MySQL versions: the JSON column type requires MySQL 5.7.8+ /
-- MariaDB 10.2.7+. If your server is older, change interests_json and
-- skill_ratings_json to LONGTEXT -- AssessmentServlet already stores
-- them as plain JSON *text* either way, so no Java code changes needed.
