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
<title>Your Journey · Career Guidance Portal</title>
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
      <span class="page-eyebrow">Step 1 of 4</span>
      <h1 class="page-title">Let's understand your education journey</h1>
      <p class="page-subtitle">Tell us where you are right now. We'll ask questions based on the path you're considering. There are no right or wrong answers here.</p>
    </div>

    <form autocomplete="off" id="profileForm" novalidate>

      <!-- ---------------- About you ---------------- -->
      <div class="card">
        <h2 class="card-heading">A little about you</h2>

        <div class="field-group">
          <label class="field-label" for="fieldName">Full name</label>
          <input class="text-input" type="text" id="fieldName" name="name" placeholder="e.g. Aarav Sharma" autocomplete="off">
          <p class="field-hint" id="hintName"></p>
        </div>

        <div class="field-group">
          <label class="field-label" for="fieldAge">Age</label>
          <input class="text-input" type="number" id="fieldAge" name="age" placeholder="e.g. 16" min="10" max="30" inputmode="numeric">
          <p class="field-hint" id="hintAge"></p>
        </div>

        <div class="field-group" style="margin-bottom:0;">
          <span class="field-label">Gender</span>
          <div class="pill-group" id="genderGroup" role="radiogroup" aria-label="Gender">
            <div class="pill-option">
              <input type="radio" name="gender" id="genderMale" value="Male">
              <label for="genderMale">Male</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="gender" id="genderFemale" value="Female">
              <label for="genderFemale">Female</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="gender" id="genderOther" value="Other">
              <label for="genderOther">Other</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="gender" id="genderPrefer" value="Prefer not to say">
              <label for="genderPrefer">Prefer not to say</label>
            </div>
          </div>
          <p class="field-hint" id="hintGender"></p>
        </div>
      </div>

      <!-- ---------------- Education stage (Journey A/D/E entry) ---------------- -->
      <div class="card">
        <h2 class="card-heading">Where are you in your education journey?</h2>
        <p class="card-sub">We'll ask questions based on the path you're considering.</p>

        <div class="journey-card-grid" id="educationGroup" role="radiogroup" aria-label="Education level">
          <div class="journey-card-option">
            <input type="radio" name="educationLevel" id="eduAfter10" value="After 10th">
            <label for="eduAfter10">
              <span class="journey-emoji" aria-hidden="true">🎓</span>
              <span class="journey-title">Completed 10th</span>
              <span class="journey-sub">Choosing what to study next</span>
            </label>
          </div>
          <div class="journey-card-option">
            <input type="radio" name="educationLevel" id="eduAfter12" value="After 12th">
            <label for="eduAfter12">
              <span class="journey-emoji" aria-hidden="true">📚</span>
              <span class="journey-title">Completed 12th</span>
              <span class="journey-sub">Exploring higher education and career options</span>
            </label>
          </div>
          <div class="journey-card-option">
            <input type="radio" name="educationLevel" id="eduDiploma" value="Diploma">
            <label for="eduDiploma">
              <span class="journey-emoji" aria-hidden="true">💻</span>
              <span class="journey-title">Studying / Completed Diploma</span>
              <span class="journey-sub">Planning your next step after Diploma</span>
            </label>
          </div>
        </div>
        <p class="field-hint" id="hintEducation"></p>

        <!-- ===== Journey A: After 10th -> what's next ===== -->
        <div class="conditional-block" id="blockAfter10Next">
          <span class="field-label">What are you planning to do after 10th?</span>
          <div class="journey-card-grid journey-card-grid-3" id="nextPathGroup" role="radiogroup" aria-label="Plan after 10th">
            <div class="journey-card-option">
              <input type="radio" name="nextPath" id="nextSchool" value="school">
              <label for="nextSchool">
                <span class="journey-title">11th &amp; 12th</span>
                <span class="journey-sub">Continue school education before higher studies</span>
              </label>
            </div>
            <div class="journey-card-option">
              <input type="radio" name="nextPath" id="nextDiploma" value="diploma">
              <label for="nextDiploma">
                <span class="journey-title">Diploma</span>
                <span class="journey-sub">Start technical education after 10th</span>
              </label>
            </div>
            <div class="journey-card-option">
              <input type="radio" name="nextPath" id="nextUnsure" value="unsure">
              <label for="nextUnsure">
                <span class="journey-title">I'm not sure yet</span>
                <span class="journey-sub">Help me explore my options</span>
              </label>
            </div>
          </div>
          <p class="field-hint" id="hintNextPath"></p>

          <!-- ===== Journey B/C: 10th -> Diploma -> branch known? ===== -->
          <div class="conditional-block" id="blockDiplomaKnowledge">
            <span class="field-label" style="margin-top:20px; display:block;">Have you decided your Diploma branch?</span>
            <div class="journey-card-grid journey-card-grid-2" id="diplomaKnowledgeGroup" role="radiogroup" aria-label="Diploma branch knowledge">
              <div class="journey-card-option">
                <input type="radio" name="diplomaKnowledge" id="knowledgeKnown" value="known">
                <label for="knowledgeKnown">
                  <span class="journey-title">I know my branch</span>
                  <span class="journey-sub">I already have a branch in mind</span>
                </label>
              </div>
              <div class="journey-card-option">
                <input type="radio" name="diplomaKnowledge" id="knowledgeConfused" value="confused">
                <label for="knowledgeConfused">
                  <span class="journey-title">I'm confused</span>
                  <span class="journey-sub">Help me discover a suitable branch</span>
                </label>
              </div>
            </div>
            <p class="field-hint" id="hintDiplomaKnowledge"></p>

            <!-- Known branch -> single choice -->
            <div class="conditional-block" id="blockDiplomaBranchSingle">
              <span class="field-label" style="margin-top:20px; display:block;">Which Diploma branch?</span>
              <div class="pill-group" id="diplomaGroup" role="radiogroup" aria-label="Diploma branch">
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchComputer" value="Computer">
                  <label for="branchComputer">Computer Engineering</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchIT" value="Information Technology">
                  <label for="branchIT">Information Technology</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchMechanical" value="Mechanical">
                  <label for="branchMechanical">Mechanical Engineering</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchCivil" value="Civil">
                  <label for="branchCivil">Civil Engineering</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchElectrical" value="Electrical">
                  <label for="branchElectrical">Electrical Engineering</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchElectronics" value="Electronics">
                  <label for="branchElectronics">Electronics &amp; Telecommunication</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchAutomobile" value="Automobile">
                  <label for="branchAutomobile">Automobile Engineering</label>
                </div>
                <div class="pill-option">
                  <input type="radio" name="diplomaBranch" id="branchOther" value="Other">
                  <label for="branchOther">Other / Not sure</label>
                </div>
              </div>
              <p class="field-hint" id="hintDiplomaBranch"></p>
            </div>

            <!-- Confused -> info line only, no extra input -->
            <div class="conditional-block" id="blockDiplomaConfusedNote">
              <p class="info-note">No problem — you'll answer a short <strong>Find Your Diploma Branch</strong> questionnaire next, based on your interests and favorite subjects.</p>
            </div>
          </div>
        </div>

        <!-- ===== Journey D: After 12th -> Stream ===== -->
        <div class="conditional-block" id="blockStream">
          <span class="field-label">Stream</span>
          <div class="pill-group" id="streamGroup" role="radiogroup" aria-label="Stream">
            <div class="pill-option">
              <input type="radio" name="stream" id="streamScience" value="Science">
              <label for="streamScience">Science</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="stream" id="streamCommerce" value="Commerce">
              <label for="streamCommerce">Commerce</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="stream" id="streamArts" value="Arts">
              <label for="streamArts">Arts</label>
            </div>
          </div>
          <p class="field-hint" id="hintStream"></p>

          <!-- Science -> Group -->
          <div class="conditional-block" id="blockGroup">
            <span class="field-label" style="margin-top:20px; display:block;">Science group</span>
            <div class="pill-group" id="scienceGroupGroup" role="radiogroup" aria-label="Science group">
              <div class="pill-option">
                <input type="radio" name="group" id="groupPCM" value="PCM">
                <label for="groupPCM">PCM</label>
              </div>
              <div class="pill-option">
                <input type="radio" name="group" id="groupPCB" value="PCB">
                <label for="groupPCB">PCB</label>
              </div>
              <div class="pill-option">
                <input type="radio" name="group" id="groupPCMB" value="PCMB">
                <label for="groupPCMB">PCMB</label>
              </div>
            </div>
            <p class="field-hint" id="hintGroup"></p>
          </div>
        </div>

        <!-- ===== Journey E: Studying / Completed Diploma ===== -->
        <div class="conditional-block" id="blockDiplomaStatus">
          <span class="field-label">Where are you with your Diploma?</span>
          <div class="pill-group" id="diplomaStatusGroup" role="radiogroup" aria-label="Diploma status">
            <div class="pill-option">
              <input type="radio" name="diplomaStatus" id="statusStudying" value="studying">
              <label for="statusStudying">Currently studying</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaStatus" id="statusCompleted" value="completed">
              <label for="statusCompleted">Completed</label>
            </div>
          </div>
          <p class="field-hint" id="hintDiplomaStatus"></p>

          <span class="field-label" style="margin-top:20px; display:block;">Your Diploma branch</span>
          <div class="pill-group" id="diplomaExistingGroup" role="radiogroup" aria-label="Current diploma branch">
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existComputer" value="Computer">
              <label for="existComputer">Computer Engineering</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existIT" value="Information Technology">
              <label for="existIT">Information Technology</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existMechanical" value="Mechanical">
              <label for="existMechanical">Mechanical Engineering</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existCivil" value="Civil">
              <label for="existCivil">Civil Engineering</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existElectrical" value="Electrical">
              <label for="existElectrical">Electrical Engineering</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existElectronics" value="Electronics">
              <label for="existElectronics">Electronics &amp; Telecommunication</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existAutomobile" value="Automobile">
              <label for="existAutomobile">Automobile Engineering</label>
            </div>
            <div class="pill-option">
              <input type="radio" name="diplomaBranchExisting" id="existOther" value="Other">
              <label for="existOther">Other</label>
            </div>
          </div>
          <p class="field-hint" id="hintDiplomaExisting"></p>
        </div>
      </div>

      <!-- ---------------- Privacy notice + consent ---------------- -->
      <div class="card privacy-card">
        <p class="privacy-heading">🔒 Your privacy matters</p>
        <p class="privacy-body">
          Your assessment responses may be processed by AI to generate personalized career guidance.
          Please share only information relevant to your career interests. Never enter passwords,
          financial information, authentication codes, or other sensitive personal information.
        </p>
        <div class="consent-row">
          <input type="checkbox" id="consentCheck" name="consent">
          <label for="consentCheck">I understand that my responses may be processed by AI for career guidance.</label>
        </div>
        <p class="field-hint" id="hintConsent"></p>
      </div>

      <p class="form-error-banner" id="formErrorBanner"></p>

      <div class="step-actions single">
        <button type="submit" class="btn btn-primary" id="continueBtn">Continue</button>
      </div>
    </form>
  </main>
</div>

<script src="js/assessment.js?v=3"></script>
<script src="js/page1.js"></script>
</body>
</html>
