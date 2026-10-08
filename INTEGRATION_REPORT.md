# Career Guide — AI Career Assessment Integration Report

The original B46-77 project is the foundation. The 4-step assessment from
career-guidance-portal-updated.zip has been integrated into it as a
module under `/assessment`. This is one deployable webapp — not two
projects glued together.

---

## 1. Final project structure

```
B46-77/
├── index.jsp                 (MODIFIED — nav link, session-bug fix, CTA)
├── form.jsp                  (MODIFIED — nav link only)
├── recommendation.jsp        (MODIFIED — nav link only)
├── login.jsp                 (unchanged)
├── logout.jsp                (unchanged)
├── signup.jsp                (unchanged)
├── feedback.html             (unchanged)
├── resume.html                (unchanged)
├── style.css / script.js     (unchanged)
├── error.jsp                 (NEW — generic error page, no stack traces)
├── lib/                       (unchanged — mysql connector, servlet-api)
├── sql/
│   └── assessment_schema.sql  (NEW — additive schema for the assessment feature)
├── src/com/career/
│   ├── LoginServlet.java       (unchanged)
│   ├── SignupServlet.java      (unchanged)
│   ├── CareerServlet.java      (unchanged — old keyword recommender, kept as fallback)
│   ├── FeedbackServlet.java    (unchanged)
│   ├── JsonUtil.java           (NEW — dependency-free JSON parse/write)
│   ├── DBUtil.java             (NEW — shared connection helper for new servlets)
│   ├── GeminiService.java      (NEW — server-side Gemini call)
│   ├── RecommendationValidator.java (NEW — validates Gemini output)
│   ├── AssessmentSubmitServlet.java (NEW — /AssessmentSubmitServlet)
│   └── AssessmentResultServlet.java (NEW — /AssessmentResultServlet)
├── WEB-INF/
│   ├── web.xml                          (NEW — see note below)
│   ├── gemini.properties.template       (NEW — copy to gemini.properties, fill in key)
│   └── classes/com/career/*.class       (unchanged pre-compiled classes — see Compilation)
└── assessment/                          (NEW module — was the standalone assessment ZIP)
    ├── index.jsp     (landing page — hero background, "Start My Assessment")
    ├── page1.jsp      (Step 1 — Education/Profile)
    ├── page2.jsp      (Step 2 — Education-specific interests)
    ├── page3.jsp      (Step 3 — 12 skill ratings)
    ├── page4.jsp      (Step 4 — About You + submission)
    ├── results.jsp    (Top 3 AI recommendations)
    ├── explore.jsp    (Explore Careers)
    ├── css/           (style.css, assessment.css, responsive.css, results.css [NEW])
    └── js/            (assessment.js, page1-4.js, questions-data.js, results.js [NEW])
```

---

## 2. Files created

- `assessment/*.jsp` (7 pages — converted from the assessment ZIP's `.html`)
- `assessment/css/results.css`
- `assessment/js/results.js`
- `src/com/career/JsonUtil.java`
- `src/com/career/DBUtil.java`
- `src/com/career/GeminiService.java`
- `src/com/career/RecommendationValidator.java`
- `src/com/career/AssessmentSubmitServlet.java`
- `src/com/career/AssessmentResultServlet.java`
- `WEB-INF/web.xml`
- `WEB-INF/gemini.properties.template`
- `error.jsp`
- `sql/assessment_schema.sql`

## 3. Files modified

- `index.jsp` — fixed a pre-existing bug where the login-state check read
  `session.getAttribute("user")` but `LoginServlet` actually sets
  `"phone"` (so Login/Logout never reflected real session state); added
  a "Career Assessment" nav link (desktop + mobile); the hero "Get
  Started" button now links to `assessment/index.jsp`.
- `form.jsp`, `recommendation.jsp` — added the same "Career Assessment"
  nav link for a consistent navbar across the old pages (no other
  changes).
- `assessment/index.jsp`, `page1-4.jsp`, `results.jsp`, `explore.jsp` —
  converted from `.html`: added a session guard (redirects to
  `../login.jsp` if not logged in), replaced the Compass brand
  (`brand-mark`/`brand-name`/title) with the CareerGuide brand, fixed
  the header's brand/logout links to point at the real portal root
  (`../index.jsp`, `../logout.jsp`), and rewrote internal `.html`
  links/routes to `.jsp`.
- `assessment/js/page1.js`, `page2.js`, `page3.js`, `assessment.js` —
  only their internal route strings (`"page1.html"` → `"page1.jsp"`
  etc.) were changed; all logic is untouched.
- `assessment/js/page4.js` — `BACKEND_SUBMIT_URL` now points at
  `../AssessmentSubmitServlet` (was the placeholder `/api/assessment/submit`);
  the submit payload now also includes `consent` (was tracked locally
  but never sent — needed so consent can be stored per Phase 2).

## 4. Files deleted

- `WEB-INF_backup/` — an unused backup directory left over from a prior
  attempt (duplicate `.class` files + an incomplete `web.xml` that only
  mapped 2 of the 4 servlets). It was never referenced by any code or
  by Tomcat's deployment descriptor. Removed as clutter, per the
  "don't repeat the disorganized/shuffled state" instruction.

Nothing from the original recommendation flow (`form.jsp`,
`CareerServlet.java`, `recommendation.jsp`) was deleted — they're kept
as the fallback, exactly as instructed.

---

## 5. Database changes

One new table, `assessments` — see `sql/assessment_schema.sql`. It does
**not** touch `users`, `careers`, or `feedback`. Apply it with:

```
mysql -u root careerdb < sql/assessment_schema.sql
```

`assessments` stores: `user_phone` (associates a row with the logged-in
user, matching the existing session convention), the four steps'
answers as JSON columns, a `consent` flag, the validated AI result
(`ai_result_json`, `NULL` until Gemini succeeds), and a `status`
(`processing` / `completed` / `failed`).

## 6. Gemini integration details

- `GeminiService.java` calls
  `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
  over plain `HttpURLConnection` (no extra HTTP library needed).
- The prompt sends **only** career-relevant fields — profile (minus
  `name`), Step 2 answers, Step 3 skill ratings, Step 4 free-text
  answers. Name, phone, email, and password are never sent.
- The model is asked to return `responseMimeType: application/json`
  matching a fixed schema (`careers[3]`, each with `careerName`,
  `matchPercentage`, `whyFits`, `educationalPath`, `skillsToDevelop[]`,
  `roadmap.{shortTerm,midTerm,longTerm}`).
- `RecommendationValidator.java` rejects the response if it isn't
  exactly 3 careers, has duplicate/empty names, an out-of-range match
  percentage, or a missing roadmap stage — nothing invalid is ever
  stored or shown.
- `AssessmentSubmitServlet` calls Gemini once, at submission time, and
  stores the validated result. `AssessmentResultServlet` (used by
  `results.jsp`) only ever reads that stored row — reloading the
  results page does **not** call Gemini again.

## 7. Where to configure the Gemini API key

1. Copy `WEB-INF/gemini.properties.template` to
   `WEB-INF/gemini.properties` (same folder).
2. Set `gemini.api.key=<your key>` (get one at
   https://aistudio.google.com/app/apikey).
3. Make sure this file ends up in `WEB-INF/classes/gemini.properties`
   when you build (see Compilation below) — `GeminiService` loads it
   from the classpath. It is never served as a static file and never
   sent to the browser.

## 8. Required dependencies

Already in `/lib` (unchanged):
- `mysql-connector-j-9.0.0.jar`
- `servlet-api.jar`

No new libraries were added — the JSON parsing and the Gemini HTTP call
both use only the JDK, per the "don't introduce unnecessary
frameworks" instruction.

## 9. Compilation instructions

This environment doesn't have a JDK (`javac`) available, so the two new
servlets and their three helper classes are delivered as source only —
**you'll need to compile the full `src/com/career` package together**
before deploying, since the new servlets depend on the new helper
classes. The 4 original `.class` files in `WEB-INF/classes` are left
exactly as they were; recompiling everything together is the simplest
correct path (skip the `javac` warning about deprecated encoding if
you see one — you can pin `-encoding UTF-8` explicitly).

From the project root (`B46-77/`):

```bash
javac -encoding UTF-8 \
  -cp "lib/servlet-api.jar:lib/mysql-connector-j-9.0.0.jar" \
  -d WEB-INF/classes \
  src/com/career/*.java

# Copy the Gemini config so it's on the classpath at runtime:
cp WEB-INF/gemini.properties WEB-INF/classes/gemini.properties
```

(On Windows, use `;` instead of `:` in `-cp`.)

## 10. Tomcat deployment instructions

1. Run the compilation step above.
2. Apply the schema: `mysql -u root careerdb < sql/assessment_schema.sql`.
3. Confirm `WEB-INF/gemini.properties` exists with a real API key, and
   that it's copied into `WEB-INF/classes/gemini.properties`.
4. Copy the entire `B46-77/` folder into Tomcat's `webapps/` directory
   (e.g. `webapps/B46-77/`), or deploy it as the ROOT context if
   that's how you've been running it.
5. Start Tomcat.

## 11. Exact URL to open the application

- If deployed as `webapps/B46-77`: `http://localhost:8080/B46-77/index.jsp`
- The assessment module itself: `http://localhost:8080/B46-77/assessment/index.jsp`
  (requires being logged in — otherwise it redirects to `login.jsp`).

## 12. Complete testing instructions

1. `signup.jsp` → create an account (phone + password).
2. `login.jsp` → log in.
3. From `index.jsp`, click **Career Assessment** in the nav (or **Get
   Started**) → lands on `assessment/index.jsp`.
4. Click **Start My Assessment** → Step 1: fill in name/age/gender,
   pick an education path (try each of After 10th / After 12th /
   Diploma to exercise the branching), check the consent box, Continue.
5. Step 2: answer the education-specific interest questions that
   appear (these change based on your Step 1 choice) → Continue.
6. Step 3: rate all 12 skills → Continue.
7. Step 4: fill in all four text responses → Submit. You'll see a
   loading overlay while the servlet calls Gemini.
8. On success you land on `results.jsp` with exactly 3 ranked career
   cards (match %, why it fits, educational path, skills to develop,
   3-stage roadmap). Reload the page — it should NOT call Gemini again
   (check server logs / response time).
9. Try **Retake Assessment**, **Explore Careers**, and **Back to
   Dashboard** — all three should work.
10. Log out, log back in as a different user, and confirm you only
    ever see your own latest results (never another user's).
11. Sanity-check the old flow still works: `form.jsp` → submit → still
    reaches the old keyword-based `recommendation.jsp` unchanged.

## 13. Remaining limitations

- **No JDK in this build environment** — the new servlets are
  delivered as source and must be compiled per §9 before deployment.
- **Gemini model name** — `GeminiService` defaults to
  `gemini-2.0-flash`; if that model name is retired or you prefer a
  different one, override it with `gemini.model=...` in
  `gemini.properties`.
- **`assessment/js/questions-data.js`** still has the one gap flagged
  in the original assessment ZIP's own README: no dedicated
  "Other" Diploma-branch question set (a 3-question fallback is used
  instead) — this was pre-existing content in the assessment module,
  not something this integration changed.
- **DB credentials** are still hard-coded (`root` / no password) to
  match the existing servlets' convention — update `DBUtil.java` (and
  the 4 original servlets, if you choose to) if your MySQL instance
  differs.
