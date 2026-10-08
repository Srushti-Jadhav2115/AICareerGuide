/**
 * page2.js — dynamic Career Assessment
 * One reusable layout; the question set rendered depends entirely on
 * the profile saved on Page 1 (see resolveQuestionSet()).
 */

let CURRENT_QUESTIONS = [];

document.addEventListener("DOMContentLoaded", () => {
  const state = requireStepsBefore(["profile"]);
  renderProgress("interests");

  hydrateHeaderChip(state);

  const { title, intro, questions } = resolveQuestionSet(state.profile);
  CURRENT_QUESTIONS = questions;

  document.getElementById("pageTitle").textContent = title;
  const subtitleEl = document.querySelector(".page-subtitle");
  if (subtitleEl && intro) subtitleEl.textContent = intro;
  renderQuestions(questions, state.page2Answers || {});
  updateProgressText();

  document.getElementById("prevBtn").addEventListener("click", () => {
    window.location.href = "page1.jsp";
  });

  document.getElementById("page2Form").addEventListener("submit", onSubmit);
});

function hydrateHeaderChip(state) {
  if (!state.profile) return;
  document.getElementById("userAvatar").textContent = state.profile.name.charAt(0).toUpperCase();
  document.getElementById("userNameChip").textContent = state.profile.name;
}

/** Maps a Diploma branch value (from either the "known" single-select or the
 *  existing-Diploma-student field) to a key in window.QUESTION_BANK.diploma. */
const DIPLOMA_BRANCH_MAP = {
  Computer: "computer",
  "Information Technology": "computer", // shares the Computer Engineering set
  Mechanical: "mechanical",
  Automobile: "mechanical", // shares the Mechanical/Automobile set
  Civil: "civil",
  Electronics: "electronics",
  Electrical: "electronics", // shares the Electronics/Electrical set
  Other: "other"
};

/** Maps the Page 1 profile to a { title, intro, questions } question set. */
function resolveQuestionSet(profile) {
  const bank = window.QUESTION_BANK;

  if (profile.educationLevel === "After 10th") {
    if (profile.nextPath === "diploma") {
      // Branch already decided ("I know my branch") -> the real branch quiz.
      if (profile.diplomaBranchKnowledge === "known" && profile.diplomaBranch) {
        const key = DIPLOMA_BRANCH_MAP[profile.diplomaBranch] || "other";
        return bank.diploma[key];
      }
      // "I'm confused" -> branch-discovery quiz, designed specifically to
      // differentiate between Diploma branches without asking the student
      // to name one directly.
      return bank.diploma.branchDiscovery;
    }
    // "11th & 12th" -> general stream-discovery quiz. ("I'm not sure yet"
    // never reaches this page in the normal flow — page1.js redirects that
    // choice straight to explore.html — this is just a safety net for a
    // directly-typed URL with old saved state.)
    return bank.after10th;
  }

  if (profile.educationLevel === "After 12th") {
    if (profile.stream === "Science") {
      // PCM / PCB / PCMB each get their own dedicated question set.
      const groupKey = { PCM: "pcm", PCB: "pcb", PCMB: "pcmb" }[profile.group] || "pcm";
      return bank.science[groupKey];
    }
    if (profile.stream === "Commerce") return bank.commerce;
    if (profile.stream === "Arts") return bank.arts;
  }

  if (profile.educationLevel === "Diploma") {
    const key = DIPLOMA_BRANCH_MAP[profile.diplomaBranch] || "other";
    return bank.diploma[key];
  }

  // Fallback safety net — should not normally be reached.
  return bank.after10th;
}

function renderQuestions(questions, savedAnswers) {
  const list = document.getElementById("questionList");
  list.innerHTML = "";

  questions.forEach((q, index) => {
    const card = el("div", "card question-card");
    card.dataset.questionId = q.id;

    const indexLabel = el("span", "q-index", `Question ${index + 1} of ${questions.length}`);
    const text = el("p", "q-text", q.text);
    card.appendChild(indexLabel);
    card.appendChild(text);

    if (q.type === "multi") {
      const hint = el("span", "q-select-hint", `Choose up to ${q.maxSelect} options.`);
      card.appendChild(hint);
    } else if (q.type === "rating") {
      const hint = el("span", "q-select-hint", "Rate yourself honestly. There are no right or wrong answers.");
      card.appendChild(hint);
    }

    if (q.type === "rating") {
      renderRatingQuestion(q, card, savedAnswers[q.id]);
    } else {
      renderChoiceQuestion(q, card, savedAnswers[q.id]);
    }

    list.appendChild(card);
  });
}

function renderChoiceQuestion(q, card, savedValue) {
  const grid = el("div", "option-grid");

  q.options.forEach((optionText, oi) => {
    const optId = `${q.id}_opt${oi}`;
    const wrapper = el("div", "option-card" + (q.type === "single" ? " is-radio" : ""));
    const input = document.createElement("input");
    input.type = q.type === "single" ? "radio" : "checkbox";
    input.name = q.id;
    input.id = optId;
    input.value = optionText;

    if (q.type === "single" && savedValue === optionText) input.checked = true;
    if (q.type === "multi" && Array.isArray(savedValue) && savedValue.includes(optionText)) {
      input.checked = true;
    }

    const label = document.createElement("label");
    label.setAttribute("for", optId);
    label.innerHTML = `<span class="mark">${CHECK_SVG}</span><span>${optionText}</span>`;

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    grid.appendChild(wrapper);

    input.addEventListener("change", () => {
      markDirty();
      if (q.type === "multi") enforceMaxSelect(q, card);
      updateProgressText();
    });

    if (q.type === "multi") {
      // Disabled checkboxes swallow clicks silently — intercept on the
      // wrapper so a user trying to pick a 4th option still gets feedback.
      wrapper.addEventListener("click", () => {
        if (input.disabled && !input.checked) {
          flashNotice(
            document.getElementById(`${q.id}_notice`),
            `You can select up to ${q.maxSelect} options. Remove one selection to choose another.`
          );
        }
      });
    }
  });

  card.appendChild(grid);

  if (q.type === "multi") {
    const counter = el("span", "q-select-counter");
    counter.id = `${q.id}_counter`;
    card.appendChild(counter);
    const notice = el("p", "inline-notice");
    notice.id = `${q.id}_notice`;
    card.appendChild(notice);
    enforceMaxSelect(q, card);
  }
}

function renderRatingQuestion(q, card, savedValue) {
  card.classList.add("rating-card");
  const labels = q.ratingLabels || window.RATING_LABELS;
  const scale = el("div", "rating-scale");

  for (let value = 1; value <= 5; value++) {
    const optId = `${q.id}_r${value}`;
    const wrapper = el("div", "rating-option");
    const input = document.createElement("input");
    input.type = "radio";
    input.name = q.id;
    input.id = optId;
    input.value = String(value);
    if (Number(savedValue) === value) input.checked = true;

    const label = document.createElement("label");
    label.setAttribute("for", optId);
    label.textContent = String(value);

    wrapper.appendChild(input);
    wrapper.appendChild(label);
    scale.appendChild(wrapper);

    input.addEventListener("change", () => {
      markDirty();
      updateProgressText();
    });
  }
  card.appendChild(scale);

  const scaleLabels = el("div", "rating-scale-labels", `<span>${labels[0]}</span><span>${labels[labels.length - 1]}</span>`);
  card.appendChild(scaleLabels);
}

function enforceMaxSelect(question, card) {
  const inputs = card.querySelectorAll(`input[name="${question.id}"]`);
  const checked = Array.from(inputs).filter((i) => i.checked);
  const counter = document.getElementById(`${question.id}_counter`);

  inputs.forEach((i) => {
    i.disabled = !i.checked && checked.length >= question.maxSelect;
  });

  if (counter) {
    counter.textContent = `${checked.length} / ${question.maxSelect} selected`;
    counter.classList.toggle("is-satisfied", checked.length > 0);
  }
}

function updateProgressText() {
  const answered = CURRENT_QUESTIONS.filter((q) => {
    const inputs = document.querySelectorAll(`input[name="${q.id}"]:checked`);
    return inputs.length > 0;
  }).length;

  document.getElementById("qProgressText").textContent = `Question ${Math.min(answered + 1, CURRENT_QUESTIONS.length)} of ${CURRENT_QUESTIONS.length}`;
  document.getElementById("qAnsweredCount").textContent = `${answered} / ${CURRENT_QUESTIONS.length} answered`;
}

function onSubmit(e) {
  e.preventDefault();
  const banner = document.getElementById("formErrorBanner");
  hideErrorBanner(banner);

  const answers = {};
  let allAnswered = true;

  CURRENT_QUESTIONS.forEach((q) => {
    const checkedInputs = Array.from(document.querySelectorAll(`input[name="${q.id}"]:checked`));
    if (checkedInputs.length === 0) {
      allAnswered = false;
      return;
    }
    if (q.type === "multi") {
      answers[q.id] = checkedInputs.map((i) => i.value);
    } else if (q.type === "rating") {
      answers[q.id] = Number(checkedInputs[0].value);
    } else {
      answers[q.id] = checkedInputs[0].value;
    }
  });

  if (!allAnswered) {
    showErrorBanner(banner, "Please answer all required questions before continuing.");
    return;
  }

  const state = getState();
  saveState({
    page2Answers: answers,
    completed: Object.assign(state.completed, { interests: true })
  });

  clearDirty();
  window.location.href = "page3.jsp";
}
