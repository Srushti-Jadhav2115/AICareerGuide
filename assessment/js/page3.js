/**
 * page3.js — Rate Your Skills (common to all users)
 */

document.addEventListener("DOMContentLoaded", () => {
  const state = requireStepsBefore(["profile", "interests"]);
  renderProgress("selfAssessment");
  hydrateHeaderChip(state);

  renderSkills(window.SKILL_RATING_BANK, state.page3Ratings || {});
  updateProgressText();

  document.getElementById("prevBtn").addEventListener("click", () => {
    window.location.href = "page2.jsp";
  });

  document.getElementById("page3Form").addEventListener("submit", onSubmit);
});

function hydrateHeaderChip(state) {
  if (!state.profile) return;
  document.getElementById("userAvatar").textContent = state.profile.name.charAt(0).toUpperCase();
  document.getElementById("userNameChip").textContent = state.profile.name;
}

function renderSkills(skills, savedRatings) {
  const list = document.getElementById("skillList");
  list.innerHTML = "";
  const labels = window.RATING_LABELS;

  skills.forEach((skill) => {
    const card = el("div", "card rating-card");
    const text = el("p", "q-text", skill.text);
    card.appendChild(text);

    const scale = el("div", "rating-scale");
    for (let value = 1; value <= 5; value++) {
      const optId = `${skill.id}_r${value}`;
      const wrapper = el("div", "rating-option");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = skill.id;
      input.id = optId;
      input.value = String(value);
      if (savedRatings[skill.id] === value) input.checked = true;

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

    const scaleLabels = el("div", "rating-scale-labels", `<span>${labels[0]}</span><span>${labels[4]}</span>`);
    card.appendChild(scaleLabels);

    list.appendChild(card);
  });
}

function updateProgressText() {
  const total = window.SKILL_RATING_BANK.length;
  const rated = window.SKILL_RATING_BANK.filter(
    (s) => document.querySelector(`input[name="${s.id}"]:checked`)
  ).length;
  document.getElementById("qProgressText").textContent = `${rated} of ${total} rated`;
}

function onSubmit(e) {
  e.preventDefault();
  const banner = document.getElementById("formErrorBanner");
  hideErrorBanner(banner);

  const ratings = {};
  let allRated = true;

  window.SKILL_RATING_BANK.forEach((skill) => {
    const checked = document.querySelector(`input[name="${skill.id}"]:checked`);
    if (!checked) {
      allRated = false;
      return;
    }
    ratings[skill.id] = Number(checked.value);
  });

  if (!allRated) {
    showErrorBanner(banner, "Please rate all 12 skills before continuing.");
    return;
  }

  const state = getState();
  saveState({
    page3Ratings: ratings,
    completed: Object.assign(state.completed, { selfAssessment: true })
  });

  clearDirty();
  window.location.href = "page4.jsp";
}
