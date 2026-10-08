<%@ page language="java" contentType="text/html; charset=UTF-8" %>
<%
    if (session.getAttribute("phone") == null) {
        response.sendRedirect("../login.jsp");
        return;
    }
%>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<%@ include file="owner-meta.jspf" %>
<title>Your Recommendations · Career Guidance Portal</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/assessment.css">
<link rel="stylesheet" href="css/responsive.css">
<link rel="stylesheet" href="css/results.css?v=2">
<link rel="stylesheet" href="../header.css">
</head>
<body>

<nav class="cg-navbar">
        <div class="cg-nav-container">
            <a class="cg-logo" href="../index.jsp">
                <img class="cg-logo-img" src="../images/nexthorizon-logo.png" alt="NextHorizon">
            </a>
            <div class="cg-nav-links">
                <a href="../index.jsp" class="cg-nav-link">Home</a>
                <a href="../assessment/index.jsp" class="cg-nav-link active">Career Assessment</a>
                <a href="../resume.html" class="cg-nav-link">Resume</a>
                <a href="../feedback.html" class="cg-nav-link">Feedback</a>
                <div class="header-right">
                    <div class="user-chip">
                        <span class="user-avatar" id="userAvatar">?</span>
                        <span id="userNameChip">Guest</span>
                    </div>
                    <a class="logout-link" href="../logout.jsp">Log out</a>
                </div>
            </div>
        </div>
    </nav>
<div class="cg-nav-spacer"></div>

<div class="results-shell">

  <!-- ---------- Loading state ---------- -->
  <div id="resultsLoading" class="results-state">
    <div class="spinner" aria-hidden="true"></div>
    <p>Loading your career recommendations…</p>
  </div>

  <!-- ---------- Error / not-found state ---------- -->
  <div id="resultsError" class="results-state" style="display:none;">
    <p class="results-error-title">We couldn't load your recommendations.</p>
    <p class="results-error-body" id="resultsErrorBody">Please try again in a moment.</p>
    <div class="results-actions" style="margin-top:20px;">
      <button type="button" class="btn btn-secondary" onclick="window.location.reload()">Try again</button>
      <a class="btn btn-primary" href="page1.jsp">Take the Assessment</a>
    </div>
  </div>

  <!-- ---------- Results content ---------- -->
  <div id="resultsContent" style="display:none;">
    <div class="results-head">
      <span class="page-eyebrow">Assessment complete</span>
      <h1 class="page-title">Your Career Recommendations</h1>
      <p class="page-subtitle">Based on your education, interests, strengths, skills and goals, these are your strongest career matches.</p>
    </div>

    <div id="careerCards" class="career-cards"></div>

    <div class="results-actions">
      <div class="dl-wrap">
        <button type="button" class="btn btn-secondary" id="downloadReportBtn" aria-haspopup="true" aria-expanded="false">⬇ Download Report</button>
        <div class="dl-menu" id="downloadMenu" role="menu" hidden>
          <button type="button" role="menuitem" id="dlPdfBtn"><strong>Save as PDF</strong><span>Opens your print dialog — choose “Save as PDF”</span></button>
          <button type="button" role="menuitem" id="dlHtmlBtn"><strong>Download as web page (.html)</strong><span>A file you can open in any browser</span></button>
        </div>
      </div>
      <button type="button" class="btn btn-secondary" id="retakeBtn">Retake Assessment</button>
      <a class="btn btn-secondary" href="explore.html">Explore Careers</a>
      <a class="btn btn-primary" href="../index.jsp">Back to Dashboard</a>
    </div>
  </div>

</div>

<div id="dlToast" class="dl-toast" role="status" aria-live="polite"></div>

<template id="careerCardTemplate">
  <div class="career-card">
    <div class="career-card-head">
      <span class="rank-badge"></span>
      <span class="match-percentage"></span>
    </div>
    <h2 class="career-name"></h2>
    <div class="match-bar"><div class="match-bar-fill"></div></div>

    <div class="career-section">
      <h3>Why this fits you</h3>
      <p class="why-fits"></p>
    </div>

    <div class="career-section">
      <h3>Educational path</h3>
      <p class="edu-path"></p>
    </div>

    <div class="career-section">
      <h3>Skills to develop</h3>
      <ul class="skills-list"></ul>
    </div>

    <div class="career-section roadmap-section">
      <h3>Your personalized roadmap</h3>
      <div class="roadmap">
        <div class="roadmap-stage">
          <span class="roadmap-period">Next 6–12 months</span>
          <p class="roadmap-short"></p>
        </div>
        <div class="roadmap-stage">
          <span class="roadmap-period">1–3 years</span>
          <p class="roadmap-mid"></p>
        </div>
        <div class="roadmap-stage">
          <span class="roadmap-period">3–5 years</span>
          <p class="roadmap-long"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="js/assessment.js?v=3"></script>
<script src="js/results.js?v=3"></script>
</body>
</html>
