/**
 * assessment.js
 * Shared helpers used by page1.js .. page4.js:
 *   - persistent state (kept in localStorage so a multi-page,
 *     non-SPA flow can carry answers forward and backward)
 *   - the progress rail / mobile progress bar
 *   - a small set of DOM-building utilities reused across pages
 *
 * This file has no knowledge of question content — see questions-data.js.
 */

const STORAGE_KEY = "careerAssessmentData";

const STEPS = [
  { key: "profile", label: "Education Journey", sub: "Step 1", href: "page1.jsp" },
  { key: "interests", label: "Interests", sub: "Step 2", href: "page2.jsp" },
  { key: "selfAssessment", label: "Skills & Strengths", sub: "Step 3", href: "page3.jsp" },
  { key: "aboutYou", label: "About You", sub: "Step 4", href: "page4.jsp" }
];

/**
 * profile shape (see also questions-data.js and README):
 * {
 *   name, age, gender,
 *   educationLevel: "After 10th" | "After 12th" | "Diploma"   // kept for backward compatibility
 *   stream, group,                                            // After 12th only
 *   nextPath: "school" | "diploma" | "unsure",                // After 10th only; "unsure" skips
 *                                                              // the assessment and routes to explore.html
 *   diplomaStatus: "planning" | "studying" | "completed",     // planning = 10th->diploma, else existing diploma student
 *   diplomaBranchKnowledge: "known" | "confused",             // After 10th -> Diploma only
 *   diplomaBranch                                             // chosen branch, only set when known
 * }
 */
function defaultState() {
  return {
    profile: null,        // see shape above
    consent: false,       // AI-processing privacy consent, required before the assessment starts
    page2Answers: null,   // { [questionId]: string | string[] }
    page3Ratings: null,   // { [skillId]: number }
    page4Responses: null, // { [essayId]: string }
    completed: { profile: false, interests: false, selfAssessment: false, aboutYou: false }
  };
}

/* ---------------------------------------------------------------
   Per-login binding of the temporary answers
   ---------------------------------------------------------------
   The server (see owner-meta.jspf) puts a random, per-login token in a
   <meta name="cg-owner"> tag. Anything stored in localStorage is tagged
   with that token; if the token doesn't match (a different user, a new
   login, or data saved before this check existed) the stored answers are
   discarded BEFORE any page can read them. The token is random — it is not
   the phone number, user id or session id. */
function currentOwnerToken() {
  const meta = document.querySelector('meta[name="cg-owner"]');
  return meta ? meta.getAttribute("content") : null;
}

/** Removes the temporary assessment answers from this browser. */
function clearAssessmentState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
}

(function discardForeignState() {
  const token = currentOwnerToken();
  if (!token) return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.owner !== token) clearAssessmentState();
  } catch (e) {
    clearAssessmentState();
  }
})();

/* If the browser restores a page from its back/forward cache (e.g. pressing Back after
   a submit or a logout), the old form values would still be on screen. Re-check the
   saved answers and reload so the page is rebuilt from the current, valid state. */
window.addEventListener("pageshow", function (event) {
  if (event.persisted) window.location.reload();
});

function getState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.error("Could not read assessment state, starting fresh.", e);
    return defaultState();
  }
}

function saveState(patch) {
  const current = getState();
  const next = Object.assign({}, current, patch);
  const token = currentOwnerToken();
  if (token) next.owner = token;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function markStepComplete(stepKey) {
  const state = getState();
  state.completed[stepKey] = true;
  saveState({ completed: state.completed });
}

/** Redirects to page1 if a required earlier step hasn't been completed yet. */
function requireStepsBefore(stepKeys) {
  const state = getState();
  const missing = stepKeys.find((k) => !state.completed[k]);
  if (missing) {
    window.location.href = "page1.jsp";
  }
  return state;
}

/* ---------------------------------------------------------------
   Progress rail (desktop) + progress bar (mobile)
   --------------------------------------------------------------- */

function renderProgress(currentKey) {
  const rail = document.getElementById("progressRail");
  const track = document.getElementById("progressTrack");
  const caption = document.getElementById("progressCaption");
  const state = getState();
  const currentIndex = STEPS.findIndex((s) => s.key === currentKey);

  if (rail) {
    rail.innerHTML = "";
    STEPS.forEach((step, i) => {
      const isComplete = state.completed[step.key] && i !== currentIndex;
      const isCurrent = i === currentIndex;
      const el = document.createElement("div");
      el.className = "rail-step" + (isComplete ? " is-complete" : "") + (isCurrent ? " is-current" : "");
      el.innerHTML = `<span class="rail-sub">${step.sub}</span><span class="rail-label">${step.label}</span>`;
      rail.appendChild(el);
    });
  }

  if (track) {
    track.innerHTML = "";
    STEPS.forEach((step, i) => {
      const isComplete = state.completed[step.key] && i !== currentIndex;
      const isCurrent = i === currentIndex;
      const tick = document.createElement("div");
      tick.className = "tick" + (isComplete ? " is-complete" : "") + (isCurrent ? " is-current" : "");
      tick.innerHTML = "<span></span>";
      track.appendChild(tick);
    });
  }

  if (caption) {
    caption.textContent = `Step ${currentIndex + 1} of ${STEPS.length} — ${STEPS[currentIndex].label}`;
  }
}

/* ---------------------------------------------------------------
   Unsaved-changes guard
   --------------------------------------------------------------- */

let dirty = false;
function markDirty() {
  dirty = true;
}
function clearDirty() {
  dirty = false;
}
window.addEventListener("beforeunload", (e) => {
  if (!dirty) return;
  e.preventDefault();
  e.returnValue = "";
});

/* ---------------------------------------------------------------
   Small DOM-building utilities shared by page2 / page3
   --------------------------------------------------------------- */

const CHECK_SVG = '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8.5L6.2 11.5L13 4.5" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

function showErrorBanner(bannerEl, message) {
  bannerEl.textContent = message;
  bannerEl.classList.add("visible");
  bannerEl.scrollIntoView({ behavior: "smooth", block: "center" });
}

function hideErrorBanner(bannerEl) {
  bannerEl.classList.remove("visible");
}

/** Briefly shows a friendly inline message under a question (e.g. max-selection reached). */
function flashNotice(noticeEl, message) {
  if (!noticeEl) return;
  noticeEl.textContent = message;
  noticeEl.classList.add("visible");
  clearTimeout(noticeEl._hideTimer);
  noticeEl._hideTimer = setTimeout(() => noticeEl.classList.remove("visible"), 2600);
}
