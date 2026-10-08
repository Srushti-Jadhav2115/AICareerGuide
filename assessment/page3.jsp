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
<title>Rate Your Skills · Career Guidance Portal</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<link rel="stylesheet" href="css/assessment.css">
<link rel="stylesheet" href="css/responsive.css">
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

<div class="page-shell">
  <nav class="progress-rail" id="progressRail" aria-label="Assessment progress"></nav>

  <main class="main-col">
    <p class="progress-caption" id="progressCaption"></p>
    <div class="progress-track" id="progressTrack"></div>

    <div class="page-head">
      <span class="page-eyebrow">Step 3 of 4 · 12 skills · About 3 minutes</span>
      <h1 class="page-title">Rate Your Skills</h1>
      <p class="page-subtitle">Rate yourself honestly on a scale of 1 to 5. There are no right or wrong answers.</p>
    </div>

    <div class="q-meta-bar">
      <span class="q-progress-text" id="qProgressText">0 of 12 rated</span>
    </div>

    <form autocomplete="off" id="page3Form" novalidate>
      <div id="skillList"></div>

      <p class="form-error-banner" id="formErrorBanner"></p>

      <div class="step-actions">
        <button type="button" class="btn btn-secondary" id="prevBtn">Previous</button>
        <button type="submit" class="btn btn-primary" id="continueBtn">Continue</button>
      </div>
    </form>
  </main>
</div>

<script src="js/questions-data.js"></script>
<script src="js/assessment.js?v=3"></script>
<script src="js/page3.js"></script>
</body>
</html>
