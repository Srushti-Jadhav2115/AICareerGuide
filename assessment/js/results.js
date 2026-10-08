/**
 * results.js — fetches the stored AI recommendation for the logged-in user
 * from AssessmentResultServlet and renders the Top 3 career cards.
 *
 * The full assessment payload is never re-sent here — only a lightweight
 * GET keyed off the server-side session, so a page reload reuses the
 * already-generated (and already-validated) recommendation instead of
 * calling Gemini again.
 */

const RESULT_URL = "../AssessmentResultServlet";

// Holds the result already loaded from the server so the report can be downloaded
// without another request (and without ever touching Gemini again).
let reportData = null;

// Clears the temporary browser copy of the answers. Uses the shared helper from assessment.js
// when it is available, and falls back to removing the key directly so this page never
// depends on assessment.js having loaded (or on a stale cached copy of it).
function clearLocalAnswers() {
  try {
    if (typeof clearAssessmentState === "function") { clearAssessmentState(); return; }
  } catch (e) { /* fall through */ }
  try { localStorage.removeItem("careerAssessmentData"); } catch (e) { /* ignore */ }
}

document.addEventListener("DOMContentLoaded", () => {
  hydrateHeaderChip();
  loadResults();

  setupDownloadMenu();

  document.getElementById("retakeBtn").addEventListener("click", () => {
    // Starting a fresh assessment cycle: clear the local wizard state so
    // page1 doesn't restore stale answers, then begin at Step 1.
    clearLocalAnswers();
    window.location.href = "page1.jsp";
  });
});

// The temporary answers are cleared from the browser after a successful submit,
// so the header name now comes from the server (the logged-in user's own result).
function setHeaderChip(name) {
  if (!name) return;
  document.getElementById("userAvatar").textContent = name.charAt(0).toUpperCase();
  document.getElementById("userNameChip").textContent = name;
}

function hydrateHeaderChip() {
  /* Name is filled in by loadResults() once the server responds — keep "Guest" until then. */
}

function loadResults() {
  fetch(RESULT_URL, { method: "GET", headers: { "Accept": "application/json" }, cache: "no-store" })
    .then((res) =>
      res.text().then((text) => {
        let body = null;
        try { body = JSON.parse(text); } catch (e) { /* not JSON — handled below */ }
        return { res, body };
      })
    )
    .then(({ res, body }) => {
      try {
        if (body === null) {
          // The server answered, but not with JSON (usually an HTML error page).
          console.error("Results request returned a non-JSON reply. HTTP status:", res.status, res.url);
          showError("The server sent an unexpected reply (HTTP " + res.status + "). " +
                    "Please make sure the server and database are running, then try again.");
          return;
        }
        if (!res.ok || body.status === "error") {
          showError(body && body.message ? body.message : "Please try again in a moment.");
          return;
        }
        if (body.status === "not_found") {
          showError("We couldn't find a completed assessment for your account. Please take the assessment first.");
          return;
        }
        if (body.status === "pending") {
          // Submission exists but AI processing hasn't produced a valid
          // result yet (e.g. it failed validation) — ask the student to retry.
          showError("Your recommendations are still being prepared. Please try again shortly.");
          return;
        }
        // The assessment is stored with status = completed, so any temporary answers
        // still held in this browser are no longer needed — clear them.
        clearLocalAnswers();
        setHeaderChip(body.userName);
        reportData = { userName: body.userName || "", careers: body.careers || [] };
        renderCareers(body.careers || []);
      } catch (err) {
        console.error("Could not display the results:", err);
        showError("Your results loaded but couldn't be displayed (" + err.message + "). Please refresh the page.");
      }
    })
    .catch((err) => {
      console.error("Results request failed:", err);
      showError("We couldn't reach the server. Please check your connection and try again.");
    });
}

function showError(message) {
  document.getElementById("resultsLoading").style.display = "none";
  document.getElementById("resultsErrorBody").textContent = message;
  document.getElementById("resultsError").style.display = "flex";
}

function renderCareers(careers) {
  const loading = document.getElementById("resultsLoading");
  const content = document.getElementById("resultsContent");
  const container = document.getElementById("careerCards");
  const template = document.getElementById("careerCardTemplate");

  if (!Array.isArray(careers) || careers.length === 0) {
    showError("No recommendations were found for your latest assessment.");
    return;
  }

  const rankLabels = ["Top Match", "Strong Match", "Good Match"];

  careers.forEach((career, index) => {
    const node = template.content.cloneNode(true);
    const card = node.querySelector(".career-card");
    card.classList.add(`rank-${index + 1}`);

    node.querySelector(".rank-badge").textContent = `#${index + 1} ${rankLabels[index] || "Match"}`;
    const pct = clampPercentage(career.matchPercentage);
    node.querySelector(".match-percentage").textContent = pct !== null ? `${pct}% match` : "";
    node.querySelector(".match-bar-fill").style.width = pct !== null ? `${pct}%` : "0%";

    node.querySelector(".career-name").textContent = career.careerName || "Career";
    node.querySelector(".why-fits").textContent = career.whyFits || "";
    node.querySelector(".edu-path").textContent = career.educationalPath || "";

    const skillsList = node.querySelector(".skills-list");
    (career.skillsToDevelop || []).forEach((skill) => {
      const li = document.createElement("li");
      li.textContent = skill;
      skillsList.appendChild(li);
    });

    const roadmap = career.roadmap || {};
    node.querySelector(".roadmap-short").textContent = roadmap.shortTerm || "";
    node.querySelector(".roadmap-mid").textContent = roadmap.midTerm || "";
    node.querySelector(".roadmap-long").textContent = roadmap.longTerm || "";

    container.appendChild(node);
  });

  loading.style.display = "none";
  content.style.display = "block";
}

function clampPercentage(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return Math.max(0, Math.min(100, Math.round(num)));
}


/* ---------- Download report ---------- */

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildReportHtml(data) {
  const rankLabels = ["Top Match", "Strong Match", "Good Match"];
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  const cards = data.careers.map((c, i) => {
    const pct = clampPercentage(c.matchPercentage);
    const skills = (c.skillsToDevelop || []).map((s) => "<li>" + escapeHtml(s) + "</li>").join("");
    const r = c.roadmap || {};
    return '<section class="card">' +
      '<div class="head"><span class="badge">#' + (i + 1) + " " + escapeHtml(rankLabels[i] || "Match") + "</span>" +
      (pct !== null ? '<span class="pct">' + pct + "% match</span>" : "") + "</div>" +
      "<h2>" + escapeHtml(c.careerName || "Career") + "</h2>" +
      (pct !== null ? '<div class="bar"><div style="width:' + pct + '%"></div></div>' : "") +
      "<h3>Why this fits you</h3><p>" + escapeHtml(c.whyFits) + "</p>" +
      "<h3>Educational path</h3><p>" + escapeHtml(c.educationalPath) + "</p>" +
      "<h3>Skills to develop</h3><ul>" + skills + "</ul>" +
      "<h3>Your personalized roadmap</h3>" +
      '<div class="road">' +
      '<div><b>Next 6–12 months</b><p>' + escapeHtml(r.shortTerm) + "</p></div>" +
      '<div><b>1–3 years</b><p>' + escapeHtml(r.midTerm) + "</p></div>" +
      '<div><b>3–5 years</b><p>' + escapeHtml(r.longTerm) + "</p></div>" +
      "</div></section>";
  }).join("");

  return '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">' +
    "<title>NextHorizon – Career Assessment Report</title><style>" +
    "body{font-family:Segoe UI,Arial,sans-serif;color:#1f2433;background:#f4f5fa;margin:0;padding:32px 16px;line-height:1.55}" +
    ".wrap{max-width:860px;margin:0 auto}" +
    "header{border-bottom:3px solid #6c4ee0;padding-bottom:14px;margin-bottom:24px}" +
    "header h1{margin:0 0 4px;font-size:26px;color:#2b2f6b}header p{margin:0;color:#5a6075;font-size:14px}" +
    ".card{background:#fff;border:1px solid #dfe2ee;border-radius:12px;padding:22px 24px;margin-bottom:20px;page-break-inside:avoid}" +
    ".head{display:flex;justify-content:space-between;align-items:center}" +
    ".badge{background:#ece8fc;color:#4a33b5;font-weight:600;font-size:12px;padding:4px 10px;border-radius:999px}" +
    ".pct{font-weight:700;color:#4a33b5}" +
    ".card h2{margin:12px 0 8px;font-size:21px}.card h3{margin:16px 0 4px;font-size:14px;color:#4a33b5;text-transform:uppercase;letter-spacing:.04em}" +
    ".card p,.card li{font-size:14.5px;color:#3d4357;margin:0}.card ul{margin:0;padding-left:20px}" +
    ".bar{height:8px;background:#e6e8f2;border-radius:99px;overflow:hidden}.bar div{height:100%;background:linear-gradient(90deg,#6c4ee0,#e0529c)}" +
    ".road{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:6px}" +
    ".road div{background:#f6f7fb;border:1px solid #dfe2ee;border-radius:10px;padding:10px 12px}.road b{display:block;font-size:12px;color:#4a33b5;margin-bottom:4px}" +
    "footer{font-size:12px;color:#7a8095;text-align:center;margin-top:24px}" +
    "@media(max-width:640px){.road{grid-template-columns:1fr}}" +
    "@media print{body{background:#fff;padding:0}}" +
    "</style></head><body><div class=\"wrap\"><header><h1>Career Assessment Report</h1>" +
    "<p>" + (data.userName ? "Prepared for " + escapeHtml(data.userName) + " · " : "") + escapeHtml(dateStr) + " · NextHorizon</p></header>" +
    cards +
    "<footer>These recommendations are AI-generated guidance based on your assessment answers. Use them as a starting point alongside advice from teachers, mentors and counsellors.</footer>" +
    "</div></body></html>";
}

function showToast(message, isError) {
  const t = document.getElementById("dlToast");
  if (!t) return;
  t.textContent = message;
  t.classList.toggle("error", !!isError);
  t.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.remove("show"), 3200);
}

function hasReport() {
  return !!(reportData && reportData.careers && reportData.careers.length > 0);
}

function reportFileName(ext) {
  const safeName = ((reportData && reportData.userName) || "").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return "NextHorizon_Career_Report" + (safeName ? "_" + safeName : "") + "." + ext;
}

function setupDownloadMenu() {
  const btn = document.getElementById("downloadReportBtn");
  const menu = document.getElementById("downloadMenu");

  const closeMenu = () => { menu.hidden = true; btn.setAttribute("aria-expanded", "false"); };
  const openMenu = () => { menu.hidden = false; btn.setAttribute("aria-expanded", "true"); };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!hasReport()) { showToast("Your report is still loading — please try again in a moment.", true); return; }
    if (menu.hidden) openMenu(); else closeMenu();
  });
  document.addEventListener("click", (e) => { if (!menu.contains(e.target)) closeMenu(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  document.getElementById("dlHtmlBtn").addEventListener("click", () => { closeMenu(); downloadReportHtml(); });
  document.getElementById("dlPdfBtn").addEventListener("click", () => { closeMenu(); downloadReportPdf(); });
}

function downloadReportHtml() {
  if (!hasReport()) return;
  try {
    const blob = new Blob([buildReportHtml(reportData)], { type: "text/html;charset=utf-8" });
    if (window.navigator && typeof window.navigator.msSaveOrOpenBlob === "function") {
      window.navigator.msSaveOrOpenBlob(blob, reportFileName("html"));
    } else {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = reportFileName("html");
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    }
    showToast("Report downloaded — check your Downloads folder.");
  } catch (err) {
    console.error("Report download failed:", err);
    showToast("Download didn't start. Try “Save as PDF” instead.", true);
  }
}

function downloadReportPdf() {
  if (!hasReport()) return;
  try {
    // Print from a hidden frame (no pop-up, so pop-up blockers can't stop it).
    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
    document.body.appendChild(frame);
    const doc = frame.contentWindow.document;
    doc.open();
    doc.write(buildReportHtml(reportData));
    doc.close();
    // Name the PDF after the report (browsers use the document title as the default file name).
    doc.title = reportFileName("pdf").replace(/\.pdf$/, "");
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      showToast("Choose “Save as PDF” as the destination in the print window.");
      setTimeout(() => { if (frame.parentNode) frame.parentNode.removeChild(frame); }, 60000);
    }, 350);
  } catch (err) {
    console.error("PDF export failed:", err);
    showToast("Couldn't open the print dialog. Try the .html download instead.", true);
  }
}
