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
<title>CareerGuide · Career Assessment</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<style>
  .hero-section {
    position: relative;
    min-height: calc(100vh - 77px);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }
  .hero-bg {
    position: absolute;
    inset: 0;
    z-index: -2;
    background-image:
      linear-gradient(180deg, rgba(16, 26, 51, 0.82) 0%, rgba(16, 26, 51, 0.72) 45%, rgba(16, 26, 51, 0.88) 100%),
      url('https://img.magnific.com/free-photo/top-view-career-written-note-with-stickers-notepad-white-background-job-office-copybook-salary-college-business-color_179666-19734.jpg?semt=ais_hybrid&w=740&q=80');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  .hero-shell {
    position: relative;
    max-width: 720px;
    margin: 0 auto;
    padding: 12vh 24px;
    text-align: center;
    animation: fadeSlideUp 700ms cubic-bezier(0.16, 1, 0.3, 1) both;
  }
  .hero-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-mono);
    font-size: 12.5px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #fff;
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.25);
    padding: 6px 14px;
    border-radius: 999px;
  }
  .hero-title {
    font-size: clamp(32px, 5vw, 48px);
    margin: 20px 0;
    font-weight: 600;
    color: #fff;
  }
  .hero-title .accent {
    background: var(--grad-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .hero-sub {
    font-size: 16.5px;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.6;
    max-width: 46ch;
    margin: 0 auto 34px;
  }
  .hero-cta {
    box-shadow: 0 14px 34px -10px rgba(0, 0, 0, 0.5);
  }
  @media (max-width: 560px) {
    .hero-section { min-height: 82vh; }
    .hero-shell { padding: 8vh 20px; }
  }
</style>
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
            </div>
        </div>
    </nav>
<div class="cg-nav-spacer"></div>

<section class="hero-section">
  <div class="hero-bg"></div>
  <div class="hero-shell">
    <span class="hero-eyebrow">Four steps · About 12 minutes</span>
    <h1 class="hero-title">Find the career <span class="accent">direction</span> that actually fits you.</h1>
    <p class="hero-sub">
      Answer a short assessment about your education, interests, strengths and goals.
      Our AI reviews your complete profile and recommends career paths worth exploring —
      no keyword matching, no guesswork.
    </p>
    <a class="btn btn-primary hero-cta" href="page1.jsp">Start My Assessment</a>
  </div>
</section>

</body>
</html>
