/**
 * page1.js — Education Journey + Basic Profile
 *
 * Drives the guided, card-based flow described in page1.html:
 *   educationLevel: After 10th / After 12th / Diploma
 *     After 10th  -> nextPath: school / diploma / unsure
 *       nextPath=diploma -> diplomaKnowledge: known / confused
 *         known    -> diplomaBranch (single)
 *         confused -> no branch picked yet; page2 shows the branch-discovery quiz
 *       nextPath=unsure  -> skips the assessment; routes to explore.html (placeholder,
 *                           static content to be added later)
 *     After 12th  -> stream -> (Science) group
 *     Diploma     -> diplomaStatus (studying/completed) + diplomaBranchExisting (single)
 *
 * The resulting profile is intentionally kept in the flat shape documented
 * in assessment.js so a future backend can consume it without translation.
 */

document.addEventListener("DOMContentLoaded", () => {
  renderProgress("profile");
  restoreExisting();
  wireConditionalReveals();

  document.getElementById("profileForm").addEventListener("submit", onSubmit);
});

/* ---------------------------------------------------------------
   Restore saved state (Back navigation / refresh)
   --------------------------------------------------------------- */

function restoreExisting() {
  const state = getState();
  const p = state.profile;

  document.getElementById("consentCheck").checked = !!state.consent;

  if (!p) return;

  setValue("fieldName", p.name);
  setValue("fieldAge", p.age);
  checkRadio("gender", p.gender);
  checkRadio("educationLevel", p.educationLevel);
  checkRadio("nextPath", p.nextPath);
  checkRadio("diplomaKnowledge", p.diplomaBranchKnowledge);
  checkRadio("diplomaBranch", p.diplomaBranch);
  checkRadio("stream", p.stream);
  checkRadio("group", p.group);
  checkRadio("diplomaStatus", p.diplomaStatus);
  checkRadio("diplomaBranchExisting", p.diplomaBranch);

  toggleConditionalBlocks();
}

function setValue(id, value) {
  if (value === undefined || value === null) return;
  document.getElementById(id).value = value;
}

function checkRadio(name, value) {
  if (!value) return;
  const input = document.querySelector(`input[name="${name}"][value="${CSS.escape(value)}"]`);
  if (input) input.checked = true;
}

/* ---------------------------------------------------------------
   Conditional reveals
   --------------------------------------------------------------- */

function wireConditionalReveals() {
  document.querySelectorAll(
    'input[name="educationLevel"], input[name="nextPath"], input[name="diplomaKnowledge"], input[name="stream"]'
  ).forEach((input) => {
    input.addEventListener("change", () => {
      markDirty();
      toggleConditionalBlocks();
    });
  });

  document.querySelectorAll(
    'input[name="gender"], input[name="group"], input[name="diplomaBranch"], ' +
    'input[name="diplomaStatus"], input[name="diplomaBranchExisting"], input[name="consent"], #fieldName, #fieldAge'
  ).forEach((input) => input && input.addEventListener("input", markDirty));
}

function toggleConditionalBlocks() {
  const educationLevel = getCheckedValue("educationLevel");
  const nextPath = getCheckedValue("nextPath");
  const diplomaKnowledge = getCheckedValue("diplomaKnowledge");
  const stream = getCheckedValue("stream");

  // After 10th -> what's next
  const showAfter10Next = educationLevel === "After 10th";
  toggleBlock("blockAfter10Next", showAfter10Next);
  if (!showAfter10Next) {
    clearRadioGroup("nextPath");
  }

  // After 10th -> Diploma -> do they know their branch?
  const showDiplomaKnowledge = showAfter10Next && nextPath === "diploma";
  toggleBlock("blockDiplomaKnowledge", showDiplomaKnowledge);
  if (!showDiplomaKnowledge) {
    clearRadioGroup("diplomaKnowledge");
  }

  const showBranchSingle = showDiplomaKnowledge && diplomaKnowledge === "known";
  toggleBlock("blockDiplomaBranchSingle", showBranchSingle);
  if (!showBranchSingle) clearRadioGroup("diplomaBranch");

  const showConfusedNote = showDiplomaKnowledge && diplomaKnowledge === "confused";
  toggleBlock("blockDiplomaConfusedNote", showConfusedNote);

  // After 12th -> stream (+ science group)
  const showStream = educationLevel === "After 12th";
  toggleBlock("blockStream", showStream);
  if (!showStream) {
    clearRadioGroup("stream");
    clearRadioGroup("group");
  }

  const showGroup = showStream && stream === "Science";
  toggleBlock("blockGroup", showGroup);
  if (!showGroup) clearRadioGroup("group");

  // Existing Diploma student
  const showDiplomaStatus = educationLevel === "Diploma";
  toggleBlock("blockDiplomaStatus", showDiplomaStatus);
  if (!showDiplomaStatus) {
    clearRadioGroup("diplomaStatus");
    clearRadioGroup("diplomaBranchExisting");
  }
}

function toggleBlock(id, show) {
  document.getElementById(id).classList.toggle("is-open", show);
}

function getCheckedValue(name) {
  const checked = document.querySelector(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function getCheckedValues(name) {
  return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map((i) => i.value);
}

function clearRadioGroup(name) {
  document.querySelectorAll(`input[name="${name}"]`).forEach((i) => (i.checked = false));
}

/* ---------------------------------------------------------------
   Submit
   --------------------------------------------------------------- */

function onSubmit(e) {
  e.preventDefault();
  const banner = document.getElementById("formErrorBanner");
  hideErrorBanner(banner);
  clearAllHints();

  const name = document.getElementById("fieldName").value.trim();
  const age = document.getElementById("fieldAge").value.trim();
  const gender = getCheckedValue("gender");
  const educationLevel = getCheckedValue("educationLevel");
  const nextPath = getCheckedValue("nextPath");
  const diplomaKnowledge = getCheckedValue("diplomaKnowledge");
  const diplomaBranchSingle = getCheckedValue("diplomaBranch");
  const stream = getCheckedValue("stream");
  const group = getCheckedValue("group");
  const diplomaStatus = getCheckedValue("diplomaStatus");
  const diplomaBranchExisting = getCheckedValue("diplomaBranchExisting");
  const consent = document.getElementById("consentCheck").checked;

  const errors = [];

  if (!name) errors.push(["hintName", "fieldName", "Please enter your name."]);

  const ageNum = Number(age);
  if (!age || Number.isNaN(ageNum) || ageNum < 10 || ageNum > 30) {
    errors.push(["hintAge", "fieldAge", "Please enter a valid age (10–30)."]);
  }
  if (!gender) errors.push(["hintGender", null, "Please select a gender option."]);
  if (!educationLevel) errors.push(["hintEducation", null, "Please select where you are in your education journey."]);

  if (educationLevel === "After 10th") {
    if (!nextPath) {
      errors.push(["hintNextPath", null, "Please tell us what you're planning to do after 10th."]);
    } else if (nextPath === "diploma") {
      if (!diplomaKnowledge) {
        errors.push(["hintDiplomaKnowledge", null, "Please tell us whether you've decided your Diploma branch."]);
      } else if (diplomaKnowledge === "known" && !diplomaBranchSingle) {
        errors.push(["hintDiplomaBranch", null, "Please select your Diploma branch."]);
      }
    }
  }

  if (educationLevel === "After 12th") {
    if (!stream) errors.push(["hintStream", null, "Please select your stream."]);
    if (stream === "Science" && !group) errors.push(["hintGroup", null, "Please select your science group."]);
  }

  if (educationLevel === "Diploma") {
    if (!diplomaStatus) errors.push(["hintDiplomaStatus", null, "Please select whether you're studying or have completed your Diploma."]);
    if (!diplomaBranchExisting) errors.push(["hintDiplomaExisting", null, "Please select your Diploma branch."]);
  }

  if (!consent) {
    errors.push(["hintConsent", null, "Please confirm you understand how your responses may be used before continuing."]);
  }

  if (errors.length) {
    errors.forEach(([hintId, fieldId, message]) => {
      const hint = document.getElementById(hintId);
      if (hint) {
        hint.textContent = message;
        hint.classList.add("error");
      }
      if (fieldId) document.getElementById(fieldId).classList.add("has-error");
    });
    showErrorBanner(banner, "Please answer all required fields before continuing.");
    return;
  }

  // The existing-Diploma-student branch and the "known branch" 10th->Diploma
  // path both resolve to the same diplomaBranch field for question-set lookup,
  // but they represent different diplomaStatus values (see assessment.js).
  // diplomaBranch is only ever populated for the paths that actually collect
  // one — "confused" (and "unsure"/"school") must NOT carry over a stale
  // branch value from an earlier choice in this session.
  const profile = {
    name,
    age: ageNum,
    gender,
    educationLevel,
    stream: stream || "",
    group: group || "",
    nextPath: nextPath || "",
    diplomaBranchKnowledge: diplomaKnowledge || "",
    diplomaStatus: educationLevel === "Diploma" ? diplomaStatus : (nextPath === "diploma" ? "planning" : ""),
    diplomaBranch: educationLevel === "Diploma"
      ? diplomaBranchExisting
      : (diplomaKnowledge === "known" ? diplomaBranchSingle : "")
  };

  const state = getState();
  saveState({
    profile,
    consent,
    completed: Object.assign(state.completed, { profile: true })
  });

  document.getElementById("userAvatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("userNameChip").textContent = name;

  clearDirty();

  // "I'm not sure yet" doesn't lead into the interest assessment — it routes
  // to a short placeholder page. (Full guided-exploration content is planned
  // as a separate static addition later.)
  if (educationLevel === "After 10th" && nextPath === "unsure") {
    window.location.href = "explore.html";
    return;
  }

  window.location.href = "page2.jsp";
}

function clearAllHints() {
  document.querySelectorAll(".field-hint").forEach((h) => {
    h.textContent = "";
    h.classList.remove("error");
  });
  document.querySelectorAll(".has-error").forEach((f) => f.classList.remove("has-error"));
}
