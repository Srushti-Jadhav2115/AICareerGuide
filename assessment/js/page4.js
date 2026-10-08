/**
 * page4.js — Tell Us More About You (final step)
 *
 * On submit this assembles the full assessment payload and POSTs it to
 * the backend. Update BACKEND_SUBMIT_URL to point at the real
 * Java Servlet endpoint when it's available. The Gemini call itself
 * must happen server-side — never add an API key here.
 */

// Relative to /assessment/page4.jsp -> resolves to the AssessmentSubmitServlet
// mounted at the webapp root, regardless of the app's deployed context path.
const BACKEND_SUBMIT_URL = "../AssessmentSubmitServlet";

document.addEventListener("DOMContentLoaded", () => {
  const state = requireStepsBefore(["profile", "interests", "selfAssessment"]);
  renderProgress("aboutYou");
  hydrateHeaderChip(state);

  renderEssays(window.ESSAY_BANK, state.page4Responses || {});

  document.getElementById("prevBtn").addEventListener("click", () => {
    window.location.href = "page3.jsp";
  });

  document.getElementById("page4Form").addEventListener("submit", onSubmit);
});

function hydrateHeaderChip(state) {
  if (!state.profile) return;
  document.getElementById("userAvatar").textContent = state.profile.name.charAt(0).toUpperCase();
  document.getElementById("userNameChip").textContent = state.profile.name;
}

function renderEssays(essays, savedResponses) {
  const list = document.getElementById("essayList");
  list.innerHTML = "";

  essays.forEach((essay) => {
    const card = el("div", "card textarea-card");
    card.appendChild(el("p", "q-text", essay.text));
    card.appendChild(el("p", "q-explainer", essay.explainer));

    const textarea = document.createElement("textarea");
    textarea.className = "essay-input";
    textarea.id = essay.id;
    textarea.maxLength = essay.maxLength;
    textarea.placeholder = "Write as much or as little as feels right…";
    textarea.value = savedResponses[essay.id] || "";
    card.appendChild(textarea);

    const counter = el("div", "char-counter");
    counter.id = `${essay.id}_counter`;
    card.appendChild(counter);

    card.appendChild(el(
      "p", "security-note",
      "Please avoid entering passwords, financial information, contact details, or other sensitive personal information."
    ));

    const updateCounter = () => {
      const len = textarea.value.length;
      counter.textContent = `${len}/${essay.maxLength}`;
      counter.classList.toggle("is-near-limit", len >= essay.maxLength - 20);
    };
    updateCounter();

    textarea.addEventListener("input", () => {
      markDirty();
      updateCounter();
    });

    list.appendChild(card);
  });
}

function onSubmit(e) {
  e.preventDefault();
  const banner = document.getElementById("formErrorBanner");
  hideErrorBanner(banner);

  const responses = {};
  let allFilled = true;

  window.ESSAY_BANK.forEach((essay) => {
    const value = document.getElementById(essay.id).value.trim();
    if (!value) allFilled = false;
    responses[essay.id] = value;
  });

  if (!allFilled) {
    showErrorBanner(banner, "Please answer all four questions before completing the assessment.");
    return;
  }

  const state = getState();
  const finalState = saveState({
    page4Responses: responses,
    completed: Object.assign(state.completed, { aboutYou: true })
  });

  clearDirty();
  submitAssessment(finalState);
}

function submitAssessment(finalState) {
  const overlay = document.getElementById("submitOverlay");
  overlay.classList.add("visible");
  document.getElementById("submitBtn").disabled = true;

  const payload = {
    profile: finalState.profile,
    consent: !!finalState.consent,
    page2Answers: finalState.page2Answers,
    page3Ratings: finalState.page3Ratings,
    page4Responses: finalState.page4Responses
  };

  fetch(BACKEND_SUBMIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
    .then((res) => {
      if (!res.ok) {
        // Surface the server's message (e.g. missing consent) instead of a generic one.
        return res.json().catch(() => ({})).then((b) => {
          const e = new Error("Submission failed with status " + res.status);
          if (res.status === 403 && b && b.message) e.serverMessage = b.message;
          throw e;
        });
      }
      return res.json();
    })
    .then((body) => {
      // Only a confirmed success (server has stored a validated result and set
      // status = completed) clears the temporary answers. On any failure the
      // answers stay in this browser so the student can simply retry.
      if (!body || body.status !== "success") throw new Error("Submission was not confirmed");
      try { clearAssessmentState(); }
      catch (e) { try { localStorage.removeItem("careerAssessmentData"); } catch (e2) { /* ignore */ } }
      window.location.href = "results.jsp";
    })
    .catch((err) => {
      console.error("Assessment submission error:", err);
      overlay.classList.remove("visible");
      document.getElementById("submitBtn").disabled = false;
      showErrorBanner(
        document.getElementById("formErrorBanner"),
        err.serverMessage || "We couldn't reach the server. Your answers are saved locally — please try again."
      );
    });
}
