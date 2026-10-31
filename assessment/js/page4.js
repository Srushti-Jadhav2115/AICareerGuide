/**
 * page4.js — Tell Us More About You
 * Final step of the NextHorizon Career Assessment
 */

const BACKEND_SUBMIT_URL = "../AssessmentSubmitServlet";

document.addEventListener("DOMContentLoaded", () => {
    const state = requireStepsBefore([
        "profile",
        "interests",
        "selfAssessment"
    ]);

    renderProgress("aboutYou");
    hydrateHeaderChip(state);

    renderEssays(
        window.ESSAY_BANK,
        state.page4Responses || {}
    );

    document.getElementById("prevBtn").addEventListener("click", () => {
        window.location.href = "page3.jsp";
    });

    document.getElementById("page4Form").addEventListener(
        "submit",
        onSubmit
    );
});

function hydrateHeaderChip(state) {
    if (!state.profile) return;

    const name = state.profile.name || "Student";

    document.getElementById("userAvatar").textContent =
        name.charAt(0).toUpperCase();

    document.getElementById("userNameChip").textContent = name;
}

function renderEssays(essays, savedResponses) {
    const list = document.getElementById("essayList");

    if (!list || !Array.isArray(essays)) return;

    list.innerHTML = "";

    essays.forEach((essay) => {
        const card = el("div", "card textarea-card");

        card.appendChild(
            el("p", "q-text", essay.text)
        );

        card.appendChild(
            el("p", "q-explainer", essay.explainer)
        );

        const textarea = document.createElement("textarea");

        textarea.className = "essay-input";
        textarea.id = essay.id;
        textarea.maxLength = essay.maxLength;
        textarea.placeholder =
            "Write as much or as little as feels right…";

        textarea.value = savedResponses[essay.id] || "";

        card.appendChild(textarea);

        const counter = el("div", "char-counter");
        counter.id = `${essay.id}_counter`;

        card.appendChild(counter);

        card.appendChild(
            el(
                "p",
                "security-note",
                "Please avoid entering passwords, financial information, " +
                "contact details, or other sensitive personal information."
            )
        );

        function updateCounter() {
            const length = textarea.value.length;

            counter.textContent =
                `${length}/${essay.maxLength}`;

            counter.classList.toggle(
                "is-near-limit",
                length >= essay.maxLength - 20
            );
        }

        updateCounter();

        textarea.addEventListener("input", () => {
            markDirty();
            updateCounter();
        });

        list.appendChild(card);
    });
}

function onSubmit(event) {
    event.preventDefault();

    const banner = document.getElementById("formErrorBanner");

    hideErrorBanner(banner);

    const responses = {};
    let allFilled = true;

    window.ESSAY_BANK.forEach((essay) => {
        const field = document.getElementById(essay.id);
        const value = field ? field.value.trim() : "";

        if (!value) {
            allFilled = false;
        }

        responses[essay.id] = value;
    });

    if (!allFilled) {
        showErrorBanner(
            banner,
            "Please answer all four questions before completing the assessment."
        );
        return;
    }

    const state = getState();

    const finalState = saveState({
        page4Responses: responses,
        completed: Object.assign(
            {},
            state.completed || {},
            { aboutYou: true }
        )
    });

    clearDirty();

    submitAssessment(finalState);
}

function submitAssessment(finalState) {
    const overlay = document.getElementById("submitOverlay");
    const submitButton = document.getElementById("submitBtn");
    const banner = document.getElementById("formErrorBanner");

    overlay.classList.add("visible");
    submitButton.disabled = true;

    const payload = {
        profile: finalState.profile,
        consent: !!finalState.consent,
        page2Answers: finalState.page2Answers,
        page3Ratings: finalState.page3Ratings,
        page4Responses: finalState.page4Responses
    };

    fetch(BACKEND_SUBMIT_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(async (response) => {
            const body = await response.json().catch(() => ({}));

            if (!response.ok) {
                const error = new Error(
                    body.message ||
                    `Submission failed with status ${response.status}`
                );

                error.serverMessage = body.message;
                throw error;
            }

            return body;
        })
        .then((body) => {
            if (!body || body.status !== "success") {
                throw new Error(
                    "Assessment submission was not confirmed."
                );
            }

            try {
                clearAssessmentState();
            } catch (error) {
                try {
                    localStorage.removeItem("careerAssessmentData");
                } catch (storageError) {
                    // Ignore local storage cleanup errors.
                }
            }

            window.location.href = "results.jsp";
        })
        .catch((error) => {
            console.error("Assessment submission error:", error);

            overlay.classList.remove("visible");
            submitButton.disabled = false;

            showErrorBanner(
                banner,
                error.serverMessage ||
                "We couldn't reach the server. Your answers are saved locally. Please try again."
            );
        });
}